const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 💡 Socket.ioの設定を強化
const io = new Server(server, {
  cors: {
    origin: "*", // 開発中は全許可。本番はFirebaseのURLを指定するとより安全です
    methods: ["GET", "POST"],
    credentials: true
  },
  // 💡 Cloud Runやプロキシ経由の接続を安定させるためのオプション
  allowEIO3: true,           // 古いクライアントとの互換性
  pingTimeout: 60000,        // タイムアウトを長めに設定（60秒）
  pingInterval: 25000,       // ヘルスチェックの間隔（25秒）
  transports: ['websocket']  // WebSocketを優先
});

// 起動確認用のルート
app.get('/', (req, res) => {
  res.send('AI-Yokocho Server is Alive!');
});

// 接続時の処理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    // 全員にメッセージを送信（自分含む）
    io.emit('chat message', msg);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected. Reason:', reason);
  });
});

// Cloud Run指定のポート、または8080で待機
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
