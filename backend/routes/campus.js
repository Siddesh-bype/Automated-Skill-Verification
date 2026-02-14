/**
 * Campus Mode Routes — SQLite-backed
 * Institutional batch operations for universities and coding bootcamps.
 * Features: institution registration, cohort management, batch minting, encrypted student data.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/connection');
const Submission = require('../db/models/Submission');
const oracleService = require('../services/oracle');

// ── Middleware: Authenticate institution by API key ──
function authenticateInstitution(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required. Pass via x-api-key header.' });
    }

    const institution = db.prepare(
        'SELECT * FROM institutions WHERE api_key = ?'
    ).get(apiKey);

    if (!institution) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    req.institution = institution;
    next();
}

/**
 * POST /api/campus/institutions
 * Create new institution
 */
router.post('/institutions', (req, res) => {
    try {
        const { name, admin_wallet } = req.body;

        if (!name || !admin_wallet) {
            return res.status(400).json({ error: 'name and admin_wallet are required' });
        }

        // Generate API key and encryption key
        const api_key = crypto.randomBytes(32).toString('hex');
        const encryption_key = crypto.randomBytes(32).toString('hex');

        const result = db.prepare(`
            INSERT INTO institutions (name, admin_wallet, api_key, encryption_key)
            VALUES (?, ?, ?, ?)
        `).run(name, admin_wallet, api_key, encryption_key);

        const institution = db.prepare(
            'SELECT id, name, admin_wallet, api_key FROM institutions WHERE id = ?'
        ).get(result.lastInsertRowid);

        res.json({
            institution,
            message: '⚠️ Save this API key — it will not be shown again',
            encryption_key,
        });

    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Institution with this wallet already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/campus/institutions
 * List institutions (for authenticated institution only — returns own data)
 */
router.get('/institutions', authenticateInstitution, (req, res) => {
    res.json({
        id: req.institution.id,
        name: req.institution.name,
        admin_wallet: req.institution.admin_wallet,
        created_at: req.institution.created_at,
    });
});

/**
 * POST /api/campus/cohorts
 * Create a student cohort
 */
router.post('/cohorts', authenticateInstitution, (req, res) => {
    try {
        const { name, description, start_date, end_date } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Cohort name is required' });
        }

        const result = db.prepare(`
            INSERT INTO cohorts (institution_id, name, description, start_date, end_date)
            VALUES (?, ?, ?, ?, ?)
        `).run(req.institution.id, name, description || null, start_date || null, end_date || null);

        const cohort = db.prepare('SELECT * FROM cohorts WHERE id = ?').get(result.lastInsertRowid);

        res.json(cohort);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/campus/cohorts
 * List cohorts for authenticated institution
 */
router.get('/cohorts', authenticateInstitution, (req, res) => {
    const cohorts = db.prepare(
        'SELECT * FROM cohorts WHERE institution_id = ? ORDER BY created_at DESC'
    ).all(req.institution.id);

    // Attach student count
    const enriched = cohorts.map(cohort => {
        const studentCount = db.prepare(
            'SELECT COUNT(*) as count FROM students WHERE cohort_id = ?'
        ).get(cohort.id).count;

        return { ...cohort, student_count: studentCount };
    });

    res.json(enriched);
});

/**
 * POST /api/campus/cohorts/:id/students
 * Batch enroll students with encrypted metadata
 */
router.post('/cohorts/:id/students', authenticateInstitution, (req, res) => {
    try {
        const cohortId = parseInt(req.params.id);
        const { students } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: 'students array is required' });
        }

        // Verify cohort belongs to institution
        const cohort = db.prepare(
            'SELECT * FROM cohorts WHERE id = ? AND institution_id = ?'
        ).get(cohortId, req.institution.id);

        if (!cohort) {
            return res.status(403).json({ error: 'Cohort not found or unauthorized' });
        }

        const insertedStudents = [];

        const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO students (cohort_id, wallet_address, github_username, email, encrypted_metadata)
            VALUES (?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction(() => {
            for (const student of students) {
                if (!student.wallet) continue;

                // Encrypt sensitive data
                const encrypted = encryptStudentData(
                    {
                        name: student.name || '',
                        student_id: student.student_id || '',
                        email: student.email || '',
                    },
                    req.institution.encryption_key
                );

                const result = insertStmt.run(
                    cohortId,
                    student.wallet,
                    student.github || null,
                    student.email || null,
                    encrypted
                );

                if (result.changes > 0) {
                    insertedStudents.push({
                        id: result.lastInsertRowid,
                        wallet_address: student.wallet,
                        github_username: student.github,
                    });
                }
            }
        });

        insertMany();

        res.json({
            enrolled: insertedStudents.length,
            students: insertedStudents,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/campus/cohorts/:id/students
 * List students in a cohort (decrypted for admins)
 */
router.get('/cohorts/:id/students', authenticateInstitution, (req, res) => {
    const cohortId = parseInt(req.params.id);

    // Verify cohort belongs to institution
    const cohort = db.prepare(
        'SELECT * FROM cohorts WHERE id = ? AND institution_id = ?'
    ).get(cohortId, req.institution.id);

    if (!cohort) {
        return res.status(403).json({ error: 'Cohort not found or unauthorized' });
    }

    const students = db.prepare(
        'SELECT * FROM students WHERE cohort_id = ? ORDER BY created_at DESC'
    ).all(cohortId);

    // Decrypt metadata for admin view
    const decrypted = students.map(s => {
        let metadata = null;
        if (s.encrypted_metadata) {
            try {
                metadata = decryptStudentData(s.encrypted_metadata, req.institution.encryption_key);
            } catch { /* skip if decryption fails */ }
        }
        return {
            id: s.id,
            wallet_address: s.wallet_address,
            github_username: s.github_username,
            name: metadata?.name || 'Encrypted',
            student_id: metadata?.student_id || 'Encrypted',
            created_at: s.created_at,
        };
    });

    res.json(decrypted);
});

/**
 * POST /api/campus/batch-mint
 * Start batch certificate minting job
 */
router.post('/batch-mint', authenticateInstitution, async (req, res) => {
    try {
        const { student_wallets, skill, skill_level } = req.body;

        if (!student_wallets || !skill) {
            return res.status(400).json({ error: 'student_wallets and skill are required' });
        }

        // Create background job
        const jobResult = db.prepare(`
            INSERT INTO jobs (job_type, status, input_data)
            VALUES ('batch_mint', 'queued', ?)
        `).run(JSON.stringify({
            student_wallets,
            skill,
            skill_level: skill_level || 'Campus Verified',
            institution_id: req.institution.id,
        }));

        const jobId = jobResult.lastInsertRowid;

        // Process async (don't block response)
        processBatchMintJob(jobId).catch(err =>
            console.error(`Batch mint job ${jobId} failed:`, err)
        );

        res.json({
            job_id: jobId,
            status: 'queued',
            message: `Batch minting started for ${student_wallets.length} students. Poll /api/campus/jobs/${jobId} for status.`,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/campus/jobs/:id
 * Check batch job status
 */
router.get('/jobs/:id', authenticateInstitution, (req, res) => {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(parseInt(req.params.id));

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    // Parse JSON fields
    let output = null;
    try { output = job.output_data ? JSON.parse(job.output_data) : null; } catch { /* keep null */ }

    res.json({
        id: job.id,
        job_type: job.job_type,
        status: job.status,
        input_data: JSON.parse(job.input_data),
        output_data: output,
        error_message: job.error_message,
        started_at: job.started_at,
        completed_at: job.completed_at,
        created_at: job.created_at,
    });
});

/**
 * GET /api/campus/dashboard
 * Institution dashboard with aggregate stats
 */
router.get('/dashboard', authenticateInstitution, (req, res) => {
    const instId = req.institution.id;

    const cohortCount = db.prepare(
        'SELECT COUNT(*) as c FROM cohorts WHERE institution_id = ?'
    ).get(instId).c;

    const studentCount = db.prepare(`
        SELECT COUNT(*) as c FROM students s
        JOIN cohorts c ON s.cohort_id = c.id
        WHERE c.institution_id = ?
    `).get(instId).c;

    const jobStats = db.prepare(`
        SELECT status, COUNT(*) as count FROM jobs
        WHERE input_data LIKE ?
        GROUP BY status
    `).all(`%"institution_id":${instId}%`);

    res.json({
        institution: {
            id: req.institution.id,
            name: req.institution.name,
        },
        stats: {
            total_cohorts: cohortCount,
            total_students: studentCount,
            jobs: jobStats.reduce((acc, j) => { acc[j.status] = j.count; return acc; }, {}),
        },
    });
});

// ── Helper Functions ──

/**
 * Encrypt student PII with AES-256-GCM
 */
function encryptStudentData(data, encryptionKeyHex) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(encryptionKeyHex, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
        data: encrypted,
        iv: iv.toString('hex'),
        auth_tag: authTag.toString('hex'),
    });
}

/**
 * Decrypt student PII
 */
function decryptStudentData(encryptedStr, encryptionKeyHex) {
    const { data, iv, auth_tag } = JSON.parse(encryptedStr);
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(encryptionKeyHex, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    decipher.setAuthTag(Buffer.from(auth_tag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

/**
 * Process batch mint job asynchronously
 */
async function processBatchMintJob(jobId) {
    try {
        // Update status to processing
        db.prepare("UPDATE jobs SET status = 'processing', started_at = datetime('now') WHERE id = ?").run(jobId);

        // Get job data
        const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
        const { student_wallets, skill, skill_level, institution_id } = JSON.parse(job.input_data);

        const results = [];

        for (const wallet of student_wallets) {
            try {
                // Create certificate submission
                const submission = Submission.create({
                    student_name: `Campus Student (${wallet.substring(0, 8)}...)`,
                    wallet_address: wallet,
                    repo_url: 'campus://batch-verified',
                    skill,
                    skill_level: skill_level || 'Campus Verified',
                    ai_score: 50,
                    issuer: `Institution #${institution_id}`,
                    recommendation: 'CAMPUS_VERIFIED',
                    evidence_summary: `Batch-verified by institution. Skill: ${skill}`,
                    status: 'verified',
                    cert_id: require('uuid').v4(),
                });

                results.push({
                    wallet,
                    success: true,
                    cert_id: submission.id,
                    db_id: submission._db_id,
                });
            } catch (error) {
                results.push({
                    wallet,
                    success: false,
                    error: error.message,
                });
            }
        }

        // Update job as completed
        db.prepare(`
            UPDATE jobs SET status = 'completed', output_data = ?, completed_at = datetime('now')
            WHERE id = ?
        `).run(JSON.stringify(results), jobId);

    } catch (error) {
        // Mark job as failed
        db.prepare(`
            UPDATE jobs SET status = 'failed', error_message = ?, completed_at = datetime('now')
            WHERE id = ?
        `).run(error.message, jobId);
    }
}

module.exports = router;
