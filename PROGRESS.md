# SpeakFlow — 実装進捗

## 概要
英語学習アプリ「SpeakFlow」の実装完了状況。

**GitHub:** https://github.com/furuSchool/english-learning-app  
**本番URL:** https://app-nine-dusky-43.vercel.app

---

## ✅ 動作確認済み項目

| 項目 | 状態 |
|---|---|
| `npm run build` | ✅ 成功（compile mode） |
| Vercel本番デプロイ | ✅ 完了 |
| Google OAuth (Supabase) | ✅ 動作確認済み |
| アクセス制限 (`ALLOWED_EMAILS`) | ✅ furufuru429@gmail.com のみ |
| TypeScript型チェック | ✅ エラーなし |

## 最新バグ修正（2026-07-26）

| バグ | 修正内容 |
|---|---|
| 完了タスクがDB削除されない | `/api/complete-task` が `task_completions` へのINSERTのみ行い `tasks` からDELETEしていなかった。サービスロールクライアントで削除するよう修正（`tasks`はSELECTのみRLS許可のため） |
| Interactiveの添削が文脈無視 | ChatInterfaceの`per_turn_correction`が会話の前後関係を渡さずGeminiに送っていた。直前のAI発言とタスクの設定をプロンプトに含めるよう修正 |
| セッション構成がInteractive×2固定 | `SessionTaskSet`を要件定義書§2.1準拠の`{warmup, input, interactive, expression, output}`（各1つ）に変更 |
| タスク生成が全滅していた | `buildGeneratePrompt`内で未定義の`videoSpec`変数を参照しており、呼び出すたびに`ReferenceError`で失敗していた（発見・修正） |
| Rapid-Fire Q&A 5問→3問 | 生成プロンプトの質問数を変更 |
| Expression課題を2問以内に | Phrase Activation・Collocation Builderの生成個数を3→2に変更 |
| プロンプト全文書き出し | `PROMPTS.md`に全プロンプトテンプレートの全文と使用場面を記載（手動編集の参照用。実体は`src/lib/prompts.ts`） |
| Vercelデプロイが失敗する | `src/app/favicon.ico`がNext.jsの暗黙metadataルートを生成し、`--experimental-build-mode compile`下でVercelの`onBuildComplete`が`ENOTDIR`で落ちていた。`public/favicon.ico`へ移動して回避 |

## タスク生成・プロンプト刷新（2026-08-02）

- タスク生成をバッチ一括（4バッチで42問）から1タスク＝1Gemini呼び出しの逐次生成に変更。5カテゴリ（Warmup/Input/Interactive/Expression/Output）からランダムに2つを選び1問ずつ生成、を10回繰り返す（AI 20問＋動画3問＝計23問）
- トピック多様性をプロンプト内の指示文からコード側のconst配列（`TOPIC_POOL`等、`src/lib/prompts.ts`）でのランダム選択に変更
- 学習者プロファイルを`LEARNER_PROFILE`定数に統一、添削基準を`CORE_FEEDBACK_PRINCIPLE`として明文化。詳細は`/workspace/PROGRESS.md`参照

---

## 実装済み機能

### タスクエンジン（17種類）

| # | タイプ | カテゴリ | モード | 説明 |
|---|---|---|---|---|
| 1 | Rapid-Fire Q&A | Warmup | 🎤 | 3問の即答Q&A |
| 2 | Shadowing Drill | Warmup | 🎤 | ネイティブのセリフを音読→自分の言葉でパラフレーズ |
| 3 | Video Listening | Input | 🎤 | YouTube動画（TED/tech talks等）視聴→意見 |
| 4 | Tech News React | Input | 🎤 | HackerNews最新記事をGeminiが要約→英語で意見 |
| 5 | Podcast Listening | Input | 🎤 | BBC Global News Podcast（生音声）→質問に回答 |
| 6 | Quote Reaction | Input | 🎤/✍️ | 著名人の引用→同意/反対の理由を述べる |
| 7 | AI Conversation | Interactive | 🎤/✍️ | LLMがキャラクターを演じ自然な会話（3往復以上） |
| 8 | Devil's Advocate | Interactive | 🎤/✍️ | 何を言っても反論されるディベート練習 |
| 9 | Information Gap | Interactive | ✍️ | LLMが秘密の情報を持ち、質問で解明する |
| 10 | News Discussion | Interactive | 🎤/✍️ | HackerNewsの記事についてLLMと議論 |
| 11 | Phrase Activation | Expression | 🎤/✍️ | 日本人が使わない頻出フレーズを自分の文で使う |
| 12 | Collocation Builder | Expression | ✍️ | 動詞+名詞の自然な組み合わせ練習 |
| 13 | Natural Expression | Expression | 🎤/✍️ | 直訳すると不自然な日本語→自然な英語へ |
| 14 | Discourse Marker Drill | Expression | 🎤 | "That said" 等の接続表現を使いながら60秒話す |
| 15 | Social Formula | Expression | 🎤/✍️ | 丁寧な割り込み・反論の和らげ方等の実用フレーズ |
| 16 | Impromptu Speak | Output | 🎤 | ランダムトピックで60〜90秒止まらず話す |
| 17 | Situation Survival | Output | 🎤/✍️ | 日常シチュエーションを英語で乗り切るLLM対話 |

