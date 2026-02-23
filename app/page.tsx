'use client'; // 💡 useEffect等を使うため必須

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = "https://ws-server-872666885870.asia-northeast1.run.app";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続を確立中...');

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // WebSocketを優先
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！AIマスターがお店を開きました');
    });

    newSocket.on('connect_error', (err) => {
      setStatus(`❌ 接続エラー: ${err.message}`);
    });

    // 1. ユーザー同士のチャット
    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: '常連さん', text: msg }]);
    });

    // 2. 💡 AIマスターからの特別な返信 (Pub/Sub経由)
    newSocket.on('ai-response', (data: { text: string }) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: data.text }]);
    });

    newSocket.on('disconnect', () => {
      setStatus('⚠️ 切断されました。再接続中...');
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
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#1a202c', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ textAlign: 'center', color: '#f6ad55' }}>🏮 AI横丁 - 案内所 🏮</h1>
      
      <div style={{ 
        padding: '10px', 
        background: status.includes('成功') ? '#2d3748' : '#742a2a', 
        marginBottom: '20px', 
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
        border: '1px solid #4a5568'
      }}>
        {status}
      </div>

      <div style={{ border: '1px solid #4a5568', height: '450px', overflowY: 'scroll', marginBottom: '20px', padding: '15px', background: '#2d3748', borderRadius: '10px' }}>
        {chatLog.map((log, i) => (
          <div key={i} style={{ marginBottom: '15px', textAlign: log.sender === '自分' ? 'right' : 'left' }}>
            <small style={{ color: '#a0aec0', display: 'block', marginBottom: '4px' }}>{log.sender}</small>
            <div style={{ 
              background: log.sender === '自分' ? '#3182ce' : (log.sender === 'AIマスター' ? '#e53e3e' : '#4a5568'), 
              color: '#fff', 
              padding: '10px 16px', 
              borderRadius: '15px',
              display: 'inline-block',
              maxWidth: '80%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {log.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="マスターに話しかける..." 
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4a5568', background: '#fff', color: '#000' }} 
        />
        <button type="submit" disabled={!socket?.connected} style={{ padding: '10px 24px', borderRadius: '8px', background: '#f6ad55', color: '#1a202c', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>送信</button>
      </form>
    </main>
  );
}
