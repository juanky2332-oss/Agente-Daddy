'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Edit3, Trash2, Save, FileText, Download } from 'lucide-react';

export function TransactionDetailModal() {
    const {
        transactions,
        categories,
        selectedTransactionId,
        setSelectedTransactionId,
        updateTransaction,
        deleteTransaction
    } = useAppStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    const tx = transactions.find(t => t.id === selectedTransactionId);

    useEffect(() => {
        if (tx) {
            setEditForm({ ...tx });
            setIsEditing(false);
        }
    }, [tx, selectedTransactionId]);

    if (!selectedTransactionId || !tx || !editForm) return null;

    const handleClose = () => {
        setSelectedTransactionId(null);
        setIsEditing(false);
    };

    const handleSave = () => {
        updateTransaction(tx.id, { ...editForm });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
            deleteTransaction(tx.id);
            handleClose();
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div className="card slide-up" style={{
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                position: 'relative'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                        {isEditing ? 'Editar Transacción' : 'Detalle de Transacción'}
                    </h3>
                    <button className="btn btn-icon" onClick={handleClose}><X size={20} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {isEditing ? (
                        <div className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="label">Descripción</label>
                                <input className="input" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Importe (€)</label>
                                <input className="input" type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Fecha</label>
                                <input className="input" type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Categoría</label>
                                <select className="select" value={editForm.category_id} onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-primary w-full mt-4" onClick={handleSave}>
                                <Save size={18} style={{ marginRight: '8px' }} /> Guardar cambios
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Resumen */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>{tx.description}</h2>
                                    <div style={{ display: 'flex', gap: '12px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                                        <span>{new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{categories.find(c => c.id === tx.category_id)?.name}</span>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: tx.type === 'income' ? 'var(--income)' : 'var(--black)'
                                }}>
                                    {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                                </div>
                            </div>

                            {/* Acciones Rápidas */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsEditing(true)}>
                                    <Edit3 size={18} /> Editar
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ flex: 1, color: tx.is_confirmed ? 'var(--expense)' : 'var(--income)', borderColor: tx.is_confirmed ? 'var(--expense-border)' : 'var(--income-border)' }}
                                    onClick={() => updateTransaction(tx.id, { is_confirmed: !tx.is_confirmed })}
                                >
                                    {tx.is_confirmed ? 'Marcar Pendiente' : 'Confirmar Gasto'}
                                </button>
                                <button className="btn btn-icon" style={{ flex: 'none', color: 'var(--expense)', borderColor: 'var(--expense-border)' }} onClick={handleDelete}>
                                    <Trash2 size={18} color="var(--expense)" />
                                </button>
                            </div>

                            {/* Documento Adjunto */}
                            {tx.receipt_url ? (
                                <div style={{ marginTop: '12px' }}>
                                    <h4 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={18} /> Documento Adjunto
                                    </h4>
                                    <div style={{
                                        width: '100%',
                                        height: '350px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--gray-200)',
                                        overflow: 'hidden',
                                        background: 'var(--gray-50)'
                                    }}>
                                        {tx.receipt_url.includes('blob:') || tx.receipt_url.startsWith('data:') ? (
                                            <iframe src={tx.receipt_url} width="100%" height="100%" style={{ border: 'none' }} />
                                        ) : (
                                            <img src={tx.receipt_url} alt="Documento adjunto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        )}
                                    </div>
                                    <a href={tx.receipt_url} download className="btn btn-ghost w-full mt-3" style={{ justifyContent: 'center' }}>
                                        <Download size={18} /> Descargar archivo
                                    </a>
                                </div>
                            ) : (
                                <div style={{ marginTop: '12px', padding: '24px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--gray-300)' }}>
                                    <FileText size={32} color="var(--gray-400)" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ color: 'var(--gray-600)', margin: 0, fontWeight: 500 }}>No hay documento adjunto</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                }
            `}</style>
        </div>
    );
}
