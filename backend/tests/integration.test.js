/**
 * CertifyMe Backend Integration Tests
 * Tests the full certificate submission → verification flow.
 * 
 * Run with: npm test  or  node --test tests/integration.test.js
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper: make HTTP request
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: { 'Content-Type': 'application/json' },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

describe('CertifyMe Backend v2.0', () => {

    describe('Health Check', () => {
        it('should return healthy status', async () => {
            const res = await request('GET', '/health');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.status, 'ok');
            assert.strictEqual(res.body.version, '2.0.0');
            assert.ok(res.body.features.ai_verification);
            assert.ok(res.body.features.plagiarism_detection);
            assert.ok(res.body.features.oracle_signing);
            assert.ok(res.body.features.campus_mode);
        });
    });

    describe('Skills API', () => {
        it('should list available skills', async () => {
            const res = await request('GET', '/api/skills');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
            assert.ok(res.body.length > 0);
            assert.ok(res.body[0].name);
            assert.ok(res.body[0].category);
        });

        it('should register a new skill', async () => {
            const res = await request('POST', '/api/skills', {
                skill_name: 'Rust Development',
                category: 'Systems',
                min_score: 55,
                description: 'Rust programming language',
            });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.success);
        });
    });

    describe('Certificate Submission', () => {
        let certId;

        it('should reject missing fields', async () => {
            const res = await request('POST', '/api/certificates/submit-evidence', {
                github_url: 'https://github.com/test/repo',
            });
            assert.strictEqual(res.status, 400);
        });

        it('should submit evidence and get AI verification', async () => {
            const res = await request('POST', '/api/certificates/submit-evidence', {
                github_url: 'https://github.com/algorand/js-algorand-sdk',
                claimed_skill: 'JavaScript',
                student_name: 'Test Student',
                description: 'Test submission',
            });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.id);
            assert.ok(res.body.ai_score >= 0);
            assert.ok(res.body.skill);
            certId = res.body.id;
        });

        it('should list certificates', async () => {
            const res = await request('GET', '/api/certificates');
            assert.strictEqual(res.status, 200);
            assert.ok(Array.isArray(res.body));
            assert.ok(res.body.length > 0);
        });

        it('should get certificate by ID', async () => {
            if (!certId) return;
            const res = await request('GET', `/api/certificates/${certId}`);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.id, certId);
        });

        it('should get certificate stats', async () => {
            const res = await request('GET', '/api/certificates/stats');
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.total_certificates >= 0);
            assert.ok(res.body.average_score >= 0);
        });
    });

    describe('Verification API', () => {
        it('should verify code directly', async () => {
            const res = await request('POST', '/api/verification/verify-code', {
                github_url: 'https://github.com/algorand/js-algorand-sdk',
                claimed_skill: 'JavaScript',
            });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.ai_score !== undefined);
        });

        it('should get contract status', async () => {
            const res = await request('GET', '/api/verification/contract-status');
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.deployment);
        });
    });

    describe('Campus Mode', () => {
        let apiKey;
        let cohortId;

        it('should create an institution', async () => {
            const res = await request('POST', '/api/campus/institutions', {
                name: 'Test University',
                admin_wallet: `TEST_WALLET_${Date.now()}`,
            });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.institution.api_key);
            apiKey = res.body.institution.api_key;
        });

        it('should create a cohort', async () => {
            const res = await new Promise((resolve, reject) => {
                const url = new URL('/api/campus/cohorts', BASE_URL);
                const options = {
                    method: 'POST',
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                    },
                };
                const req = http.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
                });
                req.on('error', reject);
                req.write(JSON.stringify({
                    name: 'CS 101 - Spring 2026',
                    start_date: '2026-01-15',
                    end_date: '2026-05-10',
                }));
                req.end();
            });
            assert.strictEqual(res.status, 200);
            assert.ok(res.body.id);
            cohortId = res.body.id;
        });

        it('should reject unauthenticated campus requests', async () => {
            const res = await request('GET', '/api/campus/cohorts');
            assert.strictEqual(res.status, 401);
        });
    });

    describe('404 Handling', () => {
        it('should return 404 with available endpoints', async () => {
            const res = await request('GET', '/api/nonexistent');
            assert.strictEqual(res.status, 404);
            assert.ok(res.body.available_endpoints);
        });
    });
});

console.log('');
console.log('⚠️  Tests require the backend to be running on port 3001.');
console.log('   Start with: npm run dev');
console.log('');
