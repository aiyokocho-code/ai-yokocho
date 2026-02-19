'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// 💡 Cloud Runの最新URL
const SERVER_URL = "https://ws-server-872666885870.asia-northeast1.run.app";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続中...');

  useEffect(() => {
    // 💡 接続設定を最も安定する「WebSocket固定モード」に
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'],
      upgrade: false,      // HTTPからのアップグレードを禁止（ループ防止）
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！AIマスターがお店を開きました');
      console.log('Connected to server!');
    });

    newSocket.on('connect_error', (err) => {
      setStatus(`❌ 接続エラー: ${err.message}`);
      console.error('Connection Error:', err);
    });

    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: msg }]);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // サーバー側から切断された場合は手動で再接続
        newSocket.connect();
      }
      setStatus('⚠️ 再接続を試みています...');
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
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', color: '#2d3748' }}>🏮 AI横丁 - 案内所</h1>
        <div style={{ 
          display: 'inline-block',
          padding: '8px 16px', 
          background: status.includes('成功') ? '#c6f6d5' : '#fed7d7', 
          color: status.includes('成功') ? '#22543d' : '#822727',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold'
        }}>
          {status}
        </div>
      </header>

      <div style={{ 
        border: '1px solid #e2e8f0', 
        height: '450px', 
        overflowY: 'auto', 
        marginBottom: '20px', 
        padding: '20px', 
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {chatLog.length === 0 && (
          <div style={{ color: '#a0aec0', textAlign: 'center', marginTop: '180px' }}>
            マスターに何か話しかけてみて！
          </div>
        )}
        {chatLog.map((log, i) => (
          <div key={i} style={{ textAlign: log.sender === '自分' ? 'right' : 'left', marginBottom: '15px' }}>
            <div style={{ fontSize: '0.7rem', color: '#718096', marginBottom: '4px', marginRight: '10px', marginLeft: '10px' }}>{log.sender}</div>
            <div style={{ 
              background: log.sender === '自分' ? '#4a90e2' : '#edf2f7', 
              color: log.sender === '自分' ? 'white' : '#2d3748', 
              padding: '10px 16px', 
              borderRadius: '15px', 
              display: 'inline-block',
              maxWidth: '80%',
              lineHeight: '1.4'
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
          placeholder="メッセージを入力..." 
          style={{ 
            flex: 1, 
            padding: '14px', 
            borderRadius: '10px', 
            border: '1px solid #cbd5e0',
            fontSize: '1rem',
            outline: 'none'
          }} 
        />
        <button 
          type="submit" 
          disabled={!socket?.connected}
          style={{ 
            padding: '0 25px', 
            background: socket?.connected ? '#2d3748' : '#cbd5e0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: socket?.connected ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          送る
        </button>
      </form>
    </main>
  );
}
