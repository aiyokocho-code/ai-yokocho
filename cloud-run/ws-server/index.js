const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // すべてのオリジンからの接続を許可し、認証情報（Cookie等）も通す設定
    origin: true, 
    methods: ["GET", "POST"],
    credentials: true
  },
  // Cloud Runのセッション維持を助け、接続エラーを防ぐための設定
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get('/', (req, res) => {
  res.send('AI-Yokocho Server is Alive!');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('Message:', msg);
    // 全員にメッセージを送信（動作確認用）
    io.emit('chat message', msg);
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', reason);
  });
});

const PORT = process.env.PORT || 8080;
// 0.0.0.0 を指定して外部からの接続を待ち受ける
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
