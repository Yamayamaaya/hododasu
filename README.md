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

## 前提条件

- Docker Desktop（またはDocker Engine + Docker Compose）がインストールされていること
- ローカル開発環境はDockerを使用します

## 初回セットアップ

### 1. 環境変数の設定

```bash
# .env.exampleを.envにコピー
cp .env.example .env
```

必要に応じて`.env`ファイルを編集してください（ポート番号の変更など）。

### 2. Dockerイメージのビルドと起動

```bash
docker compose up --build
```

これにより、以下のサービスが起動します：

- **db**: PostgreSQL（デフォルトポート5432）
- **api**: Hono APIサーバー（デフォルトポート8787）
- **web**: React + Vite開発サーバー（デフォルトポート3000）

### 3. データベースマイグレーションの実行

別のターミナルで以下を実行：

```bash
docker compose run api pnpm --filter api db:migrate
```

## 開発時の操作

### サービス起動

```bash
# 全サービスを起動（ログを表示）
docker compose up

# バックグラウンドで起動
docker compose up -d

# サービスを停止
docker compose down

# データベースボリュームも含めて削除
docker compose down -v
```

### 確認項目

起動後、以下を確認してください：

1. **Webアプリケーション**: http://localhost:3000 にアクセス
2. **APIヘルスチェック**: http://localhost:8787/health にアクセス（またはWebから `/api/health` にアクセス）
3. **データベース接続**: マイグレーションが正常に実行されていること

## マイグレーション

### マイグレーション実行

マイグレーションは手動で実行します：

```bash
# マイグレーション実行
docker compose run api pnpm --filter api db:migrate
```

### マイグレーションファイル生成

スキーマを変更した後、マイグレーションファイルを生成します：

```bash
# ホストで実行
cd apps/api
pnpm db:generate
```

生成後、上記のコマンドでマイグレーションを実行してください。

## 環境変数のカスタマイズ

`.env`ファイルで以下の設定を変更できます：

- **ポート番号**: `WEB_PORT`, `API_PORT`, `DB_PORT`
- **データベース設定**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **API設定**: `API_SERVICE_NAME`

例：ポート番号を変更する場合

```bash
# .env
WEB_PORT=3001
API_PORT=8788
DB_PORT=5433
```

変更後、コンテナを再起動してください：

```bash
docker compose down
docker compose up
```

## その他のコマンド

### ビルド

```bash
# ホストで実行
pnpm build
```

### リント

```bash
# ホストで実行
pnpm lint
```

### 型チェック

```bash
# ホストで実行
pnpm type-check
```

### フォーマット

```bash
# ホストで実行
pnpm format
```

## アーキテクチャ

### ネットワーク構成

```
ルーター（グローバルIP）
    ↓
Wi-Fiネットワーク層（プライベートIP: 192.168.1.x）
    ↓
MacOS（プライベートIP: 192.168.1.100）
    ↓
Docker仮想ネットワーク層（プライベートIP: 172.17.0.x + ポートマッピング）
    ↓
コンテナ（プライベートIP: 172.17.0.2など）
```

### サービス間通信

- **Web → API**: Viteプロキシ経由（`/api/**` → `http://api:8787`）
- **API → DB**: Docker仮想ネットワーク経由（`postgresql://...@db:5432/...`）
- **ホスト → コンテナ**: ポートマッピング経由（`localhost:3000` → コンテナの`3000`）

## 注意事項

### データベース

- データベースのデータは `postgres_data` ボリュームに永続化されます
- `docker compose down -v` を実行すると、データベースのデータも削除されます
- 本番環境（Neonなど）では、`DATABASE_URL_POOLED`に`?pgbouncer=true`を追加してください

### 開発環境

- `node_modules` はコンテナ内に保持されます（ホストと共有しません）
- ソースコードはホストからバインドマウントされるため、編集内容は即座に反映されます（ホットリロード）
- WebアプリケーションからAPIへのリクエストは、Viteのプロキシ経由で `/api/**` が `api` サービスに転送されます

### 環境変数

- `.env`ファイルは`.gitignore`に含まれているため、Gitにはコミットされません（`.env.example`はコミットされます）
- Docker環境では`docker-compose.yml`の環境変数が使用されます
- ローカル開発環境（Dockerなし）でNeonなどに接続する場合は、`apps/api/.env.local`を設定してください

## トラブルシューティング

### ポートが既に使用されている

`.env`ファイルでポート番号を変更してください。

### データベースに接続できない

1. マイグレーションが実行されているか確認
2. `docker compose down`でコンテナを停止し、`docker compose up`で再起動

### コンテナが起動しない

1. `docker compose down -v`で完全にクリーンアップ
2. `docker compose up --build`で再ビルド
