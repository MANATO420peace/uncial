-- ==========================================
-- 不足テーブルの追加 & トリガー修正
-- Supabase SQL Editor で実行してください
-- ==========================================

-- ==========================================
-- 1. likes_count トリガーを SECURITY DEFINER に修正
-- （これが「いいね数が0になる」の根本原因）
-- RLS が他ユーザーの投稿更新をブロックするため、
-- SECURITY DEFINER でトリガーを実行してRLSを回避する
-- ==========================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- comments_count も同様に修正
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- ==========================================
-- 2. notifications テーブル（通知が来ない根本原因）
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'follow_request')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_select') THEN
    CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_insert') THEN
    CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update') THEN
    CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==========================================
-- 3. push_subscriptions テーブル（プッシュ通知が届かない原因）
-- ==========================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'push_select') THEN
    CREATE POLICY "push_select" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'push_insert') THEN
    CREATE POLICY "push_insert" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'push_delete') THEN
    CREATE POLICY "push_delete" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_subscriptions' AND policyname = 'push_upsert') THEN
    CREATE POLICY "push_upsert" ON push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==========================================
-- 4. follow_requests テーブル（すでに存在する場合はスキップ）
-- ==========================================
CREATE TABLE IF NOT EXISTS follow_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, target_id)
);

ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follow_requests' AND policyname = 'follow_requests_select') THEN
    CREATE POLICY "follow_requests_select" ON follow_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follow_requests' AND policyname = 'follow_requests_insert') THEN
    CREATE POLICY "follow_requests_insert" ON follow_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follow_requests' AND policyname = 'follow_requests_delete') THEN
    CREATE POLICY "follow_requests_delete" ON follow_requests FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = target_id);
  END IF;
END $$;

-- ==========================================
-- 5. bookmarks テーブル（すでに存在する場合はスキップ）
-- ==========================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'bookmarks_select') THEN
    CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'bookmarks_insert') THEN
    CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookmarks' AND policyname = 'bookmarks_delete') THEN
    CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ==========================================
-- 6. 既存の likes_count を全件正確に再計算（一度だけ実行）
-- ==========================================
UPDATE posts SET likes_count = (
  SELECT COUNT(*) FROM likes WHERE post_id = posts.id
);

-- comments_count も再計算
UPDATE posts SET comments_count = (
  SELECT COUNT(*) FROM comments WHERE post_id = posts.id
);

-- ==========================================
-- 7. users テーブルに不足カラムを追加
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS buy_sell_terms_agreed_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location text;
