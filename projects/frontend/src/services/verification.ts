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
    chain_name?: string
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

/**
 * Batch verify multiple certificates at once
 */
export async function batchVerify(assetIds: number[]): Promise<{
    results: Array<{
        asset_id: number
        valid: boolean
        error?: string
        certificate?: {
            cert_id: string
            student_name: string
            skill: string
            ai_score: number
            status: string
            chain_name: string
            issue_date: string
            revoked: boolean
        }
        on_chain_verified: boolean
    }>
    summary: { total: number; valid: number; invalid: number; revoked: number }
}> {
    const res = await fetch(`${BACKEND_URL}/api/verification/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_ids: assetIds }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Batch verification failed (${res.status})`)
    }
    return res.json()
}

/**
 * Fetch portfolio for a wallet address
 */
export async function fetchPortfolio(wallet: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/portfolio/${encodeURIComponent(wallet)}`)
    if (!res.ok) return null
    return res.json()
}

/**
 * Create or update a portfolio
 */
export async function updatePortfolio(data: {
    wallet_address: string
    display_name?: string
    bio?: string
    github_url?: string
    linkedin_url?: string
}): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Portfolio update failed')
    return res.json()
}

/**
 * Create a share link for a certificate
 */
export async function createShareLink(certId: string, expiresIn: string = '24h', sharedVia: string = 'link'): Promise<{
    share_token: string
    expires_at: string
    share_url: string
    certificate_summary: any
}> {
    const res = await fetch(`${BACKEND_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cert_id: certId, shared_via: sharedVia, expires_in: expiresIn }),
    })
    if (!res.ok) throw new Error('Share link creation failed')
    return res.json()
}

/**
 * Fetch revocation feed
 */
export async function fetchRevocations(since?: string): Promise<{
    events: Array<{
        id: number
        cert_id: string
        asset_id: number | null
        skill: string
        student_name: string
        revoked_by: string
        reason: string
        chain_name: string
        created_at: string
    }>
    total: number
}> {
    const params = since ? `?since=${encodeURIComponent(since)}` : ''
    const res = await fetch(`${BACKEND_URL}/api/certificates/revocations${params}`)
    if (!res.ok) return { events: [], total: 0 }
    return res.json()
}

/**
 * Fetch supported chains
 */
export async function fetchChains(): Promise<Array<{
    id: string
    name: string
    symbol: string
    color: string
    icon: string
    isReal: boolean
}>> {
    try {
        const res = await fetch(`${BACKEND_URL}/api/verification/chains`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        return data.chains
    } catch {
        return [
            { id: 'algorand', name: 'Algorand', symbol: 'ALGO', color: '#00ADB5', icon: '🟢', isReal: true },
            { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: '🔷', isReal: false },
            { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: '🟣', isReal: false },
        ]
    }
}
