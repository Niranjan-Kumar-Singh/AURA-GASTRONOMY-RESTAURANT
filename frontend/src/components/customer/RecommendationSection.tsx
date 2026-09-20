import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Sparkles, Heart, Check, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { useToast } from '../feedback/ToastContainer';

interface RecommendationSectionProps {
  title: string;
  icon?: React.ReactNode;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  variant?: 'chef' | 'popular';
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  icon = <Sparkles className="w-4 h-4 text-emerald-600" />,
  items,
  onItemClick,
  variant = 'chef',
}) => {
  const { items: cartItems } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { showToast } = useToast();

  const getQuantityInCart = (itemId: number) => {
    const existing = cartItems.find((it) => it.menuItem.id === itemId);
    return existing ? existing.quantity : 0;
  };

  if (items.length === 0) return null;

  const isChef = variant === 'chef';

  return (
    <div className="px-3 sm:px-6 lg:px-8 max-w-[1560px] mx-auto my-3 sm:my-4">
      <div
        className={`rounded-3xl p-3.5 sm:p-4 shadow-lg space-y-2.5 border transition-all ${
          isChef
            ? 'bg-gradient-to-r from-[#332517]/95 via-[#261d15]/90 to-[#1d1610]/75 backdrop-blur-sm border-amber-500/30 shadow-amber-950/15'
            : 'bg-gradient-to-r from-[#173023]/95 via-[#13241b]/90 to-[#0e1b14]/75 backdrop-blur-sm border-emerald-500/30 shadow-emerald-950/15'
        }`}
      >
        {/* Section Header with Accent and Item Count */}
        <div
          className={`flex items-center justify-between pb-2 border-b ${
            isChef ? 'border-amber-500/20' : 'border-emerald-500/20'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`p-1.5 rounded-xl border shadow-xs flex items-center justify-center ${
                isChef
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/35'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
              }`}
            >
              {icon}
            </span>
            <h3
              className={`text-xs sm:text-sm font-black uppercase tracking-wide ${
                isChef ? 'text-amber-100' : 'text-emerald-100'
              }`}
            >
              {title}
            </h3>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              isChef
                ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
            }`}
          >
            {items.length} specials
          </span>
        </div>

        {/* Horizontal Scroll Rail */}
        <div className="flex space-x-3.5 overflow-x-auto pb-2 pt-1 px-0.5 blinkit-scrollbar-x select-none">
          {items.map((item) => {
            const qty = getQuantityInCart(item.id);
            const originalPrice = Math.round(item.price * 1.22);
            const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

            return (
              <div
                key={item.id}
                className={`flex-none w-44 sm:w-56 bg-white border rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-200 group relative flex flex-col justify-between hover:-translate-y-1 ${
                  isChef
                    ? 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_8px_24px_rgba(245,158,11,0.2)]'
                    : 'border-emerald-500/30 hover:border-[#0C831F] hover:shadow-[0_8px_24px_rgba(12,131,31,0.2)]'
                }`}
                onClick={() => onItemClick(item)}
              >
                {/* 1. Top Image Div — Edge to Edge Flush with Border Bottom */}
                <div className="relative h-28 sm:h-36 w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute top-2 left-2 flex items-center space-x-1.5 z-10">
                    <span
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center bg-white/95 backdrop-blur-md shadow-sm ${
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
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-c-accent text-slate-900 shadow-sm flex items-center space-x-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-slate-900" />
                        <span>SPECIAL</span>
                      </span>
                    )}
                  </div>

                  {/* Top Right Wishlist Button */}
                  <div className="absolute top-2 right-2 flex items-center z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const added = toggleWishlist(item);
                        showToast(
                          added ? `Added "${item.name}" to Saved Wishlist` : `Removed "${item.name}" from Wishlist`,
                          added ? 'success' : 'info'
                        );
                      }}
                      className={`w-7 h-7 rounded-full backdrop-blur-md shadow-sm border transition-all flex items-center justify-center cursor-pointer active:scale-75 ${
                        isWishlisted(item.id)
                          ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/25 scale-105'
                          : 'bg-white/90 hover:bg-white text-slate-600 border-slate-200/80 hover:text-rose-500'
                      }`}
                      title={isWishlisted(item.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted(item.id) ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2. Lower Content Div — Padding is applied here ONLY */}
                <div className="p-2.5 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-c-primary transition-colors min-h-[30px] sm:min-h-[34px]">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed hidden xs:block">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-1">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline space-x-1">
                        <span className="font-mono text-xs sm:text-sm font-black text-slate-900">
                          ₹{item.price}
                        </span>
                        <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 line-through">
                          ₹{originalPrice}
                        </span>
                      </div>
                      {discountPercent > 0 && (
                        <span className="text-[8px] sm:text-[9px] text-c-primary font-bold uppercase tracking-wider">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold shadow-2xs shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#0C831F]" />
                        <span>({qty})</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-0.5 px-2 py-0.5 bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-[#0C831F] border border-slate-200 group-hover:border-emerald-300 rounded-lg text-[10px] font-bold transition-all shadow-2xs shrink-0">
                        <span>View</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#0C831F] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default RecommendationSection;
