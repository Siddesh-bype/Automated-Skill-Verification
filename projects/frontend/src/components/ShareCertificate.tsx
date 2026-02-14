// ShareCertificate.tsx — Modal for sharing certificates via WhatsApp, Email, Link
import React, { useState } from 'react'
import { createShareLink } from '../services/verification'

interface ShareCertificateProps {
    certId: string
    skill: string
    studentName: string
    aiScore: number
    chainName?: string
    onClose: () => void
}

const CHAIN_ICONS: Record<string, { icon: string; color: string; name: string }> = {
    algorand: { icon: '🟢', color: '#00ADB5', name: 'Algorand' },
    ethereum: { icon: '🔷', color: '#627EEA', name: 'Ethereum' },
    polygon: { icon: '🟣', color: '#8247E5', name: 'Polygon' },
}

export default function ShareCertificate({ certId, skill, studentName, aiScore, chainName, onClose }: ShareCertificateProps) {
    const [expiry, setExpiry] = useState('24h')
    const [shareUrl, setShareUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')

    const chain = CHAIN_ICONS[chainName || 'algorand'] || CHAIN_ICONS.algorand

    const generateLink = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await createShareLink(certId, expiry, 'link')
            const baseUrl = window.location.origin
            const fullUrl = `${baseUrl}/shared/${result.share_token}`
            setShareUrl(fullUrl)
        } catch (err: any) {
            setError(err.message || 'Failed to generate link')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        if (!shareUrl) await generateLink()
        const url = shareUrl || window.location.href
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareWhatsApp = async () => {
        if (!shareUrl) await generateLink()
        const text = `🎓 Check out my verified certificate!\n\n📋 Skill: ${skill}\n📊 AI Score: ${aiScore}/100\n${chain.icon} Chain: ${chain.name}\n\n🔗 Verify: ${shareUrl || window.location.href}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const shareEmail = async () => {
        if (!shareUrl) await generateLink()
        const subject = `Verified Certificate: ${skill} - ${studentName}`
        const body = `Hi,\n\nI'd like to share my blockchain-verified certificate with you.\n\nSkill: ${skill}\nAI Score: ${aiScore}/100\nBlockchain: ${chain.name}\n\nVerify here: ${shareUrl || window.location.href}\n\nThis certificate was verified by CertifyMe's AI system and recorded on the ${chain.name} blockchain.\n\nBest regards,\n${studentName}`
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-surface-50">Share Certificate</h3>
                    <button onClick={onClose} className="text-surface-400 hover:text-surface-200 text-xl">✕</button>
                </div>

                {/* Certificate Preview */}
                <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{chain.icon}</span>
                        <div>
                            <p className="font-semibold text-surface-100">{skill}</p>
                            <p className="text-sm text-surface-400">{studentName}</p>
                        </div>
                        <span className="ml-auto text-brand-400 font-bold text-lg">{aiScore}/100</span>
                    </div>
                    <p className="text-xs text-surface-500">
                        Blockchain: <span style={{ color: chain.color }}>{chain.name}</span>
                    </p>
                </div>

                {/* Expiry Selection */}
                <div className="mb-5">
                    <label className="text-sm font-medium text-surface-300 mb-2 block">Link expires in</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { val: '1h', label: '1 Hour' },
                            { val: '24h', label: '24 Hours' },
                            { val: '7d', label: '7 Days' },
                            { val: '30d', label: '30 Days' },
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => { setExpiry(opt.val); setShareUrl('') }}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${expiry === opt.val
                                        ? 'bg-brand-500 text-white'
                                        : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={copyToClipboard}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="animate-spin">⏳</span>
                        ) : copied ? (
                            <>✅ Copied!</>
                        ) : (
                            <>🔗 Copy Share Link</>
                        )}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={shareWhatsApp}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            💬 WhatsApp
                        </button>
                        <button
                            onClick={shareEmail}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-600 hover:bg-surface-500 text-surface-100 rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            📧 Email
                        </button>
                    </div>
                </div>

                {/* Generated URL display */}
                {shareUrl && (
                    <div className="mt-4 bg-surface-900 rounded-lg p-3 border border-surface-700">
                        <p className="text-xs text-surface-400 mb-1">Share URL:</p>
                        <p className="text-xs text-brand-400 break-all font-mono">{shareUrl}</p>
                    </div>
                )}

                {error && (
                    <p className="mt-3 text-sm text-red-400">{error}</p>
                )}
            </div>
        </div>
    )
}
