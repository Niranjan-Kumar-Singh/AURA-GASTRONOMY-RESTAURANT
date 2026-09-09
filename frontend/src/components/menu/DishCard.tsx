import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Heart, Plus, Minus, Star, Sparkles, Flame, Eye } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { useToast } from '../feedback/ToastContainer';
import { motion } from 'framer-motion';

interface DishCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onClick: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onAdd, onClick }) => {
  const { showToast } = useToast();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const isLiked = isWishlisted(item.id);
  const { items, addItem, updateQuantity } = useCartStore();

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
      className="bg-white border border-slate-200/90 hover:border-[#0C831F]/50 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(12,131,31,0.12)] group relative transition-all duration-200 hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative h-36 sm:h-48 w-full bg-slate-100/80 overflow-hidden">
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
            <span className="px-2.5 py-1 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase rounded-full shadow-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Veg / Non-Veg Indicator & Special Badges (Top Left) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center space-x-1.5 z-10">
          <span
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md border-2 flex items-center justify-center bg-white/95 backdrop-blur-md shadow-sm ${
              item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </span>

          {item.isChefSpecial && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#F7D046] text-slate-900 flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-slate-900" />
              <span>SPECIAL</span>
            </span>
          )}

          {item.isBestSeller && !item.isChefSpecial && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#0C831F] text-white shadow-sm">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Top Right Controls (Wishlist & Quick View) */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center space-x-1 z-10">
          <button
            onClick={handleToggleLike}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-sm border transition-all ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white/90 text-slate-600 border-slate-200/80 hover:text-rose-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

      </div>

      {/* Dish Content Body */}
      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0C831F] transition-colors line-clamp-2 leading-snug">
              {item.name}
            </h3>
          </div>

          <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
            {item.description}
          </p>
        </div>

        {/* Metadata & Rating Row */}
        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
          <div className="flex items-center space-x-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 font-bold border border-amber-200/60">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{item.rating || 4.8}</span>
            <span className="text-[9px] text-amber-700 font-normal">({item.reviewCount || 95})</span>
          </div>

          {item.calories && (
            <span className="text-[10px] text-slate-400 font-medium">
              {item.calories} kcal
            </span>
          )}

          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <div className="flex items-center space-x-0.5" title={`Spice: ${item.spiceLevel}/3`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Row: Price & Blinkit ADD Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                ₹{item.price}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                ₹{originalPrice}
              </span>
            </div>
            <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">
              {Math.round(((originalPrice - item.price) / originalPrice) * 100)}% OFF
            </span>
          </div>

          {/* Blinkit Green ADD Button / Stepper */}
          <div>
            {item.isAvailable === false ? (
              <button
                disabled
                className="px-3 py-1 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-lg cursor-not-allowed uppercase"
              >
                OUT
              </button>
            ) : quantity === 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(item);
                }}
                className="px-3 sm:px-4 py-1 sm:py-1.5 bg-emerald-50 hover:bg-[#0C831F] border border-[#0C831F] text-[#0C831F] hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-sm flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ADD</span>
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="px-1 py-0.5 bg-[#0C831F] text-white rounded-lg flex items-center space-x-1.5 font-bold shadow-sm blinkit-stepper-pop"
              >
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="w-6 h-6 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer"
                  title="Decrease"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <span className="font-mono text-xs sm:text-sm font-black min-w-[16px] text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => addItem(item, 1)}
                  className="w-6 h-6 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer"
                  title="Increase"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default DishCard;
