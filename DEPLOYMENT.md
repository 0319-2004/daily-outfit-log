# Vercelへのデプロイガイド

このガイドでは、Daily Outfit LogをVercelにデプロイする方法を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（無料）
- Cloudinaryアカウント（無料）

## 🚀 デプロイ手順

### ステップ1: GitHubリポジトリの作成

1. [GitHub](https://github.com)にログイン
2. 新しいリポジトリを作成:
   - Repository name: `daily-outfit-log`
   - Private or Public: お好みで
   - **Initialize this repository with:**のチェックは全て外す
   
3. ローカルでGitリポジトリを初期化:

```bash
cd /Users/yamazaki/Desktop/Antigravity/daily-outfit-log

# Gitリポジトリの初期化（まだの場合）
git init

# 全てのファイルをステージング
git add -A

# コミット
git commit -m "Initial commit: Daily Outfit Log MVP"

# GitHubリポジトリを追加
git remote add origin https://github.com/[あなたのユーザー名]/daily-outfit-log.git

# プッシュ
git branch -M main
git push -u origin main
```

### ステップ2: Vercelにデプロイ

1. [Vercel](https://vercel.com)にアクセス
2. "Sign Up"または"Log In"（GitHubアカウントで連携推奨）
3. ダッシュボードで"Add New..." → "Project"をクリック
4. "Import Git Repository"で`daily-outfit-log`を選択
5. "Import"をクリック

### ステップ3: 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加:

#### 必須の環境変数

```bash
# データベース（Vercel Postgresを使用する場合）
DATABASE_URL="postgresql://..." # Vercel Postgresから取得

# NextAuth設定
NEXTAUTH_SECRET="ランダムな文字列（32文字以上推奨）"
NEXTAUTH_URL="https://your-app.vercel.app" # デプロイ後のURL

# Cloudinary設定
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dwnb45ji8"
CLOUDINARY_API_KEY="479376563188649"
CLOUDINARY_API_SECRET="あなたのAPIシークレット"
```

**NEXTAUTH_SECRET の生成方法:**
```bash
openssl rand -base64 32
```

### ステップ4: データベースのセットアップ

#### オプション1: Vercel Postgres（推奨）

1. Vercelプロジェクトの"Storage"タブ
2. "Create Database" → "Postgres"を選択
3. データベース名を入力して作成
4. 自動的に`DATABASE_URL`が環境変数に追加される
5. Prismaマイグレーション実行のためのビルドコマンドを設定:

`package.json`に追加:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

Vercelの設定で"Build Command"を`npm run vercel-build`に変更

#### オプション2: Neon（無料PostgreSQL）

1. [Neon](https://neon.tech)にサインアップ
2. 新しいプロジェクトを作成
3. 接続文字列をコピー
4. Vercelの環境変数`DATABASE_URL`に設定

### ステップ5: Prismaスキーマの更新

SQLiteからPostgreSQLに変更:

`prisma/schema.prisma`を編集:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

`src/lib/prisma.ts`を更新:

```typescript
// Prisma client singleton
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

変更をコミット&プッシュ:
```bash
git add .
git commit -m "Update database config for production"
git push
```

Vercelが自動的に再デプロイします。

### ステップ6: デプロイの確認

1. デプロイが完了したら、Vercelが提供するURLにアクセス
2. アカウントを登録してテスト
3. カメラアクセスを許可（HTTPSなので動作します）
4. 投稿をテスト

## 🔧 トラブルシューティング

### ビルドエラー

**Error: Prisma Client initialization failed**
- 環境変数`DATABASE_URL`が正しく設定されているか確認
- ビルドコマンドに`prisma generate`が含まれているか確認

**Camera not working**
- HTTPSでアクセスしているか確認
- ブラウザのカメラ許可を確認

### 環境変数の更新

環境変数を変更した場合:
1. Vercelダッシュボードで変更
2. "Deployments"タブで最新デプロイを"Redeploy"

## 📊 本番環境の監視

Vercelダッシュボードで以下を確認:
- デプロイ状況
- ビルドログ
- 実行時ログ
- トラフィック統計

## 🎉 完了！

これでDaily Outfit Logが本番環境で動作します！

スマホのブラウザから`https://your-app.vercel.app`にアクセスして、カメラで服装を記録できます。
