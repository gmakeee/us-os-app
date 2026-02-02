'use client';

import { useState } from 'react';
import { Quiz } from '@/lib/types';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface QuizEngineProps {
    quiz: Quiz;
    onComplete: (answers: Record<string, number>) => void;
    onCancel: () => void;
}

export function QuizEngine({ quiz, onComplete, onCancel }: QuizEngineProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const questions = quiz.content.questions;
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isAnswered = answers[currentQuestion.id] !== undefined;
    const isLast = currentIndex === questions.length - 1;
    const allAnswered = questions.every(q => answers[q.id] !== undefined);

    const handleSelect = (optionIndex: number) => {
        setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    };

    const handleNext = () => {
        if (isLast) {
            if (allAnswered) {
                onComplete(answers);
            }
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={onCancel} className="text-white/80 hover:text-white">
                            ✕
                        </button>
                        <span className="text-sm font-medium">
                            {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold">{quiz.title}</h2>
                    {/* Progress bar */}
                    <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="p-6">
                    <p className="text-lg font-semibold mb-6">{currentQuestion.text}</p>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, i) => {
                            const isSelected = answers[currentQuestion.id] === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(i)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 ${isSelected
                                            ? 'bg-[var(--accent-violet)] text-white shadow-lg'
                                            : 'bg-[var(--bg-soft)] hover:bg-[var(--bg-lavender)]'
                                        }`}
                                >
                                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-white bg-white' : 'border-[var(--text-muted)]'
                                        }`}>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-[var(--accent-violet)]" />}
                                    </span>
                                    <span className="text-sm">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`btn btn-secondary flex-1 ${currentIndex === 0 ? 'opacity-50' : ''}`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!isAnswered}
                        className={`btn btn-primary flex-1 ${!isAnswered ? 'opacity-50' : ''}`}
                    >
                        {isLast ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Finish
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
