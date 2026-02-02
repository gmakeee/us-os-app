'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = getSupabaseClient();

            // Get the code from URL
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                try {
                    await supabase.auth.exchangeCodeForSession(code);
                } catch (error) {
                    console.error('Error exchanging code:', error);
                }
            }

            // Redirect to dashboard
            router.push('/dashboard');
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-lavender)]">
            <div className="card text-center">
                <div className="text-4xl mb-4">✨</div>
                <h1 className="text-xl font-bold mb-2">Confirming...</h1>
                <p className="text-[var(--text-muted)]">Please wait...</p>
            </div>
        </div>
    );
}
