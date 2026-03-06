'use client';
import { useState, useEffect } from 'react';
import { BottomNav, Sidebar } from '@/components/Navigation';
import PinLock from '@/components/PinLock';

// Inactivity timeout in ms (1 minute)
const INACTIVITY_MS = 60_000;

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [locked, setLocked] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        let timer: NodeJS.Timeout;

        const reset = () => {
            clearTimeout(timer);
            timer = setTimeout(() => setLocked(true), INACTIVITY_MS);
        };

        const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
        events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
        reset();

        return () => {
            clearTimeout(timer);
            events.forEach((e) => window.removeEventListener(e, reset));
        };
    }, []);

    if (!mounted) return null;

    if (locked) {
        return <PinLock onSuccess={() => setLocked(false)} title="Sesión bloqueada" />;
    }

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
