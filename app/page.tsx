'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = "https://ws-server-872666885870.asia-northeast1.run.app";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続を確立中...');

  useEffect(() => {
    // 💡 サーバー側のCORS設定と完全に一致させる
    const newSocket = io(SERVER_URL, {
      withCredentials: true,
      transports: ['polling', 'websocket'], // ポーリングから安全に開始
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！AIマスターがお店を開きました');
    });

    newSocket.on('connect_error', (err) => {
      // 'server error' が出る場合はここで詳細をキャッチ
      setStatus(`❌ 接続エラー: ${err.message}`);
    });

    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: msg }]);
    });

    newSocket.on('disconnect', () => {
      setStatus('⚠️ 切断されました。再接続中...');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
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
      <h1 style={{ textAlign: 'center' }}>🏮 AI横丁 - 案内所 🏮</h1>
      
      <div style={{ 
        padding: '10px', 
        background: status.includes('成功') ? '#e6fffa' : '#fff5f5', 
        marginBottom: '20px', 
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        {status}
      </div>

      <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', marginBottom: '20px', padding: '10px', background: '#fff' }}>
        {chatLog.map((log, i) => (
          <div key={i} style={{ marginBottom: '10px', textAlign: log.sender === '自分' ? 'right' : 'left' }}>
            <small style={{ color: '#666' }}>{log.sender}</small>
            <div style={{ 
              background: log.sender === '自分' ? '#007bff' : '#eee', 
              color: log.sender === '自分' ? '#fff' : '#000', 
              padding: '8px 12px', 
              borderRadius: '10px',
              display: 'inline-block',
              marginLeft: log.sender === '自分' ? '0' : '5px',
              marginRight: log.sender === '自分' ? '5px' : '0'
            }}>
              {log.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="マスターに話しかける..." 
          style={{ flex: 1, padding: '10px' }} 
        />
        <button type="submit" disabled={!socket?.connected} style={{ padding: '10px 20px' }}>送信</button>
      </form>
    </main>
  );
}
