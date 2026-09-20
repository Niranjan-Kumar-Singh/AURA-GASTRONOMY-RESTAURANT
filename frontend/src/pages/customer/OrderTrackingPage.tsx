import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Utensils, CheckCircle2, Clock, ArrowLeft, Plus, Minus, ChefHat, ShoppingBag, Receipt,
  Sparkles, Zap, Star, Coffee, Heart, MessageCircle, Flame,
  ArrowRight, Wifi, Play, Pause, Volume2, VolumeX, Eye, FlameKindling,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { CallWaiterButton } from '../../components/customer/CallWaiterButton';
import { WaterRefillButton } from '../../components/customer/WaterRefillButton';
import { DishDetailModal } from '../../components/menu/DishDetailModal';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { useCartStore } from '../../store/use-cart-store';
import { useToast } from '../../components/feedback/ToastContainer';
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

// Suggested add-ons when order is in kitchen with dynamic category keywords
const QUICK_ADD_SUGGESTIONS = [
  { id: 'SALAD', emoji: '🥗', label: 'Add a Salad', hint: 'Pair with your mains', categorySlug: 'salads', keywords: ['salad', 'cold', 'starter', 'appetizer', 'green'] },
  { id: 'BREAD', emoji: '🍞', label: 'Order Bread', hint: 'Butter Naan or Roti', categorySlug: 'breads', keywords: ['bread', 'naan', 'roti', 'kulcha', 'paratha', 'bhatura'] },
  { id: 'DRINK', emoji: '🥤', label: 'Add Drinks', hint: 'Botanical Mocktails & Lassi', categorySlug: 'beverages', keywords: ['beverage', 'drink', 'mocktail', 'lassi', 'soda', 'water', 'tea', 'coffee', 'juice', 'shake'] },
  { id: 'DESSERT', emoji: '🍮', label: 'Add Dessert', hint: 'Artisanal Kulfi & Halwa', categorySlug: 'desserts', keywords: ['dessert', 'sweet', 'kulfi', 'halwa', 'cake', 'ice cream', 'pudding', 'gulab', 'lava'] },
];

// Curated Gastronomy Live Reels to hook waiting guests (Authentic culinary food clips)
const GASTRONOMY_REELS = [
  {
    id: 991,
    name: 'Truffle & Burrata Sourdough Pizza',
    tagline: 'Fresh from our 400°C Beechwood Oven',
    price: 680,
    chefNote: 'Hand-stretched 48-hr fermented sourdough crowned with creamy Puglia burrata, rich mozzarella cheese pull, and freshly shaved winter truffles.',
    gifSrc: '/reels/pizza_reel.gif',
    fallbackGif: 'https://media.giphy.com/media/TDJXDJVSNfsFwGqCQ6/giphy.gif',
    poster: '/images/aura_hero_interior.png',
    badge: '🔥 Wood-Fired',
    loopDurationMs: 3500, // 3.5s per loop, 2 plays = 7.0s
  },
  {
    id: 992,
    name: 'Slow-Smoked Dum Dal & Butter Naan',
    tagline: '18-Hour Overnight Charcoal Simmer',
    price: 480,
    chefNote: 'Black lentils slow-cooked overnight over aromatic charcoal embers, paired with freshly tandoor-baked butter naan.',
    gifSrc: '/reels/naan_dal_reel.gif',
    fallbackGif: 'https://media.giphy.com/media/PoDoIyarD0cURgyT5j/giphy.gif',
    poster: '/images/aura_hero_interior.png',
    badge: '⭐ Iconic Special',
    loopDurationMs: 3500, // 3.5s per loop, 2 plays = 7.0s
  },
  {
    id: 993,
    name: 'Aromatic Kadhai Gravy Simmer',
    tagline: 'Iron Wok Simmered in Desi Ghee',
    price: 520,
    chefNote: 'Simmered fresh in a seasoned iron kadhai with roasted whole spices, bell peppers, hand-crushed tomatoes, and fresh coriander.',
    gifSrc: '/reels/curry_simmer_reel.gif',
    fallbackGif: 'https://media.giphy.com/media/JaWNyAfqGSgoqQv72D/giphy.gif',
    poster: '/images/aura_hero_interior.png',
    badge: '♨️ Live Sizzle',
    loopDurationMs: 4000, // 4.0s per loop, 2 plays = 8.0s
  },
  {
    id: 994,
    name: 'Molten Dark Chocolate Lava Pot',
    tagline: 'Warm 70% Single-Origin Belgian Ganache',
    price: 340,
    chefNote: 'Baked warm chocolate sponge cake with a rich Belgian ganache center that flows like molten lava on the first spoon.',
    gifSrc: '/reels/lava_cake_reel.gif',
    fallbackGif: 'https://media.giphy.com/media/mFNS7YXMCvWYedDLRb/giphy.gif',
    poster: '/images/aura_hero_interior.png',
    badge: '🍫 Dessert Gold',
    loopDurationMs: 3800, // 3.8s per loop, 2 plays = 7.6s
  },
];

