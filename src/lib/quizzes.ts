import { Quiz } from './types';

// Love Languages Quiz
export const LOVE_LANGUAGES_QUIZ: Quiz = {
    id: 'love-languages',
    type: 'psychology',
    title: '5 Love Languages',
    content: {
        questions: [
            {
                id: 'q1',
                text: 'What makes you feel most loved?',
                options: [
                    'Hearing "I love you" or compliments',
                    'Receiving a thoughtful gift',
                    'Quality time together without distractions',
                    'A hug or holding hands',
                    'When my partner helps with tasks'
                ]
            },
            {
                id: 'q2',
                text: 'What hurts you most in a relationship?',
                options: [
                    'Harsh criticism or lack of verbal appreciation',
                    'Forgotten special occasions or no gifts',
                    'Partner always being too busy for me',
                    'Lack of physical affection',
                    'Partner never helping around the house'
                ]
            },
            {
                id: 'q3',
                text: 'How do you typically show love?',
                options: [
                    'I express my feelings verbally',
                    'I give thoughtful presents',
                    'I plan special activities together',
                    'I\'m physically affectionate',
                    'I do helpful things for my partner'
                ]
            },
            {
                id: 'q4',
                text: 'What would be the perfect evening?',
                options: [
                    'Deep conversation with affirmations',
                    'A surprise gift from my partner',
                    'Undivided attention and quality time',
                    'Cuddling on the couch',
                    'Partner cooking dinner or cleaning up'
                ]
            },
            {
                id: 'q5',
                text: 'What do you request most from your partner?',
                options: [
                    'Tell me how you feel about me',
                    'Surprise me sometimes',
                    'Spend more time with me',
                    'Hold me more often',
                    'Help me with things'
                ]
            }
        ]
    }
};

// Attachment Style Quiz
export const ATTACHMENT_STYLE_QUIZ: Quiz = {
    id: 'attachment-style',
    type: 'psychology',
    title: 'Attachment Style',
    content: {
        questions: [
            {
                id: 'a1',
                text: 'When my partner is away, I feel:',
                options: [
                    'Comfortable and secure',
                    'Anxious and need constant reassurance',
                    'Relieved to have space',
                    'Mixed - sometimes anxious, sometimes distant'
                ]
            },
            {
                id: 'a2',
                text: 'When there\'s conflict, I tend to:',
                options: [
                    'Talk it through calmly',
                    'Become very emotional and need closeness',
                    'Withdraw and need space',
                    'Alternate between clinging and pushing away'
                ]
            },
            {
                id: 'a3',
                text: 'My view on relationships:',
                options: [
                    'I trust easily and feel comfortable depending on others',
                    'I worry my partner doesn\'t love me as much as I love them',
                    'I prefer independence and self-reliance',
                    'I want closeness but fear getting hurt'
                ]
            },
            {
                id: 'a4',
                text: 'When my partner needs support:',
                options: [
                    'I\'m there for them and it feels natural',
                    'I give everything, sometimes too much',
                    'I try to help but feel uncomfortable',
                    'I want to help but worry I\'ll do it wrong'
                ]
            }
        ]
    }
};

// Sample trivia questions template
export const createTriviaQuiz = (partnerId: string, questions: { text: string; options: string[]; correctAnswer: number }[]): Quiz => ({
    id: `trivia-${partnerId}-${Date.now()}`,
    type: 'trivia',
    title: 'How Well Do You Know Me?',
    content: { questions: questions.map((q, i) => ({ id: `t${i}`, ...q })) }
});

// Love Language scoring
export const LOVE_LANGUAGES = [
    'Words of Affirmation',
    'Receiving Gifts',
    'Quality Time',
    'Physical Touch',
    'Acts of Service'
] as const;

export const scoreLoveLanguages = (answers: Record<string, number>): string => {
    const scores = [0, 0, 0, 0, 0];
    Object.values(answers).forEach(answer => {
        if (answer >= 0 && answer < 5) scores[answer]++;
    });
    const maxIndex = scores.indexOf(Math.max(...scores));
    return LOVE_LANGUAGES[maxIndex];
};

// Attachment Style scoring
export const ATTACHMENT_STYLES = [
    'Secure',
    'Anxious',
    'Avoidant',
    'Disorganized'
] as const;

export const scoreAttachmentStyle = (answers: Record<string, number>): string => {
    const scores = [0, 0, 0, 0];
    Object.values(answers).forEach(answer => {
        if (answer >= 0 && answer < 4) scores[answer]++;
    });
    const maxIndex = scores.indexOf(Math.max(...scores));
    return ATTACHMENT_STYLES[maxIndex];
};
