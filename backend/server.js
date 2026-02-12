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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'certifyme-backend' });
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
    console.log(`CertifyMe Backend running on http://localhost:${PORT}`);
});

module.exports = app;