export const OrderTrackingPage: React.FC = () => {
  const { tableId = '10', orderId } = useParams<{ tableId?: string; orderId?: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, clearCart, getItemCount } = useCartStore();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [selectedWaitFilter, setSelectedWaitFilter] = useState<'ALL' | 'SALAD' | 'BREAD' | 'DRINK' | 'DESSERT'>('ALL');

  // Gastronomy Video Reel State
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPlayCount, setCurrentPlayCount] = useState(1);
  const [reelProgress, setReelProgress] = useState(0);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const suggestedScrollRef = useRef<HTMLDivElement>(null);

  const scrollSuggested = (dir: 'left' | 'right') => {
    if (suggestedScrollRef.current) {
      suggestedScrollRef.current.scrollBy({
        left: dir === 'left' ? -220 : 220,
        behavior: 'smooth',
      });
    }
  };

  // Auto-advance reel after playing exactly 2 times
  useEffect(() => {
    if (!isPlaying) return;

    const currentReel = GASTRONOMY_REELS[activeReelIdx];
    const loopDuration = currentReel.loopDurationMs || 3500;
    const totalDuration = loopDuration * 2;
    const tickInterval = 50;
    let elapsed = 0;

    setReelProgress(0);
    setCurrentPlayCount(1);

    const timer = setInterval(() => {
      elapsed += tickInterval;
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setReelProgress(progress);

      if (elapsed < loopDuration) {
        setCurrentPlayCount(1);
      } else {
        setCurrentPlayCount(2);
      }

      if (elapsed >= totalDuration) {
        // Automatically move to the next reel after 2 complete plays
        setActiveReelIdx((prev) => (prev + 1) % GASTRONOMY_REELS.length);
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [activeReelIdx, isPlaying]);

  // Always open page at the very top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [orderId, tableId]);

  // Fetch real menu items
  useEffect(() => {
    menuService.getMenuItems({}).then((menuItems) => {
      const available = menuItems.filter((it) => it.isAvailable !== false);
      setAllMenuItems(available);
      setSuggestedItems(available.slice(0, 6));
    }).catch(() => {});
  }, []);

  const handleSelectWaitFilter = (filterId: 'SALAD' | 'BREAD' | 'DRINK' | 'DESSERT') => {
    if (selectedWaitFilter === filterId) {
      setSelectedWaitFilter('ALL');
      setSuggestedItems(allMenuItems.slice(0, 6));
      return;
    }

    setSelectedWaitFilter(filterId);
    const suggestion = QUICK_ADD_SUGGESTIONS.find((s) => s.id === filterId);
    if (!suggestion) return;

    const matched = allMenuItems.filter((it) => {
      const cat = (it.categoryName || '').toLowerCase();
      const name = (it.name || '').toLowerCase();
      const desc = (it.description || '').toLowerCase();
      return suggestion.keywords.some((kw) => cat.includes(kw) || name.includes(kw) || desc.includes(kw));
    });

    if (matched.length > 0) {
      setSuggestedItems(matched);
    } else {
      setSuggestedItems(allMenuItems.slice(0, 6));
    }
  };

  // Fetch active orders for this table's session
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


  const handlePrevReel = () => {
    setActiveReelIdx((prev) => (prev === 0 ? GASTRONOMY_REELS.length - 1 : prev - 1));
    setIsPlaying(true);
    setReelProgress(0);
    setCurrentPlayCount(1);
  };

  const handleNextReel = () => {
    setActiveReelIdx((prev) => (prev === GASTRONOMY_REELS.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
    setReelProgress(0);
    setCurrentPlayCount(1);
  };

  const handleAddReelItem = (reel: typeof GASTRONOMY_REELS[0]) => {
    const dishItem: MenuItem = {
      id: reel.id,
      categoryId: 1,
      categoryName: "Chef's Signatures",
      name: reel.name,
      description: reel.chefNote,
      price: reel.price,
      imageUrl: reel.poster,
      isVegetarian: true,
      isGlutenFree: false,
      isAvailable: true,
      preparationTimeMinutes: 15,
      spiceLevel: 1,
    };
    setSelectedDish(dishItem);
  };

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

  const activeReel = GASTRONOMY_REELS[activeReelIdx];

  return (
    <div className="page-theme-customer min-h-screen bg-[#F4F6F8] text-slate-800 pb-36 font-sans">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-sm gap-2">
        <button
          onClick={() => navigate(`/table/${tableId}/menu`)}
          className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#0C831F] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back<span className="hidden xs:inline"> to Menu</span></span>
        </button>

        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-2 h-2 bg-[#0C831F] rounded-full animate-pulse shrink-0" />
          <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
            <span>Table {tableId}</span>
            <span className="hidden sm:inline"> — Live Kitchen Tracker</span>
          </h1>
        </div>

        <div className="flex items-center space-x-1 text-[10px] font-bold text-[#0C831F] uppercase tracking-wider shrink-0 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <Wifi className="w-3 h-3" />
          <span>Live Sync</span>
        </div>
      </header>

      <div className="p-3 sm:p-4 max-w-2xl mx-auto space-y-4 pt-3 sm:pt-4">
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
            <p className="font-bold text-sm text-slate-700">Connecting to Kitchen Display Systems...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="space-y-4">
            {/* Empty Active Orders */}
            <div className="py-12 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">No Active Kitchen Orders</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your Table {tableId} session is currently clear. Ready to order something delicious?
                </p>
              </div>
              <button
                onClick={() => navigate(`/table/${tableId}/menu`)}
                className="px-6 py-3 bg-[#0C831F] hover:bg-[#096918] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Open Table Menu</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* === 1. LIVE ORDER TRACKER STEPPER === */}
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

                <div className="p-4 sm:p-6 space-y-4">
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

            {/* === 2. GASTRONOMY LIVE REELS & VIDEO SHOWCASE (Holding Guests & Driving Orders) === */}
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm space-y-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-rose-100 text-rose-600 rounded-xl">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">Gastronomy Live Reels</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Watch Master Chefs Craft Dishes • Tap to Add Live</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {activeReelIdx + 1} of {GASTRONOMY_REELS.length}
                  </span>
                </div>
              </div>

              {/* Video/GIF Player Display Container - Optimal Vertical Ratio */}
              <div
                onClick={() => setIsPlaying(!isPlaying)}
                className="relative rounded-3xl overflow-hidden bg-black w-full max-w-lg mx-auto h-[480px] sm:h-[530px] shadow-2xl group border-2 border-slate-800 select-none cursor-pointer flex items-center justify-center"
              >
                {/* Active Animated Food GIF Reel */}
                <img
                  key={activeReel.id}
                  src={isPlaying ? activeReel.gifSrc : activeReel.poster}
                  onError={(e) => {
                    // Fallback to online CDN GIF if local file path fails
                    (e.currentTarget as HTMLImageElement).src = activeReel.fallbackGif;
                  }}
                  alt={activeReel.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isPlaying ? 'opacity-100 scale-100' : 'opacity-75 scale-95 brightness-75'
                  }`}
                />

                {/* Video Overlay Gradient (Top and Bottom so text & controls pop) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

                {/* Centered Pause / Play Badge if user paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl">
                      <Play className="w-8 h-8 fill-white translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Top Instagram-Style Segmented Progress Bars (Segmented by Reel, 2 Plays each) */}
                <div className="absolute top-2.5 left-3.5 right-3.5 flex space-x-1.5 z-20">
                  {GASTRONOMY_REELS.map((_, i) => {
                    let fillWidth = '0%';
                    if (i < activeReelIdx) {
                      fillWidth = '100%';
                    } else if (i === activeReelIdx) {
                      fillWidth = `${reelProgress}%`;
                    }
                    return (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReelIdx(i);
                          setIsPlaying(true);
                          setReelProgress(0);
                          setCurrentPlayCount(1);
                        }}
                        className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer backdrop-blur-xs relative hover:h-1.5 transition-all"
                        title={`Reel ${i + 1}: ${GASTRONOMY_REELS[i].name}`}
                      >
                        <div
                          className="h-full bg-white rounded-full transition-[width] duration-75 ease-linear shadow-xs"
                          style={{ width: fillWidth }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Top Overlay Badges & Controls */}
                <div className="absolute top-6 left-3.5 right-3.5 flex items-center justify-between z-20">
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-400/30 shadow-xs flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{activeReel.badge}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center space-x-1">
                      <span>LIVE REEL</span>
                      <span className="opacity-90 font-mono">• Play {currentPlayCount}/2</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(!isPlaying);
                      }}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all cursor-pointer border border-white/20"
                      title={isPlaying ? 'Pause Reel' : 'Play Reel'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Side Navigation Arrows to Swipe/Cycle Reels (Manual Icon Switcher) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevReel();
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
                  title="Previous Reel"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextReel();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
                  title="Next Reel"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Bottom Overlay Dish Information (Name & Price ONLY - Clickable to open card) */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddReelItem(activeReel);
                    }}
                    className="text-white space-y-0.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <h4 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-md text-white truncate hover:text-emerald-300 transition-colors">
                      {activeReel.name}
                    </h4>
                    <p className="text-sm font-black text-emerald-400 font-mono">
                      ₹{activeReel.price}
                    </p>
                  </div>

                  {/* View & Add / Direct Stepper */}
                  {(() => {
                    const inCart = items.find((it) => it.menuItem.id === activeReel.id);
                    if (inCart) {
                      return (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1.5 bg-[#0C831F] text-white px-2.5 py-1.5 rounded-xl shadow-md shrink-0 border border-emerald-400"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(activeReel.id, inCart.quantity - 1);
                            }}
                            className="w-7 h-7 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                            title="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <span className="font-mono font-black text-sm min-w-[20px] text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(activeReel.id, inCart.quantity + 1);
                            }}
                            className="w-7 h-7 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                            title="Increase quantity"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddReelItem(activeReel);
                        }}
                        className="px-3.5 py-2 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all duration-150 shadow-md flex items-center space-x-1.5 shrink-0 active:scale-95 cursor-pointer border border-emerald-400"
                      >
                        <span>View &amp; Add</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Reel Switcher Thumbnails (4-Column Layout) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {GASTRONOMY_REELS.map((reel, idx) => (
                  <button
                    key={reel.id}
                    onClick={() => {
                      setActiveReelIdx(idx);
                      setIsPlaying(true);
                      setReelProgress(0);
                      setCurrentPlayCount(1);
                    }}
                    className={`p-1.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                      idx === activeReelIdx
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="h-16 w-full rounded-xl overflow-hidden mb-1.5 bg-slate-100 relative">
                      <img
                        src={reel.gifSrc}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = reel.fallbackGif;
                        }}
                        alt={reel.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                      {idx === activeReelIdx ? (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0C831F] text-white text-[8px] font-black rounded-full shadow-2xs flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>LIVE</span>
                        </span>
                      ) : (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/60 text-white text-[8px] font-bold rounded">
                          GIF
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-900 truncate leading-snug">{reel.name}</p>
                    <p className="text-[10px] font-mono font-black text-[#0C831F]">₹{reel.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* === 3. WHILE YOU WAIT — QUICK ADD SUGGESTIONS === */}
            {latestOrder && ['received', 'preparing'].includes(latestOrder.status) && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <ShoppingBag className="w-4 h-4 text-[#0C831F]" />
                    <span>While You Wait — Add More To Table?</span>
                  </div>
                  <button
                    onClick={() => navigate(`/table/${tableId}/menu`)}
                    className="text-[10px] text-[#0C831F] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer"
                  >
                    <span>Browse all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ADD_SUGGESTIONS.map((s) => {
                    const isSelected = selectedWaitFilter === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectWaitFilter(s.id as any)}
                        className={`flex items-center space-x-2.5 p-3 rounded-xl transition-all cursor-pointer text-left relative ${
                          isSelected
                            ? 'bg-emerald-50 border-2 border-[#0C831F] shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className="text-xl shrink-0">{s.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#0C831F]' : 'text-slate-900'}`}>
                              {s.label}
                            </p>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#0C831F] shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{s.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === 4. SUGGESTED DISHES CAROUSEL === */}
            {suggestedItems.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider flex-wrap gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>
                      {selectedWaitFilter === 'ALL'
                        ? 'Popular Chef Specialties'
                        : `Filtered: ${QUICK_ADD_SUGGESTIONS.find((s) => s.id === selectedWaitFilter)?.label.replace('Add ', '').replace('Order ', '')} (${suggestedItems.length})`}
                    </span>
                    {selectedWaitFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWaitFilter('ALL');
                          setSuggestedItems(allMenuItems.slice(0, 6));
                        }}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                      >
                        Reset ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollSuggested('left')}
                      className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
                      title="Scroll suggestions left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSuggested('right')}
                      className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-2xs"
                      title="Scroll suggestions right"
                    >
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => {
                        const slug = QUICK_ADD_SUGGESTIONS.find((s) => s.id === selectedWaitFilter)?.categorySlug;
                        navigate(slug ? `/table/${tableId}/menu?category=${slug}` : `/table/${tableId}/menu`);
                      }}
                      className="text-[10px] text-[#0C831F] font-bold flex items-center space-x-0.5 hover:underline cursor-pointer shrink-0 ml-1"
                    >
                      <span>Browse all</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div
                  ref={suggestedScrollRef}
                  className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar select-none scroll-smooth"
                >
                  {suggestedItems.map((item) => {
                    const inCart = items.find((it) => it.menuItem.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDish(item)}
                        className="flex-none w-44 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="h-28 w-full overflow-hidden bg-slate-100 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span
                            className={`absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center bg-white/90 shadow-2xs ${
                              item.isVegetarian ? 'border-emerald-600' : 'border-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </span>
                        </div>
                        <div className="p-2.5 space-y-1.5">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 font-mono">₹{item.price}</span>
                            <div className="flex items-center space-x-1 text-[10px] text-amber-700 font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>{item.rating || 4.8}</span>
                            </div>
                          </div>
                          <div className="pt-0.5">
                            {inCart ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex items-center justify-between bg-[#0C831F] text-white px-2 py-0.5 rounded-lg shadow-2xs"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, inCart.quantity - 1);
                                  }}
                                  className="w-5 h-5 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3 stroke-[3]" />
                                </button>
                                <span className="font-mono font-black text-xs text-center min-w-[16px]">
                                  {inCart.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, inCart.quantity + 1);
                                  }}
                                  className="w-5 h-5 hover:bg-black/20 rounded flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDish(item);
                                }}
                                className="w-full py-1 bg-emerald-50 hover:bg-[#0C831F] text-[#0C831F] hover:text-white border border-[#0C831F] rounded-lg text-[10px] font-black transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <span>View &amp; Add</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === 5. ORDER ITEMS BREAKDOWN === */}
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

            {/* === 6. CUMULATIVE SESSION TOTAL === */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-emerald-800" />
                  <span className="font-bold text-xs text-emerald-900 uppercase">Table {tableId} Cumulative Total</span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-900">
                  ₹{grandSessionTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* === 7. EXPERIENCE FEEDBACK === */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Rate Your Dining Experience</span>
              </div>
              <p className="text-xs text-slate-500">
                Your instant feedback reaches the executive chef & floor manager live.
              </p>
              <div className="flex space-x-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => showToast(`Thank you for rating ${star}★! We appreciate your feedback.`, 'success')}
                    className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer text-lg active:scale-95"
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* === 8. BIG CTA: ADD MORE DISHES === */}
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

      {/* Floating Active Cart Bar when items > 0 */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 sm:px-6 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-2xl text-xs sm:text-sm transition-all duration-150 shadow-[0_8px_30px_rgba(12,131,31,0.5)] flex items-center justify-between border-2 border-emerald-400 active:scale-95 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 sm:w-7 sm:h-7 bg-white text-[#0C831F] rounded-full text-xs flex items-center justify-center font-black shrink-0 shadow-sm">
                {getItemCount()}
              </span>
              <span className="tracking-wide uppercase font-black text-white text-xs sm:text-sm">View Table Cart</span>
            </div>
            <div className="flex items-center space-x-1.5 font-mono font-black text-sm sm:text-base text-white shrink-0">
              <span>₹{items.reduce((sum, it) => sum + (it.unitPrice ?? it.menuItem.price) * it.quantity, 0).toFixed(2)}</span>
              <span className="text-white/80">➔</span>
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
          fetchTableOrders();
        }}
      />

      {/* Dish Detail & Pairing Upsell Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
      />

      {/* Floating 1-Tap Water Refill (Directly above Call Waiter) */}
      <WaterRefillButton tableId={tableId} />

      {/* Floating Call Waiter Button */}
      <CallWaiterButton tableId={tableId} />
    </div>
  );
};

export default OrderTrackingPage;
