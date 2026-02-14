"""
CertifyMe AI Code Verifier
Analyzes code submissions using OpenRouter (openai/gpt-oss-120b:free) to assign quality scores.
Falls back to deterministic mock analysis when no API key is configured.
"""

import os
import json
import hashlib
import requests

# ── OpenRouter Configuration ──
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b:free")

# Lazy client — only initialized when a valid API key exists
_openrouter_client = None
_api_key = os.getenv("OPENROUTER_API_KEY", "")

def _get_openai_client():
    """Returns an OpenAI-compatible client pointed at OpenRouter."""
    global _openrouter_client
    if _openrouter_client is None and _api_key and not _api_key.startswith("demo"):
        from openai import OpenAI
        _openrouter_client = OpenAI(
            api_key=_api_key,
            base_url=OPENROUTER_BASE_URL,
        )
    return _openrouter_client

# Skill level thresholds
SKILL_LEVELS = {
    "Expert": 90,
    "Advanced": 75,
    "Intermediate": 60,
    "Beginner": 45,
}


def get_skill_level(score: int) -> str:
    """Map a numeric score to a skill level string"""
    for level, threshold in SKILL_LEVELS.items():
        if score >= threshold:
            return level
    return "FAIL - Do not certify"


def fetch_github_repo_files(github_url: str) -> dict:
    """
    Fetch key source files from a public GitHub repo.
    Returns dict of {filename: content} for analysis.
    """
    # Extract owner/repo from URL
    parts = github_url.rstrip("/").split("/")
    if len(parts) < 2:
        raise ValueError(f"Invalid GitHub URL: {github_url}")

    owner = parts[-2]
    repo = parts[-1]

    # Use GitHub API to get repo tree
    api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"
    headers = {"Accept": "application/vnd.github.v3+json"}

    resp = requests.get(api_url, headers=headers, timeout=15)

    # Try 'master' branch if 'main' fails
    if resp.status_code != 200:
        api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1"
        resp = requests.get(api_url, headers=headers, timeout=15)

    if resp.status_code != 200:
        raise ValueError(f"Could not fetch repo tree (HTTP {resp.status_code})")

    tree = resp.json().get("tree", [])

    # Filter for source code files (limit to 10 most relevant)
    code_extensions = {".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".cpp", ".c", ".go", ".rs", ".html", ".css"}
    source_files = [
        item for item in tree
        if item["type"] == "blob"
        and any(item["path"].endswith(ext) for ext in code_extensions)
        and "node_modules" not in item["path"]
        and "dist" not in item["path"]
        and ".min." not in item["path"]
    ]

    # Take first 10 files to stay within token limits
    source_files = source_files[:10]

    files_content = {}
    for file_info in source_files:
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/{file_info['path']}"
        file_resp = requests.get(raw_url, timeout=10)
        if file_resp.status_code != 200:
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/master/{file_info['path']}"
            file_resp = requests.get(raw_url, timeout=10)
        if file_resp.status_code == 200:
            # Truncate large files to 3000 chars
            files_content[file_info["path"]] = file_resp.text[:3000]

    return files_content


def _generate_mock_analysis(github_url: str, claimed_skill: str, file_count: int) -> dict:
    """Generate a deterministic mock analysis based on URL hash — used when no OpenAI key."""
    h = int(hashlib.md5(github_url.encode()).hexdigest(), 16)

    code_quality = 55 + (h % 35)
    complexity = 45 + ((h >> 8) % 40)
    best_practices = 50 + ((h >> 16) % 35)
    originality = 40 + ((h >> 24) % 45)

    overall = round(code_quality * 0.30 + complexity * 0.25 + best_practices * 0.25 + originality * 0.20)
    skill_level = get_skill_level(overall)

    strengths_pool = [
        "Clean code structure and organization",
        "Good use of modern language features",
        "Proper error handling patterns",
        "Well-organized project structure",
        "Effective use of design patterns",
        "Comprehensive README documentation",
    ]
    weaknesses_pool = [
        "Could benefit from more unit tests",
        "Some functions could be further decomposed",
        "Consider adding type annotations",
        "Documentation could be more detailed",
        "Edge case handling could be improved",
    ]

    return {
        "verified": overall >= 45,
        "ai_score": overall,
        "skill_level": skill_level,
        "analysis": {
            "code_quality": code_quality,
            "complexity": complexity,
            "best_practices": best_practices,
            "originality": originality,
            "strengths": [strengths_pool[h % len(strengths_pool)], strengths_pool[(h + 3) % len(strengths_pool)]],
            "weaknesses": [weaknesses_pool[h % len(weaknesses_pool)], weaknesses_pool[(h + 2) % len(weaknesses_pool)]],
        },
        "recommendation": "ISSUE_CERTIFICATE" if overall >= 45 else "REJECT",
        "evidence_summary": f"[Demo Mode] Analyzed {file_count} files for {claimed_skill}. "
                           f"The codebase demonstrates {skill_level.lower()}-level proficiency "
                           f"with an overall score of {overall}/100.",
    }


def _validate_repo_authenticity(github_url: str) -> str | None:
    """
    Checks for anti-gaming:
    1. Repo must be at least 10 minutes old.
    2. Repo must have more than 3 commits.
    Returns error string if failed, None if pass.
    """
    try:
        parts = github_url.rstrip("/").split("/")
        if len(parts) < 2:
            return "Invalid URL"
        owner, repo = parts[-2], parts[-1]
        
        # 1. Check Repo Details (Age)
        api_url = f"https://api.github.com/repos/{owner}/{repo}"
        resp = requests.get(api_url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            created_at = data.get("created_at")
            if created_at:
                from datetime import datetime, timezone, timedelta
                # Parse 2024-02-14T10:00:00Z
                created_dt = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                now_dt = datetime.now(timezone.utc)
                if (now_dt - created_dt) < timedelta(minutes=10):
                    return "Repository is too new (created < 10 mins ago). Please submit an established project."

        # 2. Check Commit Count
        # Fetch last 5 commits
        commits_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=5"
        resp_commits = requests.get(commits_url, timeout=5)
        if resp_commits.status_code == 200:
            commits = resp_commits.json()
            if isinstance(commits, list) and len(commits) < 3:
                return "Repository has fewer than 3 commits. Please submit a project with more history."
                
    except Exception as e:
        print(f"Validation check failed: {e}")
        # Fail open if API fails, or fail closed? 
        # For hackathon demo, maybe warn but allow if API fails.
        pass
        
    return None


def verify_code(github_url: str, claimed_skill: str) -> dict:
    """
    Main verification function.
    Fetches code from GitHub, sends to GPT-4 for analysis,
    returns structured score and recommendation.
    Falls back to deterministic mock analysis when OpenAI is unavailable.
    """
    try:
        files = fetch_github_repo_files(github_url)
    except Exception as e:
        return {
            "verified": False,
            "ai_score": 0,
            "skill_level": "FAIL",
            "analysis": {"error": str(e)},
            "recommendation": "REJECT",
            "evidence_summary": f"Could not fetch repository: {e}",
        }

    if not files:
        return {
            "verified": False,
            "ai_score": 0,
            "skill_level": "FAIL",
            "analysis": {"error": "No source files found in repository"},
            "recommendation": "REJECT",
            "evidence_summary": "Repository contains no analyzable source files",
        }

    # Check if OpenRouter client is available
    client = _get_openai_client()
    if client is None:
        print(f"[DEMO MODE] No OPENROUTER_API_KEY — returning mock analysis for {github_url}")
        return _generate_mock_analysis(github_url, claimed_skill, len(files))

    # Anti-Gaming: Validate repo authenticity before wasting AI tokens
    try:
        validation_error = _validate_repo_authenticity(github_url)
        if validation_error:
            return {
                "verified": False,
                "ai_score": 0,
                "skill_level": "FAIL",
                "analysis": {"error": f"Security Check Failed: {validation_error}"},
                "recommendation": "REJECT",
                "evidence_summary": f"Submission rejected by Security Engine: {validation_error}",
            }
    except Exception as e:
        print(f"Warning: Repo validation failed, proceeding anyway: {e}")

    # Build code summary for GPT-4
    code_summary = ""
    for path, content in files.items():
        code_summary += f"\n--- FILE: {path} ---\n{content}\n"

    # GPT-4 structured analysis prompt
    analysis_prompt = f"""You are an expert code reviewer evaluating a developer's skill level.

The developer claims proficiency in: {claimed_skill}
Repository: {github_url}

Analyze the provided source code files. You MUST reference specific filenames and line numbers in your evidence.

Respond with a JSON object with these exact keys:

{{
  "code_quality": <score 0-100>,
  "complexity": <score 0-100>,
  "best_practices": <score 0-100>,
  "originality": <score 0-100>,
  "overall_score": <weighted average>,
  "evidence_summary": "<2-3 sentence summary. MUST quote at least one specific file and coding pattern found. e.g. 'Excellent use of useEffect in src/App.tsx line 45.'>",
  "strengths": ["<strength 1 (cite file)>", "<strength 2 (cite file)>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}}

Scoring guidelines:
- code_quality: Clean syntax, proper naming
- complexity: Algorithms, architecture
- best_practices: Error handling, comments
- originality: Detect if this is a generic tutorial clone

CODE FILES:
{code_summary}

Respond ONLY with valid JSON."""

    try:
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": "You are a code quality analyzer. Respond only with valid JSON."},
                {"role": "user", "content": analysis_prompt},
            ],
            temperature=0.3,
            max_tokens=800,
            extra_headers={
                "HTTP-Referer": "https://certifyme.app",
                "X-Title": "CertifyMe AI Verification",
            },
        )

        result_text = response.choices[0].message.content.strip()

        # Parse JSON from response (handle markdown code blocks)
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

        analysis = json.loads(result_text)

        overall = int(analysis.get("overall_score", 0))
        skill_level = get_skill_level(overall)

        return {
            "verified": overall >= 45,
            "ai_score": overall,
            "skill_level": skill_level,
            "analysis": {
                "code_quality": analysis.get("code_quality", 0),
                "complexity": analysis.get("complexity", 0),
                "best_practices": analysis.get("best_practices", 0),
                "originality": analysis.get("originality", 0),
                "strengths": analysis.get("strengths", []),
                "weaknesses": analysis.get("weaknesses", []),
            },
            "recommendation": "ISSUE_CERTIFICATE" if overall >= 45 else "REJECT",
            "evidence_summary": analysis.get("evidence_summary", "Analysis complete"),
        }

    except json.JSONDecodeError:
        return {
            "verified": False,
            "ai_score": 0,
            "skill_level": "FAIL",
            "analysis": {"error": "Failed to parse AI response"},
            "recommendation": "REJECT",
            "evidence_summary": "AI analysis encountered an error",
        }
    except Exception as e:
        return {
            "verified": False,
            "ai_score": 0,
            "skill_level": "FAIL",
            "analysis": {"error": str(e)},
            "recommendation": "REJECT",
            "evidence_summary": f"AI analysis error: {e}",
        }
