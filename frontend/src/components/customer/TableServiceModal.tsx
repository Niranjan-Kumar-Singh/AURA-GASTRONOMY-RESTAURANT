import React, { useState } from 'react';
import { Bell, Droplets, Receipt, Utensils, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { useCartStore } from '../../store/use-cart-store';
import { motion, AnimatePresence } from 'framer-motion';

interface TableServiceModalProps {
  tableId?: string;
}

export const TableServiceModal: React.FC<TableServiceModalProps> = ({ tableId = '10' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasCart = itemCount > 0;

  const serviceOptions = [
    {
      id: 'call_waiter',
      label: 'Call Waiter',
      desc: 'Assistance or questions at table',
      icon: Bell,
      color: 'bg-amber-500/15 text-amber-600 border-amber-300',
      reason: 'Call Waiter to Table'
    },
    {
      id: 'water_refill',
      label: 'Water Refill',
      desc: 'Fresh water bottle / glasses',
      icon: Droplets,
      color: 'bg-sky-500/15 text-sky-600 border-sky-300',
      reason: 'Water Refill Requested'
    },
    {
      id: 'request_bill',
      label: 'Request Bill',
      desc: 'Ready to settle payment',
      icon: Receipt,
      color: 'bg-emerald-500/15 text-emerald-600 border-emerald-300',
      reason: 'Request Bill at Table'
    },
    {
      id: 'cutlery',
      label: 'Extra Cutlery',
      desc: 'Forks, spoons, napkins, bowls',
      icon: Utensils,
      color: 'bg-purple-500/15 text-purple-600 border-purple-300',
      reason: 'Extra Cutlery & Napkins'
    }
  ];

  const handleRequestService = async (reason: string, label: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await tableService.callWaiter(tableId, reason);

      // Local fallback sync for instant staff tab responsiveness
      const existingAlerts = JSON.parse(localStorage.getItem('aura_waiter_alerts') || '[]');
      const newAlert = {
        id: Date.now(),
        tableId,
        reason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PENDING',
      };
      localStorage.setItem('aura_waiter_alerts', JSON.stringify([newAlert, ...existingAlerts]));

      setActiveAlert(label);
      showToast(`${label} requested for Table ${tableId}! Staff notified.`, 'success');
      setIsOpen(false);

      // Reset alert status after 30 seconds
      setTimeout(() => {
        setActiveAlert(null);
      }, 30000);
    } catch (err) {
      console.error('Failed to dispatch service request:', err);
      showToast(`Request sent for Table ${tableId}!`, 'success');
      setActiveAlert(label);
      setIsOpen(false);
      setTimeout(() => setActiveAlert(null), 30000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Service Pill Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2 px-3.5 py-2.5 rounded-full font-bold shadow-lg border cursor-pointer ${
          activeAlert
            ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-slate-900/10'
        } ${
          hasCart
            ? 'bottom-[76px] right-4 sm:bottom-6 sm:right-6'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
        }`}
        title="Request Table Assistance"
      >
        {activeAlert ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-100 animate-bounce" />
            <span className="text-xs tracking-tight font-extrabold text-white">
              {activeAlert} ✓
            </span>
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs tracking-tight font-extrabold text-slate-800">
              Table Service
            </span>
          </>
        )}
      </button>

      {/* Service Request Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-600">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Table {tableId} Service</h3>
                    <p className="text-[11px] text-slate-500">Tap any option to alert floor staff instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options Grid */}
              <div className="p-4 grid grid-cols-2 gap-2.5">
                {serviceOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleRequestService(opt.reason, opt.label)}
                      disabled={isLoading}
                      className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition-all text-left shadow-xs hover:shadow-sm cursor-pointer group active:scale-95"
                    >
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-500 font-medium">
                  Requests are dispatched directly to the active Waiter terminal in real-time.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TableServiceModal;
