import React from 'react';
import { X, Heart, Star, Plus, Trash2, Eye } from 'lucide-react';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { useCartStore } from '../../store/use-cart-store';
import { useToast } from '../feedback/ToastContainer';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { MenuItem } from '../../types/menu.types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish?: (item: MenuItem) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose, onSelectDish }) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { wishlist, toggleWishlist, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    addItem(item, 1);
    showToast(`Added "${item.name}" to Table Cart`, 'success');
  };

  const handleRemoveItem = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    toggleWishlist(item);
    showToast(`Removed "${item.name}" from Wishlist`, 'info');
  };

  const handleItemClick = (item: MenuItem) => {
    if (onSelectDish) {
      onSelectDish(item);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-aura-obsidian border-l border-aura-border/80 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-aura-border/80 flex items-center justify-between bg-aura-container">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-aura-ivory">Saved Wishlist</h2>
              <p className="text-xs text-aura-slate">{wishlist.length} {wishlist.length === 1 ? 'dish' : 'dishes'} saved</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-[10px] font-bold font-mono px-2.5 py-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 transition-colors"
                title="Clear All Wishlist Items"
              >
                Clear All
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 bg-aura-obsidian hover:bg-black rounded-xl text-aura-ivory transition-colors border border-aura-border/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {wishlist.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-aura-container/30 rounded-3xl border border-aura-border/50 p-8 max-w-sm mx-auto my-auto">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-aura-ivory">Your Wishlist is Empty</h3>
                <p className="text-xs text-aura-slate mt-1 leading-relaxed">
                  Tap the heart icon ❤️ on any dish card to bookmark your favorite culinary creations!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="p-3 rounded-2xl bg-aura-container border border-[#38BDF8]/20 flex items-center space-x-3.5 hover:border-[#38BDF8]/60 transition-all shadow-md group cursor-pointer active:scale-[0.99]"
                title="Tap to view dish details & add-ons"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-xl object-cover border border-[#38BDF8]/20 shrink-0 group-hover:scale-105 transition-transform" 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#38BDF8] transition-colors">
                      {item.name}
                    </h3>
                    <Eye className="w-3.5 h-3.5 text-aura-slate opacity-0 group-hover:opacity-100 transition-opacity text-[#38BDF8] shrink-0" />
                  </div>

                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-aura-slate">
                    <div className="flex items-center space-x-1 text-[#38BDF8] font-bold">
                      <Star className="w-3 h-3 fill-[#38BDF8] text-[#38BDF8]" />
                      <span>{item.rating || 4.9}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-[#38BDF8] font-bold">₹{item.price}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#38BDF8]/20">
                    <button
                      onClick={(e) => handleRemoveItem(e, item)}
                      className="p-1 text-aura-slate hover:text-rose-400 transition-colors flex items-center space-x-1 text-[10px]"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>

                    <button 
                      onClick={(e) => handleAddToCart(e, item)}
                      className="px-3 py-1.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-[11px] flex items-center space-x-1 shadow-md transition-transform active:scale-95 cursor-pointer border border-[#7DD3FC]/50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add To Cart</span>
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
