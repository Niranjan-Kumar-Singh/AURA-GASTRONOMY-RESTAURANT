import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menu.service';
import { Category, MenuItem } from '../../types/menu.types';
import { CategoryBar } from '../../components/menu/CategoryBar';
import { DishCard } from '../../components/menu/DishCard';
import { LazyDishCard } from '../../components/menu/LazyDishCard';
import { DishDetailModal } from '../../components/menu/DishDetailModal';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { CustomerHeroBanner } from '../../components/customer/CustomerHeroBanner';
import { CustomerSearchBar } from '../../components/customer/CustomerSearchBar';
import { FilterChips, ActiveFilter } from '../../components/customer/FilterChips';
import { RecommendationSection } from '../../components/customer/RecommendationSection';
import { CallWaiterButton } from '../../components/customer/CallWaiterButton';
import { WaterRefillButton } from '../../components/customer/WaterRefillButton';
import { CustomerSidebar } from '../../components/customer/CustomerSidebar';
import { CustomerAuthModal } from '../../components/auth/CustomerAuthModal';
import { CustomerProfileModal } from '../../components/auth/CustomerProfileModal';
import { OrderHistoryDrawer } from '../../components/customer/OrderHistoryDrawer';
import { WishlistDrawer } from '../../components/customer/WishlistDrawer';
import { OffersDrawer } from '../../components/customer/OffersDrawer';
import { GalleryModal } from '../../components/customer/GalleryModal';
import { FaqModal } from '../../components/customer/FaqModal';
import { CustomerFeedbackModal } from '../../components/customer/CustomerFeedbackModal';
import { LoyaltyPointsModal } from '../../components/customer/LoyaltyPointsModal';
import { useCartStore } from '../../store/use-cart-store';
import { useOrderStore } from '../../store/use-order-store';
import { useAuthStore } from '../../store/use-auth-store';
import { useWishlistStore } from '../../store/use-wishlist-store';
import { ShoppingBag, Utensils, Menu, Sparkles, Flame, ChefHat, RotateCcw, AlertCircle, Heart } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { tableId = '10' } = useParams<{ tableId?: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<ActiveFilter[]>(['ALL']);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);

  // Dynamic Scroll Direction Header Visibility (hides on scroll down, shows on scroll up)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const isHeaderVisibleRef = useRef(true);
  const lastScrollY = useRef(0);
  const accumulatedDistance = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');
  const transitionCooldownRef = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    isHeaderVisibleRef.current = isHeaderVisible;
  }, [isHeaderVisible]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        const currentScrollY = Math.max(0, window.scrollY);
        const delta = currentScrollY - lastScrollY.current;

        // Ignore micro-jitter / subpixel bounce
        if (Math.abs(delta) < 3) {
          return;
        }

        const now = Date.now();

        // Always show when near the very top of page
        if (currentScrollY <= 60) {
          if (!isHeaderVisibleRef.current) {
            setIsHeaderVisible(true);
            transitionCooldownRef.current = now + 350;
          }
          accumulatedDistance.current = 0;
          scrollDirection.current = 'up';
          lastScrollY.current = currentScrollY;
          return;
        }

        // If in transition cooldown period, ignore opposite triggers to prevent oscillation
        if (now < transitionCooldownRef.current) {
          lastScrollY.current = currentScrollY;
          return;
        }

        if (delta > 0) {
          // Scrolling DOWN
          if (scrollDirection.current !== 'down') {
            scrollDirection.current = 'down';
            accumulatedDistance.current = 0;
          }
          accumulatedDistance.current += delta;

          // Hide header once scrolled down 45px and past top zone
          if (accumulatedDistance.current >= 45 && currentScrollY > 120 && isHeaderVisibleRef.current) {
            setIsHeaderVisible(false);
            transitionCooldownRef.current = now + 350;
            accumulatedDistance.current = 0;
          }
        } else if (delta < 0) {
          // Scrolling UP
          if (scrollDirection.current !== 'up') {
            scrollDirection.current = 'up';
            accumulatedDistance.current = 0;
          }
          accumulatedDistance.current += Math.abs(delta);

          // Reveal header once scrolled up 40px
          if (accumulatedDistance.current >= 40 && !isHeaderVisibleRef.current) {
            setIsHeaderVisible(true);
            transitionCooldownRef.current = now + 350;
            accumulatedDistance.current = 0;
          }
        }

        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const { addItem, getItemCount, getGrandTotal, clearCart, setTableId: setCartTableId } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { activeOrderId, setActiveOrderId } = useOrderStore();
  const { isAuthenticated, tableId: sessionTableId, setTableId } = useAuthStore();

  // Dynamic Zone Calculation
  const tableNum = parseInt(tableId, 10) || 10;
  let zoneName = 'Main Hall';
  if (tableNum > 12 && tableNum <= 16) zoneName = 'VIP Lounge';
  else if (tableNum > 16 && tableNum <= 24) zoneName = 'Outdoor Garden';
  else if (tableNum > 24) zoneName = 'Family Section';

  // Sync active URL tableId with AuthStore & CartStore for Multi-Device Sync
  useEffect(() => {
    if (tableId) {
      if (tableId !== sessionTableId) {
        setTableId(tableId);
      }
      setCartTableId(tableId);
    }
  }, [tableId]);

  // Prompt login dialog if not authenticated on first load
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setIsAuthOpen(true);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    fetchMenuData();
  }, [selectedCategoryId, searchQuery]);

  const fetchMenuData = async () => {
    if (menuItems.length === 0) {
      setIsLoading(true);
    }
    setFetchError(null);
    try {
      const [catData, itemData] = await Promise.all([
        categories.length === 0 ? menuService.getCategories() : Promise.resolve(categories),
        menuService.getMenuItems({
          categoryId: selectedCategoryId || undefined,
          search: searchQuery || undefined,
        }),
      ]);

      if (categories.length === 0) {
        setCategories(catData);
      }
      setMenuItems(itemData);
    } catch (err: any) {
      console.error('Failed to fetch menu data:', err);
      setFetchError('Unable to connect to kitchen menu services. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFilter = (filter: ActiveFilter) => {
    if (filter === 'ALL') {
      setSelectedFilters(['ALL']);
      return;
    }

    let next: ActiveFilter[] = selectedFilters.filter((f) => f !== 'ALL');

    if (next.includes(filter)) {
      next = next.filter((f) => f !== filter);
    } else {
      // User-friendly mutual exclusion for dietary conflicts
      if (filter === 'VEG') {
        next = next.filter((f) => f !== 'NON_VEG');
      } else if (filter === 'NON_VEG') {
        next = next.filter((f) => f !== 'VEG' && f !== 'JAIN');
      } else if (filter === 'JAIN') {
        next = next.filter((f) => f !== 'NON_VEG');
      }
      next.push(filter);
    }

    if (next.length === 0) next = ['ALL'];
    setSelectedFilters(next);
  };

  const handleAddToCart = (
    item: MenuItem,
    quantity = 1,
    notes = '',
    unitPrice?: number,
    addonNames?: string[]
  ) => {
    addItem(item, quantity, notes, unitPrice, addonNames);
  };

  const handleResetFilters = () => {
    setSelectedFilters(['ALL']);
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

  // Helper for applying dietary filters
  const applyDietaryFilter = (items: MenuItem[]) => {
    if (selectedFilters.includes('ALL')) return items;
    return items.filter((item) => {
      return selectedFilters.every((f) => {
        if (f === 'VEG') return item.isVegetarian;
        if (f === 'NON_VEG') return item.isNonVeg || !item.isVegetarian;
        if (f === 'JAIN') return item.isJain;
        if (f === 'GF') return item.isGlutenFree;
        if (f === 'SPECIAL') return item.isChefSpecial || item.categoryId === 1;
        if (f === 'BESTSELLER') return item.isBestSeller;
        if (f === 'UNDER300') return item.price <= 300;
        if (f === 'SPICY') return (item.spiceLevel || 0) >= 2;
        return true;
      });
    });
  };

  // Main food grid items
  const filteredItems = applyDietaryFilter(menuItems);

  // Batching & Infinite Scroll for Ultra-Fast DOM Performance
  const BATCH_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedCategoryId, searchQuery, selectedFilters]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length]);

  // Specials rails filtered dynamically by active dietary filter
  const chefSpecials = applyDietaryFilter(menuItems.filter((it) => it.isChefSpecial || it.categoryId === 1));
  const todaysSpecials = applyDietaryFilter(menuItems.filter((it) => it.categoryId === 2 || it.isBestSeller));

  return (
    <div className="page-theme-customer min-h-screen flex flex-col bg-[#F4F6F8] text-slate-800 font-sans selection:bg-[#0C831F] selection:text-white">
      {/* Unified Coordinated Sticky Navigation: Brand Header & Category Bar */}
      <div className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-sm">
        {/* Top Restaurant Brand & Table Navigation Bar with GPU-Accelerated Smooth Dynamic Collapse */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: isHeaderVisible ? '1fr' : '0fr',
            maxHeight: isHeaderVisible ? '70px' : '0px',
            opacity: isHeaderVisible ? 1 : 0,
            transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1), max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease',
            overflow: 'hidden',
            pointerEvents: isHeaderVisible ? 'auto' : 'none',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <header className="bg-white/95 px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 border-b border-slate-200/90">
              <div className="max-w-[1560px] mx-auto w-full flex items-center justify-between gap-2">
                {/* Strict Left-to-Right Flow: 1. Burger -> 2. Logo Emblem -> 3. Restaurant Name -> 4. Table Badge */}
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  {/* 1. Burger Icon */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 sm:p-2.5 text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/90 border border-slate-200 rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer active:scale-95"
                    title="Open Dining Menu"
                  >
                    <Menu className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  {/* 2. Logo Emblem (Visible on Mobile & Desktop) */}
                  <div className="flex w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 via-[#0C831F] to-emerald-800 border border-emerald-400/40 items-center justify-center text-white shadow-xs shrink-0">
                    <Utensils className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-50" />
                  </div>

                  {/* 3. Restaurant Name & 4. Table Number Badge */}
                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1 leading-none">
                      <span className="font-black text-xs sm:text-base text-slate-900 tracking-tight font-serif uppercase">
                        AURA
                      </span>
                      <span className="font-black text-[9px] sm:text-xs text-[#0C831F] tracking-widest uppercase">
                        GASTRONOMY
                      </span>
                    </div>

                    {/* 4. Active Table Badge */}
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="inline-flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 bg-emerald-50 border border-emerald-200/90 rounded-full text-[9px] sm:text-[10px] font-black text-emerald-900 shadow-2xs whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0C831F] animate-pulse shrink-0" />
                        <span>Table {tableId}</span>
                        <span className="text-emerald-700 font-semibold hidden xs:inline">• {zoneName}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: 5. Track Order -> 6. Wishlist -> 7. Cart */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                  {/* 5. Track Order (Active Kitchen Order) */}
                  {activeOrderId && (
                    <button
                      onClick={() => navigate(`/table/${tableId}/order/${activeOrderId}`)}
                      className="relative p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer font-black text-xs shrink-0 active:scale-95"
                      title="Track Active Kitchen Order"
                    >
                      <ChefHat className="w-4 h-4 animate-bounce text-emerald-100 shrink-0" />
                      <span className="uppercase tracking-wider text-[10px] sm:text-xs font-black hidden sm:inline">
                        Track Order
                      </span>
                    </button>
                  )}

                  {/* 6. Saved Wishlist Button */}
                  <button
                    onClick={() => setIsWishlistOpen(true)}
                    className="relative p-2 sm:p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="Saved Wishlist"
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-75 duration-150">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  {/* 7. Table Cart Button */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 sm:p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-[#0C831F] text-slate-800 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="View Active Table Cart"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#0C831F] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-75 duration-150">
                        {getItemCount()}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* Zero-Gap Sticky Category & Mobile Search Control Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content Container */}
      <main className="flex-1 pb-44 sm:pb-36">
        {/* Hero Banner */}
        <CustomerHeroBanner tableId={tableId} zoneName={zoneName} />

        {/* Combinable Dietary Filter Chips */}
        <div className="px-3 sm:px-6 lg:px-8 max-w-[1560px] mx-auto my-3 sm:my-4">
          <FilterChips
            selectedFilters={selectedFilters}
            onToggleFilter={handleToggleFilter}
          />
        </div>

        {/* Dynamic Recommendation Rails with Differentiated Luxury Backgrounds */}
        {!searchQuery && !selectedCategoryId && (
          <div className="space-y-4 my-2">
            {chefSpecials.length > 0 && (
              <RecommendationSection
                title="Chef's Signature Recommendations"
                icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                variant="chef"
                items={chefSpecials}
                onItemClick={(it) => {
                  setSelectedItem(it);
                  setIsDetailOpen(true);
                }}
              />
            )}

            {todaysSpecials.length > 0 && (
              <RecommendationSection
                title="Today's Most Popular Specials"
                icon={<Flame className="w-4 h-4 text-emerald-400" />}
                variant="popular"
                items={todaysSpecials}
                onItemClick={(it) => {
                  setSelectedItem(it);
                  setIsDetailOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* Main Food Items Grid */}
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1560px] mx-auto">
          {/* Section Demarcation Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-slate-300">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-6 bg-[#0C831F] rounded-full shadow-sm" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  {selectedCategoryId
                    ? categories.find((c) => c.id === selectedCategoryId)?.name || 'Menu Category'
                    : searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : 'All Gastronomy Dishes'}
                </span>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 bg-slate-200/90 text-slate-800 rounded-full border border-slate-300/80">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
            </div>

            {selectedCategoryId !== null && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-[#0C831F] hover:underline cursor-pointer"
              >
                View All Dishes
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="h-48 sm:h-64 bg-white rounded-2xl sm:rounded-3xl animate-pulse border border-slate-200 shadow-sm" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-rose-200 p-8 max-w-md mx-auto shadow-sm">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="font-bold text-base text-slate-800">{fetchError}</p>
              <button
                onClick={fetchMenuData}
                className="px-5 py-2.5 bg-[#0C831F] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 mx-auto shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto shadow-sm">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-extrabold text-lg text-slate-800">No dishes match your active filter</p>
              <p className="text-xs text-slate-500 leading-relaxed">Try clearing your dietary filters or searching for another dish.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#0C831F] text-white font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
                {filteredItems.slice(0, visibleCount).map((item) => (
                  <LazyDishCard
                    key={item.id}
                    item={item}
                    onAdd={(it) => handleAddToCart(it)}
                    onClick={(it) => {
                      setSelectedItem(it);
                      setIsDetailOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Sentinel Div for Infinite Scroll Batch Loading */}
              {visibleCount < filteredItems.length && (
                <div ref={sentinelRef} className="py-6 text-center flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-[#0C831F] rounded-full animate-ping" />
                  <span className="text-[11px] text-[#0C831F] font-mono uppercase font-bold tracking-wider">
                    Loading More Dishes ({visibleCount} of {filteredItems.length})...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating 1-Tap Water Refill (Directly above Call Waiter) */}
      <WaterRefillButton tableId={tableId} />

      {/* Floating Call Waiter Button */}
      <CallWaiterButton tableId={tableId} />

      {/* Floating Active Cart Bar (Desktop & Mobile - Blinkit Green Style) */}
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
              <span>₹{getGrandTotal().toFixed(2)}</span>
              <span className="text-white/80">➔</span>
            </div>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <DishDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
        onOrderPlaced={(orderId) => {
          setIsCartOpen(false);
          setActiveOrderId(orderId);
          clearCart();
          navigate(`/table/${tableId}/order/${orderId}`);
        }}
      />

      <CustomerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        tableId={tableId}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOffers={() => setIsOffersOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenFaq={() => setIsFaqOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      <LoyaltyPointsModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <CustomerAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        tableId={tableId}
      />

      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <OrderHistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        tableId={tableId}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectDish={(item) => {
          setSelectedItem(item);
          setIsDetailOpen(true);
        }}
      />
      <OffersDrawer isOpen={isOffersOpen} onClose={() => setIsOffersOpen(false)} />
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        orderId={activeOrderId || undefined}
      />
    </div>
  );
};
