'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type ChatContact = {
  name: string;
  lastMessage: string;
  time: string;
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [chatList, setChatList] = useState<ChatContact[]>([]);
  const router = useRouter();

  // 1. Pata list ya watu ulioongea nao kutoka LocalStorage
  useEffect(() => {
    const loadChats = () => {
      const contacts: ChatContact[] = [];
      // NICK AI daima yupo kwanza
      contacts.push({
        name: 'NICK AI',
        lastMessage: 'Rafiki yako wa AI',
        time: ''
      });

      // Pata chat zote kutoka localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('chat_')) {
          const username = key.replace('chat_', '');
          if (username !== 'NICK AI') {
            const messages = JSON.parse(localStorage.getItem(key) || '[]');
            const lastMsg = messages[messages.length - 1];
            contacts.push({
              name: username,
              lastMessage: lastMsg ? lastMsg.content.substring(0, 30) + '...' : 'Anza mazungumzo',
              time: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString('sw-TZ', {hour: '2-digit', minute:'2-digit'}) : ''
            });
          }
        }
      }
      setChatList(contacts);
    };
    loadChats();
  }, []);

  const startChat = (name: string) => {
    if (!name.trim()) return;
    router.push(`/chat/${name.trim()}`);
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    // Ongeza huyu mtu kwenye directory ya Supabase ili wengine wamuone
    supabase.from('users').upsert({ username: search.trim(), last_seen: new Date() });
    startChat(search);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Mychatapp</h1>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tafuta au andika jina jipya..."
            className="flex-1 p-3 border rounded-full outline-none"
          />
          <button 
            onClick={handleSearch}
            className="bg-blue-500 text-white px-5 rounded-full font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* List ya Chats */}
      <div className="flex-1 overflow-y-auto">
        {chatList.map(contact => (
          <div 
            key={contact.name}
            onClick={() => startChat(contact.name)}
            className="flex items-center gap-3 p-4 bg-white border-b hover:bg-gray-50 cursor-pointer"
          >
            {/* ICON */}
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              {contact.name === 'NICK AI' ? (
                <span className="text-2xl">🤖</span>
              ) : (
                <span className="font-bold text-white text-lg">{contact.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between">
                <p className="font-bold">{contact.name}</p>
                <p className="text-xs text-gray-500">{contact.time}</p>
              </div>
              <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
