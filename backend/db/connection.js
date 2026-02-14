/**
 * CertifyMe Database Connection
 * Uses SQLite (better-sqlite3) for zero-config persistent storage.
 * Replaces in-memory Map storage with a real database.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'certifyme.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`✅ Database connected: ${DB_PATH}`);

module.exports = db;
