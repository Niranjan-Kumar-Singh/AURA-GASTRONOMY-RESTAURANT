import React, { useState, useEffect } from 'react';
import { MenuItem, CustomizationOption } from '../../types/menu.types';
import { X, Star, Clock, Plus, Minus, Sparkles, ChefHat, Check } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useCartStore } from '../../store/use-cart-store';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { getSmartAddonsForDish } from '../../services/aiPairingEngine';

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
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { showToast } = useToast();
  const { items, addItem, updateQuantity, updateSpecialNotes } = useCartStore();
  
  const [localQuantity, setLocalQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [groupId: string]: CustomizationOption }>({});
  const [selectedAddons, setSelectedAddons] = useState<{ [id: string]: boolean }>({});

  const cartItem = items.find((it) => it.menuItem.id === item?.id);
  const isUpdating = !!cartItem;
  const displayQuantity = isUpdating ? cartItem.quantity : localQuantity;

  useEffect(() => {
    if (isOpen && item) {
      setLocalQuantity(1);
      setSpecialNotes(cartItem?.specialNotes || '');
      setSelectedAddons({});
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const smartAddons = getSmartAddonsForDish(item);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const handleSelectOption = (groupId: string, option: CustomizationOption) => {
    setSelectedCustomizations((prev) => ({ ...prev, [groupId]: option }));
  };

  const extraCost = Object.values(selectedCustomizations).reduce((acc, opt) => acc + (opt.price || 0), 0);
  const addonsCost = smartAddons
    .filter((ad) => selectedAddons[ad.id])
    .reduce((sum, ad) => sum + ad.price, 0);

  const unitPrice = item.price + extraCost + addonsCost;
  const totalPrice = unitPrice * displayQuantity;

  const getCombinedNotes = () => {
    const chosenAddonNames = smartAddons
      .filter((ad) => selectedAddons[ad.id])
      .map((ad) => `${ad.name} (+₹${ad.price})`);

    let finalNotes = specialNotes.trim();
    if (chosenAddonNames.length > 0) {
      const addonsStr = `AI Add-ons: ${chosenAddonNames.join(', ')}`;
      finalNotes = finalNotes ? `${finalNotes} | ${addonsStr}` : addonsStr;
    }
    return finalNotes;
  };

  const handleAdd = () => {
    const finalNotes = getCombinedNotes();
    if (isUpdating) {
      if (finalNotes !== cartItem?.specialNotes) {
        updateSpecialNotes(item.id, finalNotes);
      }
      showToast(`Updated "${item.name}" in Table Cart`, 'success');
    } else {
      addItem(item, localQuantity, finalNotes);
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
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121520] border-t sm:border border-[#38BDF8]/40 rounded-t-3xl sm:rounded-3xl max-w-lg w-full flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-250 max-h-[92dvh] sm:max-h-[88vh] overflow-hidden"
      >
        {/* Close Trigger */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-[#090A0F]/80 text-white hover:text-[#38BDF8] rounded-full border border-white/20 backdrop-blur-md transition-all shadow-lg cursor-pointer"
          title="Close detail view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Box */}
        <div className="relative h-36 sm:h-56 w-full shrink-0 bg-[#090A0F] overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-transparent to-black/40" />

          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center space-x-2">
            <span
              className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-[#090A0F]/90 backdrop-blur-md shadow-md ${
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
              <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0EA5E9] text-[#090A0F] flex items-center space-x-1 shadow-lg">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Chef Special</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg sm:text-2xl font-bold text-white leading-tight">{item.name}</h2>
                <p className="text-[10px] sm:text-xs text-[#94A3B8] mt-0.5">{item.categoryName}</p>
              </div>
              <span className="font-mono text-lg sm:text-2xl font-bold text-[#38BDF8] shrink-0">₹{totalPrice}</span>
            </div>

            <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">{item.description}</p>
          </div>

          {/* Quick Metrics */}
          <div className="p-2.5 sm:p-3 bg-[#090A0F] border border-[#38BDF8]/20 rounded-2xl flex items-center justify-between text-[11px] sm:text-xs text-[#94A3B8] font-sans">
            <div className="flex items-center space-x-1 text-[#38BDF8] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#38BDF8] text-[#38BDF8]" />
              <span>{item.rating || 4.9}</span>
              <span className="text-[9px] text-[#94A3B8] font-normal hidden sm:inline">({item.reviewCount || 120} reviews)</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{item.preparationTimeMinutes} mins prep</span>
            </div>

            {item.calories && (
              <span className="font-mono text-white">{item.calories} kcal</span>
            )}
          </div>

          {/* Key Ingredients List */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] sm:text-xs font-bold text-[#38BDF8] uppercase tracking-wider">Key Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-0.5 sm:py-1 bg-[#090A0F] border border-[#38BDF8]/20 rounded-xl text-[10px] sm:text-[11px] text-white">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommended Flavor Enhancers & Up-sell Add-ons */}
          {smartAddons.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-[#38BDF8]/10 via-[#090A0F] to-[#38BDF8]/10 border border-[#38BDF8]/40 rounded-2xl space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
                  <span>Chef &amp; AI Recommended Add-ons</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Better Taste Guaranteed
                </span>
              </div>

              <div className="space-y-1.5">
                {smartAddons.map((addon) => {
                  const isChecked = !!selectedAddons[addon.id];

                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#0EA5E9]/20 border-[#0EA5E9] text-white font-bold shadow-md'
                          : 'bg-[#090A0F]/90 border-[#38BDF8]/20 text-[#94A3B8] hover:text-white hover:border-[#38BDF8]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'bg-[#0EA5E9] border-[#0EA5E9] text-[#090A0F]'
                              : 'border-[#38BDF8]/30 bg-[#121520]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="truncate block font-semibold text-white">{addon.name}</span>
                          {addon.reason && (
                            <span className="text-[9px] text-[#7DD3FC] block font-normal leading-none mt-0.5">
                              ✨ {addon.reason}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="font-mono text-[#38BDF8] font-bold shrink-0 ml-2">+₹{addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Options */}
          {item.customizationGroups && item.customizationGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                <span>{group.title}</span>
                {group.required && <span className="text-[9px] text-rose-400 font-bold">Required</span>}
              </div>

              <div className="space-y-1.5">
                {group.options.map((option) => {
                  const isSelected = selectedCustomizations[group.id]?.id === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(group.id, option)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#38BDF8] font-bold'
                          : 'bg-[#090A0F] border-[#38BDF8]/20 text-white hover:border-[#38BDF8]/50'
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
          <div className="space-y-1.5 pb-2">
            <label className="text-[10px] sm:text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Less oil, No chilli, Extra napkins, Birthday message..."
              className="w-full p-3 bg-[#090A0F] border border-[#38BDF8]/30 rounded-xl text-white text-xs placeholder:text-[#94A3B8] focus:outline-none focus:border-[#38BDF8] h-16 sm:h-20 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer (Quantity Stepper & Add CTA - Safe for Mobile Chrome Viewport) */}
        <div className="p-3.5 sm:p-4 bg-[#090A0F] border-t border-[#38BDF8]/20 flex items-center justify-center shrink-0">
          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full max-w-sm py-3 sm:py-4 px-6 bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold rounded-full text-xs uppercase tracking-widest cursor-not-allowed opacity-90 flex items-center justify-center space-x-2"
            >
              <span>CURRENTLY OUT OF STOCK</span>
            </button>
          ) : isUpdating ? (
            <div className="w-full max-w-sm flex items-center justify-between bg-[#0EA5E9]/20 backdrop-blur-md rounded-full p-1 sm:p-1.5 border border-[#0EA5E9] shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-in fade-in zoom-in duration-200">
              <button
                onClick={handleDecrement}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#090A0F] hover:bg-black rounded-full flex items-center justify-center text-[#38BDF8] transition-transform active:scale-90 shadow-inner cursor-pointer"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="flex flex-col items-center justify-center">
                <span className="font-mono font-black text-lg sm:text-xl text-[#38BDF8] drop-shadow-md">{displayQuantity}</span>
                <span className="text-[8px] sm:text-[9px] text-[#7DD3FC] font-bold uppercase tracking-widest opacity-80">In Cart</span>
              </div>
              
              <button
                onClick={handleIncrement}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-[#090A0F] hover:bg-black rounded-full flex items-center justify-center text-[#38BDF8] transition-transform active:scale-90 shadow-inner cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full max-w-sm py-3.5 sm:py-4 px-5 sm:px-6 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-full text-xs sm:text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-between active:scale-95 animate-in fade-in zoom-in duration-200 border border-[#7DD3FC]/60 cursor-pointer"
            >
              <span>ADD TO CART</span>
              <span className="font-mono text-base sm:text-lg">₹{totalPrice}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
