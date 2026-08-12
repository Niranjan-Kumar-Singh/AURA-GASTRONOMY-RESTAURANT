import React, { useState, useEffect } from 'react';
import { MenuItem, CustomizationOption } from '../../types/menu.types';
import { X, Star, Clock, Plus, Minus, Sparkles } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useCartStore } from '../../store/use-cart-store';

interface DishDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { showToast } = useToast();
  const { items, addItem, updateQuantity, updateSpecialNotes } = useCartStore();
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [groupId: string]: CustomizationOption }>({});

  const cartItem = items.find((it) => it.menuItem.id === item?.id);
  const isUpdating = !!cartItem;
  const displayQuantity = isUpdating ? cartItem.quantity : localQuantity;

  useEffect(() => {
    if (isOpen && item) {
      setLocalQuantity(1);
      setSpecialNotes(cartItem?.specialNotes || '');
    }
  }, [isOpen, item]);



  if (!isOpen || !item) return null;

  const handleSelectOption = (groupId: string, option: CustomizationOption) => {
    setSelectedCustomizations((prev) => ({ ...prev, [groupId]: option }));
  };

  const extraCost = Object.values(selectedCustomizations).reduce((acc, opt) => acc + (opt.price || 0), 0);
  const unitPrice = item.price + extraCost;
  const totalPrice = unitPrice * displayQuantity;

  const handleAdd = () => {
    if (isUpdating) {
      if (specialNotes !== cartItem?.specialNotes) {
        updateSpecialNotes(item.id, specialNotes);
      }
      showToast(`Updated "${item.name}" in Table Cart`, 'success');
    } else {
      addItem(item, localQuantity, specialNotes);
      showToast(`Added ${localQuantity}x "${item.name}" to Table Cart`, 'success');
    }
  };

  const handleIncrement = () => {
    if (isUpdating) {
      updateQuantity(item.id, cartItem.quantity + 1);
    } else {
      setLocalQuantity(localQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (isUpdating) {
      if (cartItem.quantity > 1) {
        updateQuantity(item.id, cartItem.quantity - 1);
      } else {
        // Drop it from cart if they hit 0
        updateQuantity(item.id, 0);
        setLocalQuantity(1);
      }
    } else {
      setLocalQuantity(Math.max(1, localQuantity - 1));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-aura-container border border-aura-gold/40 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
      >
        {/* Close Trigger */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-aura-obsidian/80 text-aura-ivory hover:text-aura-gold rounded-full border border-white/20 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Box */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 bg-aura-obsidian overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-aura-container via-transparent to-black/30" />

          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span
              className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-aura-obsidian/90 backdrop-blur-md ${
                item.isVegetarian ? 'border-emerald-500' : 'border-rose-500'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>

            {item.isChefSpecial && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-aura-gold text-aura-obsidian flex items-center space-x-1 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chef Special</span>
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-aura-ivory">{item.name}</h2>
                <p className="text-xs text-aura-slate">{item.categoryName}</p>
              </div>
              <span className="font-mono text-2xl font-bold text-aura-gold">₹{totalPrice}</span>
            </div>

            <p className="text-xs text-aura-slate mt-2 leading-relaxed">{item.description}</p>
          </div>

          {/* Quick Metrics */}
          <div className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center justify-between text-xs text-aura-slate">
            <div className="flex items-center space-x-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{item.rating || 4.9}</span>
              <span className="text-[10px] text-aura-slate font-normal">({item.reviewCount || 120} reviews)</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-aura-gold" />
              <span>{item.preparationTimeMinutes} mins prep</span>
            </div>

            {item.calories && (
              <span className="font-mono text-aura-ivory">{item.calories} kcal</span>
            )}
          </div>

          {/* Ingredients List */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-aura-gold uppercase tracking-wider">Key Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 bg-aura-obsidian border border-aura-border/60 rounded-xl text-[11px] text-aura-ivory">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Customization Options */}
          {item.customizationGroups && item.customizationGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-aura-gold uppercase tracking-wider">
                <span>{group.title}</span>
                {group.required && <span className="text-[10px] text-rose-400 font-bold">Required</span>}
              </div>

              <div className="space-y-1.5">
                {group.options.map((option) => {
                  const isSelected = selectedCustomizations[group.id]?.id === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(group.id, option)}
                      className={`p-3 rounded-xl border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-aura-gold/10 border-aura-gold text-aura-gold font-bold'
                          : 'bg-aura-obsidian border-aura-border text-aura-ivory hover:border-aura-gold/40'
                      }`}
                    >
                      <span>{option.name}</span>
                      <span className="font-mono">{option.price > 0 ? `+₹${option.price}` : 'Free'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Preparation Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-aura-gold uppercase tracking-wider">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Less oil, No chilli, Birthday celebration plate..."
              className="w-full p-3 bg-aura-obsidian border border-aura-border rounded-xl text-aura-ivory text-xs placeholder:text-aura-slate focus:outline-none focus:border-aura-gold h-20 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer (Quantity Stepper & Add CTA) */}
        <div className="p-4 bg-aura-obsidian border-t border-aura-border flex items-center justify-center">
          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full max-w-sm py-4 px-6 bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold rounded-full text-xs uppercase tracking-widest cursor-not-allowed opacity-90 flex items-center justify-center space-x-2"
            >
              <span>CURRENTLY OUT OF STOCK</span>
            </button>
          ) : isUpdating ? (
            <div className="w-full max-w-sm flex items-center justify-between bg-aura-gold/20 backdrop-blur-md rounded-full p-1.5 border border-aura-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-in fade-in zoom-in duration-200">
              <button
                onClick={handleDecrement}
                className="w-12 h-12 bg-aura-obsidian hover:bg-black rounded-full flex items-center justify-center text-aura-gold transition-transform active:scale-90 shadow-inner"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center justify-center">
                <span className="font-mono font-black text-xl text-aura-gold drop-shadow-md">{displayQuantity}</span>
                <span className="text-[9px] text-aura-gold font-bold uppercase tracking-widest opacity-80">In Cart</span>
              </div>
              
              <button
                onClick={handleIncrement}
                className="w-12 h-12 bg-aura-obsidian hover:bg-black rounded-full flex items-center justify-center text-aura-gold transition-transform active:scale-90 shadow-inner"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full max-w-sm py-4 px-6 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-black rounded-full text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-between active:scale-95 animate-in fade-in zoom-in duration-200"
            >
              <span>ADD TO CART</span>
              <span className="font-mono text-lg">₹{totalPrice}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
