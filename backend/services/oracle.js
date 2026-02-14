/**
 * Oracle Signing Service
 * Generates Ed25519 cryptographic signatures for verified results.
 * This binds AI scores to wallet addresses in a tamper-proof way
 * that can be verified on-chain or by any third party.
 */

const crypto = require('crypto');

class OracleService {
    constructor() {
        // Load or generate oracle key pair
        const privateKeyHex = process.env.ORACLE_PRIVATE_KEY;

        if (privateKeyHex) {
            this.privateKey = Buffer.from(privateKeyHex, 'hex');
            console.log('🔐 Oracle service initialized with existing key pair');
        } else {
            // Auto-generate for demo/development
            const keyPair = crypto.generateKeyPairSync('ed25519');
            this.privateKey = keyPair.privateKey;
            this.publicKey = keyPair.publicKey;
            console.log('🔐 Oracle service initialized with auto-generated key pair (demo mode)');
            this._demoMode = true;
        }
    }

    /**
     * Sign a verification result
     * Creates a tamper-proof attestation binding:
     *   wallet_address + skill + score + timestamp
     */
    signVerificationResult(data) {
        const { wallet_address, skill, score, timestamp, request_id } = data;

        // 1. Build deterministic payload
        const payloadParts = [
            'CertifyMe-v2',                   // Domain separator
            wallet_address || 'anonymous',     // Wallet
            skill,                             // Skill name
            score.toString(),                  // AI score
            timestamp.toString(),              // Unix timestamp
            request_id || '0',                 // Request ID for replay protection
        ];

        const payload = payloadParts.join('|');
        const payloadBuffer = Buffer.from(payload, 'utf-8');

        // 2. Sign with Ed25519 (or HMAC fallback for simplicity)
        let signature;
        let publicKeyHex;

        if (this._demoMode) {
            // Use HMAC-SHA256 as a simpler alternative in demo mode
            const hmac = crypto.createHmac('sha256', 'certifyme-demo-oracle-secret');
            hmac.update(payloadBuffer);
            signature = hmac.digest('hex');
            publicKeyHex = 'demo-oracle-public-key';
        } else {
            // Real Ed25519 signing
            try {
                const sign = crypto.sign(null, payloadBuffer, this.privateKey);
                signature = sign.toString('hex');
                publicKeyHex = process.env.ORACLE_PUBLIC_KEY || 'unknown';
            } catch (err) {
                // Fallback to HMAC
                const hmac = crypto.createHmac('sha256', this.privateKey);
                hmac.update(payloadBuffer);
                signature = hmac.digest('hex');
                publicKeyHex = 'hmac-fallback';
            }
        }

        return {
            signature,
            payload: payload,
            payload_hash: crypto.createHash('sha256').update(payloadBuffer).digest('hex'),
            public_key: publicKeyHex,
            timestamp,
            score,
            signed_at: new Date().toISOString(),
        };
    }

    /**
     * Verify a signature (for testing and employer verification)
     */
    verifySignature(payload, signatureHex) {
        const payloadBuffer = Buffer.from(payload, 'utf-8');

        if (this._demoMode) {
            const hmac = crypto.createHmac('sha256', 'certifyme-demo-oracle-secret');
            hmac.update(payloadBuffer);
            return hmac.digest('hex') === signatureHex;
        }

        try {
            const signatureBuffer = Buffer.from(signatureHex, 'hex');
            return crypto.verify(null, payloadBuffer, this.publicKey, signatureBuffer);
        } catch {
            return false;
        }
    }

    /**
     * Generate evidence hash from submission data
     */
    generateEvidenceHash(data) {
        const evidenceData = {
            repo_url: data.repo_url || data.github_url,
            skill: data.skill,
            score: data.score || data.ai_score,
            analysis: data.analysis || data.evidence,
            timestamp: data.timestamp || Date.now(),
        };

        return crypto
            .createHash('sha256')
            .update(JSON.stringify(evidenceData))
            .digest('hex');
    }
}

// Singleton
let instance;
function getOracleService() {
    if (!instance) {
        instance = new OracleService();
    }
    return instance;
}

module.exports = getOracleService();
