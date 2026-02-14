/**
 * Submission Model
 * Database operations for certificate submissions.
 * Replaces in-memory Map with persistent SQLite storage.
 */

const db = require('../connection');

class Submission {
    /**
     * Create a new submission record
     */
    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO submissions (
                student_name, wallet_address, repo_url, skill, skill_level,
                description, issuer, ai_score, ai_feedback, ai_analyzed_at,
                analysis_json, evidence_summary, recommendation,
                plagiarism_score, plagiarism_matches, plagiarism_checked_at,
                evidence_hash, evidence_url, ipfs_url, asset_id, cert_id, txn_id,
                oracle_signature, oracle_timestamp,
                status, rejection_reason, verified_at
            ) VALUES (
                @student_name, @wallet_address, @repo_url, @skill, @skill_level,
                @description, @issuer, @ai_score, @ai_feedback, @ai_analyzed_at,
                @analysis_json, @evidence_summary, @recommendation,
                @plagiarism_score, @plagiarism_matches, @plagiarism_checked_at,
                @evidence_hash, @evidence_url, @ipfs_url, @asset_id, @cert_id, @txn_id,
                @oracle_signature, @oracle_timestamp,
                @status, @rejection_reason, @verified_at
            )
        `);

        const params = {
            student_name: data.student_name || 'Anonymous',
            wallet_address: data.wallet_address || null,
            repo_url: data.repo_url,
            skill: data.skill,
            skill_level: data.skill_level || null,
            description: data.description || null,
            issuer: data.issuer || 'CertifyMe Platform',
            ai_score: data.ai_score || null,
            ai_feedback: data.ai_feedback || null,
            ai_analyzed_at: data.ai_analyzed_at || null,
            analysis_json: data.analysis_json ? JSON.stringify(data.analysis_json) : null,
            evidence_summary: data.evidence_summary || null,
            recommendation: data.recommendation || null,
            plagiarism_score: data.plagiarism_score !== undefined ? data.plagiarism_score : null,
            plagiarism_matches: data.plagiarism_matches ? JSON.stringify(data.plagiarism_matches) : null,
            plagiarism_checked_at: data.plagiarism_checked_at || null,
            evidence_hash: data.evidence_hash || null,
            evidence_url: data.evidence_url || null,
            ipfs_url: data.ipfs_url || null,
            asset_id: data.asset_id || null,
            cert_id: data.cert_id || null,
            txn_id: data.txn_id || null,
            oracle_signature: data.oracle_signature || null,
            oracle_timestamp: data.oracle_timestamp || null,
            status: data.status || 'pending',
            rejection_reason: data.rejection_reason || null,
            verified_at: data.verified_at || null,
        };

        const result = stmt.run(params);
        return this.findById(result.lastInsertRowid);
    }

    /**
     * Find submission by internal ID  
     */
    static findById(id) {
        const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        return row ? this._deserialize(row) : null;
    }

    /**
     * Find submission by cert_id (UUID)
     */
    static findByCertId(cert_id) {
        const row = db.prepare('SELECT * FROM submissions WHERE cert_id = ?').get(cert_id);
        return row ? this._deserialize(row) : null;
    }

    /**
     * Find submission by blockchain asset ID
     */
    static findByAssetId(asset_id) {
        const row = db.prepare('SELECT * FROM submissions WHERE asset_id = ?').get(asset_id);
        return row ? this._deserialize(row) : null;
    }

    /**
     * Find all submissions by wallet address
     */
    static findByWallet(wallet_address) {
        const rows = db.prepare(
            'SELECT * FROM submissions WHERE wallet_address = ? ORDER BY created_at DESC'
        ).all(wallet_address);
        return rows.map(r => this._deserialize(r));
    }

    /**
     * List all submissions with optional status filter
     */
    static findAll(filters = {}) {
        let query = 'SELECT * FROM submissions';
        const params = [];

        if (filters.status) {
            query += ' WHERE status = ?';
            params.push(filters.status.toUpperCase());
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        const rows = db.prepare(query).all(...params);
        return rows.map(r => this._deserialize(r));
    }

    /**
     * Update submission status
     */
    static updateStatus(id, status, additionalData = {}) {
        let sets = ['status = ?', "updated_at = datetime('now')"];
        let params = [status];

        if (additionalData.rejection_reason) {
            sets.push('rejection_reason = ?');
            params.push(additionalData.rejection_reason);
        }

        if (status === 'verified') {
            sets.push("verified_at = datetime('now')");
        }

        params.push(id);

        db.prepare(`UPDATE submissions SET ${sets.join(', ')} WHERE id = ?`).run(...params);
        return this.findById(id);
    }

    /**
     * Update submission with full data after AI analysis
     */
    static updateWithAnalysis(id, data) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                ai_score = @ai_score,
                ai_feedback = @ai_feedback,
                ai_analyzed_at = datetime('now'),
                analysis_json = @analysis_json,
                evidence_summary = @evidence_summary,
                recommendation = @recommendation,
                skill_level = @skill_level,
                status = @status,
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            ai_score: data.ai_score,
            ai_feedback: data.ai_feedback || null,
            analysis_json: data.analysis_json ? JSON.stringify(data.analysis_json) : null,
            evidence_summary: data.evidence_summary || null,
            recommendation: data.recommendation || null,
            skill_level: data.skill_level || null,
            status: data.status || 'verified',
        });

        return this.findById(id);
    }

    /**
     * Update submission with blockchain minting data
     */
    static updateWithMint(id, data) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                asset_id = @asset_id,
                txn_id = @txn_id,
                status = 'minted',
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            asset_id: data.asset_id || null,
            txn_id: data.txn_id || null,
        });

        return this.findById(id);
    }

    /**
     * Update with IPFS evidence data
     */
    static updateWithEvidence(id, data) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                evidence_hash = @evidence_hash,
                evidence_url = @evidence_url,
                ipfs_url = @ipfs_url,
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            evidence_hash: data.evidence_hash || null,
            evidence_url: data.evidence_url || null,
            ipfs_url: data.ipfs_url || null,
        });

        return this.findById(id);
    }

    /**
     * Update with plagiarism check results
     */
    static updateWithPlagiarism(id, data) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                plagiarism_score = @plagiarism_score,
                plagiarism_matches = @plagiarism_matches,
                plagiarism_checked_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            plagiarism_score: data.plagiarism_score !== undefined ? data.plagiarism_score : null,
            plagiarism_matches: data.plagiarism_matches ? JSON.stringify(data.plagiarism_matches) : null,
        });

        return this.findById(id);
    }

    /**
     * Update with oracle signature
     */
    static updateWithOracle(id, data) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                oracle_signature = @oracle_signature,
                oracle_timestamp = @oracle_timestamp,
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            oracle_signature: data.oracle_signature || null,
            oracle_timestamp: data.oracle_timestamp || null,
        });

        return this.findById(id);
    }

    /**
     * Revoke a certificate
     */
    static revoke(id, reason, admin_wallet) {
        const stmt = db.prepare(`
            UPDATE submissions SET
                status = 'revoked',
                revoked_at = datetime('now'),
                revoked_by = ?,
                rejection_reason = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `);

        stmt.run(admin_wallet, reason, id);
        return this.findById(id);
    }

    /**
     * Get aggregate statistics
     */
    static getStats() {
        const total = db.prepare('SELECT COUNT(*) as count FROM submissions').get().count;
        const verified = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status IN ('verified','minted')").get().count;
        const minted = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'minted'").get().count;
        const rejected = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'rejected'").get().count;

        const avgScoreRow = db.prepare(
            "SELECT AVG(ai_score) as avg FROM submissions WHERE status IN ('verified','minted') AND ai_score IS NOT NULL"
        ).get();
        const avgScore = avgScoreRow.avg ? Math.round(avgScoreRow.avg) : 0;

        const skillCounts = db.prepare(`
            SELECT skill, COUNT(*) as count 
            FROM submissions 
            WHERE status IN ('verified','minted')
            GROUP BY skill 
            ORDER BY count DESC 
            LIMIT 5
        `).all();

        return {
            total_certificates: total,
            total_verified: verified,
            total_minted: minted,
            total_rejected: rejected,
            average_score: avgScore,
            top_skills: skillCounts.map(r => ({ skill: r.skill, count: r.count })),
        };
    }

    /**
     * Deserialize JSON columns from database row
     */
    static _deserialize(row) {
        if (!row) return null;

        // Parse JSON fields
        if (row.analysis_json) {
            try { row.analysis = JSON.parse(row.analysis_json); } catch { row.analysis = null; }
        } else {
            row.analysis = null;
        }

        if (row.plagiarism_matches && typeof row.plagiarism_matches === 'string') {
            try { row.plagiarism_matches = JSON.parse(row.plagiarism_matches); } catch { /* keep string */ }
        }

        // Map to the response format the frontend expects
        return {
            id: row.cert_id || row.id.toString(),
            _db_id: row.id,
            student_name: row.student_name,
            skill: row.skill,
            skill_level: row.skill_level,
            ai_score: row.ai_score,
            github_url: row.repo_url,
            description: row.description,
            issuer: row.issuer,
            evidence_hash: row.evidence_hash,
            evidence_url: row.evidence_url,
            analysis: row.analysis,
            evidence_summary: row.evidence_summary,
            recommendation: row.recommendation,
            verified: row.status === 'verified' || row.status === 'minted',
            blockchain_asset_id: row.asset_id,
            blockchain_tx_id: row.txn_id,
            issue_date: row.created_at,
            status: row.status ? row.status.toUpperCase() : 'PENDING',
            wallet_address: row.wallet_address,
            ipfs_url: row.ipfs_url,
            plagiarism_score: row.plagiarism_score,
            plagiarism_matches: row.plagiarism_matches,
            oracle_signature: row.oracle_signature,
            oracle_timestamp: row.oracle_timestamp,
            created_at: row.created_at,
            verified_at: row.verified_at,
            updated_at: row.updated_at,
        };
    }
}

module.exports = Submission;
