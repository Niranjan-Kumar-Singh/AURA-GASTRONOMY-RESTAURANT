import React, { useState, useEffect } from 'react';
import { X, History, Utensils, CalendarClock, ChevronRight, Loader } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { useAuthStore } from '../../store/use-auth-store';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({ isOpen, onClose }) => {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await orderService.getOrdersByPhone(user.phone);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-aura-obsidian border-l border-aura-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 relative"
      >
        <div className="p-6 border-b border-aura-border flex items-center justify-between bg-aura-container">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-aura-ivory">Order History</h2>
              <p className="text-xs text-aura-slate">Your past dining sessions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-aura-gold" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-aura-slate text-sm">No past orders found.</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="p-5 rounded-2xl bg-aura-container border border-aura-border hover:border-aura-gold/40 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <CalendarClock className="w-4 h-4 text-aura-gold" />
                    <span className="text-xs font-bold text-aura-ivory">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-full">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-aura-obsidian flex items-center justify-center shrink-0 border border-aura-border">
                    <Utensils className="w-5 h-5 text-aura-slate" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-aura-ivory group-hover:text-aura-gold transition-colors">ORD-{order._id.substring(0, 4).toUpperCase()}</p>
                    <p className="text-xs text-aura-slate line-clamp-1">{order.items.length} items</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-aura-border flex items-center justify-between">
                  <span className="font-mono font-bold text-aura-gold">₹{order.totalAmount}</span>
                  <div className="flex items-center space-x-1 text-xs text-aura-slate group-hover:text-aura-ivory transition-colors">
                    <span>View Receipt</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
