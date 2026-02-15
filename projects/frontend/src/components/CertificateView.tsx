// CertificateView.tsx — Clean, solid Udemy/GFG-style professional certificate
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { VerificationResult } from '../services/verification'

interface CertificateViewProps {
    certificate: VerificationResult
    onClose: () => void
}

const CHAIN_ICONS: Record<string, { color: string; name: string }> = {
    algorand: { color: '#00ADB5', name: 'Algorand' },
    ethereum: { color: '#627EEA', name: 'Ethereum' },
    polygon: { color: '#8247E5', name: 'Polygon' },
}

/* Circular score gauge */
const ScoreGauge = ({ score, size = 68 }: { score: number; size?: number }) => {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = score >= 75 ? '#0d9488' : score >= 45 ? '#d97706' : '#dc2626'

    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color }}>{score}</span>
            </div>
        </div>
    )
}

export default function CertificateView({ certificate, onClose }: CertificateViewProps) {
    const certRef = useRef<HTMLDivElement>(null)
    const [downloading, setDownloading] = useState(false)

    const chain = CHAIN_ICONS[(certificate as any).chain_name || 'algorand'] || CHAIN_ICONS.algorand

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) {
                // Fallback to current date if invalid
                return new Date().toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })
            }
            return d.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        } catch {
            return new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        }
    }

    const downloadCertificate = async () => {
        if (!certRef.current) return
        setDownloading(true)
        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                removeContainer: true,
            })
            canvas.toBlob((blob) => {
                if (!blob) return
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `CertifyMe_${certificate.skill.replace(/\s+/g, '_')}_${certificate.student_name.replace(/\s+/g, '_')}.png`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }, 'image/png')
        } catch (err) {
            console.error('Download failed:', err)
            alert('Download failed. Please try again.')
        } finally {
            setTimeout(() => setDownloading(false), 1000)
        }
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{ width: '100%', maxWidth: 900 }}
                onClick={e => e.stopPropagation()}
            >
                {/* ═══════ CERTIFICATE ═══════ */}
                <div
                    ref={certRef}
                    style={{
                        background: '#ffffff',
                        border: '4px solid #1a5c4c',
                        borderRadius: 8,
                        padding: '48px 56px',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        color: '#1a1a1a',
                    }}
                >
                    {/* Inner border */}
                    <div style={{
                        position: 'absolute', inset: 10,
                        border: '2px solid #1a5c4c',
                        borderRadius: 4,
                        opacity: 0.3,
                        pointerEvents: 'none',
                    }} />

                    {/* Top accent bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
                        background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)',
                    }} />

                    {/* ── Header ── */}
                    <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
                        {/* Platform badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#0d9488', color: '#ffffff',
                            padding: '6px 20px', borderRadius: 4,
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                            textTransform: 'uppercase' as const, marginBottom: 16,
                        }}>
                            <span style={{ fontSize: 14 }}>🛡️</span> CERTIFYME
                        </div>

                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 38, fontWeight: 700, color: '#1a1a1a',
                            margin: '0 0 4px 0', lineHeight: 1.2,
                        }}>
                            Certificate of Achievement
                        </h1>

                        <p style={{
                            fontSize: 13, color: '#6b7280', letterSpacing: '0.12em',
                            textTransform: 'uppercase' as const, margin: 0,
                        }}>
                            Blockchain-Verified Skill Certification
                        </p>
                    </div>

                    {/* ── Decorative divider ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 28px 0' }}>
                        <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, transparent, #d1d5db)' }} />
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0d9488', margin: '0 12px' }} />
                        <div style={{ flex: 1, maxWidth: 120, height: 1, background: 'linear-gradient(90deg, #d1d5db, transparent)' }} />
                    </div>

                    {/* ── Recipient ── */}
                    <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: 13, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' as const, margin: '0 0 8px 0' }}>
                            This is proudly presented to
                        </p>
                        <h2 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: 32, fontWeight: 700, color: '#111827',
                            margin: '0 0 6px 0',
                            borderBottom: '3px solid #0d9488',
                            display: 'inline-block', paddingBottom: 6, paddingLeft: 24, paddingRight: 24,
                        }}>
                            {certificate.student_name}
                        </h2>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '12px 0 0 0', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                            for successfully demonstrating proficiency at the{' '}
                            <strong style={{ color: '#0d9488' }}>{certificate.skill_level || 'Certified'}</strong> level in
                        </p>
                    </div>

                    {/* ── Skill Name ── */}
                    <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: '#f0fdfa',
                            border: '2px solid #99f6e4',
                            borderRadius: 8,
                            padding: '12px 32px',
                        }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', Georgia, serif",
                                fontSize: 24, fontWeight: 700, color: '#0d9488',
                                margin: 0, letterSpacing: '0.02em',
                            }}>
                                {certificate.skill}
                            </h3>
                        </div>
                    </div>

                    {/* ── Bottom section ── */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        position: 'relative', zIndex: 1,
                        borderTop: '1px solid #e5e7eb', paddingTop: 20,
                    }}>
                        {/* Left: Details */}
                        <div style={{ fontSize: 13 }}>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 2 }}>
                                    Date Issued
                                </div>
                                <div style={{ fontWeight: 600, color: '#374151' }}>{formatDate(certificate.issue_date)}</div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 2 }}>
                                    Issued By
                                </div>
                                <div style={{ fontWeight: 600, color: '#374151' }}>{certificate.issuer}</div>
                            </div>
                            {certificate.blockchain_asset_id && (
                                <div>
                                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 2 }}>
                                        Blockchain Verified
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{
                                            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                                            backgroundColor: chain.color,
                                        }} />
                                        {chain.name} · <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>#{certificate.blockchain_asset_id}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Center: Seal */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                                border: '3px solid #ffffff',
                                outline: '2px solid #0d9488',
                            }}>
                                <div style={{ textAlign: 'center', color: '#ffffff' }}>
                                    <div style={{ fontSize: 24 }}>✓</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 6, textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontWeight: 600 }}>
                                Verified
                            </p>
                        </div>

                        {/* Right: Score */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>AI Score</div>
                                    <div style={{ fontWeight: 700, fontSize: 18, color: '#374151' }}>{certificate.ai_score}/100</div>
                                </div>
                                <ScoreGauge score={certificate.ai_score} />
                            </div>
                            {certificate.analysis && (
                                <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                                    {[
                                        { label: 'Quality', val: certificate.analysis.code_quality },
                                        { label: 'Complex', val: certificate.analysis.complexity },
                                        { label: 'Practice', val: certificate.analysis.best_practices },
                                        { label: 'Original', val: certificate.analysis.originality },
                                    ].map(item => (
                                        <div key={item.label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' as const }}>{item.label}</div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{item.val}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#d1d5db' }}>
                                ID: {certificate.id?.slice(0, 16)}...
                            </div>
                        </div>
                    </div>

                    {/* Bottom accent bar */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
                        background: 'linear-gradient(90deg, #0d9488, #14b8a6, #0d9488)',
                    }} />
                </div>

                {/* ═══════ ACTION BUTTONS ═══════ */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    <button
                        onClick={downloadCertificate}
                        disabled={downloading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                            color: '#ffffff', border: 'none', borderRadius: 10,
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            opacity: downloading ? 0.6 : 1,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    >
                        {downloading ? (
                            <><span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> Generating...</>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Certificate
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 28px',
                            backgroundColor: '#374151', color: '#ffffff',
                            border: 'none', borderRadius: 10,
                            fontSize: 15, fontWeight: 500, cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4b5563' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#374151' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
