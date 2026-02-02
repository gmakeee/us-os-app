-- US OS Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. USERS & FAMILIES
-- ============================================

-- Families table
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    avatar_url TEXT,
    avatar_color TEXT DEFAULT '#7C4DFF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MOOD LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS mood_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    intimacy_status TEXT CHECK (intimacy_status IN ('hot', 'open', 'snuggle', 'off')),
    note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one active mood per user (we update, not insert)
CREATE UNIQUE INDEX IF NOT EXISTS mood_logs_user_unique ON mood_logs(user_id);

-- ============================================
-- 3. DOSSIER ENTRIES
-- ============================================

CREATE TABLE IF NOT EXISTS dossier_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('health', 'food', 'style', 'joy')),
    key TEXT NOT NULL,
    value TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category, key)
);

-- ============================================
-- 4. LISTS (Tasks, Wishes, Surprises)
-- ============================================

CREATE TABLE IF NOT EXISTS list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    type TEXT NOT NULL CHECK (type IN ('task', 'wish', 'surprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    visibility TEXT DEFAULT 'shared' CHECK (visibility IN ('shared', 'secret_until_reveal')),
    claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. MEMORY PHOTOS
-- ============================================

CREATE TABLE IF NOT EXISTS memory_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    word_of_week TEXT,
    week_date TEXT NOT NULL, -- Format: YYYY-Www
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id, week_date)
);

-- ============================================
-- 6. MILESTONES
-- ============================================

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('romance', 'home', 'travel')),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. DATE IDEAS
-- ============================================

CREATE TABLE IF NOT EXISTS date_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. DATE VOTES (Double Yes)
-- ============================================

CREATE TABLE IF NOT EXISTS date_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES date_ideas(id) ON DELETE CASCADE,
    user_a_id UUID REFERENCES profiles(id),
    user_a_vote BOOLEAN,
    user_b_id UUID REFERENCES profiles(id),
    user_b_vote BOOLEAN,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. EXPENSES
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    paid_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. SAVINGS GOALS
-- ============================================

CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0,
    emoji TEXT DEFAULT '✈️',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own and their partner's
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view partner profile" ON profiles
    FOR SELECT USING (
        id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
    );

-- Families: family members can read
CREATE POLICY "Family members can view family" ON families
    FOR SELECT USING (
        id = (SELECT family_id FROM profiles WHERE id = auth.uid())
    );

-- Mood logs: family members can read, user can update own
CREATE POLICY "Users can manage own mood" ON mood_logs
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view partner mood" ON mood_logs
    FOR SELECT USING (
        user_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
    );

-- Family-scoped tables policy helper
CREATE OR REPLACE FUNCTION user_family_id()
RETURNS UUID AS $$
    SELECT family_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- List items: family members can CRUD
CREATE POLICY "Family members can manage lists" ON list_items
    FOR ALL USING (family_id = user_family_id());

-- Dossier: user manages own, partner sees non-private
CREATE POLICY "Users can manage own dossier" ON dossier_entries
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Partners can view public dossier" ON dossier_entries
    FOR SELECT USING (
        user_id = (SELECT partner_id FROM profiles WHERE id = auth.uid())
        AND is_private = FALSE
    );

-- Memory photos: family access
CREATE POLICY "Family members can manage photos" ON memory_photos
    FOR ALL USING (family_id = user_family_id());

-- Milestones: family access
CREATE POLICY "Family members can manage milestones" ON milestones
    FOR ALL USING (family_id = user_family_id());

-- Date ideas: family access  
CREATE POLICY "Family members can manage date ideas" ON date_ideas
    FOR ALL USING (family_id = user_family_id());

-- Date votes: family access
CREATE POLICY "Family members can manage date votes" ON date_votes
    FOR ALL USING (family_id = user_family_id());

-- Expenses: family access
CREATE POLICY "Family members can manage expenses" ON expenses
    FOR ALL USING (family_id = user_family_id());

-- Savings goals: family access
CREATE POLICY "Family members can manage savings" ON savings_goals
    FOR ALL USING (family_id = user_family_id());

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for mood sync
ALTER PUBLICATION supabase_realtime ADD TABLE mood_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE date_votes;

-- ============================================
-- TRIGGER: Create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name, avatar_color)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        (ARRAY['#7C4DFF', '#FF6B6B', '#4ECDC4', '#FFD54F', '#FF8A65'])[floor(random() * 5 + 1)::int]
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
