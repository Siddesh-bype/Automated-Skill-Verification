import type { VerificationResult } from '../services/verification'

interface CertificateCardProps {
    certificate: VerificationResult
    onVerify?: (assetId: number) => void
}

/* ── Verified / Rejected Seal SVG ── */
const VerifiedSeal = ({ verified }: { verified: boolean }) => (
    <div style={{
        position: 'absolute', top: '12px', right: '12px',
        width: '64px', height: '64px',
    }}>
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            {/* Outer star burst */}
            {verified ? (
                <>
                    <polygon
                        points="32,2 37,12 48,6 43,17 54,17 46,25 54,33 43,33 48,44 37,38 32,48 27,38 16,44 21,33 10,33 18,25 10,17 21,17 16,6 27,12"
                        fill="rgba(16,185,129,0.12)"
                        stroke="#10b981"
                        strokeWidth="1"
                    />
                    <circle cx="32" cy="25" r="13" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5" />
                    <path d="M25 25l4 4 8-8" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="32" y="44" textAnchor="middle" fill="#10b981" fontSize="5" fontWeight="700" fontFamily="Inter, sans-serif">VERIFIED</text>
                </>
            ) : (
                <>
                    <polygon
                        points="32,2 37,12 48,6 43,17 54,17 46,25 54,33 43,33 48,44 37,38 32,48 27,38 16,44 21,33 10,33 18,25 10,17 21,17 16,6 27,12"
                        fill="rgba(239,68,68,0.12)"
                        stroke="#ef4444"
                        strokeWidth="1"
                    />
                    <circle cx="32" cy="25" r="13" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" />
                    <path d="M26 19l12 12M38 19l-12 12" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <text x="32" y="44" textAnchor="middle" fill="#ef4444" fontSize="5" fontWeight="700" fontFamily="Inter, sans-serif">REJECTED</text>
                </>
            )}
        </svg>
    </div>
)

/* ── Decorative line divider ── */
const OrnamentLine = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--divider-color))' }} />
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
            <path d="M0 4h5l3-3 3 3h5" stroke="var(--divider-color)" strokeWidth="1" />
        </svg>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--divider-color), transparent)' }} />
    </div>
)

