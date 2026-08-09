import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/use-cart-store';
import { couponService } from '../../services/coupon.service';
import { orderService } from '../../services/order.service';
import { Coupon } from '../../types/menu.types';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, Utensils, Edit2 } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useAuthStore } from '../../store/use-auth-store';
import { useTableStore } from '../../store/use-table-store';

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
  const { showToast } = useToast();
  const { items, updateQuantity, removeItem, updateSpecialNotes, clearCart } = useCartStore();
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

  const subtotal = items.reduce((acc, it) => acc + it.menuItem.price * it.quantity, 0);
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-aura-container border-l border-aura-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300"
        >
          {/* Top Header */}
          <div className="p-4 border-b border-aura-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-aura-gold/10 border border-aura-gold/30 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-aura-gold" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-aura-ivory">Active Table Cart</h2>
                <p className="text-[10px] text-aura-slate">Table {tableId} • VIP Session</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-aura-obsidian"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scroll Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
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
                      <h4 className="font-serif font-bold text-aura-ivory text-sm">{item.menuItem.name}</h4>
                      <p className="font-mono text-aura-gold text-xs font-bold mt-0.5">₹{item.menuItem.price * item.quantity}</p>
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
                          className="text-aura-ivory hover:text-aura-gold font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="text-aura-ivory hover:text-aura-gold font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Special Notes Section */}
                    {editingNoteId === item.menuItem.id ? (
                      <div className="flex items-center space-x-2 bg-aura-container border border-aura-gold/40 p-1.5 rounded-xl">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Add special instructions..."
                          className="flex-1 bg-transparent border-none text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none px-2"
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
                          className="px-3 py-1 bg-aura-gold text-aura-obsidian text-[10px] font-bold rounded-lg uppercase"
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
                        className="text-[10px] font-bold text-aura-slate hover:text-aura-gold flex items-center space-x-1 w-fit transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Kitchen Note</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Coupons Section */}
            {items.length > 0 && (
              <div className="p-4 bg-aura-obsidian/60 border border-aura-border rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-aura-gold">
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
                      className="text-[10px] text-rose-400 font-bold hover:underline"
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
                      className="flex-1 bg-aura-container border border-aura-border p-2.5 rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none focus:border-aura-gold"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 bg-aura-gold/20 text-aura-gold border border-aura-gold/50 rounded-xl text-xs font-bold hover:bg-aura-gold hover:text-aura-obsidian transition-colors"
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
                      className="rounded accent-aura-gold"
                    />
                    <span>Add Optional 5% Staff Service Charge</span>
                  </label>
                  {includeServiceCharge && <span className="font-mono">₹{serviceCharge.toFixed(2)}</span>}
                </div>

                <div className="flex justify-between text-base font-bold text-aura-ivory pt-2 border-t border-aura-border">
                  <span>Grand Total</span>
                  <span className="font-mono text-aura-gold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsConfirmOpen(true)}
                className="w-full py-4 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl"
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
