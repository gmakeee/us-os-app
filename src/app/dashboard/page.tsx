'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { EnergyTracker } from '@/components/vibe/energy-tracker';
import { IntimacyStatus } from '@/components/vibe/intimacy-status';
import { PartnerVibe } from '@/components/vibe/partner-vibe';
import { BottomNav } from '@/components/ui/bottom-nav';
import { useState } from 'react';
import { MoodLog } from '@/lib/types';
import { Settings, Zap, Heart, PauseCircle, X, Clock, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const FAIR_FIGHTING_RULES = [
    "Take turns speaking without interrupting",
    "Use 'I feel...' statements instead of 'You always...'",
    "Stay on topic – one issue at a time",
    "No name-calling or personal attacks",
    "It's okay to take a break and cool down",
    "Remember: you're on the same team",
];

export default function DashboardPage() {
    const { user, partner, userMood, partnerMood, updateMood, refreshUser } = useAuth();
    const [note, setNote] = useState(userMood?.note || '');
    const [showTimeout, setShowTimeout] = useState(false);
    const [timeoutMinutes, setTimeoutMinutes] = useState(20);
    const [timeoutActive, setTimeoutActive] = useState(false);

    // Redirect to auth if not logged in
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card text-center max-w-sm">
                    <div className="text-5xl mb-4">💑</div>
                    <h1 className="text-2xl font-bold mb-2">Welcome to US OS</h1>
                    <p className="text-[var(--text-muted)] mb-6">
                        Your relationship operating system
                    </p>
                    <Link href="/auth" className="btn btn-primary w-full">
                        Login / Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    // Redirect to setup if no family
    if (!user.familyId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card text-center max-w-sm">
                    <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                    <h1 className="text-2xl font-bold mb-2">Set Up Your Family</h1>
                    <p className="text-[var(--text-muted)] mb-6">
                        Create or join a family to start using US OS
                    </p>
                    <Link href="/setup" className="btn btn-primary w-full">
                        Complete Setup
                    </Link>
                </div>
            </div>
        );
    }

    const handleEnergyChange = (level: 1 | 2 | 3 | 4 | 5) => {
        updateMood({ energyLevel: level });
    };

    const handleIntimacyChange = (status: MoodLog['intimacyStatus']) => {
        updateMood({ intimacyStatus: status });
    };

    const handleNoteSubmit = () => {
        if (note.trim()) {
            updateMood({ note: note.trim() });
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-[var(--text-muted)]">Hello,</p>
                    <h1 className="text-2xl font-bold">{user.displayName}!</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/fun"
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center"
                        title="Discover"
                    >
                        <Sparkles className="w-5 h-5 text-[var(--accent-violet)]" />
                    </Link>
                    <Link
                        href="/admin"
                        className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] flex items-center justify-center"
                    >
                        <Settings className="w-5 h-5 text-[var(--text-muted)]" />
                    </Link>
                    <div
                        className="avatar avatar-yellow"
                        style={{ background: user.avatarColor }}
                    >
                        {user.displayName[0]}
                    </div>
                </div>
            </div>

            {/* My Vibe Section */}
            <section className="mb-6">
                <h2 className="section-title flex items-center gap-2">
                    <Heart className="w-4 h-4" fill="currentColor" />
                    My Vibe Today
                </h2>

                <div className="card space-y-5">
                    {/* Energy Level */}
                    <div>
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[var(--accent-violet)]" />
                            Energy Level
                        </p>
                        <EnergyTracker
                            value={userMood?.energyLevel || 3}
                            onChange={handleEnergyChange}
                        />
                    </div>

                    {/* Intimacy Status */}
                    <div>
                        <p className="text-sm font-medium mb-3">How are you feeling?</p>
                        <IntimacyStatus
                            value={userMood?.intimacyStatus || 'open'}
                            onChange={handleIntimacyChange}
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <p className="text-sm font-medium mb-2">Leave a note for your partner</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g., Had a rough day..."
                                className="input flex-1"
                            />
                            <button
                                onClick={handleNoteSubmit}
                                className="btn btn-primary px-4"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partner's Vibe Section */}
            {partner ? (
                <section className="mb-6">
                    <h2 className="section-title">Partner&apos;s Vibe</h2>
                    <PartnerVibe
                        partner={partner}
                        mood={partnerMood}
                        onRefresh={refreshUser}
                    />
                </section>
            ) : (
                <section className="mb-6">
                    <div className="card text-center py-8">
                        <div className="text-4xl mb-3">💕</div>
                        <h3 className="font-semibold mb-2">No Partner Linked Yet</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Go to Admin panel to link with your partner
                        </p>
                        <Link href="/admin" className="btn btn-outline">
                            Open Admin
                        </Link>
                    </div>
                </section>
            )}

            {/* Quick Stats */}
            {partner && partnerMood && (
                <section className="mb-6">
                    <div className="liquid-glass p-4 flex items-center justify-between">
                        <div className="text-center flex-1">
                            <p className="text-xs text-[var(--text-muted)]">You</p>
                            <p className="text-2xl">{userMood?.intimacyStatus ?
                                { hot: '🔥', open: '☁️', snuggle: '🧸', off: '🔒' }[userMood.intimacyStatus]
                                : '❓'}</p>
                        </div>
                        <div className="text-2xl">💕</div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-[var(--text-muted)]">{partner.displayName}</p>
                            <p className="text-2xl">{partnerMood?.intimacyStatus ?
                                { hot: '🔥', open: '☁️', snuggle: '🧸', off: '🔒' }[partnerMood.intimacyStatus]
                                : '❓'}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Timeout FAB */}
            <button
                onClick={() => setShowTimeout(true)}
                className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center z-40"
                title="Need a break?"
            >
                <PauseCircle className="w-7 h-7" />
            </button>

            {/* Timeout Modal */}
            {showTimeout && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeout(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">⏸️ Timeout</h3>
                            <button onClick={() => setShowTimeout(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {!timeoutActive ? (
                            <>
                                <p className="text-sm text-[var(--text-muted)] mb-4">
                                    Need a break to cool down? Send a timeout request to your partner.
                                </p>

                                <div className="mb-6">
                                    <label className="text-sm font-medium mb-2 block">How long do you need?</label>
                                    <div className="flex gap-2">
                                        {[10, 15, 20, 30].map((mins) => (
                                            <button
                                                key={mins}
                                                onClick={() => setTimeoutMinutes(mins)}
                                                className={`flex-1 py-3 rounded-xl font-medium ${timeoutMinutes === mins
                                                    ? 'bg-[var(--accent-violet)] text-white'
                                                    : 'bg-[var(--bg-soft)]'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setTimeoutActive(true)}
                                    className="btn btn-primary w-full mb-6"
                                >
                                    <PauseCircle className="w-5 h-5" />
                                    Send Timeout Request
                                </button>

                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        Fair Fighting Rules
                                    </h4>
                                    <ul className="space-y-2">
                                        {FAIR_FIGHTING_RULES.map((rule, i) => (
                                            <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                                <span className="text-blue-400">•</span>
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-12 h-12 text-blue-500" />
                                </div>
                                <h4 className="font-semibold text-xl mb-2">Timeout Active</h4>
                                <p className="text-[var(--text-muted)] mb-4">
                                    Take {timeoutMinutes} minutes to breathe and reflect.
                                </p>
                                <p className="text-sm">
                                    {partner?.displayName || 'Your partner'} has been notified.
                                </p>
                                <button
                                    onClick={() => { setTimeoutActive(false); setShowTimeout(false); }}
                                    className="btn btn-secondary mt-6"
                                >
                                    End Timeout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
