import { Transaction, Category, Settings } from './types';
import {
    MOCK_TRANSACTIONS,
    MOCK_CATEGORIES,
    MOCK_SETTINGS,
    MOCK_RECURRING_TEMPLATES,
} from './mock-data';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// ============================================================
// TRANSACTIONS
// ============================================================
export async function getTransactions(): Promise<Transaction[]> {
    if (USE_MOCK) return MOCK_TRANSACTIONS;
    // TODO: Replace with Supabase query
    // const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    return MOCK_TRANSACTIONS;
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    if (USE_MOCK) {
        const newTx = { ...tx, id: `t-${Date.now()}` };
        MOCK_TRANSACTIONS.unshift(newTx);
        return newTx;
    }
    // TODO: Supabase insert
    throw new Error('Supabase not configured');
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    if (USE_MOCK) {
        const idx = MOCK_TRANSACTIONS.findIndex((t) => t.id === id);
        if (idx !== -1) Object.assign(MOCK_TRANSACTIONS[idx], updates);
        return;
    }
    // TODO: Supabase update
}

export async function deleteTransaction(id: string): Promise<void> {
    if (USE_MOCK) {
        const idx = MOCK_TRANSACTIONS.findIndex((t) => t.id === id);
        if (idx !== -1) MOCK_TRANSACTIONS.splice(idx, 1);
        return;
    }
    // TODO: Supabase delete
}

// ============================================================
// CATEGORIES
// ============================================================
export async function getCategories(): Promise<Category[]> {
    if (USE_MOCK) return MOCK_CATEGORIES;
    // TODO: Supabase query
    return MOCK_CATEGORIES;
}

// ============================================================
// SETTINGS
// ============================================================
export async function getSettings(): Promise<Settings> {
    if (USE_MOCK) return MOCK_SETTINGS;
    // TODO: Supabase query
    return MOCK_SETTINGS;
}

export async function updateSettings(updates: Partial<Settings>): Promise<void> {
    if (USE_MOCK) {
        Object.assign(MOCK_SETTINGS, updates);
        return;
    }
    // TODO: Supabase update
}

// ============================================================
// RECURRING TEMPLATES
// ============================================================
export async function getRecurringTemplates() {
    if (USE_MOCK) return MOCK_RECURRING_TEMPLATES;
    return MOCK_RECURRING_TEMPLATES;
}
