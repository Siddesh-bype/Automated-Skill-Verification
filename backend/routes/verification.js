/**
 * Verification Routes — v2.0
 * Direct proxy to AI verification service + on-chain verification.
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const algorandService = require('../services/algorand');
const Submission = require('../db/models/Submission');

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

/**
 * POST /api/verification/verify
 * Verify a certificate for employers — by asset ID
 */
router.post('/verify', async (req, res) => {
    try {
        const { asset_id } = req.body;

        if (!asset_id) {
            return res.status(400).json({ error: 'asset_id is required' });
        }

        // Check database
        const cert = Submission.findByAssetId(parseInt(asset_id));

        // Check on-chain
        let onChainAsset = null;
        try {
            onChainAsset = await algorandService.getAssetInfo(parseInt(asset_id));
        } catch { /* skip */ }

        // Check contract box storage
        let contractVerification = null;
        if (cert && cert.id) {
            try {
                contractVerification = await algorandService.verifyCertificateOnChain(cert.id);
            } catch { /* skip */ }
        }

        res.json({
            valid: !!(cert && (cert.status === 'MINTED' || cert.status === 'VERIFIED')),
            certificate: cert || null,
            blockchain_confirmation: {
                exists_on_chain: !!onChainAsset,
                asset_info: onChainAsset ? {
                    creator: onChainAsset.params?.creator,
                    name: onChainAsset.params?.name,
                    url: onChainAsset.params?.url,
                } : null,
                contract_verified: contractVerification?.verified || false,
            },
        });

    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/verification/contract-status
 * Get the deployed smart contract status
 */
router.get('/contract-status', async (req, res) => {
    try {
        const deploymentInfo = algorandService.getDeploymentInfo();

        let contractState = null;
        if (deploymentInfo.is_configured) {
            contractState = await algorandService.getContractGlobalState();
        }

        res.json({
            deployment: deploymentInfo,
            contract_state: contractState,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/verification/tx/:txId
 * Verify a specific transaction exists on Algorand
 */
router.get('/tx/:txId', async (req, res) => {
    try {
        const txn = await algorandService.verifyTransaction(req.params.txId);

        res.json({
            exists: !!txn,
            transaction: txn || null,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
