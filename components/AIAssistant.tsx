
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Terminal, Activity, Zap } from 'lucide-react';
import { AIService } from '../services/ai';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, currentBalance }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Kernel NovaBev v3.1 Online. Como posso auxiliar na sua operação hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const aiResponse = await AIService.getOperationalInsight(userMsg, {
      products: MOCK_PRODUCTS as Product[],
      currentBalance
    });

    setMessages(prev => [...prev, { role: 'ai', text: aiResponse || 'Protocolo interrompido.' }]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-24 w-96 h-[600px] z-[100] glass-panel rounded-3xl border border-accent/30 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-500">
      <div className="p-4 bg-dark-950/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg text-accent animate-pulse">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">AI Command Center</h3>
            <p className="text-[8px] text-slate-500 font-mono">NEURAL LINK ACTIVE</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-accent p-1"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              m.role === 'user' 
                ? 'bg-accent/10 border border-accent/20 text-slate-200' 
                : 'bg-dark-900 border border-white/5 text-accent font-mono'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-dark-900 border border-white/5 p-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-dark-950/50">
        <div className="relative">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua consulta operacional..."
            className="w-full bg-dark-900 border border-white/10 rounded-xl py-3 px-4 pr-12 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent/40"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:scale-110 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      <div className="border-animation absolute bottom-0 left-0 w-full" />
    </div>
  );
};
