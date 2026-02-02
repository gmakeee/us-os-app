'use client';

import { INTIMACY_STATUSES } from '@/lib/types';

type IntimacyStatusType = keyof typeof INTIMACY_STATUSES;

interface IntimacyStatusProps {
    value: IntimacyStatusType;
    onChange: (value: IntimacyStatusType) => void;
    readonly?: boolean;
}

export function IntimacyStatus({ value, onChange, readonly = false }: IntimacyStatusProps) {
    const statuses: IntimacyStatusType[] = ['hot', 'open', 'snuggle', 'off'];

    return (
        <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
                const info = INTIMACY_STATUSES[status];
                const isSelected = value === status;

                return (
                    <button
                        key={status}
                        onClick={() => !readonly && onChange(status)}
                        disabled={readonly}
                        className={`status-pill mood-${status} ${isSelected ? 'selected' : ''} ${readonly ? 'cursor-default' : ''}`}
                        style={{
                            opacity: isSelected ? 1 : 0.6,
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                    >
                        <span className="text-xl">{info.emoji}</span>
                        <span className="font-medium text-sm">{info.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

interface IntimacyDisplayProps {
    status: IntimacyStatusType;
    size?: 'sm' | 'lg';
}

export function IntimacyDisplay({ status, size = 'lg' }: IntimacyDisplayProps) {
    const info = INTIMACY_STATUSES[status];

    if (size === 'sm') {
        return (
            <span className={`status-pill mood-${status} text-sm py-2 px-4`}>
                <span>{info.emoji}</span>
                <span>{info.label}</span>
            </span>
        );
    }

    return (
        <div className={`status-pill mood-${status} flex-col items-center py-4 px-6`}>
            <span className="text-3xl mb-1">{info.emoji}</span>
            <span className="font-semibold">{info.label}</span>
            <span className="text-xs opacity-80">{info.description}</span>
        </div>
    );
}
