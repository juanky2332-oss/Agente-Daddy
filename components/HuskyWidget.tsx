'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { sendChatMessage } from '@/lib/openai-service';
import { ChatMessage } from '@/lib/types';
import { Send, Trash2, Zap, X, MessageCircle } from 'lucide-react';

const QUICK_PROMPTS = [
    '¿Cuánto llevo gastado este mes?',
    'Proyecta mi balance',
    '¿Cuánto puedo ahorrar?',
];

export function HuskyWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { chatMessages, addChatMessage, clearChat, transactions, settings } = useAppStore();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [chatMessages, loading, isOpen]);

    const contextJson = JSON.stringify({
        total_transactions: transactions.length,
        confirmed: transactions.filter(t => t.is_confirmed).length,
        balance: transactions.filter(t => t.is_confirmed).reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0).toFixed(2),
        income_march: transactions.filter(t => t.is_confirmed && t.type === 'income' && t.date.startsWith('2026-03')).reduce((s, t) => s + t.amount, 0).toFixed(2),
        expense_march: transactions.filter(t => t.is_confirmed && t.type === 'expense' && t.date.startsWith('2026-03')).reduce((s, t) => s + t.amount, 0).toFixed(2),
    });

    const handleSend = async (text?: string) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        setInput('');

        const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() };
        addChatMessage(userMsg);
        setLoading(true);

        try {
            const reply = await sendChatMessage([...chatMessages, userMsg], contextJson);
            addChatMessage({ id: `a-${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date() });
        } catch (e: any) {
            addChatMessage({ id: `e-${Date.now()}`, role: 'assistant', content: '¡Guau! 🐾 Ha habido un error con la conexión a OpenAI. Revisa tus ajustes.', timestamp: new Date() });
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
    };

    return (
        <>
            {/* Overlay to close on outside click */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'transparent' }}
                />
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: 'calc(var(--bottom-nav-h) + 20px)',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--white)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '2px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    cursor: 'pointer',
                    animation: isOpen ? 'none' : 'bounce-husky 3s infinite ease-in-out',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)',
                    overflow: 'hidden'
                }}
            >
                {isOpen ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <img src="/husky.png" alt="Husky" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                        <X size={28} color="var(--primary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }} />
                    </div>
                ) : (
                    <img src="/husky.png" alt="Husky" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: 'calc(var(--bottom-nav-h) + 90px)',
                    right: '20px',
                    width: 'calc(100vw - 40px)',
                    maxWidth: '400px',
                    height: '550px',
                    maxHeight: 'calc(100vh - var(--bottom-nav-h) - 120px)',
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 99,
                    overflow: 'hidden',
                    border: '1px solid var(--gray-200)',
                    animation: 'slide-up 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gray-50)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                                <img src="/husky.png" alt="Husky" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.1 }}>Agente Daddy</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Online 🐾</p>
                            </div>
                        </div>
                        <button className="btn btn-icon btn-sm" onClick={clearChat} title="Borrar chat"><Trash2 size={16} /></button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--white)' }}>
                        {chatMessages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: 'auto', marginBottom: 'auto' }}>
                                <img src="/husky.png" alt="Husky" style={{ width: '64px', opacity: 0.5, margin: '0 auto 10px' }} />
                                <p>¡Hola! Soy Daddy. Pregúntame sobre tus gastos.</p>
                            </div>
                        )}
                        {chatMessages.map((m) => (
                            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: '4px' }}>
                                <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`} style={{ padding: '8px 14px', fontSize: '0.9rem' }}>
                                    {renderContent(m.content)}
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>
                                    {new Date(m.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="chat-bubble chat-bubble-bot" style={{ padding: '10px 16px' }}>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gray-400)', animation: `bounce-dot 1s ${i * 0.2}s infinite` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px', borderTop: '1px solid var(--gray-100)', background: 'var(--white)' }}>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {QUICK_PROMPTS.map((p) => (
                                <button key={p} className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap', borderRadius: '16px', fontSize: '0.75rem', padding: '4px 10px', minHeight: 0 }} onClick={() => handleSend(p)}>
                                    <Zap size={12} style={{ display: 'inline', marginRight: 4 }} /> {p}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                className="input"
                                style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '10px 16px', fontSize: '0.9rem' }}
                                placeholder="Escribe aquí..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                            />
                            <button className="btn btn-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleSend()} disabled={!input.trim() || loading}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce-husky {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-dot {
                    0%,80%,100%{transform:scale(0.6);opacity:0.4}
                    40%{transform:scale(1);opacity:1}
                }
            `}</style>
        </>
    );
}
