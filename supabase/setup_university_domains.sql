-- universitiesテーブルにdomainカラムを追加
ALTER TABLE universities ADD COLUMN IF NOT EXISTS domain text;

-- ① 既存の大学レコードにドメインを設定（名前で照合）
UPDATE universities SET domain = 'kwansei.ac.jp'        WHERE name = '関西学院大学';
UPDATE universities SET domain = 'kansai-u.ac.jp'       WHERE name = '関西大学';
UPDATE universities SET domain = 'mail.doshisha.ac.jp'  WHERE name = '同志社大学';
UPDATE universities SET domain = 're.ritsumei.ac.jp'    WHERE name = '立命館大学';
UPDATE universities SET domain = 'stu.kobe-u.ac.jp'     WHERE name = '神戸大学';

-- ② 存在しない大学だけ追加（ON CONFLICT は name にユニーク制約がある場合のみ。なければ INSERT ではなく存在確認）
INSERT INTO universities (name, domain)
SELECT '関西学院大学', 'kwansei.ac.jp'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = '関西学院大学');

INSERT INTO universities (name, domain)
SELECT '関西大学', 'kansai-u.ac.jp'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = '関西大学');

INSERT INTO universities (name, domain)
SELECT '同志社大学', 'mail.doshisha.ac.jp'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = '同志社大学');

INSERT INTO universities (name, domain)
SELECT '立命館大学', 're.ritsumei.ac.jp'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = '立命館大学');

INSERT INTO universities (name, domain)
SELECT '神戸大学', 'stu.kobe-u.ac.jp'
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = '神戸大学');

-- ③ university_domainsテーブル（複数ドメイン対応）
CREATE TABLE IF NOT EXISTS university_domains (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  university_id uuid REFERENCES universities(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL UNIQUE
);

ALTER TABLE university_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view university_domains" ON university_domains;
CREATE POLICY "Anyone can view university_domains" ON university_domains FOR SELECT USING (true);

-- ④ 各大学のドメインをuniversity_domainsに登録（重複スキップ）
INSERT INTO university_domains (university_id, domain)
SELECT id, domain FROM universities
WHERE domain IS NOT NULL
ON CONFLICT (domain) DO NOTHING;

-- ⑤ 関西大学の追加ドメイン（ml.kandai.jp）
INSERT INTO university_domains (university_id, domain)
SELECT id, 'ml.kandai.jp' FROM universities WHERE name = '関西大学'
ON CONFLICT (domain) DO NOTHING;
