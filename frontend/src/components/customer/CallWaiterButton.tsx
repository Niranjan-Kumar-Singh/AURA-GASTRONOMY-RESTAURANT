import React, { useState } from 'react';
import { Bell, Droplet, UtensilsCrossed, Receipt, CheckCircle, X, ShieldAlert, UserCheck, Coffee } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useCartStore } from '../../store/use-cart-store';

interface CallWaiterButtonProps {
  tableId?: string;
}

export const CallWaiterButton: React.FC<CallWaiterButtonProps> = ({ tableId = '14' }) => {
  const [isOpen, setIsOpen] = useState(false);
  useBodyScrollLock(isOpen);
  const [sentReason, setSentReason] = useState<string | null>(null);
  const { showToast } = useToast();
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasCart = itemCount > 0;

  const handleRequest = async (reason: string) => {
    setSentReason(reason);
    showToast(`Waiter alerted for Table ${tableId}: "${reason}"`, 'success');
    
    try {
      // 1. Dispatch waiter call to backend Express API
      await tableService.callWaiter(tableId, reason);

      // 2. Local fallback sync for instant tab response
      const existingAlerts = JSON.parse(localStorage.getItem('aura_waiter_alerts') || '[]');
      const newAlert = {
        id: Date.now(),
        tableId,
        reason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PENDING',
      };
      localStorage.setItem('aura_waiter_alerts', JSON.stringify([newAlert, ...existingAlerts]));
    } catch (err) {
      console.error('Failed to dispatch waiter call:', err);
    }

    setTimeout(() => {
      setIsOpen(false);
      setSentReason(null);
    }, 1500);
  };

  const options = [
    { label: 'Request Final Bill & Checkout', reason: 'Request Final Bill / Settlement', icon: <Receipt className="w-4.5 h-4.5 text-emerald-400" />, isPrimary: true },
    { label: 'Call Waiter to Table', reason: 'Call Waiter to Table', icon: <Bell className="w-4.5 h-4.5 text-[#38BDF8]" /> },
    { label: 'Water Refill', reason: 'Water Refill Request', icon: <Droplet className="w-4.5 h-4.5 text-sky-400" /> },
    { label: 'Extra Cutlery & Napkins', reason: 'Cutlery & Napkins Request', icon: <UtensilsCrossed className="w-4.5 h-4.5 text-[#7DD3FC]" /> },
    { label: 'Speak to Floor Manager', reason: 'Request Manager Assistance', icon: <UserCheck className="w-4.5 h-4.5 text-purple-400" /> },
  ];

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-40 p-2.5 sm:p-3.5 bg-[#F7D046] hover:bg-yellow-400 text-slate-900 font-extrabold rounded-full shadow-[0_4px_20px_rgba(247,208,70,0.35)] transition-all duration-300 hover:scale-105 flex items-center space-x-2 border-2 border-yellow-300 cursor-pointer ${
          hasCart
            ? 'bottom-[80px] right-4 sm:bottom-6 sm:right-6'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
        }`}
        title="Call Waiter"
      >
        <Bell className="w-5 h-5 text-slate-900 animate-pulse" />
        <span className="text-xs hidden sm:inline uppercase font-black tracking-wider text-slate-900">Call Waiter</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-slate-800">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 border border-amber-300 rounded-2xl">
                <Bell className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Call Waiter</h3>
                <p className="text-xs text-slate-500 font-medium">Table {tableId} • Request immediate table service</p>
              </div>
            </div>

            {sentReason ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-[#0C831F] mx-auto animate-bounce" />
                <p className="font-bold text-slate-900 text-sm">Alert Sent to Waiter</p>
                <p className="text-xs text-slate-500">"{sentReason}" — Waiter will arrive shortly.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleRequest(opt.reason)}
                    className={`w-full p-3.5 rounded-xl flex items-center space-x-3 text-xs font-bold transition-all cursor-pointer ${
                      opt.isPrimary
                        ? 'bg-emerald-50 border-2 border-emerald-500 hover:bg-emerald-100 text-emerald-900 shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 hover:translate-x-1'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
