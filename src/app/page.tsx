'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
}

interface BotConfig {
  name: string;
  greeting: string;
  placeholder: string;
}

export default function ChatPublic() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConfig = async () => {
    const res = await fetch('/api/bot/config');
    const data = await res.json();
    setConfig(data);
    return data;
  };

  const startNewConversation = async () => {
    const configData = await loadConfig();
    setMessages([{
      id: Date.now().toString(),
      role: 'bot',
      content: configData.greeting,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  useEffect(() => {
    loadConfig().then(data => {
      setMessages([{
        id: Date.now().toString(),
        role: 'bot',
        content: data.greeting,
        time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
      }]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Get response from API
    const res = await fetch('/api/bot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: currentInput })
    });
    const data = await res.json();

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      content: data.response,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="text-white text-lg">Conectando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">{config?.name || 'Asistente'}</h1>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                En línea
              </p>
            </div>
          </div>
          {/* Botón nueva conversación */}
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Nueva conversación"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Nueva</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-md'
                  : 'bg-slate-700 text-white rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                {msg.time}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={config?.placeholder || 'Escribe tu mensaje...'}
            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Enlace al admin */}
        <div className="text-center mt-3">
          <a href="/admin" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
            ⚙️ Admin
          </a>
        </div>
      </footer>
    </div>
  );
}
