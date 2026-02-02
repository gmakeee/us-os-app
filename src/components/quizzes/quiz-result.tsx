'use client';

import { LOVE_LANGUAGES, ATTACHMENT_STYLES } from '@/lib/quizzes';
import { Heart, Shield, X } from 'lucide-react';

interface QuizResultProps {
    type: 'love-languages' | 'attachment-style';
    result: string;
    onClose: () => void;
    onSaveToDossier?: () => void;
}

const LOVE_LANGUAGE_DETAILS: Record<string, { emoji: string; description: string; tips: string[] }> = {
    'Words of Affirmation': {
        emoji: '💬',
        description: 'You feel most loved through verbal expressions of love, compliments, and encouragement.',
        tips: [
            'Leave love notes for each other',
            'Give specific compliments daily',
            'Express gratitude verbally',
            'Send sweet text messages'
        ]
    },
    'Receiving Gifts': {
        emoji: '🎁',
        description: 'Thoughtful gifts and symbols of love make you feel cherished and remembered.',
        tips: [
            'Keep a wishlist for each other',
            'Give small "just because" gifts',
            'Remember special occasions',
            'It\'s the thought that counts!'
        ]
    },
    'Quality Time': {
        emoji: '⏰',
        description: 'Undivided attention and meaningful time together is how you feel most connected.',
        tips: [
            'Schedule regular date nights',
            'Put phones away during meals',
            'Create shared experiences',
            'Practice active listening'
        ]
    },
    'Physical Touch': {
        emoji: '🤗',
        description: 'Physical affection like hugs, kisses, and holding hands makes you feel closest.',
        tips: [
            'Hold hands when walking',
            'Give hugs often',
            'Cuddle while watching TV',
            'Give back massages'
        ]
    },
    'Acts of Service': {
        emoji: '🛠️',
        description: 'Actions speak louder than words - helpful acts show you care.',
        tips: [
            'Help without being asked',
            'Take over a chore they dislike',
            'Make their coffee in the morning',
            'Run errands for them'
        ]
    }
};

const ATTACHMENT_DETAILS: Record<string, { emoji: string; description: string; tips: string[] }> = {
    'Secure': {
        emoji: '💚',
        description: 'You feel comfortable with intimacy and independence. You trust easily and communicate openly.',
        tips: [
            'Continue your healthy communication',
            'Be patient with partners who may be less secure',
            'Model healthy relationship behaviors',
            'Maintain your self-awareness'
        ]
    },
    'Anxious': {
        emoji: '💛',
        description: 'You crave closeness and worry about the relationship. You may need more reassurance.',
        tips: [
            'Practice self-soothing techniques',
            'Communicate needs directly, not through hints',
            'Build security within yourself first',
            'Notice when anxiety is speaking, not reality'
        ]
    },
    'Avoidant': {
        emoji: '💙',
        description: 'You value independence highly and may feel uncomfortable with too much closeness.',
        tips: [
            'Practice staying present in emotional moments',
            'Share your need for space explicitly',
            'Challenge yourself to be vulnerable sometimes',
            'Recognize that needing others is healthy'
        ]
    },
    'Disorganized': {
        emoji: '💜',
        description: 'You may feel conflicted - wanting closeness but fearing it. Your feelings can swing.',
        tips: [
            'Consider working with a therapist',
            'Develop awareness of your patterns',
            'Create safety signals with your partner',
            'Be patient and compassionate with yourself'
        ]
    }
};

export function QuizResult({ type, result, onClose, onSaveToDossier }: QuizResultProps) {
    const isLoveLanguage = type === 'love-languages';
    const details = isLoveLanguage ? LOVE_LANGUAGE_DETAILS[result] : ATTACHMENT_DETAILS[result];

    if (!details) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden slide-up">
                {/* Header */}
                <div className={`p-6 text-white ${isLoveLanguage
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    }`}>
                    <button onClick={onClose} className="text-white/80 hover:text-white mb-4">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-5xl mb-3">{details.emoji}</div>
                    <p className="text-sm text-white/80 mb-1">Your {isLoveLanguage ? 'Love Language' : 'Attachment Style'} is</p>
                    <h2 className="text-2xl font-bold">{result}</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-[var(--text-muted)]">{details.description}</p>

                    <div className="bg-[var(--bg-soft)] rounded-2xl p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            {isLoveLanguage ? <Heart className="w-4 h-4 text-pink-500" /> : <Shield className="w-4 h-4 text-indigo-500" />}
                            Tips for Your Relationship
                        </h3>
                        <ul className="space-y-2">
                            {details.tips.map((tip, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-[var(--accent-violet)]">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 space-y-3">
                    {onSaveToDossier && (
                        <button onClick={onSaveToDossier} className="btn btn-primary w-full">
                            Save to My Dossier
                        </button>
                    )}
                    <button onClick={onClose} className="btn btn-secondary w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
