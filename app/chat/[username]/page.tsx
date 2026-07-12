'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { askAI } from '@/lib/aiClient';

type Message = { id: string; role: 'user' | 'ai'; content: string; created_at: string; };

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `chat_${username}`;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load kutoka LocalStorage + Weka jina lako mara ya kwanza
  useEffect(() => {
    // 1. Weka jina lako kama bado halipo
    if(!localStorage.getItem('my_username')) {
      const myName = prompt("Karibu Mychatapp! Weka jina lako:") || "Mimi";
      localStorage.setItem('my_username', myName);
    }
    
    // 2. Load chat
    const saved = localStorage.getItem(storageKey);
    if (saved) setMessages(JSON.parse(saved));
  }, [storageKey]);

  // Save kila ujumbe ukiingia
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, created_at: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    
    // Kama ni NICK AI tu ndio anajibu
    if (username === 'NICK AI') {
      setLoading(true);
      const aiResponse = await askAI(input, 'NICK');
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'ai', content: aiResponse, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    } else {
      // Kama ni mtu mwingine, hapa baadaye tutaunganisha realtime
      // Kwa sasa tuache tu ujumbe upo
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-2xl">←</button>
        <h1 className="font-bold text-lg">{username}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[75%] ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-black rounded-bl-none shadow'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm">NICK AI anaandika...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Andika ujumbe..."
          className="flex-1 p-3 border rounded-full outline-none"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-5 rounded-full font-bold">
          Tuma
        </button>
      </div>
    </div>
  );
}
