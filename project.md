# 1. 概要

## 1.1 プロダクト概要

• 単発（1 回の支出）の割り勘を、重み（傾斜）で計算し、幹事が各参加者へ LINE で個別送信できる Web サービス。

## 1.2 想定ユーザー

• 幹事：入力・計算・送信を行う
• 参加者：LINE で金額通知を受け取る

## 1.3 主要ユースケース

1. 幹事が合計金額、参加者、重み、通知メッセージを入力する
2. サービスが各参加者の負担額を計算し表示する
3. 幹事が参加者ごとに LINE 送信画面を開き、個別送信する
4. 必要に応じて計算方法の説明リンクを通知に添付する

⸻

# 2. 機能要件（確定）

## 2.1 セッション作成・編集

• タイトル（任意）
• 合計金額（必須、整数円）
• 参加者の追加・編集・削除（任意人数）
• 名前（必須）
• 重み（必須、整数、最小 1、デフォルト 1）
• 通知メッセージ（全員共通）の設定・編集（任意）
• 置換変数：{name} {amount} {title} {total}
• attach_details_link（詳細リンクを付けるか：boolean）の設定・編集

## 2.2 計算

• 重み方式で各参加者の負担額を算出する
• 端数処理により、各参加者の負担額合計が合計金額と一致すること
• 切り捨て後、余りを小数部が大きい順に +1 円配布する
• 計算結果（各参加者の負担額）を表示する

## 2.3 LINE での個別送信

• 参加者ごとに「LINE で送る」ボタンを提供する
• ボタン押下で、本文が埋め込まれた LINE 送信画面を開く（宛先選択は手動）
• 送信本文は以下で構成する
• 通知メッセージ（置換後）
• その人の金額行（必須）
• attach_details_link=true の場合のみ、計算方法の説明リンク

## 2.4 計算方法の説明ページ

• 計算方法の説明ページを提供する（詳細リンクの遷移先）

⸻

# 3. 画面（ルーティング）

• /：ランディング
• /new：新規作成
• /e/:editId：編集・計算・送信（統合画面）
• /how：計算方法の説明

⸻

# 4. API

• POST /api/sessions → { editId }
• GET /api/sessions/:editId
• PATCH /api/sessions/:editId
• DELETE /api/sessions/:editId
• GET /api/health（任意）

⸻

# 5. DB スキーマ

## 5.1 sessions

• id
• edit_id（unique）
• title
• total_amount
• message_template
• attach_details_link
• created_at
• updated_at

## 5.2 session_participants

• id
• session_id（FK）
• name
• weight
• share_amount
• created_at
• updated_at

⸻

# 6. 技術スタック

## 6.1 ソース管理 / 構成

• GitHub モノレポ + Turborepo

## 6.2 フロント

• React + Vite
• TanStack Router
• TanStack Query
• Tailwind CSS + shadcn/ui
• zod

## 6.3 バックエンド

• Node.js + TypeScript
• Hono
• zod
• OpenAPI
• Swagger UI

## 6.4 DB

• Neon（PostgreSQL）
• Drizzle（マイグレーション含む）
• Drizzle ドライバ：postgres.js
• Neon 接続：API ＝ Pooled、バッチ/マイグレーション＝ Direct

## 6.5 デプロイ

• Cloudflare Pages（フロント）
• Google Cloud Run（API）
