'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ListTodo, Camera, Wallet } from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Vibe' },
    { href: '/dossier', icon: BookOpen, label: 'Dossier' },
    { href: '/lists', icon: ListTodo, label: 'Lists' },
    { href: '/memory', icon: Camera, label: 'Memory' },
    { href: '/life', icon: Wallet, label: 'Life' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
