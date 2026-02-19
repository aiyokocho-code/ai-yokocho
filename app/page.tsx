
'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// 💡 先ほどコマンドの結果に出た「最新のURL」です。末尾のスラッシュは無しでOK。
const SERVER_URL = "https://ws-server-872666885870.asia-northeast1.run.app";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string, text: string }[]>([]);
  const [status, setStatus] = useState('接続試行中 (WebSocket強制モード)...');

  useEffect(() => {
    console.log("接続を試みています:", SERVER_URL);

    // 💡 接続オプションをCloud Runに最適化
    const newSocket = io(SERVER_URL, {
      transports: ['websocket'], // 最初からWebSocketを使用
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 30000,             // 30秒まで待つ
      withCredentials: false      // CORSエラーを回避しやすくする
    });

    newSocket.on('connect', () => {
      setStatus('✅ 接続成功！AIマスターがお店を開きました');
      console.log('Connected! ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      setStatus(`❌ 接続エラー: ${err.message}`);
      console.error('Socket Error Details:', err);
    });

    newSocket.on('chat message', (msg: string) => {
      setChatLog((prev) => [...prev, { sender: 'AIマスター', text: msg }]);
    });

    newSocket.on('disconnect', (reason) => {
      setStatus(`⚠️ 切断されました: ${reason}`);
    });

    setSocket(newSocket);

    // クリーンアップ
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
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏮 AI横丁 - 案内所 🏮</h1>
      
      {/* 接続状況を表示するエリア */}
      <div style={{ 
        padding: '12px', 
        background: status.includes('成功') ? '#e6fffa' : '#fff5f5', 
        color: status.includes('成功') ? '#2c7a7b' : '#c53030',
        border: '1px solid',
        borderColor: status.includes('成功') ? '#b2f5ea' : '#feb2b2',
        marginBottom: '20px', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 'bold'
      }}>
        ステータス: {status}
      </div>

      {/* チャット履歴 */}
      <div style={{ 
        border: '1px solid #ddd', 
        height: '400px', 
        overflowY: 'scroll', 
        marginBottom: '20px', 
        padding: '15px', 
        background: 'white',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {chatLog.length === 0 && <p style={{ color: '#999', textAlign: 'center', marginTop: '150px' }}>まだ会話はありません</p>}
        {chatLog.map((log, i) => (
          <div key={i} style={{ textAlign: log.sender === '自分' ? 'right' : 'left', marginBottom: '15px' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px' }}>{log.sender}</div>
            <div style={{ 
              background: log.sender === '自分' ? '#0070f3' : '#edf2f7', 
              color: log.sender === '自分' ? 'white' : '#2d3748', 
              padding: '10px 14px', 
              borderRadius: '18px', 
              borderBottomRightRadius: log.sender === '自分' ? '2px' : '18px',
              borderBottomLeftRadius: log.sender === '自分' ? '18px' : '2px',
              display: 'inline-block',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              maxWidth: '80%',
              wordBreak: 'break-all'
            }}>
              {log.text}
            </div>
          </div>
        ))}
      </div>

      {/* 入力フォーム */}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="AIマスターに話しかける..." 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '25px', 
            border: '1px solid #ccc',
            outline: 'none'
          }} 
        />
        <button 
          type="submit" 
          disabled={!socket?.connected}
          style={{ 
            padding: '10px 24px', 
            background: socket?.connected ? '#333' : '#ccc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: socket?.connected ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          送信
        </button>
      </form>
    </main>
  );
}
