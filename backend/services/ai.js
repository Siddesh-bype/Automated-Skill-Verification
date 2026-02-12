/**
 * Backend AI Service Client
 * Proxies requests to the Python AI verification microservice.
 */

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Send a code submission to the AI verification service for analysis
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
        if (error.response) {
            throw new Error(`AI service error: ${error.response.data.error || error.response.statusText}`);
        }
        throw new Error(`Cannot reach AI service at ${AI_SERVICE_URL}: ${error.message}`);
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
        ];
    }
}

module.exports = { verifyCode, getSkills };
