'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '@/lib/store';
import {
    Key, Bell, Shield, Palette, Send, Calendar, ChevronRight,
    Eye, EyeOff, CheckCircle, Plus, Trash2,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Transaction } from '@/lib/types';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ width: '36px', height: '36px', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)' }}>
                    {icon}
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</h2>
            </div>
            {children}
        </div>
    );
}

function SettingsContent() {
    const { settings, setSettings, categories, addTransaction } = useAppStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showKey, setShowKey] = useState(false);
    const [apiKey, setApiKey] = useState(settings.openai_api_key || '');
    const [telegramToken, setTelegramToken] = useState(settings.telegram_bot_token || '');
    const [notifyDays, setNotifyDays] = useState(settings.notification_days_advance || 3);
    const [saved, setSaved] = useState('');

    const saveField = (field: string, value: string | number) => {
        setSettings({ ...settings, [field]: value });
        setSaved(field);
        setTimeout(() => setSaved(''), 2000);
    };

    const SavedBadge = ({ field }: { field: string }) =>
        saved === field ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--income)', fontSize: '0.8rem', fontWeight: 600 }}>
                <CheckCircle size={14} /> Guardado
            </span>
        ) : null;

    useEffect(() => {
        const syncGoogleCalendar = async () => {
            const gToken = searchParams.get('g_token');
            if (gToken) {
                try {
                    // Fetch real events from Google Calendar
                    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString() + '&maxResults=10&orderBy=startTime&singleEvents=true', {
                        headers: {
                            Authorization: `Bearer ${gToken}`
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const events = data.items || [];

                        let importedCount = 0;
                        events.forEach((event: any) => {
                            if (event.start && (event.start.date || event.start.dateTime)) {
                                const startDate = event.start.date || event.start.dateTime;
                                // Simple extraction of amount if present in title/description
                                const title = event.summary || 'Evento sin título';
                                const amountMatch = title.match(/\d+(\.\d+)?/);
                                const amount = amountMatch ? parseFloat(amountMatch[0]) : 50; // Default if not found

                                const newTx: Transaction = {
                                    id: `cal-${event.id}`,
                                    amount: amount,
                                    date: startDate.split('T')[0],
                                    category_id: 'cat-2', // Generic recurring category
                                    description: `📅 ${title}`,
                                    is_confirmed: true,
                                    is_recurring: true,
                                    source: 'auto',
                                    type: 'expense'
                                };
                                addTransaction(newTx);
                                importedCount++;
                            }
                        });
                        alert(`¡Sincronización real completada! Se han importado ${importedCount} eventos de tu Google Calendar.`);
                    } else {
                        alert('No se pudieron obtener los eventos de Google Calendar.');
                    }
                } catch (e) {
                    console.error("Error fetching google calendar:", e);
                    alert('Error de red al sincronizar el calendario.');
                }
                router.replace('/settings');
            } else if (searchParams.get('trigger_mock_sync') === 'true') {
                console.log("🐾 Iniciando sincronización SIMULADA (Mock)...");
                const mockEvents: Transaction[] = [
                    { id: `cal-mock-${Date.now()}-1`, amount: 850, date: `2026-03-05`, category_id: 'cat-2', description: 'Alquiler (Calendar Sync)', is_confirmed: true, is_recurring: true, source: 'manual', type: 'expense' },
                    { id: `cal-mock-${Date.now()}-2`, amount: 50, date: `2026-03-12`, category_id: 'cat-4', description: 'Gimnasio (Calendar Sync)', is_confirmed: true, is_recurring: true, source: 'manual', type: 'expense' }
                ];
                mockEvents.forEach(e => addTransaction(e));
                alert('¡Sincronización simulada completada! Los datos se han añadido a tu lista.');
                router.replace('/settings');
            }
        };

        syncGoogleCalendar();
    }, [searchParams, addTransaction, router]);

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Configuración ⚙️</h1>

            {/* AI Configuration */}
            <Section icon={<Key size={18} />} title="API OpenAI">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Necesitas tu propia clave de OpenAI para usar el escaneo IA y el chatbot Husky. Obtén una en <a href="https://platform.openai.com" target="_blank" rel="noopener" style={{ color: 'var(--black)', fontWeight: 600 }}>platform.openai.com</a>
                    </p>
                    <div className="form-group">
                        <label className="label">API Key</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input"
                                type={showKey ? 'text' : 'password'}
                                placeholder="sk-proj-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}
                                onClick={() => setShowKey(!showKey)}
                                type="button"
                            >
                                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveField('openai_api_key', apiKey)}>
                            Guardar clave
                        </button>
                        <SavedBadge field="openai_api_key" />
                    </div>
                </div>
            </Section>

            {/* Telegram */}
            <Section icon={<Send size={18} />} title="Telegram Bot">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Crea un bot con <strong>@BotFather</strong> en Telegram y pega el token aquí para recibir alertas de pagos recurrentes.
                    </p>
                    <div className="form-group">
                        <label className="label">Bot Token</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="123456789:AAFxxxxxxx"
                            value={telegramToken}
                            onChange={(e) => setTelegramToken(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveField('telegram_bot_token', telegramToken)}>
                            Guardar token
                        </button>
                        <SavedBadge field="telegram_bot_token" />
                    </div>
                </div>
            </Section>

            {/* Google Calendar */}
            <Section icon={<Calendar size={18} />} title="Google Calendar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        Sincroniza tus pagos recurrentes con Google Calendar para no olvidar ninguno.
                    </p>
                    <a href="/api/calendar/auth" className="btn btn-ghost w-full flex items-center justify-between" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span>Conectar con Google Calendar</span>
                        <ChevronRight size={16} />
                    </a>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>⚠️ Requiere configurar OAuth2 en Google Cloud Console. Ver documentación.</p>
                </div>
            </Section>

            {/* Notifications */}
            <Section icon={<Bell size={18} />} title="Notificaciones">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="form-group">
                        <label className="label">Alertar con antelación (días)</label>
                        <input
                            className="input"
                            type="number"
                            min={1}
                            max={14}
                            value={notifyDays}
                            onChange={(e) => setNotifyDays(parseInt(e.target.value) || 3)}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Recibirás alertas {notifyDays} días antes de cada pago recurrente.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveField('notification_days_advance', notifyDays)}>
                            Guardar
                        </button>
                        <SavedBadge field="notification_days_advance" />
                    </div>
                </div>
            </Section>

            {/* Security */}
            <Section icon={<Shield size={18} />} title="Seguridad">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-ghost w-full flex items-center justify-between" style={{ textAlign: 'left' }}>
                        <span>Cambiar PIN de acceso</span>
                        <ChevronRight size={16} />
                    </button>
                    <button className="btn btn-ghost w-full flex items-center justify-between" style={{ textAlign: 'left' }}>
                        <span>Configurar 2FA (TOTP)</span>
                        <ChevronRight size={16} />
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        PIN actual: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>1234</code> (cámbialo en producción)
                    </p>
                </div>
            </Section>

            {/* Categories */}
            <Section icon={<Palette size={18} />} title="Categorías">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {categories.map((cat) => (
                        <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }} />
                                <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{cat.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {cat.is_custom && (
                                    <button className="btn btn-icon" style={{ width: '32px', height: '32px', color: 'var(--expense)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                {!cat.is_custom && <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)', fontSize: '0.7rem' }}>Predefinida</span>}
                            </div>
                        </div>
                    ))}
                    <button className="btn btn-ghost w-full flex items-center gap-2" style={{ marginTop: '8px' }}>
                        <Plus size={16} /> Añadir categoría personalizada
                    </button>
                </div>
            </Section>

            {/* App Info */}
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)', fontSize: '0.8rem' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🐾</p>
                <p style={{ fontWeight: 700, color: 'var(--gray-600)' }}>Agente Daddy</p>
                <p>v1.0.0 MVP — Hecho con ❤️</p>
                <p style={{ marginTop: '4px' }}>Modo: {process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? '🧪 Demo (mock data)' : '🔴 Producción'}</p>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="page-container flex items-center justify-center min-h-[50vh]">
                <div className="spinner" />
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
