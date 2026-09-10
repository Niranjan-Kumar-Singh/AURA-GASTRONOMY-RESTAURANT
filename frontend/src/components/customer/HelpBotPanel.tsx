import React, { useEffect, useRef, useState } from 'react';
import { Send, X, Sparkles, Bot, RotateCcw } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import { ChatbotMessage, ChatbotOption } from '../../types/chatbot.types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { motion } from 'framer-motion';

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
  useBackHandler(true, onClose);
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
      <motion.div 
        key="bot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm block sm:hidden"
      />

      {/* Main Chatbot Panel (Bottom Sheet on Mobile, Floating Widget on Desktop) */}
      <motion.div
        key="bot-panel"
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 sm:bottom-20 sm:right-6 sm:left-auto z-[70] w-full sm:w-[400px] h-[85vh] sm:h-[550px] max-h-[90vh] flex flex-col bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-800"
      >
        
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-emerald-50/90 border-b border-emerald-200/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0C831F] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#0C831F]" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-1.5">
                <span>AURA Food Concierge</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Table {tableId} • Smart Dining Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onClearMessages}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-emerald-100/50 transition-colors cursor-pointer"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-emerald-100/50 transition-colors cursor-pointer"
              title="Close Concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60 custom-scrollbar">
          {messages.map((msg) =>
            msg.isTyping ? (
              <div key={msg.id} className="flex items-center space-x-2 py-2.5 px-4 bg-white border border-slate-200 rounded-2xl rounded-bl-sm w-24 shadow-sm">
                <Bot className="w-4 h-4 text-[#0C831F] animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#0C831F] rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="w-1.5 h-1.5 bg-[#0C831F] rounded-full animate-bounce [animation-delay:240ms]" />
              </div>
            ) : msg.role === 'bot' ? (
              <div key={msg.id} className="space-y-2.5 max-w-[95%]">
                <div className="py-3 px-4 bg-white border border-slate-200/90 rounded-2xl rounded-bl-sm text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-sm">
                  {msg.text}
                </div>
                {msg.quickOptions && msg.quickOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.quickOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => sendMessage(opt.query, opt.label)}
                        className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:border-[#0C831F] hover:bg-[#0C831F] hover:text-white text-emerald-800 text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={msg.id} className="py-2.5 px-4 bg-[#0C831F] text-white font-bold rounded-2xl rounded-br-sm text-xs ml-auto max-w-[85%] shadow-sm">
                {msg.text}
              </div>
            )
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about menu, prices, coupons, dietary options..."
              className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 focus:border-[#0C831F] focus:bg-white text-slate-900 text-xs rounded-2xl outline-none placeholder:text-slate-400 shadow-inner"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isSending || !input.trim()}
              className="p-2.5 bg-[#0C831F] hover:bg-[#096918] text-white rounded-2xl disabled:opacity-40 transition-all hover:scale-105 cursor-pointer disabled:cursor-not-allowed shadow-md"
              title="Send Message"
            >
              <Send className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
