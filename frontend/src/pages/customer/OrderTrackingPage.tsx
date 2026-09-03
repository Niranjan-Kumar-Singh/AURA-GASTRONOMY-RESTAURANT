import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, CheckCircle2, Clock, ArrowLeft, Plus, ChefHat, Flame, ShoppingBag, Receipt, Sparkles, Timer } from 'lucide-react';
import { CallWaiterButton } from '../../components/customer/CallWaiterButton';
import { HelpBotLauncher } from '../../components/customer/HelpBotLauncher';
import { useCartStore } from '../../store/use-cart-store';
import { orderService } from '../../services/order.service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
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
  paymentMethod?: string;
  invoiceNumber?: string;
  createdAt: string;
}

export const OrderTrackingPage: React.FC = () => {
  const { tableId = '10', orderId } = useParams<{ tableId?: string; orderId?: string }>();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  // Clear cart if items remain
  useEffect(() => {
    if (items.length > 0) {
      clearCart();
    }
  }, []);

  // Fetch active orders for this table's current session
  const fetchTableOrders = async () => {
    try {
      const data = await orderService.getOrdersByTable(tableId);
      if (Array.isArray(data)) {
        // Filter active session orders (unpaid or newly placed)
        const activeSessionOrders = data.filter(
          (ord: any) => ord.status !== 'cancelled' && ord.paymentStatus !== 'PAID'
        );
        const recentlyCancelled = data.filter(
          (ord: any) => ord.status === 'cancelled'
        );
        setOrders(activeSessionOrders);
        setCancelledOrders(recentlyCancelled);
      }
    } catch (err) {
      console.error('Failed to fetch table orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableOrders();
    // Auto-poll for status updates every 5 seconds
    const interval = setInterval(fetchTableOrders, 5000);
    return () => clearInterval(interval);
  }, [tableId, orderId]);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { key: 'received', label: 'Received', desc: 'Sent to kitchen' },
    { key: 'preparing', label: 'Preparing', desc: 'Chef cooking under wood fire' },
    { key: 'ready', label: 'Ready', desc: 'Ready for table delivery' },
    { key: 'completed', label: 'Served', desc: 'Bon appétit!' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'ready': return 2;
      case 'completed':
      case 'served': return 3;
      default: return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return { label: 'Received', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'preparing':
        return { label: 'Preparing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'ready':
        return { label: 'Ready to Serve', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'completed':
      case 'served':
        return { label: 'Served', color: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30' };
      default:
        return { label: status, color: 'bg-aura-slate/10 text-aura-slate border-aura-slate/30' };
    }
  };

  // Compute Grand Total for active orders in current dining session
  const grandSessionTotal = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Calculate Countdown & Elapsed Time for the Latest Active Order
  const getOrderTimerMetrics = (createdAtStr?: string, targetPrepMinutes = 15) => {
    if (!createdAtStr) return { remainingStr: '15:00', elapsedStr: '00:00', isOverdue: false };
    
    const createdTime = new Date(createdAtStr).getTime();
    const elapsedSecs = Math.max(0, Math.floor((nowTimestamp - createdTime) / 1000));
    const targetSecs = targetPrepMinutes * 60;
    const remainingSecs = targetSecs - elapsedSecs;

    const elapsedMins = Math.floor(elapsedSecs / 60);
    const elapsedRemSecs = elapsedSecs % 60;
    const elapsedStr = `${String(elapsedMins).padStart(2, '0')}:${String(elapsedRemSecs).padStart(2, '0')}`;

    if (remainingSecs <= 0) {
      return { remainingStr: '00:00', elapsedStr, isOverdue: true };
    }

    const remMins = Math.floor(remainingSecs / 60);
    const remSecs = remainingSecs % 60;
    const remainingStr = `${String(remMins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;

    return { remainingStr, elapsedStr, isOverdue: false };
  };

  const timerMetrics = getOrderTimerMetrics(latestOrder?.createdAt);

  return (
    <div className="min-h-screen bg-aura-obsidian text-aura-ivory pb-28 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-aura-obsidian/95 backdrop-blur-md border-b border-[#38BDF8]/20 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className="flex items-center space-x-2 text-xs font-semibold text-aura-slate hover:text-[#38BDF8] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Add More Dishes</span>
        </button>

        <div className="text-right">
          <h1 className="font-serif text-sm font-bold text-[#38BDF8] tracking-wide">
            TABLE {tableId} SESSION
          </h1>
          <p className="text-[10px] text-aura-slate uppercase font-mono">
            {orders.length} Active {orders.length === 1 ? 'Order' : 'Orders'}
          </p>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto space-y-6 pt-6">
        {/* Cancelled Order Notice Banner */}
        {cancelledOrders.length > 0 && (
          <div className="p-5 bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-red-500/50 rounded-3xl shadow-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 font-bold text-xs">
                  ⚠️ Notice
                </div>
                <span className="font-serif font-bold text-aura-ivory text-sm">Order Cancelled Notice</span>
              </div>
              <button
                onClick={() => setCancelledOrders([])}
                className="text-aura-slate hover:text-aura-ivory text-[11px] px-2.5 py-1 rounded-lg bg-aura-obsidian/60 border border-aura-border/60"
              >
                Dismiss
              </button>
            </div>

            {cancelledOrders.map((cOrd: any) => (
              <div key={cOrd._id || cOrd.orderId} className="p-3 bg-aura-obsidian/70 border border-red-500/30 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-red-300">
                  <span>Order #{cOrd.orderId}</span>
                  <span className="uppercase text-[10px] bg-red-500/20 px-2 py-0.5 rounded border border-red-500/40 font-mono">Cancelled</span>
                </div>
                <p className="text-aura-slate text-[11px]">Reason: <span className="text-aura-ivory font-medium">{cOrd.cancelReason || 'Kitchen timeout / Table issue'}</span></p>
              </div>
            ))}

            <div className="pt-2 flex items-center justify-between border-t border-red-500/20 text-xs">
              <p className="text-aura-slate text-[11px]">You can place new items anytime.</p>
              <button
                onClick={() => navigate(`/table/${tableId}/menu`)}
                className="px-4 py-2 bg-[#0EA5E9] text-[#090A0F] font-bold text-xs rounded-xl hover:bg-[#0284C7] transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order New Dishes</span>
              </button>
            </div>
          </div>
        )}
        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-4 bg-aura-container/50 rounded-3xl border border-aura-border p-8">
            <ChefHat className="w-10 h-10 text-[#38BDF8] animate-bounce mx-auto" />
            <p className="font-serif text-base text-white">Fetching Live Kitchen Status...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Active Orders State — Previous Bill Paid & Settled */
          <div className="py-16 text-center space-y-5 bg-aura-container/40 rounded-3xl border border-aura-border p-8 max-w-md mx-auto shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-white">Previous Bill Paid &amp; Settled</h2>
              <p className="text-xs text-aura-slate max-w-xs mx-auto mt-1">
                Your previous session at Table {tableId} has been settled. Place a new order anytime!
              </p>
            </div>
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="px-6 py-3.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 mx-auto cursor-pointer border border-[#7DD3FC]/50"
            >
              <Plus className="w-4 h-4" />
              <span>Browse Menu &amp; Place Order</span>
            </button>
          </div>
        ) : (
          <>
            {/* Live Progress Banner for the Latest Active Order */}
            {latestOrder && (
              <div className="bg-aura-container border border-[#38BDF8]/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8] animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#38BDF8] uppercase tracking-widest font-mono">Live Order Tracker</span>
                      <h2 className="font-serif text-base sm:text-xl font-bold text-white">
                        Order #{latestOrder.orderId}
                      </h2>
                    </div>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div className="self-start sm:self-auto text-left sm:text-right bg-[#090A0F]/90 border border-[#38BDF8]/20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl shadow-md">
                    {latestOrder.status === 'ready' ? (
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block font-mono">Kitchen Status</span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-400 animate-pulse">READY NOW</span>
                      </div>
                    ) : (latestOrder.status === 'completed' || latestOrder.status === 'served') ? (
                      <div>
                        <span className="text-[9px] text-[#38BDF8] font-bold uppercase block font-mono flex items-center sm:justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] mr-1" />
                          <span>Status</span>
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-[#38BDF8]">DELIVERED &amp; SERVED</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-aura-slate uppercase block font-mono flex items-center sm:justify-end space-x-1">
                          <Timer className="w-3 h-3 text-[#38BDF8] mr-1" />
                          <span>Est. Remaining</span>
                        </span>
                        <span className="font-mono text-sm sm:text-base font-extrabold text-[#38BDF8] tracking-wider">
                          {timerMetrics.remainingStr}
                        </span>
                        <span className="text-[9px] text-aura-slate/80 block font-mono">
                          Elapsed: {timerMetrics.elapsedStr}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="pt-3 pb-1">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#090A0F] -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-[#38BDF8] -translate-y-1/2 z-0 transition-all duration-700 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                      style={{ width: `${(getStepIndex(latestOrder.status) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, idx) => {
                      const currentStep = getStepIndex(latestOrder.status);
                      const isPassed = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                              isPassed
                                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] font-black'
                                : 'bg-[#090A0F] text-aura-slate border-aura-border'
                            } ${isCurrent ? 'ring-4 ring-[#38BDF8]/30 scale-110' : ''}`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 font-bold" /> : <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </div>
                          <span className={`text-[8px] sm:text-[10px] mt-1.5 font-bold uppercase tracking-wider text-center max-w-[65px] sm:max-w-none truncate ${isPassed ? 'text-white' : 'text-aura-slate'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Friendly Live Kitchen Status Description */}
                <div className="pt-3 text-center border-t border-aura-border/40 mt-3">
                  <p className="text-xs text-[#38BDF8] font-medium italic flex items-center justify-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>
                      {latestOrder.status === 'received' && 'Order ticket received! Queued with our kitchen team.'}
                      {latestOrder.status === 'preparing' && 'Chef is cooking your dishes under artisanal wood fire.'}
                      {latestOrder.status === 'ready' && `Dishes are ready! Your waiter is delivering to Table ${tableId}.`}
                      {latestOrder.status === 'completed' && `All items served at Table ${tableId}. Bon appétit!`}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* List of Active Orders Cards for Table Session */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-[#38BDF8]" />
                  <span>Active Session Orders (Table {tableId})</span>
                </h3>
                <span className="text-xs text-aura-slate font-mono">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {orders.map((ord, index) => {
                const badge = getStatusBadge(ord.status);

                return (
                  <div
                    key={ord._id || ord.orderId}
                    className="bg-aura-container border border-[#38BDF8]/20 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                  >
                    {/* Header bar of order card */}
                    <div className="flex items-center justify-between border-b border-aura-border/60 pb-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-white">
                            Order #{ord.orderId}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-[#38BDF8]/20 text-[#38BDF8] text-[9px] font-bold rounded-full uppercase tracking-wider">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-aura-slate font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Itemized list of this order */}
                    <div className="space-y-2.5 divide-y divide-aura-border/30">
                      {ord.items.map((it, i) => (
                        <div key={i} className="pt-2 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white">
                              {it.quantity}x {it.name}
                            </p>
                            {it.notes && (
                              <p className="text-[10px] text-emerald-400 italic">Note: {it.notes}</p>
                            )}
                          </div>
                          <span className="font-mono text-[#38BDF8] font-bold">
                            ₹{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal for this Order */}
                    <div className="border-t border-aura-border/60 pt-3 flex items-center justify-between text-xs">
                      <span className="text-aura-slate font-medium">Order #{ord.orderId} Subtotal</span>
                      <span className="font-mono font-bold text-white">₹{ord.total ? ord.total.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cumulative Grand Total Card for Active Session */}
            <div className="bg-gradient-to-r from-[#090A0F] via-aura-container to-[#090A0F] border-2 border-[#38BDF8]/40 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-aura-border/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-[#38BDF8]" />
                  <h3 className="font-serif text-lg font-bold text-white">
                    Active Table {tableId} Session Bill
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full border border-[#38BDF8]/30">
                  {orders.length} Active Orders
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {orders.map((ord) => (
                  <div key={ord._id || ord.orderId} className="flex justify-between text-aura-slate font-mono">
                    <span>Order #{ord.orderId} ({ord.items.length} items)</span>
                    <span className="text-white font-bold">₹{ord.total ? ord.total.toFixed(2) : '0.00'}</span>
                  </div>
                ))}

                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-aura-border">
                  <span>Current Active Session Total</span>
                  <span className="font-mono text-xl font-black text-[#38BDF8]">
                    ₹{grandSessionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add More Items CTA */}
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="w-full py-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xl shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Dishes To Table {tableId}</span>
            </button>
          </>
        )}
      </div>

      <CallWaiterButton tableId={tableId} />
      <HelpBotLauncher tableId={tableId} />
    </div>
  );
};
