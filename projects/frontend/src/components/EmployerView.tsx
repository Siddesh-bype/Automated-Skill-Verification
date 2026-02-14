import { useState } from 'react'
import { verifyCertificate, type VerificationResult } from '../services/verification'
import BatchVerification from './BatchVerification'
import RevocationFeed from './RevocationFeed'

interface EmployerViewProps {
    openModal: boolean
    closeModal: () => void
}

type TabType = 'single' | 'batch' | 'revocations'

const EmployerView = ({ openModal, closeModal }: EmployerViewProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('single')
    const [assetId, setAssetId] = useState('')
    const [loading, setLoading] = useState(false)
    const [certificate, setCertificate] = useState<VerificationResult | null>(null)
    const [verified, setVerified] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async () => {
        const id = parseInt(assetId)
        if (isNaN(id)) return

        setLoading(true)
        setSearched(true)
        try {
            const res = await verifyCertificate(id)
            setCertificate(res.certificate)
            setVerified(res.verified)
        } catch {
            setCertificate(null)
            setVerified(false)
        } finally {
            setLoading(false)
        }
    }

    const getScoreRating = (score: number) => {
        if (score >= 90) return { label: 'Exceptional', color: 'text-success', emoji: '🏆' }
        if (score >= 75) return { label: 'Strong', color: 'text-success', emoji: '⭐' }
        if (score >= 60) return { label: 'Competent', color: 'text-info', emoji: '👍' }
        if (score >= 45) return { label: 'Developing', color: 'text-warning', emoji: '📈' }
        return { label: 'Insufficient', color: 'text-error', emoji: '⚠️' }
    }

    const reset = () => {
        setCertificate(null)
        setAssetId('')
        setSearched(false)
        closeModal()
    }

    return (
        <dialog id="employer_view_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-2xl mb-2">👔 Employer Verification Portal</h3>
                <p className="text-sm opacity-70 mb-4">
                    Verify candidate skills, run batch checks, and monitor revocations.
                </p>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-4 bg-base-200">
                    <button
                        className={`tab ${activeTab === 'single' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('single')}
                    >
                        🔍 Single Verify
                    </button>
                    <button
                        className={`tab ${activeTab === 'batch' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('batch')}
                    >
                        📋 Batch Verify
                    </button>
                    <button
                        className={`tab ${activeTab === 'revocations' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('revocations')}
                    >
                        🚨 Revocations
                    </button>
                </div>

                {/* Single Verification Tab */}
                {activeTab === 'single' && (
                    <>
                        <div className="flex gap-2 mb-4">
                            <input
                                className="input input-bordered flex-1"
                                placeholder="Certificate Asset ID"
                                value={assetId}
                                onChange={(e) => setAssetId(e.target.value)}
                                type="number"
                            />
                            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleSearch} disabled={loading || !assetId}>
                                🔍 Verify
                            </button>
                        </div>

                        {searched && !loading && !certificate && (
                            <div className="alert alert-error">
                                <span>No certificate found for this Asset ID. The certificate may not exist or may have been revoked.</span>
                            </div>
                        )}

                        {certificate && (
                            <div className="flex flex-col gap-3">
                                {/* Big verdict banner */}
                                <div className={`text-center py-4 rounded-xl ${verified ? 'bg-success/20' : 'bg-error/20'}`}>
                                    <div className="text-4xl mb-1">{verified ? '✅' : '❌'}</div>
                                    <div className="text-xl font-bold">{verified ? 'SKILL VERIFIED' : 'NOT VERIFIED'}</div>
                                    <div className="text-sm opacity-70">
                                        {verified ? 'This candidate\'s skill has been verified by AI analysis' : 'This certificate could not be verified'}
                                    </div>
                                </div>

                                {/* Quick summary for employer */}
                                <div className="bg-base-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="text-lg font-bold">{certificate.student_name}</div>
                                            <div className="text-sm opacity-70">{certificate.skill} — {certificate.skill_level}</div>
                                        </div>
                                        <div className="text-center">
                                            {(() => {
                                                const rating = getScoreRating(certificate.ai_score)
                                                return (
                                                    <>
                                                        <div className="text-2xl">{rating.emoji}</div>
                                                        <div className={`text-2xl font-bold ${rating.color}`}>{certificate.ai_score}</div>
                                                        <div className="text-xs opacity-60">{rating.label}</div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div>
                                            <div className="font-bold">{certificate.analysis.code_quality}</div>
                                            <div className="opacity-50">Quality</div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{certificate.analysis.complexity}</div>
                                            <div className="opacity-50">Complexity</div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{certificate.analysis.best_practices}</div>
                                            <div className="opacity-50">Practices</div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{certificate.analysis.originality}</div>
                                            <div className="opacity-50">Originality</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence links */}
                                <div className="flex gap-2 flex-wrap">
                                    {certificate.github_url && (
                                        <a href={certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline flex-1">
                                            📂 View Code
                                        </a>
                                    )}
                                    {certificate.blockchain_asset_id && (
                                        <a
                                            href={`https://testnet.explorer.perawallet.app/asset/${certificate.blockchain_asset_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline flex-1"
                                        >
                                            ⛓️ Blockchain Proof
                                        </a>
                                    )}
                                </div>

                                <div className="text-xs text-center opacity-50">
                                    Issued by {certificate.issuer} on {new Date(certificate.issue_date).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Batch Verification Tab */}
                {activeTab === 'batch' && <BatchVerification />}

                {/* Revocation Feed Tab */}
                {activeTab === 'revocations' && <RevocationFeed />}

                <div className="modal-action">
                    <button className="btn" onClick={reset}>
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default EmployerView
