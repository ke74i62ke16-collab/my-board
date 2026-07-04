# PokéBoard — ポケモンカード投資・コレクター掲示板

ポケモンカードの投資・コレクション情報を共有するための匿名掲示板。

---

## サイト概要

- 匿名投稿型の掲示板（2ちゃんねる/5ちゃんねる風）
- カテゴリ別スレッド・レス投稿
- 画像プレビュー（Gyazo / Imgur）対応
- いいね機能、アンカー返信（>>N）、ホバーツールチップ
- 管理画面付き（スレッド・投稿管理、NGワード、削除依頼対応）

---

## 技術構成

| 項目 | 技術 |
|---|---|
| フレームワーク | Next.js 16.2.9 (App Router, Turbopack) |
| スタイリング | Tailwind CSS v4 |
| データベース | Supabase (PostgreSQL + PostgREST) |
| 言語 | TypeScript |
| ホスティング予定 | Vercel |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (site)/                      # 一般ユーザー向けページ（SiteHeader/Footer付き）
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # トップページ（スレッド一覧）
│   │   ├── threads/[id]/page.tsx    # スレッド詳細
│   │   └── feedback/page.tsx        # ご意見・削除依頼フォーム
│   ├── mgmt-p8x2k/                  # 管理画面（独立レイアウト）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx                   # ルートレイアウト（html/body のみ）
│   └── globals.css
├── components/
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── CategoryNav.tsx
│   ├── Breadcrumb.tsx
│   ├── PostListWithReply.tsx        # スレッド詳細の投稿一覧＋返信フォーム
│   ├── FeedbackForm.tsx             # お問い合わせフォーム（Client Component）
│   ├── AdminPanel.tsx               # 管理画面UI（Client Component）
│   └── DeleteButton.tsx
└── lib/
    ├── supabase.ts
    ├── store.ts                     # DB操作（Supabase）
    ├── actions.ts                   # Server Actions
    ├── types.ts
    ├── categories.ts
    └── rateLimit.ts                 # インメモリレート制限
```

---

## 完成済み機能

### ユーザー向け
- [x] カテゴリ別スレッド一覧（ページネーション付き）
- [x] カテゴリナビゲーション（全ページ共通）
- [x] スレッド作成フォーム（タイトル・本文・著者名・カテゴリ選択）
- [x] スレッド詳細ページ（投稿一覧、アンカー >>N）
- [x] >>N ホバーツールチップ（ネストツールチップ対応）
- [x] 返信フォーム（インライン返信 / 末尾フォーム）
- [x] いいね機能（スレッド・投稿）
- [x] 画像プレビュー（Gyazo・Imgur URL → サムネイル → モーダル拡大）
- [x] 外部リンク警告モーダル（Gyazo・Imgur以外のURL）
- [x] スレッド満杯判定（100レスで書き込み終了）
- [x] パンくずリスト
- [x] カテゴリバッジ → トップページのカテゴリフィルターリンク
- [x] ご意見・削除依頼フォーム（お問い合わせ種別選択付き）

### 管理者向け（/mgmt-p8x2k）
- [x] パスワード認証（Cookie ベース、`ADMIN_PASSWORD` 環境変数）
- [x] WP風2カラムレイアウト（独立レイアウト、SiteHeader/Footer非表示）
- [x] ダッシュボード（総スレッド数・総投稿数・本日の投稿数）
- [x] スレッド一覧・削除（スレッドページへのリンク付き）
- [x] 投稿一覧・ソフトデリート（投稿番号・スレッドへのリンク・削除済みバッジ）
- [x] ソフトデリート（`is_deleted=true` に更新、本文を「この投稿は削除されました。」に差し替え）
- [x] NGワード管理（追加・削除）
- [x] ご意見・削除依頼一覧（削除依頼は対象スレッド・番号・理由を表示）

### セキュリティ・品質
- [x] レート制限（同一IP・60秒以内5回投稿でブロック）
- [x] NGワードフィルター（投稿・スレッド作成時にチェック）
- [x] Supabase RLS（アノン用のSELECT/INSERT/UPDATE）

---

## 残タスク

- [ ] Vercelへのデプロイ
- [ ] 本番環境の環境変数設定（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`）
- [ ] OGP / メタタグの設定
- [ ] スレッド検索機能
- [ ] 投稿のソフトデリート「復元」機能（管理画面）
- [ ] 管理画面の削除依頼への対応ステータス管理
- [ ] レート制限のRedis移行（Vercelのサーバーレス環境対応）
- [ ] ページキャッシュ最適化（`revalidate` 設定）

---

## Supabaseで実行済みのSQL

### テーブル作成・列追加

```sql
-- 1. threadsテーブルにauthor列を追加
ALTER TABLE threads ADD COLUMN IF NOT EXISTS author text NOT NULL DEFAULT '名無しさん';

-- 2. NGワードテーブルを作成
CREATE TABLE IF NOT EXISTS ng_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. postsテーブルにソフトデリート列を追加
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- 4. feedbacksテーブルにお問い合わせ種別・削除依頼列を追加
ALTER TABLE feedbacks
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS target_url text,
  ADD COLUMN IF NOT EXISTS post_number text,
  ADD COLUMN IF NOT EXISTS delete_reason text;
```

### RLS（Row Level Security）ポリシー

```sql
-- threads
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_select" ON threads FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON threads FOR INSERT WITH CHECK (true);

-- posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_select" ON posts FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON posts FOR UPDATE USING (true);

-- feedbacks
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert" ON feedbacks FOR INSERT WITH CHECK (true);

-- ng_words
ALTER TABLE ng_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_select" ON ng_words FOR SELECT USING (true);
```

---

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
ADMIN_PASSWORD=your_password_here
```

---

## 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) — 一般ユーザー向けトップページ
[http://localhost:3000/mgmt-p8x2k](http://localhost:3000/mgmt-p8x2k) — 管理画面
