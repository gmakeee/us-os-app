'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { BottomNav } from '@/components/ui/bottom-nav';
import { DATE_TAGS, DateIdea, Expense, SavingsGoal } from '@/lib/types';
import {
    getDateIdeas,
    addDateIdea,
    getExpenses,
    addExpense,
    calculateSettleUp,
    getSavingsGoals,
    addSavingsGoal,
    contributeTotalSavingsGoal,
    createDateVote,
    getDateVotes,
    submitVote
} from '@/lib/memory-storage';
import { useState, useEffect } from 'react';
import {
    Shuffle,
    Plus,
    Wallet,
    PiggyBank,
    Sparkles,
    X,
    Check,
    Clock,
    Calendar,
    Heart
} from 'lucide-react';
import Link from 'next/link';

const EXPENSE_CATEGORIES = ['🍔 Food', '🏠 Home', '🎉 Fun', '🚗 Transport', '🛒 Shopping', '📱 Other'];

export default function LifePage() {
    const { user, partner } = useAuth();
    const [activeTab, setActiveTab] = useState<'dates' | 'money'>('dates');
    const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [activeVote, setActiveVote] = useState<{ idea: DateIdea; voteId: string } | null>(null);

    // Modals
    const [showAddIdea, setShowAddIdea] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [showContribute, setShowContribute] = useState<string | null>(null);
    const [randomIdea, setRandomIdea] = useState<DateIdea | null>(null);

    // Form states
    const [ideaTitle, setIdeaTitle] = useState('');
    const [ideaTags, setIdeaTags] = useState<DateIdea['tags']>([]);
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [goalEmoji, setGoalEmoji] = useState('✈️');
    const [contributeAmount, setContributeAmount] = useState('');

    const familyId = user?.familyId || '';

    useEffect(() => {
        if (familyId) {
            setDateIdeas(getDateIdeas(familyId));
            setExpenses(getExpenses(familyId));
            setSavingsGoals(getSavingsGoals(familyId));
        }
    }, [familyId]);

    const balance = user && partner
        ? calculateSettleUp(familyId, user.id, partner.id)
        : 0;

    const handleAddIdea = () => {
        if (!user || !familyId || !ideaTitle) return;
        addDateIdea(familyId, user.id, ideaTitle, ideaTags);
        setDateIdeas(getDateIdeas(familyId));
        setIdeaTitle('');
        setIdeaTags([]);
        setShowAddIdea(false);
    };

    const handleRandomShake = () => {
        const available = dateIdeas.filter(d => !d.isCompleted);
        if (available.length === 0) return;
        const random = available[Math.floor(Math.random() * available.length)];
        setRandomIdea(random);
        // Create vote
        const vote = createDateVote(familyId, random.id);
        setActiveVote({ idea: random, voteId: vote.id });
    };

    const handleVote = (isYes: boolean) => {
        if (!user || !activeVote) return;
        const result = submitVote(activeVote.voteId, user.id, isYes);
        if (result?.status === 'matched') {
            alert('🎉 It\'s a match! Date is ON!');
        } else if (result?.status === 'declined') {
            alert('Maybe next time! 💭');
        }
        setActiveVote(null);
        setRandomIdea(null);
    };

    const handleAddExpense = () => {
        if (!user || !familyId || !expenseAmount) return;
        addExpense(familyId, user.id, parseFloat(expenseAmount), expenseDesc, expenseCategory);
        setExpenses(getExpenses(familyId));
        setExpenseAmount('');
        setExpenseDesc('');
        setShowAddExpense(false);
    };

    const handleAddGoal = () => {
        if (!familyId || !goalTitle || !goalAmount) return;
        addSavingsGoal(familyId, goalTitle, parseFloat(goalAmount), goalEmoji);
        setSavingsGoals(getSavingsGoals(familyId));
        setGoalTitle('');
        setGoalAmount('');
        setShowAddGoal(false);
    };

    const handleContribute = (goalId: string) => {
        if (!contributeAmount) return;
        contributeTotalSavingsGoal(goalId, parseFloat(contributeAmount));
        setSavingsGoals(getSavingsGoals(familyId));
        setContributeAmount('');
        setShowContribute(null);
    };

    const toggleTag = (tag: DateIdea['tags'][number]) => {
        if (ideaTags.includes(tag)) {
            setIdeaTags(ideaTags.filter(t => t !== tag));
        } else {
            setIdeaTags([...ideaTags, tag]);
        }
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

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Life Together</h1>
                <Sparkles className="w-6 h-6 text-[var(--accent-violet)]" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('dates')}
                    className={`flex-1 btn ${activeTab === 'dates' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <Calendar className="w-4 h-4" />
                    Date Ideas
                </button>
                <button
                    onClick={() => setActiveTab('money')}
                    className={`flex-1 btn ${activeTab === 'money' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <Wallet className="w-4 h-4" />
                    Finances
                </button>
            </div>

            {/* Date Ideas Tab */}
            {activeTab === 'dates' && (
                <div className="space-y-4">
                    {/* Random Generator */}
                    <button
                        onClick={handleRandomShake}
                        disabled={dateIdeas.filter(d => !d.isCompleted).length === 0}
                        className="card w-full flex items-center gap-4 bg-gradient-to-r from-pink-100 to-violet-100"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                            <Shuffle className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Shake It Up! 🎲</h3>
                            <p className="text-sm text-[var(--text-muted)]">Random date with Double Yes</p>
                        </div>
                    </button>

                    {/* Add Idea */}
                    <button
                        onClick={() => setShowAddIdea(true)}
                        className="card w-full flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-soft)] flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[var(--accent-violet)]" />
                        </div>
                        <span className="font-medium">Add Date Idea</span>
                    </button>

                    {/* Ideas List */}
                    {dateIdeas.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-[var(--text-muted)] px-1">
                                Your Ideas ({dateIdeas.length})
                            </h3>
                            {dateIdeas.filter(d => !d.isCompleted).map((idea) => (
                                <div key={idea.id} className="card py-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{idea.title}</span>
                                        <div className="flex gap-1">
                                            {idea.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-soft)]"
                                                >
                                                    {DATE_TAGS[tag].emoji}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Money Tab */}
            {activeTab === 'money' && (
                <div className="space-y-4">
                    {/* Settle Up Card */}
                    <div className="card">
                        <h3 className="font-semibold mb-3">💰 Settle Up</h3>
                        <div className="text-center py-4">
                            {balance === 0 ? (
                                <p className="text-lg text-green-600 font-medium">All even! 🎉</p>
                            ) : balance > 0 ? (
                                <p className="text-lg">
                                    <span className="font-bold">{partner?.displayName}</span> owes you{' '}
                                    <span className="text-green-600 font-bold">${balance.toFixed(2)}</span>
                                </p>
                            ) : (
                                <p className="text-lg">
                                    You owe <span className="font-bold">{partner?.displayName}</span>{' '}
                                    <span className="text-red-500 font-bold">${Math.abs(balance).toFixed(2)}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Add Expense */}
                    <button
                        onClick={() => setShowAddExpense(true)}
                        className="card w-full flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-soft)] flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[var(--accent-violet)]" />
                        </div>
                        <span className="font-medium">Add Expense</span>
                    </button>

                    {/* Recent Expenses */}
                    {expenses.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm text-[var(--text-muted)] px-1">
                                Recent Expenses
                            </h3>
                            {expenses.slice(0, 5).map((exp) => (
                                <div key={exp.id} className="card py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{exp.description || exp.category}</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {exp.paidBy === user.id ? 'You' : partner?.displayName} paid
                                        </p>
                                    </div>
                                    <span className="font-bold">${exp.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Savings Goals */}
                    <div className="pt-4 border-t border-[var(--bg-soft)]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <PiggyBank className="w-5 h-5" />
                                Savings Goals
                            </h3>
                            <button onClick={() => setShowAddGoal(true)} className="text-[var(--accent-violet)]">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {savingsGoals.map((goal) => {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            return (
                                <div key={goal.id} className="card mb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">
                                            {goal.emoji} {goal.title}
                                        </span>
                                        <span className="text-sm text-[var(--text-muted)]">
                                            ${goal.currentAmount} / ${goal.targetAmount}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-[var(--bg-soft)] rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowContribute(goal.id)}
                                        className="text-sm text-[var(--accent-violet)] font-medium"
                                    >
                                        + Add funds
                                    </button>
                                </div>
                            );
                        })}

                        {savingsGoals.length === 0 && (
                            <p className="text-sm text-[var(--text-muted)] text-center py-4">
                                No savings goals yet. Start saving for something special! 🎯
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Random Date Vote Modal */}
            {randomIdea && activeVote && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center slide-up">
                        <h3 className="text-2xl mb-2">🎲</h3>
                        <h4 className="font-bold text-xl mb-2">Tonight&apos;s Date?</h4>
                        <p className="text-lg mb-6 font-medium">{randomIdea.title}</p>

                        <div className="flex gap-3">
                            {randomIdea.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="text-sm px-3 py-1 rounded-full bg-[var(--bg-soft)] flex-1"
                                >
                                    {DATE_TAGS[tag].emoji} {DATE_TAGS[tag].label}
                                </span>
                            ))}
                        </div>

                        <p className="text-sm text-[var(--text-muted)] my-4">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Both must vote within 5 minutes!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVote(false)}
                                className="btn btn-secondary flex-1"
                            >
                                <X className="w-5 h-5" />
                                Not Today
                            </button>
                            <button
                                onClick={() => handleVote(true)}
                                className="btn btn-primary flex-1"
                            >
                                <Heart className="w-5 h-5" />
                                Let&apos;s Do It!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Date Idea Modal */}
            {showAddIdea && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">💡 Add Date Idea</h3>
                            <button onClick={() => setShowAddIdea(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    What&apos;s the plan?
                                </label>
                                <input
                                    type="text"
                                    value={ideaTitle}
                                    onChange={(e) => setIdeaTitle(e.target.value)}
                                    placeholder="Sunset picnic, Game night..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(Object.entries(DATE_TAGS) as [keyof typeof DATE_TAGS, typeof DATE_TAGS['free']][]).map(([key, info]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleTag(key)}
                                            className={`px-4 py-2 rounded-xl ${ideaTags.includes(key)
                                                ? 'bg-[var(--accent-violet)] text-white'
                                                : 'bg-[var(--bg-soft)]'
                                                }`}
                                        >
                                            {info.emoji} {info.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddIdea}
                                disabled={!ideaTitle}
                                className={`btn btn-primary w-full ${!ideaTitle ? 'opacity-50' : ''}`}
                            >
                                Add to Bank
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showAddExpense && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">💸 Add Expense</h3>
                            <button onClick={() => setShowAddExpense(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    value={expenseAmount}
                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="input text-2xl font-bold"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={expenseDesc}
                                    onChange={(e) => setExpenseDesc(e.target.value)}
                                    placeholder="What was it for?"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Category
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {EXPENSE_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setExpenseCategory(cat)}
                                            className={`py-2 px-3 rounded-xl text-sm ${expenseCategory === cat
                                                ? 'bg-[var(--accent-violet)] text-white'
                                                : 'bg-[var(--bg-soft)]'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAddExpense}
                                disabled={!expenseAmount}
                                className={`btn btn-primary w-full ${!expenseAmount ? 'opacity-50' : ''}`}
                            >
                                Log Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Savings Goal Modal */}
            {showAddGoal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">🎯 New Savings Goal</h3>
                            <button onClick={() => setShowAddGoal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {['✈️', '🏠', '💍', '🎮', '📱', '🎁'].map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => setGoalEmoji(emoji)}
                                        className={`w-12 h-12 rounded-xl text-2xl ${goalEmoji === emoji
                                            ? 'bg-[var(--accent-violet)] text-white'
                                            : 'bg-[var(--bg-soft)]'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    What are you saving for?
                                </label>
                                <input
                                    type="text"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    placeholder="Trip to Hawaii..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Target Amount
                                </label>
                                <input
                                    type="number"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(e.target.value)}
                                    placeholder="5000"
                                    className="input"
                                />
                            </div>

                            <button
                                onClick={handleAddGoal}
                                disabled={!goalTitle || !goalAmount}
                                className={`btn btn-primary w-full ${(!goalTitle || !goalAmount) ? 'opacity-50' : ''}`}
                            >
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContribute && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">💵 Add Funds</h3>
                            <button onClick={() => setShowContribute(null)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <input
                            type="number"
                            value={contributeAmount}
                            onChange={(e) => setContributeAmount(e.target.value)}
                            placeholder="Amount"
                            className="input text-xl font-bold mb-4"
                        />

                        <button
                            onClick={() => handleContribute(showContribute)}
                            disabled={!contributeAmount}
                            className={`btn btn-primary w-full ${!contributeAmount ? 'opacity-50' : ''}`}
                        >
                            Add to Savings
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
