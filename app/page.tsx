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
  const [allUsers, setAllUsers] = useState<string[]>([]); // Watu wengine kwenye app
  const router = useRouter();

  const loadData = async () => {
    const contacts: ChatContact[] = [];
    // 1. NICK AI daima yupo kwanza
    contacts.push({
      name: 'NICK AI',
      lastMessage: 'Rafiki yako wa AI - Bonyeza kuongea',
      time: ''
    });

    // 2. Pata chat zote kutoka localStorage
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

    // 3. Pata watu wote kutoka Supabase
    const { data } = await supabase.from('users').select('username');
    if (data) setAllUsers(data.map(u => u.username));
  }

  useEffect(() => {
    loadData();
  }, []);

  const startChat = async (name: string) => {
    if (!name.trim()) return;
    
    // Jisajili wewe mwenyewe kwenye directory
    const myName = localStorage.getItem('my_username') || 'Wewe'; 
    await supabase.from('users').upsert({ username: myName, last_seen: new Date() });
    await supabase.from('users').upsert({ username: name.trim(), last_seen: new Date() });

    router.push(`/chat/${name.trim()}`);
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    startChat(search);
    setSearch('');
  };

  // Watu ambao haujaongea nao bado
  const otherUsers = allUsers.filter(u => !chatList.find(c => c.name === u) && u !== 'NICK AI');

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

      {/* List ya Chats zako */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-500 text-xs px-4 pt-3 pb-1">Mazungumzo</p>
        {chatList.map(contact => (
          <div 
            key={contact.name}
            onClick={() => startChat(contact.name)}
            className="flex items-center gap-3 p-4 bg-white border-b hover:bg-gray-50 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              {contact.name === 'NICK AI' ? <span className="text-2xl">🤖</span> : <span className="font-bold text-white text-lg">{contact.name.charAt(0).toUpperCase()}</span>}
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

        {/* Sehemu Mpya: Watu kwenye App */}
        {otherUsers.length > 0 && (
          <>
            <p className="text-gray-500 text-xs px-4 pt-4 pb-1">Watu kwenye App</p>
            {otherUsers.map(name => (
              <div 
                key={name}
                onClick={() => startChat(name)}
                className="flex items-center gap-3 p-4 bg-white border-b hover:bg-gray-50 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-gray-600 text-lg">{name.charAt(0).toUpperCase()}</span>
                </div>
                <p className="font-bold">{name}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
