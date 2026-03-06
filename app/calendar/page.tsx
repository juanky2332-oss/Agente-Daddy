'use client';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Transaction } from '@/lib/types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TransactionItem } from '@/components/TransactionItem';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
    const { transactions } = useAppStore();
    const [current, setCurrent] = useState(new Date('2026-03-01'));
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const year = current.getFullYear();
    const month = current.getMonth();

    const txByDate = useMemo(() => {
        const map: Record<string, Transaction[]> = {};
        transactions.forEach(t => {
            if (!map[t.date]) map[t.date] = [];
            map[t.date].push(t);
        });
        return map;
    }, [transactions]);

    // Build calendar grid
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Adjust: Monday is 0
    const startDow = (firstDay.getDay() + 6) % 7;

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const today = new Date('2026-03-06');
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const selectedTx = selectedDay ? (txByDate[selectedDay] || []) : [];

    const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Calendario 📅</h1>

            <div className="card">
                {/* Month Nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button className="btn-icon btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
                    <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>{MONTHS[month]} {year}</h2>
                    <button className="btn-icon btn" onClick={nextMonth}><ChevronRight size={18} /></button>
                </div>

                {/* Day Headers */}
                <div className="cal-grid" style={{ marginBottom: '2px' }}>
                    {DAYS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
                </div>

                {/* Day Cells */}
                <div className="cal-grid" style={{ gap: '4px' }}>
                    {cells.map((date, i) => {
                        if (!date) return <div key={i} />;
                        const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const txs = txByDate[ds] || [];
                        const hasIncome = txs.some(t => t.type === 'income');
                        const hasExpense = txs.some(t => t.type === 'expense');
                        const isToday = ds === todayStr;
                        const isSelected = ds === selectedDay;

                        const incomeTotal = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                        const expenseTotal = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

                        return (
                            <div
                                key={i}
                                className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} group relative`}
                                onClick={() => setSelectedDay(ds === selectedDay ? null : ds)}
                                style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '4px' }}
                            >
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1, marginBottom: '4px', alignSelf: 'center' }}>{date.getDate()}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '2px', flex: 1, overflow: 'hidden' }}>
                                    {txs.slice(0, 3).map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', lineHeight: 1.2, background: t.type === 'income' ? 'var(--income-light)' : 'var(--expense-light)', color: t.type === 'income' ? 'var(--income)' : 'var(--expense)', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', flex: 1 }}>{t.description}</span>
                                            <span style={{ fontWeight: 700, marginLeft: '4px' }}>{t.amount.toFixed(0)}€</span>
                                        </div>
                                    ))}
                                    {txs.length > 3 && (
                                        <div style={{ fontSize: '0.6rem', color: 'var(--gray-500)', textAlign: 'center', marginTop: '1px' }}>+{txs.length - 3} más</div>
                                    )}
                                </div>

                                {/* Hover Tooltip */}
                                {txs.length > 0 && (
                                    <div className="cal-tooltip">
                                        <div style={{ fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>{date.getDate()} {MONTHS[date.getMonth()]}</div>
                                        {txs.map(t => (
                                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{t.description}</span>
                                                <span style={{ color: t.type === 'income' ? 'var(--income)' : 'var(--expense)', fontWeight: 600 }}>
                                                    {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}€
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        <div className="cal-dot cal-dot-income" style={{ width: 8, height: 8 }} /> Ingresos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        <div className="cal-dot cal-dot-expense" style={{ width: 8, height: 8 }} /> Gastos
                    </div>
                </div>

                {/* Inline Day Detail Sheet (Animated) */}
                {selectedDay && (
                    <div className="day-detail-panel slide-down" style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px dashed var(--gray-200)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-800)' }}>
                                {new Date(selectedDay + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            <button className="btn btn-icon" style={{ width: 28, height: 28, minHeight: 0 }} onClick={() => setSelectedDay(null)}><X size={14} /></button>
                        </div>
                        {selectedTx.length === 0 ? (
                            <div className="empty-state" style={{ padding: '16px' }}>
                                <span className="empty-state-icon" style={{ fontSize: '1.5rem' }}>🗓️</span>
                                <p style={{ fontSize: '0.85rem' }}>Sin transacciones este día</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {selectedTx.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
                            </div>
                        )}
                        {selectedTx.length > 0 && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Total día</span>
                                <span style={{ fontWeight: 700 }}>
                                    {selectedTx.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>



            {/* Monthly Summary */}
            <div className="card" style={{ marginTop: '16px' }}>
                <div className="section-header"><span className="section-title">Resumen del mes</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {['income', 'expense'].map(type => {
                        const total = transactions.filter(t => t.type === type && t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).reduce((s, t) => s + t.amount, 0);
                        return (
                            <div key={type} style={{ background: type === 'income' ? 'var(--income-light)' : 'var(--expense-light)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: type === 'income' ? 'var(--income)' : 'var(--expense)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type === 'income' ? 'Ingresos' : 'Gastos'}</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--black)' }}>{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</p>
                            </div>
                        );
                    })}
                </div>

                {/* Listado del mes */}
                <div className="section-header" style={{ marginTop: '16px' }}><span className="section-title">Movimientos del mes</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(() => {
                        const monthlyTx = transactions
                            .filter(t => t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        if (monthlyTx.length === 0) {
                            return <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', textAlign: 'center', padding: '16px 0' }}>No hay transacciones este mes.</p>;
                        }

                        return monthlyTx.map(tx => <TransactionItem key={tx.id} tx={tx} />);
                    })()}
                </div>
            </div>

            <style>{`
                .cal-day { position: relative; }
                .cal-tooltip {
                    display: none;
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--white);
                    border: 1px solid var(--gray-200);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    padding: 12px;
                    border-radius: var(--radius-md);
                    z-index: 50;
                    width: 220px;
                    max-height: 250px;
                    overflow-y: auto;
                    Margin-bottom: 8px;
                }
                .cal-day:hover .cal-tooltip {
                    display: block;
                }
                .cal-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -6px;
                    border-width: 6px;
                    border-style: solid;
                    border-color: var(--white) transparent transparent transparent;
                }
            `}</style>
        </div>
    );
}
