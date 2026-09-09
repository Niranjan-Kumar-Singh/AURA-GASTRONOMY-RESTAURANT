import React from 'react';
import { MenuItem } from '../../types/menu.types';
import { Sparkles, Plus, Minus, Clock } from 'lucide-react';
import { useCartStore } from '../../store/use-cart-store';

interface RecommendationSectionProps {
  title: string;
  icon?: React.ReactNode;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title,
  icon = <Sparkles className="w-4 h-4 text-emerald-600" />,
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
    <div className="px-3 sm:px-6 lg:px-8 max-w-[1560px] mx-auto my-4 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
        {icon}
        <span>{title}</span>
      </div>

      <div className="flex space-x-3.5 overflow-x-auto pb-4 pt-1 px-1 -mx-1 no-scrollbar select-none">
        {items.map((item) => {
          const qty = getQuantityInCart(item.id);
          const originalPrice = Math.round(item.price * 1.2);

          return (
            <div
              key={item.id}
              className="flex-none w-52 sm:w-56 bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-2xl p-3 space-y-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 group relative"
              onClick={() => onItemClick(item)}
            >
              <div className="relative rounded-xl overflow-hidden h-28 sm:h-32 w-full bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 left-2 flex space-x-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center bg-white shadow-sm ${
                      item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-700 shadow-sm flex items-center space-x-1">
                  <Clock className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{item.preparationTimeMinutes || 15}m</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-emerald-700 transition-colors">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-baseline space-x-1">
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-900">
                    ₹{item.price}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 line-through">
                    ₹{originalPrice}
                  </span>
                </div>

                {qty > 0 ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1.5 bg-[#0C831F] text-white font-bold rounded-lg px-1.5 py-0.5 shadow-sm"
                  >
                    <button
                      onClick={() => updateQuantity(item.id, qty - 1)}
                      className="w-5 h-5 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3 stroke-[3]" />
                    </button>
                    <span className="font-mono text-xs font-black">{qty}</span>
                    <button
                      onClick={() => addItem(item, 1)}
                      className="w-5 h-5 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item, 1);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-black uppercase transition-all flex items-center space-x-1 bg-emerald-50 hover:bg-[#0C831F] text-[#0C831F] hover:text-white border border-[#0C831F] shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>ADD</span>
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
export default RecommendationSection;
