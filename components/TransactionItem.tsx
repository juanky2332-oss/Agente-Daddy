'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { Transaction, Category } from '@/lib/types';
import {
    ShoppingCart, Home, Car, Repeat, Gamepad2, TrendingUp, Heart, BookOpen, DollarSign,
    Eye, X, FileText
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
    const { categories, setSelectedTransactionId } = useAppStore();
    const cat = categories.find((c) => c.id === tx.category_id);
    const isIncome = tx.type === 'income';

    const formattedDate = new Date(tx.date).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short',
    });

    return (
        <div className="tx-item" onClick={onClick || (() => setSelectedTransactionId(tx.id))}>
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
                    <div style={{ color: 'var(--gray-400)' }} title="Tiene documento adjunto">
                        <FileText size={16} />
                    </div>
                )}
                <span style={{ fontWeight: 700 }}>{isIncome ? '+' : '−'}{tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
        </div>
    );
}
