import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Sparkles, Plus, Check, Minus } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';

interface RecommendationSectionProps {
  title: string;
  icon?: React.ReactNode;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  icon = <Sparkles className="w-4 h-4 text-aura-cyan" />,
  items,
  onItemClick,
}) => {
  const { addItem, items: cartItems, updateQuantity } = useCartStore();

  const getQuantityInCart = (itemId: number) => {
    const existing = cartItems.find((it) => it.menuItem.id === itemId);
    return existing ? existing.quantity : 0;
  };

  if (items.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-4 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
        {icon}
        <span>{title}</span>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 no-scrollbar">
        {items.map((item) => {
          const qty = getQuantityInCart(item.id);

          return (
            <div
              key={item.id}
              className="flex-none w-56 bg-[#121520] border border-[#38BDF8]/30 hover:border-[#38BDF8] rounded-2xl p-3 space-y-2 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(56,189,248,0.2)] group relative"
              onClick={() => onItemClick(item)}
            >
              <div className="relative rounded-xl overflow-hidden h-32 w-full bg-[#090A0F]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute top-2 left-2 flex space-x-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center bg-[#090A0F] ${
                      item.isVegetarian ? 'border-emerald-500' : 'border-rose-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-[#090A0F]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-[#38BDF8] font-bold border border-[#38BDF8]/40">
                  ₹{item.price}
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-white text-xs truncate group-hover:text-[#38BDF8] transition-colors">{item.name}</h4>
                <p className="text-[10px] text-[#94A3B8] line-clamp-1">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#38BDF8]/20">
                <span className="text-[10px] text-[#94A3B8] font-mono">{item.preparationTimeMinutes} mins</span>

                {qty > 0 ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-2 bg-[#0EA5E9] text-[#090A0F] font-black rounded-xl px-1.5 py-0.5 shadow-md animate-in zoom-in-95 duration-150"
                  >
                    <button
                      onClick={() => updateQuantity(item.id, qty - 1)}
                      className="w-5 h-5 bg-[#090A0F]/20 hover:bg-[#090A0F]/40 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-[#090A0F]" />
                    </button>
                    <span className="font-mono text-xs font-black text-[#090A0F]">{qty}</span>
                    <button
                      onClick={() => addItem(item, 1)}
                      className="w-5 h-5 bg-[#090A0F]/20 hover:bg-[#090A0F]/40 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-[#090A0F]" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item, 1);
                    }}
                    className="px-3.5 py-1 rounded-xl text-xs font-black transition-all flex items-center space-x-1 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] shadow-[0_2px_15px_rgba(14,165,233,0.4)] border border-[#7DD3FC]/60 active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#090A0F]" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
