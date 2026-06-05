-- ==========================================
-- 販売・購入専用カラム追加
-- Supabase SQL Editor で実行してください
-- ==========================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS price integer;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS item_condition text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sold_at timestamptz;
