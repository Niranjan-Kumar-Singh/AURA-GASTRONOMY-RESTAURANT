import React, { useEffect, useRef, useState } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import { ChatbotMessage, ChatbotOption } from '../../types/chatbot.types';

interface HelpBotPanelProps {
  tableId: string;
  onClose: () => void;
}

const INITIAL_OPTIONS: ChatbotOption[] = [
  { label: "Today's Specials & Chef Picks", query: "What are today's specials and chef recommendations?" },
  { label: 'Menu & Cuisine Details', query: 'Tell me about the menu and cuisine' },
  { label: 'Pricing & Best Value', query: 'Show me pricing and best value combos' },
  { label: 'Dietary & Allergen Info', query: 'Do you have vegetarian, Jain and gluten-free options?' },
  { label: 'Spice Levels & Customizations', query: 'Tell me about spice levels and customizations' },
  { label: 'Reservations & Booking', query: 'How do I make a reservation?' },
  { label: 'Hours, Parking & Policies', query: 'What are your hours, parking and policies?' },
  { label: 'Talk to a Waiter', query: 'I want to talk to a human waiter' },
];

const makeId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const HelpBotPanel: React.FC<HelpBotPanelProps> = ({ tableId, onClose }) => {
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => [
    {
      id: makeId(),
      role: 'bot',
      text: `Namaste! I'm AURA's virtual assistant for Table ${tableId}. I can help you with our cuisine, pricing, dietary options, offers and more. What would you like to know?`,
      quickOptions: INITIAL_OPTIONS,
    },
  ]);
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
    <div className="fixed bottom-56 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] flex flex-col bg-aura-container border border-aura-gold/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-aura-obsidian border-b border-aura-gold/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-aura-gold/10 border border-aura-gold/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-aura-gold" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-aura-ivory">AURA Assistant</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-wider">Table {tableId}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-white/10"
          title="Close Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 max-h-72">
        {messages.map((msg) =>
          msg.isTyping ? (
            <div key={msg.id} className="flex items-center space-x-1.5 py-1.5 px-3 bg-aura-obsidian border border-aura-border/60 rounded-2xl rounded-bl-sm w-16">
              <span className="w-1.5 h-1.5 bg-aura-gold rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-aura-gold rounded-full animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 bg-aura-gold rounded-full animate-bounce [animation-delay:240ms]" />
            </div>
          ) : msg.role === 'bot' ? (
            <div key={msg.id} className="space-y-2">
              <div className="py-2 px-3 bg-aura-obsidian border border-aura-border/60 rounded-2xl rounded-bl-sm text-xs text-aura-ivory leading-relaxed whitespace-pre-line">
                {msg.text}
              </div>
              {msg.quickOptions && msg.quickOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.quickOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => sendMessage(opt.query, opt.label)}
                      className="px-2.5 py-1.5 bg-aura-gold/10 border border-aura-gold/30 hover:border-aura-gold text-aura-gold text-[11px] font-bold rounded-full transition-colors cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div key={msg.id} className="py-2 px-3 bg-aura-gold/15 border border-aura-gold/30 rounded-2xl rounded-br-sm text-xs text-aura-ivory ml-8">
              {msg.text}
            </div>
          )
        )}
      </div>

      {/* Input */}
      <div className="flex items-center space-x-2 p-3 border-t border-aura-border/60 bg-aura-obsidian/50">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about dishes, prices, offers..."
          className="flex-1 px-3 py-2 bg-aura-obsidian border border-aura-border/60 focus:border-aura-gold text-aura-ivory text-xs rounded-xl outline-none placeholder:text-aura-slate"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isSending || !input.trim()}
          className="p-2.5 bg-aura-gold text-aura-obsidian rounded-xl disabled:opacity-40 transition-all hover:scale-105 cursor-pointer disabled:cursor-not-allowed"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
