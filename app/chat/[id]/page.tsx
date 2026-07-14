'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'

const NICK_AI_URL = "https://nick-ai.onrender.com";

export default function ChatPage() {
  const { id: receiverId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    const fetchMessages = async () => {
      if(!user) return;
      const myId = user.email.split('@')[0];
      const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender.eq.${myId},receiver.eq.${receiverId}),and(sender.eq.${receiverId},receiver.eq.${myId})`)
      .order('created_at');
      setMessages(data || []);
    };
    fetchMessages();

    const channel = supabase.channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages)
  .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, [user, receiverId, router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages]);

  const handleNickAIReply = async (userMessage: string) => {
    const myId = user.email.split('@')[0];
    try {
      const res = await fetch(`${NICK_AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: myId, message: userMessage })
      });
      const data = await res.json();
      await supabase.from('messages').insert({
        sender: 'nick_ai', receiver: myId,
        content: data.reply || data.response || "NICK AI: Sijapata jibu"
      });
    } catch {
      await supabase.from('messages').insert({
        sender: 'nick_ai', receiver: myId,
        content: 'NICK AI: Samahani kuna shida ya mtandao 😅'
      });
    }
  }

  const sendMessage = async () => {
    if(!newMessage ||!user) return;
    const myId = user.email.split('@')[0];
    await supabase.from('messages').insert({
      sender: myId, receiver: receiverId, content: newMessage
    });
    if(receiverId === 'nick_ai') handleNickAIReply(newMessage);
    setNewMessage('');
  }

  if(!user) return <p className="p-10 text-center">Loading...</p>

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto">
      <div className="p-4 border-b font-bold">{receiverId === 'nick_ai'? 'NICK AI 🤖' : receiverId}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`p-2 rounded-lg max-w-[80%] ${m.sender === user.email.split('@')[0]? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200'}`}>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="border p-2 rounded w-full"/>
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">Tuma</button>
      </div>
    </div>
  );
}
