/**
 * Sharing Routes — v1.0
 * Certificate sharing via tokenized links with expiry timeout.
 * Supports WhatsApp, Email, and direct link sharing.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');
const multichainService = require('../services/multichain');

/**
 * POST /api/share
 * Create a shareable link for a certificate with expiry
 * Body: { cert_id, shared_via, recipient, expires_in }
 * expires_in: '1h', '24h', '7d', '30d'
 */
router.post('/', (req, res) => {
    try {
        const { cert_id, shared_via, recipient, expires_in } = req.body;

        if (!cert_id) {
            return res.status(400).json({ error: 'cert_id is required' });
        }

        // Verify certificate exists
        const cert = db.prepare('SELECT * FROM submissions WHERE cert_id = ?').get(cert_id);
        if (!cert) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        // Calculate expiry
        const expiryMap = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };
        const expiryMs = expiryMap[expires_in] || expiryMap['24h'];
        const expiresAt = new Date(Date.now() + expiryMs).toISOString();

        // Generate unique share token
        const token = crypto.randomBytes(20).toString('hex');

        db.prepare(`
            INSERT INTO share_links (cert_id, token, shared_via, recipient, expires_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(cert_id, token, shared_via || 'link', recipient || null, expiresAt);

        // Build chain info
        const chainInfo = multichainService.getChainInfo(cert.chain_name || 'algorand');
        const explorerUrl = multichainService.getExplorerUrl(cert.chain_name, cert.txn_id);

        res.json({
            success: true,
            share_token: token,
            expires_at: expiresAt,
            share_url: `/api/share/${token}`,
            certificate_summary: {
                skill: cert.skill,
                student_name: cert.student_name,
                ai_score: cert.ai_score,
                chain: chainInfo.name,
                chain_icon: chainInfo.icon,
                txn_id: cert.txn_id,
                explorer_url: explorerUrl,
            },
        });
    } catch (error) {
        console.error('Share link creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/share/:token
 * Access a shared certificate (checks expiry)
 */
router.get('/:token', (req, res) => {
    try {
        const { token } = req.params;

        const link = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);

        if (!link) {
            return res.status(404).json({ error: 'Share link not found' });
        }

        // Check expiry
        if (new Date(link.expires_at) < new Date()) {
            return res.status(410).json({
                error: 'This certificate share link has expired',
                expired_at: link.expires_at,
                cert_id: link.cert_id,
            });
        }

        // Increment access count
        db.prepare('UPDATE share_links SET accessed_count = accessed_count + 1 WHERE token = ?').run(token);

        // Get certificate
        const cert = db.prepare('SELECT * FROM submissions WHERE cert_id = ?').get(link.cert_id);

        if (!cert) {
            return res.status(404).json({ error: 'Certificate no longer exists' });
        }

        const chainInfo = multichainService.getChainInfo(cert.chain_name || 'algorand');
        const explorerUrl = multichainService.getExplorerUrl(cert.chain_name, cert.txn_id);

        res.json({
            certificate: {
                cert_id: cert.cert_id,
                student_name: cert.student_name,
                skill: cert.skill,
                skill_level: cert.skill_level,
                ai_score: cert.ai_score,
                status: cert.status,
                issuer: cert.issuer,
                issue_date: cert.issue_date,
                asset_id: cert.asset_id,
                txn_id: cert.txn_id,
                ipfs_url: cert.ipfs_url,
                github_url: cert.github_url,
                evidence_url: cert.evidence_url,
            },
            blockchain: {
                chain: chainInfo.name,
                chain_icon: chainInfo.icon,
                chain_color: chainInfo.color,
                is_real_chain: chainInfo.isReal,
                explorer_url: explorerUrl,
            },
            share_info: {
                expires_at: link.expires_at,
                accessed_count: link.accessed_count + 1,
                shared_via: link.shared_via,
            },
        });
    } catch (error) {
        console.error('Share access error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/share/:token/verify
 * Blockchain verification of a shared certificate
 */
router.get('/:token/verify', async (req, res) => {
    try {
        const { token } = req.params;

        const link = db.prepare('SELECT * FROM share_links WHERE token = ?').get(token);
        if (!link) {
            return res.status(404).json({ error: 'Share link not found' });
        }

        if (new Date(link.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Share link expired' });
        }

        const cert = db.prepare('SELECT * FROM submissions WHERE cert_id = ?').get(link.cert_id);
        if (!cert) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const chainInfo = multichainService.getChainInfo(cert.chain_name || 'algorand');

        // For real chains (Algorand), attempt on-chain verification
        let onChainVerified = false;
        if (chainInfo.isReal && cert.asset_id) {
            try {
                const algorandService = require('../services/algorand');
                const assetInfo = await algorandService.getAssetInfo(cert.asset_id);
                onChainVerified = !!assetInfo;
            } catch { /* skip */ }
        }

        res.json({
            verified: cert.status === 'VERIFIED' || cert.status === 'MINTED',
            certificate_id: cert.cert_id,
            skill: cert.skill,
            ai_score: cert.ai_score,
            chain: chainInfo.name,
            on_chain_verified: onChainVerified,
            is_real_chain: chainInfo.isReal,
            explorer_url: multichainService.getExplorerUrl(cert.chain_name, cert.txn_id),
        });
    } catch (error) {
        console.error('Share verify error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
