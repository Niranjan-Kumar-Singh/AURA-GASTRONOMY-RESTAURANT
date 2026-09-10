import React, { useState } from 'react';
import { CartItem, Coupon } from '../../types/menu.types';
import { Utensils, ShieldCheck, X, Clock, Loader2 } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';

interface OrderConfirmationModalProps {
  tableId: string;
  isOpen: boolean;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  onConfirm: () => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onCancel);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full disabled:opacity-40 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-[#0C831F] shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Confirm Table Order</h3>
            <p className="text-xs text-emerald-700 font-bold">Table {tableId} • Direct Kitchen Dispatch</p>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{item.quantity}x {item.menuItem.name}</p>
                {item.specialNotes && (
                  <p className="text-[10px] text-amber-700 italic font-medium">Note: {item.specialNotes}</p>
                )}
              </div>
              <span className="font-mono text-[#0C831F] font-black">₹{item.menuItem.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Tax & Discount Breakdown */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono text-slate-700">₹{subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-[#0C831F] font-bold">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span className="font-mono">-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500">
            <span>GST (5%)</span>
            <span className="font-mono text-slate-700">₹{gstAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Active Bill</span>
            <span className="font-mono text-[#0C831F] font-black text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-xs text-amber-800 font-semibold">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Kitchen preparation begins immediately upon confirmation.</span>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending to Kitchen...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIRM ORDER</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default OrderConfirmationModal;
