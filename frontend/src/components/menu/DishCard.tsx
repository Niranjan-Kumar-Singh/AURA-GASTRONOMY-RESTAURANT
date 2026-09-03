import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Heart, Share2, Eye, Plus, Minus, Star, Flame, Clock, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { useToast } from '../feedback/ToastContainer';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(item);
    showToast(
      added ? `Added "${item.name}" to Saved Wishlist` : `Removed "${item.name}" from Wishlist`,
      added ? 'success' : 'info'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onClick={() => onClick(item)}
      className="bg-[#121520] border border-[#38BDF8]/30 hover:border-[#38BDF8] rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_45px_rgba(56,189,248,0.25)] group relative perspective-1000 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative h-36 sm:h-52 w-full bg-aura-obsidian overflow-hidden" style={{ transform: "translateZ(30px)" }}>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-aura-obsidian via-aura-container to-aura-obsidian animate-pulse" />
        )}
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
          }`}
        />
        {item.isAvailable === false && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-rose-500 text-white text-[8px] sm:text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg border border-rose-400">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center space-x-1 z-10">
          <span
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border-2 flex items-center justify-center bg-aura-obsidian/90 backdrop-blur-md shadow-md ${
              item.isVegetarian ? 'border-emerald-500' : 'border-rose-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>

          {item.isGlutenFree && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
              GF
            </span>
          )}
          {item.isJain && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md">
              Jain
            </span>
          )}
        </div>

        {/* Action Controls Overlay (Wishlist, Share, Quick View) */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center space-x-1 sm:space-x-1.5 z-10">
          <button
            onClick={handleToggleLike}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md border transition-all ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-aura-obsidian/70 text-aura-ivory border-white/20 hover:border-aura-cyan'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
            className="p-1.5 sm:p-2 rounded-full bg-aura-obsidian/70 backdrop-blur-md border border-white/20 text-aura-ivory hover:border-aura-cyan transition-all"
            title="Quick View"
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Badges Bar */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex flex-wrap gap-1 z-10">
          {item.isChefSpecial && (
            <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0EA5E9] text-[#090A0F] flex items-center space-x-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#090A0F]" />
              <span className="hidden sm:inline">Chef Special</span>
              <span className="inline sm:hidden">Special</span>
            </span>
          )}
          {item.isBestSeller && (
            <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7DD3FC] text-[#090A0F] shadow-md">
              <span className="hidden sm:inline">Best Seller</span>
              <span className="inline sm:hidden">Best</span>
            </span>
          )}
        </div>
      </div>

      {/* Dish Content Body */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors line-clamp-2 leading-snug min-h-[28px] sm:min-h-[36px]">
              {item.name}
            </h3>
            <span className="font-mono text-xs sm:text-sm md:text-base font-black text-[#38BDF8] shrink-0 pt-0.5">₹{item.price}</span>
          </div>

          <p className="text-[10px] sm:text-xs text-[#94A3B8] line-clamp-2 leading-tight sm:leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Rail (Rating, Calories, Prep Time, Spice Meter) */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#38BDF8]/20 flex items-center justify-between text-[9px] sm:text-[11px] text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <div className="flex items-center space-x-0.5 text-[#38BDF8] font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#38BDF8] text-[#38BDF8]" />
              <span>{item.rating || 4.9}</span>
              <span className="text-[8px] sm:text-[9px] text-[#94A3B8] font-normal hidden sm:inline">({item.reviewCount || 120})</span>
            </div>

            <div className="flex items-center space-x-0.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#38BDF8]" />
              <span>{item.preparationTimeMinutes}m</span>
            </div>

            {item.calories && (
              <span className="font-mono hidden sm:inline">{item.calories} kcal</span>
            )}
          </div>

          {/* Spice Meter */}
          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <div className="flex items-center space-x-0.5" title={`Spice Level: ${item.spiceLevel}/3`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 fill-rose-500" />
              ))}
            </div>
          )}
        </div>

        {/* Quantity Stepper / Add Button / Out of Stock */}
        <div className="pt-1.5 sm:pt-3">
          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full py-2 sm:py-2.5 px-2 sm:px-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase tracking-wider rounded-xl sm:rounded-2xl text-[10px] sm:text-xs flex items-center justify-center space-x-1 cursor-not-allowed opacity-80"
            >
              <span>OUT OF STOCK</span>
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item);
              }}
              className="w-full py-2 sm:py-2.5 px-2 sm:px-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black uppercase tracking-wider rounded-xl sm:rounded-2xl text-[10px] sm:text-xs transition-all flex items-center justify-center space-x-1 sm:space-x-1.5 shadow-[0_4px_20px_rgba(14,165,233,0.4)] hover:shadow-[0_6px_25px_rgba(14,165,233,0.55)] border border-[#7DD3FC]/60 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#090A0F]" />
              <span className="text-[#090A0F]">ADD</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full py-0.5 sm:py-1 px-1 bg-[#0EA5E9]/20 backdrop-blur-md border-2 border-[#0EA5E9] rounded-full flex items-center justify-between shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-in zoom-in-95 duration-150"
            >
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-7 h-7 sm:w-9 sm:h-9 bg-[#090A0F] hover:bg-black rounded-full flex items-center justify-center font-bold text-[#38BDF8] shadow-inner transition-transform active:scale-90"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="font-mono text-xs sm:text-sm font-black text-[#38BDF8]">{quantity}</span>
              </div>
              
              <button
                onClick={() => addItem(item, 1)}
                className="w-7 h-7 sm:w-9 sm:h-9 bg-[#090A0F] hover:bg-black rounded-full flex items-center justify-center font-bold text-[#38BDF8] shadow-inner transition-transform active:scale-90"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
