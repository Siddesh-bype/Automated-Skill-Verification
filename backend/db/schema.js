/**
 * CertifyMe Database Schema
 * Initializes all tables, indexes, and seed data.
 * Run once on first startup — safe to re-run (uses IF NOT EXISTS).
 */

const db = require('./connection');

function initializeSchema() {
    console.log('🗄️  Initializing database schema...');

    // ── Institutions (Campus Mode) ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS institutions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            admin_wallet TEXT NOT NULL UNIQUE,
            api_key TEXT UNIQUE,
            encryption_key TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Cohorts (student groups) ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS cohorts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Students ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cohort_id INTEGER REFERENCES cohorts(id) ON DELETE SET NULL,
            wallet_address TEXT NOT NULL UNIQUE,
            github_username TEXT,
            email TEXT,
            encrypted_metadata TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Submissions (certificate requests & results) ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT DEFAULT 'Anonymous',
            wallet_address TEXT,
            repo_url TEXT NOT NULL,
            skill TEXT NOT NULL,
            skill_level TEXT,
            description TEXT,
            issuer TEXT DEFAULT 'CertifyMe Platform',

            -- AI Analysis Results
            ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
            ai_feedback TEXT,
            ai_analyzed_at TEXT,
            analysis_json TEXT,
            evidence_summary TEXT,
            recommendation TEXT,

            -- Plagiarism Results
            plagiarism_score REAL CHECK (plagiarism_score BETWEEN 0 AND 100),
            plagiarism_matches TEXT,
            plagiarism_checked_at TEXT,

            -- Blockchain Data
            evidence_hash TEXT,
            evidence_url TEXT,
            ipfs_url TEXT,
            asset_id INTEGER,
            cert_id TEXT,
            txn_id TEXT,

            -- Oracle Signature
            oracle_signature TEXT,
            oracle_timestamp INTEGER,

            -- Status Tracking
            status TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','analyzing','verified','rejected','minted','revoked')),

            rejection_reason TEXT,
            revoked_at TEXT,
            revoked_by TEXT,

            created_at TEXT DEFAULT (datetime('now')),
            verified_at TEXT,
            updated_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Skills Registry ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_name TEXT UNIQUE NOT NULL,
            min_score INTEGER DEFAULT 45 CHECK (min_score BETWEEN 0 AND 100),
            description TEXT,
            icon_url TEXT,
            category TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Background Jobs ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_type TEXT NOT NULL,
            status TEXT DEFAULT 'queued'
                CHECK (status IN ('queued','processing','completed','failed')),
            input_data TEXT NOT NULL,
            output_data TEXT,
            error_message TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Audit Log ──
    db.exec(`
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actor_wallet TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            details TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // ── Indexes ──
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_submissions_wallet ON submissions(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_submissions_cert_id ON submissions(cert_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_asset_id ON submissions(asset_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
        CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
        CREATE INDEX IF NOT EXISTS idx_students_wallet ON students(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
        CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
    `);

    // ── Seed Skills ──
    const insertSkill = db.prepare(`
        INSERT OR IGNORE INTO skills (skill_name, min_score, description, category)
        VALUES (?, ?, ?, ?)
    `);

    const seedSkills = [
        ['React Development', 45, 'React.js frontend framework expertise', 'Frontend'],
        ['Python Backend', 45, 'Python programming and backend development', 'Backend'],
        ['JavaScript', 45, 'JavaScript and modern ES6+ development', 'Programming'],
        ['Machine Learning', 50, 'ML algorithms and model development', 'AI/ML'],
        ['Full Stack Development', 45, 'End-to-end web application development', 'Full Stack'],
        ['Blockchain Development', 50, 'Smart contract and dApp development', 'Web3'],
        ['AlgoPy', 55, 'Algorand smart contract development', 'Web3'],
        ['UI/UX Design', 45, 'User interface and experience design', 'Design'],
        ['Data Structures & Algorithms', 50, 'CS fundamentals and algorithms', 'CS Fundamentals'],
        ['Mobile Development', 45, 'Mobile app development', 'Mobile'],
        ['DevOps', 50, 'CI/CD, containerization, cloud deployment', 'DevOps'],
    ];

    const insertMany = db.transaction(() => {
        for (const skill of seedSkills) {
            insertSkill.run(...skill);
        }
    });
    insertMany();

    console.log('✅ Database schema initialized with seed data');
}

module.exports = { initializeSchema };
