'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; // HAPA NDIO NIMEBADILI

type ChatContact = { name: string; lastMessage: string; time: string }

export default function Home() {
  const [search, setSearch] = useState('');
  const [chatList, setChatList] = useState<ChatContact[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const router = useRouter();
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('my_username');
    if(!name) {
      router.push('/login'); // 1. KAMA HAIPO NENDA LOGIN
    } else {
      setMyName(name);
      supabase.from('users').upsert({ username: name, last_seen: new Date() });
      loadChats();
      getTotalUsers();
    }
  }, [router]);

  const getTotalUsers = async () => {
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if(count!== null) setTotalUsers(count);
  }

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
    const usernameToAdd = search.trim().toLowerCase(); // 2. TUNAFANYA NI NDOGO ZOTE

    if(usernameToAdd === myName) {
      setError("Huwawezi kujiongeza mwenyewe 😅");
      setLoading(false);
      return;
    }

    const { data, error: supaError } = await supabase.from('users').select('username').eq('username', usernameToAdd).single();

    if(supaError && supaError.code!== 'PGRST116'){
      setError("Kuna tatizo la mtandao. Jaribu tena");
      setLoading(false);
      return;
    }

    if(data) {
      const key = `chat_${usernameToAdd}`;
      if(!localStorage.getItem(key)) {
        localStorage.setItem(key, '[]');
      }
      loadChats();
      router.push(`/chat/${usernameToAdd}`);
    } else {
      setError(`@${usernameToAdd} hayupo kwenye Mychatapp.`);
    }
    setLoading(false);
    setSearch('');
  };

  const handleLogout = () => { // 3. FUNCTION MPYA YA KUTOKA
    localStorage.removeItem('my_username');
    router.push('/login');
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-500 text-white p-4 shadow-md flex justify-between items-center"> {/* 4. IMEONGWA FLEX */}
        <div>
          <h1 className="text-2xl font-bold">Mychatapp</h1>
          <p className="text-sm opacity-80">@{myName} • Watumiaji: {totalUsers}</p>
        </div>
        <button onClick={handleLogout} className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30">
          Toka {/* 4. BUTTON YA LOGOUT */}
        </button>
      </div>

      <div className="p-3 bg-white border-b">
        <div className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Andika @username kuongeza mtu..." className="flex-1 p-3 border rounded-full outline-none focus:border-blue-500"/>
          <button onClick={handleSearch} disabled={loading} className="bg-blue-500 text-white px-5 rounded-full font-bold disabled:bg-gray-400 text-xl">{loading? '...' : '+'}</button>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="text-gray-500 text-xs px-4 pt-3 pb-1">Mazungumzo Yako</p>
        {chatList.length === 1 && (
          <p className="text-center text-gray-400 mt-10">Bado huna chats. Tafuta @username kuongeza mtu</p>
        )}
        {chatList.map(contact => (
          <div key={contact.name} onClick={() => router.push(`/chat/${contact.name}`)} className="flex items-center gap-3 p-4 bg-white border-b hover:bg-gray-50 cursor-pointer">
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
