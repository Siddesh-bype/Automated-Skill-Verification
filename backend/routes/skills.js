/**
 * Skills Routes — v2.0
 * Returns available skills from the database.
 * Falls back to defaults if DB or AI service is unavailable.
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const aiService = require('../services/ai');

/**
 * GET /api/skills
 * List all available skills for verification
 */
router.get('/', async (req, res) => {
    try {
        // Try database first
        const skills = db.prepare(
            'SELECT skill_name as name, category, min_score, description FROM skills WHERE is_active = 1 ORDER BY category, skill_name'
        ).all();

        if (skills && skills.length > 0) {
            return res.json(skills);
        }

        // Fallback to AI service
        const aiSkills = await aiService.getSkills();
        res.json(aiSkills);

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

/**
 * POST /api/skills
 * Register a new skill (admin endpoint)
 */
router.post('/', (req, res) => {
    try {
        const { skill_name, category, min_score, description } = req.body;

        if (!skill_name) {
            return res.status(400).json({ error: 'skill_name is required' });
        }

        db.prepare(`
            INSERT OR REPLACE INTO skills (skill_name, category, min_score, description)
            VALUES (?, ?, ?, ?)
        `).run(skill_name, category || 'General', min_score || 45, description || '');

        res.json({
            success: true,
            message: `Skill "${skill_name}" registered`,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
