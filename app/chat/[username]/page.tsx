'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Message = { content: string; sender: 'me' | 'them'; created_at: string }

export default function ChatPage() {
  const { username } = useParams(); // Inachukua jina kutoka kwenye link /chat/NICK
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [myName, setMyName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatKey = `chat_${username}`;

  // 1. PAKIA MAZUNGUMZO
  useEffect(() => {
    const name = localStorage.getItem('my_username');
    if(!name) {
      router.push('/login'); // Kama huna account rudi login
    } else {
      setMyName(name);
      const savedMessages = localStorage.getItem(chatKey);
      if(savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [chatKey, router]);

  // 2. SCROLL CHINI KIOTOMATIKI
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. TUMA UJUMBE
  const sendMessage = () => {
    if(!newMessage.trim()) return;

    const message: Message = {
      content: newMessage,
      sender: 'me',
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages)); // Hifadhi kwenye simu yako tu
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => router.push('/')} className="text-2xl font-bold">←</button>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          {username === 'NICK AI'? <span className="text-2xl">🤖</span> : <span className="font-bold text-blue-500 text-lg">{String(username).charAt(0).toUpperCase()}</span>}
        </div>
        <div>
          <h1 className="font-bold text-lg">{username}</h1>
          <p className="text-xs opacity-80">online</p>
        </div>
      </div>

      {/* SEHEMU YA MAZUNGUMZO */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Anza mazungumzo na @{username}</p>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'me'? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl ${
              msg.sender === 'me'? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none shadow-sm'
            }`}>
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me'? 'text-blue-200' : 'text-gray-400'} text-right`}>
                {new Date(msg.created_at).toLocaleTimeString('sw-TZ', {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Hii inatusaidia kuscroll chini */}
      </div>

      {/* SEHEMU YA KUANDIKA */}
      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Andika ujumbe kwa ${username}...`} 
            className="flex-1 p-3 border rounded-full outline-none bg-gray-100"
          />
          <button 
            onClick={sendMessage} 
            className="bg-blue-500 text-white w-12 h-12 rounded-full font-bold flex items-center justify-center"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
