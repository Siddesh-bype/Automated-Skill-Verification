/**
 * Database seed script
 * Initialize the database with sample data for demo purposes.
 * Safe to re-run — uses INSERT OR IGNORE.
 * 
 * Usage: node scripts/seed_database.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize DB
const { initializeSchema } = require('../db/schema');
initializeSchema();

const db = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

console.log('🌱 Seeding database...');

// ── Sample Skills ──
const skills = [
    ['React Development', 45, 'React.js frontend framework expertise', 'Frontend'],
    ['Python Backend', 45, 'Python programming and backend development', 'Backend'],
    ['Machine Learning', 50, 'ML algorithms and model development', 'AI/ML'],
    ['Blockchain Development', 50, 'Smart contract and dApp development', 'Web3'],
    ['Full Stack Development', 45, 'End-to-end web application development', 'Full Stack'],
    ['UI/UX Design', 45, 'User interface and experience design', 'Design'],
    ['DevOps', 50, 'CI/CD, containerization, cloud deployment', 'DevOps'],
    ['Data Structures & Algorithms', 50, 'CS fundamentals and algorithms', 'CS Fundamentals'],
    ['Mobile Development', 45, 'Mobile app development', 'Mobile'],
    ['AlgoPy', 55, 'Algorand smart contract development', 'Web3'],
    ['JavaScript', 45, 'JavaScript and modern ES6+ development', 'Programming'],
];

const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO skills (skill_name, min_score, description, category) VALUES (?, ?, ?, ?)
`);

for (const skill of skills) {
    insertSkill.run(...skill);
}
console.log(`  ✅ ${skills.length} skills seeded`);

// ── Sample Submissions ──
const submissions = [
    {
        student_name: 'Siddesh Bype',
        skill: 'React Development',
        skill_level: 'Advanced',
        ai_score: 78,
        repo_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
        description: 'Full-stack blockchain credential platform built with React + Algorand',
        analysis: { code_quality: 82, complexity: 74, best_practices: 80, originality: 75 },
        evidence_summary: 'Advanced React skills with TypeScript, custom hooks, and proper state management.',
        status: 'verified',
    },
    {
        student_name: 'Siddesh Bype',
        skill: 'Python Backend',
        skill_level: 'Intermediate',
        ai_score: 65,
        repo_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
        description: 'Flask AI verification micro-service for code analysis',
        analysis: { code_quality: 70, complexity: 55, best_practices: 68, originality: 62 },
        evidence_summary: 'Flask API service with OpenRouter LLM integration.',
        status: 'verified',
    },
    {
        student_name: 'Siddesh Bype',
        skill: 'Blockchain Development',
        skill_level: 'Advanced',
        ai_score: 82,
        repo_url: 'https://github.com/Siddesh-bype/Automated-Skill-Verification',
        description: 'ARC-4 smart contract with box storage for certificate management',
        analysis: { code_quality: 85, complexity: 80, best_practices: 78, originality: 84 },
        evidence_summary: 'AlgoPy smart contract with ARC-4, box storage, and admin controls.',
        status: 'minted',
        asset_id: 12345678,
        txn_id: 'DEMO-TX-ABC123XYZ',
    },
];

const insertSubmission = db.prepare(`
    INSERT INTO submissions (
        cert_id, student_name, skill, skill_level, ai_score, repo_url,
        description, analysis_json, evidence_summary, recommendation, status,
        asset_id, txn_id, issuer
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Only seed if DB is empty
const count = db.prepare('SELECT COUNT(*) as c FROM submissions').get().c;
if (count === 0) {
    for (const sub of submissions) {
        insertSubmission.run(
            uuidv4(),
            sub.student_name,
            sub.skill,
            sub.skill_level,
            sub.ai_score,
            sub.repo_url,
            sub.description,
            JSON.stringify(sub.analysis),
            sub.evidence_summary,
            'ISSUE_CERTIFICATE',
            sub.status,
            sub.asset_id || null,
            sub.txn_id || null,
            'CertifyMe Platform'
        );
    }
    console.log(`  ✅ ${submissions.length} demo submissions seeded`);
} else {
    console.log(`  ⏭️  ${count} submissions already exist, skipping seed`);
}

// ── Sample Institution (for campus mode demo) ──
const instCount = db.prepare('SELECT COUNT(*) as c FROM institutions').get().c;
if (instCount === 0) {
    const crypto = require('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');
    const encKey = crypto.randomBytes(32).toString('hex');

    db.prepare(`
        INSERT INTO institutions (name, admin_wallet, api_key, encryption_key)
        VALUES (?, ?, ?, ?)
    `).run('Demo University', 'DEMO_ADMIN_WALLET_ADDRESS', apiKey, encKey);

    console.log(`  ✅ Demo institution created`);
    console.log(`     API Key: ${apiKey}`);
    console.log(`     ⚠️  Save this key for Campus Mode testing`);
}

console.log('');
console.log('🎉 Database seeding complete!');

process.exit(0);
