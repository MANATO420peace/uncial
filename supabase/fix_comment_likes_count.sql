-- コメントのlikes_countを comment_likes テーブルの実際のカウントに合わせて修正
-- Supabase SQL Editor で実行してください

UPDATE comments c
SET likes_count = (
  SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id
);

-- 今後のために comment_likes_count トリガーを SECURITY DEFINER に変更
-- (adminクライアントでの更新でカバーしているので必須ではないが念のため)
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;
