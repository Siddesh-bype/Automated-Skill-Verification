"""
CertifyMe AI Code Verifier
Analyzes code submissions using OpenAI GPT-4 to assign quality scores.
"""

import os
import json
import requests
from openai import OpenAI

# Initialize OpenAI client — reads OPENAI_API_KEY from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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


def verify_code(github_url: str, claimed_skill: str) -> dict:
    """
    Main verification function.
    Fetches code from GitHub, sends to GPT-4 for analysis,
    returns structured score and recommendation.
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

    # Build code summary for GPT-4
    code_summary = ""
    for path, content in files.items():
        code_summary += f"\n--- FILE: {path} ---\n{content}\n"

    # GPT-4 structured analysis prompt
    analysis_prompt = f"""You are an expert code reviewer evaluating a developer's skill level.

The developer claims proficiency in: {claimed_skill}
Repository: {github_url}

Analyze the following source code files and provide a JSON response with these exact keys:

{{
  "code_quality": <score 0-100>,
  "complexity": <score 0-100>,
  "best_practices": <score 0-100>,  
  "originality": <score 0-100>,
  "overall_score": <weighted average: quality 30%, complexity 25%, practices 25%, originality 20%>,
  "evidence_summary": "<2-3 sentence summary of what the code demonstrates>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
}}

Scoring guidelines:
- code_quality: Clean syntax, proper naming, consistent formatting, no dead code
- complexity: Sophistication of algorithms, data structures, architecture used
- best_practices: Error handling, comments, modular design, testing
- originality: Not a common tutorial clone, shows independent thinking

CODE FILES:
{code_summary}

Respond ONLY with valid JSON, no other text."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a code quality analyzer. Respond only with valid JSON."},
                {"role": "user", "content": analysis_prompt},
            ],
            temperature=0.3,
            max_tokens=800,
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