const CertificateCard = ({ certificate, onVerify }: CertificateCardProps) => {
    const isVerified = certificate.status !== 'REJECTED'
    const isMinted = certificate.status === 'MINTED'

    const getLevelLabel = (level: string) => {
        if (level.includes('Expert')) return { emoji: '🏆', label: 'Expert Level' }
        if (level.includes('Advanced')) return { emoji: '⭐', label: 'Advanced Level' }
        if (level.includes('Intermediate')) return { emoji: '📘', label: 'Intermediate Level' }
        if (level.includes('Beginner')) return { emoji: '🌱', label: 'Beginner Level' }
        return { emoji: '❌', label: level }
    }

    const levelInfo = getLevelLabel(certificate.skill_level)

    const copyVerifyLink = () => {
        if (certificate.blockchain_asset_id) {
            const link = `${window.location.origin}?verify=${certificate.blockchain_asset_id}`
            navigator.clipboard.writeText(link)
        }
    }

    return (
        <div
            className="relative transition-all duration-500 group"
            style={{
                background: 'var(--glass-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 48px var(--glass-shadow)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* Gradient top accent */}
            <div style={{
                height: '3px',
                background: isVerified
                    ? 'linear-gradient(90deg, #6366f1, #22d3ee, #10b981)'
                    : 'linear-gradient(90deg, #ef4444, #f97316)',
            }} />

            {/* Ornamental double border */}
            <div style={{
                margin: '8px',
                padding: '20px 16px 12px',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                position: 'relative',
            }}>
                {/* Inner decorative border */}
                <div style={{
                    position: 'absolute',
                    inset: '4px',
                    border: '1px dashed var(--divider-color)',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                }} />

                {/* Verified / Rejected Seal */}
                <VerifiedSeal verified={isVerified} />

                {/* Certificate Header */}
                <div style={{ textAlign: 'center', paddingTop: '4px', paddingRight: '56px', paddingLeft: '56px' }}>
                    {/* Seal / logo area */}
                    <div style={{
                        width: '28px', height: '28px', margin: '0 auto 6px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>

                    <div style={{
                        fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'var(--nav-link-color)',
                    }}>
                        CertifyMe
                    </div>

                    <OrnamentLine />

                    <div style={{
                        fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        background: isVerified
                            ? 'linear-gradient(135deg, #6366f1, #22d3ee)'
                            : 'linear-gradient(135deg, #ef4444, #f97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Certificate of Achievement
                    </div>

                    <div style={{
                        fontSize: '9px', marginTop: '3px',
                        color: 'var(--section-desc)',
                    }}>
                        This is to certify that
                    </div>
                </div>

                {/* Recipient Name */}
                <div style={{
                    textAlign: 'center', margin: '10px 0 4px',
                    fontSize: '18px', fontWeight: 800,
                    color: 'var(--section-title)',
                    fontStyle: 'italic',
                    letterSpacing: '0.02em',
                }}>
                    {certificate.student_name}
                </div>

                <div style={{
                    textAlign: 'center', fontSize: '9px',
                    color: 'var(--section-desc)',
                    marginBottom: '4px',
                }}>
                    has successfully demonstrated proficiency in
                </div>

                {/* Skill Name */}
                <div style={{
                    textAlign: 'center', margin: '6px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '9999px',
                        background: isVerified ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isVerified ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        fontSize: '12px', fontWeight: 700,
                        color: 'var(--section-title)',
                    }}>
                        {levelInfo.emoji} {certificate.skill}
                    </span>
                </div>

                <div style={{
                    textAlign: 'center', fontSize: '9px',
                    color: 'var(--section-desc)', marginBottom: '2px',
                }}>
                    {levelInfo.label} · AI Score: <strong style={{ color: certificate.ai_score >= 75 ? '#10b981' : certificate.ai_score >= 45 ? '#f59e0b' : '#ef4444' }}>{certificate.ai_score}/100</strong>
                </div>

                <OrnamentLine />

                {/* Analysis mini bars */}
                {isVerified && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '6px 12px' }}>
                        {[
                            { label: 'Quality', value: certificate.analysis.code_quality, cls: 'progress-bar-indigo' },
                            { label: 'Complex', value: certificate.analysis.complexity, cls: 'progress-bar-cyan' },
                            { label: 'Practice', value: certificate.analysis.best_practices, cls: 'progress-bar-emerald' },
                            { label: 'Original', value: certificate.analysis.originality, cls: 'progress-bar-violet' },
                        ].map((m) => (
                            <div key={m.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '9px', color: 'var(--nav-link-color)', marginBottom: '2px' }}>{m.label}</div>
                                <div className="progress-bar-container" style={{ height: '3px' }}>
                                    <div className={`progress-bar-fill ${m.cls}`} style={{ width: `${m.value}%`, height: '100%' }} />
                                </div>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--section-title)', marginTop: '1px' }}>{m.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Issuer & Date (signature area) */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    margin: '10px 12px 4px', paddingTop: '8px',
                    borderTop: '1px solid var(--divider-color)',
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600,
                            fontStyle: 'italic', color: 'var(--section-title)',
                        }}>
                            {certificate.issuer}
                        </div>
                        <div style={{
                            fontSize: '8px', color: 'var(--nav-link-color)',
                            borderTop: '1px solid var(--section-desc)',
                            paddingTop: '2px', marginTop: '2px',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            Issuing Authority
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: 600,
                            color: 'var(--section-title)',
                        }}>
                            {new Date(certificate.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{
                            fontSize: '8px', color: 'var(--nav-link-color)',
                            borderTop: '1px solid var(--section-desc)',
                            paddingTop: '2px', marginTop: '2px',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            Date of Issue
                        </div>
                    </div>
                </div>
            </div>

            {/* Blockchain footer */}
            <div style={{
                padding: '8px 16px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '6px', flexWrap: 'wrap',
            }}>
                {/* Status + blockchain info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                    {isMinted ? (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '2px 8px', borderRadius: '9999px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                            color: '#10b981', fontWeight: 600, fontSize: '10px',
                        }}>
                            ⛓️ On-Chain
                        </span>
                    ) : isVerified ? (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '2px 8px', borderRadius: '9999px',
                            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                            color: '#06b6d4', fontWeight: 600, fontSize: '10px',
                        }}>
                            ✅ Verified
                        </span>
                    ) : (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '2px 8px', borderRadius: '9999px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontWeight: 600, fontSize: '10px',
                        }}>
                            ❌ Rejected
                        </span>
                    )}

                    {certificate.blockchain_asset_id && (
                        <a
                            href={`https://testnet.explorer.perawallet.app/asset/${certificate.blockchain_asset_id}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: '10px', textDecoration: 'underline' }}
                        >
                            ID: {certificate.blockchain_asset_id}
                        </a>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {certificate.github_url && (
                        <a href={certificate.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline" style={{ fontSize: '10px', height: '24px', minHeight: '24px' }}>
                            📂 Code
                        </a>
                    )}
                    {certificate.blockchain_asset_id && (
                        <>
                            <button className="btn btn-xs btn-outline" onClick={copyVerifyLink} style={{ fontSize: '10px', height: '24px', minHeight: '24px' }}>
                                🔗 Share
                            </button>
                            <button className="btn btn-xs btn-primary" onClick={() => onVerify?.(certificate.blockchain_asset_id!)} style={{ fontSize: '10px', height: '24px', minHeight: '24px' }}>
                                ✅ Verify
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CertificateCard
