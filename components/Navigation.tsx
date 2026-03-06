'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard, ScanLine, CalendarDays, Clock, Bot, Settings, Plus, PenLine
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'calendar', label: 'Calendario', icon: CalendarDays, href: '/calendar' },
    { id: 'pending', label: 'Pendientes', icon: Clock, href: '/pending' },
];

export function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
                const active = pathname.startsWith(href);
                return (
                    <button
                        key={id}
                        className={`bottom-nav-item ${active ? 'active' : ''}`}
                        onClick={() => router.push(href)}
                        aria-label={label}
                    >
                        <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="bottom-nav-label">{label}</span>
                        {active && <span className="bottom-nav-dot" />}
                    </button>
                );
            })}
        </nav>
    );
}

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const MAIN_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { id: 'calendar', label: 'Calendario', icon: CalendarDays, href: '/calendar' },
        { id: 'pending', label: 'Pendientes', icon: Clock, href: '/pending' },
    ];

    const [showSidebarFAB, setShowSidebarFAB] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowSidebarFAB(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="sidebar-logo">
                    <span style={{ fontSize: '1.5rem' }}>🐾</span>
                    <span className="sidebar-logo-text">Agente Daddy</span>
                </div>

                <div className="sidebar-section-label">Principal</div>
                {MAIN_ITEMS.map(({ id, label, icon: Icon, href }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <button
                            key={id}
                            className={`sidebar-item ${active ? 'active' : ''}`}
                            onClick={() => router.push(href)}
                        >
                            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                            {label}
                        </button>
                    );
                })}

                <div className="sidebar-section-label">Cuenta</div>
                <button
                    className={`sidebar-item ${pathname.startsWith('/settings') ? 'active' : ''}`}
                    onClick={() => router.push('/settings')}
                >
                    <Settings size={19} strokeWidth={1.8} />
                    Configuración
                </button>
            </div>

            {/* Desktop FAB in Sidebar */}
            <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '20px' }} ref={menuRef}>
                {showSidebarFAB && (
                    <div
                        className="glass-menu slide-up"
                        style={{
                            position: 'absolute', bottom: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 102, alignItems: 'stretch',
                            width: '220px'
                        }}
                    >
                        <div style={{ padding: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)', marginBottom: '4px' }}>
                            Añadir Registro
                        </div>
                        <button
                            className="btn flex items-center justify-start gap-3"
                            style={{ background: 'transparent', color: 'var(--black)', padding: '12px 16px', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', width: '100%', border: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => { setShowSidebarFAB(false); router.push('/scanner?tab=scan'); }}
                        >
                            <div style={{ background: 'var(--income-light)', color: 'var(--income)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
                                <ScanLine size={18} />
                            </div>
                            <span style={{ fontWeight: 600 }}>Escanear Doc.</span>
                        </button>
                        <button
                            className="btn flex items-center justify-start gap-3"
                            style={{ background: 'transparent', color: 'var(--black)', padding: '12px 16px', borderRadius: 'var(--radius-md)', transition: 'background 0.2s', width: '100%', border: 'none' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => { setShowSidebarFAB(false); router.push('/scanner?tab=manual'); }}
                        >
                            <div style={{ background: 'var(--expense-light)', color: 'var(--expense)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
                                <PenLine size={18} />
                            </div>
                            <span style={{ fontWeight: 600 }}>Entrada Manual</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={() => setShowSidebarFAB((v) => !v)}
                    aria-label="Nueva transacción"
                    style={{
                        position: 'relative', width: '64px', height: '64px', borderRadius: '50%',
                        border: '2px solid var(--gray-100)', boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer', outline: 'none', padding: 0,
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
                        <img
                            src="/husky.png"
                            alt="Añadir"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: showSidebarFAB ? 'scale(1.1)' : 'scale(1)' }}
                        />
                    </div>
                    {/* Plus Badge Indicator */}
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--income)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)',
                        border: '2px solid white',
                        transform: showSidebarFAB ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        zIndex: 10
                    }}>
                        <Plus size={18} strokeWidth={3} />
                    </div>
                </button>
            </div>
        </aside>
    );
}
