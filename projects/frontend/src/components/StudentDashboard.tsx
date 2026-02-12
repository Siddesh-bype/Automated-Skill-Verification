import { useEffect, useState } from 'react'
import { fetchCertificates, type VerificationResult } from '../services/verification'
import CertificateCard from './CertificateCard'

interface StudentDashboardProps {
    openModal: boolean
    closeModal: () => void
    onSubmitNew: () => void
    onVerify: (assetId: number) => void
    refreshTrigger?: number
}

const StudentDashboard = ({ openModal, closeModal, onSubmitNew, onVerify, refreshTrigger }: StudentDashboardProps) => {
    const [certificates, setCertificates] = useState<VerificationResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<string>('all')

    const loadCertificates = async () => {
        setLoading(true)
        setError(null)
        try {
            const certs = await fetchCertificates()
            setCertificates(certs)
        } catch (e) {
            console.error('Failed to load certificates:', e)
            setError('Could not load certificates. Make sure the backend is running on port 3001.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (openModal) loadCertificates()
    }, [openModal, refreshTrigger])

    const filtered = filter === 'all' ? certificates : certificates.filter((c) => c.status === filter)

    const totalVerified = certificates.filter((c) => c.status !== 'REJECTED').length
    const avgScore = totalVerified > 0
        ? Math.round(certificates.filter((c) => c.status !== 'REJECTED').reduce((sum, c) => sum + c.ai_score, 0) / totalVerified)
        : 0
    const totalMinted = certificates.filter((c) => c.status === 'MINTED').length

    const filterCounts = {
        all: certificates.length,
        MINTED: totalMinted,
        VERIFIED: certificates.filter((c) => c.status === 'VERIFIED').length,
        REJECTED: certificates.filter((c) => c.status === 'REJECTED').length,
    }

    return (
        <dialog id="student_dashboard_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
            <div className="modal-box max-w-5xl max-h-[90vh]">
                <h3 className="font-bold text-2xl mb-4">🎓 My Certificates</h3>

                {/* Stats */}
                <div className="stats shadow w-full mb-4">
                    <div className="stat">
                        <div className="stat-figure text-primary text-3xl">📜</div>
                        <div className="stat-title">Total Verified</div>
                        <div className="stat-value text-primary">{totalVerified}</div>
                        <div className="stat-desc">{certificates.length} submissions total</div>
                    </div>
                    <div className="stat">
                        <div className="stat-figure text-secondary text-3xl">⛓️</div>
                        <div className="stat-title">On Blockchain</div>
                        <div className="stat-value text-secondary">{totalMinted}</div>
                        <div className="stat-desc">Minted as NFTs</div>
                    </div>
                    <div className="stat">
                        <div className="stat-figure text-accent text-3xl">⭐</div>
                        <div className="stat-title">Avg AI Score</div>
                        <div className="stat-value text-accent">{avgScore}</div>
                        <div className="stat-desc">Across verified certs</div>
                    </div>
                </div>

                {/* Actions & Filter */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div className="join">
                        {(['all', 'MINTED', 'VERIFIED', 'REJECTED'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm join-item ${filter === f ? 'btn-active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                                <span className="badge badge-sm ml-1">{filterCounts[f]}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-outline" onClick={loadCertificates} disabled={loading}>
                            🔄 Refresh
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={onSubmitNew}>
                            ➕ Submit New Evidence
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="alert alert-warning mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        <span>{error}</span>
                        <button className="btn btn-sm btn-ghost" onClick={loadCertificates}>Retry</button>
                    </div>
                )}

                {/* Certificate Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-sm opacity-60">Loading certificates...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-lg font-medium">
                            {filter !== 'all'
                                ? `No ${filter.toLowerCase()} certificates`
                                : 'No certificates yet'
                            }
                        </p>
                        <p className="text-sm opacity-60 mb-4">
                            {filter !== 'all'
                                ? 'Try a different filter or submit new evidence.'
                                : 'Submit a GitHub repository to get your skills verified by AI!'}
                        </p>
                        <button className="btn btn-primary" onClick={onSubmitNew}>
                            🚀 Submit Your First Evidence
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[50vh] pr-2">
                        {filtered.map((cert) => (
                            <CertificateCard key={cert.id} certificate={cert} onVerify={onVerify} />
                        ))}
                    </div>
                )}

                <div className="modal-action">
                    <button type="button" className="btn" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={closeModal}></div>
        </dialog>
    )
}

export default StudentDashboard
