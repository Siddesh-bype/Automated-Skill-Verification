/**
 * Verification Service
 * Calls the backend API for evidence submission and certificate verification.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export interface VerificationResult {
    id: string
    verified: boolean
    ai_score: number
    skill_level: string
    skill: string
    student_name: string
    github_url: string
    issuer: string
    evidence_hash: string | null
    evidence_url: string | null
    analysis: {
        code_quality: number
        complexity: number
        best_practices: number
        originality: number
        strengths?: string[]
        weaknesses?: string[]
    }
    recommendation: string
    evidence_summary: string
    blockchain_asset_id: number | null
    blockchain_tx_id: string | null
    issue_date: string
    status: string
}

export interface SkillOption {
    name: string
    category: string
    min_score: number
}

/**
 * Submit evidence for AI verification
 */
export async function submitEvidence(data: {
    github_url: string
    claimed_skill: string
    student_name?: string
    description?: string
    issuer?: string
}): Promise<VerificationResult> {
    const res = await fetch(`${BACKEND_URL}/api/certificates/submit-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Request failed (${res.status})`)
    }

    return res.json()
}

/**
 * Record an on-chain NFT mint against a certificate
 */
export async function recordMint(certId: string, assetId: number, txId: string): Promise<VerificationResult> {
    const res = await fetch(`${BACKEND_URL}/api/certificates/record-mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cert_id: certId, asset_id: assetId, tx_id: txId }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Request failed (${res.status})`)
    }

    return res.json()
}

/**
 * Fetch all certificates from backend
 */
export async function fetchCertificates(status?: string): Promise<VerificationResult[]> {
    const params = status ? `?status=${status}` : ''
    const res = await fetch(`${BACKEND_URL}/api/certificates${params}`)
    if (!res.ok) return []
    return res.json()
}

/**
 * Fetch single certificate by ID
 */
export async function fetchCertificate(id: string): Promise<VerificationResult | null> {
    const res = await fetch(`${BACKEND_URL}/api/certificates/${id}`)
    if (!res.ok) return null
    return res.json()
}

/**
 * Public verification for employers — verify by blockchain asset ID
 */
export async function verifyCertificate(assetId: number): Promise<{
    verified: boolean
    certificate: VerificationResult | null
    blockchain_proof: {
        asset_id: number
        on_chain: boolean
        creator?: string
        name?: string
        url?: string
    }
}> {
    const res = await fetch(`${BACKEND_URL}/api/certificates/verify/${assetId}`)
    if (!res.ok) {
        return { verified: false, certificate: null, blockchain_proof: { asset_id: assetId, on_chain: false } }
    }
    return res.json()
}

/**
 * Fetch available skills for the dropdown
 */
export async function fetchSkills(): Promise<SkillOption[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/skills`)
        if (!res.ok) throw new Error('Failed')
        return res.json()
    } catch {
        // Fallback if backend is down
        return [
            { name: 'React Development', category: 'Frontend', min_score: 45 },
            { name: 'Python Backend', category: 'Backend', min_score: 45 },
            { name: 'Machine Learning', category: 'AI/ML', min_score: 50 },
            { name: 'Full Stack Development', category: 'Full Stack', min_score: 45 },
            { name: 'Blockchain Development', category: 'Web3', min_score: 50 },
            { name: 'UI/UX Design', category: 'Design', min_score: 45 },
            { name: 'Data Structures & Algorithms', category: 'CS Fundamentals', min_score: 50 },
            { name: 'Mobile Development', category: 'Mobile', min_score: 45 },
        ]
    }
}
