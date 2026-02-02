'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, MoodLog } from './types';
import {
    getCurrentUser,
    setCurrentUser as setStoredUser,
    getPartner,
    getUserMood,
    updateMood as updateStoredMood,
} from './mock-auth';

interface AuthContextType {
    user: User | null;
    partner: User | null;
    userMood: MoodLog | null;
    partnerMood: MoodLog | null;
    isLoading: boolean;
    login: (userId: string) => void;
    logout: () => void;
    refreshUser: () => void;
    updateMood: (updates: Partial<MoodLog>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [userMood, setUserMood] = useState<MoodLog | null>(null);
    const [partnerMood, setPartnerMood] = useState<MoodLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            const partnerUser = getPartner();
            setPartner(partnerUser);

            const mood = getUserMood(currentUser.id);
            setUserMood(mood || null);

            if (partnerUser) {
                const pMood = getUserMood(partnerUser.id);
                setPartnerMood(pMood || null);
            }
        } else {
            setPartner(null);
            setUserMood(null);
            setPartnerMood(null);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshUser();
        setIsLoading(false);
    }, [refreshUser]);

    // Poll for partner updates (simulated realtime)
    useEffect(() => {
        if (!user?.partnerId) return;

        const interval = setInterval(() => {
            const partnerUser = getPartner();
            if (partnerUser) {
                setPartner(partnerUser);
                const pMood = getUserMood(partnerUser.id);
                setPartnerMood(pMood || null);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [user?.partnerId]);

    const login = (userId: string) => {
        setStoredUser(userId);
        refreshUser();
    };

    const logout = () => {
        setStoredUser(null);
        setUser(null);
        setPartner(null);
        setUserMood(null);
        setPartnerMood(null);
    };

    const updateMood = (updates: Partial<MoodLog>) => {
        if (!user) return;
        const updated = updateStoredMood(user.id, updates);
        setUserMood(updated);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                partner,
                userMood,
                partnerMood,
                isLoading,
                login,
                logout,
                refreshUser,
                updateMood,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
