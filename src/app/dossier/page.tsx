'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { BottomNav } from '@/components/ui/bottom-nav';
import { DOSSIER_CATEGORIES, DossierEntry } from '@/lib/types';
import { getUserDossier, upsertDossierEntry } from '@/lib/mock-auth';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lock, Eye, EyeOff, Save, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

type CategoryKey = keyof typeof DOSSIER_CATEGORIES;

export default function DossierPage() {
    const { user, partner } = useAuth();
    const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');
    const [expandedCategory, setExpandedCategory] = useState<CategoryKey | null>('food');
    const [myDossier, setMyDossier] = useState<DossierEntry[]>([]);
    const [partnerDossier, setPartnerDossier] = useState<DossierEntry[]>([]);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const [privacyValues, setPrivacyValues] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user?.id) {
            const entries = getUserDossier(user.id);
            setMyDossier(entries);

            // Initialize edit values
            const values: Record<string, string> = {};
            const privacy: Record<string, boolean> = {};
            entries.forEach(e => {
                values[`${e.category}-${e.key}`] = e.value;
                privacy[`${e.category}-${e.key}`] = e.isPrivate;
            });
            setEditValues(values);
            setPrivacyValues(privacy);
        }

        if (partner?.id) {
            const entries = getUserDossier(partner.id).filter(e => !e.isPrivate);
            setPartnerDossier(entries);
        }
    }, [user?.id, partner?.id]);

    const handleSave = (category: CategoryKey, key: string) => {
        if (!user) return;
        const fullKey = `${category}-${key}`;
        const value = editValues[fullKey] || '';
        const isPrivate = privacyValues[fullKey] || false;

        upsertDossierEntry(user.id, category, key, value, isPrivate);

        // Refresh
        setMyDossier(getUserDossier(user.id));
    };

    if (!user) {
        return (
            <div className="page-container">
                <div className="card text-center py-8">
                    <p className="text-[var(--text-muted)]">Please login first</p>
                    <Link href="/admin" className="btn btn-primary mt-4">Go to Admin</Link>
                </div>
                <BottomNav />
            </div>
        );
    }

    const getDossierValue = (category: CategoryKey, key: string, fromPartner: boolean): string => {
        const entries = fromPartner ? partnerDossier : myDossier;
        const entry = entries.find(e => e.category === category && e.key === key);
        return entry?.value || '';
    };

    const categories = Object.entries(DOSSIER_CATEGORIES) as [CategoryKey, typeof DOSSIER_CATEGORIES[CategoryKey]][];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Partner&apos;s Dossier</h1>
                <div
                    className="avatar avatar-yellow"
                    style={{ background: user.avatarColor }}
                >
                    {user.displayName[0]}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`flex-1 btn ${activeTab === 'mine' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <UserIcon className="w-4 h-4" />
                    My Info
                </button>
                <button
                    onClick={() => setActiveTab('partner')}
                    className={`flex-1 btn ${activeTab === 'partner' ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={!partner}
                >
                    <Eye className="w-4 h-4" />
                    {partner?.displayName || 'Partner'}
                </button>
            </div>

            {/* Category Cards */}
            <div className="space-y-4">
                {categories.map(([key, info]) => {
                    const isExpanded = expandedCategory === key;

                    return (
                        <div key={key} className="card">
                            <button
                                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                                className="w-full flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{info.emoji}</span>
                                    <span className="font-semibold">{info.label}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="mt-4 space-y-4 pt-4 border-t border-[var(--bg-soft)]">
                                    {info.fields.map((field) => {
                                        const fullKey = `${key}-${field}`;
                                        const value = activeTab === 'mine'
                                            ? (editValues[fullKey] || '')
                                            : getDossierValue(key, field, true);
                                        const isPrivate = privacyValues[fullKey] || false;

                                        return (
                                            <div key={field}>
                                                <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-2 mb-2">
                                                    {field}
                                                    {activeTab === 'mine' && isPrivate && (
                                                        <Lock className="w-3 h-3" />
                                                    )}
                                                </label>

                                                {activeTab === 'mine' ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editValues[fullKey] || ''}
                                                            onChange={(e) => setEditValues({
                                                                ...editValues,
                                                                [fullKey]: e.target.value
                                                            })}
                                                            placeholder={`Enter your ${field.toLowerCase()}`}
                                                            className="input flex-1"
                                                        />
                                                        <button
                                                            onClick={() => setPrivacyValues({
                                                                ...privacyValues,
                                                                [fullKey]: !isPrivate
                                                            })}
                                                            className={`btn ${isPrivate ? 'btn-danger' : 'btn-secondary'} px-3`}
                                                            title={isPrivate ? 'Private - Hidden from partner' : 'Public - Visible to partner'}
                                                        >
                                                            {isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleSave(key, field)}
                                                            className="btn btn-primary px-3"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="bg-[var(--bg-soft)] rounded-xl p-3">
                                                        {value || <span className="text-[var(--text-muted)] italic">Not set</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <BottomNav />
        </div>
    );
}
