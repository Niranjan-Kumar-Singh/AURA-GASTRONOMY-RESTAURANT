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
      const addonsStr = `Add-ons: ${chosenAddonNames.join(', ')}`;
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
        updateQuantity(item.id, 0);
        setLocalQuantity(1);
      }
    } else {
      setLocalQuantity(Math.max(1, localQuantity - 1));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 max-h-[92dvh] sm:max-h-[88vh] overflow-hidden text-slate-800"
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
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
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
                  const isChecked = !!selectedAddons[addon.id];

                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-100/80 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'bg-[#0C831F] border-[#0C831F] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate font-semibold">{addon.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">+₹{addon.price}</span>
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
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0C831F] h-16 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
          {item.isAvailable === false ? (
            <button
              disabled
              className="w-full py-3 px-6 bg-slate-200 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
            >
              OUT OF STOCK
            </button>
          ) : isUpdating ? (
            <div className="w-full flex items-center justify-between bg-[#0C831F] text-white rounded-2xl p-2 shadow-md">
              <button
                onClick={handleDecrement}
                className="w-9 h-9 bg-black/20 hover:bg-black/30 rounded-xl flex items-center justify-center text-white transition-transform active:scale-90"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex flex-col items-center justify-center">
                <span className="font-mono font-black text-lg">{displayQuantity}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">In Cart</span>
              </div>

              <button
                onClick={handleIncrement}
                className="w-9 h-9 bg-black/20 hover:bg-black/30 rounded-xl flex items-center justify-center text-white transition-transform active:scale-90"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-3.5 px-6 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-2xl text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-between cursor-pointer"
            >
              <span>Add To Cart</span>
              <span className="font-mono text-base">₹{totalPrice}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default DishDetailModal;
