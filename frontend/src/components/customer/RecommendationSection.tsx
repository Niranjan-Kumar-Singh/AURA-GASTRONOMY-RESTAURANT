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
  icon = <Sparkles className="w-4 h-4 text-aura-gold" />,
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
    <div className="px-4 max-w-7xl mx-auto my-4 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-aura-gold uppercase tracking-wider">
        {icon}
        <span>{title}</span>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 px-2 -mx-2 no-scrollbar">
        {items.map((item) => {
          const qty = getQuantityInCart(item.id);

          return (
            <div
              key={item.id}
              className="flex-none w-56 bg-aura-container border border-aura-border hover:border-aura-gold/40 rounded-2xl p-3 space-y-2 cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group relative"
              onClick={() => onItemClick(item)}
            >
              <div className="relative rounded-xl overflow-hidden h-32 w-full bg-aura-obsidian">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute top-2 left-2 flex space-x-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center bg-aura-obsidian ${
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

                <div className="absolute bottom-2 right-2 bg-aura-obsidian/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-aura-gold font-bold border border-aura-gold/30">
                  ₹{item.price}
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-aura-ivory text-xs truncate">{item.name}</h4>
                <p className="text-[10px] text-aura-slate line-clamp-1">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-aura-border/40">
                <span className="text-[10px] text-aura-slate font-mono">{item.preparationTimeMinutes} mins</span>

                {qty > 0 ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-2 bg-aura-gold text-aura-obsidian font-bold rounded-xl px-1 py-0.5 shadow-md animate-in zoom-in-95 duration-150"
                  >
                    <button
                      onClick={() => updateQuantity(item.id, qty - 1)}
                      className="w-6 h-6 bg-aura-obsidian/20 hover:bg-aura-obsidian/40 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs">{qty}</span>
                    <button
                      onClick={() => addItem(item, 1)}
                      className="w-6 h-6 bg-aura-obsidian/20 hover:bg-aura-obsidian/40 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item, 1);
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
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
