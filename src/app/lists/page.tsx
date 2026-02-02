'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { BottomNav } from '@/components/ui/bottom-nav';
import { ListItem } from '@/lib/types';
import {
    getFamilyLists,
    createListItem,
    updateListItem,
    claimListItem,
    revealSurprise,
} from '@/lib/mock-auth';
import { useState, useEffect } from 'react';
import {
    Plus,
    CheckCircle2,
    Circle,
    Gift,
    ListTodo,
    Sparkles,
    Eye,
    EyeOff,
    Trash2,
    Check
} from 'lucide-react';
import Link from 'next/link';

type ListType = 'task' | 'wish' | 'surprise';

export default function ListsPage() {
    const { user, partner } = useAuth();
    const [activeTab, setActiveTab] = useState<ListType>('task');
    const [items, setItems] = useState<ListItem[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const loadItems = () => {
        if (user?.familyId) {
            const allItems = getFamilyLists(user.familyId, user.id);
            setItems(allItems);
        }
    };

    useEffect(() => {
        loadItems();
    }, [user]);

    const handleAdd = () => {
        if (!newTitle.trim() || !user?.familyId) return;
        createListItem(user.familyId, user.id, newTitle.trim(), activeTab);
        setNewTitle('');
        setShowAddForm(false);
        loadItems();
    };

    const handleToggleStatus = (item: ListItem) => {
        const newStatus = item.status === 'completed' ? 'active' : 'completed';
        updateListItem(item.id, { status: newStatus });
        loadItems();
    };

    const handleClaim = (itemId: string) => {
        if (!user) return;
        claimListItem(itemId, user.id);
        loadItems();
    };

    const handleReveal = (itemId: string) => {
        revealSurprise(itemId);
        loadItems();
    };

    const handleDelete = (itemId: string) => {
        updateListItem(itemId, { status: 'archived' });
        loadItems();
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

    const filteredItems = items.filter(i => i.type === activeTab && i.status !== 'archived');
    const mySurprises = items.filter(i => i.type === 'surprise' && i.creatorId === user.id && i.status !== 'archived');

    const tabs = [
        { key: 'task' as ListType, label: 'To-Do', icon: ListTodo, color: 'from-blue-400 to-cyan-500' },
        { key: 'wish' as ListType, label: 'Wishlist', icon: Gift, color: 'from-pink-400 to-rose-500' },
        { key: 'surprise' as ListType, label: 'Surprises', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Smart Lists</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${isActive
                                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                : 'bg-white text-[var(--text-muted)]'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50" onClick={() => setShowAddForm(false)}>
                    <div className="bg-white rounded-t-3xl p-6 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">Add {tabs.find(t => t.key === activeTab)?.label}</h3>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="What's on your mind?"
                            className="input mb-4"
                            autoFocus
                        />
                        {activeTab === 'surprise' && (
                            <div className="bg-amber-50 text-amber-800 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
                                <EyeOff className="w-4 h-4" />
                                This will be hidden from your partner until you reveal it!
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary flex-1">
                                Cancel
                            </button>
                            <button onClick={handleAdd} className="btn btn-primary flex-1">
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List Items */}
            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <div className="card text-center py-8 text-[var(--text-muted)]">
                        <p>No items yet</p>
                        <p className="text-sm mt-1">Tap + to add your first item</p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const isOwn = item.creatorId === user.id;
                        const isClaimed = !!item.claimedBy;
                        const claimedByMe = item.claimedBy === user.id;

                        return (
                            <div
                                key={item.id}
                                className={`card flex items-center gap-3 ${item.status === 'completed' ? 'opacity-60' : ''
                                    }`}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => handleToggleStatus(item)}
                                    className="flex-shrink-0"
                                >
                                    {item.status === 'completed' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-[var(--text-muted)]" />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium ${item.status === 'completed' ? 'line-through' : ''}`}>
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {isOwn ? 'You' : partner?.displayName}
                                        {activeTab === 'wish' && isClaimed && !isOwn && (
                                            <span className="ml-2 text-green-600">✓ Claimed by you</span>
                                        )}
                                        {activeTab === 'wish' && isClaimed && isOwn && !claimedByMe && (
                                            <span className="ml-2 text-[var(--accent-violet)]">🎁 Gifted!</span>
                                        )}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {activeTab === 'wish' && !isOwn && !isClaimed && item.status !== 'completed' && (
                                        <button
                                            onClick={() => handleClaim(item.id)}
                                            className="btn btn-primary text-xs py-2 px-3"
                                        >
                                            <Check className="w-3 h-3" />
                                            Claim
                                        </button>
                                    )}

                                    {activeTab === 'surprise' && isOwn && item.visibility === 'secret_until_reveal' && (
                                        <button
                                            onClick={() => handleReveal(item.id)}
                                            className="btn btn-primary text-xs py-2 px-3"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Reveal
                                        </button>
                                    )}

                                    {isOwn && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn btn-secondary text-xs py-2 px-3"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* My Surprises Section (only on surprise tab) */}
            {activeTab === 'surprise' && mySurprises.length > 0 && (
                <div className="mt-8">
                    <h2 className="section-title flex items-center gap-2 mb-4">
                        <EyeOff className="w-4 h-4" />
                        My Hidden Surprises
                    </h2>
                    <div className="liquid-glass p-4 space-y-3">
                        {mySurprises.map(item => (
                            <div key={item.id} className="flex items-center justify-between">
                                <span className="font-medium">{item.title}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${item.visibility === 'secret_until_reveal'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {item.visibility === 'secret_until_reveal' ? '🙈 Hidden' : '👁 Revealed'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
