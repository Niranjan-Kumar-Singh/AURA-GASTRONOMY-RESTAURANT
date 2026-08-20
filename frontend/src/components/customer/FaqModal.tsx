import React, { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { contentService } from '../../services/content.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  const [faqs, setFaqs] = useState<{question: string, answer: string, category: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    if (isOpen) {
      fetchFaqs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await contentService.getFaqs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-aura-obsidian border border-aura-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-aura-border flex items-center justify-between bg-aura-container">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-aura-ivory">FAQs & Support</h2>
              <p className="text-xs text-aura-slate">How can we assist you?</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-aura-gold" /></div>
          ) : (
            faqs.map((faq, i) => (
              <div 
                key={i} 
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="bg-aura-container border border-aura-border rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-aura-gold/40"
              >
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-aura-ivory pr-4">{faq.question}</h3>
                  {openIdx === i ? <ChevronUp className="w-4 h-4 text-aura-gold shrink-0" /> : <ChevronDown className="w-4 h-4 text-aura-slate shrink-0" />}
                </div>
                {openIdx === i && (
                  <div className="px-4 pb-4 text-xs text-aura-slate leading-relaxed border-t border-aura-border/40 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
          
          <div className="mt-8 p-4 bg-aura-gold/5 border border-aura-gold/20 rounded-2xl text-center space-y-2">
            <p className="text-xs text-aura-ivory font-bold uppercase tracking-wider">Need immediate help?</p>
            <p className="text-lg font-mono text-aura-gold">+91 80 4912 3456</p>
            <p className="text-[10px] text-aura-slate">support@auradining.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
