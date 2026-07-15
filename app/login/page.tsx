'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')

  const login = async () => {
    await supabase.auth.signInWithOtp({ email })
    alert('Angalia email yako kwa link ya kuingia')
  }

  return (
    <div style={{padding: 20, textAlign: 'center'}}>
      <h1>Mychatapp 🔥</h1>
      <input 
        type="email" 
        placeholder="Weka email yako"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{padding: 10, width: '80%'}}
      />
      <button onClick={login} style={{padding: 10, marginTop: 10}}>
        Ingia
      </button>
    </div>
  )
}
