'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type ChatContact = { name: string; lastMessage: string; time: string }

export default function Home() {
  const [search, setSearch] = useState('');
  const [chatList, setChatList] = useState<ChatContact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('my_username');
    if(!name) {
      router.push('/login'); // Kama huna account nenda login
    } else {
      setMyName(name);
      // Jisajili kwenye directory ya Supabase mara 1 tu
      supabase.from('users').upsert({ username: name, last_seen: new Date() });
      loadChats();
    }
  }, [router]);

  const loadChats = () => {
    const contacts: ChatContact[] = [];
    contacts.push({ name: 'NICK AI', lastMessage: 'Rafiki yako wa AI', time: '' });

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        const username = key.replace('chat_', '');
        if (username!== 'NICK AI') {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          const lastMsg = messages[messages.length - 1];
          contacts.push({
            name: username,
            lastMessage: lastMsg? lastMsg.content.substring(0, 30) + '...' : 'Anza mazungumzo',
            time: lastMsg? new Date(lastMsg.created_at).toLocaleTimeString('sw-TZ', {hour: '2-digit', minute:'2-digit'}) : ''
          });
        }
      }
    }
    setChatList(contacts);
  }

  const handleSearch = async () => {
    if (!search.trim() ||!myName) return;
    setError('');
    setLoading(true);

    const usernameToAdd = search.trim();

    // 1. Huwezi kujiongeza mwenyewe
    if(usernameToAdd === myName) {
      setError("Huwawezi kujiongeza mwenyewe 😅");
      setLoading(false);
      return;
    }

    // 2. Angalia kama huyo user yupo kwenye Supabase
    const { data, error: supaError } = await supabase
     .from('users')
     .select('username')
     .eq('username', usernameToAdd)
     .single();

    if(data) {
      // 3. Kama yupo, muongeze kwenye list yako
      const key = `chat_${usernameToAdd}`;
      if(!localStorage.getItem(key)) {
        localStorage.setItem(key, '[]'); // Tengeneza chat tupu
      }
      loadChats(); // Reload list
      router.push(`/chat/${usernameToAdd}`);
    } else {
      // 4. Kama hayupo, toa error kama WhatsApp
      setError(`@${usernameToAdd} hayupo kwenye Mychatapp.`);
    }
    setLoading(false);
    setSearch('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Mychatapp</h1>
        <p className="text-sm opacity-80">Umeingia kama: @{myName}</p>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white border-b">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Andika @username kuongeza mtu..."
            className="flex-1 p-3 border rounded-full outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 text-white px-5 rounded-full font-bold disabled:bg-gray-400"
          >
            {loading? '...' : '+'}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* List ya Chats zako TU */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-500 text-xs px-4 pt-3 pb-1">Mazungumzo Yako</p>
        {chatList.map(contact => (
          <div
            key={contact.name}
            onClick={() => router.push(`/chat/${contact.name}`)}
            className="flex items-center gap-3 p-4 bg-white border-b hover:bg-gray-50 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              {contact.name === 'NICK AI'? <span className="text-2xl">🤖</span> : <span className="font-bold text-white text-lg">{contact.name.charAt(0).toUpperCase()}</span>}
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
