'use client';

import { useAuth } from '@/lib/supabase-auth-context';
import { BottomNav } from '@/components/ui/bottom-nav';
import { MILESTONE_CATEGORIES, Milestone, MemoryPhoto } from '@/lib/types';
import {
    getMemoryPhotos,
    addMemoryPhoto,
    getMilestones,
    addMilestone,
    getWeekPhotos
} from '@/lib/memory-storage';
import { useState, useEffect } from 'react';
import {
    Camera,
    Plus,
    Calendar,
    Heart,
    Home,
    Plane,
    X,
    Image as ImageIcon,
    Lock
} from 'lucide-react';
import Link from 'next/link';

// Get current week string
const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Days since date
const daysSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export default function MemoryPage() {
    const { user, partner } = useAuth();
    const [activeTab, setActiveTab] = useState<'photos' | 'milestones'>('photos');
    const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [showAddPhoto, setShowAddPhoto] = useState(false);
    const [showAddMilestone, setShowAddMilestone] = useState(false);

    // Form states
    const [photoUrl, setPhotoUrl] = useState('');
    const [wordOfWeek, setWordOfWeek] = useState('');
    const [milestoneTitle, setMilestoneTitle] = useState('');
    const [milestoneDate, setMilestoneDate] = useState('');
    const [milestoneCategory, setMilestoneCategory] = useState<Milestone['category']>('romance');
    const [milestoneDesc, setMilestoneDesc] = useState('');

    const familyId = user?.familyId || '';
    const currentWeek = getCurrentWeek();

    useEffect(() => {
        if (familyId) {
            setPhotos(getMemoryPhotos(familyId));
            setMilestones(getMilestones(familyId));
        }
    }, [familyId]);

    const weekPhotos = photos.filter(p => p.weekDate === currentWeek);
    const myPhoto = weekPhotos.find(p => p.userId === user?.id);
    const partnerPhoto = weekPhotos.find(p => p.userId === partner?.id);

    const handleAddPhoto = () => {
        if (!user || !familyId || !photoUrl) return;
        addMemoryPhoto(familyId, user.id, photoUrl, wordOfWeek, currentWeek);
        setPhotos(getMemoryPhotos(familyId));
        setPhotoUrl('');
        setWordOfWeek('');
        setShowAddPhoto(false);
    };

    const handleAddMilestone = () => {
        if (!familyId || !milestoneTitle || !milestoneDate) return;
        addMilestone(familyId, milestoneCategory, milestoneTitle, milestoneDate, milestoneDesc);
        setMilestones(getMilestones(familyId));
        setMilestoneTitle('');
        setMilestoneDate('');
        setMilestoneDesc('');
        setShowAddMilestone(false);
    };

    if (!user) {
        return (
            <div className="page-container">
                <div className="card text-center py-8">
                    <p className="text-[var(--text-muted)]">Please login first</p>
                    <Link href="/admin" className="btn btn-primary mt-4">Go to Admin</Link>
                </div>
                <BottomNav />
            </div>
        );
    }

    const categoryIcons = {
        romance: <Heart className="w-5 h-5 text-red-400" />,
        home: <Home className="w-5 h-5 text-amber-500" />,
        travel: <Plane className="w-5 h-5 text-blue-400" />,
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Memory Box</h1>
                <Camera className="w-6 h-6 text-[var(--accent-violet)]" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`flex-1 btn ${activeTab === 'photos' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Weekly Photos
                </button>
                <button
                    onClick={() => setActiveTab('milestones')}
                    className={`flex-1 btn ${activeTab === 'milestones' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <Calendar className="w-4 h-4" />
                    Milestones
                </button>
            </div>

            {/* Weekly Photo Section */}
            {activeTab === 'photos' && (
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-semibold mb-2">📸 Photo of the Week</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Week {currentWeek.split('-W')[1]} • Share one moment
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {/* My Photo */}
                            <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--bg-soft)] flex items-center justify-center">
                                {myPhoto ? (
                                    <div className="relative w-full h-full">
                                        <img src={myPhoto.photoUrl} alt="My photo" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-xl px-2 py-1">
                                            <p className="text-white text-xs font-medium">{myPhoto.wordOfWeek}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddPhoto(true)}
                                        className="flex flex-col items-center gap-2 p-4"
                                    >
                                        <Plus className="w-8 h-8 text-[var(--accent-violet)]" />
                                        <span className="text-sm text-[var(--text-muted)]">Add Yours</span>
                                    </button>
                                )}
                            </div>

                            {/* Partner Photo (Blind Mode) */}
                            <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--bg-soft)] flex items-center justify-center">
                                {partnerPhoto ? (
                                    myPhoto ? (
                                        <div className="relative w-full h-full">
                                            <img src={partnerPhoto.photoUrl} alt="Partner photo" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded-xl px-2 py-1">
                                                <p className="text-white text-xs font-medium">{partnerPhoto.wordOfWeek}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 p-4">
                                            <div className="w-full h-full absolute inset-0 bg-[var(--accent-violet)]/20 backdrop-blur-xl" />
                                            <Lock className="w-8 h-8 text-[var(--accent-violet)]" />
                                            <span className="text-sm text-center">Add yours to unlock</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <span className="text-2xl">⏳</span>
                                        <span className="text-sm text-[var(--text-muted)]">
                                            Waiting for {partner?.displayName || 'partner'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Archive Preview */}
                    {photos.length > 2 && (
                        <div className="card">
                            <h3 className="font-semibold mb-3">📅 Previous Weeks</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {photos.slice(0, 8).map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="aspect-square rounded-xl overflow-hidden bg-[var(--bg-soft)]"
                                    >
                                        <img src={photo.photoUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Milestones Section */}
            {activeTab === 'milestones' && (
                <div className="space-y-4">
                    <button
                        onClick={() => setShowAddMilestone(true)}
                        className="card w-full flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">Add Milestone</p>
                            <p className="text-sm text-[var(--text-muted)]">Record a special &quot;first&quot;</p>
                        </div>
                    </button>

                    {milestones.map((m) => (
                        <div key={m.id} className="card">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-soft)] flex items-center justify-center flex-shrink-0">
                                    {categoryIcons[m.category]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{m.title}</h4>
                                        <span className="text-xs text-[var(--accent-violet)] font-medium">
                                            {daysSince(m.date)} days ago
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">
                                        {new Date(m.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {m.description && (
                                        <p className="text-sm mt-2">{m.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {milestones.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            <p>No milestones yet</p>
                            <p className="text-sm">Add your first &quot;first&quot;! 💕</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Photo Modal */}
            {showAddPhoto && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">📸 Add Photo</h3>
                            <button onClick={() => setShowAddPhoto(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Photo URL (paste link)
                                </label>
                                <input
                                    type="url"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Word of the Week
                                </label>
                                <input
                                    type="text"
                                    value={wordOfWeek}
                                    onChange={(e) => setWordOfWeek(e.target.value)}
                                    placeholder="One word to describe this week"
                                    className="input"
                                />
                            </div>

                            <button
                                onClick={handleAddPhoto}
                                disabled={!photoUrl}
                                className={`btn btn-primary w-full ${!photoUrl ? 'opacity-50' : ''}`}
                            >
                                Save Photo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Milestone Modal */}
            {showAddMilestone && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">🎯 Add Milestone</h3>
                            <button onClick={() => setShowAddMilestone(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Category
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.entries(MILESTONE_CATEGORIES) as [Milestone['category'], typeof MILESTONE_CATEGORIES['romance']][]).map(([key, info]) => (
                                        <button
                                            key={key}
                                            onClick={() => setMilestoneCategory(key)}
                                            className={`py-3 rounded-xl text-center ${milestoneCategory === key
                                                ? 'bg-[var(--accent-violet)] text-white'
                                                : 'bg-[var(--bg-soft)]'
                                                }`}
                                        >
                                            <span className="text-xl">{info.emoji}</span>
                                            <p className="text-xs mt-1">{info.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    What was it?
                                </label>
                                <input
                                    type="text"
                                    value={milestoneTitle}
                                    onChange={(e) => setMilestoneTitle(e.target.value)}
                                    placeholder="First kiss, First trip..."
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    When?
                                </label>
                                <input
                                    type="date"
                                    value={milestoneDate}
                                    onChange={(e) => setMilestoneDate(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">
                                    Details (optional)
                                </label>
                                <textarea
                                    value={milestoneDesc}
                                    onChange={(e) => setMilestoneDesc(e.target.value)}
                                    placeholder="Where, how it felt..."
                                    rows={3}
                                    className="input resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAddMilestone}
                                disabled={!milestoneTitle || !milestoneDate}
                                className={`btn btn-primary w-full ${(!milestoneTitle || !milestoneDate) ? 'opacity-50' : ''}`}
                            >
                                Save Milestone
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
}
