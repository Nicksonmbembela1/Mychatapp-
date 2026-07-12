'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { askAI } from '@/lib/aiClient';

type Message = { id: string; role: 'user' | 'ai'; content: string; created_at: string; };

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `chat_${username}`; // Kila mtu ana key yake

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load kutoka LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setMessages(JSON.parse(saved));
  }, [storageKey]);

  // Save kila ujumbe ukiingia
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (username === 'NICK AI') {
      const aiResponse = await askAI(input, 'NICK');
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'ai', content: aiResponse, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    }
    setLoading(false);
  };

  //...hii yote iliyobaki ya UI iwe vilevile
}
