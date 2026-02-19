'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// 💡 最後にスラッシュを「入れない」URLで定義してみてください
const SERVER_URL = "https://ws-server-872666885870.asia-northeast1.run.app";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続試行中...');

  useEffect(() => {
    // 💡 オプションを最小限かつ標準的にします
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'], // WebSocketを優先
      secure: true,
      reconnection: true
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！AIマスターがお店を開きました');
      console.log('Connected! ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      setStatus(`❌ 接続エラー: ${err.message}`);
      console.error('Socket Error:', err);
    });

    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: msg }]);
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && message) {
      setChatLog((prev) => [...prev, { sender: '自分', text: message }]);
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🏮 AI横丁 - 案内所 🏮</h1>
      
      <div style={{ padding: '10px', background: status.includes('成功') ? '#e6fffa' : '#fff5f5', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
        ステータス: <strong>{status}</strong>
      </div>

      <div style={{ border: '1px solid #ccc', height: '350px', overflowY: 'scroll', marginBottom: '20px', padding: '15px', background: '#fdfdfd' }}>
        {chatLog.map((log, i) => (
          <div key={i} style={{ textAlign: log.sender === '自分' ? 'right' : 'left', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: '#888' }}>{log.sender}</div>
            <p style={{ background: log.sender === '自分' ? '#0070f3' : '#eee', color: log.sender === '自分' ? 'white' : 'black', padding: '8px 12px', borderRadius: '15px', display: 'inline-block', margin: '4px 0' }}>
              {log.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '5px' }}>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="メッセージを入力..." style={{ flex: 1, padding: '10px' }} />
        <button type="submit" style={{ padding: '10px 20px', background: '#333', color: '#white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>送信</button>
      </form>
    </main>
  );
}
