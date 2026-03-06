-- ============================================================
-- FinTrack Husky — Supabase Schema
-- Run this in Supabase SQL Editor to create the database.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  is_custom   BOOLEAN NOT NULL DEFAULT true,
  icon_name   TEXT NOT NULL DEFAULT 'DollarSign',
  color       TEXT NOT NULL DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed predefined categories for new users via trigger (optional)
-- Or insert manually for your user_id.

-- ─────────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type              TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description       TEXT NOT NULL DEFAULT '',
  category_id       UUID REFERENCES public.categories(id),
  is_recurring      BOOLEAN NOT NULL DEFAULT false,
  recurrence_days   INTEGER,
  next_alert_date   DATE,
  is_confirmed      BOOLEAN NOT NULL DEFAULT true,
  source            TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- RECURRING TEMPLATES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recurring_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description       TEXT NOT NULL,
  estimated_amount  NUMERIC(12,2) NOT NULL,
  recurrence_days   INTEGER NOT NULL,
  category_id       UUID REFERENCES public.categories(id),
  last_date         DATE,
  next_date         DATE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SETTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  user_id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_days_advance  INTEGER NOT NULL DEFAULT 3,
  language                   TEXT NOT NULL DEFAULT 'es',
  openai_api_key             TEXT DEFAULT '',
  telegram_bot_token         TEXT DEFAULT '',
  telegram_chat_id           TEXT DEFAULT '',
  google_calendar_id         TEXT DEFAULT '',
  pin_hash                   TEXT DEFAULT '',
  totp_secret                TEXT DEFAULT '',
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings          ENABLE ROW LEVEL SECURITY;

-- Categories: user sees own + predefined (is_custom = false, user_id = null)
CREATE POLICY "categories_select" ON public.categories FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "categories_delete" ON public.categories FOR DELETE
  USING (user_id = auth.uid());

-- Transactions: user sees own
CREATE POLICY "transactions_all" ON public.transactions
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Recurring Templates: user sees own
CREATE POLICY "recurring_all" ON public.recurring_templates
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Settings: user sees own
CREATE POLICY "settings_all" ON public.settings
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_is_confirmed ON public.transactions(user_id, is_confirmed);
CREATE INDEX IF NOT EXISTS idx_recurring_next_date ON public.recurring_templates(user_id, next_date);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
