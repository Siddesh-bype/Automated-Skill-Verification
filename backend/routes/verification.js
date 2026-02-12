/**
 * Verification Routes
 * Direct proxy to AI verification service for frontend use.
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');

/**
 * POST /api/verification/verify-code
 * Direct pass-through to AI service for code verification
 */
router.post('/verify-code', async (req, res) => {
    try {
        const { github_url, claimed_skill } = req.body;

        if (!github_url) {
            return res.status(400).json({ error: 'github_url is required' });
        }

        const result = await aiService.verifyCode(
            github_url,
            claimed_skill || 'General Programming'
        );

        res.json(result);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
