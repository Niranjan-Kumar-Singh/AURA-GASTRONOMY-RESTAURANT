import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Utensils, CheckCircle2, Clock, ArrowLeft, Plus, ChefHat, ShoppingBag, Receipt,
  Sparkles, Zap, Star, Coffee, Heart, MessageCircle, Gift, Flame, Leaf, Music2,
  ArrowRight, Wifi, Phone
} from 'lucide-react';
import { CallWaiterButton } from '../../components/customer/CallWaiterButton';
import { HelpBotLauncher } from '../../components/customer/HelpBotLauncher';
import { useCartStore } from '../../store/use-cart-store';
import { orderService } from '../../services/order.service';
import { menuService } from '../../services/menu.service';
import { MenuItem } from '../../types/menu.types';

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

// Chef wisdom rotating messages
const CHEF_WISDOM = [
  "Our chef marinates the proteins for 24 hours before cooking — each bite tells that story.",
  "Every dish is finished with hand-harvested Himalayan sea salt. Taste the difference.",
  "We source our vegetables fresh from local farms every morning — today's harvest is in your order.",
  "The secret to our Biryani? Slow-cooked on dum for 45 minutes. Worth every second.",
  "Our masalas are stone-ground in-house — no packaged spices enter our kitchen.",
  "Our chef trained under a Michelin-starred kitchen in Lyon, France before returning home.",
  "The ghee we use is churned fresh every morning from A2 milk from our partner dairy.",
];

// Fun dining facts
const DINING_FACTS = [
  "Did you know? Fine dining restaurants typically spend 40% of their budget on fresh ingredients.",
  "The word 'restaurant' comes from the French 'restaurer' meaning 'to restore oneself'.",
  "Humans can detect 5 primary tastes: sweet, sour, salty, bitter and umami.",
  "Indian cuisine uses over 25 different spices — more than any other cuisine in the world!",
  "The best way to taste wine or complex dishes is to breathe in through your nose while eating.",
  "Cooking with cast iron can actually increase the iron content of your food by up to 20%.",
];

// Suggested add-ons when order is in kitchen
const QUICK_ADD_SUGGESTIONS = [
  { emoji: '🥗', label: 'Add a Salad', hint: 'Pair with your mains' },
  { emoji: '🍞', label: 'Order Bread', hint: 'Naan or Roti' },
  { emoji: '🥤', label: 'Add Drinks', hint: 'Mocktails & Lassi' },
  { emoji: '🍮', label: 'Save Dessert', hint: 'Add to queue now' },
];

