# Hododasu

割り勘計算Webサービス

## プロジェクト構成

このプロジェクトはTurborepoを使用したモノレポ構成です。

```
hododasu/
├── apps/
│   ├── web/      # React + Vite フロントエンド
│   └── api/      # Hono バックエンド
├── packages/
│   └── shared/   # 共通zodスキーマ
└── package.json  # ルート設定
```

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

#### Webアプリケーション
```bash
cp apps/web/env.example apps/web/.env.local
```

#### API
```bash
cp apps/api/env.example apps/api/.env.local
```

必要に応じて環境変数を編集してください。

## 開発

### 全アプリケーションを同時に起動

```bash
pnpm dev
```

これにより、以下のサーバーが起動します：
- Web: http://localhost:3000
- API: http://localhost:8787

### 個別に起動

```bash
# Webのみ
pnpm --filter web dev

# APIのみ
pnpm --filter api dev
```

## その他のコマンド

```bash
# ビルド
pnpm build

# リント
pnpm lint

# 型チェック
pnpm type-check

# フォーマット
pnpm format
```

