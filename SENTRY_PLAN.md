# Sentry導入方針

このドキュメントは、`apps/api` と `apps/web` に Sentry を同時導入するための実装方針をまとめたものです。

## 対象

- `apps/api`
  - Hono + Node.js
  - Cloud Run へデプロイ
- `apps/web`
  - React + Vite
  - Firebase Hosting へデプロイ

## 確定事項

- Sentry Project は `api` と `web` で分ける
- `environment` は `production` / `preview` / `local` を使う
- `release` は Git SHA で統一する
- `api` と `web` は同じ release 値を使う
- API の例外処理は app 全体の共通 error handler を基本にする
- Sentry の機密値は既存の GitHub Secrets / Variables 運用に合わせる
- `web` の source map は CI で upload し、公開配信物には `.map` を残さない
- tracing の sample rate は `production=0.5`, `preview=1.0`, `local=0` とする
- `local` は environment 名として残し、DSN 未設定時は送信しない
- 送信禁止データはレッドリスト方式で管理する
- `api` の runtime secret は GCP Secret Manager で管理する
- `web` の build 時に使う値は GitHub Secrets / Variables から注入する
- `SENTRY_AUTH_TOKEN` は GitHub Secrets で管理する

## 実装方針

### API

- `@sentry/node` を導入する
- `apps/api/src/instrument.ts` に Sentry 初期化コードを配置する
- `node --import ./instrument.js` で起動し、全モジュールより先に Sentry を初期化する
  - `@sentry/node` v8 は内部で monkey-patch するため、ESM 環境では `--import` による事前読み込みが必須
- `apps/api/src/index.ts` で Hono の `onError` に共通 error handler を設定する
- 既存の `try/catch` では、レスポンス返却前に `captureException` を呼ぶ
- 未捕捉例外と unhandled rejection を送信する
- request 情報をイベントに含める
- 起動時 migration の失敗は `captureException` → `Sentry.flush(5000)` → `process.exit(1)` で処理する
  - `flush()` を呼ばないとイベント送信前にプロセスが終了し、Sentry にイベントが届かない
- `DATABASE_URL_*` は送信しない
- request body は機微情報を含む可能性があるため送信対象を制限する
- `environment` を付与する
- `release` を付与する

### Web

- `@sentry/react` と `@sentry/vite-plugin` を導入する
- `apps/web/src/lib/sentry.ts` に Sentry 初期化コードを配置する
- `apps/web/src/main.tsx` の最上位で初期化する
- ルート全体を Error Boundary で包む（フォールバック UI の設計は別途検討）
- 画面上の未捕捉例外を送信する
- unhandled promise rejection を送信する
- API エラーは送信対象を制御する
- `environment` を付与する
- `release` を付与する
- build 時に source map をアップロードする

## 環境変数

### API

- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_RELEASE`
- `SENTRY_TRACES_SAMPLE_RATE`

### Web

- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`
- `VITE_SENTRY_RELEASE`
- `VITE_SENTRY_TRACES_SAMPLE_RATE`

### Build / CI

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT_API`
- `SENTRY_PROJECT_WEB`

## 環境名

- production
- preview
- local

## release

- release は Git SHA を使う
- production は `github.sha` を使う
- preview は `github.event.pull_request.head.sha` を使う
- local は `local` を使う
- デプロイ時に release を環境変数として渡す

## CI/CD変更

### Production Deploy

- build 前に Sentry 用の環境変数をセットする
- `web` build 時に Vite Plugin で source map をアップロードする
- Cloud Run deploy で API 用 Sentry 環境変数を設定する
- Firebase Hosting deploy 前に `web` build の release を固定する

### PR Deploy

- preview 用 release を PR head SHA にする
- preview 用 environment を `preview` にする
- preview build 時にも source map をアップロードする
- preview の Cloud Run deploy でも API 用 Sentry 環境変数を設定する

## 変更対象ファイル

- `apps/api/package.json`
- `apps/api/src/index.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/routes/sessions.ts`
- `apps/api/src/instrument.ts`（新規）
- `apps/web/package.json`
- `apps/web/src/main.tsx`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/sentry.ts`（新規）
- `apps/web/vite.config.ts`
- `.github/workflows/production-deploy.yml`
- `.github/workflows/pr-deploy.yml`

## イベント設計

### APIで送るもの

- 500系エラー
- 未捕捉例外
- unhandled rejection
- 起動失敗
- migration 失敗

### Webで送るもの

- runtime error
- Error Boundary で捕捉した例外
- unhandled rejection
- API 由来の想定外 5xx（level: error）
- 4xx (400 / 401 / 403 / 404 / 422 / 429)（level: info、Alert 通知対象外）

### 送らないもの

- 認証情報
- 接続情報
- ユーザー入力の生データ

## source map

- `web` は Vite Plugin でアップロードする
- upload は CI 上で行う
- release と一致する artifact をアップロードする
- 公開配信物には `.map` を残さない

## tracing

- production は `0.5`
- preview は `1.0`
- local は `0`

## 必要なSentry側設定

- Organization を用意する
- `api` 用 Project を作る
- `web` 用 Project を作る
- Auth Token を発行する
- DSN を取得する

## Secrets / Variables

### GitHub Secrets

- `SENTRY_AUTH_TOKEN`
- `SENTRY_WEB_DSN`

### GitHub Variables

- `SENTRY_ORG`
- `SENTRY_PROJECT_API`
- `SENTRY_PROJECT_WEB`

### GCP Secret Manager

- `SENTRY_API_DSN`

### Runtime / Build Environment

- Cloud Run runtime には `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE` を渡す
- `web` build には `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `VITE_SENTRY_RELEASE`, `VITE_SENTRY_TRACES_SAMPLE_RATE` を渡す

### Secret → 環境変数の対応表

| 保管場所 | Secret / Variable 名 | 渡す先の環境変数名 | 用途 |
|---|---|---|---|
| GCP Secret Manager | `SENTRY_API_DSN` | Cloud Run の `SENTRY_DSN` | API runtime |
| GitHub Secrets | `SENTRY_WEB_DSN` | Vite build の `VITE_SENTRY_DSN` | Web build |
| GitHub Secrets | `SENTRY_AUTH_TOKEN` | CI の `SENTRY_AUTH_TOKEN` | source map upload |
| GitHub Variables | `SENTRY_ORG` | CI の `SENTRY_ORG` | source map upload |
| GitHub Variables | `SENTRY_PROJECT_API` | CI の `SENTRY_PROJECT_API` | API release 紐付け |
| GitHub Variables | `SENTRY_PROJECT_WEB` | CI の `SENTRY_PROJECT_WEB` | Web source map upload |

## 4xx / 5xx の扱い

- 4xx (400 / 401 / 403 / 404 / 422 / 429) は送るが `level: "info"` にする
- Sentry の Alert ルールでは 5xx のみ通知対象にする
- 5xx と runtime error は `level: "error"` として扱う
- どの場合も入力の生データは送らない

## 完了条件

- `api` で例外を発生させると Sentry に event が届く
- `web` で runtime error を発生させると Sentry に event が届く
- `web` の stack trace が source map 付きで読める
- production と preview の event が environment で分かれる
- `api` と `web` が同じ release で紐づく
