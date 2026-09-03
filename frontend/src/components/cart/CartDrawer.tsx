import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/use-cart-store';
import { couponService } from '../../services/coupon.service';
import { orderService } from '../../services/order.service';
import { Coupon } from '../../types/menu.types';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, Utensils, Edit2, Sparkles, Gift, TrendingUp } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useAuthStore } from '../../store/use-auth-store';
import { useTableStore } from '../../store/use-table-store';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { AI_RECOMMENDED_PAIRINGS, getSpendMoreProgress } from '../../services/aiPairingEngine';

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
  tableId = '14',
}) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const { showToast } = useToast();
  const { items, addItem, updateQuantity, removeItem, updateSpecialNotes, clearCart } = useCartStore();
  const user = useAuthStore(state => state.user);
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
      (acc, it) => (it.menuItem.price > 0 ? acc + it.menuItem.price * it.quantity : acc),
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

  const subtotal = items.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);

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
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
          notes: item.specialNotes
        })),
        subtotal,
        tax: gstAmount + serviceCharge,
        discount,
        total: grandTotal,
        appliedCoupon: appliedCoupon?.code,
        sessionId: activeSessionId || undefined
      });
      setIsConfirmOpen(false);
      clearCart();
      onOrderPlaced(order.orderId);
      showToast('Order sent to kitchen successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end"
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-aura-container border-l border-aura-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
        >
          {/* Top Header */}
          <div className="p-4 border-b border-aura-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-white">Your Dining Cart</h2>
                <p className="text-[10px] text-[#38BDF8]/90 font-semibold tracking-wide">Gourmet Selection &amp; Add-ons</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-aura-slate hover:text-white rounded-full hover:bg-aura-obsidian cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scroll Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* Spend-More Gamified Tiered Discount & Freebie Unlocker */}
            {items.length > 0 && (() => {
              const spendTier = getSpendMoreProgress(subtotal);

              return (
                <div className="p-3 bg-gradient-to-r from-[#0EA5E9]/15 via-aura-obsidian to-[#38BDF8]/15 border border-[#38BDF8]/50 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-[#38BDF8]">
                      <Gift className="w-4 h-4 text-[#38BDF8] animate-bounce" />
                      <span>{spendTier.isUnlocked ? '🎉 Reward Unlocked!' : 'Spend & Unlock Rewards'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white font-bold bg-[#38BDF8]/20 px-2 py-0.5 rounded-full border border-[#38BDF8]/30">
                      Goal: ₹{spendTier.target}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-aura-obsidian h-2.5 rounded-full overflow-hidden border border-aura-border p-0.5">
                    <div
                      className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                      style={{ width: `${spendTier.percent}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {spendTier.isUnlocked ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-bold text-xs truncate mr-2">
                            {items.some(it => it.menuItem.price === 0) 
                              ? `✅ TIER ${spendTier.tierLevel} REWARD CLAIMED (1/1 PER TABLE)` 
                              : `🎉 TIER ${spendTier.tierLevel} UNLOCKED! Pick 1 Free Item:`}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                            100% OFF (₹0)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {spendTier.rewardOptions.map((opt) => {
                            const isClaimed = items.some(it => it.menuItem.id === opt.id && it.menuItem.price === 0);
                            const hasAnyClaimed = items.some(it => it.menuItem.price === 0);

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
                                    description: 'Complimentary gastronomy dining gift reward',
                                    price: 0,
                                    imageUrl: opt.imageUrl,
                                    isAvailable: true,
                                    isVegetarian: true,
                                    isGlutenFree: false,
                                    preparationTimeMinutes: 5,
                                  };
                                  addItem(freeRewardItem, 1);
                                  showToast(`🎉 Claimed FREE ${opt.name}! Added to table bill.`, 'success');
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                                  isClaimed
                                    ? 'bg-emerald-500 text-aura-obsidian border-emerald-400 font-black shadow-md'
                                    : 'bg-aura-obsidian/80 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                }`}
                              >
                                <span className="truncate">{isClaimed ? 'Claimed ✓' : opt.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-white text-[11px]">
                        Add <strong className="text-[#38BDF8] font-mono">₹{spendTier.amountNeeded}</strong> more for <span className="text-[#7DD3FC] font-bold">{spendTier.reward}</span>
                      </span>
                    )}
                  </div>

                  {/* Quick Booster Add Buttons */}
                  {!spendTier.isUnlocked && (
                    <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[9px] text-aura-slate shrink-0 uppercase font-bold">Quick Boost:</span>
                      {spendTier.quickBoosters.map((booster) => (
                        <button
                          key={booster.id}
                          onClick={() => {
                            const mockItem: any = {
                              id: booster.id,
                              categoryId: 99,
                              categoryName: 'Addon',
                              name: booster.name,
                              description: 'Quick order booster',
                              price: booster.price,
                              imageUrl: booster.imageUrl,
                              isAvailable: true,
                              isVegetarian: true,
                              isGlutenFree: false,
                              preparationTimeMinutes: 5,
                            };
                            addItem(mockItem, 1);
                            showToast(`Added "${booster.name}" (+₹${booster.price}) to hit goal!`, 'success');
                          }}
                          className="px-2 py-1 bg-[#38BDF8]/20 hover:bg-[#0EA5E9] text-[#38BDF8] hover:text-[#090A0F] border border-[#38BDF8]/40 rounded-lg text-[10px] font-bold shrink-0 transition-all flex items-center space-x-1 active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{booster.name} (+₹{booster.price})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Utensils className="w-12 h-12 text-aura-slate/50 mx-auto" />
                <p className="font-serif text-lg text-aura-ivory">Your table cart is empty</p>
                <p className="text-xs text-aura-slate">Browse our artisanal dishes and add them to your session</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="p-3.5 bg-aura-obsidian border border-aura-border/60 rounded-2xl space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-serif font-bold text-aura-ivory text-sm">{item.menuItem.name}</h4>
                        {item.menuItem.price === 0 && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md">
                            🎁 FREE REWARD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5 font-mono text-xs font-bold">
                        {item.menuItem.price === 0 ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="line-through text-aura-slate text-[11px]">₹90</span>
                            <span className="text-emerald-400 font-bold">₹0.00 (FREE)</span>
                          </div>
                        ) : (
                          <span className="text-[#38BDF8]">₹{item.menuItem.price * item.quantity}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="p-1 text-aura-slate hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity & Notes */}
                  <div className="flex flex-col space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-aura-container border border-aura-border px-2.5 py-1 rounded-xl w-fit">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="text-white hover:text-[#38BDF8] font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.menuItem.price === 0) {
                              showToast('Free reward is limited to 1 per table session!', 'info');
                              return;
                            }
                            updateQuantity(item.menuItem.id, item.quantity + 1);
                          }}
                          className={`font-bold ${item.menuItem.price === 0 ? 'text-aura-slate/40 cursor-not-allowed' : 'text-white hover:text-[#38BDF8]'}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Special Notes Section */}
                    {editingNoteId === item.menuItem.id ? (
                      <div className="flex items-center space-x-2 bg-aura-container border border-[#38BDF8]/40 p-1.5 rounded-xl">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Add special instructions..."
                          className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-aura-slate focus:outline-none px-2"
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
                          className="px-3 py-1 bg-[#0EA5E9] text-[#090A0F] text-[10px] font-black rounded-lg uppercase cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : item.specialNotes ? (
                      <div className="flex items-start justify-between bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl group cursor-pointer" onClick={() => { setEditingNoteId(item.menuItem.id); setTempNote(item.specialNotes || ''); }}>
                        <p className="text-xs text-emerald-400 leading-snug pr-2 italic">Note: {item.specialNotes}</p>
                        <Edit2 className="w-3.5 h-3.5 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNoteId(item.menuItem.id);
                          setTempNote('');
                        }}
                        className="text-[10px] font-bold text-aura-slate hover:text-[#38BDF8] flex items-center space-x-1 w-fit transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Kitchen Note</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* AI Gourmet Flavor Pairings & Cross-Sell Up-sell Rail */}
            {items.length > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-[#38BDF8]/10 via-aura-obsidian to-[#38BDF8]/10 border border-[#38BDF8]/40 rounded-2xl space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#38BDF8] animate-pulse" />
                    <span>AI Recommended Flavor Pairings</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Boost Taste
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar flex items-center space-x-3 py-1">
                  {AI_RECOMMENDED_PAIRINGS.map((pairing) => {
                    const isAlreadyInCart = items.some((it) => it.menuItem.id === pairing.id);

                    return (
                      <div
                        key={pairing.id}
                        className="w-44 bg-aura-obsidian border border-aura-border/70 hover:border-[#38BDF8]/60 rounded-xl p-2.5 shrink-0 space-y-2 shadow-md flex flex-col justify-between"
                      >
                        <div className="flex items-start space-x-2">
                          <img
                            src={pairing.imageUrl}
                            alt={pairing.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-aura-border"
                          />
                          <div className="min-w-0">
                            <h5 className="font-serif font-bold text-white text-xs truncate leading-tight">
                              {pairing.name}
                            </h5>
                            <span className="font-mono text-[#38BDF8] font-bold text-[11px]">₹{pairing.price}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const mockItem: any = {
                              id: pairing.id,
                              categoryId: 99,
                              categoryName: pairing.category,
                              name: pairing.name,
                              description: pairing.description,
                              price: pairing.price,
                              imageUrl: pairing.imageUrl,
                              isAvailable: true,
                              isVegetarian: true,
                              isGlutenFree: false,
                              preparationTimeMinutes: 10,
                            };
                            addItem(mockItem, 1);
                            showToast(`Added "${pairing.name}" (+₹${pairing.price}) to Cart`, 'success');
                          }}
                          disabled={isAlreadyInCart}
                          className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                            isAlreadyInCart
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : 'bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black shadow-md active:scale-95 border border-[#7DD3FC]/50'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAlreadyInCart ? 'Added' : 'Add Item'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coupons Section */}
            {items.length > 0 && (
              <div className="p-4 bg-aura-obsidian/60 border border-aura-border rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#38BDF8]">
                  <Tag className="w-4 h-4" />
                  <span>Offers & Promo Coupons</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-emerald-400">"{appliedCoupon.code}" Applied</p>
                      <p className="text-[10px] text-aura-slate">Savings of ₹{appliedCoupon.discountAmount}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
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
                      placeholder="Enter promo code"
                      className="flex-1 bg-aura-container border border-aura-border p-2.5 rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none focus:border-[#38BDF8]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50 rounded-xl text-xs font-bold hover:bg-[#0EA5E9] hover:text-[#090A0F] transition-colors cursor-pointer"
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
            <div className="p-4 bg-aura-obsidian border-t border-aura-border space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-aura-slate">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-aura-slate">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-aura-slate pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeServiceCharge}
                      onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                      className="rounded accent-[#0EA5E9]"
                    />
                    <span>Add Optional 5% Staff Service Charge</span>
                  </label>
                  {includeServiceCharge && <span className="font-mono">₹{serviceCharge.toFixed(2)}</span>}
                </div>

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-aura-border">
                  <span>Grand Total</span>
                  <span className="font-mono text-[#38BDF8]">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
              >
                SEND TO KITCHEN (₹{grandTotal.toFixed(2)})
              </button>
            </div>
          )}
        </div>
      </div>

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
