'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { askAI } from '@/lib/aiClient';

type Message = { id: string; role: 'user' | 'ai'; content: string; created_at: string; };

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load ujumbe kutoka Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', username) // Tunatumia username kama user_id
      .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();
  }, [username]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { user_id: username, ai_name: 'NICK', role: 'user', content: input };
    setMessages(prev => [...prev, {...userMsg, id: Date.now().toString(), created_at: new Date().toISOString() }]);
    setInput('');
    setLoading(true);

    await supabase.from('messages').insert(userMsg);
    const aiResponse = await askAI(input, 'NICK');
    const aiMsg = { user_id: username, ai_name: 'NICK', role: 'ai', content: aiResponse };
    await supabase.from('messages').insert(aiMsg);
    
    setMessages(prev => [...prev, {...aiMsg, id: Date.now().toString() + 'ai', created_at: new Date().toISOString() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-blue-500 text-xl">←</button>
        <h2 className="font-bold text-lg">{username}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user'? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${msg.role === 'user'? 'bg-blue-500 text-white rounded-br-none' : 'bg-white shadow rounded-bl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">NICK AI anaandika...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Andika ujumbe..." className="flex-1 p-3 border rounded-full outline-none"/>
        <button onClick={sendMessage} disabled={loading} className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold disabled:opacity-50">Tuma</button>
      </div>
    </div>
  );
}
