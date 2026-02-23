const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
// Cloud Run の負荷分散（ロードバランサ）からの JSON リクエストを受け取れるように設定
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true, // 開発中は true。本番は https://ai-yokocho.web.app に絞るのが理想
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'] // WebSocketを優先
});

// --- ルーティング ---

// 既存のトップページ
app.get('/', (req, res) => {
  res.send('AI-Yokocho Server is Alive!');
});

// 追加：ヘルスチェック用（Google Cloud や curl での確認用）
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 重要：Pub/Sub からのプッシュ通知を受け取るエンドポイント
// AI 応答サービスがメッセージを投げると、ここが叩かれて全ユーザーに WebSocket で配信される
app.post('/pubsub-push', (req, res) => {
  if (!req.body.message) {
    res.status(400).send('Bad Request: No message received');
    return;
  }

  // Pub/Sub のメッセージをデコード
  const message = Buffer.from(req.body.message.data, 'base64').toString();
  console.log('Received Pub/Sub message:', message);

  try {
    const data = JSON.parse(message);
    // 全クライアントに AI マスターの発言をブロードキャスト
    // イベント名は技術戦略に合わせて 'ai-response' としています
    io.emit('ai-response', data);
    res.status(204).send();
  } catch (e) {
    console.error('Error parsing Pub/Sub message:', e);
    res.status(500).send('Internal Server Error');
  }
});

// --- WebSocket ロジック ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ユーザーからの発言を受け取った時
  socket.on('chat message', (msg) => {
    console.log('Message from client:', msg);
    // 全員にオウム返し（動作確認用）
    io.emit('chat message', msg);
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', reason);
  });
});

// --- サーバー起動 ---

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
