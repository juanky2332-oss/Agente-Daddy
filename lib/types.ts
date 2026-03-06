// ============================================================
// FinTrack Husky — TypeScript Types
// ============================================================

export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'manual' | 'auto';

export interface User {
  id: string;
  email: string;
  telegram_id?: string;
  google_calendar_id?: string;
}

export interface Category {
  id: string;
  name: string;
  is_custom: boolean;
  icon_name: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  amount: number; // always > 0, in EUR
  type: TransactionType;
  description: string;
  category_id: string;
  is_recurring: boolean;
  recurrence_days?: number;
  next_alert_date?: string;
  is_confirmed: boolean;
  source: TransactionSource;
  receipt_url?: string;
}

export interface RecurringTemplate {
  id: string;
  description: string;
  estimated_amount: number;
  recurrence_days: number;
  last_date: string;
  next_date: string;
  category_id: string;
}

export interface Settings {
  user_id: string;
  notification_days_advance: number; // default: 3
  language: string; // default: 'es'
  openai_api_key?: string;
  telegram_bot_token?: string;
  pin_hash?: string;
  totp_secret?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIExtractedTransaction {
  amount: number;
  date: string;
  type: TransactionType;
  description: string;
  category_id: string;
  likely_recurring: boolean;
  confidence: number; // 0-1
}
