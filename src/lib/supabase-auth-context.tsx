'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase/client';
import { User, MoodLog } from './types';

interface AuthContextType {
    user: User | null;
    partner: User | null;
    userMood: MoodLog | null;
    partnerMood: MoodLog | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: Error | null }>;
    signup: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
    logout: () => Promise<void>;
    updateMood: (updates: Partial<MoodLog>) => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert snake_case to camelCase
function toUser(row: Record<string, unknown> | null): User | null {
    if (!row) return null;
    return {
        id: row.id as string,
        familyId: row.family_id as string | null,
        email: row.email as string,
        displayName: row.display_name as string,
        partnerId: row.partner_id as string | null,
        avatarUrl: row.avatar_url as string | null,
        avatarColor: row.avatar_color as string,
        createdAt: row.created_at as string,
    };
}

function toMoodLog(row: Record<string, unknown> | null): MoodLog | null {
    if (!row) return null;
    return {
        id: row.id as string,
        userId: row.user_id as string,
        energyLevel: row.energy_level as 1 | 2 | 3 | 4 | 5,
        intimacyStatus: row.intimacy_status as 'hot' | 'open' | 'snuggle' | 'off',
        note: row.note as string || '',
        updatedAt: row.updated_at as string,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [userMood, setUserMood] = useState<MoodLog | null>(null);
    const [partnerMood, setPartnerMood] = useState<MoodLog | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = getSupabaseClient();

    const fetchUserData = useCallback(async (userId: string, userEmail?: string) => {
        let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        // Create profile if doesn't exist
        if (error || !profile) {
            const colors = ['#7C4DFF', '#FF6B6B', '#4ECDC4', '#FFD54F', '#FF8A65'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: userEmail || '',
                    display_name: userEmail?.split('@')[0] || 'User',
                    avatar_color: randomColor,
                })
                .select()
                .maybeSingle();

            profile = newProfile;
        }

        if (profile) {
            setUser(toUser(profile));

            const { data: mood } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            setUserMood(toMoodLog(mood));

            if (profile.partner_id) {
                const { data: partnerProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', profile.partner_id)
                    .maybeSingle();

                setPartner(toUser(partnerProfile));

                if (partnerProfile) {
                    const { data: pMood } = await supabase
                        .from('mood_logs')
                        .select('*')
                        .eq('user_id', partnerProfile.id)
                        .maybeSingle();

                    setPartnerMood(toMoodLog(pMood));
                }
            }
        }
    }, [supabase]);

    useEffect(() => {
        const initAuth = async () => {
            const { data } = await supabase.auth.getSession();
            const currentSession = data.session;
            setSession(currentSession);

            if (currentSession?.user) {
                await fetchUserData(currentSession.user.id, currentSession.user.email);
            }
            setLoading(false);
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, newSession: Session | null) => {
                setSession(newSession);
                if (newSession?.user) {
                    await fetchUserData(newSession.user.id, newSession.user.email);
                } else {
                    setUser(null);
                    setPartner(null);
                    setUserMood(null);
                    setPartnerMood(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchUserData, supabase.auth]);

    // Realtime partner mood updates
    useEffect(() => {
        if (!partner?.id) return;

        const channel = supabase
            .channel('partner-mood')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mood_logs',
                    filter: `user_id=eq.${partner.id}`,
                },
                (payload: { new: Record<string, unknown> | null }) => {
                    if (payload.new) {
                        setPartnerMood(toMoodLog(payload.new));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [partner?.id, supabase]);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signup = async (email: string, password: string, displayName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName },
            },
        });
        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setPartner(null);
        setUserMood(null);
        setPartnerMood(null);
    };

    const updateMood = async (updates: Partial<MoodLog>) => {
        if (!user) return;

        const moodData = {
            user_id: user.id,
            energy_level: updates.energyLevel ?? userMood?.energyLevel ?? 3,
            intimacy_status: updates.intimacyStatus ?? userMood?.intimacyStatus ?? 'open',
            note: updates.note ?? userMood?.note ?? '',
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('mood_logs')
            .upsert(moodData, { onConflict: 'user_id' })
            .select()
            .single();

        if (!error && data) {
            setUserMood(toMoodLog(data));
        }
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;

        const dbUpdates: Record<string, unknown> = {};
        if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
        if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;

        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', user.id)
            .select()
            .single();

        if (!error && data) {
            setUser(toUser(data));
        }
    };

    const refreshUser = async () => {
        if (session?.user) {
            await fetchUserData(session.user.id, session.user.email);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                partner,
                userMood,
                partnerMood,
                session,
                loading,
                login,
                signup,
                logout,
                updateMood,
                updateUser,
                refreshUser,
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

// Helper to get partner (used by some components)
export function getPartner(): User | null {
    // This is a stub - real implementation uses the context
    return null;
}
