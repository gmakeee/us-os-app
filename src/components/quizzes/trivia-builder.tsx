'use client';

import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

interface TriviaQuestion {
    text: string;
    options: string[];
    correctAnswer: number;
}

interface TriviaBuilderProps {
    onComplete: (questions: TriviaQuestion[]) => void;
    onCancel: () => void;
}

export function TriviaBuilder({ onComplete, onCancel }: TriviaBuilderProps) {
    const [questions, setQuestions] = useState<TriviaQuestion[]>([
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentQ = questions[currentIndex];

    const updateQuestion = (field: 'text', value: string) => {
        const updated = [...questions];
        updated[currentIndex] = { ...updated[currentIndex], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (optionIndex: number, value: string) => {
        const updated = [...questions];
        const newOptions = [...updated[currentIndex].options];
        newOptions[optionIndex] = value;
        updated[currentIndex] = { ...updated[currentIndex], options: newOptions };
        setQuestions(updated);
    };

    const setCorrectAnswer = (index: number) => {
        const updated = [...questions];
        updated[currentIndex] = { ...updated[currentIndex], correctAnswer: index };
        setQuestions(updated);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }]);
        setCurrentIndex(questions.length);
    };

    const removeQuestion = () => {
        if (questions.length > 1) {
            const updated = questions.filter((_, i) => i !== currentIndex);
            setQuestions(updated);
            setCurrentIndex(Math.max(0, currentIndex - 1));
        }
    };

    const isValid = questions.every(
        q => q.text.trim() && q.options.filter(o => o.trim()).length >= 2
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-auto slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-6">
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={onCancel} className="text-white/80 hover:text-white">
                            ✕
                        </button>
                        <span className="text-sm font-medium">
                            Question {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold">Create Trivia Quiz</h2>
                    <p className="text-sm text-white/80">Test how well your partner knows you!</p>
                </div>

                {/* Question tabs */}
                <div className="flex gap-2 p-4 overflow-x-auto">
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-10 h-10 rounded-xl flex-shrink-0 font-semibold ${i === currentIndex
                                    ? 'bg-[var(--accent-violet)] text-white'
                                    : 'bg-[var(--bg-soft)]'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={addQuestion}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] flex items-center justify-center flex-shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Question editor */}
                <div className="p-6 pt-2 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                            Question
                        </label>
                        <input
                            type="text"
                            value={currentQ.text}
                            onChange={(e) => updateQuestion('text', e.target.value)}
                            placeholder="e.g., What's my favorite food?"
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                            Options (tap to set correct answer)
                        </label>
                        <div className="space-y-2">
                            {currentQ.options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <button
                                        onClick={() => setCorrectAnswer(i)}
                                        className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${currentQ.correctAnswer === i
                                                ? 'bg-green-500 text-white'
                                                : 'bg-[var(--bg-soft)]'
                                            }`}
                                    >
                                        {currentQ.correctAnswer === i ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <span className="text-[var(--text-muted)]">{i + 1}</span>
                                        )}
                                    </button>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        placeholder={`Option ${i + 1}`}
                                        className="input flex-1"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {questions.length > 1 && (
                        <button
                            onClick={removeQuestion}
                            className="btn btn-secondary w-full text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove This Question
                        </button>
                    )}
                </div>

                {/* Submit */}
                <div className="p-6 pt-0">
                    <button
                        onClick={() => isValid && onComplete(questions)}
                        disabled={!isValid}
                        className={`btn btn-primary w-full ${!isValid ? 'opacity-50' : ''}`}
                    >
                        Create Quiz ({questions.length} question{questions.length > 1 ? 's' : ''})
                    </button>
                    <p className="text-xs text-center text-[var(--text-muted)] mt-2">
                        Your partner will try to guess your answers!
                    </p>
                </div>
            </div>
        </div>
    );
}
