-- notifications テーブルの type 制約に comment_like と comment_reply を追加
-- Supabase SQL Editor で実行してください

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('like', 'comment', 'comment_like', 'comment_reply', 'follow', 'follow_request'));
