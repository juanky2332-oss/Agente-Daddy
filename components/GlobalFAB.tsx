'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, ScanLine, PenLine } from 'lucide-react';

export function GlobalFAB() {
    const router = useRouter();
    const pathname = usePathname();
    const [showFABMenu, setShowFABMenu] = useState(false);

    // Don't show FAB on scanner page itself to avoid clutter
    if (pathname.startsWith('/scanner')) return null;

    return (
        <>
            {showFABMenu && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                    onClick={() => setShowFABMenu(false)}
                />
            )}
            {showFABMenu && (
                <div
                    className="glass-menu slide-up"
                    style={{
                        position: 'fixed', bottom: 'calc(var(--bottom-nav-h) + 100px)', left: '16px',
                        display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 101, alignItems: 'stretch',
                        minWidth: '220px'
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
                        onClick={() => { setShowFABMenu(false); router.push('/scanner?tab=scan'); }}
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
                        onClick={() => { setShowFABMenu(false); router.push('/scanner?tab=manual'); }}
                    >
                        <div style={{ background: 'var(--expense-light)', color: 'var(--expense)', padding: '8px', borderRadius: 'var(--radius-full)' }}>
                            <PenLine size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>Entrada Manual</span>
                    </button>
                </div>
            )}
            <button
                className="fab mobile-only-fab"
                onClick={() => setShowFABMenu((v) => !v)}
                aria-label="Nueva transacción"
                style={{
                    left: '20px',
                    right: 'auto',
                    bottom: 'calc(var(--bottom-nav-h) + 20px)',
                    background: '#16a34a', // Solid green
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Plus size={32} strokeWidth={3} style={{ transform: showFABMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
        </>
    );
}
