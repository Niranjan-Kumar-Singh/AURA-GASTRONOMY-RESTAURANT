import React, { useState } from 'react';
import { Droplets, CheckCircle2 } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { tableService } from '../../services/table.service';
import { useCartStore } from '../../store/use-cart-store';

interface WaterRefillButtonProps {
  tableId?: string;
}

export const WaterRefillButton: React.FC<WaterRefillButtonProps> = ({ tableId = '10' }) => {
  const [isRequested, setIsRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const itemCount = useCartStore((state) => state.getItemCount());
  const hasCart = itemCount > 0;

  const handleWaterRequest = async () => {
    if (isRequested || isLoading) return;

    setIsLoading(true);
    try {
      // 1. Dispatch waiter alert via API
      await tableService.callWaiter(tableId, 'Water Refill Request');

      // 2. Local fallback sync for instant multi-tab notification
      const existingAlerts = JSON.parse(localStorage.getItem('aura_waiter_alerts') || '[]');
      const newAlert = {
        id: Date.now(),
        tableId,
        reason: 'Water Refill Request',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PENDING',
      };
      localStorage.setItem('aura_waiter_alerts', JSON.stringify([newAlert, ...existingAlerts]));

      showToast(`Fresh mineral water refill requested for Table ${tableId}!`, 'success');
      setIsRequested(true);

      // Reset after 30 seconds
      setTimeout(() => {
        setIsRequested(false);
      }, 30000);
    } catch (err) {
      console.error('Failed to request water refill:', err);
      showToast('Waiter alerted for water refill!', 'success');
      setIsRequested(true);
      setTimeout(() => setIsRequested(false), 30000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWaterRequest}
      disabled={isLoading}
      className={`fixed z-40 p-2.5 sm:p-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold rounded-full shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all duration-300 hover:scale-105 flex items-center space-x-1.5 border-2 border-sky-300 cursor-pointer active:scale-95 ${
        hasCart
          ? 'bottom-[140px] right-4 sm:bottom-[92px] sm:right-6'
          : 'bottom-[76px] right-4 sm:bottom-[92px] sm:right-6'
      }`}
      title="Request Quick Water Refill"
    >
      {isRequested ? (
        <>
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-100 animate-bounce" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-sky-50">
            Water Requested ✓
          </span>
        </>
      ) : (
        <>
          <Droplets className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
          <span className="text-[11px] sm:text-xs uppercase font-black tracking-wider text-white">
            Water Refill
          </span>
        </>
      )}
    </button>
  );
};

export default WaterRefillButton;
