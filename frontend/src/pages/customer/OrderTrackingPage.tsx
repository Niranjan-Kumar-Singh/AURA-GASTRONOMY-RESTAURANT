import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Utensils, CheckCircle2, Clock, ArrowLeft, Plus, ChefHat, Receipt,
  Sparkles, Star, Coffee, AlertCircle, RefreshCw, ChevronRight, Check
} from 'lucide-react';
import { TableServiceModal } from '../../components/customer/TableServiceModal';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { useCartStore } from '../../store/use-cart-store';
import { useTableStore } from '../../store/use-table-store';
import { useToast } from '../../components/feedback/ToastContainer';
import { orderService } from '../../services/order.service';
import { tableService } from '../../services/table.service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  status?: string;
  cancelReason?: string;
}

interface OrderData {
  _id: string;
  orderId: string;
  tableId: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'served' | 'cancelled';
  paymentStatus?: string;
  createdAt: string;
}

export const OrderTrackingPage: React.FC = () => {
  const { tableId: paramTableId, orderId } = useParams<{ tableId?: string; orderId?: string }>();
  const activeStoreTableId = useTableStore((state) => state.activeTableId);
  const tableId = activeStoreTableId || paramTableId || '10';
  const navigate = useNavigate();
  const { items, clearCart, getItemCount } = useCartStore();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchOrders = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      if (orderId) {
        const singleOrder = await orderService.getOrder(orderId);
        if (singleOrder) {
          setActiveOrder(singleOrder);
          setOrders([singleOrder]);
        }
      } else {
        const tableOrders = await orderService.getOrdersByTable(tableId);
        if (tableOrders && tableOrders.length > 0) {
          setOrders(tableOrders);
          setActiveOrder(tableOrders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order status:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [orderId, tableId]);

  const stages = [
    { key: 'received', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Kitchen acknowledged order' },
    { key: 'preparing', label: 'Chef Cooking', icon: ChefHat, desc: 'Prepared fresh in kitchen' },
    { key: 'ready', label: 'Plated & Ready', icon: Utensils, desc: 'Waiter is bringing to table' },
    { key: 'served', label: 'Served at Table', icon: Check, desc: 'Enjoy your meal!' },
  ];

  const getStageIndex = (status?: string) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'served':
      case 'completed': return 3;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(activeOrder?.status);

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans pb-32 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/menu')}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Table {tableId}
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Order Status
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {activeOrder?.orderId || orderId ? `Order #${activeOrder?.orderId || orderId}` : 'Live Order Tracking'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh Status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#059669]' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Connecting to Kitchen KDS...</p>
          </div>
        ) : !activeOrder ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-base font-extrabold text-slate-800">No active order found for this table</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to dine? Browse the menu and place your order directly from your phone.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-[#059669] text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Browse Digital Menu
            </button>
          </div>
        ) : (
          <>
            {/* Live Visual Stepper Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
                    <ChefHat className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Live Kitchen Status
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize mt-0.5">
                      {activeOrder.status === 'received' && 'Order Received & Confirmed'}
                      {activeOrder.status === 'preparing' && 'Chef is Preparing Your Food'}
                      {activeOrder.status === 'ready' && 'Your Dishes are Ready to Serve!'}
                      {(activeOrder.status === 'served' || activeOrder.status === 'completed') && 'Food Served — Bon Appétit!'}
                      {activeOrder.status === 'cancelled' && 'Order Cancelled'}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Placed At</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-100 -z-0">
                  <div
                    className="h-full bg-[#059669] transition-all duration-700"
                    style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 relative z-10">
                  {stages.map((stg, idx) => {
                    const isPassed = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    const Icon = stg.icon;

                    return (
                      <div key={stg.key} className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCurrent
                              ? 'bg-[#059669] text-white border-emerald-400 shadow-[0_0_12px_rgba(5,150,105,0.4)] scale-110'
                              : isPassed
                              ? 'bg-emerald-100 text-[#059669] border-[#059669]'
                              : 'bg-white text-slate-300 border-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-slate-900' : isPassed ? 'text-emerald-800' : 'text-slate-400'}`}>
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Order Summary ({activeOrder.items?.length || 0} Items)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {activeOrder.paymentStatus ? `Status: ${activeOrder.paymentStatus}` : 'Pay at Counter / Table'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeOrder.items?.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 bg-slate-100 rounded text-slate-700 font-mono font-bold text-[11px] flex items-center justify-center">
                        {it.quantity}×
                      </span>
                      <span className="font-bold text-slate-900">{it.name}</span>
                      {it.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                          Note: {it.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      ₹{((it.price || 0) * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">₹{(activeOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono tabular-nums">-₹{activeOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (GST 5%)</span>
                  <span className="font-mono tabular-nums">₹{(activeOrder.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="font-mono font-black text-[#059669] text-base tabular-nums">
                    ₹{(activeOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button to Add More Dishes */}
            <button
              onClick={() => navigate('/menu')}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold rounded-2xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Dishes to Table {tableId}</span>
            </button>
          </>
        )}
      </main>

      {/* Floating Active Cart Bar when items > 0 */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-[#059669] hover:bg-[#047857] text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-[0_8px_30px_rgba(5,150,105,0.45)] flex items-center justify-between border-2 border-emerald-400 active:scale-95 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-white text-[#059669] rounded-full text-xs flex items-center justify-center font-black">
                {getItemCount()}
              </span>
              <span className="tracking-wide uppercase font-black text-white text-xs">View Cart</span>
            </div>
            <div className="font-mono font-black text-sm text-white">
              ₹{items.reduce((sum, it) => sum + (it.unitPrice ?? it.menuItem.price) * it.quantity, 0).toFixed(2)} ➔
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
        onOrderPlaced={() => {
          fetchOrders();
        }}
      />

      {/* Single Unified Floating Table Service Trigger */}
      <TableServiceModal tableId={tableId} />
    </div>
  );
};

export default OrderTrackingPage;
