'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { TransactionItem } from '@/components/TransactionItem';
import {
    TrendingUp, TrendingDown, Plus, ScanLine, PenLine,
    ArrowRight,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import {
    computeBalance, computeMonthlyTotals, computeCategoryBreakdown,
} from '@/lib/mock-data';

export default function DashboardPage() {
    const { transactions, categories } = useAppStore();
    const router = useRouter();

    const confirmed = transactions.filter((t) => t.is_confirmed);
    const balance = computeBalance(confirmed);
    const totalIncome = confirmed.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = confirmed.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthlyData = computeMonthlyTotals(transactions);
    const categoryData = computeCategoryBreakdown(transactions, categories);
    const recent = [...confirmed].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    const yearlyData = monthlyData.map((m) => ({
        ...m,
        balance: m.income - m.expense,
    }));

    const fmtEur = (n: number) =>
        n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                        Viernes, 6 de marzo de 2026
                    </p>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard 🐾</h1>
                </div>
            </div>

            {/* Balance Card */}
            <div className="balance-card mb-4">
                <p className="balance-label">Balance actual</p>
                <p className="balance-amount" style={{ color: balance >= 0 ? '#4ade80' : '#f87171' }}>
                    {balance >= 0 ? '' : '−'}{fmtEur(Math.abs(balance))} €
                </p>
                <div className="balance-chips">
                    <div className="balance-chip">
                        <TrendingUp size={14} color="#4ade80" />
                        <span style={{ color: '#4ade80' }}>+{fmtEur(totalIncome)} €</span>
                    </div>
                    <div className="balance-chip">
                        <TrendingDown size={14} color="#f87171" />
                        <span style={{ color: '#f87171' }}>−{fmtEur(totalExpense)} €</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr', marginBottom: '16px' }}>
                {/* Income vs Expenses Bar Chart */}
                <div className="card">
                    <div className="section-header">
                        <span className="section-title">Ingresos vs Gastos</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Últimos 6 meses</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ border: '1px solid var(--gray-200)', borderRadius: '10px', fontSize: '0.8rem', background: 'white' }}
                                formatter={(v: unknown) => [`${fmtEur(Number(v))} €`]}
                            />
                            <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Pie */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', alignItems: 'center' }}>
                    <div>
                        <div className="section-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', marginBottom: '12px' }}>
                            <span className="section-title">Por categoría</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Marzo 2026</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {categoryData.slice(0, 4).map((d) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-700)', flex: 1 }}>{d.name}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fmtEur(d.value)}€</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                                {categoryData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: unknown) => [`${fmtEur(Number(v))} €`]} contentStyle={{ fontSize: '0.8rem', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Yearly Line Chart */}
                <div className="card">
                    <div className="section-header">
                        <span className="section-title">Evolución del balance</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>2026</span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={yearlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--gray-500)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ border: '1px solid var(--gray-200)', borderRadius: '10px', fontSize: '0.8rem' }} formatter={(v: unknown) => [`${fmtEur(Number(v))} €`]} />
                            <Line type="monotone" dataKey="balance" name="Balance" stroke="var(--black)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--black)' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div className="section-header">
                    <span className="section-title">Últimas transacciones</span>
                    <button
                        className="btn btn-ghost btn-sm flex items-center gap-2"
                        onClick={() => router.push('/pending')}
                    >
                        Ver todo <ArrowRight size={14} />
                    </button>
                </div>
                {recent.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                ))}
            </div>
        </div>
    );
}
