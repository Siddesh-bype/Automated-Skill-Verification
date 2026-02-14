/**
 * CertifyMe Backend API Server — v2.0
 * Orchestrates AI verification, plagiarism detection, oracle signing,
 * IPFS storage, blockchain interaction, and campus management.
 *
 * Backed by SQLite database for persistent storage.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ── Initialize database schema on startup ──
const { initializeSchema } = require('./db/schema');
initializeSchema();

// ── Route modules ──
const certificatesRouter = require('./routes/certificates');
const verificationRouter = require('./routes/verification');
const skillsRouter = require('./routes/skills');
const campusRouter = require('./routes/campus');
const portfolioRouter = require('./routes/portfolio');
const sharingRouter = require('./routes/sharing');

// ── Services (initialize singletons on import) ──
const algorandService = require('./services/algorand');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging (lightweight)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.path !== '/health') {
            console.log(`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// ── Health check with full service details ──
app.get('/health', async (req, res) => {
    const deploymentInfo = algorandService.getDeploymentInfo();

    res.json({
        status: 'ok',
        service: 'certifyme-backend',
        version: '2.0.0',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        config: {
            ai_service: process.env.AI_SERVICE_URL || 'http://localhost:5001',
            algorand_network: process.env.ALGOD_NETWORK || 'testnet',
            ipfs_configured: !!process.env.PINATA_JWT,
            database: 'sqlite (persistent)',
            oracle_configured: !!process.env.ORACLE_PRIVATE_KEY,
            contract_deployed: deploymentInfo.is_configured,
            app_id: deploymentInfo.app_id || null,
        },
        features: {
            ai_verification: true,
            plagiarism_detection: true,
            oracle_signing: true,
            campus_mode: true,
            blockchain_verification: true,
            multi_chain: true,
            portfolio_builder: true,
            batch_verification: true,
            revocation_feed: true,
            certificate_sharing: true,
            ipfs_storage: !!process.env.PINATA_JWT,
        },
    });
});

// ── Routes ──
app.use('/api/certificates', certificatesRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/campus', campusRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/share', sharingRouter);

// ── 404 handler ──
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} does not exist`,
        available_endpoints: [
            'GET  /health',
            'POST /api/certificates/submit-evidence',
            'POST /api/certificates/record-mint',
            'POST /api/certificates/revoke',
            'GET  /api/certificates',
            'GET  /api/certificates/stats',
            'GET  /api/certificates/verify/:assetId',
            'GET  /api/certificates/:id',
            'POST /api/verification/verify-code',
            'POST /api/verification/verify',
            'POST /api/verification/batch',
            'GET  /api/verification/chains',
            'GET  /api/verification/contract-status',
            'GET  /api/verification/tx/:txId',
            'GET  /api/skills',
            'POST /api/skills',
            'GET  /api/portfolio/:wallet',
            'POST /api/portfolio',
            'GET  /api/portfolio/public/:shareToken',
            'POST /api/share',
            'GET  /api/share/:token',
            'GET  /api/share/:token/verify',
            'GET  /api/certificates/revocations',
            'POST /api/campus/institutions',
            'GET  /api/campus/institutions',
            'POST /api/campus/cohorts',
            'GET  /api/campus/cohorts',
            'POST /api/campus/cohorts/:id/students',
            'GET  /api/campus/cohorts/:id/students',
            'POST /api/campus/batch-mint',
            'GET  /api/campus/jobs/:id',
            'GET  /api/campus/dashboard',
        ],
    });
});

// ── Error handler ──
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════════════════╗');
    console.log('  ║        🛡️  CertifyMe Backend API v2.0            ║');
    console.log(`  ║   Running on http://localhost:${PORT}                 ║`);
    console.log('  ║                                                   ║');
    console.log('  ║   Endpoints:                                      ║');
    console.log('  ║   ├─ /health              Health check            ║');
    console.log('  ║   ├─ /api/certificates     Certificate CRUD       ║');
    console.log('  ║   ├─ /api/verification     On-chain verification  ║');
    console.log('  ║   ├─ /api/skills           Skill registry         ║');
    console.log('  ║   └─ /api/campus           Campus Mode APIs       ║');
    console.log('  ║                                                   ║');
    console.log('  ║   Features:                                       ║');
    console.log('  ║   ✅ SQLite persistent database                   ║');
    console.log('  ║   ✅ AI skill verification                        ║');
    console.log('  ║   ✅ Plagiarism detection                         ║');
    console.log('  ║   ✅ Oracle cryptographic signing                  ║');
    console.log('  ║   ✅ Campus batch operations                      ║');
    console.log('  ║   ✅ Blockchain certificate verification          ║');
    console.log('  ╚═══════════════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
