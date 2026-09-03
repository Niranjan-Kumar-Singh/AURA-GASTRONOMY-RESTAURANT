import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/ui/data-display/StatusBadge';
import { StatCard } from '../../components/ui/cards/StatCard';
import { DataToolbar } from '../../components/ui/data-display/DataToolbar';
import { RevenueAreaChart, PeakHoursBarChart, CategoryDonutChart, OccupancyGauge } from '../../components/analytics/ChartComponents';
import { adminService, AdminMetrics } from '../../services/admin.service';
import { menuService } from '../../services/menu.service';
import { orderService } from '../../services/order.service';
import { MenuItem, Category } from '../../types/menu.types';
import { useToast } from '../../components/feedback/ToastContainer';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import {
  DollarSign, ShoppingBag, LayoutGrid, ChefHat, TrendingUp, RefreshCw, Layers, ShieldCheck,
  Calendar, Users, Play, Pause, AlertTriangle, Sparkles, Clock, Heart, Award, Utensils, Receipt, CheckCircle2,
  Plus, Edit, Trash2, Flame, Search, Filter, X, Check, Eye, EyeOff, CreditCard, Printer
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENU_CATALOG' | 'CATEGORIES' | 'AUDIT_LOGS'>('OVERVIEW');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Catalog Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Dish Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState<number | string>(450);
  const [dishCategoryId, setDishCategoryId] = useState<number>(1);
  const [dishImageUrl, setDishImageUrl] = useState('');
  const [dishSpiceLevel, setDishSpiceLevel] = useState<number>(0);
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishIsNonVeg, setDishIsNonVeg] = useState(false);
  const [dishIsGlutenFree, setDishIsGlutenFree] = useState(false);
  const [dishIsJain, setDishIsJain] = useState(false);
  const [dishIsChefSpecial, setDishIsChefSpecial] = useState(false);
  const [dishIsBestSeller, setDishIsBestSeller] = useState(false);
  const [dishIsAvailable, setDishIsAvailable] = useState(true);
  const [dishPrepTime, setDishPrepTime] = useState<number>(15);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Utensils');
  const [categoryDisplayOrder, setCategoryDisplayOrder] = useState<number>(1);

  // Load Admin Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch admin metrics', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load Categories & Menu Items
  const loadCatalogData = async () => {
    setIsLoadingCatalog(true);
    try {
      const [cats, items] = await Promise.all([
        menuService.getCategories().catch(() => []),
        menuService.getMenuItems().catch(() => [])
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu catalog data:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, [activeTab]);

  // Open Modal to Add/Edit Dish
  const handleOpenDishModal = (dish?: MenuItem) => {
    if (dish) {
      setEditingDish(dish);
      setDishName(dish.name);
      setDishDescription(dish.description || '');
      setDishPrice(dish.price);
      setDishCategoryId(dish.categoryId || 1);
      setDishImageUrl(dish.imageUrl || '');
      setDishSpiceLevel(dish.spiceLevel || 0);
      setDishIsVeg(dish.isVegetarian || false);
      setDishIsNonVeg(dish.isNonVeg || false);
      setDishIsGlutenFree(dish.isGlutenFree || false);
      setDishIsJain(dish.isJain || false);
      setDishIsChefSpecial(dish.isChefSpecial || false);
      setDishIsBestSeller(dish.isBestSeller || false);
      setDishIsAvailable(dish.isAvailable !== false);
      setDishPrepTime(dish.preparationTimeMinutes || 15);
    } else {
      setEditingDish(null);
      setDishName('');
      setDishDescription('');
      setDishPrice(450);
      setDishCategoryId(categories[0]?.id || 1);
      setDishImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80');
      setDishSpiceLevel(0);
      setDishIsVeg(true);
      setDishIsNonVeg(false);
      setDishIsGlutenFree(false);
      setDishIsJain(false);
      setDishIsChefSpecial(false);
      setDishIsBestSeller(false);
      setDishIsAvailable(true);
      setDishPrepTime(15);
    }
    setIsDishModalOpen(true);
  };

  // Save / Create / Update Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishPrice) {
      showToast('Please enter dish name and price', 'error');
      return;
    }

    const payload: Partial<MenuItem> = {
      name: dishName.trim(),
      description: dishDescription.trim() || 'Artisanal dish crafted by AURA chefs.',
      price: Number(dishPrice),
      categoryId: Number(dishCategoryId),
      imageUrl: dishImageUrl.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      spiceLevel: Number(dishSpiceLevel),
      isVegetarian: dishIsVeg,
      isNonVeg: dishIsNonVeg,
      isGlutenFree: dishIsGlutenFree,
      isJain: dishIsJain,
      isChefSpecial: dishIsChefSpecial,
      isBestSeller: dishIsBestSeller,
      isAvailable: dishIsAvailable,
      preparationTimeMinutes: Number(dishPrepTime)
    };

    try {
      if (editingDish) {
        await menuService.updateMenuItem(editingDish.id, payload);
        showToast(`Updated "${dishName}" successfully!`, 'success');
      } else {
        await menuService.createMenuItem(payload);
        showToast(`Added new dish "${dishName}" (₹${dishPrice}) to catalog!`, 'success');
      }
      setIsDishModalOpen(false);
      loadCatalogData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save dish', 'error');
    }
  };

  // Toggle Availability (In-Stock / Out-of-Stock)
  const handleToggleAvailability = async (item: MenuItem) => {
    const nextStatus = !item.isAvailable;
    const targetId = item.id || (item as any)._id;
    try {
      await menuService.updateMenuItem(targetId, { isAvailable: nextStatus });
      setMenuItems((prev) =>
        prev.map((it) => ((it.id === item.id || (it as any)._id === targetId) ? { ...it, isAvailable: nextStatus } : it))
      );
      showToast(
        `"${item.name}" marked ${nextStatus ? 'IN STOCK' : 'OUT OF STOCK'}`,
        nextStatus ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update availability', 'error');
    }
  };

  // Delete Dish
  const handleDeleteDish = async (dish: MenuItem) => {
    if (!window.confirm(`Are you sure you want to delete "${dish.name}" from the menu catalog?`)) return;
    try {
      await menuService.deleteMenuItem(dish.id);
      showToast(`Deleted "${dish.name}" from catalog`, 'info');
      loadCatalogData();
    } catch (err) {
      showToast('Failed to delete dish', 'error');
    }
  };

  // Open Category Modal
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryIcon(cat.iconName || 'Utensils');
      setCategoryDisplayOrder(cat.displayOrder || 1);
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryIcon('Utensils');
      setCategoryDisplayOrder(categories.length + 1);
    }
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    try {
      if (editingCategory) {
        await menuService.updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          iconName: categoryIcon,
          displayOrder: Number(categoryDisplayOrder)
        });
        showToast(`Category "${categoryName}" updated!`, 'success');
      } else {
        await menuService.createCategory({
          name: categoryName.trim(),
          icon: categoryIcon,
          displayOrder: Number(categoryDisplayOrder)
        });
        showToast(`New Category "${categoryName}" created!`, 'success');
      }
      setIsCategoryModalOpen(false);
      loadCatalogData();
    } catch (err: any) {
      showToast('Failed to save category', 'error');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await menuService.deleteCategory(cat.id);
      showToast(`Category "${cat.name}" removed`, 'info');
      loadCatalogData();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || String(item.categoryId) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const csvData = `ID,Role,UserEmail,Action,Timestamp\n101,ADMIN,admin@aura.com,TABLE_TOKEN_GENERATE,${new Date().toISOString()}\n102,CUSTOMER,guest@table1.com,ORDER_PLACED,${new Date().toISOString()}`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_admin_audit_${Date.now()}.csv`;
    a.click();
  };

  // Detail Drill-Down Modal State
  const [activeDetailModal, setActiveDetailModal] = useState<'REVENUE' | 'ONGOING' | 'COMPLETED' | 'RESERVATIONS' | 'REFUNDS' | null>(null);
  const [viewBillOrder, setViewBillOrder] = useState<any | null>(null);

  // Lock background body scroll when any modal is open
  useBodyScrollLock(isDishModalOpen || isCategoryModalOpen || activeDetailModal !== null || viewBillOrder !== null);

  // Real MongoDB Orders State
  const [realActiveOrders, setRealActiveOrders] = useState<any[]>([]);
  const [realSettledOrders, setRealSettledOrders] = useState<any[]>([]);
  const [realRefundedOrders, setRealRefundedOrders] = useState<any[]>([]);
  const [isLoadingRealOrders, setIsLoadingRealOrders] = useState(false);

  const fetchMetricsAndOrders = async (showLoading = false) => {
    if (showLoading) setIsLoadingRealOrders(true);
    try {
      const [m, active, settled, refunded] = await Promise.all([
        adminService.getMetrics().catch(() => null),
        orderService.getActiveOrders().catch(() => []),
        orderService.getSettledOrders().catch(() => []),
        orderService.getRefundedOrders().catch(() => [])
      ]);
      if (m) setMetrics(m);
      setRealActiveOrders(active || []);
      setRealSettledOrders(settled || []);
      setRealRefundedOrders(refunded || []);
    } catch (err) {
      console.error('Failed to fetch live real-time dashboard metrics:', err);
    } finally {
      if (showLoading) setIsLoadingRealOrders(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndOrders(true);

    // Auto-update dashboard metrics every 5 seconds for real-time synchronization
    const intervalId = setInterval(() => {
      fetchMetricsAndOrders(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeDetailModal, activeTab]);

  const handleAdminRefundOrder = async (orderId: string, invoiceNum: string, amount: number) => {
    const reason = prompt(`Enter refund reason for Invoice ${invoiceNum || orderId}:`, 'Guest Dissatisfaction / Admin Refund');
    if (reason === null) return;

    try {
      await orderService.refundOrder(orderId, reason);
      showToast(`Order #${invoiceNum || orderId} refunded cleanly (₹${amount.toLocaleString('en-IN')})`, 'success');
      fetchMetricsAndOrders(true);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to refund order', 'error');
    }
  };

  // Calculate live metrics from real MongoDB orders
  const liveSettledRevenue = realSettledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const displayRevenue = liveSettledRevenue > 0 ? liveSettledRevenue : (metrics?.revenue || 0);

  const totalProcessedOrders = realSettledOrders.length + realRefundedOrders.length;
  const liveRefundRate = totalProcessedOrders > 0
    ? ((realRefundedOrders.length / totalProcessedOrders) * 100).toFixed(1)
    : '0.0';
  const totalRefundedSum = realRefundedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="h-full overflow-y-auto p-6 font-sans text-aura-ivory">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-aura-container border border-aura-border/80 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl shadow-inner">
              <TrendingUp className="w-8 h-8 text-[#38BDF8]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
                ADMIN MISSION CONTROL
              </h1>
              <p className="text-xs text-aura-slate mt-0.5">Live Menu Catalog Management & Enterprise Operations Audit</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono text-xs shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-wider uppercase text-[11px]">Real-Time DB Sync</span>
            </div>

            <button
              onClick={() => fetchMetricsAndOrders(true)}
              disabled={isLoadingRealOrders}
              className="px-4 py-2.5 bg-aura-obsidian hover:bg-aura-container border border-aura-border text-aura-ivory rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${isLoadingRealOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Stream</span>
            </button>

            <a
              href="/owner"
              className="px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs rounded-xl shadow-lg shadow-[#0EA5E9]/20 transition-all flex items-center space-x-2 cursor-pointer border border-[#7DD3FC]/50"
            >
              <Award className="w-4 h-4" />
              <span>Owner CEO Analytics →</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs border-b border-aura-border/60 pb-3">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] shadow-lg font-black'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-[#38BDF8]/50'
            }`}
          >
            Operational Overview
          </button>
          <button
            onClick={() => setActiveTab('MENU_CATALOG')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'MENU_CATALOG'
                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] shadow-lg font-black'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-[#38BDF8]/50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Manage Menu Dishes ({menuItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'CATEGORIES'
                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] shadow-lg font-black'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-[#38BDF8]/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] shadow-lg font-black'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-[#38BDF8]/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Audit Stream</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Revenue Today"
                value={`₹${displayRevenue.toLocaleString('en-IN')}`}
                subtitle="Calculated from settled bills"
                trend="Live DB Data"
                icon={DollarSign}
                iconColor="text-emerald-400"
                onClick={() => setActiveDetailModal('REVENUE')}
                clickHint="View Sales Details"
              />
              <StatCard
                title="Ongoing Orders"
                value={realActiveOrders.length}
                subtitle="Active dining tickets"
                trend="Live DB Data"
                icon={ShoppingBag}
                iconColor="text-[#38BDF8]"
                onClick={() => setActiveDetailModal('ONGOING')}
                clickHint="View Active Tickets"
              />
              <StatCard
                title="Completed Orders"
                value={realSettledOrders.length}
                subtitle="Successfully served"
                icon={CheckCircle2}
                iconColor="text-blue-400"
                onClick={() => setActiveDetailModal('COMPLETED')}
                clickHint="View Order Logs"
              />
              <StatCard
                title="Total Menu Dishes"
                value={menuItems.length || metrics?.dishes || 0}
                subtitle="Active catalog items"
                icon={ChefHat}
                iconColor="text-amber-400"
                onClick={() => setActiveTab('MENU_CATALOG')}
                clickHint="Manage Catalog"
              />

              <StatCard
                title="Active Reservations"
                value="31 Bookings"
                subtitle="4 VIP party bookings"
                icon={Calendar}
                iconColor="text-purple-400"
                onClick={() => setActiveDetailModal('RESERVATIONS')}
                clickHint="View Bookings"
              />
              <StatCard
                title="Est. Gross Profit"
                value={`₹${metrics?.profit.toLocaleString('en-IN') || '0'}`}
                subtitle="Based on 35% margin"
                icon={TrendingUp}
                iconColor="text-rose-400"
                onClick={() => setActiveDetailModal('REVENUE')}
                clickHint="View Margins"
              />
              <StatCard
                title="Kitchen Efficiency"
                value="98.2%"
                subtitle="Recipe waste score"
                icon={Utensils}
                iconColor="text-emerald-400"
                onClick={() => setActiveDetailModal('ONGOING')}
                clickHint="View KDS Status"
              />
              <StatCard
                title="Refund Rate"
                value={`${liveRefundRate}%`}
                subtitle={`₹${totalRefundedSum.toLocaleString('en-IN')} refunded today`}
                icon={ShieldCheck}
                iconColor="text-blue-400"
                onClick={() => setActiveDetailModal('REFUNDS')}
                clickHint="View Refund Audit"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <RevenueAreaChart />
                <PeakHoursBarChart />
              </div>
              <div className="space-y-6">
                <OccupancyGauge />
                <CategoryDonutChart />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MENU DISHES MANAGEMENT */}
        {activeTab === 'MENU_CATALOG' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-aura-container border border-aura-border p-5 rounded-3xl">
              <div className="flex items-center space-x-3">
                <ChefHat className="w-6 h-6 text-[#38BDF8]" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Menu Catalog Master</h3>
                  <p className="text-xs text-aura-slate">Add, edit, toggle availability, or remove dishes from customer menu</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenDishModal()}
                className="px-5 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Recipe Item</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-aura-slate" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dish name or description..."
                  className="w-full pl-10 pr-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-xs text-aura-ivory placeholder:text-aura-slate/50 focus:outline-none focus:border-[#38BDF8] font-mono"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-xs text-aura-ivory font-mono focus:outline-none focus:border-[#38BDF8] cursor-pointer"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dish Cards Grid */}
            {isLoadingCatalog ? (
              <div className="py-16 text-center text-aura-slate font-mono text-xs">
                Loading menu catalog from MongoDB...
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="py-16 text-center bg-aura-container border border-aura-border/60 rounded-3xl space-y-3">
                <ChefHat className="w-10 h-10 text-[#38BDF8]/40 mx-auto" />
                <p className="text-sm font-semibold text-aura-slate">No dishes found matching search criteria</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                  className="text-xs text-[#38BDF8] underline hover:text-white cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map((dish) => {
                  const cat = categories.find((c) => c.id === dish.categoryId);
                  return (
                    <div
                      key={dish.id}
                      className={`bg-aura-container border rounded-3xl p-4 flex flex-col justify-between space-y-4 transition-all shadow-xl hover:border-[#38BDF8]/50 relative overflow-hidden ${
                        dish.isAvailable ? 'border-aura-border/80' : 'border-rose-500/40 bg-rose-500/5'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-aura-border/80 shadow-md flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider block truncate">
                                {cat?.name || `Cat #${dish.categoryId}`}
                              </span>
                              <span className="text-[10px] font-mono text-aura-slate">#{dish.id}</span>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-white truncate">{dish.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-serif font-bold text-[#38BDF8] text-base">
                                ₹{dish.price.toLocaleString('en-IN')}
                              </span>
                              {dish.isVegetarian && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                                  VEG
                                </span>
                              )}
                              {dish.isChefSpecial && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] font-bold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> SPECIAL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-aura-slate line-clamp-2 leading-relaxed font-light">
                          {dish.description}
                        </p>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-3 border-t border-aura-border/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleAvailability(dish)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                            dish.isAvailable
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {dish.isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{dish.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}</span>
                        </button>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleOpenDishModal(dish)}
                            className="p-2 bg-aura-obsidian hover:bg-[#38BDF8]/10 border border-aura-border hover:border-[#38BDF8]/40 text-aura-slate hover:text-[#38BDF8] rounded-xl transition-all cursor-pointer"
                            title="Edit Dish"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish)}
                            className="p-2 bg-aura-obsidian hover:bg-rose-500/10 border border-aura-border hover:border-rose-500/40 text-aura-slate hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {activeTab === 'CATEGORIES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-aura-container border border-aura-border p-5 rounded-3xl">
              <div className="flex items-center space-x-3">
                <Layers className="w-6 h-6 text-[#38BDF8]" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Menu Categories</h3>
                  <p className="text-xs text-aura-slate">Organize and re-order menu categories across the customer digital menu</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenCategoryModal()}
                className="px-5 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-aura-container border border-aura-border/80 rounded-3xl p-5 flex items-center justify-between shadow-xl hover:border-[#38BDF8]/50 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl text-[#38BDF8] font-bold">
                        #{cat.displayOrder || cat.id}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-white">{cat.name}</h4>
                        <span className="text-xs text-aura-slate font-mono block">{count} Recipe Items</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-2.5 bg-aura-obsidian hover:bg-[#38BDF8]/10 border border-aura-border hover:border-[#38BDF8]/40 text-aura-slate hover:text-[#38BDF8] rounded-xl transition-all cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2.5 bg-aura-obsidian hover:bg-rose-500/10 border border-aura-border hover:border-rose-500/40 text-aura-slate hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="bg-aura-container border border-aura-border rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Security Audit Log Stream
            </h3>

            <DataToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onExportCSV={handleExportCSV}
              placeholder="Search audit events..."
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-aura-ivory">
                <thead className="bg-aura-obsidian text-aura-slate uppercase text-[10px] border-b border-aura-border">
                  <tr>
                    <th className="py-3.5 px-4">Log ID</th>
                    <th className="py-3.5 px-4">Action Event</th>
                    <th className="py-3.5 px-4">User Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-border/40 font-mono">
                  <tr className="hover:bg-aura-obsidian/40">
                    <td className="py-3.5 px-4 text-[#38BDF8] font-bold">#101</td>
                    <td className="py-3.5 px-4 font-semibold text-aura-ivory">TABLE_SESSION_CHECKOUT</td>
                    <td className="py-3.5 px-4 text-aura-slate">admin@aura.com</td>
                    <td className="py-3.5 px-4"><StatusBadge status="SETTLED" /></td>
                    <td className="py-3.5 px-4 text-aura-slate">Just now</td>
                  </tr>
                  <tr className="hover:bg-aura-obsidian/40">
                    <td className="py-3.5 px-4 text-[#38BDF8] font-bold">#102</td>
                    <td className="py-3.5 px-4 font-semibold text-aura-ivory">ORDER_PLACED</td>
                    <td className="py-3.5 px-4 text-aura-slate">guest@table10.com</td>
                    <td className="py-3.5 px-4"><StatusBadge status="PENDING" /></td>
                    <td className="py-3.5 px-4 text-aura-slate">2 min ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DISH ADD / EDIT MODAL */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-aura-container border border-aura-border rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <ChefHat className="w-6 h-6 text-[#38BDF8]" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {editingDish ? `Edit "${editingDish.name}"` : 'Add New Recipe Dish'}
                </h3>
              </div>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-2 text-aura-slate hover:text-aura-ivory transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Kashmiri Saffron Zafrani Murgh Tikka"
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-aura-slate uppercase tracking-wider block">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    placeholder="650"
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-aura-slate uppercase tracking-wider block">Category</label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Description</label>
                <textarea
                  rows={3}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Artisanal description of ingredients, preparation method, and flavors..."
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Image URL</label>
                <input
                  type="text"
                  value={dishImageUrl}
                  onChange={(e) => setDishImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono text-[11px]"
                />
              </div>

              {/* Prep Time & Spice Level Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-aura-slate uppercase tracking-wider block">Spice Level</label>
                  <select
                    value={dishSpiceLevel}
                    onChange={(e) => setDishSpiceLevel(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono cursor-pointer"
                  >
                    <option value={0}>🌶️ None (0)</option>
                    <option value={1}>🌶️ Mild (1)</option>
                    <option value={2}>🌶️🌶️ Medium (2)</option>
                    <option value={3}>🌶️🌶️🌶️ Hot & Spicy (3)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-aura-slate uppercase tracking-wider block">Prep Time (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={dishPrepTime}
                    onChange={(e) => setDishPrepTime(Number(e.target.value))}
                    placeholder="15"
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono"
                  />
                </div>
              </div>

              {/* Toggles & Tags Grid */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Dietary Tags & Badges</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsVeg}
                      onChange={(e) => {
                        setDishIsVeg(e.target.checked);
                        if (e.target.checked) setDishIsNonVeg(false);
                      }}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-emerald-400">Vegetarian</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsNonVeg}
                      onChange={(e) => {
                        setDishIsNonVeg(e.target.checked);
                        if (e.target.checked) setDishIsVeg(false);
                      }}
                      className="accent-rose-500 rounded"
                    />
                    <span className="font-bold text-rose-400">Non-Veg</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsGlutenFree}
                      onChange={(e) => setDishIsGlutenFree(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    <span className="font-bold text-amber-300">Gluten-Free (GF)</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsJain}
                      onChange={(e) => setDishIsJain(e.target.checked)}
                      className="accent-purple-400 rounded"
                    />
                    <span className="font-bold text-purple-300">Jain</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsChefSpecial}
                      onChange={(e) => setDishIsChefSpecial(e.target.checked)}
                      className="accent-[#0EA5E9] rounded"
                    />
                    <span className="font-bold text-[#38BDF8]">Chef Special</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all">
                    <input
                      type="checkbox"
                      checked={dishIsBestSeller}
                      onChange={(e) => setDishIsBestSeller(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span className="font-bold text-amber-400">Best Seller</span>
                  </label>

                  <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer hover:border-[#38BDF8]/40 transition-all col-span-2 sm:col-span-1">
                    <input
                      type="checkbox"
                      checked={dishIsAvailable}
                      onChange={(e) => setDishIsAvailable(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className="font-bold text-aura-ivory">In Stock</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-aura-border/60">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-5 py-3 bg-aura-obsidian hover:bg-aura-border text-aura-slate hover:text-aura-ivory font-bold rounded-2xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl uppercase tracking-wider shadow-lg shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-aura-container border border-aura-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <Layers className="w-6 h-6 text-[#38BDF8]" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {editingCategory ? `Edit "${editingCategory.name}"` : 'Add Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-aura-slate hover:text-aura-ivory transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Botanical Cocktails & Elixirs"
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Display Order</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={categoryDisplayOrder}
                  onChange={(e) => setCategoryDisplayOrder(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-[#38BDF8] font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-aura-border/60">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-3 bg-aura-obsidian hover:bg-aura-border text-aura-slate hover:text-aura-ivory font-bold rounded-2xl uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl uppercase tracking-wider shadow-lg shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DRILL-DOWN DETAIL MODALS */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-aura-container border border-aura-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-aura-border/60 pb-4">
              <div className="flex items-center space-x-3">
                {activeDetailModal === 'REVENUE' && <DollarSign className="w-6 h-6 text-emerald-400" />}
                {activeDetailModal === 'ONGOING' && <ShoppingBag className="w-6 h-6 text-[#38BDF8]" />}
                {activeDetailModal === 'COMPLETED' && <CheckCircle2 className="w-6 h-6 text-blue-400" />}
                {activeDetailModal === 'RESERVATIONS' && <Calendar className="w-6 h-6 text-purple-400" />}
                <h3 className="font-serif text-xl font-bold text-white">
                  {activeDetailModal === 'REVENUE' && 'Daily Revenue & Profit Breakdown'}
                  {activeDetailModal === 'ONGOING' && 'Active Dining Tickets & KDS Status'}
                  {activeDetailModal === 'COMPLETED' && "Today's Settled Orders Log"}
                  {activeDetailModal === 'RESERVATIONS' && "Today's Table Reservations Roster"}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="p-2 text-aura-slate hover:text-aura-ivory transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* REVENUE DRILL-DOWN */}
            {activeDetailModal === 'REVENUE' && (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">Gross Sales</span>
                    <span className="font-serif font-bold text-xl text-emerald-400">
                      ₹{displayRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">Est. Profit (35%)</span>
                    <span className="font-serif font-bold text-xl text-[#38BDF8]">
                      ₹{(displayRevenue * 0.35).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">GST Collected (5%)</span>
                    <span className="font-serif font-bold text-xl text-blue-400">
                      ₹{(displayRevenue * 0.05).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#38BDF8] uppercase tracking-wider text-[11px]">Real Settled Orders Breakdown ({realSettledOrders.length} Invoices)</h4>
                  {realSettledOrders.length === 0 ? (
                    <div className="p-4 bg-aura-obsidian border border-aura-border rounded-xl text-center text-aura-slate font-mono">
                      No settled bills in database yet. Settle bills at Cashier POS to see live revenue breakdown.
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono">
                      {realSettledOrders.slice(0, 5).map((ord) => (
                        <div key={ord._id || ord.orderId} className="p-3 bg-aura-obsidian border border-aura-border rounded-xl flex items-center justify-between">
                          <span className="text-aura-ivory flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-emerald-400" /> Invoice #{ord.invoiceNumber || ord.orderId} (Table {ord.tableId})
                          </span>
                          <span className="font-bold text-emerald-400">₹{(ord.total || 0).toLocaleString('en-IN')} ({ord.paymentMethod || 'UPI/Card'})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGOING ORDERS DRILL-DOWN */}
            {activeDetailModal === 'ONGOING' && (
              <div className="space-y-4 text-xs">
                <p className="text-aura-slate">Live active dining tickets currently in kitchen preparation or serving stage (MongoDB Database):</p>
                {isLoadingRealOrders ? (
                  <div className="py-8 text-center text-aura-slate font-mono">Fetching active tickets from MongoDB...</div>
                ) : realActiveOrders.length === 0 ? (
                  <div className="py-12 text-center bg-aura-obsidian border border-aura-border rounded-2xl space-y-2 font-mono">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-aura-ivory text-sm">No Active Ongoing Orders</p>
                    <p className="text-aura-slate text-xs">All dining tickets have been completed or settled at Cashier POS.</p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    {realActiveOrders.map((ord) => (
                      <div key={ord._id || ord.orderId} className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#38BDF8]">Table {ord.tableId}</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                              {ord.status || 'received'}
                            </span>
                          </div>
                          <span className="text-aura-slate text-[11px] block mt-1">
                            Order #{ord.orderId} • {ord.items?.length || 0} Items {ord.customerName ? `• Guest: ${ord.customerName}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-bold text-base text-aura-ivory mr-2">
                            ₹{(ord.total || 0).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => setViewBillOrder(ord)}
                            className="px-2.5 py-1 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/40 font-bold text-[10px] uppercase rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMPLETED ORDERS DRILL-DOWN */}
            {activeDetailModal === 'COMPLETED' && (
              <div className="space-y-4 text-xs">
                <p className="text-aura-slate">History of settled bills and invoices processed today (MongoDB Database):</p>
                {isLoadingRealOrders ? (
                  <div className="py-8 text-center text-aura-slate font-mono">Fetching settled orders from MongoDB...</div>
                ) : realSettledOrders.length === 0 ? (
                  <div className="py-12 text-center bg-aura-obsidian border border-aura-border rounded-2xl space-y-2 font-mono">
                    <Receipt className="w-8 h-8 text-[#38BDF8] mx-auto" />
                    <p className="font-bold text-aura-ivory text-sm">No Settled Bills Recorded Yet Today</p>
                    <p className="text-aura-slate text-xs">Settled orders from Cashier POS will automatically appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-aura-obsidian text-aura-slate uppercase text-[10px] border-b border-aura-border">
                        <tr>
                          <th className="py-2.5 px-3">Invoice #</th>
                          <th className="py-2.5 px-3">Table</th>
                          <th className="py-2.5 px-3">Payment</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-aura-border/40">
                        {realSettledOrders.map((ord) => (
                          <tr key={ord._id || ord.orderId}>
                            <td className="py-3 px-3 text-[#38BDF8] font-bold">{ord.invoiceNumber || ord.orderId}</td>
                            <td className="py-3 px-3">Table {ord.tableId}</td>
                            <td className="py-3 px-3 text-aura-slate">{ord.paymentMethod || 'UPI/Card'}</td>
                            <td className="py-3 px-3 font-bold text-emerald-400">₹{(ord.total || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3"><StatusBadge status="SETTLED" /></td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setViewBillOrder(ord)}
                                  className="px-2.5 py-1 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/40 font-bold text-[10px] uppercase rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Bill</span>
                                </button>
                                <button
                                  onClick={() => handleAdminRefundOrder(ord.orderId || ord._id, ord.invoiceNumber || ord.orderId, ord.total || 0)}
                                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[10px] uppercase rounded-lg transition-all cursor-pointer flex items-center space-x-1"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Refund</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* RESERVATIONS DRILL-DOWN */}
            {activeDetailModal === 'RESERVATIONS' && (
              <div className="space-y-4 text-xs">
                <p className="text-aura-slate">Scheduled table reservations and VIP guest bookings today:</p>
                <div className="space-y-3 font-mono">
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#38BDF8] text-sm">Baron Rothschild</h4>
                      <span className="text-aura-slate text-[11px]">Party of 4 • VIP Terrace Table 1</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-300 block">8:00 PM Today</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">CONFIRMED</span>
                    </div>
                  </div>

                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#38BDF8] text-sm">Dr. Ananya Sharma</h4>
                      <span className="text-aura-slate text-[11px]">Party of 2 • Main Dining Table 8</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-300 block">8:30 PM Today</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">SEATED</span>
                    </div>
                  </div>

                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#38BDF8] text-sm">Vikramaditya Singh</h4>
                      <span className="text-aura-slate text-[11px]">Party of 6 • Private Dining Suite</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-300 block">9:15 PM Today</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">CONFIRMED</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REFUNDS DRILL-DOWN */}
            {activeDetailModal === 'REFUNDS' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">Refund Rate</span>
                    <span className="font-serif font-bold text-xl text-rose-400">{liveRefundRate}%</span>
                  </div>
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">Refunded Bills</span>
                    <span className="font-serif font-bold text-xl text-[#38BDF8]">{realRefundedOrders.length} Orders</span>
                  </div>
                  <div className="p-4 bg-aura-obsidian border border-aura-border rounded-2xl">
                    <span className="text-[10px] text-aura-slate uppercase font-bold block">Total Refunded Amount</span>
                    <span className="font-serif font-bold text-xl text-emerald-400">₹{totalRefundedSum.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-aura-slate">Live refund audit log stream and voided bills from MongoDB:</p>

                {isLoadingRealOrders ? (
                  <div className="py-8 text-center text-aura-slate font-mono">Fetching refund logs from MongoDB...</div>
                ) : realRefundedOrders.length === 0 ? (
                  <div className="py-12 text-center bg-aura-obsidian border border-aura-border rounded-2xl space-y-2 font-mono">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-aura-ivory text-sm">Clean Audit: 0 Refunded Bills</p>
                    <p className="text-aura-slate text-xs">No orders have been voided or refunded today.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-aura-obsidian text-aura-slate uppercase text-[10px] border-b border-aura-border">
                        <tr>
                          <th className="py-2.5 px-3">Invoice #</th>
                          <th className="py-2.5 px-3">Table</th>
                          <th className="py-2.5 px-3">Reason</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-aura-border/40">
                        {realRefundedOrders.map((ord) => (
                          <tr key={ord._id || ord.orderId}>
                            <td className="py-3 px-3 text-rose-400 font-bold">{ord.invoiceNumber || ord.orderId}</td>
                            <td className="py-3 px-3">Table {ord.tableId}</td>
                            <td className="py-3 px-3 text-aura-slate">{ord.refundReason || 'Customer Request'}</td>
                            <td className="py-3 px-3 font-bold text-rose-400">₹{(ord.total || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3"><StatusBadge status="REFUNDED" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ITEMIZATION / PRINTABLE GST INVOICE MODAL */}
      {viewBillOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setViewBillOrder(null); }}
        >
          <div className="printable-invoice bg-white text-gray-900 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 relative font-mono text-xs">
            <button
              onClick={() => setViewBillOrder(null)}
              className="no-print absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Restaurant Brand Header */}
            <div className="text-center space-y-1 border-b border-gray-200 pb-4">
              <div className="flex justify-center items-center space-x-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <h2 className="font-serif font-black text-xl text-gray-900 tracking-wider">AURA GASTRONOMY</h2>
              </div>
              <p className="text-[10px] text-gray-500 font-sans">Luxury Fine Dining & Artisanal Kitchen</p>
              <p className="text-[9px] text-gray-400">GSTIN: 27AABCA1234F1ZM • FSSAI: 11521001000456</p>
            </div>

            {/* Invoice Meta */}
            <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Tax Invoice #:</span>
                <span className="font-bold">{viewBillOrder.invoiceNumber || viewBillOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Table Number:</span>
                <span className="font-bold">Table {viewBillOrder.tableId}</span>
              </div>
              {viewBillOrder.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Guest Name:</span>
                  <span className="font-bold">{viewBillOrder.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{viewBillOrder.paymentStatus || viewBillOrder.status}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-300 pb-1">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Total</span>
              </div>

              {(viewBillOrder.items || []).map((it: any, i: number) => (
                <div key={i} className="grid grid-cols-12 text-xs py-1 border-b border-gray-100">
                  <span className="col-span-6 font-medium text-gray-800">{it.name}</span>
                  <span className="col-span-2 text-center text-gray-500">{it.quantity || it.qty || 1}</span>
                  <span className="col-span-4 text-right font-bold text-gray-900">
                    ₹{((it.quantity || it.qty || 1) * (it.price || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Tax Breakdown */}
            <div className="space-y-1 pt-2 border-t border-gray-300 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(viewBillOrder.subtotal || viewBillOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (2.5%)</span>
                <span>₹{(viewBillOrder.tax ? viewBillOrder.tax / 2 : 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (2.5%)</span>
                <span>₹{(viewBillOrder.tax ? viewBillOrder.tax / 2 : 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>GRAND TOTAL</span>
                <span>₹{(viewBillOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="no-print flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setViewBillOrder(null)}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
