'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/supabase-auth-context';
import { Mail, Lock, User, ArrowRight, Sparkles, Users, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const { login, signup, loading, user } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect logic:
    // 1. If user is loaded
    // 2. If user has familyId -> Dashboard
    // 3. If user has NO familyId -> Setup
    useEffect(() => {
        if (user && !loading) {
            console.log('User logged in, redirecting...', user);
            if (user.familyId) {
                router.push('/dashboard');
            } else {
                router.push('/setup');
            }
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        console.log('Submitting login...', { email, mode });

        if (mode === 'signup') {
            const { error } = await signup(email, password, displayName);
            console.log('Signup result:', { error });
            if (error) {
                setError(error.message);
            } else {
                setSuccess('Check your email to confirm your account!');
            }
        } else {
            const { error } = await login(email, password);
            console.log('Login result:', { error });
            if (error) {
                setError(error.message);
            }
            // After login, the user state will update and trigger the redirect via useEffect
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-lavender)]">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center mb-4 shadow-lg">
                        <Heart className="w-10 h-10 text-white" fill="white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                        US OS
                    </h1>
                    <p className="text-[var(--text-muted)] mt-2">Your Relationship Operating System</p>
                </div>

                {/* Auth Card */}
                <div className="card">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${mode === 'login'
                                ? 'bg-[var(--accent-violet)] text-white'
                                : 'bg-[var(--bg-soft)]'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${mode === 'signup'
                                ? 'bg-[var(--accent-violet)] text-white'
                                : 'bg-[var(--bg-soft)]'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Your Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Alex"
                                        className="input"
                                        style={{ paddingLeft: '48px' }}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input"
                                    style={{ paddingLeft: '48px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input"
                                    style={{ paddingLeft: '48px' }}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-4"
                        >
                            {loading ? (
                                'Loading...'
                            ) : mode === 'login' ? (
                                <>
                                    Login
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-pink-100 flex items-center justify-center mb-2">
                            <Heart className="w-5 h-5 text-pink-500" />
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Vibe Sync</p>
                    </div>
                    <div className="p-3">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-violet-100 flex items-center justify-center mb-2">
                            <Users className="w-5 h-5 text-violet-500" />
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Partner Link</p>
                    </div>
                    <div className="p-3">
                        <div className="w-10 h-10 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Memory Box</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
