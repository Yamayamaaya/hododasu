# CI/CD セットアップ手順

このドキュメントでは、Cloud Buildを使用したCI/CDパイプラインのセットアップ手順を説明します。

## 前提条件

- GCPプロジェクトが作成済み
- Firebaseプロジェクトが作成済み
- Neonプロジェクトが作成済み（本番DB）
- GitHubリポジトリが作成済み

## 1. Neon GitHub統合の設定

1. [Neon Console](https://console.neon.tech/)にログイン
2. プロジェクトを選択
3. 「Integrations」セクションで「GitHub」を選択
4. GitHub Appをインストール
5. リポジトリを接続

## 2. GitHub SecretsとVariablesの設定

Neon統合後、以下の設定が自動的に追加されます：

- `NEON_API_KEY`: GitHub Secrets（自動追加）
- `NEON_PROJECT_ID`: GitHub Variables（自動追加）

手動で追加が必要な場合：

1. GitHubリポジトリ → Settings → Secrets and variables → Actions
2. 以下のSecretsを追加：
   - `GCP_SA_KEY`: GCPサービスアカウントキー（JSON形式）
   - `GCP_PROJECT_ID`: GCPプロジェクトID

## 3. GCP Secret Managerの設定

以下のシークレットをSecret Managerに保存します：

```bash
# 本番DB接続URL（プール接続）
echo -n "postgresql://user:password@host/db?pgbouncer=true" | gcloud secrets create NEON_PROD_DATABASE_URL_POOLED --data-file=-

# 本番DB接続URL（直接接続）
echo -n "postgresql://user:password@host/db" | gcloud secrets create NEON_PROD_DATABASE_URL_DIRECT --data-file=-
```

**注意**: ステージングDB接続URL（`NEON_STAGING_DB_PR_{PR_NUMBER}`）は、GitHub Actionsが自動的に作成・削除します。

既存のシークレットを更新する場合：

```bash
echo -n "YOUR_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

## 4. GitHub Actionsワークフローの確認

**注意**: すべてのデプロイ（PR・本番）はGitHub Actionsから実行されます。Cloud Buildトリガーの設定は不要です。

以下のワークフローファイルがリポジトリに存在することを確認してください：

### 4.1 PR関連ワークフロー

- **`.github/workflows/pr-preview.yml`**: PRプレビュー環境の統合デプロイ
  - PR作成/更新時:
    1. Neonブランチ作成
    2. Secret ManagerにDB接続URL保存
    3. Cloud Build実行（APIデプロイ、完了を待つ）
    4. Webアプリビルド
    5. `firebase.json`を更新（プレビュー用Cloud Runサービスを参照）
    6. Firebase Hostingプレビューチャンネルにデプロイ
    7. PRにコメント
  - PRクローズ時: クリーンアップ（Cloud Run削除 → Secret Manager削除 → Neonブランチ削除）

**依存関係**: すべてのステップが順次実行され、依存関係が保証されます。

### 4.2 本番デプロイワークフロー

- **`.github/workflows/production-deploy.yml`**: 本番デプロイ（API + Firebase Hosting）
  - mainブランチpush時:
    1. Webアプリビルド
    2. Cloud Build実行（API本番デプロイ、完了を待つ）
    3. Firebase Hosting本番デプロイ（APIデプロイ完了後）

**依存関係**: Cloud Buildの完了を待ってからFirebase Hostingをデプロイするため、APIが確実にデプロイされた状態でフロントエンドがデプロイされます。

## 5. サービスアカウントの権限設定

### 5.1 Cloud Buildサービスアカウントの権限

Cloud Buildサービスアカウントに以下の権限を付与：

```bash
# サービスアカウントのメールアドレスを取得
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 権限を付与（Cloud Run / Secret Manager 用）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

### 5.2 GitHub Actions用サービスアカウントの権限

GitHub Actionsで使用するサービスアカウント（`GCP_SA_KEY`）に以下の権限を付与：

```bash
# サービスアカウントのメールアドレス（GCP_SA_KEYのJSONから取得）
SA_EMAIL="your-service-account@project-id.iam.gserviceaccount.com"

# Cloud Build実行権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# Cloud Run削除権限（PRクリーンアップ用）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Secret Manager権限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.admin"
```

## 6. GitHub Actionsワークフロー詳細

### 6.1 PRプレビューデプロイ（`pr-preview.yml`）

**PR作成/更新時**:

1. Neonブランチ作成（`pr-${PR_NUMBER}`）
2. Secret ManagerにステージングDB接続URL保存（`NEON_STAGING_DB_PR_${PR_NUMBER}`）
3. Cloud Build実行（APIプレビューデプロイ）
   - 完了を待つ（`--async`なし）
   - サービス名: `hododasu-api-preview-${PR_NUMBER}`（`cloudbuild.yaml`内でハードコード）
   - `_PR_NUMBER`を必須で渡す（GitHub Actionsから取得）
   - 注意: `_SERVICE_NAME`はPRプレビュー時には使用されない
4. Webアプリビルド
5. `firebase.json`を更新
   - プレビュー用Cloud Runサービス（`hododasu-api-preview-${PR_NUMBER}`）を参照
6. Firebase Hostingプレビューチャンネルにデプロイ（`pr-${PR_NUMBER}`）
7. PRにコメント（プレビューURL情報）

**PRクローズ時（クリーンアップ）**:

1. Cloud Runプレビュー環境を削除
2. Secret Managerから接続URLを削除
3. Neonブランチを削除
4. PRにコメント

**依存関係**: すべてのステップが順次実行され、Cloud Buildの完了を待ってからFirebase Hostingをデプロイするため、依存関係が保証されます。

**必要なSecrets/Variables**:

- `NEON_API_KEY`: Neon API Key（Neon統合で追加）
- `NEON_PROJECT_ID`: NeonプロジェクトID（Variables）
- `GCP_SA_KEY`: GCPサービスアカウントキー（JSON）
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `FIREBASE_SERVICE_ACCOUNT`: FirebaseサービスアカウントJSON
- `FIREBASE_PROJECT_ID`: FirebaseプロジェクトID
- `GITHUB_TOKEN`: 既定のリポジトリシークレット（自動付与）

### 6.2 本番デプロイ（`production-deploy.yml`）

**mainブランチpush時**:

**Job 1: `deploy-api`** (APIデプロイ)

1. Cloud Build実行（マイグレーション + API本番デプロイ）
   - 完了を待つ（`--async`なし）
   - Dockerイメージビルド・プッシュ完了後、マイグレーションとAPIデプロイが並列実行される
   - サービス名: `hododasu-api`（`_SERVICE_NAME`で指定）

**Job 2: `deploy-frontend`** (フロントエンドデプロイ、Job 1と完全に並列実行)

1. Webアプリビルド
2. Firebase Hosting本番デプロイ
   - `deploy-api` と `deploy-frontend` は `needs` による依存関係がないため、完全に並列実行される

**依存関係**:

- Cloud Build内では、Dockerイメージビルド・プッシュ完了後、マイグレーションとAPIデプロイが並列実行される（互換性の問題はリリース時に限り許容）
- GitHub ActionsのJobレベルでは、`deploy-api` と `deploy-frontend` は完全に並列実行される（`needs` による依存関係がないため）
- Firebase HostingはAPIデプロイと並列実行される（APIサービスが完全に起動している必要はない）

**必要なSecrets**:

- `FIREBASE_SERVICE_ACCOUNT`: FirebaseサービスアカウントJSON
- `FIREBASE_PROJECT_ID`: FirebaseプロジェクトID
- `GCP_SA_KEY`: GCPサービスアカウントキー（JSON）
- `GCP_PROJECT_ID`: GCPプロジェクトID
- `GITHUB_TOKEN`: 既定のリポジトリシークレット（自動付与）

## 7. CI/CDパイプラインの全体像

### 7.1 PR作成時のフロー

```mermaid
graph TD
    A[PR作成] --> B[GitHub Actions: pr-preview.yml]

    B --> B1[Neonブランチ作成]
    B1 --> B2[Secret Managerに保存]
    B2 --> B3[Cloud Build実行]

    B3 --> D[Cloud Build: cloudbuild.yaml]
    D --> D1[依存関係インストール]
    D1 --> D2[Lint/Type-check]
    D2 --> D3[ビルド]
    D3 --> D4[ステージングDBマイグレーション]
    D4 --> D5[Dockerイメージビルド]
    D5 --> D6[Cloud Runプレビューデプロイ]

    D6 --> B4[Webアプリビルド]
    B4 --> B5[firebase.json更新]
    B5 --> B6[Firebase Hostingプレビュー]
    B6 --> B7[PRにコメント]
```

### 7.2 mainブランチpush時のフロー

```mermaid
graph TD
    A[mainブランチpush] --> B[GitHub Actions: production-deploy.yml]

    B --> B1[Job: deploy-api]
    B --> B2[Job: deploy-frontend]

    B1 --> C[Cloud Build: cloudbuild.yaml]
    C --> C1[依存関係インストール]
    C1 --> C2[Lint/Type-check]
    C2 --> C3[ビルド]
    C3 --> C4[Dockerイメージビルド]
    C4 --> C5[本番DBマイグレーション]
    C4 --> C6[Cloud Run本番デプロイ]

    B2 --> D0[依存関係インストール]
    D0 --> D1[Lint/Type-check]
    D1 --> D2[Webアプリビルド]
    D2 --> D3[Firebase Hosting本番デプロイ]
```

### 7.3 PRクローズ時のフロー

```mermaid
graph TD
    A[PRクローズ] --> B[GitHub Actions: pr-preview.yml]

    B --> B1[Cloud Runプレビュー削除]
    B1 --> B2[Secret Manager削除]
    B2 --> B3[Neonブランチ削除]
    B3 --> B4[PRにコメント]
```

## 8. 動作確認

### 8.1 PR作成時の確認

1. 新しいPRを作成
2. Cloud Buildの実行履歴を確認
3. 以下が正常に完了することを確認：
   - Neonブランチ作成
   - ビルド・デプロイ
   - プレビュー環境の作成

### 8.2 mainブランチpush時の確認

1. mainブランチにpush
2. Cloud Buildの実行履歴を確認
3. 以下が正常に完了することを確認：
   - 本番デプロイ
   - 本番DBマイグレーション

## トラブルシューティング

### Neonブランチ作成に失敗する

- Neon GitHub統合が正しく設定されているか確認
- GitHub Secretsに`NEON_API_KEY`が設定されているか確認
- GitHub Variablesに`NEON_PROJECT_ID`が設定されているか確認
- GitHub Actionsのログを確認

### マイグレーションに失敗する

- データベース接続URLが正しいか確認
- Secret Managerに接続URLが保存されているか確認
- マイグレーションファイルが正しく生成されているか確認

### Cloud Runデプロイに失敗する

- サービスアカウントに適切な権限があるか確認
- リージョンが正しいか確認
- Dockerイメージが正常にビルドされているか確認

## 参考リンク

- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Neon API ドキュメント](https://neon.tech/docs/api)
- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
