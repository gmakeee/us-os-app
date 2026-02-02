'use client';

import { useState, useEffect } from 'react';
import {
    getAllData,
    clearAllData,
    createFamily,
    createUser,
    linkPartners,
    getUsers,
    getFamilies,
} from '@/lib/mock-auth';
import { useAuth } from '@/lib/supabase-auth-context';
import { User, Family } from '@/lib/types';
import {
    Shield,
    Users,
    Home,
    Trash2,
    RefreshCw,
    Copy,
    Check,
    UserPlus,
    Link2,
    Eye,
    LogIn
} from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
    const { user, login, refreshUser } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [families, setFamilies] = useState<Family[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [showData, setShowData] = useState(false);
    const [allData, setAllData] = useState<ReturnType<typeof getAllData> | null>(null);

    const loadData = () => {
        setFamilies(getFamilies());
        setUsers(getUsers());
        setAllData(getAllData());
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        }
    };

    const handleCreateFamily = () => {
        createFamily();
        loadData();
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserName) return;
        createUser(newUserEmail, newUserName, selectedFamilyId || undefined);
        setNewUserEmail('');
        setNewUserName('');
        loadData();
    };

    const handleLinkPartners = (user1Id: string, user2Id: string, familyId: string) => {
        linkPartners(user1Id, user2Id, familyId);
        loadData();
    };

    const handleSwitchUser = (userId: string) => {
        // Switch user only works with mock auth, not Supabase
        // To switch users, logout and login with the target user's credentials
        alert('Switch user is disabled in Supabase mode. Please logout and login with another account.');
    };

    const handleClearAll = () => {
        if (confirm('Are you sure? This will delete ALL data.')) {
            clearAllData();
            loadData();
            refreshUser();
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-sm w-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-violet)] flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Panel</h1>
                            <p className="text-sm text-[var(--text-muted)]">US OS Testing</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="input"
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary w-full">
                            Access Admin
                        </button>
                    </form>

                    <p className="text-xs text-center text-[var(--text-muted)] mt-4">
                        Hint: admin123
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-violet)] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Admin SSO</h1>
                </div>
                <a href="/" className="btn btn-secondary">
                    <Home className="w-4 h-4" />
                    App
                </a>
            </div>

            {user && (
                <div className="liquid-glass p-4 mb-6 flex items-center gap-3">
                    <div
                        className="avatar"
                        style={{ background: user.avatarColor }}
                    >
                        {user.displayName[0]}
                    </div>
                    <div>
                        <p className="font-semibold">Logged in as: {user.displayName}</p>
                        <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                    </div>
                </div>
            )}

            {/* Families Section */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Families
                    </h2>
                    <button onClick={handleCreateFamily} className="btn btn-primary text-sm">
                        + New Family
                    </button>
                </div>

                <div className="space-y-3">
                    {families.length === 0 ? (
                        <div className="card-sm text-center text-[var(--text-muted)]">
                            No families yet. Create one to start.
                        </div>
                    ) : (
                        families.map((family) => {
                            const familyUsers = users.filter(u => u.familyId === family.id);
                            return (
                                <div key={family.id} className="card-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono text-lg font-bold text-[var(--accent-violet)]">
                                            {family.inviteCode}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(family.inviteCode)}
                                            className="btn btn-secondary text-xs py-2 px-3"
                                        >
                                            {copiedCode === family.inviteCode ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {familyUsers.map((u) => (
                                            <div
                                                key={u.id}
                                                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${user?.id === u.id
                                                    ? 'bg-[var(--accent-violet)] text-white'
                                                    : 'bg-[var(--bg-soft)]'
                                                    }`}
                                            >
                                                <span>{u.displayName}</span>
                                                {u.partnerId && <Link2 className="w-3 h-3" />}
                                            </div>
                                        ))}
                                        {familyUsers.length === 0 && (
                                            <span className="text-sm text-[var(--text-muted)]">No users</span>
                                        )}
                                    </div>

                                    {familyUsers.length === 2 && !familyUsers[0].partnerId && (
                                        <button
                                            onClick={() => handleLinkPartners(familyUsers[0].id, familyUsers[1].id, family.id)}
                                            className="btn btn-outline w-full mt-3 text-sm"
                                        >
                                            <Link2 className="w-4 h-4" />
                                            Link as Partners
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Create User Section */}
            <section className="mb-8">
                <h2 className="section-title flex items-center gap-2 mb-4">
                    <UserPlus className="w-4 h-4" />
                    Create User
                </h2>

                <form onSubmit={handleCreateUser} className="card-sm space-y-4">
                    <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Email"
                        className="input"
                        required
                    />
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Display Name"
                        className="input"
                        required
                    />
                    <select
                        value={selectedFamilyId}
                        onChange={(e) => setSelectedFamilyId(e.target.value)}
                        className="input"
                    >
                        <option value="">No family (standalone)</option>
                        {families.map((f) => (
                            <option key={f.id} value={f.id}>
                                Family: {f.inviteCode}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-primary w-full">
                        Create User
                    </button>
                </form>
            </section>

            {/* All Users / Switch User Section */}
            <section className="mb-8">
                <h2 className="section-title flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4" />
                    Switch User
                </h2>

                <div className="space-y-2">
                    {users.length === 0 ? (
                        <div className="card-sm text-center text-[var(--text-muted)]">
                            No users yet.
                        </div>
                    ) : (
                        users.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => handleSwitchUser(u.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${user?.id === u.id
                                    ? 'bg-[var(--accent-violet)] text-white'
                                    : 'bg-white hover:bg-[var(--bg-soft)]'
                                    }`}
                            >
                                <div
                                    className="avatar w-10 h-10 text-sm"
                                    style={{ background: u.avatarColor }}
                                >
                                    {u.displayName[0]}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-semibold">{u.displayName}</p>
                                    <p className={`text-xs ${user?.id === u.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                        {u.email}
                                    </p>
                                </div>
                                <LogIn className="w-5 h-5" />
                            </button>
                        ))
                    )}
                </div>
            </section>

            {/* View Data / Reset Section */}
            <section className="mb-8">
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => { loadData(); setShowData(!showData); }}
                        className="btn btn-secondary flex-1"
                    >
                        <Eye className="w-4 h-4" />
                        {showData ? 'Hide' : 'View'} Data
                    </button>
                    <button onClick={loadData} className="btn btn-secondary">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={handleClearAll} className="btn btn-danger">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {showData && allData && (
                    <pre className="card-sm text-xs overflow-auto max-h-96 bg-gray-900 text-green-400 font-mono">
                        {JSON.stringify(allData, null, 2)}
                    </pre>
                )}
            </section>
        </div>
    );
}
