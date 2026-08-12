import React, { useState } from 'react';
import { MenuItem } from '../../types/menu.types';
import { Heart, Share2, Eye, Plus, Minus, Star, Flame, Clock, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';
import { useToast } from '../feedback/ToastContainer';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface DishCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onClick: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onAdd, onClick }) => {
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
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
    setIsLiked(!isLiked);
    showToast(
      !isLiked ? `Added "${item.name}" to Wishlist` : `Removed "${item.name}" from Wishlist`,
      !isLiked ? 'success' : 'info'
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
      className="bg-aura-container border border-aura-border hover:border-aura-gold/60 rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-[0_25px_50px_-12px_rgba(212,175,55,0.25)] group relative perspective-1000"
    >
      {/* Top Image Box */}
      <div className="relative h-48 sm:h-52 w-full bg-aura-obsidian overflow-hidden" style={{ transform: "translateZ(30px)" }}>
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
        {item.isAvailable === false && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg border border-rose-400">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
          <span
            className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center bg-aura-obsidian/90 backdrop-blur-md shadow-md ${
              item.isVegetarian ? 'border-emerald-500' : 'border-rose-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>

          {item.isGlutenFree && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              GF
            </span>
          )}
          {item.isJain && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md">
              Jain
            </span>
          )}
        </div>

        {/* Action Controls Overlay (Wishlist, Share, Quick View) */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
          <button
            onClick={handleToggleLike}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isLiked
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-aura-obsidian/70 text-aura-ivory border-white/20 hover:border-aura-gold'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
          </button>



          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(item);
            }}
            className="p-2 rounded-full bg-aura-obsidian/70 backdrop-blur-md border border-white/20 text-aura-ivory hover:border-aura-gold transition-all"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Badges Bar */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10">
          {item.isChefSpecial && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-aura-gold text-aura-obsidian flex items-center space-x-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>Chef Special</span>
            </span>
          )}
          {item.isBestSeller && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-aura-obsidian shadow-md">
              Best Seller
            </span>
          )}
        </div>
      </div>

      {/* Dish Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-aura-ivory group-hover:text-aura-gold transition-colors line-clamp-1">
              {item.name}
            </h3>
            <span className="font-mono text-base font-bold text-aura-gold">₹{item.price}</span>
          </div>

          <p className="text-xs text-aura-slate line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Rail (Rating, Calories, Prep Time, Spice Meter) */}
        <div className="pt-2 border-t border-aura-border/40 flex items-center justify-between text-[11px] text-aura-slate">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating || 4.9}</span>
              <span className="text-[9px] text-aura-slate font-normal">({item.reviewCount || 120})</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-aura-gold" />
              <span>{item.preparationTimeMinutes}m</span>
            </div>

            {item.calories && (
              <span className="font-mono">{item.calories} kcal</span>
            )}
          </div>

          {/* Spice Meter */}
          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <div className="flex items-center space-x-0.5" title={`Spice Level: ${item.spiceLevel}/3`}>
              {Array.from({ length: item.spiceLevel }).map((_, i) => (
                <Flame key={i} className="w-3 h-3 text-rose-500 fill-rose-500" />
              ))}
            </div>
          )}
        </div>

        {/* Quantity Stepper / Add Button / Out of Stock */}
        <div className="pt-3">
          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full py-2.5 px-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold uppercase tracking-wider rounded-2xl text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-80"
            >
              <span>OUT OF STOCK</span>
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item);
              }}
              className="w-full py-2.5 px-4 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-black uppercase tracking-wider rounded-2xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(212,175,55,0.2)] active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO CART</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full py-1 px-1 bg-aura-gold/20 backdrop-blur-md border border-aura-gold/40 rounded-full flex items-center justify-between shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-in zoom-in-95 duration-150"
            >
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-9 h-9 bg-aura-obsidian hover:bg-black rounded-full flex items-center justify-center font-bold text-aura-gold shadow-inner transition-transform active:scale-90"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center justify-center leading-none">
                <span className="font-mono text-sm font-black text-aura-gold">{quantity}</span>
              </div>
              
              <button
                onClick={() => addItem(item, 1)}
                className="w-9 h-9 bg-aura-obsidian hover:bg-black rounded-full flex items-center justify-center font-bold text-aura-gold shadow-inner transition-transform active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
