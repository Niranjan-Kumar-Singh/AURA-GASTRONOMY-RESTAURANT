import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Heart, Star, Sparkles, Flame, Zap, Check, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { useToast } from '../feedback/ToastContainer';
import { motion } from 'framer-motion';

interface DishCardProps {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  onClick: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onAdd, onClick }) => {
  const { showToast } = useToast();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const isLiked = isWishlisted(item.id);
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const cartItem = items.find((it) => it.menuItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(item);
    showToast(
      added ? `Added "${item.name}" to Saved Wishlist` : `Removed "${item.name}" from Wishlist`,
      added ? 'success' : 'info'
    );
  };

  // Original price calculation for strikethrough retail discount feel
  const originalPrice = Math.round(item.price * 1.22);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      onClick={() => onClick(item)}
      className="bg-white border border-slate-300 hover:border-[#0C831F] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_20px_rgba(12,131,31,0.12)] group relative transition-all duration-200 hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative h-28 sm:h-48 w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200/70 animate-pulse" />
        )}
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Out of Stock Overlay */}
        {item.isAvailable === false && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-2.5 py-1 bg-c-danger text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase rounded-full shadow-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Veg / Non-Veg Indicator & Special Badges (Top Left) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center space-x-1 sm:space-x-1.5 z-10">
          <span
            className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-md border-2 flex items-center justify-center bg-white/95 backdrop-blur-md shadow-xs ${
              item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </span>

          {item.isChefSpecial && (
            <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md bg-c-accent text-slate-900 flex items-center space-x-0.5 sm:space-x-1 shadow-xs tracking-tight">
              <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-slate-900" />
              <span>SPECIAL</span>
            </span>
          )}

          {item.isBestSeller && !item.isChefSpecial && (
            <span className="text-[8px] sm:text-[9px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md bg-c-primary text-white shadow-xs tracking-tight">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Top Right Controls (Wishlist) */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex items-center space-x-1 z-10">
          <button
            onClick={handleToggleLike}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md shadow-xs border transition-all flex items-center justify-center cursor-pointer active:scale-75 ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/25 scale-105'
                : 'bg-white/90 hover:bg-white text-slate-600 border-slate-200/80 hover:text-rose-500'
            }`}
            title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dish Content Body */}
      <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-c-primary transition-colors line-clamp-1 sm:line-clamp-2 leading-tight min-h-[16px] sm:min-h-[36px]">
              {item.name}
            </h3>
          </div>

          {/* Hide long description on mobile screen to keep 2-column cards clean & balanced */}
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed hidden sm:block">
            {item.description}
          </p>

          {/* Applied Add-ons Badge Preview */}
          {cartItem?.addonNames && cartItem.addonNames.length > 0 && (
            <div className="flex items-center space-x-1 text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200">
              <Sparkles className="w-2.5 h-2.5 text-[#0C831F] shrink-0" />
              <span className="truncate">Add-ons: {cartItem.addonNames.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Metadata & Rating Row */}
        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
          <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 font-bold border border-amber-200/60 shrink-0">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{item.rating || 4.8}</span>
            <span className="text-[9px] text-amber-700 font-normal hidden sm:inline">({item.reviewCount || 95})</span>
          </div>

          <span className="inline-flex items-center space-x-0.5 text-slate-500 font-semibold">
            <Zap className="w-2.5 h-2.5 text-[#0C831F]" />
            <span>{item.preparationTimeMinutes || 15}m</span>
          </span>

          {item.calories && (
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              {item.calories} kcal
            </span>
          )}

          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <div className="flex items-center space-x-0.5 shrink-0" title={`Spice: ${item.spiceLevel}/3`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Row: Price & Blinkit ADD Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="flex flex-col min-w-0 pr-1 shrink-0">
            <div className="flex items-baseline space-x-1 flex-wrap">
              <span className="text-xs sm:text-base font-black text-slate-900 font-mono leading-tight">
                ₹{item.price}
              </span>
              <span className="text-[9px] sm:text-xs text-slate-400 line-through font-mono leading-tight">
                ₹{originalPrice}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-[#0C831F] font-bold uppercase tracking-tight leading-none mt-0.5">
              {Math.round(((originalPrice - item.price) / originalPrice) * 100)}% OFF
            </span>
          </div>

          {/* Right Action: Direct Stepper if in Cart, else View & Add */}
          <div className="shrink-0 flex items-center">
            {item.isAvailable === false ? (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-400 font-bold text-[9px] sm:text-[10px] rounded-lg uppercase">
                Unavailable
              </span>
            ) : quantity > 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-[#0C831F] text-white px-1.5 sm:px-2 py-1 rounded-xl shadow-xs"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(item.id, quantity - 1);
                  }}
                  className="w-5 h-5 sm:w-6 sm:h-6 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  title="Decrease quantity"
                >
                  <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
                <span className="font-mono font-black text-xs sm:text-sm min-w-[18px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(item.id, quantity + 1);
                  }}
                  className="w-5 h-5 sm:w-6 sm:h-6 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onClick(item)}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-all flex items-center space-x-1 bg-[#0C831F] hover:bg-[#096918] text-white shadow-xs hover:shadow-md active:scale-95 cursor-pointer shrink-0 group/btn"
                title="View dish details, chef pairings & add to order"
              >
                <span>View &amp; Add</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default DishCard;
