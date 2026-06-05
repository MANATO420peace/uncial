-- ==========================================
-- ブロック・ミュート機能
-- Supabase SQL Editor で実行してください
-- ==========================================

-- ブロックテーブル
CREATE TABLE IF NOT EXISTS blocks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocks' AND policyname = 'blocks_select') THEN
    CREATE POLICY "blocks_select" ON blocks FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocks' AND policyname = 'blocks_insert') THEN
    CREATE POLICY "blocks_insert" ON blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocks' AND policyname = 'blocks_delete') THEN
    CREATE POLICY "blocks_delete" ON blocks FOR DELETE USING (auth.uid() = blocker_id);
  END IF;
END $$;

-- ミュートテーブル
CREATE TABLE IF NOT EXISTS mutes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  muter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  muted_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(muter_id, muted_id)
);

CREATE INDEX IF NOT EXISTS idx_mutes_muter ON mutes(muter_id);

ALTER TABLE mutes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mutes' AND policyname = 'mutes_select') THEN
    CREATE POLICY "mutes_select" ON mutes FOR SELECT USING (auth.uid() = muter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mutes' AND policyname = 'mutes_insert') THEN
    CREATE POLICY "mutes_insert" ON mutes FOR INSERT WITH CHECK (auth.uid() = muter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mutes' AND policyname = 'mutes_delete') THEN
    CREATE POLICY "mutes_delete" ON mutes FOR DELETE USING (auth.uid() = muter_id);
  END IF;
END $$;
