'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { EnergyTracker } from '@/components/vibe/energy-tracker';
import { IntimacyStatus } from '@/components/vibe/intimacy-status';
import { PartnerVibe } from '@/components/vibe/partner-vibe';
import { BottomNav } from '@/components/ui/bottom-nav';
import { useState, useEffect } from 'react';
import { MoodLog, FamilyRequest } from '@/lib/types';
import { Settings, Zap, Heart, PauseCircle, X, Clock, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

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
    const supabase = getSupabaseClient();

    const [note, setNote] = useState(userMood?.note || '');
    const [showTimeout, setShowTimeout] = useState(false);
    const [timeoutMinutes, setTimeoutMinutes] = useState(20);
    const [timeoutActive, setTimeoutActive] = useState(false);

    // Family Logic State
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [incomingRequests, setIncomingRequests] = useState<FamilyRequest[]>([]);
    const [sentRequest, setSentRequest] = useState<boolean>(false);
    const [partnerCode, setPartnerCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !user.familyId) return;

        // 1. Get my invite code
        const loadFamilyInfo = async () => {
            const { data } = await supabase
                .from('families')
                .select('invite_code')
                .eq('id', user.familyId!)
                .single();
            if (data) setInviteCode(data.invite_code);
        };

        // 2. Check for incoming requests (if I am in a family)
        const loadIncomingRequests = async () => {
            const { data } = await supabase
                .from('family_requests')
                .select('*')
                .eq('family_id', user.familyId!)
                .eq('status', 'pending');

            if (data) setIncomingRequests(data as FamilyRequest[]);
        };

        // 3. Check if I have sent a request (if I am waiting)
        const checkSentRequests = async () => {
            const { data } = await supabase
                .from('family_requests')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'pending');

            if (data && data.length > 0) setSentRequest(true);
        };

        loadFamilyInfo();
        loadIncomingRequests();
        checkSentRequests();

        // 4. Realtime Subscription for Requests
        const channel = supabase
            .channel('family_requests_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'family_requests'
                },
                (payload) => {
                    // Refresh requests on any change
                    loadIncomingRequests();
                    checkSentRequests();
                    refreshUser(); // In case I was approved and moved
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, refreshUser]);

    const handleSendRequest = async () => {
        if (!partnerCode || !user) return;
        setLoading(true);
        setError('');

        try {
            // Find family by code
            const { data: family, error: findError } = await supabase
                .from('families')
                .select('id')
                .eq('invite_code', partnerCode.trim().toUpperCase())
                .single();

            if (findError || !family) throw new Error('Invalid invite code');

            // Send request
            const { error: reqError } = await supabase
                .from('family_requests')
                .insert({
                    family_id: family.id,
                    user_id: user.id
                });

            if (reqError) throw reqError;

            setSentRequest(true);
            setPartnerCode('');
        } catch (err: any) {
            setError(err.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            // Call the secure RPC function we created
            const { error } = await supabase.rpc('approve_family_request', { request_id: requestId });

            if (error) throw error;

            // Refresh local state
            setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
            refreshUser();
        } catch (err) {
            console.error('Error approving:', err);
            alert('Failed to approve request');
        }
    };

    const handleDeclineRequest = async (requestId: string) => {
        try {
            await supabase.from('family_requests').delete().eq('id', requestId);
            setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error('Error declining:', err);
        }
    };

    const copyInviteCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            alert('Code copied!');
        }
    };


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
                    <Link
                        href="/profile"
                        className="avatar avatar-yellow transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ background: user.avatarColor }}
                    >
                        {user.displayName[0]}
                    </Link>
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

            {/* Partner Connection Section */}
            {!partner && (
                <section className="mb-6">
                    <div className="card">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-pink-400 to-violet-500 flex items-center justify-center mb-3 shadow-lg p-1">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                    <span className="text-3xl">🔗</span>
                                </div>
                            </div>
                            <h3 className="font-bold text-xl mb-1">Link with Partner</h3>
                            <p className="text-sm text-[var(--text-muted)]">
                                Connect to share your vibe & dossier
                            </p>
                        </div>

                        {/* Incoming Requests (Push Notification Simulation) */}
                        {incomingRequests.length > 0 && (
                            <div className="mb-6 bg-violet-50 border border-violet-100 rounded-xl p-4 animate-pulse">
                                <h4 className="font-semibold text-violet-900 mb-2 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
                                    </span>
                                    Incoming Request!
                                </h4>
                                {incomingRequests.map(req => (
                                    <div key={req.id} className="bg-white rounded-lg p-3 shadow-sm">
                                        <p className="text-sm mb-3">
                                            Someone wants to join your family.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                className="btn btn-primary py-2 text-xs flex-1"
                                            >
                                                Allow ✅
                                            </button>
                                            <button
                                                onClick={() => handleDeclineRequest(req.id)}
                                                className="btn btn-secondary py-2 text-xs flex-1"
                                            >
                                                Dismiss ❌
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Connection Methods */}
                        <div className="space-y-6">
                            {/* Option A: Share Code */}
                            <div className="bg-[var(--bg-soft)] rounded-xl p-4 text-center relative overflow-hidden group">
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2"> Your Invite Code</p>
                                <div
                                    onClick={copyInviteCode}
                                    className="text-2xl font-mono font-bold text-[var(--accent-violet)] cursor-pointer hover:scale-110 transition-transform active:scale-95"
                                >
                                    {inviteCode || '...'}
                                </div>
                                <p className="text-[10px] text-[var(--text-muted)] mt-1">Tap to copy & share</p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-[var(--text-muted)]">OR</span>
                                </div>
                            </div>

                            {/* Option B: Enter Partner's Code */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2 ml-1">
                                    ENTER PARTNER'S CODE
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={partnerCode}
                                        onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. A1B2C3"
                                        className="input text-center font-mono uppercase"
                                        maxLength={6}
                                        disabled={!!sentRequest}
                                    />
                                    <button
                                        onClick={handleSendRequest}
                                        disabled={!partnerCode || !!sentRequest || loading}
                                        className="btn btn-primary whitespace-nowrap px-6"
                                    >
                                        {loading ? '...' : sentRequest ? 'Sent' : 'Connect'}
                                    </button>
                                </div>
                                {sentRequest && (
                                    <p className="text-xs text-orange-500 mt-2 text-center flex items-center justify-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Waiting for partner to approve...
                                    </p>
                                )}
                                {error && (
                                    <p className="text-xs text-red-500 mt-2 text-center">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {partner && (
                <section className="mb-6">
                    <h2 className="section-title">Partner&apos;s Vibe</h2>
                    <PartnerVibe
                        partner={partner}
                        mood={partnerMood}
                        onRefresh={refreshUser}
                    />
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
