import React, { useState } from 'react';
import { Bell, Droplet, UtensilsCrossed, Receipt, CheckCircle, X, ShieldAlert, UserCheck, Coffee } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';

interface CallWaiterButtonProps {
  tableId?: string;
}

export const CallWaiterButton: React.FC<CallWaiterButtonProps> = ({ tableId = '14' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sentReason, setSentReason] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleRequest = (reason: string) => {
    setSentReason(reason);
    showToast(`Waiter alerted for Table ${tableId}: "${reason}"`, 'success');
    
    // Store in localStorage for Waiter Dashboard synchronization
    const existingAlerts = JSON.parse(localStorage.getItem('aura_waiter_alerts') || '[]');
    const newAlert = {
      id: Date.now(),
      tableId,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    };
    localStorage.setItem('aura_waiter_alerts', JSON.stringify([newAlert, ...existingAlerts]));

    setTimeout(() => {
      setIsOpen(false);
      setSentReason(null);
    }, 1500);
  };

  const options = [
    { label: 'General Assistance', reason: 'General Table Assistance', icon: <Bell className="w-4 h-4 text-aura-gold" /> },
    { label: 'Water Refill', reason: 'Water Refill Request', icon: <Droplet className="w-4 h-4 text-sky-400" /> },
    { label: 'Need Napkins & Tissues', reason: 'Napkins & Tissues Request', icon: <UtensilsCrossed className="w-4 h-4 text-amber-400" /> },
    { label: 'Need Spoon & Fork', reason: 'Need Extra Cutlery', icon: <UtensilsCrossed className="w-4 h-4 text-emerald-400" /> },
    { label: 'Need Extra Plate', reason: 'Need Extra Plate', icon: <UtensilsCrossed className="w-4 h-4 text-purple-400" /> },
    { label: 'Need Salt & Pepper', reason: 'Need Salt & Pepper Shakers', icon: <Coffee className="w-4 h-4 text-amber-300" /> },
    { label: 'Request Final Bill', reason: 'Request Final Bill / Settlement', icon: <Receipt className="w-4 h-4 text-aura-emerald" /> },
    { label: 'Speak to Manager', reason: 'Request Floor Manager Assistance', icon: <UserCheck className="w-4 h-4 text-purple-400" /> },
    { label: 'Emergency Assistance', reason: 'Emergency Table Assistance', icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
  ];

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 p-3.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 border border-aura-gold/40"
        title="Call Waiter"
      >
        <Bell className="w-5 h-5 animate-pulse" />
        <span className="text-xs hidden sm:inline uppercase font-bold tracking-wider">Call Waiter</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-aura-container border border-aura-gold/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl">
                <Bell className="w-6 h-6 text-aura-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-aura-ivory">Call Waiter</h3>
                <p className="text-xs text-aura-slate">Table {tableId} • Request immediate table service</p>
              </div>
            </div>

            {sentReason ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-aura-emerald mx-auto animate-bounce" />
                <p className="font-bold text-aura-ivory text-sm">Alert Sent to Waiter</p>
                <p className="text-xs text-aura-slate">"{sentReason}" — Waiter will arrive shortly.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleRequest(opt.reason)}
                    className="w-full p-3 bg-aura-obsidian border border-aura-border/60 hover:border-aura-gold rounded-xl flex items-center space-x-3 text-xs font-semibold text-aura-ivory transition-all hover:translate-x-1"
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
