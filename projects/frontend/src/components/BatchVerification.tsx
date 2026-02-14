// BatchVerification.tsx — Employers verify multiple candidates at once
import React, { useState } from 'react'
import { batchVerify } from '../services/verification'

const CHAIN_ICONS: Record<string, string> = {
    algorand: '🟢',
    ethereum: '🔷',
    polygon: '🟣',
}

export default function BatchVerification() {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState('')

    const handleVerify = async () => {
        setError('')
        setResults(null)

        const ids = input
            .split(/[\n,\s]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(Number)
            .filter(n => !isNaN(n))

        if (ids.length === 0) {
            setError('Please enter at least one valid asset ID')
            return
        }

        if (ids.length > 50) {
            setError('Maximum 50 asset IDs per batch')
            return
        }

        setLoading(true)
        try {
            const data = await batchVerify(ids)
            setResults(data)
        } catch (err: any) {
            setError(err.message || 'Batch verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-surface-800 border border-surface-600 rounded-xl p-6">
                <h3 className="text-lg font-bold text-surface-50 mb-1">Batch Verification</h3>
                <p className="text-sm text-surface-400 mb-4">Verify multiple certificates at once. Enter asset IDs separated by commas or new lines.</p>

                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter asset IDs (e.g., 12345, 67890, 11111)..."
                    rows={4}
                    className="w-full bg-surface-900 border border-surface-600 rounded-lg p-3 text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-brand-500 resize-none font-mono"
                />

                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={handleVerify}
                        disabled={loading || !input.trim()}
                        className="bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <><span className="animate-spin">⏳</span> Verifying...</>
                        ) : (
                            <>🔍 Verify All</>
                        )}
                    </button>
                    {results && (
                        <span className="text-sm text-surface-400">
                            {results.summary.total} checked
                        </span>
                    )}
                </div>

                {error && <p className="mt-3 text-sm text-red-400">❌ {error}</p>}
            </div>

            {/* Summary Cards */}
            {results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface-800 border border-surface-600 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-surface-50">{results.summary.total}</p>
                        <p className="text-xs text-surface-400 mt-1">Total Checked</p>
                    </div>
                    <div className="bg-surface-800 border border-green-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{results.summary.valid}</p>
                        <p className="text-xs text-surface-400 mt-1">Valid</p>
                    </div>
                    <div className="bg-surface-800 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">{results.summary.invalid}</p>
                        <p className="text-xs text-surface-400 mt-1">Invalid</p>
                    </div>
                    <div className="bg-surface-800 border border-yellow-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-400">{results.summary.revoked}</p>
                        <p className="text-xs text-surface-400 mt-1">Revoked</p>
                    </div>
                </div>
            )}

            {/* Results Table */}
            {results && results.results.length > 0 && (
                <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-700/50 text-surface-300">
                                    <th className="text-left py-3 px-4 font-medium">Asset ID</th>
                                    <th className="text-left py-3 px-4 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 font-medium">Student</th>
                                    <th className="text-left py-3 px-4 font-medium">Skill</th>
                                    <th className="text-left py-3 px-4 font-medium">Score</th>
                                    <th className="text-left py-3 px-4 font-medium">Chain</th>
                                    <th className="text-left py-3 px-4 font-medium">On-Chain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((r: any, i: number) => (
                                    <tr key={i} className="border-t border-surface-700 hover:bg-surface-700/30 transition-colors">
                                        <td className="py-3 px-4 font-mono text-surface-200">{r.asset_id}</td>
                                        <td className="py-3 px-4">
                                            {r.valid ? (
                                                <span className="inline-flex items-center gap-1 text-green-400 font-medium">✅ Valid</span>
                                            ) : r.certificate?.revoked ? (
                                                <span className="inline-flex items-center gap-1 text-yellow-400 font-medium">⚠️ Revoked</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-400 font-medium">❌ {r.error || 'Invalid'}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-surface-200">{r.certificate?.student_name || '—'}</td>
                                        <td className="py-3 px-4 text-surface-200">{r.certificate?.skill || '—'}</td>
                                        <td className="py-3 px-4">
                                            {r.certificate?.ai_score != null ? (
                                                <span className={`font-semibold ${r.certificate.ai_score >= 70 ? 'text-green-400' : r.certificate.ai_score >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {r.certificate.ai_score}/100
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {r.certificate?.chain_name ? (
                                                <span>{CHAIN_ICONS[r.certificate.chain_name] || '🔗'} {r.certificate.chain_name}</span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {r.on_chain_verified ? (
                                                <span className="text-green-400">✅</span>
                                            ) : (
                                                <span className="text-surface-500">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
