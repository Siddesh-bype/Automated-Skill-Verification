import { useState } from 'react'
import type { VerificationResult } from '../services/verification'
import ShareCertificate from './ShareCertificate'

interface CertificateCardProps {
    certificate: VerificationResult
    onVerify?: (assetId: number) => void
}

const CertificateCard = ({ certificate, onVerify }: CertificateCardProps) => {
    const [showShare, setShowShare] = useState(false)
    const chainName = (certificate as any).chain_name || 'algorand'
    const CHAIN_ICONS: Record<string, { icon: string; color: string; name: string }> = {
        algorand: { icon: '🟢', color: '#00ADB5', name: 'Algorand' },
        ethereum: { icon: '🔷', color: '#627EEA', name: 'Ethereum' },
        polygon: { icon: '🟣', color: '#8247E5', name: 'Polygon' },
    }
    const chain = CHAIN_ICONS[chainName] || CHAIN_ICONS.algorand
    const getScoreBadgeClass = (score: number) => {
        if (score >= 75) return 'badge-success'
        if (score >= 45) return 'badge-warning'
        return 'badge-error'
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'MINTED':
                return <span className="badge badge-success gap-1">⛓️ On-Chain</span>
            case 'VERIFIED':
                return <span className="badge badge-info gap-1">✅ Verified</span>
            case 'REJECTED':
                return <span className="badge badge-error gap-1">❌ Rejected</span>
            default:
                return <span className="badge badge-ghost">{status}</span>
        }
    }

    const getLevelIcon = (level: string | null | undefined) => {
        if (!level) return '📝'
        if (level.includes('Expert')) return '🏆'
        if (level.includes('Advanced')) return '⭐'
        if (level.includes('Intermediate')) return '📘'
        if (level.includes('Beginner')) return '🌱'
        return '❌'
    }

    const copyVerifyLink = () => {
        if (certificate.blockchain_asset_id) {
            const link = `${window.location.origin}?verify=${certificate.blockchain_asset_id}`
            navigator.clipboard.writeText(link)
        }
    }

    return (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Gradient header */}
            <div className={`h-2 rounded-t-xl ${certificate.status === 'REJECTED' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'}`} />

            <div className="card-body">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="card-title text-lg">
                            {getLevelIcon(certificate.skill_level)} {certificate.skill}
                        </h2>
                        <p className="text-sm opacity-70">{certificate.skill_level}</p>
                    </div>
                    <div className={`badge ${getScoreBadgeClass(certificate.ai_score)} badge-lg font-bold`}>
                        {certificate.ai_score}/100
                    </div>
                </div>

                <div className="divider my-1" />

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="opacity-60">Holder:</span>
                        <div className="font-medium">{certificate.student_name}</div>
                    </div>
                    <div>
                        <span className="opacity-60">Issuer:</span>
                        <div className="font-medium">{certificate.issuer}</div>
                    </div>
                    <div>
                        <span className="opacity-60">Date:</span>
                        <div className="font-medium">{new Date(certificate.issue_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <span className="opacity-60">Status:</span>
                        <div>{getStatusBadge(certificate.status)}</div>
                    </div>
                    <div>
                        <span className="opacity-60">Chain:</span>
                        <div>
                            <span className="badge badge-ghost gap-1 text-xs" style={{ borderColor: chain.color + '40', color: chain.color }}>
                                {chain.icon} {chain.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analysis mini bars */}
                {certificate.status !== 'REJECTED' && certificate.analysis && (
                    <div className="grid grid-cols-4 gap-1 mt-2">
                        <div className="text-center">
                            <div className="text-[10px] opacity-50">Quality</div>
                            <progress className="progress progress-primary progress-xs w-full" value={certificate.analysis.code_quality} max="100" />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] opacity-50">Complex</div>
                            <progress className="progress progress-secondary progress-xs w-full" value={certificate.analysis.complexity} max="100" />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] opacity-50">Practice</div>
                            <progress className="progress progress-accent progress-xs w-full" value={certificate.analysis.best_practices} max="100" />
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] opacity-50">Original</div>
                            <progress className="progress progress-info progress-xs w-full" value={certificate.analysis.originality} max="100" />
                        </div>
                    </div>
                )}

                {/* Blockchain info */}
                {certificate.blockchain_asset_id && (
                    <div className="bg-base-200 rounded-lg p-2 mt-2 text-xs">
                        <span className="opacity-60">Asset ID: </span>
                        <a
                            href={`https://testnet.explorer.perawallet.app/asset/${certificate.blockchain_asset_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                        >
                            {certificate.blockchain_asset_id}
                        </a>
                    </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-end mt-2">
                    {certificate.github_url && (
                        <a href={certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline">
                            📂 Code
                        </a>
                    )}
                    {certificate.blockchain_asset_id && (
                        <>
                            <button className="btn btn-xs btn-outline" onClick={() => setShowShare(true)}>
                                📤 Share
                            </button>
                            <button className="btn btn-xs btn-primary" onClick={() => onVerify?.(certificate.blockchain_asset_id!)}>
                                ✅ Verify
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showShare && (
                <ShareCertificate
                    certId={certificate.id}
                    skill={certificate.skill}
                    studentName={certificate.student_name}
                    aiScore={certificate.ai_score}
                    chainName={chainName}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    )
}

export default CertificateCard
