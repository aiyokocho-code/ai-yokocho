const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 開発中はすべて許可
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('メッセージを受信:', msg);
    // AIマスターからの返信（今はオウム返し）
    io.emit('chat message', `AIマスター: 「${msg}」だね。ゆっくりしていきな。`);
  });

  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
