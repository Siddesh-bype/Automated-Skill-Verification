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
        blockchain_proof: {
            asset_id: number
            on_chain: boolean
            creator?: string
            name?: string
            url?: string
        }
    } | null>(null)

    const handleVerify = async () => {
        const id = parseInt(assetIdInput)
        if (isNaN(id)) return

        setLoading(true)
        try {
            const res = await verifyCertificate(id)
            setResult(res)
        } catch (e) {
            setResult({ verified: false, certificate: null, blockchain_proof: { asset_id: id, on_chain: false } })
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setResult(null)
        setAssetIdInput('')
        closeModal()
    }

    return (
        <dialog id="verify_credential_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-2xl mb-4">🔍 Verify Certificate</h3>

                {!result ? (
                    <>
                        <p className="text-sm opacity-70 mb-4">
                            Enter the blockchain Asset ID to verify a CertifyMe certificate. This can be found on the certificate QR code or shared link.
                        </p>
                        <div className="flex gap-2">
                            <input
                                className="input input-bordered flex-1"
                                placeholder="Blockchain Asset ID (e.g., 123456789)"
                                value={assetIdInput}
                                onChange={(e) => setAssetIdInput(e.target.value)}
                                type="number"
                            />
                            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleVerify} disabled={loading || !assetIdInput}>
                                Verify
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Verification Status */}
                        <div className={`alert ${result.verified ? 'alert-success' : 'alert-error'}`}>
                            <span className="text-lg font-bold">
                                {result.verified ? '✅ VERIFIED — This certificate is authentic' : '❌ NOT VERIFIED — Certificate not found or revoked'}
                            </span>
                        </div>

                        {result.certificate && (
                            <>
                                {/* Certificate Details */}
                                <div className="bg-base-200 rounded-xl p-4">
                                    <h4 className="font-bold text-lg mb-2">Certificate Details</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="opacity-60">Skill:</span>
                                            <div className="font-bold">{result.certificate.skill}</div>
                                        </div>
                                        <div>
                                            <span className="opacity-60">Level:</span>
                                            <div className="font-bold">{result.certificate.skill_level}</div>
                                        </div>
                                        <div>
                                            <span className="opacity-60">Holder:</span>
                                            <div className="font-bold">{result.certificate.student_name}</div>
                                        </div>
                                        <div>
                                            <span className="opacity-60">AI Score:</span>
                                            <div className={`font-bold ${result.certificate.ai_score >= 75 ? 'text-success' : result.certificate.ai_score >= 45 ? 'text-warning' : 'text-error'}`}>
                                                {result.certificate.ai_score}/100
                                            </div>
                                        </div>
                                        <div>
                                            <span className="opacity-60">Issuer:</span>
                                            <div className="font-bold">{result.certificate.issuer}</div>
                                        </div>
                                        <div>
                                            <span className="opacity-60">Issue Date:</span>
                                            <div className="font-bold">{new Date(result.certificate.issue_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence Links */}
                                <div className="bg-base-200 rounded-xl p-4">
                                    <h4 className="font-bold text-lg mb-2">Evidence</h4>
                                    <div className="flex flex-col gap-2">
                                        {result.certificate.github_url && (
                                            <a href={result.certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                                📂 View Code Repository
                                            </a>
                                        )}
                                        {result.certificate.evidence_url && (
                                            <a href={result.certificate.evidence_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                                                📋 View AI Analysis Report
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Analysis Breakdown */}
                                <div className="bg-base-200 rounded-xl p-4">
                                    <h4 className="font-bold text-lg mb-2">AI Analysis</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs opacity-60">Code Quality</div>
                                            <progress className="progress progress-primary w-full" value={result.certificate.analysis.code_quality} max="100" />
                                            <span className="text-sm font-bold">{result.certificate.analysis.code_quality}/100</span>
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-60">Complexity</div>
                                            <progress className="progress progress-secondary w-full" value={result.certificate.analysis.complexity} max="100" />
                                            <span className="text-sm font-bold">{result.certificate.analysis.complexity}/100</span>
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-60">Best Practices</div>
                                            <progress className="progress progress-accent w-full" value={result.certificate.analysis.best_practices} max="100" />
                                            <span className="text-sm font-bold">{result.certificate.analysis.best_practices}/100</span>
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-60">Originality</div>
                                            <progress className="progress progress-info w-full" value={result.certificate.analysis.originality} max="100" />
                                            <span className="text-sm font-bold">{result.certificate.analysis.originality}/100</span>
                                        </div>
                                    </div>
                                    {result.certificate.evidence_summary && (
                                        <p className="text-sm mt-3 opacity-80">{result.certificate.evidence_summary}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Blockchain Proof */}
                        <div className="bg-base-200 rounded-xl p-4">
                            <h4 className="font-bold text-lg mb-2">Blockchain Proof</h4>
                            <div className="text-sm">
                                <div className="flex justify-between">
                                    <span className="opacity-60">Asset ID:</span>
                                    <span className="font-mono">{result.blockchain_proof.asset_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60">On-Chain:</span>
                                    <span>{result.blockchain_proof.on_chain ? '✅ Yes' : '❌ No'}</span>
                                </div>
                                {result.blockchain_proof.creator && (
                                    <div className="flex justify-between">
                                        <span className="opacity-60">Creator:</span>
                                        <span className="font-mono text-xs">{result.blockchain_proof.creator.substring(0, 12)}...</span>
                                    </div>
                                )}
                                <a
                                    href={`https://testnet.explorer.perawallet.app/asset/${result.blockchain_proof.asset_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline w-full mt-2"
                                >
                                    🔗 View on Algorand Explorer
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-action">
                    <button className="btn" onClick={reset}>
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default VerifyCredential
