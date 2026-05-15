# ユニキャン セットアップガイド

## 1. Supabase プロジェクト作成

1. https://supabase.com にアクセスしてプロジェクトを作成
2. 「SQL Editor」を開き `supabase/schema.sql` の内容を全て実行
3. 「Authentication > Providers」で Google を有効化（任意）

## 2. 環境変数の設定

`.env.local` を編集:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
```

Supabase ダッシュボード「Settings > API」で確認できます。

## 3. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## 4. Vercel デプロイ

```bash
npx vercel
```

または GitHub にプッシュして Vercel で自動デプロイ。

Vercel の環境変数に以下を追加:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Google 認証のセットアップ（任意）

1. Google Cloud Console でプロジェクト作成
2. OAuth 2.0 クライアント ID を発行
3. リダイレクト URI: `https://xxxxxxxx.supabase.co/auth/v1/callback`
4. Supabase の Google Provider に設定

## ルーティング一覧

| パス | 説明 |
|------|------|
| `/login` | ログインページ |
| `/register` | 新規登録 |
| `/home` | タイムライン（メイン） |
| `/post/[id]` | 投稿詳細 + コメント |
| `/reviews` | 楽単レビュー一覧 |
| `/search` | 検索 |
| `/profile` | マイプロフィール |
| `/settings` | 設定 |
