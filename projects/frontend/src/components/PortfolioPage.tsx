// PortfolioPage.tsx — Student portfolio builder with shareable profile
import React, { useState, useEffect } from 'react'
import { fetchPortfolio, updatePortfolio, fetchCertificates } from '../services/verification'
import ShareCertificate from './ShareCertificate'

const CHAIN_ICONS: Record<string, { icon: string; color: string; name: string }> = {
    algorand: { icon: '🟢', color: '#00ADB5', name: 'Algorand' },
    ethereum: { icon: '🔷', color: '#627EEA', name: 'Ethereum' },
    polygon: { icon: '🟣', color: '#8247E5', name: 'Polygon' },
}

interface PortfolioPageProps {
    walletAddress: string
}

export default function PortfolioPage({ walletAddress }: PortfolioPageProps) {
    const [portfolio, setPortfolio] = useState<any>(null)
    const [certificates, setCertificates] = useState<any[]>([])
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [shareModal, setShareModal] = useState<any>(null)
    const [copied, setCopied] = useState(false)

    // Form state
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')

    useEffect(() => {
        loadPortfolio()
    }, [walletAddress])

    const loadPortfolio = async () => {
        setLoading(true)
        try {
            const data = await fetchPortfolio(walletAddress)
            if (data) {
                setPortfolio(data.portfolio)
                setCertificates(data.certificates || [])
                setDisplayName(data.portfolio?.display_name || '')
                setBio(data.portfolio?.bio || '')
                setGithubUrl(data.portfolio?.github_url || '')
                setLinkedinUrl(data.portfolio?.linkedin_url || '')
            }
        } catch (err) {
            console.error('Portfolio load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updatePortfolio({
                wallet_address: walletAddress,
                display_name: displayName,
                bio,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
            })
            await loadPortfolio()
            setEditing(false)
        } catch (err) {
            console.error('Save error:', err)
        } finally {
            setSaving(false)
        }
    }

    const copyShareLink = async () => {
        if (portfolio?.share_token) {
            const url = `${window.location.origin}/portfolio/${portfolio.share_token}`
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="animate-spin text-3xl mr-3">⏳</span>
                <span className="text-surface-400">Loading portfolio...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                            {(displayName || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                            {editing ? (
                                <input
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-1.5 text-lg font-bold text-surface-100 focus:outline-none focus:border-brand-500"
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-surface-50">{displayName || 'Anonymous Student'}</h2>
                            )}
                            <p className="text-sm text-surface-400 font-mono mt-1">
                                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={copyShareLink}
                            className="text-sm px-4 py-2 bg-surface-700 hover:bg-surface-600 text-surface-200 rounded-lg transition-all"
                        >
                            {copied ? '✅ Copied!' : '🔗 Share Profile'}
                        </button>
                        <button
                            onClick={() => editing ? handleSave() : setEditing(true)}
                            disabled={saving}
                            className="text-sm px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {saving ? '⏳ Saving...' : editing ? '💾 Save' : '✏️ Edit'}
                        </button>
                    </div>
                </div>

                {/* Editable Fields */}
                {editing ? (
                    <div className="space-y-3 mt-4">
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Write a brief bio..."
                            rows={3}
                            className="w-full bg-surface-900 border border-surface-600 rounded-lg p-3 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                value={githubUrl}
                                onChange={e => setGithubUrl(e.target.value)}
                                placeholder="GitHub URL"
                                className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500"
                            />
                            <input
                                value={linkedinUrl}
                                onChange={e => setLinkedinUrl(e.target.value)}
                                placeholder="LinkedIn URL"
                                className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mt-2">
                        {bio && <p className="text-sm text-surface-300 mb-3">{bio}</p>}
                        <div className="flex gap-4 text-sm">
                            {githubUrl && (
                                <a href={githubUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                                    🔗 GitHub
                                </a>
                            )}
                            {linkedinUrl && (
                                <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 transition-colors">
                                    💼 LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-surface-50">{certificates.length}</p>
                    <p className="text-xs text-surface-400 mt-1">Certificates</p>
                </div>
                <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-brand-400">
                        {certificates.length > 0
                            ? Math.round(certificates.reduce((sum: number, c: any) => sum + (c.ai_score || 0), 0) / certificates.length)
                            : 0}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">Avg. Score</p>
                </div>
                <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-surface-50">
                        {new Set(certificates.map((c: any) => c.skill)).size}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">Skills</p>
                </div>
            </div>

            {/* Certificate Grid */}
            <div>
                <h3 className="text-lg font-bold text-surface-50 mb-4">Earned Certificates</h3>
                {certificates.length === 0 ? (
                    <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center">
                        <span className="text-4xl mb-3 block">📜</span>
                        <p className="text-surface-300">No certificates yet</p>
                        <p className="text-sm text-surface-500 mt-1">Submit your first project for verification!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert: any) => {
                            const chain = CHAIN_ICONS[cert.chain_name || 'algorand'] || CHAIN_ICONS.algorand
                            return (
                                <div
                                    key={cert.cert_id || cert.id}
                                    className="bg-surface-800 border border-surface-600 rounded-xl p-4 hover:border-surface-500 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-surface-100">{cert.skill}</p>
                                            {cert.skill_level && (
                                                <span className="text-xs text-brand-400">{cert.skill_level}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ backgroundColor: `${chain.color}20`, color: chain.color }}
                                            >
                                                {chain.icon} {chain.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold text-lg ${cert.ai_score >= 70 ? 'text-green-400' : cert.ai_score >= 45 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            {cert.ai_score}/100
                                        </span>
                                        <button
                                            onClick={() => setShareModal(cert)}
                                            className="opacity-0 group-hover:opacity-100 text-sm px-3 py-1 bg-surface-700 hover:bg-surface-600 text-surface-300 rounded-lg transition-all"
                                        >
                                            📤 Share
                                        </button>
                                    </div>

                                    {cert.asset_id && (
                                        <p className="text-xs text-surface-500 mt-2 font-mono">
                                            Asset #{cert.asset_id}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {shareModal && (
                <ShareCertificate
                    certId={shareModal.cert_id || shareModal.id}
                    skill={shareModal.skill}
                    studentName={shareModal.student_name || displayName}
                    aiScore={shareModal.ai_score}
                    chainName={shareModal.chain_name}
                    onClose={() => setShareModal(null)}
                />
            )}
        </div>
    )
}
