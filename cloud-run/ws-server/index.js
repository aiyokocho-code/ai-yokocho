const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const textMessage = message.toString();
        ws.send(`AI横丁へようこそ！(Node.js) 受信メッセージ: ${textMessage}`);
    });
});
