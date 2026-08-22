import React from 'react';
import { CartItem, Coupon } from '../../types/menu.types';
import { Utensils, ShieldCheck, X, Clock } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface OrderConfirmationModalProps {
  tableId: string;
  isOpen: boolean;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  tableId,
  isOpen,
  items,
  appliedCoupon,
  subtotal,
  discount,
  gstAmount,
  grandTotal,
  onConfirm,
  onCancel,
}) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-aura-container border border-aura-gold/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-aura-slate hover:text-aura-ivory rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl">
            <Utensils className="w-6 h-6 text-aura-gold" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-aura-ivory">Confirm Dining Order</h3>
            <p className="text-xs text-aura-gold/90 font-semibold">Direct Kitchen Dispatch</p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-aura-obsidian border border-aura-border/40 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-aura-ivory">{item.quantity}x {item.menuItem.name}</p>
                {item.specialNotes && (
                  <p className="text-[10px] text-amber-300 italic font-medium">Note: {item.specialNotes}</p>
                )}
              </div>
              <span className="font-mono text-aura-gold font-bold">₹{item.menuItem.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Tax & Discount Breakdown */}
        <div className="border-t border-aura-border pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-aura-slate">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span className="font-mono">-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-aura-slate">
            <span>GST (5%)</span>
            <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-aura-ivory pt-2 border-t border-aura-border">
            <span>Total Active Bill</span>
            <span className="font-mono text-aura-gold">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-2 text-xs text-amber-300 font-semibold">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Kitchen prep starts immediately upon confirmation.</span>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="w-1/3 py-3 bg-aura-obsidian border border-aura-border text-aura-slate hover:text-aura-ivory rounded-2xl text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRM ORDER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
