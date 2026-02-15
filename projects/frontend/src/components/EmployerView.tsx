import { useState } from 'react'
import { verifyCertificate, type VerificationResult } from '../services/verification'

interface EmployerViewProps {
    openModal: boolean
    closeModal: () => void
}

const EmployerView = ({ openModal, closeModal }: EmployerViewProps) => {
    const [assetId, setAssetId] = useState('')
    const [loading, setLoading] = useState(false)
    const [certificate, setCertificate] = useState<VerificationResult | null>(null)
    const [verified, setVerified] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async () => {
        const id = parseInt(assetId)
        if (isNaN(id)) return
        setLoading(true); setSearched(true)
        try { const res = await verifyCertificate(id); setCertificate(res.certificate); setVerified(res.verified) }
        catch { setCertificate(null); setVerified(false) }
        finally { setLoading(false) }
    }

    const getScoreRating = (score: number) => {
        if (score >= 90) return { label: 'Exceptional', color: '#10b981', emoji: '🏆' }
        if (score >= 75) return { label: 'Strong', color: '#10b981', emoji: '⭐' }
        if (score >= 60) return { label: 'Competent', color: '#06b6d4', emoji: '👍' }
        if (score >= 45) return { label: 'Developing', color: '#f59e0b', emoji: '📈' }
        return { label: 'Insufficient', color: '#ef4444', emoji: '⚠️' }
    }

    const reset = () => { setCertificate(null); setAssetId(''); setSearched(false); closeModal() }

    return (
        <dialog id="employer_view_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-2xl">
                <div className="modal-header">
                    <div className="flex items-center justify-between">
                        <h3>Employer Verification Portal</h3>
                        <span className="step-indicator step-indicator-active">👔 Hiring Tool</span>
                    </div>
                    <p>Instantly verify a candidate's skills — enter the certificate Asset ID from their résumé or scan their QR code</p>
                </div>

                <div className="flex gap-2 mb-5">
                    <input className="input input-bordered flex-1" placeholder="Certificate Asset ID" value={assetId} onChange={(e) => setAssetId(e.target.value)} type="number" />
                    <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleSearch} disabled={loading || !assetId}>🔍 Verify</button>
                </div>

                {searched && !loading && !certificate && (
                    <div className="text-center py-6 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div className="text-3xl mb-2">🚫</div>
                        <p className="font-semibold text-adaptive-heading">No certificate found</p>
                        <p className="text-sm text-adaptive-muted">The certificate may not exist or may have been revoked.</p>
                    </div>
                )}

                {certificate && (
                    <div className="flex flex-col gap-4">
                        {/* Big verdict */}
                        <div className={`text-center py-5 rounded-xl`}
                            style={{
                                background: verified ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                                border: `1px solid ${verified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            }}>
                            <div className="text-4xl mb-2">{verified ? '✅' : '❌'}</div>
                            <div className="text-xl font-bold text-adaptive-heading">{verified ? 'SKILL VERIFIED' : 'NOT VERIFIED'}</div>
                            <div className="text-sm text-adaptive-muted">
                                {verified ? "This candidate's skill has been verified by AI analysis" : 'This certificate could not be verified'}
                            </div>
                        </div>

                        {/* Candidate summary */}
                        <div className="p-5 rounded-xl" style={{ background: 'var(--step-gradient)', border: '1px solid var(--step-border)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-lg font-bold text-adaptive-heading">{certificate.student_name}</div>
                                    <div className="text-sm text-adaptive-muted">{certificate.skill} — {certificate.skill_level}</div>
                                </div>
                                <div className="text-center">
                                    {(() => {
                                        const rating = getScoreRating(certificate.ai_score)
                                        return (
                                            <>
                                                <div className="text-2xl">{rating.emoji}</div>
                                                <div className="text-2xl font-bold" style={{ color: rating.color }}>{certificate.ai_score}</div>
                                                <div className="text-xs text-adaptive-muted">{rating.label}</div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Quality', value: certificate.analysis.code_quality, cls: 'progress-bar-indigo' },
                                    { label: 'Complexity', value: certificate.analysis.complexity, cls: 'progress-bar-cyan' },
                                    { label: 'Practices', value: certificate.analysis.best_practices, cls: 'progress-bar-emerald' },
                                    { label: 'Originality', value: certificate.analysis.originality, cls: 'progress-bar-violet' },
                                ].map((m) => (
                                    <div key={m.label} className="text-center">
                                        <div className="font-bold text-sm text-adaptive-heading mb-1">{m.value}</div>
                                        <div className="progress-bar-container mb-1">
                                            <div className={`progress-bar-fill ${m.cls}`} style={{ width: `${m.value}%` }} />
                                        </div>
                                        <div className="text-[10px] text-adaptive-muted">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex gap-2 flex-wrap">
                            {certificate.github_url && (
                                <a href={certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline flex-1">📂 View Code</a>
                            )}
                            {certificate.blockchain_asset_id && (
                                <a href={`https://testnet.explorer.perawallet.app/asset/${certificate.blockchain_asset_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline flex-1">⛓️ Blockchain Proof</a>
                            )}
                        </div>

                        <div className="text-xs text-center text-adaptive-muted" style={{ opacity: 0.6 }}>
                            Issued by {certificate.issuer} on {new Date(certificate.issue_date).toLocaleDateString()}
                        </div>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn" onClick={reset}>Close</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={reset}></div>
        </dialog>
    )
}

export default EmployerView
