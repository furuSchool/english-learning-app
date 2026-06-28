# SpeakFlow — 実装進捗

## 概要
英語学習アプリ「SpeakFlow」の実装完了状況。

**GitHub:** https://github.com/furuSchool/english-learning-app

---

## ✅ 動作確認済み項目

| 項目 | 状態 |
|---|---|
| `npm ci` (フレッシュcloneから) | ✅ 成功 |
| `npm run build` | ✅ 成功（compile mode） |
| `npm run dev` | ✅ 成功（HTTP 200） |
| TypeScript型チェック (`tsc --noEmit`) | ✅ エラーなし |
| ランディングページ（`/`） | ✅ 200 OK |
| 認証保護ルート（`/dashboard`, `/stock`） | ✅ 307リダイレクト（未ログイン時） |
| Gemini API フィードバック（`/api/feedback`） | ✅ 動作確認済み |
| Supabase 接続 | ⚠️ スキーマ未適用（下記手順を参照） |

---

## 実装完了機能

### タスクエンジン（全8種類）
| タスクタイプ | カテゴリ | 説明 |
|---|---|---|
| Rapid-Fire Q&A | ウォーミングアップ | 3〜5問の即答スピーキング |
| Taboo Paraphrase | ウォーミングアップ | NGワードなしで英単語を説明 |
| TED Listening | インプット | YouTube動画視聴 + 3文要約 |
| News Headline | インプット | 見出し3つから1つ選んでリアクション |
| Visual Impression | アウトプット | 画像を見て感想を英語で語る |
| Situation Survival | アウトプット | 日常シチュエーションへの英語対応 |
| Emotion Sharing | アウトプット | テーマに沿って感情・意見を語る |
| Pattern Practice | アウトプット | 直訳しにくい日本語表現を英語で |

### その他機能
- **Web Speech API** — リアルタイム音声認識（非対応ブラウザはテキスト入力フォールバック）
- **Gemini 2.5 Flash フィードバック** — インライン添削・エラー解説・ネイティブ表現提案
- **表現ストック** — フィードバック内容を自動保存、`/stock` ページで閲覧・削除
- **アクティビティヒートマップ** — GitHub風の草生やし（20週分）
- **タスク即時切り替え** — 予備タスク8件をキャッシュ、通信ゼロで変更
- **Google OAuth** — Supabase Auth 経由

---

## セットアップ手順（ゼロからの構築）

### 1. リポジトリのクローンとインストール
```bash
git clone https://github.com/furuSchool/english-learning-app.git
cd english-learning-app
npm ci
```

### 2. 環境変数の設定
```bash
cp .env.local.example .env.local
```

`.env.local` を編集して以下を設定：

| 変数名 | 取得先 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API > service_role |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `UNSPLASH_ACCESS_KEY` | https://unsplash.com/developers（任意） |

> **注意:** `NEXT_PUBLIC_SUPABASE_URL` は `/rest/v1/` を除いたベースURLのみ設定してください。  
> 例: `https://xxxxxx.supabase.co`

### 3. Supabase のスキーマ適用
1. [Supabase ダッシュボード](https://supabase.com/dashboard) を開く
2. 対象プロジェクトの **SQL Editor** に移動
3. `supabase/schema.sql` の内容をコピーして実行（テーブル作成 + シードデータ）
4. `supabase/functions.sql` の内容をコピーして実行（RPC関数）
5. **Authentication > Providers > Google** を有効化
6. **Authentication > URL Configuration > Redirect URLs** に `http://localhost:3000/auth/callback` を追加

### 4. ローカル開発
```bash
npm run dev
# http://localhost:3000
```

### 5. ビルド
```bash
npm run build   # 成功（全ルートSSR、compile mode）
npm run start
```

---

## ビルドに関する技術的注意

### Next.js 16 + Node.js 26 の互換性問題
**症状:** `next build`（デフォルト）の `generate` フェーズで以下のエラーが発生：
```
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
```

**原因:** Next.js 16.2.9 が静的生成（prerender）しようとする内部ページ（`/_global-error`, `/_not-found`）において、React context が null になる。Node.js 26 との互換性問題。フレッシュな `create-next-app` プロジェクトでも同様に失敗することを確認。

**解決策:** `package.json` の `build` スクリプトを以下に変更済み：
```json
"build": "next build --experimental-build-mode compile"
```

**影響:** 全ルートがSSR（サーバーサイドレンダリング）として動作。静的HTMLは生成されないが、アプリの全機能は正常に動作する。

---

## ページ構成

| パス | 説明 | 保護 |
|---|---|---|
| `/` | ログインページ（Google OAuth） | 公開 |
| `/dashboard` | メインページ（今日のタスク3種 + ヒートマップ） | 要認証 |
| `/stock` | 学んだ表現ストック一覧 | 要認証 |
| `/api/feedback` | Gemini AIによる添削（POST） | - |
| `/api/complete-task` | タスク完了記録（POST） | - |
| `/auth/callback` | Google OAuthコールバック | 公開 |

## データベーススキーマ

| テーブル | 用途 |
|---|---|
| `tasks` | タスクプール（マスターデータ36件 + バッチ生成用） |
| `task_completions` | タスク完了ログ（ユーザーごとRLS） |
| `learned_expressions` | 学んだ表現ストック（ユーザーごとRLS） |
| `activity_logs` | ヒートマップ用アクティビティログ（ユーザーごとRLS） |

## 今後の拡張候補
- バッチタスク生成（News API → Supabase への自動蓄積）
- Whisper API による高精度音声認識
- ストリーミングフィードバック
- 学習統計ページ
