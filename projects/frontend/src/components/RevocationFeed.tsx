// RevocationFeed.tsx — Real-time revocation alerts with auto-refresh polling
import React, { useState, useEffect, useCallback } from 'react'
import { fetchRevocations } from '../services/verification'

const CHAIN_ICONS: Record<string, string> = {
    algorand: '🟢',
    ethereum: '🔷',
    polygon: '🟣',
}

interface RevocationEvent {
    id: number
    cert_id: string
    asset_id: number | null
    skill: string
    student_name: string
    revoked_by: string
    reason: string
    chain_name: string
    created_at: string
}

export default function RevocationFeed() {
    const [events, setEvents] = useState<RevocationEvent[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    const loadEvents = useCallback(async () => {
        try {
            const data = await fetchRevocations()
            setEvents(data.events)
            setTotal(data.total)
            setLastRefresh(new Date())
        } catch (err) {
            console.error('Failed to load revocations:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadEvents()
    }, [loadEvents])

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(loadEvents, 30000)
        return () => clearInterval(interval)
    }, [autoRefresh, loadEvents])

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🚨</span>
                        <h3 className="text-lg font-bold text-surface-50">Revocation Feed</h3>
                        {total > 0 && (
                            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {total} total
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${autoRefresh
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-surface-700 text-surface-400'
                                }`}
                        >
                            {autoRefresh ? '🔴 Live' : '⏸️ Paused'}
                        </button>
                        <button
                            onClick={loadEvents}
                            className="text-xs px-3 py-1.5 rounded-lg bg-surface-700 text-surface-300 hover:bg-surface-600 transition-all"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>
                <p className="text-xs text-surface-500">
                    Real-time alerts when certificates are revoked • Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center">
                    <span className="animate-spin text-2xl">⏳</span>
                    <p className="text-sm text-surface-400 mt-2">Loading revocation events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">✅</span>
                    <p className="text-surface-300 font-medium">No revocations</p>
                    <p className="text-sm text-surface-500 mt-1">All certificates are in good standing</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map(event => (
                        <div
                            key={event.id}
                            className="bg-surface-800 border border-red-500/20 rounded-xl p-4 hover:border-red-500/40 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="text-red-400 text-lg mt-0.5">🚫</span>
                                    <div>
                                        <p className="font-semibold text-surface-100">
                                            {event.skill}
                                            <span className="text-surface-400 font-normal"> — {event.student_name}</span>
                                        </p>
                                        <p className="text-sm text-red-400/80 mt-1">
                                            Reason: {event.reason}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-surface-500">
                                            <span>{CHAIN_ICONS[event.chain_name] || '🔗'} {event.chain_name}</span>
                                            {event.asset_id && <span>Asset #{event.asset_id}</span>}
                                            <span>Revoked by: {event.revoked_by}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-surface-500 whitespace-nowrap ml-4">
                                    {timeAgo(event.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
