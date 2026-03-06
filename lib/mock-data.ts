import { Category, Transaction, RecurringTemplate, Settings } from './types';

// ============================================================
// PREDEFINED CATEGORIES
// ============================================================
export const MOCK_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Alimentación', is_custom: false, icon_name: 'ShoppingCart', color: '#F59E0B' },
    { id: 'cat-2', name: 'Vivienda', is_custom: false, icon_name: 'Home', color: '#3B82F6' },
    { id: 'cat-3', name: 'Transporte', is_custom: false, icon_name: 'Car', color: '#6366F1' },
    { id: 'cat-4', name: 'Suscripciones', is_custom: false, icon_name: 'Repeat', color: '#EC4899' },
    { id: 'cat-5', name: 'Ocio', is_custom: false, icon_name: 'Gamepad2', color: '#8B5CF6' },
    { id: 'cat-6', name: 'Ingresos', is_custom: false, icon_name: 'TrendingUp', color: '#22C55E' },
    { id: 'cat-7', name: 'Salud', is_custom: false, icon_name: 'Heart', color: '#EF4444' },
    { id: 'cat-8', name: 'Educación', is_custom: false, icon_name: 'BookOpen', color: '#14B8A6' },
];

// ============================================================
// MOCK TRANSACTIONS (last 3 months)
// ============================================================
export const MOCK_TRANSACTIONS: Transaction[] = [];

// ============================================================
// MOCK RECURRING TEMPLATES
// ============================================================
export const MOCK_RECURRING_TEMPLATES: RecurringTemplate[] = [];

// ============================================================
// MOCK SETTINGS
// ============================================================
export const MOCK_SETTINGS: Settings = {
    user_id: 'user-1',
    notification_days_advance: 3,
    language: 'es',
    openai_api_key: '',
    telegram_bot_token: '',
};

// ============================================================
// HELPER: Compute balance from confirmed transactions
// ============================================================
export function computeBalance(transactions: Transaction[]): number {
    return transactions
        .filter((t) => t.is_confirmed)
        .reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0);
}

export function computeMonthlyTotals(transactions: Transaction[], months = 6) {
    const result: { month: string; income: number; expense: number }[] = [];
    const now = new Date('2026-03-06');

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const monthTx = transactions.filter(
            (t) => t.is_confirmed && t.date.startsWith(monthStr)
        );
        result.push({
            month: label,
            income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        });
    }
    return result;
}

export function computeCategoryBreakdown(transactions: Transaction[], categories: Category[]) {
    const expenses = transactions.filter(
        (t) => t.is_confirmed && t.type === 'expense' && t.date.startsWith('2026-03')
    );
    const catMap: Record<string, number> = {};
    expenses.forEach((t) => {
        catMap[t.category_id] = (catMap[t.category_id] || 0) + t.amount;
    });
    return Object.entries(catMap).map(([category_id, value]) => ({
        name: categories.find((c) => c.id === category_id)?.name || 'Otro',
        value,
        color: categories.find((c) => c.id === category_id)?.color || '#999',
    }));
}
