const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORSを全開放
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 起動確認用のルート
app.get('/', (req, res) => {
  res.send('AI-Yokocho Server is Alive!');
});

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);
  socket.on('chat message', (msg) => {
    io.emit('chat message', `AIマスター: ${msg}ですね！いらっしゃい！`);
  });
});

// Cloud Run用のポート設定
const PORT = process.env.PORT || 8080;
// 第2引数 '0.0.0.0' が絶対に必要です！
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
