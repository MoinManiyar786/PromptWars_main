'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { askAssistantAction } from '@/app/actions';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `Hello! I am your AI Monsoon Safety Assistant. I can speak and understand many languages. 

Ask me anything about storm safety, how to prepare, dealing with floods, or general safety tips. For example:
- *What should I do during a lightning strike?*
- *How can I prevent waterborne diseases in the monsoon?*
- *What belongs in a family disaster kit?*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    // Format chat history for Gemini SDK
    // The SDK requires history format: { role: 'user' | 'model', parts: [{ text: string }] }[]
    const formattedHistory = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    try {
      const res = await askAssistantAction(textToSend, formattedHistory);
      if (res.success && res.reply) {
        setMessages(prev => [...prev, { role: 'model', content: res.reply || '' }]);
      } else {
        setError(res.error || 'Failed to get safety advice');
      }
    } catch {
      setError('An error occurred during chat transmission.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const samplePrompts = [
    "Lightning safety rules",
    "Flood emergency kit check",
    "Handling electric hazards in wet areas",
    "Rainwater disease prevention"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
      {/* Informative Side Panel */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Smart Assistant</h3>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed">
            Powered by Gemini, this assistant operates in real-time. It detects the language of your query and replies accordingly.
          </p>

          <div className="mt-6">
            <h4 className="text-xs font-semibold text-slate-400 mb-3">Quick Queries</h4>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-[11px] text-slate-300 px-3 py-1.5 rounded-xl transition-all text-left w-full disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-2xl flex gap-2.5 mt-6">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-350 leading-normal">
            For critical updates, prioritize instructions from disaster control authorities.
          </p>
        </div>
      </div>

      {/* Main Chat Screen */}
      <div className="lg:col-span-3 flex flex-col bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 p-4 bg-slate-900/30">
          <Bot className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Monsoon HelpBot</h3>
            <p className="text-[10px] text-slate-500 font-medium">GenAI Safety Assistant</p>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[340px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-cyan-600/30 border border-cyan-500' : 'bg-slate-950/80 border border-slate-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-cyan-400" />
                ) : (
                  <Bot className="h-4 w-4 text-cyan-450" />
                )}
              </div>
              <div
                className={`rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-605 text-white rounded-tr-none'
                    : 'bg-slate-950/60 border border-slate-850 text-slate-300 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert prose-xs">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-cyan-450" />
              </div>
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
                <span className="text-xs text-slate-450">Formulating response...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-800/65 p-3 rounded-xl max-w-[85%]">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="border-t border-slate-800 p-4 bg-slate-950/50 flex gap-2">
          <label htmlFor="chat-assistant-input" className="sr-only">Type your safety question</label>
          <input
            id="chat-assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your safety question (e.g., 'where to stand during lightning' or in Hindi)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-550 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
