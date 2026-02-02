'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/supabase-auth-context';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Heart, Users, Copy, Check, ArrowRight, UserPlus, Home, LogOut } from 'lucide-react';

export default function SetupPage() {
    const { user, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
    const [inviteCode, setInviteCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const supabase = getSupabaseClient();

    // If user already has a family, redirect to dashboard
    if (user?.familyId) {
        router.push('/dashboard');
        return null;
    }

    const handleCreateFamily = async () => {
        if (!user) return;
        setLoading(true);
        setError('');

        try {
            // Create new family
            const { data: family, error: createError } = await supabase
                .from('families')
                .insert({})
                .select()
                .single();

            if (createError) throw createError;

            // Update user's family_id
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ family_id: family.id })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setGeneratedCode(family.invite_code);
            setMode('create');
            await refreshUser();
        } catch (err) {
            setError('Failed to create family. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async () => {
        if (!user || !inviteCode.trim()) return;
        setLoading(true);
        setError('');

        try {
            // Find family by invite code
            const { data: family, error: findError } = await supabase
                .from('families')
                .select('id')
                .ilike('invite_code', inviteCode.trim())
                .single();

            if (findError || !family) {
                setError('Invalid invite code. Please check and try again.');
                setLoading(false);
                return;
            }

            // Update user's family_id
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ family_id: family.id })
                .eq('id', user.id);

            if (updateError) throw updateError;

            await refreshUser();
            router.push('/dashboard');
        } catch (err) {
            setError('Failed to join family. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/auth');
    };

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-lavender)]">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center mb-4 shadow-lg">
                        <Heart className="w-10 h-10 text-white" fill="white" />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome, {user?.displayName}! 👋</h1>
                    <p className="text-[var(--text-muted)] mt-2">Let's set up your couple space</p>
                </div>

                {/* Choice Mode */}
                {mode === 'choice' && (
                    <div className="space-y-4">
                        <button
                            onClick={handleCreateFamily}
                            disabled={loading}
                            className="card w-full p-6 text-left hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">Create New Family</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Start fresh and invite your partner with a code
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-violet)] transition-colors" />
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            disabled={loading}
                            className="card w-full p-6 text-left hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">Join Partner's Family</h3>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Enter an invite code from your partner
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-violet)] transition-colors" />
                            </div>
                        </button>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full py-3 text-[var(--text-muted)] hover:text-[var(--text-dark)] transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                )}

                {/* Create Mode - Show invite code */}
                {mode === 'create' && generatedCode && (
                    <div className="card text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Family Created! 🎉</h2>
                        <p className="text-[var(--text-muted)] mb-6">
                            Share this code with your partner
                        </p>

                        <div className="bg-[var(--bg-soft)] rounded-2xl p-4 mb-6">
                            <p className="text-3xl font-mono font-bold tracking-widest text-[var(--accent-violet)]">
                                {generatedCode}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={copyCode}
                                className="btn btn-secondary flex-1"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                            <button
                                onClick={goToDashboard}
                                className="btn btn-primary flex-1"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Join Mode - Enter code */}
                {mode === 'join' && (
                    <div className="card">
                        <button
                            onClick={() => setMode('choice')}
                            className="text-[var(--text-muted)] hover:text-[var(--text-dark)] mb-4 flex items-center gap-1"
                        >
                            ← Back
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-pink-600" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Join Family</h2>
                            <p className="text-[var(--text-muted)]">
                                Enter the invite code from your partner
                            </p>
                        </div>

                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="ABCD1234"
                            className="input text-center text-2xl font-mono tracking-widest mb-4"
                            maxLength={8}
                            autoFocus
                        />

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleJoinFamily}
                            disabled={loading || inviteCode.length < 4}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Joining...' : 'Join Family'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
