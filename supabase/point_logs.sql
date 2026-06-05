-- ==========================================
-- ポイント履歴テーブル
-- Supabase SQL Editor で実行してください
-- ==========================================

CREATE TABLE IF NOT EXISTS point_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_logs_user_id ON point_logs(user_id, created_at DESC);

ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'point_logs' AND policyname = 'point_logs_select') THEN
    CREATE POLICY "point_logs_select" ON point_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'point_logs' AND policyname = 'point_logs_insert') THEN
    CREATE POLICY "point_logs_insert" ON point_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;
