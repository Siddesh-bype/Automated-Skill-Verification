/**
 * Backend AI Service Client
 * Proxies requests to the Python AI verification microservice.
 * Falls back to mock analysis for hackathon demo when AI service is unavailable.
 */

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Generate a deterministic mock analysis based on GitHub URL
 * Used when the AI Flask service is not running (hackathon demo mode)
 */
function generateMockAnalysis(githubUrl, claimedSkill) {
    // Create a pseudo-random but deterministic seed from the URL
    let hash = 0;
    for (let i = 0; i < githubUrl.length; i++) {
        hash = ((hash << 5) - hash) + githubUrl.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    const codeQuality = 55 + (seed % 35);        // 55-89
    const complexity = 45 + ((seed >> 4) % 40);   // 45-84
    const bestPractices = 50 + ((seed >> 8) % 35); // 50-84
    const originality = 40 + ((seed >> 12) % 45);  // 40-84

    const overall = Math.round(
        codeQuality * 0.30 + complexity * 0.25 + bestPractices * 0.25 + originality * 0.20
    );

    const skillLevels = [
        { level: 'Expert', min: 90 },
        { level: 'Advanced', min: 75 },
        { level: 'Intermediate', min: 60 },
        { level: 'Beginner', min: 45 },
    ];
    const skillLevel = skillLevels.find(s => overall >= s.min)?.level || 'FAIL';

    const strengthsPool = [
        'Clean code structure and organization',
        'Good use of modern language features',
        'Proper error handling patterns',
        'Well-organized project structure',
        'Effective use of design patterns',
        'Comprehensive README documentation',
    ];
    const weaknessesPool = [
        'Could benefit from more unit tests',
        'Some functions could be further decomposed',
        'Consider adding type annotations',
        'Documentation could be more detailed',
        'Edge case handling could be improved',
    ];

    const strengths = [strengthsPool[seed % strengthsPool.length], strengthsPool[(seed + 3) % strengthsPool.length]];
    const weaknesses = [weaknessesPool[seed % weaknessesPool.length], weaknessesPool[(seed + 2) % weaknessesPool.length]];

    return {
        verified: overall >= 45,
        ai_score: overall,
        skill_level: skillLevel,
        analysis: {
            code_quality: codeQuality,
            complexity: complexity,
            best_practices: bestPractices,
            originality: originality,
            strengths,
            weaknesses,
        },
        recommendation: overall >= 45 ? 'ISSUE_CERTIFICATE' : 'REJECT',
        evidence_summary: `[Demo Mode] Analyzed ${claimedSkill} project from ${githubUrl}. The codebase demonstrates ${skillLevel.toLowerCase()}-level proficiency with an overall score of ${overall}/100.`,
    };
}

/**
 * Send a code submission to the AI verification service for analysis.
 * Falls back to mock analysis if the AI service is unreachable.
 */
async function verifyCode(githubUrl, claimedSkill) {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/verify-code`, {
            github_url: githubUrl,
            claimed_skill: claimedSkill,
            submission_type: 'code',
        }, { timeout: 60000 }); // 60s timeout for GPT-4 analysis

        return response.data;
    } catch (error) {
        console.warn(`AI service unavailable (${error.message}). Using mock analysis for demo.`);
        return generateMockAnalysis(githubUrl, claimedSkill);
    }
}

/**
 * Get available skills from the AI service
 */
async function getSkills() {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/api/skills`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        // Return default skills if AI service is down
        return [
            { name: 'React Development', category: 'Frontend', min_score: 45 },
            { name: 'Python Backend', category: 'Backend', min_score: 45 },
            { name: 'Machine Learning', category: 'AI/ML', min_score: 50 },
            { name: 'Full Stack Development', category: 'Full Stack', min_score: 45 },
            { name: 'Blockchain Development', category: 'Web3', min_score: 50 },
            { name: 'UI/UX Design', category: 'Design', min_score: 45 },
            { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', min_score: 50 },
            { name: 'Mobile Development', category: 'Mobile', min_score: 45 },
        ];
    }
}

module.exports = { verifyCode, getSkills };
