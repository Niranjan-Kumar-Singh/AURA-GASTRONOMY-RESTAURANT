import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { HelpBotPanel } from './HelpBotPanel';
import { ChatbotMessage, ChatbotOption } from '../../types/chatbot.types';
import { useCartStore } from '../../store/use-cart-store';

interface HelpBotLauncherProps {
  tableId?: string;
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

export const HelpBotLauncher: React.FC<HelpBotLauncherProps> = ({ tableId = '14' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasCart = itemCount > 0;
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => {
    const stored = sessionStorage.getItem('aura_chat_messages');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback to initial message
      }
    }
    return [
      {
        id: makeId(),
        role: 'bot',
        text: `Namaste! I'm AURA's Virtual Concierge for Table ${tableId}. I can assist with signature recommendations, live dish pricing, dietary preferences, active offers, or table service.`,
        quickOptions: INITIAL_OPTIONS,
      },
    ];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('aura_chat_messages', JSON.stringify(messages));
    } catch (e) {
      // Ignore storage errors
    }
  }, [messages]);

  const handleClearMessages = () => {
    const resetMsg: ChatbotMessage[] = [
      {
        id: makeId(),
        role: 'bot',
        text: `Chat cleared! Namaste! I'm AURA's Virtual Concierge for Table ${tableId}. How may I help you?`,
        quickOptions: INITIAL_OPTIONS,
      },
    ];
    setMessages(resetMsg);
    sessionStorage.setItem('aura_chat_messages', JSON.stringify(resetMsg));
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen((open) => !open)}
        className={`fixed z-40 p-2.5 sm:p-3.5 bg-[#10131E] border-2 border-[#38BDF8] hover:border-[#7DD3FC] text-[#38BDF8] rounded-full shadow-[0_4px_20px_rgba(56,189,248,0.3)] hover:shadow-[0_6px_25px_rgba(56,189,248,0.45)] transition-all duration-300 hover:scale-105 flex items-center space-x-2 cursor-pointer backdrop-blur-xl ${
          hasCart
            ? 'bottom-32 right-4 sm:bottom-20 sm:right-6'
            : 'bottom-17 right-4 sm:bottom-20 sm:right-6'
        }`}
        title="Ask AURA Sommelier AI"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-[#38BDF8]" />}
        <span className="text-xs hidden sm:inline uppercase font-bold tracking-wider text-[#7DD3FC]">AI Concierge</span>
      </button>

      {isOpen && (
        <HelpBotPanel
          tableId={tableId}
          messages={messages}
          setMessages={setMessages}
          onClearMessages={handleClearMessages}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
