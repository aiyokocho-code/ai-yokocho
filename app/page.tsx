'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = "https://ws-server-e542spnjza-an.a.run.app/";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続中...'); // 接続状態を画面に出す

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！');
    });

    newSocket.on('connect_error', (err) => {
      setStatus(`❌ 接続エラー: ${err.message}`);
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
      <h1>🏮 AI横丁 - 案内所 (試験中) 🏮</h1>
      
      {/* 接続状態を視覚化 */}
      <div style={{ padding: '10px', background: '#eee', marginBottom: '10px', borderRadius: '5px' }}>
        ステータス: <strong>{status}</strong>
      </div>

      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', marginBottom: '20px', padding: '15px' }}>
        {chatLog.map((log, i) => (
          <div key={i} style={{ textAlign: log.sender === '自分' ? 'right' : 'left' }}>
            <small>{log.sender}</small>
            <p style={{ background: log.sender === '自分' ? '#0070f3' : '#ddd', color: log.sender === '自分' ? 'white' : 'black', padding: '8px', borderRadius: '10px', display: 'inline-block' }}>
              {log.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '80%', padding: '10px' }} />
        <button type="submit" style={{ padding: '10px' }}>送信</button>
      </form>
    </main>
  );
}
