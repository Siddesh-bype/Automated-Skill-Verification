/**
 * CertifyMe Backend API Server
 * Orchestrates AI verification, IPFS storage, and blockchain interaction.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const certificatesRouter = require('./routes/certificates');
const verificationRouter = require('./routes/verification');
const skillsRouter = require('./routes/skills');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check with service details
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'certifyme-backend',
        version: '1.0.0',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        config: {
            ai_service: process.env.AI_SERVICE_URL || 'http://localhost:5001',
            algorand_network: process.env.ALGOD_NETWORK || 'testnet',
            ipfs_configured: !!process.env.PINATA_JWT,
        },
    });
});

// Routes
app.use('/api/certificates', certificatesRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/skills', skillsRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════════╗');
    console.log('  ║        🛡️  CertifyMe Backend API          ║');
    console.log(`  ║   Running on http://localhost:${PORT}         ║`);
    console.log('  ║   Health:    /health                       ║');
    console.log('  ║   API:       /api/certificates             ║');
    console.log('  ║   Skills:    /api/skills                   ║');
    console.log('  ╚═══════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