### セッションフロー
- `/dashboard` = ホーム画面（統計・ヒートマップ・タスク残数・生成ボタン）
- `/session` = アクティブセッション（5タスク順番に実施）
  - 構成: Warmup × 1 + Input × 1 + Interactive × 1 + Expression × 1 + Output × 1（各カテゴリ1つずつ）

### タスク自動生成
- ダッシュボードの「タスクを生成する」ボタンを押すとGeminiが42問を一括生成
- 14種類 × 3問のセットをSupabaseに保存
- プロンプトはユーザープロファイル（東大院生、コミュニケーション重視、多様なトピック）を考慮

### ライブコンテンツ
- **Tech News React / News Discussion**: HackerNews API → Jina reader でテキスト取得 → Gemini が3段落に要約
- **Podcast Listening**: BBC Global News Podcast RSS から最新エポックのmp3 URLを取得 → `<audio>` タグで再生

### Learned Phrases（改訂）
- 添削不要。有用なフレーズ・表現のみ保存
- コンパクトカード一覧。クリックで日本語メモ展開。タスク別グルーピング

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

| 変数名 | 取得先 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `ALLOWED_EMAILS` | アクセスを許可するGmailアドレス（カンマ区切り） |

### 3. Supabase スキーマ適用
`supabase/migration.sql` を Supabase SQL Editor で実行（既存テーブルをdropして再作成）

### 4. Supabase 認証設定
- **Authentication > Providers > Google** を有効化（Google Cloud ConsoleでOAuthクライアントを作成）
- **Authentication > URL Configuration** に本番URLを追加:
  - Site URL: `https://app-nine-dusky-43.vercel.app`
  - Redirect URL: `https://app-nine-dusky-43.vercel.app/auth/callback`

### 5. Vercel 環境変数
Vercel Dashboard > Settings > Environment Variables に上記5つを設定

### 6. タスク生成（初回）
ログイン後、ダッシュボードの「タスクを生成する」ボタンを押す（30秒ほどかかる）

---

## ビルドに関する技術的注意

### Next.js 16 + Node.js 26 の互換性問題
**回避策:** `package.json` の build スクリプト:
```json
"build": "next build --experimental-build-mode compile"
```
全ルートがSSRとして動作。静的HTMLは生成されないが機能は正常。

### Next.js 16 breaking change
- `middleware.ts` → `proxy.ts`（ファイル名変更）
- `export function middleware` → `export function proxy`（関数名変更）

---

## ページ構成

| パス | 説明 | 保護 |
|---|---|---|
| `/` | ログインページ（Google OAuth） | 公開 |
| `/dashboard` | ホーム（統計・ヒートマップ・タスク生成） | 要認証 |
| `/session` | アクティブセッション（5タスク） | 要認証 |
| `/stock` | 保存フレーズ一覧 | 要認証 |
| `/api/generate-tasks` | Geminiでタスク一括生成（POST） | - |
| `/api/chat` | インタラクティブLLM対話（POST） | - |
| `/api/fetch-news` | HackerNews記事取得+要約（GET） | - |
| `/api/fetch-podcast` | BBC Podcast RSS取得（GET） | - |
| `/api/feedback` | 添削フィードバック（POST） | - |
| `/api/save-phrase` | フレーズ保存（POST） | - |
| `/api/complete-task` | タスク完了記録（POST） | - |
| `/auth/callback` | Google OAuthコールバック | 公開 |

## データベーススキーマ

| テーブル | 用途 |
|---|---|
| `tasks` | タスクプール（Gemini生成、17種類） |
| `task_completions` | タスク完了ログ |
| `learned_expressions` | 保存フレーズ（phrase + meaning_ja のみ） |
| `activity_logs` | ヒートマップ用アクティビティログ |
