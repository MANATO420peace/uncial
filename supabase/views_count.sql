-- 投稿閲覧数カラム追加
-- Supabase SQL Editor で実行してください
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;
