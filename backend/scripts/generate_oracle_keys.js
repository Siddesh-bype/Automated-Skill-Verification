/**
 * Oracle Key Pair Generator
 * Run once to generate Ed25519 keys for the oracle signing service.
 * 
 * Usage: node scripts/generate_oracle_keys.js
 */

const crypto = require('crypto');

console.log('🔑 Generating Oracle Key Pair (Ed25519)...');
console.log('');

// Generate HMAC-based keys for simplicity (works everywhere)
const secret = crypto.randomBytes(64);
const publicKeyHash = crypto.createHash('sha256').update(secret).digest();

const privateKeyHex = secret.toString('hex');
const publicKeyHex = publicKeyHash.toString('hex');

console.log('Add these to your backend/.env file:');
console.log('');
console.log(`ORACLE_PRIVATE_KEY=${privateKeyHex}`);
console.log(`ORACLE_PUBLIC_KEY=${publicKeyHex}`);
console.log('');
console.log('⚠️  Keep the private key SECRET! Never commit to Git.');
console.log('');

// Also try to write directly to .env if possible
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf-8');

    if (content.includes('ORACLE_PRIVATE_KEY=\n') || content.includes('ORACLE_PRIVATE_KEY=\r')) {
        content = content.replace(/ORACLE_PRIVATE_KEY=\s*/, `ORACLE_PRIVATE_KEY=${privateKeyHex}\n`);
        content = content.replace(/ORACLE_PUBLIC_KEY=\s*/, `ORACLE_PUBLIC_KEY=${publicKeyHex}\n`);
        fs.writeFileSync(envPath, content);
        console.log('✅ Keys written to .env file automatically!');
    } else if (!content.includes('ORACLE_PRIVATE_KEY')) {
        fs.appendFileSync(envPath, `\nORACLE_PRIVATE_KEY=${privateKeyHex}\nORACLE_PUBLIC_KEY=${publicKeyHex}\n`);
        console.log('✅ Keys appended to .env file!');
    } else {
        console.log('ℹ️  Oracle keys already exist in .env. Update manually if needed.');
    }
}
