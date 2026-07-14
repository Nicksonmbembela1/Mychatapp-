'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, formatEmail } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    const email = formatEmail(username);

    if (isLogin) {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/');
    } else {
      // REGISTER
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // Tuhifadhi profile na username
        await supabase.from('profiles').insert({ id: username.toLowerCase() });
        // Tumuwekee NICK AI moja kwa moja
        await supabase.from('profiles').upsert({ id: 'nick_ai', full_name: 'NICK AI' });
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Mychatapp</h1>
        <div className="space-y-4">
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-lg"/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg"/>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold disabled:bg-gray-400">
            {loading? '...' : isLogin? 'Ingia' : 'Jisajili'}
          </button>
          <p className="text-center text-sm cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
            {isLogin? 'Huna account? Jisajili' : 'Una account? Ingia'}
          </p>
        </div>
      </div>
    </div>
  );
}
