"""
CertifyMe AI Verification Service
Flask server exposing code verification endpoints.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from code_verifier import verify_code

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "certifyme-ai-verification"})


@app.route("/api/verify-code", methods=["POST"])
def verify_code_endpoint():
    """
    Verify a code submission against a claimed skill.

    Request body:
    {
        "github_url": "https://github.com/user/repo",
        "claimed_skill": "React Development",
        "submission_type": "code"
    }

    Returns verification result with AI score and detailed analysis.
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    github_url = data.get("github_url")
    claimed_skill = data.get("claimed_skill", "General Programming")

    if not github_url:
        return jsonify({"error": "github_url is required"}), 400

    # Validate URL format
    if "github.com" not in github_url:
        return jsonify({"error": "Please provide a valid GitHub URL"}), 400

    try:
        result = verify_code(github_url, claimed_skill)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": str(e),
            "verified": False,
            "ai_score": 0,
            "recommendation": "REJECT",
        }), 500


@app.route("/api/skills", methods=["GET"])
def get_available_skills():
    """Returns the list of skills available for verification"""
    skills = [
        {"name": "React Development", "category": "Frontend", "min_score": 45},
        {"name": "Python Backend", "category": "Backend", "min_score": 45},
        {"name": "Machine Learning", "category": "AI/ML", "min_score": 50},
        {"name": "UI/UX Design", "category": "Design", "min_score": 45},
        {"name": "Blockchain Development", "category": "Web3", "min_score": 50},
        {"name": "Full Stack Development", "category": "Full Stack", "min_score": 45},
        {"name": "Data Structures & Algorithms", "category": "CS Fundamentals", "min_score": 50},
        {"name": "Mobile Development", "category": "Mobile", "min_score": 45},
    ]
    return jsonify(skills)


if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
