# 軽量な Node.js イメージを使用
FROM node:20-slim

# アプリケーションディレクトリを作成
WORKDIR /usr/src/app

# パッケージファイルをコピーしてインストール
COPY package*.json ./
RUN npm install --only=production

# ソースコードをコピー
COPY index.js ./

# ポート 8080 を開放
EXPOSE 8080

# サーバーを起動
CMD [ "npm", "start" ]
