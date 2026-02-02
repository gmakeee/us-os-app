import { MemoryPhoto, Milestone, DateIdea, DateVote, Expense, SavingsGoal } from './types';

// Storage keys for new modules
const MEMORY_KEYS = {
    PHOTOS: 'us_os_memory_photos',
    MILESTONES: 'us_os_milestones',
    DATE_IDEAS: 'us_os_date_ideas',
    DATE_VOTES: 'us_os_date_votes',
    EXPENSES: 'us_os_expenses',
    SAVINGS_GOALS: 'us_os_savings_goals',
};

// Helper
const generateId = () => crypto.randomUUID();

const getStorage = <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
};

// === MEMORY PHOTOS ===
export const getMemoryPhotos = (familyId: string): MemoryPhoto[] => {
    return getStorage<MemoryPhoto>(MEMORY_KEYS.PHOTOS).filter(p => p.familyId === familyId);
};

export const addMemoryPhoto = (
    familyId: string,
    userId: string,
    photoUrl: string,
    wordOfWeek: string,
    weekDate: string
): MemoryPhoto => {
    const photos = getStorage<MemoryPhoto>(MEMORY_KEYS.PHOTOS);
    const photo: MemoryPhoto = {
        id: generateId(),
        familyId,
        userId,
        photoUrl,
        wordOfWeek,
        weekDate,
        createdAt: new Date().toISOString(),
    };
    photos.push(photo);
    setStorage(MEMORY_KEYS.PHOTOS, photos);
    return photo;
};

export const getWeekPhotos = (familyId: string, weekDate: string): MemoryPhoto[] => {
    return getMemoryPhotos(familyId).filter(p => p.weekDate === weekDate);
};

