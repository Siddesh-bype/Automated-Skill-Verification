import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { submitEvidence, fetchSkills, type VerificationResult, type SkillOption } from '../services/verification'
import { mintCertificateNFT } from '../services/nft'
import { recordMint } from '../services/verification'
import { useSnackbar } from 'notistack'

interface SubmitEvidenceProps {
    openModal: boolean
    closeModal: () => void
    onCertificateMinted?: (cert: VerificationResult) => void
}

const SubmitEvidence = ({ openModal, closeModal, onCertificateMinted }: SubmitEvidenceProps) => {
    const { activeAddress, transactionSigner } = useWallet()
    const { enqueueSnackbar } = useSnackbar()

    const [skills, setSkills] = useState<SkillOption[]>([])
    const [githubUrl, setGithubUrl] = useState('')
    const [claimedSkill, setClaimedSkill] = useState('')
    const [studentName, setStudentName] = useState('')
    const [description, setDescription] = useState('')

    const [step, setStep] = useState<'form' | 'verifying' | 'result' | 'minting'>('form')
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchSkills().then(setSkills)
    }, [])

    useEffect(() => {
        if (skills.length > 0 && !claimedSkill) {
            setClaimedSkill(skills[0].name)
        }
    }, [skills, claimedSkill])

    const handleSubmit = async () => {
        if (!githubUrl) { enqueueSnackbar('Please enter a GitHub URL', { variant: 'warning' }); return }
        if (!activeAddress) { enqueueSnackbar('Connect your wallet first', { variant: 'warning' }); return }

        setLoading(true)
        setStep('verifying')

        try {
            const res = await submitEvidence({
                github_url: githubUrl,
                claimed_skill: claimedSkill,
                student_name: studentName || 'Anonymous',
                description,
            })
            setResult(res)
            setStep('result')

            if (res.verified) {
                enqueueSnackbar(`Verified! AI Score: ${res.ai_score}/100 — ${res.skill_level}`, { variant: 'success' })
            } else {
                enqueueSnackbar(`Verification failed. Score: ${res.ai_score}/100`, { variant: 'error' })
            }
        } catch (e) {
            enqueueSnackbar((e as Error).message, { variant: 'error' })
            setStep('form')
        } finally {
            setLoading(false)
        }
    }

    const handleMint = async () => {
        if (!result || !activeAddress || !transactionSigner) return

        setStep('minting')
        setLoading(true)

        try {
            const { assetId, txId } = await mintCertificateNFT(
                {
                    recipientName: result.student_name,
                    recipientAddress: activeAddress,
                    skill: result.skill,
                    skillLevel: result.skill_level,
                    aiScore: result.ai_score,
                    evidenceHash: result.evidence_hash || '',
                    issuer: result.issuer,
                    issueDate: result.issue_date,
                    certId: result.id,
                },
                activeAddress,
                transactionSigner,
            )

            // Record the mint in backend
            const updated = await recordMint(result.id, Number(assetId), txId)
            setResult(updated)

            enqueueSnackbar(`Certificate minted! Asset ID: ${assetId}`, { variant: 'success' })
            onCertificateMinted?.(updated)
            resetAndClose()
        } catch (e) {
            enqueueSnackbar(`Minting failed: ${(e as Error).message}`, { variant: 'error' })
            setStep('result')
        } finally {
            setLoading(false)
        }
    }

    const resetAndClose = () => {
        setStep('form')
        setResult(null)
        setGithubUrl('')
        setDescription('')
        closeModal()
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-success'
        if (score >= 45) return 'text-warning'
        return 'text-error'
    }

    return (
        <dialog id="submit_evidence_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <form method="dialog" className="modal-box max-w-2xl">
                <h3 className="font-bold text-2xl mb-4">
                    {step === 'form' && '📝 Submit Evidence for Verification'}
                    {step === 'verifying' && '🔍 AI Verification in Progress...'}
                    {step === 'result' && (result?.verified ? '✅ Verification Passed!' : '❌ Verification Failed')}
                    {step === 'minting' && '⛓️ Minting Certificate NFT...'}
                </h3>

                {/* Form Step */}
                {step === 'form' && (
                    <div className="flex flex-col gap-3">
                        <input
                            className="input input-bordered"
                            placeholder="Your Name"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                        />
                        <select className="select select-bordered w-full" value={claimedSkill} onChange={(e) => setClaimedSkill(e.target.value)}>
                            {skills.map((s) => (
                                <option key={s.name} value={s.name}>
                                    {s.name} ({s.category})
                                </option>
                            ))}
                        </select>
                        <input
                            className="input input-bordered"
                            placeholder="GitHub Repository URL (e.g., https://github.com/user/repo)"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                        />
                        <textarea
                            className="textarea textarea-bordered"
                            placeholder="Brief project description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                )}

                {/* Verifying Step */}
                {step === 'verifying' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-lg">Analyzing code with AI...</p>
                        <p className="text-sm opacity-60">This may take 15-30 seconds</p>
                        <div className="flex gap-2 flex-wrap justify-center mt-2">
                            <span className="badge badge-outline animate-pulse">Code Quality</span>
                            <span className="badge badge-outline animate-pulse">Complexity</span>
                            <span className="badge badge-outline animate-pulse">Best Practices</span>
                            <span className="badge badge-outline animate-pulse">Originality</span>
                        </div>
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && result && (
                    <div className="flex flex-col gap-4">
                        <div className="stats shadow w-full">
                            <div className="stat">
                                <div className="stat-title">AI Score</div>
                                <div className={`stat-value ${getScoreColor(result.ai_score)}`}>{result.ai_score}/100</div>
                                <div className="stat-desc">{result.skill_level}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Skill</div>
                                <div className="stat-value text-lg">{result.skill}</div>
                                <div className="stat-desc">{result.recommendation}</div>
                            </div>
                        </div>

                        {/* Analysis Breakdown */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="text-xs opacity-60">Code Quality</div>
                                <progress className="progress progress-primary w-full" value={result.analysis.code_quality} max="100" />
                                <div className="text-sm font-bold">{result.analysis.code_quality}/100</div>
                            </div>
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="text-xs opacity-60">Complexity</div>
                                <progress className="progress progress-secondary w-full" value={result.analysis.complexity} max="100" />
                                <div className="text-sm font-bold">{result.analysis.complexity}/100</div>
                            </div>
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="text-xs opacity-60">Best Practices</div>
                                <progress className="progress progress-accent w-full" value={result.analysis.best_practices} max="100" />
                                <div className="text-sm font-bold">{result.analysis.best_practices}/100</div>
                            </div>
                            <div className="bg-base-200 rounded-lg p-3">
                                <div className="text-xs opacity-60">Originality</div>
                                <progress className="progress progress-info w-full" value={result.analysis.originality} max="100" />
                                <div className="text-sm font-bold">{result.analysis.originality}/100</div>
                            </div>
                        </div>

                        <p className="text-sm opacity-80">{result.evidence_summary}</p>

                        {/* Strengths & Weaknesses */}
                        {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                            <div className="text-sm">
                                <span className="font-semibold text-success">Strengths:</span>{' '}
                                {result.analysis.strengths.join(' • ')}
                            </div>
                        )}
                        {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                            <div className="text-sm">
                                <span className="font-semibold text-warning">Improvements:</span>{' '}
                                {result.analysis.weaknesses.join(' • ')}
                            </div>
                        )}
                    </div>
                )}

                {/* Minting Step */}
                {step === 'minting' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <span className="loading loading-spinner loading-lg text-success"></span>
                        <p className="text-lg">Minting certificate on Algorand...</p>
                        <p className="text-sm opacity-60">Confirm the transaction in your wallet</p>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action">
                    {step === 'form' && (
                        <>
                            <button className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleSubmit} disabled={loading || !activeAddress}>
                                🔍 Verify with AI
                            </button>
                            <button className="btn" onClick={resetAndClose} disabled={loading}>
                                Cancel
                            </button>
                        </>
                    )}
                    {step === 'result' && result?.verified && (
                        <>
                            <button className="btn btn-success" onClick={handleMint} disabled={loading}>
                                ⛓️ Mint Certificate NFT
                            </button>
                            <button className="btn" onClick={resetAndClose}>
                                Close
                            </button>
                        </>
                    )}
                    {step === 'result' && !result?.verified && (
                        <button className="btn" onClick={resetAndClose}>
                            Close
                        </button>
                    )}
                </div>
            </form>
        </dialog>
    )
}

export default SubmitEvidence
