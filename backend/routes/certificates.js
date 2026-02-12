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

// ── Seed demo certificates so the dashboard is never empty ──
const seedDemoData = () => {
    const demoRecords = [
        {
            id: uuidv4(),
            student_name: 'Siddesh Bype',
            skill: 'React Development',
            skill_level: 'Advanced',
            ai_score: 78,
            github_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
            description: 'Full-stack blockchain credential platform built with React + Algorand',
            issuer: 'CertifyMe Platform',
            evidence_hash: null,
            evidence_url: null,
            analysis: {
                code_quality: 82,
                complexity: 74,
                best_practices: 80,
                originality: 75,
                strengths: ['Clean component architecture', 'Good use of TypeScript generics'],
                weaknesses: ['Could add more unit tests', 'Some components too large'],
            },
            evidence_summary: 'The codebase demonstrates advanced React skills with TypeScript, custom hooks, and proper state management patterns.',
            recommendation: 'ISSUE_CERTIFICATE',
            verified: true,
            blockchain_asset_id: null,
            blockchain_tx_id: null,
            issue_date: new Date(Date.now() - 86400000).toISOString(), // yesterday
            status: 'VERIFIED',
        },
        {
            id: uuidv4(),
            student_name: 'Siddesh Bype',
            skill: 'Python Backend',
            skill_level: 'Intermediate',
            ai_score: 65,
            github_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
            description: 'Flask AI verification micro-service for code analysis',
            issuer: 'CertifyMe Platform',
            evidence_hash: null,
            evidence_url: null,
            analysis: {
                code_quality: 70,
                complexity: 55,
                best_practices: 68,
                originality: 62,
                strengths: ['Well-structured API endpoints', 'Good error handling with fallbacks'],
                weaknesses: ['No database layer', 'Missing request validation'],
            },
            evidence_summary: 'Flask API service with OpenRouter LLM integration. Shows solid Python backend skills with proper REST design.',
            recommendation: 'ISSUE_CERTIFICATE',
            verified: true,
            blockchain_asset_id: null,
            blockchain_tx_id: null,
            issue_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'VERIFIED',
        },
        {
            id: uuidv4(),
            student_name: 'Siddesh Bype',
            skill: 'Blockchain Development',
            skill_level: 'Advanced',
            ai_score: 82,
            github_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
            description: 'ARC-4 smart contract with box storage for certificate management',
            issuer: 'CertifyMe Platform',
            evidence_hash: null,
            evidence_url: null,
            analysis: {
                code_quality: 85,
                complexity: 80,
                best_practices: 78,
                originality: 84,
                strengths: ['ARC-4 compliance', 'Efficient box storage design', 'Proper access controls'],
                weaknesses: ['Edge case testing could be stronger'],
            },
            evidence_summary: 'AlgoPy smart contract using ARC-4 with box storage, skill registry, and admin controls. Shows expert-level Algorand development.',
            recommendation: 'ISSUE_CERTIFICATE',
            verified: true,
            blockchain_asset_id: 12345678,
            blockchain_tx_id: 'DEMO-TX-ABC123XYZ',
            issue_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            status: 'MINTED',
        },
    ];

    demoRecords.forEach(r => certificateStore.set(r.id, r));
    console.log(`Seeded ${demoRecords.length} demo certificates`);
};

seedDemoData();

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
 * GET /api/certificates/verify/:assetId
 * PUBLIC verification endpoint — employer scans QR code or enters asset ID.
 * ⚠️ MUST be defined BEFORE /:id to avoid route shadowing!
 */
router.get('/verify/:assetId', async (req, res) => {
    const assetId = parseInt(req.params.assetId);

    if (isNaN(assetId)) {
        return res.status(400).json({ verified: false, error: 'Invalid asset ID' });
    }

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

/**
 * GET /api/certificates/stats
 * Aggregate statistics for the landing page
 */
router.get('/stats', (req, res) => {
    const certs = Array.from(certificateStore.values());
    const verified = certs.filter(c => c.status !== 'REJECTED');
    const minted = certs.filter(c => c.status === 'MINTED');
    const avgScore = verified.length > 0
        ? Math.round(verified.reduce((sum, c) => sum + c.ai_score, 0) / verified.length)
        : 0;

    const skillCounts = {};
    verified.forEach(c => {
        skillCounts[c.skill] = (skillCounts[c.skill] || 0) + 1;
    });

    res.json({
        total_certificates: certs.length,
        total_verified: verified.length,
        total_minted: minted.length,
        total_rejected: certs.length - verified.length,
        average_score: avgScore,
        top_skills: Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, count]) => ({ skill, count })),
    });
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

module.exports = router;
