'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, Settings, ChatMessage } from './types';
import { MOCK_TRANSACTIONS, MOCK_CATEGORIES, MOCK_SETTINGS } from './mock-data';

interface AppState {
    // Auth
    isAuthenticated: boolean;
    isPinLocked: boolean;
    setAuthenticated: (v: boolean) => void;
    setPinLocked: (v: boolean) => void;

    // Data
    transactions: Transaction[];
    categories: Category[];
    settings: Settings;
    setTransactions: (t: Transaction[]) => void;
    addTransaction: (t: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    setSettings: (s: Settings) => void;

    // Chat
    chatMessages: ChatMessage[];
    addChatMessage: (m: ChatMessage) => void;
    clearChat: () => void;

    // UI
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Auth — start authenticated in mock mode for preview
            isAuthenticated: true,
            isPinLocked: false,
            setAuthenticated: (v) => set({ isAuthenticated: v }),
            setPinLocked: (v) => set({ isPinLocked: v }),

            // Data
            transactions: MOCK_TRANSACTIONS,
            categories: MOCK_CATEGORIES,
            settings: MOCK_SETTINGS,
            setTransactions: (transactions) => set({ transactions }),
            addTransaction: (t) =>
                set((state) => ({ transactions: [t, ...state.transactions] })),
            updateTransaction: (id, updates) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),
            deleteTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),
            setSettings: (settings) => set({ settings }),

            // Chat
            chatMessages: [
                {
                    id: 'welcome',
                    role: 'assistant',
                    content: '¡Guau! 🐾 Hola, soy Husky, tu asistente financiero. Puedo ayudarte a analizar tus gastos, darte consejos y proyectar tu balance futuro. ¿En qué puedo ayudarte hoy?',
                    timestamp: new Date(),
                },
            ],
            addChatMessage: (m) =>
                set((state) => ({ chatMessages: [...state.chatMessages, m] })),
            clearChat: () => set({ chatMessages: [] }),

            // UI
            activeTab: 'dashboard',
            setActiveTab: (tab) => set({ activeTab: tab }),
        }),
        {
            name: 'fintrack-storage',
            partialize: (state) => ({
                settings: state.settings,
                transactions: state.transactions,
                categories: state.categories,
                chatMessages: state.chatMessages,
            }),
        }
    )
);
