# Node.js 20 の軽量イメージ
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# package.json と lock を先にコピー（キャッシュ効率UP）
COPY package*.json ./

# 本番用依存だけインストール
RUN npm install --production

# 残りのソースコードをコピー
COPY . .

# Cloud Run が使うポート
EXPOSE 8080

# アプリ起動コマンド
CMD ["npm", "start"]

