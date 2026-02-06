# Daily Outfit Log

毎日の服装を記録するアプリ。友達とシェアして、リアルな着こなしを記録。

## 特徴

- 📸 カメラで毎日の服装を撮影
- 👥 友達30人まで追加可能
- 🌤️ 天気と気温を記録
- 🙈 顔ぼかし機能（プライバシー保護）
- 📅 アーカイブで過去の服装を振り返り
- 🚫 いいね機能なし（アンチパフォーマンス）

## 技術スタック

- **Frontend**: Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Prisma + SQLite (開発) / PostgreSQL (本番)
- **認証**: NextAuth.js v5
- **画像保存**: Cloudinary
- **顔検出**: face-api.js
- **スタイリング**: CSS Modules

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成:

```bash
cp .env.example .env
```

必要な環境変数:
- `DATABASE_URL`: データベース接続URL
- `NEXTAUTH_SECRET`: 認証用シークレット
- `NEXTAUTH_URL`: アプリのURL
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinaryクラウド名
- `CLOUDINARY_API_KEY`: Cloudinary APIキー
- `CLOUDINARY_API_SECRET`: Cloudinary APIシークレット

### 3. データベースのセットアップ

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリを作成
2. コードをプッシュ
3. [Vercel](https://vercel.com)にログイン
4. "Import Project"から GitHubリポジトリを選択
5. 環境変数を設定
6. デプロイ

詳細は`DEPLOYMENT.md`を参照

## ライセンス

MIT
