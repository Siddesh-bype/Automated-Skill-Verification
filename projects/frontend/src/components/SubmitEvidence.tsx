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
    const [skillsLoading, setSkillsLoading] = useState(true)
    const [githubUrl, setGithubUrl] = useState('')
    const [claimedSkill, setClaimedSkill] = useState('')
    const [studentName, setStudentName] = useState('')
    const [description, setDescription] = useState('')

    const [step, setStep] = useState<'form' | 'verifying' | 'result' | 'minting'>('form')
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setSkillsLoading(true)
        fetchSkills()
            .then(setSkills)
            .finally(() => setSkillsLoading(false))
    }, [])

    useEffect(() => {
        if (skills.length > 0 && !claimedSkill) {
            setClaimedSkill(skills[0].name)
        }
    }, [skills, claimedSkill])

    const handleSubmit = async () => {
        if (!githubUrl) { enqueueSnackbar('Please enter a GitHub URL', { variant: 'warning' }); return }
        if (!githubUrl.includes('github.com')) { enqueueSnackbar('Please enter a valid GitHub URL', { variant: 'warning' }); return }

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

    const getLevelEmoji = (level: string) => {
        if (level?.includes('Expert')) return '🏆'
        if (level?.includes('Advanced')) return '⭐'
        if (level?.includes('Intermediate')) return '📘'
        if (level?.includes('Beginner')) return '🌱'
        return '❌'
    }

    return (
        <dialog id="submit_evidence_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-2xl mb-4">
                    {step === 'form' && '📝 Submit Evidence for Verification'}
                    {step === 'verifying' && '🔍 AI Verification in Progress...'}
                    {step === 'result' && (result?.verified ? '✅ Verification Passed!' : '❌ Verification Failed')}
                    {step === 'minting' && '⛓️ Minting Certificate NFT...'}
                </h3>

                {/* Form Step */}
                {step === 'form' && (
                    <div className="flex flex-col gap-3">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Your Name</span></label>
                            <input
                                className="input input-bordered"
                                placeholder="e.g., Siddesh Bype"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Skill to Verify</span></label>
                            {skillsLoading ? (
                                <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                                    <span className="loading loading-spinner loading-xs"></span>
                                    <span className="text-sm opacity-60">Loading skills...</span>
                                </div>
                            ) : (
                                <select className="select select-bordered w-full" value={claimedSkill} onChange={(e) => setClaimedSkill(e.target.value)}>
                                    {skills.map((s) => (
                                        <option key={s.name} value={s.name}>
                                            {s.name} ({s.category}) — Min score: {s.min_score}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">GitHub Repository URL</span></label>
                            <input
                                className="input input-bordered"
                                placeholder="https://github.com/username/project"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                            />
                            <label className="label"><span className="label-text-alt opacity-50">Must be a public GitHub repository</span></label>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Project Description <span className="opacity-50">(optional)</span></span></label>
                            <textarea
                                className="textarea textarea-bordered"
                                placeholder="Briefly describe what this project demonstrates..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Verifying Step */}
                {step === 'verifying' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-lg font-medium">Analyzing code with AI...</p>
                        <p className="text-sm opacity-60">Fetching repo files and running 4-dimensional analysis</p>
                        <div className="flex gap-2 flex-wrap justify-center mt-2">
                            <span className="badge badge-outline animate-pulse">Code Quality</span>
                            <span className="badge badge-outline animate-pulse" style={{ animationDelay: '0.1s' }}>Complexity</span>
                            <span className="badge badge-outline animate-pulse" style={{ animationDelay: '0.2s' }}>Best Practices</span>
                            <span className="badge badge-outline animate-pulse" style={{ animationDelay: '0.3s' }}>Originality</span>
                        </div>
                        <div className="mt-4 w-full max-w-xs">
                            <progress className="progress progress-primary w-full" />
                        </div>
                        <p className="text-xs opacity-40">This may take 15-30 seconds depending on repository size</p>
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && result && (
                    <div className="flex flex-col gap-4">
                        {/* Score Summary */}
                        <div className="stats shadow w-full">
                            <div className="stat">
                                <div className="stat-figure text-3xl">{getLevelEmoji(result.skill_level)}</div>
                                <div className="stat-title">AI Score</div>
                                <div className={`stat-value ${getScoreColor(result.ai_score)}`}>{result.ai_score}/100</div>
                                <div className="stat-desc">{result.skill_level}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Skill</div>
                                <div className="stat-value text-lg">{result.skill}</div>
                                <div className="stat-desc">{result.recommendation === 'ISSUE_CERTIFICATE' ? '✅ Eligible for certification' : '❌ Does not meet threshold'}</div>
                            </div>
                        </div>

                        {/* 4D Analysis Breakdown */}
                        <div className="bg-base-200 rounded-xl p-4">
                            <h4 className="font-semibold mb-3">Analysis Breakdown</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="opacity-60">Code Quality</span>
                                        <span className="font-bold">{result.analysis.code_quality}/100</span>
                                    </div>
                                    <progress className="progress progress-primary w-full" value={result.analysis.code_quality} max="100" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="opacity-60">Complexity</span>
                                        <span className="font-bold">{result.analysis.complexity}/100</span>
                                    </div>
                                    <progress className="progress progress-secondary w-full" value={result.analysis.complexity} max="100" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="opacity-60">Best Practices</span>
                                        <span className="font-bold">{result.analysis.best_practices}/100</span>
                                    </div>
                                    <progress className="progress progress-accent w-full" value={result.analysis.best_practices} max="100" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="opacity-60">Originality</span>
                                        <span className="font-bold">{result.analysis.originality}/100</span>
                                    </div>
                                    <progress className="progress progress-info w-full" value={result.analysis.originality} max="100" />
                                </div>
                            </div>
                        </div>

                        {/* Evidence Summary */}
                        <div className="bg-base-200 rounded-xl p-4">
                            <h4 className="font-semibold mb-2">Evidence Summary</h4>
                            <p className="text-sm opacity-80">{result.evidence_summary}</p>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {result.analysis.strengths && result.analysis.strengths.length > 0 && (
                                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                                    <h4 className="font-semibold text-success text-sm mb-2">💪 Strengths</h4>
                                    <ul className="text-sm space-y-1">
                                        {result.analysis.strengths.map((s, i) => (
                                            <li key={i} className="flex gap-2"><span className="text-success">•</span> {s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {result.analysis.weaknesses && result.analysis.weaknesses.length > 0 && (
                                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                                    <h4 className="font-semibold text-warning text-sm mb-2">📝 Areas to Improve</h4>
                                    <ul className="text-sm space-y-1">
                                        {result.analysis.weaknesses.map((w, i) => (
                                            <li key={i} className="flex gap-2"><span className="text-warning">•</span> {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Wallet Connection Prompt for Minting */}
                        {result.verified && !activeAddress && (
                            <div className="alert alert-info">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Connect your Algorand wallet to mint this certificate as an NFT on the blockchain.</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Minting Step */}
                {step === 'minting' && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <span className="loading loading-spinner loading-lg text-success"></span>
                        <p className="text-lg font-medium">Minting certificate on Algorand...</p>
                        <div className="text-sm opacity-60 text-center space-y-1">
                            <p>📌 Uploading metadata to IPFS</p>
                            <p>⛓️ Creating ARC-19 NFT on TestNet</p>
                            <p>✍️ Confirm the transaction in your wallet</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action">
                    {step === 'form' && (
                        <>
                            <button
                                type="button"
                                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                onClick={handleSubmit}
                                disabled={loading || !githubUrl}
                            >
                                🔍 Verify with AI
                            </button>
                            <button type="button" className="btn" onClick={resetAndClose} disabled={loading}>
                                Cancel
                            </button>
                        </>
                    )}
                    {step === 'result' && result?.verified && (
                        <>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleMint}
                                disabled={loading || !activeAddress}
                            >
                                ⛓️ Mint Certificate NFT
                            </button>
                            <button type="button" className="btn" onClick={resetAndClose}>
                                Close
                            </button>
                        </>
                    )}
                    {step === 'result' && !result?.verified && (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => { setStep('form'); setResult(null) }}
                            >
                                🔄 Try Another Repo
                            </button>
                            <button type="button" className="btn" onClick={resetAndClose}>
                                Close
                            </button>
                        </>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <div className="modal-backdrop" onClick={resetAndClose}></div>
        </dialog>
    )
}

export default SubmitEvidence
