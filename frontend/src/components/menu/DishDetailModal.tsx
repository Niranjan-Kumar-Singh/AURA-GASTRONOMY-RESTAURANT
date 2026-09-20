import React, { useState, useEffect } from 'react';
import { MenuItem, CustomizationOption } from '../../types/menu.types';
import { X, Star, Clock, Plus, Minus, Sparkles, Check, Trash2, Gift, Flame } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useCartStore } from '../../store/use-cart-store';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { getSmartAddonsForDish, getSpendMoreProgress } from '../../services/aiPairingEngine';

interface DishDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItem, quantity: number, notes?: string) => void;
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
  const { items, addItem, updateQuantity, updateSpecialNotes, updateItemConfiguration, removeItem } = useCartStore();

  const [localQuantity, setLocalQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [groupId: string]: CustomizationOption }>({});
  const [selectedAddonQuantities, setSelectedAddonQuantities] = useState<{ [id: string]: number }>({});

  const cartItem = items.find((it) => it.menuItem.id === item?.id);
  const isUpdating = !!cartItem;
  const [customQuantity, setCustomQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && item) {
      const currentInCart = items.find((it) => it.menuItem.id === item.id);
      if (currentInCart) {
        setCustomQuantity(currentInCart.quantity);
        setSpecialNotes(currentInCart.specialNotes || '');
      } else {
        setCustomQuantity(1);
        setSpecialNotes('');
      }
      setSelectedAddonQuantities({});
    }
  }, [isOpen, item?.id]);

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

  const handleRemoveFromCart = () => {
    if (!item) return;
    removeItem(item.id);
    showToast(`Removed "${item.name}" from Table Cart`, 'info');
    onClose();
  };

  const handleIncrement = () => {
    const nextQty = customQuantity + 1;
    setCustomQuantity(nextQty);
    if (isUpdating && item) {
      updateQuantity(item.id, nextQty);
    }
  };

  const handleDecrement = () => {
    const nextQty = customQuantity - 1;
    if (isUpdating && item) {
      if (nextQty <= 0) {
        removeItem(item.id);
        showToast(`Removed "${item.name}" from Table Cart`, 'info');
        onClose();
        return;
      }
      updateQuantity(item.id, nextQty);
    }
    setCustomQuantity(Math.max(1, nextQty));
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

          {/* Smart Add-ons & High-Margin Pairings */}
          {smartAddons.length > 0 && (
            <div className="p-3.5 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-300/80 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-950 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#0C831F]" />
                  <span>Chef's Recommended Pairings</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span>94% Pair This</span>
                </span>
              </div>

              <p className="text-[11px] text-emerald-800 font-medium -mt-1 leading-snug">
                Complete your culinary experience with high-pairing accompaniments crafted for this dish.
              </p>

              <div className="space-y-1.5">
                {smartAddons.map((addon) => {
                  const qty = selectedAddonQuantities[addon.id] || 0;
                  const isAdded = qty > 0;

                  return (
                    <div
                      key={addon.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isAdded
                          ? 'bg-white border-[#0C831F] text-emerald-950 shadow-sm ring-1 ring-emerald-500/20'
                          : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isAdded ? 'bg-[#0C831F]' : 'bg-slate-300'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs truncate">{addon.name}</span>
                            {addon.reason && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100/90 text-amber-900 border border-amber-300/60 rounded-md">
                                {addon.reason}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-black text-[#0C831F] text-xs">
                            +₹{addon.price}{qty > 1 ? ` (×${qty} = +₹${addon.price * qty})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Add Button or Stepper */}
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => handleAddonIncrement(addon.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-[#0C831F] text-[#0C831F] hover:text-white border border-[#0C831F] font-bold rounded-lg text-xs shadow-2xs transition-all flex items-center space-x-1 cursor-pointer active:scale-95 shrink-0"
                          title="Add this pairing"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>+ Add</span>
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

          {/* Special Kitchen Notes with Quick Touch Chips */}
          <div className="space-y-2 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Special Kitchen Instructions
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Quick chips below</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Less Spicy', emoji: '🌶️' },
                { label: 'Extra Crispy', emoji: '♨️' },
                { label: 'Sauce on Side', emoji: '🥣' },
                { label: 'Jain / No Onion Garlic', emoji: '🌿' },
                { label: "Chef's Special Style", emoji: '⭐' }
              ].map((chip) => {
                const text = `${chip.label} ${chip.emoji}`;
                const isActive = specialNotes.includes(chip.label);
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setSpecialNotes((prev) => {
                        if (prev.includes(chip.label)) {
                          return prev.replace(new RegExp(`(,\\s*)?${chip.label}\\s*${chip.emoji}?`, 'gi'), '').trim();
                        }
                        return prev ? `${prev}, ${text}` : text;
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer active:scale-95 flex items-center space-x-1 ${
                      isActive
                        ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-xs'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#0C831F] border-slate-200'
                    }`}
                  >
                    <span>{chip.emoji}</span>
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Less spicy, dressing on side, allergy notes..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-c-primary h-14 resize-none"
            />
          </div>

          {/* Gamified Spend More Incentive Banner */}
          {(() => {
            const currentSubtotal = items.reduce(
              (acc, it) => acc + (it.unitPrice ?? it.menuItem.price) * it.quantity,
              0
            );
            const spendTier = getSpendMoreProgress(currentSubtotal + totalPrice);
            if (!spendTier.isUnlocked) {
              return (
                <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center space-x-2 text-xs text-amber-950 shadow-2xs">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] leading-snug">
                    This dish brings table total to <strong className="font-mono text-emerald-800 font-black">₹{currentSubtotal + totalPrice}</strong>! Add <strong className="font-mono text-amber-900 font-bold">₹{spendTier.amountNeeded}</strong> more to unlock <span className="font-bold">{spendTier.reward}</span>.
                  </span>
                </div>
              );
            }
            return (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-900 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#0C831F] shrink-0" />
                <span className="text-[11px]">🎉 Table total qualifies for {spendTier.reward}!</span>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col space-y-2 shrink-0">
          {addonsCost > 0 && (
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 px-1">
              <span className="truncate">Selected add-ons: {chosenAddonNames.join(', ')}</span>
              <span className="font-mono shrink-0 ml-2 text-emerald-900">+₹{addonsCost * displayQuantity}</span>
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
              {/* Optional Remove from Cart button when item is already in cart */}
              {isUpdating && (
                <button
                  type="button"
                  onClick={handleRemoveFromCart}
                  className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-all cursor-pointer active:scale-90 shrink-0 shadow-2xs"
                  title="Remove from Cart"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.5] pointer-events-none" />
                </button>
              )}

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
                  <span className="sm:hidden">{isUpdating ? 'DONE' : 'ADD TO CART'}</span>
                  <span className="hidden sm:inline">{isUpdating ? 'DONE • IN CART' : 'ADD TO TABLE CART'}</span>
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
