import React, { useEffect, useRef, useState } from 'react';
import { Send, X, Sparkles, Bot, RotateCcw } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import { ChatbotMessage, ChatbotOption } from '../../types/chatbot.types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface HelpBotPanelProps {
  tableId: string;
  messages: ChatbotMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatbotMessage[]>>;
  onClearMessages: () => void;
  onClose: () => void;
}

const makeId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const HelpBotPanel: React.FC<HelpBotPanelProps> = ({
  tableId,
  messages,
  setMessages,
  onClearMessages,
  onClose,
}) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useBodyScrollLock(isMobile);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (rawText: string, pickedLabel?: string) => {
    const text = rawText.trim();
    if (!text || isSending) return;

    const typingId = makeId();
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'user', text },
      { id: typingId, role: 'bot', text: '', isTyping: true },
    ]);
    setInput('');
    setIsSending(true);

    try {
      const res = await chatbotService.ask(text, tableId);
      const quickOptions = res.quickOptions?.filter((o) => o.label !== pickedLabel);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        { id: makeId(), role: 'bot', text: res.reply, quickOptions },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        {
          id: makeId(),
          role: 'bot',
          text: 'Sorry, I could not reach the assistant right now. Please check your connection and try again.',
          quickOptions: [{ label: 'Try Again', query: text }],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Dark Backdrop Overlay (Mobile Only < 640px) */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm block sm:hidden animate-in fade-in duration-200"
      />

      {/* Main Chatbot Panel (Bottom Sheet on Mobile, Floating Widget on Desktop) */}
      <div className="fixed inset-x-0 bottom-0 sm:bottom-20 sm:right-6 sm:left-auto z-50 w-full sm:w-[400px] h-[85vh] sm:h-[550px] max-h-[90vh] flex flex-col bg-gradient-to-b from-aura-obsidian via-aura-container to-aura-obsidian border-t sm:border border-aura-gold/40 rounded-t-3xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-250">
        
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-aura-gold/40 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-aura-obsidian/90 border-b border-aura-gold/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aura-gold via-amber-400 to-aura-gold p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-aura-obsidian rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-aura-gold" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-aura-obsidian rounded-full animate-pulse" />
            </div>

            <div>
              <h3 className="font-serif text-sm font-bold text-aura-ivory tracking-wide flex items-center space-x-1.5">
                <span>AURA Sommelier AI</span>
                <Sparkles className="w-3.5 h-3.5 text-aura-gold animate-spin-slow" />
              </h3>
              <p className="text-[10px] text-aura-gold font-mono font-bold uppercase tracking-wider">
                Table {tableId} • 5-Star Master Sommelier
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onClearMessages}
              className="p-1.5 text-aura-slate hover:text-aura-gold rounded-full hover:bg-white/10 transition-colors"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-white/10 transition-colors"
              title="Close Concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
          {messages.map((msg) =>
            msg.isTyping ? (
              <div key={msg.id} className="flex items-center space-x-2 py-2.5 px-4 bg-aura-container border border-aura-gold/30 rounded-2xl rounded-bl-sm w-24 shadow-md">
                <Bot className="w-4 h-4 text-aura-gold animate-bounce" />
                <span className="w-1.5 h-1.5 bg-aura-gold rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 bg-aura-gold rounded-full animate-bounce [animation-delay:240ms]" />
              </div>
            ) : msg.role === 'bot' ? (
              <div key={msg.id} className="space-y-2.5 max-w-[95%]">
                <div className="py-3 px-4 bg-aura-obsidian/95 border-l-4 border-l-aura-gold border border-aura-border/80 rounded-2xl rounded-bl-sm text-xs text-aura-ivory leading-relaxed whitespace-pre-line shadow-lg">
                  {msg.text}
                </div>
                {msg.quickOptions && msg.quickOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.quickOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => sendMessage(opt.query, opt.label)}
                        className="px-3 py-1.5 bg-aura-gold/10 border border-aura-gold/30 hover:border-aura-gold hover:bg-aura-gold hover:text-aura-obsidian text-aura-gold text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={msg.id} className="py-2.5 px-4 bg-gradient-to-r from-aura-gold to-amber-500 text-aura-obsidian font-bold rounded-2xl rounded-br-sm text-xs ml-auto max-w-[85%] shadow-xl">
                {msg.text}
              </div>
            )
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-aura-container/95 border-t border-aura-gold/20 shrink-0">
          <div className="flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about menu, prices, coupons, dietary options..."
              className="flex-1 px-4 py-2.5 bg-aura-obsidian border border-aura-border/80 focus:border-aura-gold text-aura-ivory text-xs rounded-2xl outline-none placeholder:text-aura-slate shadow-inner"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isSending || !input.trim()}
              className="p-2.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian rounded-2xl disabled:opacity-40 transition-all hover:scale-105 cursor-pointer disabled:cursor-not-allowed shadow-md"
              title="Send Message"
            >
              <Send className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
