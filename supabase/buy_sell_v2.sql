-- 販売・購入 v2 追加カラム
-- Supabase SQL Editor で実行してください
ALTER TABLE posts ADD COLUMN IF NOT EXISTS item_category text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS price_negotiable boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS delivery_method text;
