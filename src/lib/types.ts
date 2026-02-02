// Core Types for US OS

export interface Family {
    id: string;
    inviteCode: string;
    createdAt: string;
}

export interface User {
    id: string;
    familyId: string | null;
    email: string;
    displayName: string;
    partnerId: string | null;
    avatarUrl: string | null;
    avatarColor: string;
    createdAt: string;
}

export interface MoodLog {
    id: string;
    userId: string;
    energyLevel: 1 | 2 | 3 | 4 | 5;
    intimacyStatus: 'hot' | 'open' | 'snuggle' | 'off';
    note: string;
    updatedAt: string;
}

export interface DossierEntry {
    id: string;
    userId: string;
    category: 'health' | 'food' | 'style' | 'joy';
    key: string;
    value: string;
    isPrivate: boolean;
    createdAt: string;
}

export interface ListItem {
    id: string;
    familyId: string;
    creatorId: string;
    title: string;
    description: string;
    link: string | null;
    type: 'task' | 'wish' | 'surprise';
    status: 'active' | 'completed' | 'archived';
    visibility: 'shared' | 'secret_until_reveal';
    claimedBy: string | null;
    createdAt: string;
}

export interface Quiz {
    id: string;
    type: 'trivia' | 'psychology';
    title: string;
    content: {
        questions: {
            id: string;
            text: string;
            options: string[];
            correctAnswer?: number; // For trivia
        }[];
    };
}

export interface QuizResult {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    answers: Record<string, number>;
    createdAt: string;
}

export interface DatePick {
    id: string;
    familyId: string;
    userId: string;
    picks: string[];
    week: string;
}

// Intimacy status with display info
export const INTIMACY_STATUSES = {
    hot: { emoji: '🔥', label: 'In the mood', description: 'Ready for initiative' },
    open: { emoji: '☁️', label: 'Open to vibes', description: 'Receptive to partner' },
    snuggle: { emoji: '🧸', label: 'Snuggle only', description: 'Comfort, no sex' },
    off: { emoji: '🔒', label: 'Recharge', description: 'Need personal space' },
} as const;

// Dossier categories with icons
export const DOSSIER_CATEGORIES = {
    health: { emoji: '💊', label: 'Health', fields: ['Allergies', 'Medications', 'Blood Type', 'Doctor Contact'] },
    food: { emoji: '🍕', label: 'Food', fields: ['Coffee Order', 'Favorite Cuisine', 'Dislikes', 'Dream Restaurant'] },
    style: { emoji: '👗', label: 'Style', fields: ['T-Shirt Size', 'Shoe Size', 'Ring Size', 'Favorite Color'] },
    joy: { emoji: '✨', label: 'Joy', fields: ['Favorite Flowers', 'Music Genre', 'Dream Vacation', 'Comfort Movie'] },
} as const;

// Avatar colors
export const AVATAR_COLORS = [
    '#7C4DFF', '#FF6B6B', '#4ECDC4', '#FFD54F', '#FF8A65',
    '#BA68C8', '#4FC3F7', '#81C784', '#F06292', '#9575CD'
];

// === MEMORY & LIFE MODULE TYPES ===

export interface MemoryPhoto {
    id: string;
    familyId: string;
    userId: string;
    photoUrl: string;
    wordOfWeek: string;
    weekDate: string;  // ISO week format: YYYY-Www
    createdAt: string;
}

export interface Milestone {
    id: string;
    familyId: string;
    category: 'romance' | 'home' | 'travel';
    title: string;
    date: string;
    description: string;
    photoUrl: string | null;
    createdAt: string;
}

export interface DateIdea {
    id: string;
    familyId: string;
    creatorId: string;
    title: string;
    tags: ('free' | 'active' | 'home' | 'romantic')[];
    isCompleted: boolean;
    createdAt: string;
}

export interface DateVote {
    id: string;
    familyId: string;
    ideaId: string;
    userAVote: { userId: string; vote: boolean } | null;
    userBVote: { userId: string; vote: boolean } | null;
    expiresAt: string;
    status: 'pending' | 'matched' | 'declined' | 'expired';
    createdAt: string;
}

export interface Expense {
    id: string;
    familyId: string;
    paidBy: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    createdAt: string;
}

export interface SavingsGoal {
    id: string;
    familyId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    emoji: string;
    createdAt: string;
}

// Milestone categories
export const MILESTONE_CATEGORIES = {
    romance: { emoji: '❤️', label: 'Romance' },
    home: { emoji: '🏠', label: 'Home' },
    travel: { emoji: '✈️', label: 'Travel' },
} as const;

// Date idea tags
export const DATE_TAGS = {
    free: { emoji: '💸', label: 'Free' },
    active: { emoji: '🏃', label: 'Active' },
    home: { emoji: '🏠', label: 'At Home' },
    romantic: { emoji: '💕', label: 'Romantic' },
} as const;
