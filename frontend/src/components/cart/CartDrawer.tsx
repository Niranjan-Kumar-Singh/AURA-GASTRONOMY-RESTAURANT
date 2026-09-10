import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/use-cart-store';
import { couponService } from '../../services/coupon.service';
import { orderService } from '../../services/order.service';
import { Coupon } from '../../types/menu.types';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, Utensils, Edit2, Sparkles, Gift, Zap, Flame, Leaf, Star, ChefHat } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useAuthStore } from '../../store/use-auth-store';
import { useTableStore } from '../../store/use-table-store';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_RECOMMENDED_PAIRINGS, getSpendMoreProgress } from '../../services/aiPairingEngine';

const CART_TIPS = [
  { icon: '🔥', text: 'Add a dessert before you place your order — served at the perfect moment!' },
  { icon: '🥂', text: 'Pair your mains with a chilled mocktail or fresh-squeezed juice.' },
  { icon: '🌿', text: 'Add a Smoked Burani Raita — the cooling contrast makes curries taste incredible.' },
  { icon: '🍞', text: 'Our Wood-Fired Garlic Naan sells out by 9 PM — get yours now!' },
  { icon: '⭐', text: 'Orders above ₹2,000 unlock a complimentary dessert of your choice.' },
];

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
  tableId?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  tableId = '10',
}) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { showToast } = useToast();
  const { items, addItem, updateQuantity, removeItem, updateSpecialNotes, clearCart, getSubtotal } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const { activeSessionId } = useTableStore();

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEditingNoteId(null);
    }
  }, [isOpen]);

  // Automatic Free Reward Revocation Guard if subtotal drops below required threshold
  useEffect(() => {
    if (!items.length) return;

    const paidSubtotal = items.reduce(
      (acc, it) => (it.menuItem.price > 0 ? acc + (it.unitPrice ?? it.menuItem.price) * it.quantity : acc),
      0
    );

    const freeItem = items.find((it) => it.menuItem.price === 0);
    if (!freeItem) return;

    const itemId = freeItem.menuItem.id;

    // Tier 3 rewards: id 9907 (Lava Cake), 9908 (Gelato) requires paidSubtotal >= 2000
    if ((itemId === 9907 || itemId === 9908) && paidSubtotal < 2000) {
      removeItem(itemId);
      showToast(`Revoked Free Reward (${freeItem.menuItem.name}) — Subtotal is under ₹2,000`, 'info');
      return;
    }

    // Tier 2 rewards: id 9904 (Lime Soda), 9906 (Truffle Dip) requires paidSubtotal >= 1000
    if ((itemId === 9904 || itemId === 9906) && paidSubtotal < 1000) {
      removeItem(itemId);
      showToast(`Revoked Free Reward (${freeItem.menuItem.name}) — Subtotal is under ₹1,000`, 'info');
      return;
    }

    // Tier 1 rewards (or any free reward) requires paidSubtotal >= 500
    if (paidSubtotal < 500) {
      removeItem(itemId);
      showToast(`Revoked Free Reward (${freeItem.menuItem.name}) — Subtotal is under ₹500 minimum`, 'info');
    }
  }, [items, removeItem, showToast]);

  const subtotal = getSubtotal();

  // Automatic Coupon Revocation Guard if subtotal drops below required threshold
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderAmount) {
      const revokedCode = appliedCoupon.code;
      setAppliedCoupon(null);
      showToast(`Revoked coupon "${revokedCode}" — Subtotal dropped below ₹${appliedCoupon.minOrderAmount}`, 'info');
    }
  }, [subtotal, appliedCoupon, showToast]);

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const gstAmount = taxableSubtotal * 0.05; // 5% Indian GST
  const serviceCharge = includeServiceCharge ? taxableSubtotal * 0.05 : 0;
  const grandTotal = taxableSubtotal + gstAmount + serviceCharge;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await couponService.validateCoupon(couponCode);
      if (subtotal < coupon.minOrderAmount) {
        showToast(`Minimum order amount of ₹${coupon.minOrderAmount} required for ${coupon.code}`, 'error');
        return;
      }
      setAppliedCoupon(coupon);
      setCouponCode('');
      showToast(`Applied coupon "${coupon.code}" (-₹${coupon.discountAmount})`, 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Invalid coupon', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const handleConfirmSubmit = async () => {
    try {
      const order = await orderService.placeOrder({
        tableId,
        customerPhone: user?.phone,
        customerName: user?.name,
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.unitPrice ?? item.menuItem.price,
          notes: item.specialNotes,
        })),
        subtotal,
        tax: gstAmount + serviceCharge,
        discount,
        total: grandTotal,
        appliedCoupon: appliedCoupon?.code,
        sessionId: activeSessionId || undefined,
      });
      setIsConfirmOpen(false);
      clearCart();
      onOrderPlaced(order.orderId);
      showToast('Order placed! Kitchen is preparing your dishes.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex justify-end"
            onClick={onClose}
          >
            <motion.div
              key="cart-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-full md:max-w-md bg-white md:border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl relative"
            >
          {/* Top Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-c-primary-light border border-c-primary-border/30 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-c-primary" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Your Table Cart</h2>
                <p className="text-xs text-slate-500 font-medium">Table {tableId} • Live Kitchen Dispatch</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rotating Cart Tips Banner */}
          {items.length > 0 && (() => {
            const tipIdx = Math.floor(Date.now() / 8000) % CART_TIPS.length;
            const tip = CART_TIPS[tipIdx % CART_TIPS.length];
            return (
              <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center space-x-2.5 text-xs shadow-sm">
                <span className="text-base shrink-0">{tip.icon}</span>
                <span className="text-emerald-900 font-semibold leading-snug">{tip.text}</span>
              </div>
            );
          })()}
          {items.length === 0 && (
            <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center space-x-2 text-xs text-emerald-900 font-bold shadow-sm">
              <Zap className="w-4 h-4 text-c-primary shrink-0" />
              <span>⚡ Kitchen Dispatch Guarantee: 12–15 Minutes</span>
            </div>
          )}

          {/* Cart Items Scroll Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5 custom-scrollbar">
            {/* Gamified Tiered Discount & Freebie Unlocker */}
            {items.length > 0 && (() => {
              const spendTier = getSpendMoreProgress(subtotal);

              return (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span>{spendTier.isUnlocked ? '🎉 Reward Unlocked!' : 'Spend & Unlock Rewards'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Goal: ₹{spendTier.target}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-c-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${spendTier.percent}%` }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    {spendTier.isUnlocked ? (
                      <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-900 font-bold text-xs truncate mr-2">
                            {items.some((it) => it.menuItem.price === 0)
                              ? `✅ Tier ${spendTier.tierLevel} Reward Claimed`
                              : `🎉 Tier ${spendTier.tierLevel} Unlocked! Pick 1 Free Item:`}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-200 px-2 py-0.5 rounded-full">
                            100% OFF (₹0)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {spendTier.rewardOptions.map((opt) => {
                            const isClaimed = items.some((it) => it.menuItem.id === opt.id && it.menuItem.price === 0);
                            const hasAnyClaimed = items.some((it) => it.menuItem.price === 0);

                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  if (hasAnyClaimed && !isClaimed) {
                                    showToast('Free tier reward already claimed for this table session!', 'info');
                                    return;
                                  }
                                  if (isClaimed) {
                                    removeItem(opt.id);
                                    showToast(`Removed free reward "${opt.name}"`, 'info');
                                    return;
                                  }
                                  const freeRewardItem: any = {
                                    id: opt.id,
                                    categoryId: 99,
                                    categoryName: 'Rewards',
                                    name: `${opt.name} (Complimentary Tier ${spendTier.tierLevel})`,
                                    description: 'Complimentary dining reward',
                                    price: 0,
                                    imageUrl: opt.imageUrl,
                                    isAvailable: true,
                                    isVegetarian: true,
                                    isGlutenFree: false,
                                    preparationTimeMinutes: 5,
                                  };
                                  addItem(freeRewardItem, 1);
                                  showToast(`🎉 Claimed FREE ${opt.name}! Added to cart.`, 'success');
                                }}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                                  isClaimed
                                    ? 'bg-[#0C831F] text-white border-[#0C831F] shadow-sm'
                                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                <span className="truncate">{isClaimed ? 'Claimed ✓' : opt.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px]">
                        Add <strong className="text-emerald-700 font-mono">₹{spendTier.amountNeeded}</strong> more for <span className="text-slate-800 font-bold">{spendTier.reward}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-base text-slate-700">Your table cart is empty</p>
                <p className="text-xs text-slate-400">Browse dishes from the menu and add them to your table order</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="p-3.5 bg-white border border-slate-300 rounded-2xl space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.menuItem.name}</h4>
                        {item.menuItem.price === 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            FREE GIFT
                          </span>
                        )}
                      </div>

                      {/* Price & Addon Calculation Breakdown */}
                      <div className="mt-0.5 space-y-1">
                        <div className="flex items-baseline space-x-1.5 font-mono text-xs font-bold text-slate-800">
                          {item.menuItem.price === 0 ? (
                            <span className="text-emerald-700 font-bold">₹0.00 (Complimentary)</span>
                          ) : (
                            <>
                              <span className="text-sm font-black text-slate-900">
                                ₹{((item.unitPrice ?? item.menuItem.price) * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-[11px] font-normal text-slate-500 font-sans">
                                (₹{item.unitPrice ?? item.menuItem.price} × {item.quantity})
                              </span>
                            </>
                          )}
                        </div>

                        {/* Add-ons Detail & Quantity Notice */}
                        {item.addonNames && item.addonNames.length > 0 && (
                          <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-0.5">
                            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-900">
                              <Sparkles className="w-3 h-3 text-[#0C831F] shrink-0" />
                              <span className="truncate">Add-ons: {item.addonNames.join(', ')}</span>
                            </div>
                            <p className="text-[10px] text-emerald-800 font-medium">
                              ✓ All {item.quantity} portion{item.quantity > 1 ? 's' : ''} prepared with selected add-ons.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Special Instructions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5 bg-[#0C831F] text-white px-2 py-1 rounded-xl shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-7 h-7 sm:w-6 sm:h-6 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="font-mono text-xs sm:text-sm font-black min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.menuItem.price === 0) {
                            showToast('Free reward is limited to 1 per table session!', 'info');
                            return;
                          }
                          updateQuantity(item.menuItem.id, item.quantity + 1);
                        }}
                        className={`w-7 h-7 sm:w-6 sm:h-6 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90 ${
                          item.menuItem.price === 0 ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Special Notes */}
                    {editingNoteId === item.menuItem.id ? (
                      <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 p-1 rounded-lg">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="e.g. less spicy, extra dip"
                          className="w-32 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none px-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateSpecialNotes(item.menuItem.id, tempNote);
                              setEditingNoteId(null);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            updateSpecialNotes(item.menuItem.id, tempNote);
                            setEditingNoteId(null);
                          }}
                          className="px-2 py-0.5 bg-[#0C831F] text-white text-[10px] font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : item.specialNotes ? (
                      <div
                        className="flex items-center space-x-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg cursor-pointer"
                        onClick={() => {
                          setEditingNoteId(item.menuItem.id);
                          setTempNote(item.specialNotes || '');
                        }}
                      >
                        <span className="text-[10px] text-emerald-800 font-medium italic truncate max-w-[130px]">
                          Note: {item.specialNotes}
                        </span>
                        <Edit2 className="w-3 h-3 text-emerald-700 shrink-0" />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNoteId(item.menuItem.id);
                          setTempNote('');
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Cooking Note</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* AI-Powered Pairing Suggestions */}
            {items.length > 0 && AI_RECOMMENDED_PAIRINGS.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Pairs Perfectly With Your Order</span>
                </div>
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                  {AI_RECOMMENDED_PAIRINGS.slice(0, 5).map((rec) => (
                    <div
                      key={rec.id}
                      className="flex-none w-36 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => {
                        // close cart and let user add from menu
                      }}
                    >
                      <div className="h-24 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={rec.imageUrl}
                          alt={rec.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {rec.badge && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 bg-[#0C831F] text-white rounded-full shadow-sm">
                            {rec.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-2 space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-900 line-clamp-2 leading-snug">{rec.name}</p>
                        <p className="text-[10px] font-black text-slate-800 font-mono">₹{rec.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coupons Section */}
            {items.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Promo Code & Discounts</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-emerald-900">"{appliedCoupon.code}" Applied</p>
                      <p className="text-[10px] text-emerald-700 font-medium">You saved ₹{appliedCoupon.discountAmount}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Try 'WELCOME100'"
                      className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-c-primary"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-c-primary text-white rounded-xl text-xs font-bold hover:bg-c-primary-dark transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 pb-6 sm:pb-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-mono text-slate-900 font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-c-primary font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-500">
                    <input
                      type="checkbox"
                      checked={includeServiceCharge}
                      onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                      className="rounded accent-c-primary"
                    />
                    <span>Add Optional 5% Staff Tip</span>
                  </label>
                  {includeServiceCharge && <span className="font-mono font-bold">₹{serviceCharge.toFixed(2)}</span>}
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>To Pay</span>
                  <span className="font-mono text-base text-slate-900 font-black">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-3.5 bg-c-primary hover:bg-c-primary-dark text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-between px-5"
              >
                <span>SEND ORDER TO KITCHEN</span>
                <span className="font-mono text-sm font-black">₹{grandTotal.toFixed(2)}</span>
              </button>
            </div>
          )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderConfirmationModal
        tableId={tableId}
        isOpen={isConfirmOpen}
        items={items}
        appliedCoupon={appliedCoupon}
        subtotal={subtotal}
        discount={discount}
        gstAmount={gstAmount}
        grandTotal={grandTotal}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
};
export default CartDrawer;