export const OrderTrackingPage: React.FC = () => {
  const { tableId = '10', orderId } = useParams<{ tableId?: string; orderId?: string }>();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());
  const [wisdomIndex, setWisdomIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);

  // Clear cart if items remain
  useEffect(() => {
    if (items.length > 0) {
      clearCart();
    }
  }, []);

  // Rotate chef wisdom every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWisdomIndex((prev) => (prev + 1) % CHEF_WISDOM.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Rotate dining facts every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % DINING_FACTS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Fetch a few dessert / beverage suggestions from real menu
  useEffect(() => {
    menuService.getMenuItems({}).then((items) => {
      const picks = items
        .filter((it) => it.isAvailable !== false)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      setSuggestedItems(picks);
    }).catch(() => {});
  }, []);

  // Fetch active orders for this table's current session
  const fetchTableOrders = async () => {
    try {
      const data = await orderService.getOrdersByTable(tableId);
      if (Array.isArray(data)) {
        const activeSessionOrders = data.filter(
          (ord: any) => ord.status !== 'cancelled' && ord.paymentStatus !== 'PAID'
        );
        const recentlyCancelled = data.filter((ord: any) => ord.status === 'cancelled');
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
    const interval = setInterval(fetchTableOrders, 5000);
    return () => clearInterval(interval);
  }, [tableId, orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { key: 'received', label: 'Received', desc: 'Sent to kitchen', icon: '📋' },
    { key: 'preparing', label: 'Preparing', desc: 'Chef cooking fresh', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', desc: 'Ready for delivery', icon: '✅' },
    { key: 'completed', label: 'Served', desc: 'Bon appétit!', icon: '🍽️' },
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
      case 'received': return { label: 'Received', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'preparing': return { label: 'In Kitchen', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ready': return { label: 'Ready', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'completed':
      case 'served': return { label: 'Served', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const grandSessionTotal = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const getKitchenStatus = (status: string) => {
    switch (status) {
      case 'received': return { text: 'Order received and queued in kitchen.', color: 'text-amber-700' };
      case 'preparing': return { text: 'Chef is cooking your dishes fresh right now.', color: 'text-emerald-700' };
      case 'ready': return { text: `All dishes ready! Waiter is heading to Table ${tableId}.`, color: 'text-sky-700' };
      case 'completed':
      case 'served': return { text: `Everything served. Enjoy your meal! 🍽️`, color: 'text-purple-700' };
      default: return { text: 'Kitchen team is processing your order.', color: 'text-slate-600' };
    }
  };

  return (
    <div className="page-theme-customer min-h-screen bg-[#F4F6F8] text-slate-800 pb-32 font-sans">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-sm gap-2">
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#0C831F] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back<span className="hidden xs:inline"> to Menu</span></span>
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <div className="w-2 h-2 bg-[#0C831F] rounded-full animate-pulse shrink-0" />
          <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
            <span>Table {tableId}</span>
            <span className="hidden sm:inline"> — Live Tracker</span>
          </h1>
        </div>

        <div className="flex items-center space-x-1 text-[10px] font-bold text-[#0C831F] uppercase tracking-wider shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <Wifi className="w-3 h-3" />
          <span>Live</span>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4 pt-4">
        {/* Cancelled Order Notice */}
        {cancelledOrders.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 text-xs">Order Update</span>
              <button onClick={() => setCancelledOrders([])} className="text-xs text-rose-600 hover:underline">
                Dismiss
              </button>
            </div>
            {cancelledOrders.map((cOrd: any) => (
              <p key={cOrd._id || cOrd.orderId} className="text-xs text-rose-700">
                Order #{cOrd.orderId} was cancelled ({cOrd.cancelReason || 'Kitchen update'}).
              </p>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <ChefHat className="w-10 h-10 text-[#0C831F] animate-bounce mx-auto" />
            <p className="font-bold text-sm text-slate-700">Fetching Live Order Status...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="space-y-4">
            {/* Empty Active Orders */}
            <div className="py-12 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">No Pending Orders</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your Table {tableId} session is all caught up. Ready to order something delicious?
                </p>
              </div>
              <button
                onClick={() => navigate(`/table/${tableId}/menu`)}
                className="px-6 py-3 bg-[#0C831F] hover:bg-[#096918] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Browse Menu &amp; Order</span>
              </button>
            </div>

            {/* Chef Wisdom even on empty state */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <ChefHat className="w-4 h-4 text-[#0C831F]" />
                <span>Chef's Corner</span>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">{CHEF_WISDOM[wisdomIndex]}</p>
            </div>
          </div>
        ) : (
          <>
            {/* === LIVE ORDER TRACKER === */}
            {latestOrder && (
              <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
                {/* Status color bar */}
                <div
                  className={`h-1.5 w-full transition-all duration-700 ${
                    latestOrder.status === 'received' ? 'bg-amber-400' :
                    latestOrder.status === 'preparing' ? 'bg-[#0C831F]' :
                    latestOrder.status === 'ready' ? 'bg-sky-400 animate-pulse' :
                    'bg-purple-500'
                  }`}
                />

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-[#0C831F] shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#0C831F] uppercase tracking-wider">Live Tracker</span>
                        <h2 className="text-sm sm:text-base font-black text-slate-900">Order #{latestOrder.orderId}</h2>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(latestOrder.status).color}`}
                    >
                      {getStatusBadge(latestOrder.status).label}
                    </span>
                  </div>

                  {/* Timeline Stepper */}
                  <div className="py-2">
                    <div className="relative flex items-start justify-between">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 z-0" />
                      <div
                        className="absolute top-4 left-0 h-1 bg-[#0C831F] z-0 transition-all duration-700"
                        style={{ width: `${(getStepIndex(latestOrder.status) / (steps.length - 1)) * 100}%` }}
                      />

                      {steps.map((step, idx) => {
                        const currentStep = getStepIndex(latestOrder.status);
                        const isPassed = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-sm ${
                                isPassed
                                  ? 'bg-[#0C831F] text-white border-[#0C831F]'
                                  : 'bg-white text-slate-400 border-slate-300'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                            >
                              {isPassed ? '✓' : step.icon}
                            </div>
                            <div className="text-center">
                              <span className={`text-[9px] font-bold uppercase tracking-wider block ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[8px] text-emerald-600 font-medium">{step.desc}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kitchen message */}
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl">
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${getKitchenStatus(latestOrder.status).color}`}>
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      {getKitchenStatus(latestOrder.status).text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* === ENGAGEMENT SECTION: Chef's Wisdom & Dining Facts === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Chef Wisdom Card */}
              <div className="bg-white border border-amber-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Chef's Corner</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic min-h-[60px] transition-all duration-700">
                  "{CHEF_WISDOM[wisdomIndex]}"
                </p>
                <div className="flex gap-1 pt-1">
                  {CHEF_WISDOM.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${i === wisdomIndex ? 'w-4 bg-amber-500' : 'w-1.5 bg-amber-200'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Dining Facts Card */}
              <div className="bg-white border border-sky-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center space-x-2 text-xs font-black text-sky-800 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Did You Know?</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed min-h-[60px] transition-all duration-700">
                  {DINING_FACTS[factIndex]}
                </p>
                <div className="flex gap-1 pt-1">
                  {DINING_FACTS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${i === factIndex ? 'w-4 bg-sky-400' : 'w-1.5 bg-sky-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* === ENGAGEMENT: Quick Add More Items === */}
            {latestOrder && ['received', 'preparing'].includes(latestOrder.status) && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <ShoppingBag className="w-4 h-4 text-[#0C831F]" />
                    <span>While You Wait — Add More?</span>
                  </div>
                  <button
                    onClick={() => navigate(`/table/${tableId}/menu`)}
                    className="text-[10px] text-[#0C831F] font-bold flex items-center space-x-0.5 hover:underline"
                  >
                    <span>Browse all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ADD_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => navigate(`/table/${tableId}/menu`)}
                      className="flex items-center space-x-2.5 p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer text-left"
                    >
                      <span className="text-lg">{s.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{s.label}</p>
                        <p className="text-[10px] text-slate-500">{s.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* === Suggested Dishes Carousel (real menu items) === */}
            {suggestedItems.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>You Might Also Love</span>
                  </div>
                  <button
                    onClick={() => navigate(`/table/${tableId}/menu`)}
                    className="text-[10px] text-[#0C831F] font-bold flex items-center space-x-0.5 hover:underline"
                  >
                    <span>See all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                  {suggestedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/table/${tableId}/menu`)}
                      className="flex-none w-44 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-28 w-full overflow-hidden bg-slate-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2.5 space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 font-mono">₹{item.price}</span>
                          <div className="flex items-center space-x-1 text-[10px] text-amber-700">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>{item.rating || 4.8}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === ENGAGEMENT: Wifi & Comfort Amenities Card === */}
            <div className="bg-gradient-to-r from-[#0C831F]/5 to-amber-500/5 border border-emerald-200/60 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Gift className="w-4 h-4 text-[#0C831F]" />
                <span>While You Dine</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <Wifi className="w-4 h-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">Free WiFi</p>
                    <p className="text-[9px] text-slate-500">AURA_GUEST</p>
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <Music2 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">Live Music</p>
                    <p className="text-[9px] text-slate-500">Fridays & Sat</p>
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <Phone className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900">Need Help?</p>
                    <p className="text-[9px] text-slate-500">Call Waiter ↓</p>
                  </div>
                </div>
              </div>
            </div>

            {/* === Order Items List === */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-[#0C831F]" />
                  <span>Session Items (Table {tableId})</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {orders.map((ord, index) => {
                const badge = getStatusBadge(ord.status);

                return (
                  <div key={ord._id || ord.orderId} className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-sm text-slate-900">Order #{ord.orderId}</span>
                          {index === 0 && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-2 divide-y divide-slate-100">
                      {ord.items.map((it, i) => (
                        <div key={i} className="pt-1.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-900">{it.quantity}x {it.name}</p>
                            {it.notes && <p className="text-[10px] text-emerald-700 italic">Note: {it.notes}</p>}
                          </div>
                          <span className="font-mono text-slate-900 font-bold">
                            ₹{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Order Total</span>
                      <span className="font-mono font-bold text-slate-900">₹{ord.total ? ord.total.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* === Cumulative Session Total === */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-800" />
                  <span className="font-bold text-xs text-emerald-900 uppercase">Table {tableId} Total</span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-900">
                  ₹{grandSessionTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* === Feedback Teaser === */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Share Your Experience</span>
              </div>
              <p className="text-xs text-slate-500">
                Enjoying your meal? Rate your experience, and your feedback reaches the chef directly.
              </p>
              <div className="flex space-x-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => navigate(`/table/${tableId}/menu`)}
                    className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer text-lg"
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* === Add More Items CTA === */}
            <button
              onClick={() => navigate(`/table/${tableId}/menu`)}
              className="w-full py-4 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-2xl text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5" />
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
export default OrderTrackingPage;
