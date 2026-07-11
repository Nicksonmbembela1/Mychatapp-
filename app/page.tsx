'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const handleStart = () => {
    if (username.trim() === '') {
      alert('Tafadhali andika username yako')
      return
    }
    router.push(`/chat/${username}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <img src="/icon.png" alt="Mychatapp" className="w-20 h-20 rounded-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Karibu Mychatapp</h1>
        <p className="text-center text-gray-500 mb-6">Ongea na NICK AI na marafiki</p>
        
        <input
          type="text"
          placeholder="Ingiza username yako"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button
          onClick={handleStart}
          className="w-full rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700"
        >
          Anza Kuzungumza
        </button>
      </div>
    </main>
  )
}
