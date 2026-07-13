'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if(!username.trim() ||!password.trim()) {
      setError("Tafadhali jaza username na password");
      return;
    }
    setLoading(true);
    setError('');
    const cleanUsername = username.toLowerCase().trim();

    if(isSignup) {
      // 1. JISAJILI MTU MPYA
      const { error } = await supabase.from('users').insert({
        username: cleanUsername,
        password // Kwa sasa tunaweka direct. Baadae tutaificha
      });

      if(error) {
        if(error.code === '23505') setError(`@${cleanUsername} tayari yupo. Jaribu jina lingine 😅`);
        else setError("Kuna tatizo. Jaribu tena");
      } else {
        localStorage.setItem('my_username', cleanUsername);
        router.push('/');
      }
    } else {
      // 2. INGA KAMA UNA ACCOUNT
      const { data, error } = await supabase
       .from('users')
       .select('password')
       .eq('username', cleanUsername)
       .single();

      if(error ||!data) {
        setError("Huyu @username hayupo");
      } else if(data.password!== password) {
        setError("Password si sahihi");
      } else {
        localStorage.setItem('my_username', cleanUsername);
        router.push('/');
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-6">
        {/* LOGO */}
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">Mychatapp</h1>
        <p className="text-center text-gray-500 mb-8">{isSignup? 'Tengeneza akaunti mpya' : 'Karibu tena'}</p>

        {/* FORM */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full p-3 border rounded-lg mb-4 outline-none focus:border-blue-500"
          />

          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold text-lg disabled:bg-gray-400 hover:bg-blue-600"
          >
            {loading? 'Tafadhari...' : isSignup? 'Jisajili' : 'Ingia'}
          </button>

          {/* KUBADILISHA KATI YA LOGIN NA SIGNUP */}
          <p
            onClick={() => {setIsSignup(!isSignup); setError('');}}
            className="text-center text-sm text-blue-500 mt-4 cursor-pointer hover:underline"
          >
            {isSignup? 'Tayari una account? Ingia' : 'Huna account? Jisajili hapa'}
          </p>
        </div>
      </div>
    </div>
  );
}
