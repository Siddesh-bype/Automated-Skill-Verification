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
    const [filter, setFilter] = useState<string>('all')

    const loadCertificates = async () => {
        setLoading(true)
        try {
            const certs = await fetchCertificates()
            setCertificates(certs)
        } catch (e) {
            console.error('Failed to load certificates:', e)
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
                    </div>
                    <div className="stat">
                        <div className="stat-figure text-secondary text-3xl">⛓️</div>
                        <div className="stat-title">On Blockchain</div>
                        <div className="stat-value text-secondary">{totalMinted}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-figure text-accent text-3xl">⭐</div>
                        <div className="stat-title">Avg AI Score</div>
                        <div className="stat-value text-accent">{avgScore}</div>
                    </div>
                </div>

                {/* Actions & Filter */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div className="btn-group">
                        {['all', 'MINTED', 'VERIFIED', 'REJECTED'].map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
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

                {/* Certificate Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-lg">No certificates yet</p>
                        <p className="text-sm">Submit evidence to get your skills verified!</p>
                        <button className="btn btn-primary mt-4" onClick={onSubmitNew}>
                            Submit Your First Evidence
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
                    <button className="btn" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default StudentDashboard
