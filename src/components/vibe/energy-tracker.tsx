'use client';

import { Zap } from 'lucide-react';

interface EnergyTrackerProps {
    value: 1 | 2 | 3 | 4 | 5;
    onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
    readonly?: boolean;
}

export function EnergyTracker({ value, onChange, readonly = false }: EnergyTrackerProps) {
    const levels = [1, 2, 3, 4, 5] as const;

    return (
        <div className="energy-scale">
            {levels.map((level) => (
                <button
                    key={level}
                    onClick={() => !readonly && onChange(level)}
                    disabled={readonly}
                    className={`energy-level ${level <= value ? 'selected' : ''} ${readonly ? 'cursor-default' : ''}`}
                    style={{
                        opacity: level <= value ? 1 : 0.4,
                    }}
                >
                    <Zap
                        className="w-5 h-5"
                        fill={level <= value ? 'currentColor' : 'none'}
                    />
                </button>
            ))}
        </div>
    );
}
