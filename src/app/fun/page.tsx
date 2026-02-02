'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { BottomNav } from '@/components/ui/bottom-nav';
import { QuizEngine } from '@/components/quizzes/quiz-engine';
import { TriviaBuilder } from '@/components/quizzes/trivia-builder';
import { QuizResult } from '@/components/quizzes/quiz-result';
import {
    LOVE_LANGUAGES_QUIZ,
    ATTACHMENT_STYLE_QUIZ,
    scoreLoveLanguages,
    scoreAttachmentStyle
} from '@/lib/quizzes';
import { upsertDossierEntry } from '@/lib/mock-auth';
import { useState } from 'react';
import {
    Sparkles,
    Heart,
    Calendar,
    PauseCircle,
    Brain,
    Check,
    X,
    Clock,
    MessageCircle,
    Shield
} from 'lucide-react';
import Link from 'next/link';

const DATE_IDEAS = [
    '🍿 Movie Night at Home',
    '🍕 Try a New Restaurant',
    '🎮 Game Night',
    '🚶 Sunset Walk',
    '🧘 Couples Yoga',
    '🎨 Art Class Together',
    '🍳 Cook a New Recipe',
    '📺 Binge a New Series',
    '💆 Spa Day at Home',
    '🎤 Karaoke Night',
];

const FAIR_FIGHTING_RULES = [
    "Take turns speaking without interrupting",
    "Use 'I feel...' statements instead of 'You always...'",
    "Stay on topic – one issue at a time",
    "No name-calling or personal attacks",
    "It's okay to take a break and cool down",
    "Remember: you're on the same team",
];

type ActiveModal =
    | 'date-matcher'
    | 'timeout'
    | 'trivia-builder'
    | 'love-languages'
    | 'attachment-style'
    | null;

type QuizResultType = {
    type: 'love-languages' | 'attachment-style';
    result: string;
} | null;

export default function FunPage() {
    const { user, partner } = useAuth();
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [timeoutMinutes, setTimeoutMinutes] = useState(20);
    const [timeoutActive, setTimeoutActive] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResultType>(null);

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

    const toggleDateSelection = (date: string) => {
        if (selectedDates.includes(date)) {
            setSelectedDates(selectedDates.filter(d => d !== date));
        } else if (selectedDates.length < 3) {
            setSelectedDates([...selectedDates, date]);
        }
    };

    const startTimeout = () => {
        setTimeoutActive(true);
    };

    const handleLoveLanguagesComplete = (answers: Record<string, number>) => {
        const result = scoreLoveLanguages(answers);
        setActiveModal(null);
        setQuizResult({ type: 'love-languages', result });
    };

    const handleAttachmentComplete = (answers: Record<string, number>) => {
        const result = scoreAttachmentStyle(answers);
        setActiveModal(null);
        setQuizResult({ type: 'attachment-style', result });
    };

    const handleSaveToDossier = () => {
        if (!user || !quizResult) return;

        const key = quizResult.type === 'love-languages' ? 'Love Language' : 'Attachment Style';
        upsertDossierEntry(user.id, 'joy', key, quizResult.result, false);
        setQuizResult(null);
    };

    const handleTriviaComplete = (questions: { text: string; options: string[]; correctAnswer: number }[]) => {
        // In a real app, this would save the quiz and notify partner
        console.log('Trivia created:', questions);
        setActiveModal(null);
        alert(`✨ Trivia quiz created with ${questions.length} questions! Your partner will be notified.`);
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Fun & Discovery</h1>
                <Sparkles className="w-6 h-6 text-[var(--accent-violet)]" />
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
                {/* Date Matcher */}
                <button
                    onClick={() => setActiveModal('date-matcher')}
                    className="card w-full flex items-center gap-4 text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Date Matcher</h3>
                        <p className="text-sm text-[var(--text-muted)]">Pick 3 ideas, see if you match!</p>
                    </div>
                </button>

                {/* Trivia Quiz */}
                <button
                    onClick={() => setActiveModal('trivia-builder')}
                    className="card w-full flex items-center gap-4 text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">How Well Do You Know Me?</h3>
                        <p className="text-sm text-[var(--text-muted)]">Create trivia for your partner</p>
                    </div>
                </button>

                {/* Love Languages */}
                <button
                    onClick={() => setActiveModal('love-languages')}
                    className="card w-full flex items-center gap-4 text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Love Languages Quiz</h3>
                        <p className="text-sm text-[var(--text-muted)]">Discover how you give & receive love</p>
                    </div>
                </button>

                {/* Attachment Style */}
                <button
                    onClick={() => setActiveModal('attachment-style')}
                    className="card w-full flex items-center gap-4 text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Attachment Style Quiz</h3>
                        <p className="text-sm text-[var(--text-muted)]">Understand your relationship patterns</p>
                    </div>
                </button>

                {/* Timeout Button */}
                <button
                    onClick={() => setActiveModal('timeout')}
                    className="card w-full flex items-center gap-4 text-left"
                >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <PauseCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Timeout Button</h3>
                        <p className="text-sm text-[var(--text-muted)]">Need a cool-down break?</p>
                    </div>
                </button>
            </div>

            {/* Love Languages Quiz */}
            {activeModal === 'love-languages' && (
                <QuizEngine
                    quiz={LOVE_LANGUAGES_QUIZ}
                    onComplete={handleLoveLanguagesComplete}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {/* Attachment Style Quiz */}
            {activeModal === 'attachment-style' && (
                <QuizEngine
                    quiz={ATTACHMENT_STYLE_QUIZ}
                    onComplete={handleAttachmentComplete}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {/* Trivia Builder */}
            {activeModal === 'trivia-builder' && (
                <TriviaBuilder
                    onComplete={handleTriviaComplete}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {/* Quiz Result */}
            {quizResult && (
                <QuizResult
                    type={quizResult.type}
                    result={quizResult.result}
                    onClose={() => setQuizResult(null)}
                    onSaveToDossier={handleSaveToDossier}
                />
            )}

            {/* Date Matcher Modal */}
            {activeModal === 'date-matcher' && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-auto slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">🗓 Date Matcher</h3>
                            <button onClick={() => setActiveModal(null)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Pick up to 3 date ideas. If you and your partner match, it&apos;s a date! 💕
                        </p>

                        <div className="space-y-2 mb-6">
                            {DATE_IDEAS.map((idea) => {
                                const isSelected = selectedDates.includes(idea);
                                return (
                                    <button
                                        key={idea}
                                        onClick={() => toggleDateSelection(idea)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isSelected
                                            ? 'bg-[var(--accent-violet)] text-white'
                                            : 'bg-[var(--bg-soft)] hover:bg-[var(--bg-lavender)]'
                                            }`}
                                    >
                                        <span>{idea}</span>
                                        {isSelected && <Check className="w-5 h-5" />}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-center text-sm text-[var(--text-muted)] mb-4">
                            Selected: {selectedDates.length}/3
                        </p>

                        <button
                            className="btn btn-primary w-full"
                            disabled={selectedDates.length === 0}
                        >
                            Submit My Picks
                        </button>
                    </div>
                </div>
            )}

            {/* Timeout Modal */}
            {activeModal === 'timeout' && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">⏸️ Timeout</h3>
                            <button onClick={() => setActiveModal(null)}>
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

                                <button onClick={startTimeout} className="btn btn-primary w-full mb-6">
                                    <PauseCircle className="w-5 h-5" />
                                    Send Timeout Request
                                </button>

                                {/* Fair Fighting Rules */}
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
                                    onClick={() => { setTimeoutActive(false); setActiveModal(null); }}
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
