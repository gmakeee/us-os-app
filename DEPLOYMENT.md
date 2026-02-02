# US OS - Deployment Guide 🚀

## Overview

This guide covers deploying US OS to **Netlify** with **Supabase** as the backend.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Create a new project (free tier is fine)
3. Wait for the database to be ready (~2 minutes)

### Run the Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Click **Run** to create all tables

### Get API Keys

Go to **Settings → API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2: Configure Email Auth

1. Go to **Authentication → Providers**
2. Email provider is enabled by default
3. (Optional) Disable email confirmation for testing:
   - **Authentication → Settings**
   - Turn off "Enable email confirmations"

---

## Step 3: Local Testing

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Switch to Supabase Auth

In `src/app/layout.tsx`, change:

```tsx
// FROM:
import { AuthProvider } from '@/lib/auth-context';

// TO:
import { AuthProvider } from '@/lib/supabase-auth-context';
```

Run:
```bash
npm run dev
```

Visit `/auth` to test login/signup.

---

## Step 4: Deploy to Netlify

### Option A: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site**
3. Select your repo
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`

### Set Environment Variables

In Netlify dashboard → **Site settings → Environment variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |

---

## Step 5: Configure Supabase for Production

### Add Site URL

1. Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to your Netlify domain:
   ```
   https://your-app.netlify.app
   ```

### Add Redirect URLs

Add to **Redirect URLs**:
```
https://your-app.netlify.app/**
```

---

## 🔄 Switching Between Mock and Supabase

The app supports both modes:

| File | Use Case |
|------|----------|
| `auth-context.tsx` | Local testing (localStorage) |
| `supabase-auth-context.tsx` | Production (Supabase) |

Just swap the import in `layout.tsx`.

---

## 📁 Files Created

```
netlify.toml           # Netlify build config
.env.example           # Environment template
supabase/schema.sql    # Database schema (run in SQL Editor)
src/
├── middleware.ts      # Session refresh
├── app/auth/page.tsx  # Login/Signup page
└── lib/
    ├── supabase/
    │   ├── client.ts  # Browser client
    │   ├── server.ts  # Server client
    │   └── middleware.ts
    └── supabase-auth-context.tsx  # Supabase auth provider
```

---

## 🔑 Summary

1. **Supabase**: Create project → Run schema → Copy keys
2. **Local**: Add `.env.local` → Switch provider → Test at `/auth`
3. **Netlify**: Deploy → Add env vars → Configure Supabase URLs
4. **Done!** 🎉
