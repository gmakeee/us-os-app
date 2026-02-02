// Mock Auth System - localStorage-based for local testing
import { Family, User, MoodLog, DossierEntry, ListItem, AVATAR_COLORS } from './types';

// Storage keys
const KEYS = {
    FAMILIES: 'us_os_families',
    USERS: 'us_os_users',
    CURRENT_USER: 'us_os_current_user',
    MOOD_LOGS: 'us_os_mood_logs',
    DOSSIER: 'us_os_dossier',
    LISTS: 'us_os_lists',
};

// Helper to generate IDs
export const generateId = () => crypto.randomUUID();

// Helper to generate invite codes
export const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// Generic localStorage helpers
const getStorage = <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
};

// === FAMILIES ===
export const getFamilies = (): Family[] => getStorage<Family>(KEYS.FAMILIES);

export const createFamily = (): Family => {
    const families = getFamilies();
    const family: Family = {
        id: generateId(),
        inviteCode: generateInviteCode(),
        createdAt: new Date().toISOString(),
    };
    families.push(family);
    setStorage(KEYS.FAMILIES, families);
    return family;
};

export const getFamilyByCode = (code: string): Family | undefined => {
    return getFamilies().find(f => f.inviteCode === code.toUpperCase());
};

export const getFamilyById = (id: string): Family | undefined => {
    return getFamilies().find(f => f.id === id);
};

// === USERS ===
export const getUsers = (): User[] => getStorage<User>(KEYS.USERS);

export const createUser = (email: string, displayName: string, familyId?: string): User => {
    const users = getUsers();
    const user: User = {
        id: generateId(),
        familyId: familyId || null,
        email,
        displayName,
        partnerId: null,
        avatarUrl: null,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        createdAt: new Date().toISOString(),
    };
    users.push(user);
    setStorage(KEYS.USERS, users);
    return user;
};

export const getUserById = (id: string): User | undefined => {
    return getUsers().find(u => u.id === id);
};

export const getUsersByFamily = (familyId: string): User[] => {
    return getUsers().filter(u => u.familyId === familyId);
};

export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    setStorage(KEYS.USERS, users);
    return users[index];
};

export const linkPartners = (userId1: string, userId2: string, familyId: string) => {
    updateUser(userId1, { partnerId: userId2, familyId });
    updateUser(userId2, { partnerId: userId1, familyId });
};

// === CURRENT USER (Session) ===
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const userId = localStorage.getItem(KEYS.CURRENT_USER);
    if (!userId) return null;
    return getUserById(userId) || null;
};

export const setCurrentUser = (userId: string | null) => {
    if (typeof window === 'undefined') return;
    if (userId) {
        localStorage.setItem(KEYS.CURRENT_USER, userId);
    } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }
};

export const getPartner = (): User | null => {
    const currentUser = getCurrentUser();
    if (!currentUser?.partnerId) return null;
    return getUserById(currentUser.partnerId) || null;
};

// === MOOD LOGS ===
export const getMoodLogs = (): MoodLog[] => getStorage<MoodLog>(KEYS.MOOD_LOGS);

export const getUserMood = (userId: string): MoodLog | undefined => {
    return getMoodLogs().find(m => m.userId === userId);
};

export const updateMood = (userId: string, updates: Partial<MoodLog>): MoodLog => {
    const moods = getMoodLogs();
    const index = moods.findIndex(m => m.userId === userId);

    if (index === -1) {
        const mood: MoodLog = {
            id: generateId(),
            userId,
            energyLevel: updates.energyLevel || 3,
            intimacyStatus: updates.intimacyStatus || 'open',
            note: updates.note || '',
            updatedAt: new Date().toISOString(),
        };
        moods.push(mood);
        setStorage(KEYS.MOOD_LOGS, moods);
        return mood;
    } else {
        moods[index] = {
            ...moods[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        setStorage(KEYS.MOOD_LOGS, moods);
        return moods[index];
    }
};

// === DOSSIER ===
export const getDossierEntries = (): DossierEntry[] => getStorage<DossierEntry>(KEYS.DOSSIER);

export const getUserDossier = (userId: string): DossierEntry[] => {
    return getDossierEntries().filter(d => d.userId === userId);
};

export const upsertDossierEntry = (
    userId: string,
    category: DossierEntry['category'],
    key: string,
    value: string,
    isPrivate: boolean = false
): DossierEntry => {
    const entries = getDossierEntries();
    const index = entries.findIndex(d => d.userId === userId && d.category === category && d.key === key);

    if (index === -1) {
        const entry: DossierEntry = {
            id: generateId(),
            userId,
            category,
            key,
            value,
            isPrivate,
            createdAt: new Date().toISOString(),
        };
        entries.push(entry);
        setStorage(KEYS.DOSSIER, entries);
        return entry;
    } else {
        entries[index] = { ...entries[index], value, isPrivate };
        setStorage(KEYS.DOSSIER, entries);
        return entries[index];
    }
};

// === LISTS ===
export const getListItems = (): ListItem[] => getStorage<ListItem>(KEYS.LISTS);

export const getFamilyLists = (familyId: string, currentUserId: string): ListItem[] => {
    return getListItems().filter(item => {
        if (item.familyId !== familyId) return false;
        // Hide surprise items from partner
        if (item.type === 'surprise' && item.creatorId !== currentUserId) return false;
        return true;
    });
};

export const createListItem = (
    familyId: string,
    creatorId: string,
    title: string,
    type: ListItem['type'],
    description: string = ''
): ListItem => {
    const items = getListItems();
    const item: ListItem = {
        id: generateId(),
        familyId,
        creatorId,
        title,
        description,
        link: null,
        type,
        status: 'active',
        visibility: type === 'surprise' ? 'secret_until_reveal' : 'shared',
        claimedBy: null,
        createdAt: new Date().toISOString(),
    };
    items.push(item);
    setStorage(KEYS.LISTS, items);
    return item;
};

export const updateListItem = (id: string, updates: Partial<ListItem>): ListItem | undefined => {
    const items = getListItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    setStorage(KEYS.LISTS, items);
    return items[index];
};

export const claimListItem = (id: string, userId: string): ListItem | undefined => {
    return updateListItem(id, { claimedBy: userId });
};

export const revealSurprise = (id: string): ListItem | undefined => {
    return updateListItem(id, { visibility: 'shared' });
};

// === ADMIN / RESET ===
export const clearAllData = () => {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};

export const getAllData = () => {
    return {
        families: getFamilies(),
        users: getUsers(),
        currentUserId: typeof window !== 'undefined' ? localStorage.getItem(KEYS.CURRENT_USER) : null,
        moodLogs: getMoodLogs(),
        dossier: getDossierEntries(),
        lists: getListItems(),
    };
};
