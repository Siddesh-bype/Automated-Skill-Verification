/**
 * Portfolio Routes — v1.0
 * Student portfolio builder with shareable profiles.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');

/**
 * GET /api/portfolio/:wallet
 * Get a student's portfolio by wallet address
 */
router.get('/:wallet', (req, res) => {
    try {
        const { wallet } = req.params;

        // Get or create portfolio
        let portfolio = db.prepare('SELECT * FROM portfolios WHERE wallet_address = ?').get(wallet);

        if (!portfolio) {
            // Auto-create portfolio for wallet
            const shareToken = crypto.randomBytes(16).toString('hex');
            db.prepare(`
                INSERT INTO portfolios (wallet_address, display_name, share_token)
                VALUES (?, ?, ?)
            `).run(wallet, 'Anonymous Student', shareToken);
            portfolio = db.prepare('SELECT * FROM portfolios WHERE wallet_address = ?').get(wallet);
        }

        // Get all certificates for this wallet
        const certificates = db.prepare(`
            SELECT id, cert_id, skill, ai_score, status, asset_id, txn_id, chain_name,
                   issue_date, created_at, evidence_url, ipfs_url, github_url,
                   student_name, issuer, skill_level
            FROM submissions
            WHERE (wallet_address = ? OR student_name = ?)
              AND status IN ('VERIFIED', 'MINTED')
            ORDER BY created_at DESC
        `).all(wallet, wallet);

        res.json({
            portfolio,
            certificates,
            total_certificates: certificates.length,
            chains_used: [...new Set(certificates.map(c => c.chain_name || 'algorand'))],
        });
    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/portfolio
 * Create or update a portfolio
 */
router.post('/', (req, res) => {
    try {
        const { wallet_address, display_name, bio, avatar_url, github_url, linkedin_url, is_public } = req.body;

        if (!wallet_address) {
            return res.status(400).json({ error: 'wallet_address is required' });
        }

        const existing = db.prepare('SELECT * FROM portfolios WHERE wallet_address = ?').get(wallet_address);

        if (existing) {
            db.prepare(`
                UPDATE portfolios
                SET display_name = COALESCE(?, display_name),
                    bio = COALESCE(?, bio),
                    avatar_url = COALESCE(?, avatar_url),
                    github_url = COALESCE(?, github_url),
                    linkedin_url = COALESCE(?, linkedin_url),
                    is_public = COALESCE(?, is_public),
                    updated_at = datetime('now')
                WHERE wallet_address = ?
            `).run(display_name, bio, avatar_url, github_url, linkedin_url, is_public, wallet_address);
        } else {
            const shareToken = crypto.randomBytes(16).toString('hex');
            db.prepare(`
                INSERT INTO portfolios (wallet_address, display_name, bio, avatar_url, github_url, linkedin_url, is_public, share_token)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(wallet_address, display_name || 'Anonymous Student', bio, avatar_url, github_url, linkedin_url, is_public ?? 1, shareToken);
        }

        const portfolio = db.prepare('SELECT * FROM portfolios WHERE wallet_address = ?').get(wallet_address);
        res.json({ success: true, portfolio });
    } catch (error) {
        console.error('Portfolio update error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/portfolio/public/:shareToken
 * Public shareable portfolio view
 */
router.get('/public/:shareToken', (req, res) => {
    try {
        const { shareToken } = req.params;

        const portfolio = db.prepare('SELECT * FROM portfolios WHERE share_token = ? AND is_public = 1').get(shareToken);

        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found or is private' });
        }

        const certificates = db.prepare(`
            SELECT id, cert_id, skill, ai_score, status, asset_id, txn_id, chain_name,
                   issue_date, created_at, ipfs_url, student_name, issuer, skill_level
            FROM submissions
            WHERE (wallet_address = ? OR student_name = ?)
              AND status IN ('VERIFIED', 'MINTED')
            ORDER BY created_at DESC
        `).all(portfolio.wallet_address, portfolio.wallet_address);

        // Don't expose wallet address in public view
        const publicProfile = {
            display_name: portfolio.display_name,
            bio: portfolio.bio,
            avatar_url: portfolio.avatar_url,
            github_url: portfolio.github_url,
            linkedin_url: portfolio.linkedin_url,
        };

        res.json({
            portfolio: publicProfile,
            certificates,
            total_certificates: certificates.length,
        });
    } catch (error) {
        console.error('Public portfolio error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
