'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { askAI } from '@/lib/aiClient';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load old messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { user } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data } = await supabase
       .from('messages')
       .select('*')
       .eq('user_id', user.id)
       .eq('ai_name', username)
       .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };
    fetchMessages();
  }, [username, router]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, {...userMessage, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    setInput('');
    setLoading(true);

    // Save user message to DB
    await supabase.from('messages').insert({
      user_id: user.id,
      ai_name: username,
      role: 'user',
      content: input
    });

    // Get AI response
    const aiResponse = await askAI(input, username as string);

    // Save AI message to DB
    await supabase.from('messages').insert({
      user_id: user.id,
      ai_name: username,
      role: 'ai',
      content: aiResponse
    });

    setMessages(prev => [...prev, {...userMessage, id: Date.now().toString() + 'ai', created_at: new Date().toISOString() }]);
    setMessages(prev => [...prev, { id: Date.now().toString() + 'ai2', role: 'ai', content: aiResponse, created_at: new Date().toISOString() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-blue-500">←</button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
          {username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-lg">NICK AI - {username}</h2>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              msg.role === 'user' 
               ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white shadow rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">NICK AI anaandika...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Andika ujumbe..."
          className="flex-1 p-3 border rounded-full outline-none"
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          Tuma
        </button>
      </div>
    </div>
  );
}
