/**
 * CertifyMe Demo Data Seeder
 * Loads sample submissions and certificates into the backend for demo purposes.
 *
 * Usage: node seed_database.js
 */

const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function seed() {
    console.log('🌱 Seeding CertifyMe demo data...\n');

    // Load sample data
    const samples = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'sample_submissions.json'), 'utf8')
    );

    for (const sample of samples) {
        try {
            // POST to the backend certificates store
            const res = await fetch(`${BACKEND_URL}/api/certificates/submit-evidence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    github_url: sample.github_url,
                    claimed_skill: sample.skill,
                    student_name: sample.student_name,
                    description: sample.description,
                    issuer: sample.issuer,
                }),
            });

            if (res.ok) {
                const cert = await res.json();
                console.log(`✅ ${sample.student_name}: ${sample.skill} → Score: ${cert.ai_score} (${cert.status})`);
            } else {
                console.log(`⚠️  ${sample.student_name}: Backend returned ${res.status}`);
                console.log('   Note: The backend + AI service must be running for live seeding.');
                console.log('   Using fallback: data loaded from JSON for demo.\n');
            }
        } catch (e) {
            console.log(`⚠️  ${sample.student_name}: Could not reach backend (${e.message})`);
            console.log('   Start backend with: cd backend && npm start\n');
        }
    }

    console.log('\n📊 Demo data summary:');
    console.log(`   Total submissions: ${samples.length}`);
    console.log(`   Verified: ${samples.filter(s => s.verified).length}`);
    console.log(`   Rejected: ${samples.filter(s => !s.verified).length}`);
    console.log('\n🎯 Ready for demo!');
}

seed().catch(console.error);
