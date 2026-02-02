'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
    LogOut,
    ArrowLeft,
    Mail,
    Lock,
    Users,
    Copy,
    Check,
    Eye,
    EyeOff,
    Shield
} from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, refreshUser } = useAuth();
    const router = useRouter();
    const supabase = getSupabaseClient();

    const [familyCode, setFamilyCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('********'); // Placeholder since we can't get real password
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        const loadFamily = async () => {
            if (!user?.familyId) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('families')
                .select('invite_code')
                .eq('id', user.familyId)
                .single();

            if (data) {
                setFamilyCode(data.invite_code);
            }
            setLoading(false);
        };

        if (user) loadFamily();
    }, [user, supabase]);

    const handleLogout = async () => {
        await logout();
        router.push('/auth');
    };

    const copyCode = () => {
        if (familyCode) {
            navigator.clipboard.writeText(familyCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) return;

        setUpdateMessage('Updating...');
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setUpdateMessage(`Error: ${error.message}`);
        } else {
            setUpdateMessage('Password updated successfully!');
            setPassword(newPassword); // Mock update visually
            setIsEditingPassword(false);
            setNewPassword('');
            setTimeout(() => setUpdateMessage(''), 3000);
        }
    };

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-lavender)] p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-soft)] transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">My Profile</h1>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4"
                        style={{ background: user.avatarColor }}
                    >
                        {user.displayName[0]}
                    </div>
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                </div>

                {/* Account Info Card */}
                <div className="card space-y-4">
                    <h3 className="section-title text-sm uppercase tracking-wider text-[var(--text-muted)]">Account Details</h3>

                    {/* Email */}
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-soft)] rounded-xl">
                        <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-[var(--text-muted)]">Email</p>
                            <p className="font-medium truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="p-3 bg-[var(--bg-soft)] rounded-xl">
                        {!isEditingPassword ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)]">Password</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg tracking-widest">
                                                {showPassword ? (password === '********' ? 'Hidden' : password) : '********'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditingPassword(true)}
                                    className="text-xs font-bold text-[var(--accent-violet)] px-3 py-1 bg-white rounded-lg shadow-sm"
                                >
                                    CHANGE
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordUpdate} className="flex gap-2">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                    className="input py-2 text-sm"
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary py-2 px-4 text-sm">Save</button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPassword(false)}
                                    className="btn btn-secondary py-2 px-3"
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                        {updateMessage && <p className="text-xs text-[var(--accent-violet)] mt-2 text-center">{updateMessage}</p>}
                    </div>
                </div>

                {/* Family Info Card */}
                {familyCode && (
                    <div className="card space-y-4">
                        <h3 className="section-title text-sm uppercase tracking-wider text-[var(--text-muted)]">Family Invite Code</h3>

                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6 rounded-2xl text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <Users className="w-16 h-16" />
                            </div>

                            <p className="text-white/80 mb-2 text-sm">Valid for partner join</p>
                            <div
                                onClick={copyCode}
                                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-white/30 transition-all active:scale-95"
                            >
                                <span className="text-3xl font-mono font-bold tracking-[0.2em]">{familyCode}</span>
                                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                            </div>
                            <p className="text-xs mt-3 text-white/70">Tap code to copy</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 border-none flex items-center justify-center gap-2 py-4"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out of Account
                </button>

                <p className="text-center text-xs text-[var(--text-muted)] pt-8">
                    US OS v1.0 • Built with ❤️
                </p>
            </div>
        </div>
    );
}
