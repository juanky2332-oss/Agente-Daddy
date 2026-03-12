'use client';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Search, FileText, Download } from 'lucide-react';
import { exportTransactionsToPDF } from '@/lib/pdf-export';

export default function DocumentsPage() {
    const { transactions, categories, setSelectedTransactionId } = useAppStore();

    // Filters state
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
    const [monthFilter, setMonthFilter] = useState('all');

    // Available years for filter
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
        if (uniqueYears.length === 0) return [new Date().getFullYear().toString()];
        return uniqueYears.sort((a, b) => b - a).map(String);
    }, [transactions]);

    const months = [
        { v: 'all', n: 'Todo el año' },
        { v: '1', n: 'Enero' }, { v: '2', n: 'Febrero' }, { v: '3', n: 'Marzo' },
        { v: '4', n: 'Abril' }, { v: '5', n: 'Mayo' }, { v: '6', n: 'Junio' },
        { v: '7', n: 'Julio' }, { v: '8', n: 'Agosto' }, { v: '9', n: 'Septiembre' },
        { v: '10', n: 'Octubre' }, { v: '11', n: 'Noviembre' }, { v: '12', n: 'Diciembre' }
    ];

    // Filtered data
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const matchesYear = date.getFullYear().toString() === yearFilter;
            const matchesMonth = monthFilter === 'all' || (date.getMonth() + 1).toString() === monthFilter;
            const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
            const hasDocument = !!t.receipt_url;
            return matchesYear && matchesMonth && matchesSearch && hasDocument;
        }).sort((a, b) => b.date.localeCompare(a.date));
    }, [transactions, yearFilter, monthFilter, search]);

    return (
        <div className="page-container">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Documentos 📂</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Historial de recibos y facturas</p>
                </div>
                <button
                    className="btn btn-primary btn-sm flex items-center gap-2"
                    onClick={() => {
                        const monthName = months.find(m => m.v === monthFilter)?.n || '';
                        exportTransactionsToPDF(filteredTransactions, `Documentos_${yearFilter}_${monthName}`, 'Listado de documentos escaneados');
                    }}
                    disabled={filteredTransactions.length === 0}
                >
                    <Download size={16} /> Descargar PDF
                </button>
            </header>

            {/* Filters Bar */}
            <div className="card mb-6" style={{ padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">Buscar por nombre</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                className="input"
                                style={{ paddingLeft: '36px' }}
                                placeholder="Ej: Mercadona..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, width: '100px' }}>
                        <label className="label">Año</label>
                        <select className="select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, width: '140px' }}>
                        <label className="label">Mes</label>
                        <select className="select" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents Grid/List */}
            {filteredTransactions.length === 0 ? (
                <div className="card empty-state">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <h3>No hay documentos</h3>
                    <p>No se encontraron transacciones con documento para este periodo.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredTransactions.map(tx => (
                        <div
                            key={tx.id}
                            className="card tx-card-hover"
                            style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            onClick={() => setSelectedTransactionId(tx.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--gray-500)'
                                    }}>
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, margin: 0 }}>{tx.description}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: '2px 0 0' }}>
                                            {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} • {categories.find(c => c.id === tx.category_id)?.name}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: tx.type === 'income' ? 'var(--income)' : 'var(--black)' }}>
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .tx-card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--black);
                }
            `}</style>
        </div>
    );
}
