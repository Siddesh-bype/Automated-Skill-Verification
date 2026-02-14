/**
 * Submission Model — SQLite-backed persistence
 * All certificate data stored in submissions table.
 */

const db = require('../connection');

class Submission {
    /**
     * Helper to stringify objects for SQLite TEXT columns
     */
    static _toText(val) {
        if (val === null || val === undefined) return null;
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
    }

    /**
     * Create a new submission record
     */
    static create(data) {
        const now = new Date().toISOString();
        const certId = data.cert_id || `cert-${Date.now()}`;

        const stmt = db.prepare(`
            INSERT INTO submissions (
                cert_id, student_name, wallet_address, github_url, skill, skill_level,
                description, issuer, ai_score, ai_feedback, analysis_json,
                evidence_summary, recommendation, plagiarism_score, plagiarism_matches,
                evidence_hash, evidence_url, ipfs_url, asset_id, txn_id,
                oracle_signature, oracle_timestamp, status, verified,
                issue_date, verified_at, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `);

        const status = (data.status || 'pending').toUpperCase();
        const result = stmt.run(
            certId,
            data.student_name || 'Anonymous',
            data.wallet_address || null,
            data.repo_url || data.github_url || null,
            data.skill,
            data.skill_level || null,
            data.description || null,
            data.issuer || 'CertifyMe Platform',
            data.ai_score || null,
            Submission._toText(data.ai_feedback),
            Submission._toText(data.analysis_json),
            data.evidence_summary || null,
            data.recommendation || null,
            data.plagiarism_score !== undefined ? data.plagiarism_score : null,
            Submission._toText(data.plagiarism_matches),
            data.evidence_hash || null,
            data.evidence_url || null,
            data.ipfs_url || null,
            data.asset_id || null,
            data.txn_id || null,
            data.oracle_signature || null,
            data.oracle_timestamp || null,
            status,
            status === 'VERIFIED' || status === 'MINTED' ? 1 : 0,
            now,
            data.verified_at || null,
            now,
            now
        );

        return this._rowToRecord(
            db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid)
        );
    }

    /**
     * Find submission by internal ID
     */
    static findById(id) {
        const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        return row ? this._rowToRecord(row) : null;
    }

    /**
     * Find submission by cert_id (UUID)
     */
    static findByCertId(certId) {
        const row = db.prepare('SELECT * FROM submissions WHERE cert_id = ?').get(certId);
        return row ? this._rowToRecord(row) : null;
    }

    /**
     * Find submission by blockchain asset ID
     */
    static findByAssetId(assetId) {
        const row = db.prepare('SELECT * FROM submissions WHERE asset_id = ?').get(assetId);
        return row ? this._rowToRecord(row) : null;
    }

    /**
     * Find all submissions by wallet address
     */
    static findByWallet(walletAddress) {
        const rows = db.prepare(
            'SELECT * FROM submissions WHERE wallet_address = ? ORDER BY created_at DESC'
        ).all(walletAddress);
        return rows.map(r => this._rowToRecord(r));
    }

    /**
     * List all submissions with optional status filter
     */
    static findAll(filters = {}) {
        let sql = 'SELECT * FROM submissions';
        const params = [];

        if (filters.status) {
            sql += ' WHERE status = ?';
            params.push(filters.status.toUpperCase());
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        const rows = db.prepare(sql).all(...params);
        return rows.map(r => this._rowToRecord(r));
    }

    /**
     * Update submission status
     */
    static updateStatus(id, status, additionalData = {}) {
        const record = this.findById(id);
        if (!record) return null;

        const stmt = db.prepare(`
            UPDATE submissions SET status = ?, verified = ?, updated_at = ?,
            rejection_reason = COALESCE(?, rejection_reason),
            verified_at = CASE WHEN ? = 'VERIFIED' THEN datetime('now') ELSE verified_at END
            WHERE id = ?
        `);

        const upperStatus = status.toUpperCase();
        stmt.run(
            upperStatus,
            upperStatus === 'VERIFIED' || upperStatus === 'MINTED' ? 1 : 0,
            new Date().toISOString(),
            additionalData.rejection_reason || null,
            upperStatus,
            id
        );

        return this.findById(id);
    }

    /**
     * Update submission with full data after AI analysis
     */
    static updateWithAnalysis(id, data) {
        const record = this.findById(id);
        if (!record) return null;

        const status = (data.status || 'verified').toUpperCase();
        db.prepare(`
            UPDATE submissions SET
                ai_score = ?, ai_feedback = ?, analysis_json = ?,
                evidence_summary = ?, recommendation = ?, skill_level = ?,
                status = ?, verified = ?, updated_at = ?
            WHERE id = ?
        `).run(
            data.ai_score, Submission._toText(data.ai_feedback), Submission._toText(data.analysis_json),
            data.evidence_summary || null, data.recommendation || null, data.skill_level || null,
            status, status === 'VERIFIED' || status === 'MINTED' ? 1 : 0,
            new Date().toISOString(), id
        );

        return this.findById(id);
    }

    /**
     * Update submission with blockchain minting data
     */
    static updateWithMint(id, data) {
        const record = this.findById(id);
        if (!record) return null;

        db.prepare(`
            UPDATE submissions SET
                asset_id = ?, txn_id = ?, status = 'MINTED', verified = 1, updated_at = ?
            WHERE id = ?
        `).run(data.asset_id || null, data.txn_id || null, new Date().toISOString(), id);

        return this.findById(id);
    }

    /**
     * Update with IPFS evidence data
     */
    static updateWithEvidence(id, data) {
        const record = this.findById(id);
        if (!record) return null;

        db.prepare(`
            UPDATE submissions SET
                evidence_hash = ?, evidence_url = ?, ipfs_url = ?, updated_at = ?
            WHERE id = ?
        `).run(data.evidence_hash || null, data.evidence_url || null, data.ipfs_url || null,
            new Date().toISOString(), id);

        return this.findById(id);
    }

    /**
     * Update with plagiarism check results
     */
    static updateWithPlagiarism(id, data) {
        const record = this.findById(id);
        if (!record) return null;

        db.prepare(`
            UPDATE submissions SET
                plagiarism_score = ?, plagiarism_matches = ?, updated_at = ?
            WHERE id = ?
        `).run(
            data.plagiarism_score !== undefined ? data.plagiarism_score : null,
            Submission._toText(data.plagiarism_matches), new Date().toISOString(), id
        );

        return this.findById(id);
    }

    /**
     * Update with oracle signature
     */
    static updateWithOracle(id, data) {
        const record = this.findById(id);
        if (!record) return null;

        db.prepare(`
            UPDATE submissions SET
                oracle_signature = ?, oracle_timestamp = ?, updated_at = ?
            WHERE id = ?
        `).run(data.oracle_signature || null, data.oracle_timestamp || null,
            new Date().toISOString(), id);

        return this.findById(id);
    }

    /**
     * Revoke a certificate
     */
    static revoke(id, reason, adminWallet) {
        const record = this.findById(id);
        if (!record) return null;

        db.prepare(`
            UPDATE submissions SET
                status = 'REVOKED', revoked_at = ?, revoked_by = ?,
                rejection_reason = ?, updated_at = ?
            WHERE id = ?
        `).run(new Date().toISOString(), adminWallet, reason, new Date().toISOString(), id);

        return this.findById(id);
    }

    /**
     * Get aggregate statistics
     */
    static getStats() {
        const total = db.prepare('SELECT COUNT(*) as c FROM submissions').get().c;
        const verified = db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status IN ('VERIFIED','MINTED')").get().c;
        const minted = db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'MINTED'").get().c;
        const rejected = db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'REJECTED'").get().c;

        const avgRow = db.prepare(
            "SELECT AVG(ai_score) as avg FROM submissions WHERE status IN ('VERIFIED','MINTED') AND ai_score IS NOT NULL"
        ).get();
        const avgScore = avgRow.avg ? Math.round(avgRow.avg) : 0;

        const topSkills = db.prepare(`
            SELECT skill, COUNT(*) as count FROM submissions
            WHERE status IN ('VERIFIED','MINTED')
            GROUP BY skill ORDER BY count DESC LIMIT 5
        `).all();

        return {
            total_certificates: total,
            total_verified: verified,
            total_minted: minted,
            total_rejected: rejected,
            average_score: avgScore,
            top_skills: topSkills,
        };
    }

    /**
     * Convert DB row to record format (with aliases for backward compatibility)
     */
    static _rowToRecord(row) {
        if (!row) return null;
        return {
            _db_id: row.id,
            id: row.cert_id,
            cert_id: row.cert_id,
            student_name: row.student_name,
            wallet_address: row.wallet_address,
            github_url: row.github_url,
            repo_url: row.github_url,
            skill: row.skill,
            skill_level: row.skill_level,
            description: row.description,
            issuer: row.issuer,
            ai_score: row.ai_score,
            ai_feedback: row.ai_feedback,
            analysis: row.analysis_json,
            evidence_summary: row.evidence_summary,
            recommendation: row.recommendation,
            plagiarism_score: row.plagiarism_score,
            plagiarism_matches: row.plagiarism_matches,
            evidence_hash: row.evidence_hash,
            evidence_url: row.evidence_url,
            ipfs_url: row.ipfs_url,
            blockchain_asset_id: row.asset_id,
            asset_id: row.asset_id,
            blockchain_tx_id: row.txn_id,
            txn_id: row.txn_id,
            oracle_signature: row.oracle_signature,
            oracle_timestamp: row.oracle_timestamp,
            status: row.status,
            verified: !!row.verified,
            issue_date: row.issue_date,
            created_at: row.created_at,
            verified_at: row.verified_at,
            updated_at: row.updated_at,
        };
    }
}

module.exports = Submission;
