import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, CheckCircle2, Clock, ArrowLeft, Plus, ChefHat, Flame, ShoppingBag, Receipt, Sparkles, Timer } from 'lucide-react';
import { CallWaiterButton } from '../../components/customer/CallWaiterButton';
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
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

export const OrderTrackingPage: React.FC = () => {
  const { tableId = '10', orderId } = useParams<{ tableId?: string; orderId?: string }>();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  // Clear cart if items remain
  useEffect(() => {
    if (items.length > 0) {
      clearCart();
    }
  }, []);

  // Fetch all orders for this table
  const fetchTableOrders = async () => {
    try {
      const data = await orderService.getOrdersByTable(tableId);
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch table orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTableOrders();
    // Auto-poll for status updates every 6 seconds
    const interval = setInterval(fetchTableOrders, 6000);
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
      case 'completed': return 3;
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
        return { label: 'Served', color: 'bg-aura-gold/10 text-aura-gold border-aura-gold/30' };
      default:
        return { label: status, color: 'bg-aura-slate/10 text-aura-slate border-aura-slate/30' };
    }
  };

  // Compute Grand Total for all orders placed at this table
  const grandSessionTotal = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Calculate Countdown & Elapsed Time for the Latest Order
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
      <header className="sticky top-0 z-30 bg-aura-obsidian/95 backdrop-blur-md border-b border-aura-border/60 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className="flex items-center space-x-2 text-xs font-semibold text-aura-slate hover:text-aura-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Add More Dishes</span>
        </button>

        <div className="text-right">
          <h1 className="font-serif text-sm font-bold text-aura-gold tracking-wide">
            TABLE {tableId} SESSION
          </h1>
          <p className="text-[10px] text-aura-slate uppercase font-mono">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Fired
          </p>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto space-y-6 pt-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-4 bg-aura-container/50 rounded-3xl border border-aura-border p-8">
            <ChefHat className="w-10 h-10 text-aura-gold animate-bounce mx-auto" />
            <p className="font-serif text-base text-aura-ivory">Fetching Live Kitchen Status...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders Fallback */
          <div className="py-16 text-center space-y-4 bg-aura-container/40 rounded-3xl border border-aura-border p-8">
            <ShoppingBag className="w-12 h-12 text-aura-slate/40 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-aura-ivory">No Orders Placed Yet</h2>
            <p className="text-xs text-aura-slate max-w-xs mx-auto">Browse the menu to place your first order for Table {tableId}.</p>
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="px-6 py-3 bg-aura-gold text-aura-obsidian font-bold text-xs rounded-xl shadow-lg"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Live Progress Banner for the Latest Active Order */}
            {latestOrder && (
              <div className="bg-aura-container border border-aura-gold/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl flex items-center justify-center">
                      <Flame className="w-6 h-6 text-aura-gold animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-aura-gold uppercase tracking-widest font-mono">Live Order Tracker</span>
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-aura-ivory">
                        Order #{latestOrder.orderId}
                      </h2>
                    </div>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div className="text-right bg-aura-obsidian/90 border border-aura-border/80 px-4 py-2 rounded-2xl shadow-md">
                    {latestOrder.status === 'ready' ? (
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block font-mono">Kitchen Status</span>
                        <span className="font-mono text-sm font-extrabold text-emerald-400 animate-pulse">READY NOW</span>
                      </div>
                    ) : latestOrder.status === 'completed' ? (
                      <div>
                        <span className="text-[9px] text-aura-gold font-bold uppercase block font-mono">Kitchen Status</span>
                        <span className="font-mono text-sm font-extrabold text-aura-gold">SERVED</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] text-aura-slate uppercase block font-mono flex items-center justify-end space-x-1">
                          <Timer className="w-3 h-3 text-amber-400 mr-1" />
                          <span>Est. Remaining</span>
                        </span>
                        <span className="font-mono text-base font-extrabold text-aura-gold tracking-wider">
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
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-aura-obsidian -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-aura-gold -translate-y-1/2 z-0 transition-all duration-700"
                      style={{ width: `${(getStepIndex(latestOrder.status) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, idx) => {
                      const currentStep = getStepIndex(latestOrder.status);
                      const isPassed = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                              isPassed
                                ? 'bg-aura-gold text-aura-obsidian border-aura-gold font-bold'
                                : 'bg-aura-obsidian text-aura-slate border-aura-border'
                            } ${isCurrent ? 'ring-4 ring-aura-gold/30 scale-110' : ''}`}
                          >
                            {isPassed ? <CheckCircle2 className="w-5 h-5 font-bold" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isPassed ? 'text-aura-ivory' : 'text-aura-slate'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Friendly Live Kitchen Status Description */}
                <div className="pt-3 text-center border-t border-aura-border/40 mt-3">
                  <p className="text-xs text-aura-gold font-medium italic flex items-center justify-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-aura-gold" />
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

            {/* List of Orders Cards for Table Session */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-aura-gold" />
                  <span>Orders Fired For Table {tableId}</span>
                </h3>
                <span className="text-xs text-aura-slate font-mono">
                  {orders.length} {orders.length === 1 ? 'Card' : 'Cards'}
                </span>
              </div>

              {orders.map((ord, index) => {
                const badge = getStatusBadge(ord.status);

                return (
                  <div
                    key={ord._id || ord.orderId}
                    className="bg-aura-container border border-aura-border rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                  >
                    {/* Header bar of order card */}
                    <div className="flex items-center justify-between border-b border-aura-border/60 pb-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-aura-ivory">
                            Order #{ord.orderId}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-aura-gold/20 text-aura-gold text-[9px] font-bold rounded-full uppercase tracking-wider">
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
                            <p className="font-bold text-aura-ivory">
                              {it.quantity}x {it.name}
                            </p>
                            {it.notes && (
                              <p className="text-[10px] text-emerald-400 italic">Note: {it.notes}</p>
                            )}
                          </div>
                          <span className="font-mono text-aura-gold font-bold">
                            ₹{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal & Total for this Order */}
                    <div className="border-t border-aura-border/60 pt-3 flex items-center justify-between text-xs">
                      <span className="text-aura-slate font-medium">Order #{ord.orderId} Subtotal</span>
                      <span className="font-mono font-bold text-aura-ivory">₹{ord.total ? ord.total.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cumulative Grand Total Card & Paid Tax Invoice for the Entire Table Session */}
            <div className="bg-gradient-to-r from-aura-obsidian via-aura-container to-aura-obsidian border-2 border-aura-gold/50 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-aura-border/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-aura-gold" />
                  <h3 className="font-serif text-lg font-bold text-aura-ivory">
                    Cumulative Table {tableId} Session Bill
                  </h3>
                </div>
                {orders.some((o: any) => o.paymentStatus === 'PAID') ? (
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/50 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BILL PAID & SETTLED</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-aura-gold/10 text-aura-gold rounded-full border border-aura-gold/30">
                    {orders.length} Total Orders
                  </span>
                )}
              </div>

              {/* Paid Invoice Header */}
              {orders.some((o: any) => o.paymentStatus === 'PAID') && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1 font-mono text-xs text-emerald-300">
                  <div className="flex justify-between font-bold">
                    <span>Tax Invoice #:</span>
                    <span>{(orders.find((o: any) => o.invoiceNumber) as any)?.invoiceNumber || 'INV-PAID-SETTLED'}</span>
                  </div>
                  <div className="flex justify-between text-[11px] opacity-80">
                    <span>Payment Method:</span>
                    <span>{(orders.find((o: any) => o.paymentMethod) as any)?.paymentMethod || 'UPI QR'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] opacity-70">
                    <span>Status:</span>
                    <span className="uppercase font-bold text-emerald-400">Payment Confirmed & Verified</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                {orders.map((ord) => (
                  <div key={ord._id || ord.orderId} className="flex justify-between text-aura-slate font-mono">
                    <span>Order #{ord.orderId} ({ord.items.length} items)</span>
                    <span className="text-aura-ivory font-bold">₹{ord.total ? ord.total.toFixed(2) : '0.00'}</span>
                  </div>
                ))}

                <div className="flex justify-between text-base font-bold text-aura-ivory pt-3 border-t border-aura-border">
                  <span>Grand Session Bill</span>
                  <span className="font-mono text-xl font-black text-aura-gold">
                    ₹{grandSessionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add More Items CTA */}
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="w-full py-4 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xl shadow-aura-gold/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Dishes To Table {tableId}</span>
            </button>
          </>
        )}
      </div>

      <CallWaiterButton tableId={tableId} />
    </div>
  );
};
