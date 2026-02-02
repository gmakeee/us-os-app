-- FIX RLS POLICIES FOR PROFILES
-- Run this in Supabase SQL Editor

-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view family members profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Enable users to INSERT their own profile (needed when trigger fails)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable users to SELECT their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Enable users to UPDATE their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Enable users to view profiles of family members
CREATE POLICY "Users can view family members" ON profiles
    FOR SELECT USING (
        family_id IS NOT NULL AND 
        family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    );

-- Fix families table policies
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can view own family" ON families;

-- Allow any authenticated user to create a family
CREATE POLICY "Users can create families" ON families
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own family
CREATE POLICY "Users can view own family" ON families
    FOR SELECT USING (
        id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
    );

-- Allow users to view any family by invite code (for joining)
CREATE POLICY "Users can view family by invite code" ON families
    FOR SELECT USING (true);
