/**
 * Plagiarism Detection Service
 * Checks code submissions for similarity against previously submitted code.
 * Uses fingerprinting and n-gram comparison for lightweight detection.
 * Falls back gracefully when no reference corpus exists.
 */

const crypto = require('crypto');
const db = require('../db/connection');

class PlagiarismService {
    constructor() {
        this.similarityThreshold = 0.30; // 30% = suspicious
        this.ngramSize = 4; // 4-gram for code comparison

        // Create fingerprints table if not exists
        db.exec(`
            CREATE TABLE IF NOT EXISTS code_fingerprints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                submission_id INTEGER,
                repo_url TEXT NOT NULL,
                fingerprint TEXT NOT NULL,
                ngram_hashes TEXT,
                file_count INTEGER DEFAULT 0,
                total_lines INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_fingerprints_repo ON code_fingerprints(repo_url);
            CREATE INDEX IF NOT EXISTS idx_fingerprints_hash ON code_fingerprints(fingerprint);
        `);

        console.log('🔍 Plagiarism detection service initialized');
    }

    /**
     * Check a repository URL for plagiarism against stored fingerprints
     */
    async checkRepository(repoUrl) {
        try {
            // 1. Fetch code from GitHub API
            const codeContents = await this._fetchCodeFromGithub(repoUrl);

            if (!codeContents || codeContents.length === 0) {
                return {
                    similarity_score: 0,
                    is_suspicious: false,
                    matches: [],
                    fingerprint: 'empty-repo',
                    checked: true,
                };
            }

            // 2. Generate fingerprint
            const combinedCode = codeContents.map(f => f.content).join('\n');
            const fingerprint = crypto.createHash('sha256').update(combinedCode).digest('hex');

            // 3. Generate n-gram hashes for comparison
            const ngrams = this._generateNgrams(combinedCode, this.ngramSize);
            const ngramHashes = ngrams.map(ng =>
                crypto.createHash('md5').update(ng).digest('hex')
            );

            // 4. Check against existing fingerprints
            const existingFingerprints = db.prepare(
                'SELECT * FROM code_fingerprints ORDER BY created_at DESC LIMIT 100'
            ).all();

            let maxSimilarity = 0;
            const matches = [];

            for (const existing of existingFingerprints) {
                // Skip self-comparison
                if (existing.repo_url === repoUrl) continue;

                // Exact fingerprint match
                if (existing.fingerprint === fingerprint) {
                    matches.push({
                        repo_url: existing.repo_url,
                        similarity: 100,
                        type: 'exact_match',
                    });
                    maxSimilarity = 100;
                    continue;
                }

                // N-gram comparison
                if (existing.ngram_hashes) {
                    let existingNgrams;
                    try { existingNgrams = JSON.parse(existing.ngram_hashes); } catch { continue; }

                    const existingSet = new Set(existingNgrams);
                    const currentSet = new Set(ngramHashes);
                    const intersection = ngramHashes.filter(h => existingSet.has(h));

                    const similarity = currentSet.size > 0
                        ? (intersection.length / currentSet.size) * 100
                        : 0;

                    if (similarity > 15) { // Report matches above 15%
                        matches.push({
                            repo_url: existing.repo_url,
                            similarity: Math.round(similarity * 100) / 100,
                            type: similarity > 50 ? 'high_similarity' : 'partial_match',
                        });
                        maxSimilarity = Math.max(maxSimilarity, similarity);
                    }
                }
            }

            // 5. Store fingerprint for future comparisons
            db.prepare(`
                INSERT INTO code_fingerprints (repo_url, fingerprint, ngram_hashes, file_count, total_lines)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                repoUrl,
                fingerprint,
                JSON.stringify(ngramHashes.slice(0, 500)), // Limit stored hashes
                codeContents.length,
                combinedCode.split('\n').length,
            );

            return {
                similarity_score: Math.round(maxSimilarity * 100) / 100,
                is_suspicious: maxSimilarity > (this.similarityThreshold * 100),
                matches: matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5),
                fingerprint,
                checked: true,
                files_analyzed: codeContents.length,
            };

        } catch (error) {
            console.error('Plagiarism check error:', error.message);
            // Non-blocking — return clean result on failure
            return {
                similarity_score: 0,
                is_suspicious: false,
                matches: [],
                fingerprint: null,
                checked: false,
                error: error.message,
            };
        }
    }

    /**
     * Fetch code files from a GitHub repo via the public API
     */
    async _fetchCodeFromGithub(repoUrl) {
        const axios = require('axios');

        const parts = repoUrl.replace('https://github.com/', '').replace(/\/$/, '').split('/');
        if (parts.length < 2) return [];

        const [owner, repo] = parts;
        const headers = { Accept: 'application/vnd.github.v3+json' };

        // Try main branch, then master
        let treeData;
        for (const branch of ['main', 'master']) {
            try {
                const res = await axios.get(
                    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
                    { headers, timeout: 10000 }
                );
                treeData = res.data;
                break;
            } catch { /* try next branch */ }
        }

        if (!treeData || !treeData.tree) return [];

        // Filter for source code files
        const codeExtensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.go', '.rs'];
        const sourceFiles = treeData.tree.filter(item =>
            item.type === 'blob' &&
            codeExtensions.some(ext => item.path.endsWith(ext)) &&
            !item.path.includes('node_modules') &&
            !item.path.includes('dist') &&
            !item.path.includes('.min.')
        ).slice(0, 8); // Limit to 8 files

        const contents = [];
        for (const file of sourceFiles) {
            try {
                const raw = await axios.get(
                    `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`,
                    { timeout: 5000 }
                );
                contents.push({
                    path: file.path,
                    content: raw.data.substring(0, 3000),
                });
            } catch {
                try {
                    const raw = await axios.get(
                        `https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`,
                        { timeout: 5000 }
                    );
                    contents.push({
                        path: file.path,
                        content: raw.data.substring(0, 3000),
                    });
                } catch { /* skip file */ }
            }
        }

        return contents;
    }

    /**
     * Generate n-grams from code text
     */
    _generateNgrams(text, n) {
        // Normalize: remove whitespace variations, comments, empty lines
        const normalized = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'))
            .join('\n');

        const words = normalized.split(/\s+/);
        const ngrams = [];

        for (let i = 0; i <= words.length - n; i++) {
            ngrams.push(words.slice(i, i + n).join(' '));
        }

        return ngrams;
    }
}

// Singleton
let instance;
function getPlagiarismService() {
    if (!instance) {
        instance = new PlagiarismService();
    }
    return instance;
}

module.exports = getPlagiarismService();
