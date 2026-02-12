/**
 * Backend IPFS Service
 * Handles uploading evidence and certificate metadata to Pinata IPFS.
 */

const axios = require('axios');

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload JSON metadata to IPFS via Pinata
 */
async function pinJSONToIPFS(jsonData) {
    if (!PINATA_JWT) throw new Error('Missing PINATA_JWT environment variable');

    const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        jsonData,
        {
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return res.data;
}

/**
 * Upload a file buffer to IPFS via Pinata
 */
async function pinFileToIPFS(fileBuffer, fileName) {
    if (!PINATA_JWT) throw new Error('Missing PINATA_JWT environment variable');

    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName });

    const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        form,
        {
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
        }
    );
    return res.data;
}

/**
 * Build a full IPFS HTTP URL from a CID
 */
function ipfsUrl(cid) {
    return `${PINATA_GATEWAY}/${cid}`;
}

/**
 * Upload certificate metadata in ARC-19 format to IPFS
 */
async function uploadCertificateMetadata(certData) {
    const metadata = {
        standard: 'arc19',
        name: `CertifyMe Certificate - ${certData.skill}`,
        description: `Verified ${certData.skill} skill at ${certData.skillLevel} level`,
        image: certData.imageUrl || '',
        properties: {
            recipient: certData.recipient,
            skill: certData.skill,
            skill_level: certData.skillLevel,
            ai_verification_score: certData.aiScore,
            evidence_hash: certData.evidenceHash,
            issuer: certData.issuer,
            issue_date: certData.issueDate,
            verification_url: certData.verificationUrl || '',
        },
    };

    const result = await pinJSONToIPFS(metadata);
    return {
        ipfsHash: result.IpfsHash,
        metadataUrl: ipfsUrl(result.IpfsHash),
        metadata,
    };
}

module.exports = { pinJSONToIPFS, pinFileToIPFS, ipfsUrl, uploadCertificateMetadata };
