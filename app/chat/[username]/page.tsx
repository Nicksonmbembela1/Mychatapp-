'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sendToNickAI } from '../../lib/nickAI' // tutaitengeneza hii baadae

type Message = { sender: string; content: string; created_at: string }

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [myName, setMyName] = useState<string | null>(null);

  const chatKey = `chat_${username}`;

  useEffect(() => {
    const name = localStorage.getItem('my_username');
    if(!name) router.push('/login');
    else {
      setMyName(name);
      loadMessages();
    }
  }, [username, router]);

  const loadMessages = () => {
    const saved = localStorage.getItem(chatKey);
    setMessages(saved ? JSON.parse(saved) : []);
  }

  const saveMessages = (newMessages: Message[]) => {
    localStorage.setItem(chatKey, JSON.stringify(newMessages));
    setMessages(newMessages);
  }

  const handleSend = async () => {
    if (!input.trim() || !myName) return;
    
    const newMsg: Message = {
      sender: myName,
      content: input,
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMsg];
    saveMessages(updatedMessages);
    setInput('');

    // KAMA NI NICK AI
    if (username === 'NICK AI') {
      const aiReply = await sendToNickAI(input);
      const aiMsg: Message = {
        sender: 'NICK AI',
        content: aiReply,
        created_at: new Date().toISOString()
      };
      saveMessages([...updatedMessages, aiMsg]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => router.push('/')} className="text-2xl">←</button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          {username === 'NICK AI' ? '🤖' : username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold">{username}</p>
          <p className="text-xs opacity-80">{username === 'NICK AI' ? 'Online' : 'Active'}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === myName ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              msg.sender === myName 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none'
            }`}>
              <p>{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString('sw-TZ', {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Andika ujumbe..." 
          className="flex-1 p-3 border rounded-full outline-none focus:border-blue-500"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-6 rounded-full font-bold">
          Tuma
        </button>
      </div>
    </div>
  );
}
