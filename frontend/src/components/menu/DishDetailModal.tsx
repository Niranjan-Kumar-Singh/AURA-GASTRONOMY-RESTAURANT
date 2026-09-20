import React, { useState, useEffect } from 'react';
import { MenuItem, CustomizationOption } from '../../types/menu.types';
import { X, Star, Clock, Plus, Minus, Sparkles, Check } from 'lucide-react';
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
  const { items, addItem, updateQuantity, updateSpecialNotes, updateItemConfiguration } = useCartStore();

  const [localQuantity, setLocalQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [groupId: string]: CustomizationOption }>({});
  const [selectedAddonQuantities, setSelectedAddonQuantities] = useState<{ [id: string]: number }>({});

  const cartItem = items.find((it) => it.menuItem.id === item?.id);
  const isUpdating = !!cartItem;
  const [customQuantity, setCustomQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && item) {
      if (cartItem) {
        setCustomQuantity(cartItem.quantity);
        setSpecialNotes(cartItem.specialNotes || '');
      } else {
        setCustomQuantity(1);
        setSpecialNotes('');
      }
      setSelectedAddonQuantities({});
    }
  }, [isOpen, item, cartItem]);

  if (!isOpen || !item) return null;

  const displayQuantity = customQuantity;

  const smartAddons = getSmartAddonsForDish(item);

  const handleAddonIncrement = (addonId: string) => {
    setSelectedAddonQuantities((prev) => ({
      ...prev,
      [addonId]: (prev[addonId] || 0) + 1,
    }));
  };

  const handleAddonDecrement = (addonId: string) => {
    setSelectedAddonQuantities((prev) => {
      const current = prev[addonId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      }
      return { ...prev, [addonId]: current - 1 };
    });
  };

  const handleSelectOption = (groupId: string, option: CustomizationOption) => {
    setSelectedCustomizations((prev) => ({ ...prev, [groupId]: option }));
  };

  const extraCost = Object.values(selectedCustomizations).reduce((acc, opt) => acc + (opt.price || 0), 0);
  const addonsCost = smartAddons.reduce((sum, ad) => {
    const qty = selectedAddonQuantities[ad.id] || 0;
    return sum + (ad.price * qty);
  }, 0);

  const unitPrice = item.price + extraCost + addonsCost;
  const totalPrice = unitPrice * displayQuantity;

  const chosenAddonNames = smartAddons
    .filter((ad) => (selectedAddonQuantities[ad.id] || 0) > 0)
    .map((ad) => {
      const qty = selectedAddonQuantities[ad.id];
      return qty > 1 ? `${qty}x ${ad.name} (+₹${ad.price * qty})` : `${ad.name} (+₹${ad.price})`;
    });

  const getCombinedNotes = () => {
    let finalNotes = specialNotes.trim();
    if (chosenAddonNames.length > 0) {
      const addonsStr = `Add-ons: ${chosenAddonNames.join(', ')}`;
      finalNotes = finalNotes ? `${finalNotes} | ${addonsStr}` : addonsStr;
    }
    return finalNotes;
  };

  const handleAdd = () => {
    const finalNotes = getCombinedNotes();
    if (isUpdating) {
      updateItemConfiguration(item.id, displayQuantity, unitPrice, finalNotes, chosenAddonNames);
      showToast(`Updated ${displayQuantity}x "${item.name}" with add-ons in Table Cart`, 'success');
    } else {
      addItem(item, displayQuantity, finalNotes, unitPrice, chosenAddonNames);
      showToast(`Added ${displayQuantity}x "${item.name}" to Table Cart`, 'success');
    }
    if (onAddToCart) {
      onAddToCart(item, displayQuantity, finalNotes);
    }
    onClose();
  };

  const handleIncrement = () => {
    setCustomQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCustomQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-3xl w-full max-w-full md:max-w-lg flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200 max-h-[92dvh] md:max-h-[88vh] overflow-hidden text-slate-800"
      >
        {/* Close Trigger */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-white/90 text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 shadow-md transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Box */}
        <div className="relative h-44 sm:h-56 w-full shrink-0 bg-slate-100 overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center space-x-2">
            <span
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center bg-white shadow-sm ${
                item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>

            {item.isChefSpecial && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F7D046] text-slate-900 flex items-center space-x-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-slate-900" />
                <span>Special</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{item.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{item.categoryName}</p>
              </div>
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 shrink-0">₹{totalPrice}</span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
          </div>

          {/* Quick Metrics */}
          <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{item.rating || 4.8}</span>
              <span className="text-[10px] text-amber-700 font-normal">({item.reviewCount || 95})</span>
            </div>

            <div className="flex items-center space-x-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{item.preparationTimeMinutes || 15} mins prep</span>
            </div>

            {item.calories && (
              <span className="font-mono text-slate-500">{item.calories} kcal</span>
            )}
          </div>

          {/* Key Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Smart Add-ons */}
          {smartAddons.length > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Recommended Add-ons</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Best Pairings
                </span>
              </div>

              <div className="space-y-1.5">
                {smartAddons.map((addon) => {
                  const qty = selectedAddonQuantities[addon.id] || 0;
                  const isAdded = qty > 0;

                  return (
                    <div
                      key={addon.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isAdded
                          ? 'bg-emerald-50/90 border-emerald-400 text-emerald-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isAdded ? 'bg-[#0C831F]' : 'bg-slate-300'}`} />
                        <div className="min-w-0">
                          <span className="font-bold block truncate text-slate-900">{addon.name}</span>
                          <span className="font-mono font-bold text-[#0C831F] text-[11px]">
                            +₹{addon.price}{qty > 1 ? ` (×${qty} = +₹${addon.price * qty})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Add Button or Stepper */}
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddonIncrement(addon.id)}
                          className="px-3 py-1 bg-white hover:bg-emerald-50 border border-emerald-400 text-[#0C831F] hover:text-[#096918] font-bold rounded-lg text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer active:scale-95 shrink-0"
                          title="Add this item"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-1.5 bg-[#0C831F] text-white px-1.5 py-0.5 rounded-lg shadow-sm shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddonDecrement(addon.id)}
                            className="w-6 h-6 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                            title="Decrease add-on quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>
                          <span className="font-mono font-black text-xs min-w-[18px] text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddonIncrement(addon.id)}
                            className="w-6 h-6 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                            title="Increase add-on quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Groups */}
          {item.customizationGroups && item.customizationGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
                <span>{group.title}</span>
                {group.required && <span className="text-[10px] text-rose-600 font-bold">Required</span>}
              </div>

              <div className="space-y-1.5">
                {group.options.map((option) => {
                  const isSelected = selectedCustomizations[group.id]?.id === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(group.id, option)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-c-primary-light border-c-primary-border text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
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

          {/* Special Kitchen Notes */}
          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Special Kitchen Instructions
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Less spicy, dressing on side, allergy notes..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-c-primary h-16 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col space-y-2.5 shrink-0">
          {/* Transparent Add-on & Portion Summary Banner */}
          {addonsCost > 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
              <div className="flex items-center justify-between font-bold">
                <span>{displayQuantity}x portion{displayQuantity > 1 ? 's' : ''} customized:</span>
                <span className="font-mono font-black">₹{unitPrice} each</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Includes: {chosenAddonNames.join(', ')} (+₹{addonsCost * displayQuantity} total add-ons)
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold italic">
                ✓ Kitchen will serve all {displayQuantity} portion{displayQuantity > 1 ? 's' : ''} with these selected add-ons.
              </p>
            </div>
          )}

          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full py-3 px-6 bg-slate-200 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
            >
              OUT OF STOCK
            </button>
          ) : (
            <div className="flex items-center space-x-2.5">
              {/* Portion Stepper */}
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm shrink-0">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-90"
                  title="Decrease portion"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <span className="font-mono font-black text-sm px-3 min-w-[28px] text-center text-slate-900">
                  {displayQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer active:scale-90"
                  title="Increase portion"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-4 sm:px-5 bg-c-primary hover:bg-c-primary-dark text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-between cursor-pointer min-w-0"
              >
                <span className="truncate mr-2">
                  <span className="sm:hidden">{isUpdating ? 'UPDATE' : 'ADD TO CART'}</span>
                  <span className="hidden sm:inline">{isUpdating ? 'UPDATE IN CART' : 'ADD TO TABLE CART'}</span>
                </span>
                <span className="font-mono text-sm sm:text-base font-black shrink-0">₹{totalPrice}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DishDetailModal;
