import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { submitEvidence, fetchSkills, recordMint, type VerificationResult, type SkillOption } from '../services/verification'
import { mintCertificateNFT } from '../services/nft'
import { useSnackbar } from 'notistack'
import AnimatedCheck from './AnimatedCheck'

interface SubmitEvidenceProps {
    openModal: boolean
    closeModal: () => void
    onCertificateMinted?: (cert: VerificationResult) => void
}

/* ── Score Ring SVG ── */
const ScoreRing = ({ score, size = 100 }: { score: number; size?: number }) => {
    const radius = (size - 12) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 75 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'

    return (
        <div className="score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="rgba(148,163,184,0.08)" strokeWidth="8" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }} />
            </svg>
            <div className="score-ring-label">
                <span className="text-2xl font-bold" style={{ color }}>{score}</span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--section-desc)' }}>/100</span>
            </div>
        </div>
    )
}

/* ── Analysis Bar ── */
const AnalysisBar = ({ label, value, colorClass, icon }: { label: string; value: number; colorClass: string; icon: string }) => (
    <div className="analysis-metric">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--section-desc)' }}>
                <span>{icon}</span> {label}
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--section-title)' }}>{value}</span>
        </div>
        <div className="progress-bar-container">
            <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${value}%` }} />
        </div>
    </div>
)

/* ── Verifying Animation ── */
const VerifyingStep = () => (
    <div className="flex flex-col items-center gap-5 py-8">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-accent-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <div className="flex flex-col items-center gap-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--section-title)' }}>Analyzing Codebase</h3>
            <p className="text-sm" style={{ color: 'var(--section-desc)' }}>Checking 4 dimensions of quality...</p>
        </div>
    </div>
)

/* ── Minting Animation ── */
const MintingStep = () => (
    <div className="flex flex-col items-center gap-5 py-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-brand-500/30 animate-spin-slow" />
            <div className="absolute inset-0 bg-brand-500/5 rounded-xl animate-pulse" />
            <span className="text-3xl animate-bounce">⛓️</span>
        </div>
        <div className="flex flex-col items-center gap-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--section-title)' }}>Minting NFT</h3>
            <p className="text-sm" style={{ color: 'var(--section-desc)' }}>Anchoring certificate on Algorand...</p>
        </div>
    </div>
)

const SubmitEvidence = ({ openModal, closeModal, onCertificateMinted }: SubmitEvidenceProps) => {
    const { activeAddress, transactionSigner } = useWallet()
    const { enqueueSnackbar } = useSnackbar()

    const [step, setStep] = useState<'form' | 'verifying' | 'result' | 'minting'>('form')
    const [loading, setLoading] = useState(false)
    const [skillsLoading, setSkillsLoading] = useState(true)

    const [studentName, setStudentName] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [description, setDescription] = useState('')
    const [claimedSkill, setClaimedSkill] = useState('')
    const [skills, setSkills] = useState<SkillOption[]>([])

    const [result, setResult] = useState<VerificationResult | null>(null)

    useEffect(() => {
        if (openModal) {
            setStep('form')
            setResult(null)
            const loadSkills = async () => {
                setSkillsLoading(true)
                try {
                    const data = await fetchSkills()
                    setSkills(data)
                    if (data.length > 0) setClaimedSkill(data[0].name)
                } catch (error) {
                    console.error("Failed to load skills", error)
                } finally {
                    setSkillsLoading(false)
                }
            }
            loadSkills()
        }
    }, [openModal])

    const handleSubmit = async () => {
        if (!studentName || !githubUrl || !claimedSkill) {
            enqueueSnackbar('Please fill in all required fields', { variant: 'warning' })
            return
        }

        setStep('verifying')
        setLoading(true)

        try {
            // Artificial delay for UX if verification is too fast
            const minTime = new Promise(resolve => setTimeout(resolve, 2000))
            const verificationPromise = submitEvidence({
                student_name: studentName,
                github_url: githubUrl,
                skill: claimedSkill,
                description,
                wallet_address: activeAddress || ''
            })

            const [res] = await Promise.all([verificationPromise, minTime])
            setResult(res)
            setStep('result')

            if (res.verified) {
                enqueueSnackbar('Verification successful! Code quality meets standards.', { variant: 'success' })
            } else {
                enqueueSnackbar('Verification failed. Code did not meet quality threshold.', { variant: 'warning' })
            }
        } catch (error) {
            console.error(error)
            enqueueSnackbar('Verification failed: ' + (error as Error).message, { variant: 'error' })
            setStep('form')
        } finally {
            setLoading(false)
        }
    }

    const handleMint = async () => {
        if (!result || !activeAddress) return

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
                    certId: result.id
                },
                activeAddress,
                transactionSigner
            )

            const updated = await recordMint(result.id, Number(assetId), txId)
            setResult(updated)
            enqueueSnackbar(`Certificate minted! Asset ID: ${assetId}`, { variant: 'success' })
            onCertificateMinted?.(updated)

            // Wait a moment before closing to show success state if desired, or just close
            setTimeout(() => {
                closeModal()
                // Reset form state for next time
                setGithubUrl('')
                setDescription('')
            }, 1000)

        } catch (e) {
            console.error(e)
            enqueueSnackbar(`Minting failed: ${(e as Error).message}`, { variant: 'error' })
            setStep('result')
        } finally {
            setLoading(false)
        }
    }

    const resetAndClose = () => {
        closeModal()
        // Optional: reset state
        setTimeout(() => {
            setStep('form')
            setResult(null)
        }, 300)
    }

    const getLevelEmoji = (level: string) => {
        if (!level) return '❓'
        if (level.includes('Expert')) return '🏆'
        if (level.includes('Advanced')) return '⭐'
        if (level.includes('Intermediate')) return '📘'
        if (level.includes('Beginner')) return '🌱'
        return '❌'
    }

    if (!openModal) return null

    return (
        <dialog id="submit_evidence_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-2xl">
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center justify-between">
                        <h3>
                            {step === 'form' && 'Submit Evidence'}
                            {step === 'verifying' && 'AI Verification'}
                            {step === 'result' && (result?.verified ? 'Verification Passed' : 'Verification Failed')}
                            {step === 'minting' && 'Minting Certificate'}
                        </h3>
                        <span className={`step-indicator ${step === 'form' ? 'step-indicator-active' :
                                step === 'verifying' ? 'step-indicator-active' :
                                    step === 'result' ? (result?.verified ? 'step-indicator-done' : 'step-indicator-error') :
                                        'step-indicator-active'
                            }`}>
                            {step === 'form' && '📝 Step 1 of 3'}
                            {step === 'verifying' && '🔍 Analyzing'}
                            {step === 'result' && (result?.verified ? '✅ Verified' : '❌ Failed')}
                            {step === 'minting' && '⛓️ Minting'}
                        </span>
                    </div>
                    <p>
                        {step === 'form' && 'Submit your GitHub repository for automated analysis.'}
                        {step === 'verifying' && 'Analyzing code quality across 4 dimensions.'}
                        {step === 'result' && (result?.verified ? 'Great job! You can now mint your certificate.' : 'Code did not meet the required threshold.')}
                        {step === 'minting' && 'Creating your verifiable credential on Algorand.'}
                    </p>
                </div>

                {/* Form */}
                {step === 'form' && (
                    <div className="flex flex-col gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Your Name</span></label>
                            <input className="input input-bordered" placeholder="e.g., Siddesh Bype" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Skill to Verify</span></label>
                            {skillsLoading ? (
                                <div className="flex items-center gap-2 p-3 rounded-lg border border-base-200 bg-base-100/50">
                                    <span className="loading loading-spinner loading-xs text-brand-500" />
                                    <span className="text-sm opacity-60">Loading skills...</span>
                                </div>
                            ) : (
                                <select className="select select-bordered w-full" value={claimedSkill} onChange={(e) => setClaimedSkill(e.target.value)}>
                                    {skills.map((s) => (
                                        <option key={s.name} value={s.name}>{s.name} ({s.category})</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">GitHub Repository URL</span></label>
                            <input className="input input-bordered" placeholder="https://github.com/username/project" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Project Description <span className="text-sm opacity-60">(optional)</span></span></label>
                            <textarea className="textarea textarea-bordered" placeholder="Briefly describe what this project demonstrates..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                        </div>
                    </div>
                )}

                {step === 'verifying' && <VerifyingStep />}

                {/* Result */}
                {step === 'result' && result && (
                    <div className="flex flex-col gap-4">
                        {result.verified && (
                            <div className="flex justify-center -mt-2 mb-2">
                                <AnimatedCheck size={80} />
                            </div>
                        )}

                        <div className="flex items-center gap-6 p-5 rounded-xl border border-base-200 bg-base-100/50">
                            <ScoreRing score={result.ai_score} size={90} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl">{getLevelEmoji(result.skill_level)}</span>
                                    <span className="text-lg font-bold">{result.skill_level}</span>
                                </div>
                                <p className="text-sm opacity-80">{result.skill}</p>
                                <p className="text-xs mt-2 opacity-60">
                                    {result.verified ? '✅ Eligible for certification' : '❌ Below threshold'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <AnalysisBar label="Code Quality" value={result.analysis.code_quality} colorClass="progress-bar-indigo" icon="🔮" />
                            <AnalysisBar label="Complexity" value={result.analysis.complexity} colorClass="progress-bar-cyan" icon="⚡" />
                            <AnalysisBar label="Best Practices" value={result.analysis.best_practices} colorClass="progress-bar-emerald" icon="✨" />
                            <AnalysisBar label="Originality" value={result.analysis.originality} colorClass="progress-bar-violet" icon="🧬" />
                        </div>

                        {/* Evidence Summary */}
                        {result.evidence_summary && (
                            <div className="p-4 rounded-xl border border-base-200 bg-base-100/30">
                                <h4 className="text-sm font-semibold mb-2">Evidence Summary</h4>
                                <p className="text-sm opacity-80 leading-relaxed">{result.evidence_summary}</p>
                            </div>
                        )}

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                                <div className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
                                    <h4 className="font-semibold text-sm mb-2 text-emerald-600">💪 Strengths</h4>
                                    <ul className="text-sm space-y-1 opacity-80">
                                        {result.analysis.strengths.slice(0, 3).map((s, i) => (
                                            <li key={i} className="flex gap-2"><span>•</span> {s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                                <div className="rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
                                    <h4 className="font-semibold text-sm mb-2 text-amber-600">📝 Areas to Improve</h4>
                                    <ul className="text-sm space-y-1 opacity-80">
                                        {result.analysis.weaknesses.slice(0, 3).map((w, i) => (
                                            <li key={i} className="flex gap-2"><span>•</span> {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {result.verified && !activeAddress && (
                            <div className="alert alert-info text-sm">
                                <span>Connect your wallet to mint this certificate.</span>
                            </div>
                        )}
                    </div>
                )}

                {step === 'minting' && <MintingStep />}

                {/* Actions */}
                <div className="modal-action">
                    {step === 'form' && (
                        <>
                            <button type="button" className={`btn btn-primary ${loading ? 'loading' : ''}`} onClick={handleSubmit} disabled={loading || !githubUrl}>
                                Verify with AI
                            </button>
                            <button type="button" className="btn" onClick={resetAndClose} disabled={loading}>Cancel</button>
                        </>
                    )}
                    {step === 'result' && result?.verified && (
                        <>
                            <button type="button" className="btn btn-success" onClick={handleMint} disabled={loading || !activeAddress}>
                                Mint Certificate
                            </button>
                            <button type="button" className="btn" onClick={resetAndClose}>Close</button>
                        </>
                    )}
                    {step === 'result' && !result?.verified && (
                        <>
                            <button type="button" className="btn btn-outline" onClick={() => { setStep('form'); setResult(null) }}>Try Another Repo</button>
                            <button type="button" className="btn" onClick={resetAndClose}>Close</button>
                        </>
                    )}
                </div>
            </div>
            <div className="modal-backdrop" onClick={resetAndClose}></div>
        </dialog>
    )
}

export default SubmitEvidence
