import React, { useState, useEffect } from 'react';
import { X, Heart, Star, Plus, Loader } from 'lucide-react';
import { contentService } from '../../services/content.service';
import { useAuthStore } from '../../store/use-auth-store';
import { useCartStore } from '../../store/use-cart-store';
import { MenuItem } from '../../types/menu.types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {

  const [wishlist, setWishlist] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await contentService.getWishlist(user._id);
      setWishlist(data);
    } catch (error) {
      console.error('Failed to load wishlist', error);
    } finally {
      setLoading(false);
    }
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
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-aura-ivory">Saved Wishlist</h2>
              <p className="text-xs text-aura-slate">{wishlist.length} dishes saved</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-aura-gold" /></div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-20 text-aura-slate text-sm">Your wishlist is empty.</div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-aura-container border border-aura-border flex items-center space-x-4 hover:border-aura-gold/40 transition-colors group">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-aura-ivory">{item.name}</h3>
                  <div className="flex items-center space-x-1 text-amber-400 mt-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="text-[10px] font-bold">{item.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-sm font-bold text-aura-gold">₹{item.price}</span>
                    <button 
                      onClick={() => addItem(item, 1)}
                      className="p-1.5 rounded-lg bg-aura-obsidian hover:bg-aura-gold hover:text-aura-obsidian text-aura-gold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
