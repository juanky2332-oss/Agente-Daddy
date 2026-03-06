'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { Transaction, Category } from '@/lib/types';
import {
    ShoppingCart, Home, Car, Repeat, Gamepad2, TrendingUp, Heart, BookOpen, DollarSign,
    Eye, X
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    ShoppingCart, Home, Car, Repeat, Gamepad2, TrendingUp, Heart, BookOpen, DollarSign,
};

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
    const Icon = ICON_MAP[category.icon_name] || DollarSign;
    return <Icon size={size} color={category.color} />;
}

export function TransactionItem({
    tx,
    onClick,
}: {
    tx: Transaction;
    onClick?: () => void;
}) {
    const categories = useAppStore((s) => s.categories);
    const cat = categories.find((c) => c.id === tx.category_id);
    const isIncome = tx.type === 'income';
    const [previewOpen, setPreviewOpen] = useState(false);

    const formattedDate = new Date(tx.date).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short',
    });

    return (
        <>
            <div className="tx-item" onClick={onClick}>
                <div
                    className="tx-icon"
                    style={{ background: cat ? `${cat.color}18` : 'var(--gray-100)' }}
                >
                    {cat && <CategoryIcon category={cat} size={18} />}
                </div>
                <div className="tx-info">
                    <div className="tx-desc">{tx.description}</div>
                    <div className="tx-date flex items-center gap-2">
                        <span>{formattedDate}</span>
                        {cat && <span style={{ color: cat.color, fontWeight: 600 }}>{cat.name}</span>}
                        {!tx.is_confirmed && <span className="badge badge-pending" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>Pendiente</span>}
                        {tx.is_recurring && <span title="Recurrente">🔄</span>}
                    </div>
                </div>
                <div className={`tx-amount ${isIncome ? 'text-income' : 'text-expense'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {tx.receipt_url && (
                        <button
                            className="btn btn-icon btn-sm"
                            onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
                            style={{ width: '28px', height: '28px', background: 'transparent' }}
                            title="Ver documento"
                        >
                            <Eye size={16} color="var(--gray-500)" />
                        </button>
                    )}
                    {isIncome ? '+' : '−'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                </div>
            </div>

            {/* Receipt Preview Overlay */}
            {previewOpen && tx.receipt_url && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        onClick={() => setPreviewOpen(false)}
                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <X size={32} />
                    </button>
                    <img src={tx.receipt_url} alt="Recibo" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
            )}
        </>
    );
}
