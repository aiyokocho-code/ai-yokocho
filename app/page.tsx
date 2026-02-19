'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// あなたのCloud RunのURL（先ほど確認したもの）
const SERVER_URL = "https://ws-server-e542spnjza-an.a.run.app/";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);

  useEffect(() => {
    // サーバーに接続（WebSocketを開始）
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'], // 高速な通信のためにWebSocketを優先
    });
    
    setSocket(newSocket);

    // サーバーからメッセージを受け取った時の処理
    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: msg }]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && message) {
      // 自分の入力をログに追加
      setChatLog((prev) => [...prev, { sender: '自分', text: message }]);
      // サーバーへ送信
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🏮 AI横丁 - 案内所（テスト中） 🏮</h1>
      
      <div style={{ 
        border: '1px solid #ccc', 
        height: '400px', 
        overflowY: 'scroll', 
        marginBottom: '20px', 
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        {chatLog.map((log, i) => (
          <div key={i} style={{ marginBottom: '10px', textAlign: log.sender === '自分' ? 'right' : 'left' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{log.sender}</div>
            <div style={{ 
              display: 'inline-block', 
              padding: '8px 12px', 
              borderRadius: '15px', 
              backgroundColor: log.sender === '自分' ? '#0070f3' : '#e0e0e0',
              color: log.sender === '自分' ? 'white' : 'black',
              marginTop: '4px'
            }}>
              {log.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="AIマスターに話しかける..."
          style={{ flex: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ 
          padding: '10px 20px', 
          backgroundColor: '#333', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          送信
        </button>
      </form>
    </main>
  );
}