// === MILESTONES ===
export const getMilestones = (familyId: string): Milestone[] => {
    return getStorage<Milestone>(MEMORY_KEYS.MILESTONES)
        .filter(m => m.familyId === familyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addMilestone = (
    familyId: string,
    category: Milestone['category'],
    title: string,
    date: string,
    description?: string,
    photoUrl?: string
): Milestone => {
    const milestones = getStorage<Milestone>(MEMORY_KEYS.MILESTONES);
    const milestone: Milestone = {
        id: generateId(),
        familyId,
        category,
        title,
        date,
        description: description || '',
        photoUrl: photoUrl || null,
        createdAt: new Date().toISOString(),
    };
    milestones.push(milestone);
    setStorage(MEMORY_KEYS.MILESTONES, milestones);
    return milestone;
};

export const deleteMilestone = (id: string) => {
    const milestones = getStorage<Milestone>(MEMORY_KEYS.MILESTONES);
    setStorage(MEMORY_KEYS.MILESTONES, milestones.filter(m => m.id !== id));
};

// === DATE IDEAS ===
export const getDateIdeas = (familyId: string): DateIdea[] => {
    return getStorage<DateIdea>(MEMORY_KEYS.DATE_IDEAS).filter(d => d.familyId === familyId);
};

export const addDateIdea = (
    familyId: string,
    creatorId: string,
    title: string,
    tags: DateIdea['tags']
): DateIdea => {
    const ideas = getStorage<DateIdea>(MEMORY_KEYS.DATE_IDEAS);
    const idea: DateIdea = {
        id: generateId(),
        familyId,
        creatorId,
        title,
        tags,
        isCompleted: false,
        createdAt: new Date().toISOString(),
    };
    ideas.push(idea);
    setStorage(MEMORY_KEYS.DATE_IDEAS, ideas);
    return idea;
};

export const markDateIdeaCompleted = (id: string) => {
    const ideas = getStorage<DateIdea>(MEMORY_KEYS.DATE_IDEAS);
    const index = ideas.findIndex(i => i.id === id);
    if (index !== -1) {
        ideas[index].isCompleted = true;
        setStorage(MEMORY_KEYS.DATE_IDEAS, ideas);
    }
};

// === DATE VOTES (Double Yes) ===
export const getDateVotes = (familyId: string): DateVote[] => {
    return getStorage<DateVote>(MEMORY_KEYS.DATE_VOTES).filter(v => v.familyId === familyId);
};

export const createDateVote = (familyId: string, ideaId: string): DateVote => {
    const votes = getStorage<DateVote>(MEMORY_KEYS.DATE_VOTES);
    const vote: DateVote = {
        id: generateId(),
        familyId,
        ideaId,
        userAVote: null,
        userBVote: null,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    votes.push(vote);
    setStorage(MEMORY_KEYS.DATE_VOTES, votes);
    return vote;
};

export const submitVote = (voteId: string, userId: string, isYes: boolean) => {
    const votes = getStorage<DateVote>(MEMORY_KEYS.DATE_VOTES);
    const index = votes.findIndex(v => v.id === voteId);
    if (index === -1) return null;

    const vote = votes[index];
    if (vote.userAVote === null) {
        vote.userAVote = { userId, vote: isYes };
    } else if (vote.userBVote === null && vote.userAVote.userId !== userId) {
        vote.userBVote = { userId, vote: isYes };
    }

    // Check if both voted
    if (vote.userAVote && vote.userBVote) {
        vote.status = (vote.userAVote.vote && vote.userBVote.vote) ? 'matched' : 'declined';
    }

    votes[index] = vote;
    setStorage(MEMORY_KEYS.DATE_VOTES, votes);
    return vote;
};

// === EXPENSES ===
export const getExpenses = (familyId: string): Expense[] => {
    return getStorage<Expense>(MEMORY_KEYS.EXPENSES)
        .filter(e => e.familyId === familyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addExpense = (
    familyId: string,
    paidBy: string,
    amount: number,
    description: string,
    category: string
): Expense => {
    const expenses = getStorage<Expense>(MEMORY_KEYS.EXPENSES);
    const expense: Expense = {
        id: generateId(),
        familyId,
        paidBy,
        amount,
        description,
        category,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
    expenses.push(expense);
    setStorage(MEMORY_KEYS.EXPENSES, expenses);
    return expense;
};

export const calculateSettleUp = (familyId: string, userAId: string, userBId: string): number => {
    const expenses = getExpenses(familyId);
    const userAPaid = expenses.filter(e => e.paidBy === userAId).reduce((sum, e) => sum + e.amount, 0);
    const userBPaid = expenses.filter(e => e.paidBy === userBId).reduce((sum, e) => sum + e.amount, 0);
    const total = userAPaid + userBPaid;
    const fairShare = total / 2;
    return userAPaid - fairShare; // Positive = B owes A, Negative = A owes B
};

// === SAVINGS GOALS ===
export const getSavingsGoals = (familyId: string): SavingsGoal[] => {
    return getStorage<SavingsGoal>(MEMORY_KEYS.SAVINGS_GOALS).filter(g => g.familyId === familyId);
};

export const addSavingsGoal = (
    familyId: string,
    title: string,
    targetAmount: number,
    emoji: string
): SavingsGoal => {
    const goals = getStorage<SavingsGoal>(MEMORY_KEYS.SAVINGS_GOALS);
    const goal: SavingsGoal = {
        id: generateId(),
        familyId,
        title,
        targetAmount,
        currentAmount: 0,
        emoji,
        createdAt: new Date().toISOString(),
    };
    goals.push(goal);
    setStorage(MEMORY_KEYS.SAVINGS_GOALS, goals);
    return goal;
};

export const contributeTotalSavingsGoal = (goalId: string, amount: number) => {
    const goals = getStorage<SavingsGoal>(MEMORY_KEYS.SAVINGS_GOALS);
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
        goals[index].currentAmount += amount;
        setStorage(MEMORY_KEYS.SAVINGS_GOALS, goals);
    }
};
