'use client';

import Link from 'next/link';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💑</div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-[var(--accent-violet)]">US</span> OS
        </h1>
        <p className="text-[var(--text-muted)]">Your Relationship Operating System</p>
      </div>

      {/* Feature Cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        <div className="liquid-glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Daily Vibe Sync</h3>
            <p className="text-sm text-[var(--text-muted)]">Share your mood in real-time</p>
          </div>
        </div>

        <div className="liquid-glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Partner Dossier</h3>
            <p className="text-sm text-[var(--text-muted)]">Know everything about each other</p>
          </div>
        </div>

        <div className="liquid-glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Fun & Discovery</h3>
            <p className="text-sm text-[var(--text-muted)]">Quizzes, dates, and surprises</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Link href="/dashboard" className="btn btn-primary w-full">
          Enter App
        </Link>
        <Link href="/admin" className="btn btn-outline w-full">
          Admin Panel (Testing)
        </Link>
      </div>

      {/* Footer */}
      <p className="text-xs text-[var(--text-muted)] mt-8">
        Made with ❤️ for couples
      </p>
    </div>
  );
}
