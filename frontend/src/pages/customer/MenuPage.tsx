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
import { HelpBotLauncher } from '../../components/customer/HelpBotLauncher';
import { CustomerSidebar } from '../../components/customer/CustomerSidebar';
import { CustomerAuthModal } from '../../components/auth/CustomerAuthModal';
import { CustomerProfileModal } from '../../components/auth/CustomerProfileModal';
import { CustomerFooter } from '../../components/customer/CustomerFooter';
import { OrderHistoryDrawer } from '../../components/customer/OrderHistoryDrawer';
import { WishlistDrawer } from '../../components/customer/WishlistDrawer';
import { OffersDrawer } from '../../components/customer/OffersDrawer';
import { GalleryModal } from '../../components/customer/GalleryModal';
import { FaqModal } from '../../components/customer/FaqModal';
import { useCartStore } from '../../store/use-cart-store';
import { useOrderStore } from '../../store/use-order-store';
import { useAuthStore } from '../../store/use-auth-store';
import { ShoppingBag, Utensils, Menu, Sparkles, Flame, Activity, RotateCcw, AlertCircle } from 'lucide-react';

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

  const { addItem, getItemCount, getGrandTotal, clearCart } = useCartStore();
  const { activeOrderId, setActiveOrderId } = useOrderStore();
  const { isAuthenticated, tableId: sessionTableId, setTableId } = useAuthStore();

  // Dynamic Zone Calculation
  const tableNum = parseInt(tableId, 10) || 10;
  let zoneName = 'Main Hall';
  if (tableNum > 12 && tableNum <= 16) zoneName = 'VIP Lounge';
  else if (tableNum > 16 && tableNum <= 24) zoneName = 'Outdoor Garden';
  else if (tableNum > 24) zoneName = 'Family Section';

  // Sync active URL tableId with AuthStore
  useEffect(() => {
    if (tableId && tableId !== sessionTableId) {
      setTableId(tableId);
    }
  }, [tableId, sessionTableId, setTableId]);

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

  const handleAddToCart = (item: MenuItem, quantity = 1, notes = '') => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    addItem(item, quantity, notes);
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
    <div className="min-h-screen flex flex-col bg-aura-obsidian text-aura-ivory font-sans selection:bg-aura-gold selection:text-aura-obsidian">
      {/* Sticky Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-aura-obsidian/95 backdrop-blur-md border-b border-aura-border/60 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 sm:p-2 text-aura-slate hover:text-aura-gold rounded-xl hover:bg-aura-container transition-colors shrink-0"
            title="Open Side Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-aura-gold/10 border border-aura-gold/30 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Utensils className="w-4 h-4 text-aura-gold" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-xs sm:text-sm font-bold text-aura-ivory tracking-wide truncate max-w-[130px] sm:max-w-none">AURA GASTRONOMY</h1>
              <p className="text-[8px] sm:text-[9px] text-aura-slate tracking-wider uppercase truncate max-w-[130px] sm:max-w-none">Table {tableId} • {zoneName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activeOrderId && (
            <button
              onClick={() => navigate(`/table/${tableId}/order/${activeOrderId}`)}
              className="relative px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all shadow-lg flex items-center space-x-2"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-bold hidden sm:inline uppercase tracking-wider">Track Order</span>
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-aura-container border border-aura-border hover:border-aura-gold text-aura-ivory rounded-xl transition-all shadow-lg"
            title="View Active Table Cart"
          >
            <ShoppingBag className="w-5 h-5 text-aura-gold" />
            {getItemCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-aura-gold text-aura-obsidian text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 pb-28">
        {/* Hero Banner */}
        <CustomerHeroBanner tableId={tableId} zoneName={zoneName} />

        {/* Search Bar */}
        <div className="px-4 max-w-7xl mx-auto my-3">
          <CustomerSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSelectSuggestion={(term) => setSearchQuery(term)}
          />
        </div>

        {/* Combinable Filter Chips */}
        <div className="px-4 max-w-7xl mx-auto my-3">
          <FilterChips
            selectedFilters={selectedFilters}
            onToggleFilter={handleToggleFilter}
          />
        </div>

        {/* Dynamic Recommendation Rails (Stay Visible & Filtered by Dietary Choices) */}
        {!searchQuery && !selectedCategoryId && (
          <div className="space-y-6 my-4">
            {chefSpecials.length > 0 && (
              <RecommendationSection
                title="Chef's Signature Recommendations"
                icon={<Sparkles className="w-4 h-4 text-aura-gold" />}
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
                icon={<Flame className="w-4 h-4 text-amber-400" />}
                items={todaysSpecials}
                onItemClick={(it) => {
                  setSelectedItem(it);
                  setIsDetailOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* Category Pills Bar */}
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {/* Main Food Items Grid */}
        <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-48 sm:h-64 bg-aura-container/50 rounded-2xl sm:rounded-3xl animate-pulse border border-aura-border" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="py-16 text-center space-y-4 bg-aura-container/40 rounded-3xl border border-red-500/30 p-8 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="font-serif text-base text-aura-ivory">{fetchError}</p>
              <button
                onClick={fetchMenuData}
                className="px-5 py-2.5 bg-aura-gold text-aura-obsidian font-bold text-xs rounded-xl flex items-center justify-center space-x-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-aura-container/40 rounded-3xl border border-aura-border p-8 max-w-lg mx-auto">
              <Utensils className="w-10 h-10 text-aura-slate/40 mx-auto" />
              <p className="font-serif text-lg text-aura-ivory">No dishes match your active filter</p>
              <p className="text-xs text-aura-slate leading-relaxed">Try clearing your dietary filters or searching for another dish.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-aura-gold text-aura-obsidian font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                  <div className="w-2 h-2 bg-aura-gold rounded-full animate-ping" />
                  <span className="text-[11px] text-aura-gold font-mono uppercase font-bold tracking-wider">
                    Loading More Dishes ({visibleCount} of {filteredItems.length})...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Call Waiter Button */}
      <CallWaiterButton tableId={tableId} />

      {/* Floating Help Bot for Users */}
      <HelpBotLauncher tableId={tableId} />

      {/* Floating Active Cart Bar */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-6 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl text-sm transition-all duration-200 shadow-2xl flex items-center justify-between border border-aura-gold/40"
          >
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-aura-obsidian text-aura-gold rounded-full text-xs flex items-center justify-center font-bold">
                {getItemCount()}
              </span>
              <span>View Active Table Cart</span>
            </div>
            <span className="font-mono font-bold text-base">₹{getGrandTotal().toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <DishDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
        onOrderPlaced={(orderId) => {
          setIsCartOpen(false);
          setActiveOrderId(orderId);
          clearCart();
        }}
      />

      {/* Mobile Sticky Floating Cart Bar (1-Tap Checkout on Mobile Screens) */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-aura-gold via-amber-400 to-aura-gold text-aura-obsidian font-bold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between border border-aura-gold/50 active:scale-95 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-aura-obsidian/20 rounded-xl flex items-center justify-center font-extrabold text-xs">
                {getItemCount()}
              </div>
              <span className="font-serif text-sm tracking-wide uppercase">View Active Cart</span>
            </div>
            <div className="flex items-center space-x-2 font-mono text-sm font-extrabold">
              <span>₹{getGrandTotal().toLocaleString('en-IN')}</span>
              <ShoppingBag className="w-4 h-4 text-aura-obsidian" />
            </div>
          </button>
        </div>
      )}

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
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <OffersDrawer isOpen={isOffersOpen} onClose={() => setIsOffersOpen(false)} />
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      <FaqModal isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />

      {/* Footer */}
      <CustomerFooter />
    </div>
  );
};
