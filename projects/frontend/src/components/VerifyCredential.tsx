import { useState } from 'react'
import { verifyCertificate, type VerificationResult } from '../services/verification'

interface VerifyCredentialProps {
    openModal: boolean
    closeModal: () => void
    initialAssetId?: number | null
}

const VerifyCredential = ({ openModal, closeModal, initialAssetId }: VerifyCredentialProps) => {
    const [assetIdInput, setAssetIdInput] = useState(initialAssetId?.toString() || '')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        verified: boolean
        certificate: VerificationResult | null
        blockchain_proof: { asset_id: number; on_chain: boolean; creator?: string; name?: string; url?: string }
    } | null>(null)

    const handleVerify = async () => {
        const id = parseInt(assetIdInput)
        if (isNaN(id)) return
        setLoading(true)
        try { const res = await verifyCertificate(id); setResult(res) }
        catch { setResult({ verified: false, certificate: null, blockchain_proof: { asset_id: id, on_chain: false } }) }
        finally { setLoading(false) }
    }

    const reset = () => { setResult(null); setAssetIdInput(''); closeModal() }

    return (
        <dialog id="verify_credential_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-2xl">
                <div className="modal-header">
                    <div className="flex items-center justify-between">
                        <h3>Verify Certificate</h3>
                        <span className="step-indicator step-indicator-active">
                            {result ? (result.verified ? '✅ Authentic' : '❌ Not Found') : '🔍 Search'}
                        </span>
                    </div>
                    <p>Enter a blockchain Asset ID to verify any CertifyMe certificate instantly</p>
                </div>

                {!result ? (
                    <>
                        <div className="flex gap-2">
                            <input className="input input-bordered flex-1" placeholder="Blockchain Asset ID (e.g., 123456789)" value={assetIdInput} onChange={(e) => setAssetIdInput(e.target.value)} type="number" />
                            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleVerify} disabled={loading || !assetIdInput}>Verify</button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Verdict Banner */}
                        <div className={`text-center py-5 rounded-xl ${result.verified ? 'bg-success/10' : 'bg-error/10'}`}
                            style={{ border: `1px solid ${result.verified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                            <div className="text-4xl mb-2">{result.verified ? '✅' : '❌'}</div>
                            <div className="text-xl font-bold text-adaptive-heading">{result.verified ? 'VERIFIED — Authentic Certificate' : 'NOT VERIFIED'}</div>
                            <div className="text-sm text-adaptive-muted">
                                {result.verified ? 'This credential is blockchain-verified and authentic' : 'Certificate not found or has been revoked'}
                            </div>
                        </div>

                        {result.certificate && (
                            <>
                                {/* Details */}
                                <div className="p-4 rounded-xl" style={{ background: 'var(--step-gradient)', border: '1px solid var(--step-border)' }}>
                                    <h4 className="font-bold text-base mb-3 text-adaptive-heading">Certificate Details</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {[
                                            { label: 'Skill', value: result.certificate.skill },
                                            { label: 'Level', value: result.certificate.skill_level },
                                            { label: 'Holder', value: result.certificate.student_name },
                                            { label: 'AI Score', value: `${result.certificate.ai_score}/100`, color: result.certificate.ai_score >= 75 ? '#10b981' : result.certificate.ai_score >= 45 ? '#f59e0b' : '#ef4444' },
                                            { label: 'Issuer', value: result.certificate.issuer },
                                            { label: 'Issue Date', value: new Date(result.certificate.issue_date).toLocaleDateString() },
                                        ].map((item) => (
                                            <div key={item.label}>
                                                <span className="text-adaptive-muted text-xs">{item.label}</span>
                                                <div className="font-bold text-adaptive-heading" style={item.color ? { color: item.color } : {}}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Evidence Links */}
                                <div className="flex gap-2 flex-wrap">
                                    {result.certificate.github_url && (
                                        <a href={result.certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline flex-1">📂 View Code Repository</a>
                                    )}
                                    {result.certificate.evidence_url && (
                                        <a href={result.certificate.evidence_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline flex-1">📋 View AI Analysis Report</a>
                                    )}
                                </div>

                                {/* Analysis */}
                                <div className="p-4 rounded-xl" style={{ background: 'var(--step-gradient)', border: '1px solid var(--step-border)' }}>
                                    <h4 className="font-bold text-base mb-3 text-adaptive-heading">AI Analysis</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Code Quality', value: result.certificate.analysis.code_quality, cls: 'progress-bar-indigo', icon: '🔮' },
                                            { label: 'Complexity', value: result.certificate.analysis.complexity, cls: 'progress-bar-cyan', icon: '⚡' },
                                            { label: 'Best Practices', value: result.certificate.analysis.best_practices, cls: 'progress-bar-emerald', icon: '✨' },
                                            { label: 'Originality', value: result.certificate.analysis.originality, cls: 'progress-bar-violet', icon: '🧬' },
                                        ].map((m) => (
                                            <div key={m.label} className="analysis-metric">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-adaptive-muted">{m.icon} {m.label}</span>
                                                    <span className="text-sm font-bold text-adaptive-heading">{m.value}</span>
                                                </div>
                                                <div className="progress-bar-container">
                                                    <div className={`progress-bar-fill ${m.cls}`} style={{ width: `${m.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {result.certificate.evidence_summary && (
                                        <p className="text-sm mt-3 text-adaptive-body leading-relaxed">{result.certificate.evidence_summary}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Blockchain Proof */}
                        <div className="p-4 rounded-xl" style={{ background: 'var(--step-gradient)', border: '1px solid var(--step-border)' }}>
                            <h4 className="font-bold text-base mb-2 text-adaptive-heading">Blockchain Proof</h4>
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between"><span className="text-adaptive-muted">Asset ID</span><span className="font-mono text-adaptive-heading">{result.blockchain_proof.asset_id}</span></div>
                                <div className="flex justify-between"><span className="text-adaptive-muted">On-Chain</span><span>{result.blockchain_proof.on_chain ? '✅ Yes' : '❌ No'}</span></div>
                                {result.blockchain_proof.creator && (
                                    <div className="flex justify-between"><span className="text-adaptive-muted">Creator</span><span className="font-mono text-xs text-adaptive-heading">{result.blockchain_proof.creator.substring(0, 12)}…</span></div>
                                )}
                            </div>
                            <a href={`https://testnet.explorer.perawallet.app/asset/${result.blockchain_proof.asset_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline w-full mt-3">🔗 View on Algorand Explorer</a>
                        </div>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn" onClick={reset}>Close</button>
                </div>
            </div>
        </dialog>
    )
}

export default VerifyCredential
