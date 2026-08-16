import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { HelpBotPanel } from './HelpBotPanel';

interface HelpBotLauncherProps {
  tableId?: string;
}

export const HelpBotLauncher: React.FC<HelpBotLauncherProps> = ({ tableId = '14' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating launcher, sits just above the Call Waiter button (bottom-20 right-4) */}
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-40 right-4 z-40 p-3 bg-aura-container border border-aura-gold/40 hover:border-aura-gold text-aura-gold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        title="Ask AURA Assistant"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        <span className="text-xs hidden sm:inline uppercase font-bold tracking-wider">Help</span>
      </button>

      {isOpen && <HelpBotPanel tableId={tableId} onClose={() => setIsOpen(false)} />}
    </>
  );
};
