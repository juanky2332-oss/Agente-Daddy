'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { TransactionItem } from '@/components/TransactionItem';
import { CheckCircle, Trash2, Edit3, Clock, AlertCircle } from 'lucide-react';

export default function PendingPage() {
    const { transactions, updateTransaction, deleteTransaction } = useAppStore();
    const [confirmingId, setConfirmingId] = useState<string | null>(null);


    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ amount: 0, date: '', description: '', category_id: '' });

    const pending = transactions
        .filter((t) => !t.is_confirmed && t.is_recurring)
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
        setEditForm({ amount: tx.amount, date: tx.date, description: tx.description, category_id: tx.category_id });
    };

    const saveEdit = (id: string) => {
        updateTransaction(id, { ...editForm });
        setEditingId(null);
    };

    return (
        <div className="page-container">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Pendientes ⏳</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '2px' }}>
                        Transacciones periódicas sin confirmar
                    </p>
                </div>
                {pending.length > 0 && (
                    <div style={{ background: 'var(--expense-light)', color: 'var(--expense)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontWeight: 700, fontSize: '0.875rem' }}>
                        {pending.length}
                    </div>
                )}
            </div>

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
                                    <Clock size={14} color="var(--gray-400)" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recurrente pendiente</span>
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
