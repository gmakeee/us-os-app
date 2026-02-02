'use client';

import { User, MoodLog, INTIMACY_STATUSES } from '@/lib/types';
import { EnergyTracker } from './energy-tracker';
import { RefreshCw, Zap } from 'lucide-react';

interface PartnerVibeProps {
    partner: User;
    mood: MoodLog | null;
    onRefresh?: () => void;
}

export function PartnerVibe({ partner, mood, onRefresh }: PartnerVibeProps) {
    const intimacyInfo = mood?.intimacyStatus
        ? INTIMACY_STATUSES[mood.intimacyStatus]
        : null;

    return (
        <div className="card slide-up">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="avatar avatar-violet"
                        style={{ background: partner.avatarColor }}
                    >
                        {partner.displayName[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold">{partner.displayName}</h3>
                        <p className="text-xs text-[var(--text-muted)]">Partner&apos;s Vibe</p>
                    </div>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="btn btn-secondary p-2"
                        title="Refresh partner data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {mood ? (
                <div className="space-y-4">
                    {/* Partner Energy */}
                    <div>
                        <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Energy Level
                        </p>
                        <EnergyTracker value={mood.energyLevel} onChange={() => { }} readonly />
                    </div>

                    {/* Partner Intimacy Status */}
                    {intimacyInfo && (
                        <div
                            className={`status-pill mood-${mood.intimacyStatus} justify-center py-3`}
                        >
                            <span className="text-2xl">{intimacyInfo.emoji}</span>
                            <div className="ml-2">
                                <span className="font-semibold">{intimacyInfo.label}</span>
                                <span className="text-xs ml-2 opacity-80">{intimacyInfo.description}</span>
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    {mood.note && (
                        <div className="bg-[var(--bg-soft)] rounded-xl p-3">
                            <p className="text-sm italic">&ldquo;{mood.note}&rdquo;</p>
                        </div>
                    )}

                    {/* Last updated */}
                    <p className="text-xs text-center text-[var(--text-muted)]">
                        Updated {new Date(mood.updatedAt).toLocaleTimeString()}
                    </p>
                </div>
            ) : (
                <div className="text-center py-6 text-[var(--text-muted)]">
                    <p className="text-sm">No mood data yet</p>
                    <p className="text-xs mt-1">Waiting for partner to set their vibe...</p>
                </div>
            )}
        </div>
    );
}
