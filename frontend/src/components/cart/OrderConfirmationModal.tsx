import React, { useState } from 'react';
import { CartItem, Coupon } from '../../types/menu.types';
import { Utensils, ShieldCheck, X, Clock, Loader2, Phone, User as UserIcon, Sparkles, CheckCircle2, Edit2 } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';
import { useAuthStore } from '../../store/use-auth-store';
import { authService } from '../../services/auth.service';
import { useToast } from '../feedback/ToastContainer';

interface OrderConfirmationModalProps {
  tableId: string;
  isOpen: boolean;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  onConfirm: (phone?: string, name?: string) => Promise<void> | void;
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
  const { user, setAuth } = useAuthStore();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onCancel);

  if (!isOpen) return null;

  const cleanDigits = phone.replace(/\D/g, '').slice(-10);
  const isPhoneValid = cleanDigits.length === 10;
  const isIdentified = !!user?.phone && !isEditingPhone;

  const handleConfirmClick = async () => {
    if (isSubmitting) return;

    // Strict validation: Mobile number is mandatory to place order
    if (!isIdentified && !isPhoneValid) {
      showToast('A valid 10-digit mobile number is mandatory to place your order.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhone = user?.phone || cleanDigits;
      let finalName = user?.name || name.trim() || undefined;

      // If user wasn't logged in, log in / enroll with number only
      if (!user?.phone || isEditingPhone) {
        const authData = await authService.loginWithPhone(cleanDigits, name.trim() || undefined);
        setAuth(authData.user, authData.token || authData.accessToken, tableId);
        finalPhone = authData.user.phone;
        finalName = authData.user.name;

        if (authData.isNewUser) {
          showToast(`Welcome to AURA Club, ${authData.user.name}! 🎁 +100 Loyalty Coins credited.`, 'success');
        }
      }

      await onConfirm(finalPhone, finalName);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar">
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

        {/* Mandatory Customer Mobile Number Section */}
        {isIdentified ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>+91 {user?.phone}</span>
                  {user?.name && <span className="text-slate-500 font-normal">({user.name})</span>}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{user?.loyaltyPoints || 0} AURA Loyalty Coins Active</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditingPhone(true);
                setPhone(user?.phone || '');
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-gradient-to-br from-amber-50/90 to-emerald-50/90 border-2 border-emerald-500/40 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Mobile Number <span className="text-red-500">* (Mandatory)</span>
                </span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">
                Easy 1-Step
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Required for live kitchen updates, digital receipt, and earning cashback coins.
            </p>

            <div className="space-y-2">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-black text-slate-500 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full pl-11 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0C831F] transition-all tracking-wider font-mono shadow-sm"
                />
              </div>

              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0C831F] transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold bg-amber-100/70 px-2 py-1 rounded-lg">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Welcome Gift on this number:
              </span>
              <span className="font-mono text-emerald-800 font-black">+100 Welcome Coins</span>
            </div>
          </div>
        )}

        {/* Order Items Preview */}
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
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
        <div className="border-t border-slate-200 pt-2.5 space-y-1 text-xs">
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

          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Total Active Bill</span>
            <span className="font-mono text-[#0C831F] font-black text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-[11px] text-amber-800 font-semibold">
          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Kitchen preparation begins immediately upon confirmation.</span>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmClick}
            disabled={isSubmitting || (!isIdentified && !isPhoneValid)}
            className="flex-1 py-3.5 bg-[#0C831F] hover:bg-[#096918] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Sending to Kitchen...</span>
              </>
            ) : !isIdentified && !isPhoneValid ? (
              <span>ENTER 10-DIGIT MOBILE NUMBER</span>
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
