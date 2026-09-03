import React, { useState, useEffect } from 'react';
import { X, Tag, Copy, Loader } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { couponService } from '../../services/coupon.service';
import { Coupon } from '../../types/menu.types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';

interface OffersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OffersDrawer: React.FC<OffersDrawerProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAllCoupons();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load Offers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Code ${code} copied to clipboard!`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-aura-obsidian border-l border-aura-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative"
      >
        <div className="p-6 border-b border-aura-border flex items-center justify-between bg-aura-container">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-aura-ivory">Active Offers</h2>
              <p className="text-xs text-aura-slate">Exclusive member benefits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-[#38BDF8]" /></div>
          ) : (
            offers.map((offer, i) => (
              <div key={i} className="relative bg-aura-container border border-[#38BDF8]/20 hover:border-[#38BDF8]/50 transition-all rounded-2xl p-5 overflow-hidden group shadow-lg">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#38BDF8]/10 rounded-full blur-xl group-hover:bg-[#38BDF8]/20 transition-all" />
                <h3 className="font-serif font-bold text-lg text-white mb-1">{offer.description}</h3>
                <p className="text-[10px] text-aura-slate uppercase tracking-wider mb-4">Min Order: ₹{offer.minOrderAmount}</p>
                
                <div className="flex items-center justify-between bg-[#090A0F] border border-[#38BDF8]/30 rounded-xl p-1 pl-4">
                  <span className="font-mono font-bold text-[#38BDF8] tracking-widest">{offer.code}</span>
                  <button 
                    onClick={() => handleCopy(offer.code)}
                    className="bg-[#38BDF8]/15 hover:bg-[#0EA5E9] hover:text-[#090A0F] text-[#38BDF8] border border-[#38BDF8]/40 p-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Copy</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
