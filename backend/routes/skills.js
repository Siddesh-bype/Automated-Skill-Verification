/**
 * Skills Routes
 * Returns available skills and their verification criteria.
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');

/**
 * GET /api/skills
 * List all available skills for verification
 */
router.get('/', async (req, res) => {
    try {
        const skills = await aiService.getSkills();
        res.json(skills);
    } catch (error) {
        // Fallback defaults
        res.json([
            { name: 'React Development', category: 'Frontend', min_score: 45 },
            { name: 'Python Backend', category: 'Backend', min_score: 45 },
            { name: 'Machine Learning', category: 'AI/ML', min_score: 50 },
            { name: 'Full Stack Development', category: 'Full Stack', min_score: 45 },
            { name: 'Blockchain Development', category: 'Web3', min_score: 50 },
            { name: 'UI/UX Design', category: 'Design', min_score: 45 },
            { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', min_score: 50 },
            { name: 'Mobile Development', category: 'Mobile', min_score: 45 },
        ]);
    }
});

module.exports = router;
