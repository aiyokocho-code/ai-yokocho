const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS設定を強化
const io = new Server(server, {
  cors: {
    origin: "*", // テストのため一旦すべて許可。本番は "https://your-app-url.web.app" に絞るのが安全
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('AI-Yokocho WS Server is running!');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // AIマスターとしての返信
    socket.emit('chat message', `AIマスター: 「${msg}」だね。ゆっくりしていきな。`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
