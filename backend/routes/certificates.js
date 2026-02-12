/**
 * Certificate Routes
 * Handles evidence submission, certificate lookup, and public verification.
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const aiService = require('../services/ai');
const ipfsService = require('../services/ipfs');
const algorandService = require('../services/algorand');

// In-memory store for hackathon demo (replaces PostgreSQL)
const certificateStore = new Map();

/**
 * POST /api/certificates/submit-evidence
 * Student submits evidence for AI verification.
 * Flow: receive evidence → call AI → store result → return verdict
 */
router.post('/submit-evidence', async (req, res) => {
    try {
        const { github_url, claimed_skill, student_name, description, issuer } = req.body;

        if (!github_url || !claimed_skill) {
            return res.status(400).json({ error: 'github_url and claimed_skill are required' });
        }

        // Step 1: Call AI verification service
        const aiResult = await aiService.verifyCode(github_url, claimed_skill);

        // Step 2: Upload evidence metadata to IPFS
        let evidenceIpfs = null;
        try {
            evidenceIpfs = await ipfsService.pinJSONToIPFS({
                github_url,
                claimed_skill,
                student_name: student_name || 'Anonymous',
                description: description || '',
                ai_analysis: aiResult,
                submitted_at: new Date().toISOString(),
            });
        } catch (ipfsErr) {
            console.warn('IPFS upload skipped (no JWT configured):', ipfsErr.message);
        }

        // Step 3: Build certificate record
        const certId = uuidv4();
        const certRecord = {
            id: certId,
            student_name: student_name || 'Anonymous',
            skill: claimed_skill,
            skill_level: aiResult.skill_level,
            ai_score: aiResult.ai_score,
            github_url,
            description: description || '',
            issuer: issuer || 'CertifyMe Platform',
            evidence_hash: evidenceIpfs ? evidenceIpfs.IpfsHash : null,
            evidence_url: evidenceIpfs ? ipfsService.ipfsUrl(evidenceIpfs.IpfsHash) : null,
            analysis: aiResult.analysis,
            evidence_summary: aiResult.evidence_summary,
            recommendation: aiResult.recommendation,
            verified: aiResult.verified,
            blockchain_asset_id: null, // Set after minting
            blockchain_tx_id: null,
            issue_date: new Date().toISOString(),
            status: aiResult.verified ? 'VERIFIED' : 'REJECTED',
        };

        certificateStore.set(certId, certRecord);

        res.json(certRecord);
    } catch (error) {
        console.error('Submit evidence error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/certificates/record-mint
 * After frontend mints NFT on-chain, record the asset ID
 */
router.post('/record-mint', (req, res) => {
    const { cert_id, asset_id, tx_id } = req.body;

    if (!cert_id) {
        return res.status(400).json({ error: 'cert_id is required' });
    }

    const cert = certificateStore.get(cert_id);
    if (!cert) {
        return res.status(404).json({ error: 'Certificate not found' });
    }

    cert.blockchain_asset_id = asset_id || null;
    cert.blockchain_tx_id = tx_id || null;
    cert.status = 'MINTED';
    certificateStore.set(cert_id, cert);

    res.json(cert);
});

/**
 * GET /api/certificates/:id
 * Fetch certificate details by internal ID
 */
router.get('/:id', (req, res) => {
    const cert = certificateStore.get(req.params.id);
    if (!cert) {
        return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(cert);
});

/**
 * GET /api/certificates
 * List all certificates (for dashboard demo)
 */
router.get('/', (req, res) => {
    const { wallet, status } = req.query;
    let certs = Array.from(certificateStore.values());

    if (status) {
        certs = certs.filter(c => c.status === status.toUpperCase());
    }

    // Sort by issue date descending
    certs.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));

    res.json(certs);
});

/**
 * GET /api/certificates/verify/:assetId
 * Public verification endpoint — employer scans QR code
 */
router.get('/verify/:assetId', async (req, res) => {
    const assetId = parseInt(req.params.assetId);

    // Find certificate by blockchain asset ID
    const cert = Array.from(certificateStore.values()).find(
        c => c.blockchain_asset_id === assetId
    );

    if (!cert) {
        return res.status(404).json({
            verified: false,
            error: 'No certificate found for this asset ID',
        });
    }

    // Optionally verify on-chain
    let onChainAsset = null;
    try {
        onChainAsset = await algorandService.getAssetInfo(assetId);
    } catch (e) {
        console.warn('Could not fetch on-chain data:', e.message);
    }

    res.json({
        verified: cert.status === 'MINTED',
        certificate: cert,
        blockchain_proof: onChainAsset ? {
            asset_id: assetId,
            on_chain: true,
            creator: onChainAsset.params?.creator,
            name: onChainAsset.params?.name,
            url: onChainAsset.params?.url,
        } : {
            asset_id: assetId,
            on_chain: false,
        },
    });
});

module.exports = router;
