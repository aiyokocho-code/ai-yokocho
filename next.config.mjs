/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的エクスポートを有効にし、'out' フォルダを生成するようにする
  output: 'export',
  
  // Firebase Hosting などの静的ホスティングでは Next.js の画像最適化が動かないため無効化
  images: {
    unoptimized: true,
  },

  // 開発中に WebSocket サーバーのアドレスなどを環境変数から読み込むための準備（任意）
  env: {
    NEXT_PUBLIC_WS_SERVER_URL: process.env.NEXT_PUBLIC_WS_SERVER_URL || '',
  },
};

export default nextConfig;
