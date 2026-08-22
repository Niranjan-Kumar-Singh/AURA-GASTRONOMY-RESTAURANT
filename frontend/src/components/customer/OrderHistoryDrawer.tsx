import React, { useState, useEffect } from 'react';
import { X, History, Utensils, CalendarClock, ChevronRight, Loader } from 'lucide-react';
import { orderService } from '../../services/order.service';
import { useAuthStore } from '../../store/use-auth-store';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getOrderBadge = (order: any) => {
  if (order.paymentStatus === 'REFUNDED') {
    return { label: 'REFUNDED & VOID', style: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
  }
  if (order.paymentStatus === 'PAID') {
    return { label: 'PAID & SETTLED', style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
  }
  const s = String(order.status || '').toLowerCase();
  if (s === 'served' || s === 'completed') {
    return { label: 'FOOD SERVED', style: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
  }
  if (s === 'ready') {
    return { label: 'READY TO SERVE', style: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
  }
  if (s === 'preparing') {
    return { label: 'PREPARING', style: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
  }
  return { label: 'ORDER PLACED', style: 'text-aura-slate bg-aura-obsidian border-aura-border' };
};

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (user?.phone) {
        const data = await orderService.getOrdersByPhone(user.phone);
        setOrders(data);
      } else {
        const tableIdMatch = window.location.pathname.match(/\/table\/(\d+)/);
        const currentTable = tableIdMatch ? tableIdMatch[1] : (localStorage.getItem('aura_current_table_id') || '5');
        const data = await orderService.getOrdersByTable(currentTable);
        setOrders(data);
      }
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
              <p className="text-xs text-aura-slate">Your past dining sessions &amp; receipts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-aura-obsidian hover:bg-black rounded-full text-aura-ivory transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-aura-gold" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-aura-slate text-sm">No past orders found.</div>
          ) : (
            orders.map((order) => {
              const badge = getOrderBadge(order);
              const orderNum = order.orderId || `ORD-${String(order._id || '').slice(-4).toUpperCase()}`;

              return (
                <div 
                  key={order._id || order.orderId} 
                  onClick={() => setSelectedReceipt(order)}
                  className="p-5 rounded-2xl bg-aura-container border border-aura-border hover:border-aura-gold/40 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CalendarClock className="w-4 h-4 text-aura-gold" />
                      <span className="text-xs font-bold text-aura-ivory">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${badge.style}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-aura-obsidian flex items-center justify-center shrink-0 border border-aura-border">
                      <Utensils className="w-5 h-5 text-aura-slate" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-aura-ivory group-hover:text-aura-gold transition-colors">Order #{orderNum}</p>
                      <p className="text-xs text-aura-slate line-clamp-1">{order.items?.length || 0} Recipe Item(s)</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-aura-border flex items-center justify-between">
                    <span className="font-mono font-bold text-aura-gold">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    <div className="flex items-center space-x-1 text-xs text-aura-gold group-hover:underline font-semibold">
                      <span>View Receipt</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Digital Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedReceipt(null)}>
            <div className="bg-white text-gray-900 rounded-3xl max-w-sm w-full p-6 space-y-4 font-mono text-xs shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1 border-b border-gray-200 pb-3">
                <h3 className="font-serif font-black text-lg text-gray-900 tracking-wider">AURA GASTRONOMY</h3>
                <p className="text-[10px] text-gray-500 font-sans">Digital Order Receipt</p>
              </div>

              <div className="space-y-1 bg-gray-50 p-3 rounded-xl text-[11px] border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-bold">{selectedReceipt.orderId || selectedReceipt._id}</span>
                </div>
                {selectedReceipt.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice #:</span>
                    <span className="font-bold">{selectedReceipt.invoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Table #:</span>
                  <span className="font-bold">Table {selectedReceipt.tableId || selectedReceipt.tableNumber || '5'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-emerald-700 uppercase">{selectedReceipt.paymentStatus === 'PAID' ? 'PAID & SETTLED' : 'COMPLETED'}</span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1">
                  <span className="col-span-7">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-3 text-right">Price</span>
                </div>
                {selectedReceipt.items?.map((it: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 text-xs py-1 border-b border-gray-100">
                    <span className="col-span-7 font-medium text-gray-800">{it.name}</span>
                    <span className="col-span-2 text-center text-gray-500">{it.quantity || it.qty || 1}</span>
                    <span className="col-span-3 text-right font-bold text-gray-900">₹{((it.quantity || 1) * (it.price || 0)).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-300 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{(selectedReceipt.subtotal || selectedReceipt.total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST Tax</span>
                  <span>₹{(selectedReceipt.tax || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-900">
                  <span>TOTAL</span>
                  <span>₹{(selectedReceipt.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
