/**
 * Database Schema — Creates all tables if they don't exist.
 */

const db = require('./connection');

function initializeSchema() {
    console.log('📋 Initializing database schema...');

    db.exec(`
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert_id TEXT UNIQUE NOT NULL,
            student_name TEXT DEFAULT 'Anonymous',
            wallet_address TEXT,
            github_url TEXT,
            skill TEXT NOT NULL,
            skill_level TEXT,
            description TEXT,
            issuer TEXT DEFAULT 'CertifyMe Platform',
            ai_score INTEGER,
            ai_feedback TEXT,
            analysis_json TEXT,
            evidence_summary TEXT,
            recommendation TEXT,
            plagiarism_score REAL,
            plagiarism_matches TEXT,
            evidence_hash TEXT,
            evidence_url TEXT,
            ipfs_url TEXT,
            asset_id INTEGER,
            txn_id TEXT,
            oracle_signature TEXT,
            oracle_timestamp INTEGER,
            status TEXT DEFAULT 'PENDING',
            verified INTEGER DEFAULT 0,
            issue_date TEXT,
            verified_at TEXT,
            revoked_at TEXT,
            revoked_by TEXT,
            rejection_reason TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_name TEXT UNIQUE NOT NULL,
            category TEXT DEFAULT 'General',
            min_score INTEGER DEFAULT 45,
            description TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS institutions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            admin_wallet TEXT UNIQUE NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            encryption_key TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS cohorts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institution_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (institution_id) REFERENCES institutions(id)
        );

        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cohort_id INTEGER NOT NULL,
            wallet_address TEXT NOT NULL,
            github_username TEXT,
            email TEXT,
            encrypted_metadata TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (cohort_id) REFERENCES cohorts(id),
            UNIQUE(cohort_id, wallet_address)
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_type TEXT NOT NULL,
            status TEXT DEFAULT 'queued',
            input_data TEXT,
            output_data TEXT,
            error_message TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_submissions_cert_id ON submissions(cert_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_wallet ON submissions(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_submissions_asset_id ON submissions(asset_id);
        CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

        -- Portfolio profiles
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT UNIQUE NOT NULL,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            github_url TEXT,
            linkedin_url TEXT,
            is_public INTEGER DEFAULT 1,
            share_token TEXT UNIQUE,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Revocation event feed
        CREATE TABLE IF NOT EXISTS revocation_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert_id TEXT NOT NULL,
            asset_id INTEGER,
            skill TEXT,
            student_name TEXT,
            revoked_by TEXT,
            reason TEXT,
            chain_name TEXT DEFAULT 'algorand',
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- Certificate share links with expiry
        CREATE TABLE IF NOT EXISTS share_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            shared_via TEXT,
            recipient TEXT,
            expires_at TEXT NOT NULL,
            accessed_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_portfolios_wallet ON portfolios(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_portfolios_token ON portfolios(share_token);
        CREATE INDEX IF NOT EXISTS idx_revocations_created ON revocation_events(created_at);
        CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
        CREATE INDEX IF NOT EXISTS idx_share_links_cert ON share_links(cert_id);
    `);

    // Safe migration: add chain_name column to submissions if it doesn't exist
    try {
        const cols = db.pragma('table_info(submissions)');
        const hasChainName = cols.some(c => c.name === 'chain_name');
        if (!hasChainName) {
            db.exec(`ALTER TABLE submissions ADD COLUMN chain_name TEXT DEFAULT 'algorand'`);
            console.log('   ✅ Added chain_name column to submissions');
        }
    } catch (e) {
        console.warn('   ⚠️  Migration warning:', e.message);
    }

    // Seed default skills if none exist
    const count = db.prepare('SELECT COUNT(*) as c FROM skills').get().c;
    if (count === 0) {
        const insert = db.prepare('INSERT INTO skills (skill_name, category, min_score, description) VALUES (?, ?, ?, ?)');
        const defaults = [
            ['React Development', 'Frontend', 45, 'Modern React with hooks, state management, and component architecture'],
            ['Python Backend', 'Backend', 45, 'Python server-side development with Flask/Django'],
            ['Machine Learning', 'AI/ML', 50, 'ML model development, training, and evaluation'],
            ['Full Stack Development', 'Full Stack', 45, 'End-to-end web application development'],
            ['Blockchain Development', 'Web3', 50, 'Smart contracts and decentralized application development'],
            ['UI/UX Design', 'Design', 45, 'User interface and experience design implementation'],
            ['Data Structures & Algorithms', 'CS Fundamentals', 50, 'Core computer science concepts and problem solving'],
            ['Mobile Development', 'Mobile', 45, 'iOS/Android app development with React Native or native SDKs'],
        ];
        const insertMany = db.transaction(() => {
            for (const s of defaults) insert.run(...s);
        });
        insertMany();
        console.log('   ✅ Seeded 8 default skills');
    }

    console.log('   ✅ Schema initialized');
}

module.exports = { initializeSchema };
