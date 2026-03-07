'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { TransactionItem } from '@/components/TransactionItem';
import { CheckCircle, Trash2, Edit3, Clock, AlertCircle, Plus, X, Save, TrendingUp, ScanLine } from 'lucide-react';

export default function PendingPage() {
    const { transactions, updateTransaction, deleteTransaction, addTransaction, categories } = useAppStore();
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ amount: 0, date: '', description: '', category_id: '' });

    const router = useRouter();
    // State for manual pending income
    const [isAddingIncome, setIsAddingIncome] = useState(false);
    const [newIncomeForm, setNewIncomeForm] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category_id: categories.find(c => c.name.toLowerCase().includes('ingreso'))?.id || categories[0]?.id || '',
        is_recurring: false,
        recurrence_days: 30
    });

    // State for manual pending expense
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [newExpenseForm, setNewExpenseForm] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category_id: categories[0]?.id || '',
        is_recurring: false,
        recurrence_days: 30
    });

    const PERIODS = [
        { label: 'Puntual', days: 0 },
        { label: 'Mensual', days: 30 },
        { label: 'Semanal', days: 7 },
        { label: 'Anual', days: 365 },
    ];

    const pending = transactions
        .filter((t) => !t.is_confirmed)
        .sort((a, b) => b.date.localeCompare(a.date));

    const handleConfirm = (id: string) => {
        updateTransaction(id, { is_confirmed: true });
        setConfirmingId(null);
    };

    const handleDelete = (id: string) => {
        deleteTransaction(id);
        setConfirmingId(null);
        if (editingId === id) setEditingId(null);
    };

    const startEdit = (tx: any) => {
        setEditingId(tx.id);
        setEditForm({
            amount: tx.amount,
            date: tx.date,
            description: tx.description,
            category_id: tx.category_id,
            is_recurring: tx.is_recurring,
            recurrence_days: tx.recurrence_days || 30
        } as any);
    };

    const saveEdit = (id: string) => {
        updateTransaction(id, { ...editForm });
        setEditingId(null);
    };

    const handleAddPendingIncome = () => {
        if (!newIncomeForm.amount || !newIncomeForm.description) return;

        addTransaction({
            id: Math.random().toString(36).substring(2, 9),
            amount: parseFloat(newIncomeForm.amount),
            date: newIncomeForm.date,
            description: newIncomeForm.description,
            category_id: newIncomeForm.category_id,
            type: 'income',
            is_confirmed: false,
            is_recurring: newIncomeForm.is_recurring,
            recurrence_days: newIncomeForm.is_recurring ? newIncomeForm.recurrence_days : undefined,
            source: 'manual'
        });

        setIsAddingIncome(false);
        setNewIncomeForm({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            category_id: categories.find(c => c.name.toLowerCase().includes('ingreso'))?.id || categories[0]?.id || '',
            is_recurring: false,
            recurrence_days: 30
        });
    };

    const handleAddPendingExpense = () => {
        if (!newExpenseForm.amount || !newExpenseForm.description) return;

        addTransaction({
            id: Math.random().toString(36).substring(2, 9),
            amount: parseFloat(newExpenseForm.amount),
            date: newExpenseForm.date,
            description: newExpenseForm.description,
            category_id: newExpenseForm.category_id,
            type: 'expense',
            is_confirmed: false,
            is_recurring: newExpenseForm.is_recurring,
            recurrence_days: newExpenseForm.is_recurring ? newExpenseForm.recurrence_days : undefined,
            source: 'manual'
        });

        setIsAddingExpense(false);
        setNewExpenseForm({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            category_id: categories[0]?.id || '',
            is_recurring: false,
            recurrence_days: 30
        });
    };

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pendientes ⏳</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '2px' }}>
                        Cobros y pagos por confirmar
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {pending.length > 0 && (
                        <div style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontWeight: 700, fontSize: '0.875rem' }}>
                            {pending.length}
                        </div>
                    )}
                    <button
                        onClick={() => { setIsAddingIncome(!isAddingIncome); setIsAddingExpense(false); }}
                        style={{
                            background: 'var(--income)', color: 'white', border: 'none',
                            width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title="Añadir ingreso pendiente"
                    >
                        {isAddingIncome ? <X size={20} /> : <Plus size={20} />}
                    </button>
                    <button
                        onClick={() => { setIsAddingExpense(!isAddingExpense); setIsAddingIncome(false); }}
                        style={{
                            background: 'var(--expense)', color: 'white', border: 'none',
                            width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title="Añadir gasto pendiente"
                    >
                        {isAddingExpense ? <X size={20} /> : <Plus size={20} />}
                    </button>
                </div>
            </div>

            {isAddingIncome && (
                <div className="card slide-down" style={{ marginBottom: '20px', border: '2px solid var(--income-light)', background: 'white' }}>
                    <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ background: 'var(--income-light)', color: 'var(--income)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
                                <TrendingUp size={18} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Nuevo Ingreso Pendiente</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label className="label">Importe Esperado (€)</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="0.00"
                                    value={newIncomeForm.amount}
                                    onChange={e => setNewIncomeForm({ ...newIncomeForm, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">¿De qué se trata?</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Ej: Venta Wallapop, Bizum pendiente..."
                                    value={newIncomeForm.description}
                                    onChange={e => setNewIncomeForm({ ...newIncomeForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Fecha prevista</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={newIncomeForm.date}
                                    onChange={e => setNewIncomeForm({ ...newIncomeForm, date: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Periodicidad</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {PERIODS.map(p => (
                                        <button
                                            key={p.days}
                                            type="button"
                                            className={`btn btn-sm ${((!newIncomeForm.is_recurring && p.days === 0) || (newIncomeForm.is_recurring && newIncomeForm.recurrence_days === p.days)) ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setNewIncomeForm(f => ({ ...f, is_recurring: p.days > 0, recurrence_days: p.days }))}
                                            style={{ fontSize: '0.7rem', padding: '6px 2px' }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={handleAddPendingIncome}
                                    disabled={!newIncomeForm.amount || !newIncomeForm.description}
                                >
                                    <Save size={18} /> Registrar
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--gray-100)' }}
                                    onClick={() => router.push('/scanner?tab=scan')}
                                >
                                    <ScanLine size={18} /> Escanear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddingExpense && (
                <div className="card slide-down" style={{ marginBottom: '20px', border: '2px solid var(--expense-light)', background: 'white' }}>
                    <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ background: 'var(--expense-light)', color: 'var(--expense)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
                                <Clock size={18} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Nuevo Gasto Pendiente</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label className="label">Importe Estimado (€)</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="0.00"
                                    value={newExpenseForm.amount}
                                    onChange={e => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">¿De qué se trata?</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Ej: Factura luz, Alquiler próximamente..."
                                    value={newExpenseForm.description}
                                    onChange={e => setNewExpenseForm({ ...newExpenseForm, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Fecha prevista</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={newExpenseForm.date}
                                    onChange={e => setNewExpenseForm({ ...newExpenseForm, date: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Periodicidad</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {PERIODS.map(p => (
                                        <button
                                            key={p.days}
                                            type="button"
                                            className={`btn btn-sm ${((!newExpenseForm.is_recurring && p.days === 0) || (newExpenseForm.is_recurring && newExpenseForm.recurrence_days === p.days)) ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setNewExpenseForm(f => ({ ...f, is_recurring: p.days > 0, recurrence_days: p.days }))}
                                            style={{ fontSize: '0.7rem', padding: '6px 2px' }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--expense)' }}
                                    onClick={handleAddPendingExpense}
                                    disabled={!newExpenseForm.amount || !newExpenseForm.description}
                                >
                                    <Save size={18} /> Registrar
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--gray-100)' }}
                                    onClick={() => router.push('/scanner?tab=scan')}
                                >
                                    <ScanLine size={18} /> Escanear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pending.length === 0 ? (
                <div className="card empty-state">
                    <span className="empty-state-icon">✅</span>
                    <h3>¡Todo al día!</h3>
                    <p>No tienes transacciones pendientes de confirmar.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Alert Banner */}
                    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <AlertCircle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '0.875rem', color: '#92400E' }}>
                            Estas transacciones son <strong>recurrentes</strong>. Confirma su ejecución, o edita importe/fecha si han variado este mes.
                        </p>
                    </div>

                    {pending.map((tx) => (
                        <div key={tx.id} className="card" style={{ padding: '0' }}>
                            <div style={{ padding: '16px 16px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    {tx.is_recurring ? (
                                        <>
                                            <Clock size={14} color="var(--gray-400)" />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recurrente pendiente</span>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {tx.type === 'income' ? 'Ingreso pendiente' : 'Gasto pendiente'}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {editingId === tx.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                                        <div className="form-group">
                                            <label className="label">Importe (€)</label>
                                            <input className="input" type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Fecha</label>
                                            <input className="input" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Concepto</label>
                                            <input className="input" type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Periodicidad</label>
                                            <select
                                                className="select"
                                                value={(editForm as any).is_recurring ? ((editForm as any).recurrence_days || 30) : 0}
                                                onChange={(e) => {
                                                    const days = parseInt(e.target.value);
                                                    setEditForm({ ...editForm, is_recurring: days > 0, recurrence_days: days > 0 ? days : undefined } as any);
                                                }}
                                            >
                                                {PERIODS.map(p => <option key={p.days} value={p.days}>{p.label}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <button className="btn btn-primary btn-sm flex-1" onClick={() => saveEdit(tx.id)}>Guardar</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <TransactionItem tx={tx} />
                                )}
                            </div>
                            <div style={{ display: 'flex', borderTop: '1px solid var(--gray-100)' }}>
                                <button
                                    onClick={() => handleConfirm(tx.id)}
                                    style={{
                                        flex: 1, padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        color: 'var(--income)', fontWeight: 600, fontSize: '0.875rem',
                                        borderRight: '1px solid var(--gray-100)', fontFamily: 'var(--font)',
                                        borderRadius: '0 0 0 var(--radius-lg)', transition: 'background 0.1s'
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--income-light)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <CheckCircle size={16} /> Confirmar
                                </button>
                                <button
                                    onClick={() => startEdit(tx)}
                                    style={{
                                        width: '52px', padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--gray-500)', borderRight: '1px solid var(--gray-100)',
                                        transition: 'background 0.1s'
                                    }}
                                    title="Editar"
                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                    disabled={editingId === tx.id}
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(tx.id)}
                                    style={{
                                        width: '52px', padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--expense)', borderRadius: '0 0 var(--radius-lg) 0',
                                        transition: 'background 0.1s'
                                    }}
                                    title="Eliminar"
                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--expense-light)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
