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
export const MOCK_TRANSACTIONS: Transaction[] = [
    // March 2026
    { id: 't-01', date: '2026-03-06', amount: 2400, type: 'income', description: 'Nómina Marzo', category_id: 'cat-6', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-02', date: '2026-03-05', amount: 87.50, type: 'expense', description: 'Mercadona', category_id: 'cat-1', is_recurring: false, is_confirmed: true, source: 'auto' },
    { id: 't-03', date: '2026-03-04', amount: 14.99, type: 'expense', description: 'Netflix', category_id: 'cat-4', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-04', date: '2026-03-03', amount: 55.00, type: 'expense', description: 'Gasolina', category_id: 'cat-3', is_recurring: false, is_confirmed: true, source: 'auto' },
    { id: 't-05', date: '2026-03-01', amount: 850, type: 'expense', description: 'Alquiler Marzo', category_id: 'cat-2', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-06', date: '2026-03-01', amount: 9.99, type: 'expense', description: 'Spotify', category_id: 'cat-4', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },

    // Pending (not confirmed — from AI scan)
    { id: 't-07', date: '2026-03-06', amount: 124.50, type: 'expense', description: 'Factura Luz (AI)', category_id: 'cat-2', is_recurring: true, recurrence_days: 30, is_confirmed: false, source: 'auto' },
    { id: 't-08', date: '2026-03-05', amount: 42.00, type: 'expense', description: 'Restaurante (AI)', category_id: 'cat-1', is_recurring: false, is_confirmed: false, source: 'auto' },

    // February 2026
    { id: 't-09', date: '2026-02-28', amount: 2400, type: 'income', description: 'Nómina Febrero', category_id: 'cat-6', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-10', date: '2026-02-25', amount: 65.00, type: 'expense', description: 'Supermercado', category_id: 'cat-1', is_recurring: false, is_confirmed: true, source: 'manual' },
    { id: 't-11', date: '2026-02-20', amount: 35.00, type: 'expense', description: 'Farmacia', category_id: 'cat-7', is_recurring: false, is_confirmed: true, source: 'auto' },
    { id: 't-12', date: '2026-02-14', amount: 120, type: 'expense', description: 'Cena San Valentín', category_id: 'cat-5', is_recurring: false, is_confirmed: true, source: 'manual' },
    { id: 't-13', date: '2026-02-10', amount: 11.99, type: 'expense', description: 'Disney+', category_id: 'cat-4', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-14', date: '2026-02-01', amount: 850, type: 'expense', description: 'Alquiler Febrero', category_id: 'cat-2', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-15', date: '2026-02-05', amount: 200, type: 'income', description: 'Freelance diseño', category_id: 'cat-6', is_recurring: false, is_confirmed: true, source: 'manual' },

    // January 2026
    { id: 't-16', date: '2026-01-31', amount: 2400, type: 'income', description: 'Nómina Enero', category_id: 'cat-6', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-17', date: '2026-01-20', amount: 89, type: 'expense', description: 'Ropa Zara', category_id: 'cat-5', is_recurring: false, is_confirmed: true, source: 'auto' },
    { id: 't-18', date: '2026-01-15', amount: 49, type: 'expense', description: 'Seguro médico', category_id: 'cat-7', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
    { id: 't-19', date: '2026-01-10', amount: 320, type: 'expense', description: 'Revisión coche', category_id: 'cat-3', is_recurring: false, is_confirmed: true, source: 'auto' },
    { id: 't-20', date: '2026-01-01', amount: 850, type: 'expense', description: 'Alquiler Enero', category_id: 'cat-2', is_recurring: true, recurrence_days: 30, is_confirmed: true, source: 'manual' },
];

// ============================================================
// MOCK RECURRING TEMPLATES
// ============================================================
export const MOCK_RECURRING_TEMPLATES: RecurringTemplate[] = [
    { id: 'rt-1', description: 'Alquiler', estimated_amount: 850, recurrence_days: 30, last_date: '2026-03-01', next_date: '2026-04-01', category_id: 'cat-2' },
    { id: 'rt-2', description: 'Netflix', estimated_amount: 14.99, recurrence_days: 30, last_date: '2026-03-04', next_date: '2026-04-04', category_id: 'cat-4' },
    { id: 'rt-3', description: 'Seguro médico', estimated_amount: 49, recurrence_days: 30, last_date: '2026-02-15', next_date: '2026-03-15', category_id: 'cat-7' },
];

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
