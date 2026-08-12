import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/ui/cards/StatCard';
import { DataToolbar } from '../../components/ui/data-display/DataToolbar';
import { StatusBadge } from '../../components/ui/data-display/StatusBadge';
import { RevenueAreaChart, PeakHoursBarChart, CategoryDonutChart, OccupancyGauge } from '../../components/analytics/ChartComponents';
import { useDemoSimulation } from '../../hooks/useDemoSimulation';
import { adminService, AdminMetrics } from '../../services/admin.service';
import { menuService } from '../../services/menu.service';
import { MenuItem, Category } from '../../types/menu.types';
import { useToast } from '../../components/feedback/ToastContainer';
import {
  DollarSign, ShoppingBag, LayoutGrid, ChefHat, TrendingUp, RefreshCw, Layers, ShieldCheck,
  Calendar, Users, Play, Pause, AlertTriangle, Sparkles, Clock, Heart, Award, Utensils, Receipt, CheckCircle2,
  Plus, Edit, Trash2, Flame, Search, Filter, X, Check, Eye, EyeOff
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const { isSimulating, toggleSimulation, latestEvent } = useDemoSimulation();
  
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
    if (activeTab === 'MENU_CATALOG' || activeTab === 'CATEGORIES') {
      loadCatalogData();
    }
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
    try {
      await menuService.updateMenuItem(item.id, { isAvailable: nextStatus });
      setMenuItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isAvailable: nextStatus } : it))
      );
      showToast(
        `"${item.name}" marked ${nextStatus ? 'IN STOCK' : 'OUT OF STOCK'}`,
        nextStatus ? 'success' : 'info'
      );
    } catch (err) {
      showToast('Failed to update availability', 'error');
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

  return (
    <div className="h-full overflow-y-auto p-6 font-sans text-aura-ivory">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-aura-container border border-aura-border/80 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl shadow-inner">
              <TrendingUp className="w-8 h-8 text-aura-gold" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-aura-ivory">
                ADMIN MISSION CONTROL
              </h1>
              <p className="text-xs text-aura-slate mt-0.5">Live Menu Catalog Management & Enterprise Operations Audit</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSimulation}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all cursor-pointer ${
                isSimulating
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-aura-obsidian border-aura-border text-aura-slate hover:text-aura-ivory'
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSimulating ? 'Demo Mode Active' : 'Start Demo Stream'}</span>
            </button>

            <a
              href="/owner"
              className="px-4 py-2.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl shadow-lg shadow-aura-gold/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Owner CEO Analytics →</span>
            </a>
          </div>
        </div>

        {/* Live Simulation Ticker */}
        {isSimulating && (
          <div className="bg-aura-gold/10 border border-aura-gold/30 p-4 rounded-2xl flex items-center justify-between text-xs text-aura-gold shadow-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin text-aura-gold" />
              <span className="font-semibold">Live Event Stream:</span>
              <span className="text-aura-ivory font-mono">{latestEvent}</span>
            </div>
            <span className="text-[10px] text-aura-slate font-mono hidden sm:inline">Auto-refreshes every 12s</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs border-b border-aura-border/60 pb-3">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
            }`}
          >
            Operational Overview
          </button>
          <button
            onClick={() => setActiveTab('MENU_CATALOG')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'MENU_CATALOG'
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Manage Menu Dishes ({menuItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'CATEGORIES'
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 rounded-xl font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
                : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
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
              <StatCard title="Revenue Today" value={`₹${metrics?.revenue.toLocaleString('en-IN') || '0'}`} subtitle="Calculated from settled bills" trend="Live Data" icon={DollarSign} iconColor="text-emerald-400" />
              <StatCard title="Ongoing Orders" value={metrics?.ongoingOrders || 0} subtitle="Active dining tickets" trend="Live Data" icon={ShoppingBag} iconColor="text-aura-gold" />
              <StatCard title="Completed Orders" value={metrics?.completedOrders || 0} subtitle="Successfully served" icon={CheckCircle2} iconColor="text-blue-400" />
              <StatCard title="Total Menu Dishes" value={metrics?.dishes || menuItems.length} subtitle="Active catalog items" icon={ChefHat} iconColor="text-amber-400" />

              <StatCard title="Active Reservations" value="31 Bookings" subtitle="4 VIP party bookings" icon={Calendar} iconColor="text-purple-400" />
              <StatCard title="Est. Gross Profit" value={`₹${metrics?.profit.toLocaleString('en-IN') || '0'}`} subtitle="Based on 35% margin" icon={TrendingUp} iconColor="text-rose-400" />
              <StatCard title="Kitchen Efficiency" value="98.2%" subtitle="Recipe waste score" icon={Utensils} iconColor="text-emerald-400" />
              <StatCard title="Refund Rate" value="0.1%" subtitle="₹0 refunded today" icon={ShieldCheck} iconColor="text-blue-400" />
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
                <ChefHat className="w-6 h-6 text-aura-gold" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-aura-ivory">Menu Catalog Master</h3>
                  <p className="text-xs text-aura-slate">Add, edit, toggle availability, or remove dishes from customer menu</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenDishModal()}
                className="px-5 py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-aura-gold/20 cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-xs text-aura-ivory placeholder:text-aura-slate/50 focus:outline-none focus:border-aura-gold font-mono"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-xs text-aura-ivory font-mono focus:outline-none focus:border-aura-gold cursor-pointer"
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
                <ChefHat className="w-10 h-10 text-aura-gold/40 mx-auto" />
                <p className="text-sm font-semibold text-aura-slate">No dishes found matching search criteria</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                  className="text-xs text-aura-gold underline hover:text-aura-ivory cursor-pointer"
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
                      className={`bg-aura-container border rounded-3xl p-4 flex flex-col justify-between space-y-4 transition-all shadow-xl hover:border-aura-gold/50 relative overflow-hidden ${
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
                              <span className="text-[10px] font-mono text-aura-gold uppercase tracking-wider block truncate">
                                {cat?.name || `Cat #${dish.categoryId}`}
                              </span>
                              <span className="text-[10px] font-mono text-aura-slate">#{dish.id}</span>
                            </div>
                            <h4 className="font-serif font-bold text-sm text-aura-ivory truncate">{dish.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-serif font-bold text-aura-gold text-base">
                                ₹{dish.price.toLocaleString('en-IN')}
                              </span>
                              {dish.isVegetarian && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                                  VEG
                                </span>
                              )}
                              {dish.isChefSpecial && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-aura-gold/10 border border-aura-gold/30 text-aura-gold font-bold flex items-center gap-0.5">
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
                            className="p-2 bg-aura-obsidian hover:bg-aura-gold/10 border border-aura-border hover:border-aura-gold/40 text-aura-slate hover:text-aura-gold rounded-xl transition-all cursor-pointer"
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
                <Layers className="w-6 h-6 text-aura-gold" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-aura-ivory">Menu Categories</h3>
                  <p className="text-xs text-aura-slate">Organize and re-order menu categories across the customer digital menu</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenCategoryModal()}
                className="px-5 py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-aura-gold/20 cursor-pointer"
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
                    className="bg-aura-container border border-aura-border/80 rounded-3xl p-5 flex items-center justify-between shadow-xl hover:border-aura-gold/50 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl text-aura-gold font-bold">
                        #{cat.displayOrder || cat.id}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-aura-ivory">{cat.name}</h4>
                        <span className="text-xs text-aura-slate font-mono block">{count} Recipe Items</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-2.5 bg-aura-obsidian hover:bg-aura-gold/10 border border-aura-border hover:border-aura-gold/40 text-aura-slate hover:text-aura-gold rounded-xl transition-all cursor-pointer"
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
                    <td className="py-3.5 px-4 text-aura-gold font-bold">#101</td>
                    <td className="py-3.5 px-4 font-semibold text-aura-ivory">TABLE_SESSION_CHECKOUT</td>
                    <td className="py-3.5 px-4 text-aura-slate">admin@aura.com</td>
                    <td className="py-3.5 px-4"><StatusBadge status="SETTLED" /></td>
                    <td className="py-3.5 px-4 text-aura-slate">Just now</td>
                  </tr>
                  <tr className="hover:bg-aura-obsidian/40">
                    <td className="py-3.5 px-4 text-aura-gold font-bold">#102</td>
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
                <ChefHat className="w-6 h-6 text-aura-gold" />
                <h3 className="font-serif text-xl font-bold text-aura-ivory">
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
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
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
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-aura-slate uppercase tracking-wider block">Category</label>
                  <select
                    value={dishCategoryId}
                    onChange={(e) => setDishCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono cursor-pointer"
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
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-aura-slate uppercase tracking-wider block">Image URL</label>
                <input
                  type="text"
                  value={dishImageUrl}
                  onChange={(e) => setDishImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono text-[11px]"
                />
              </div>

              {/* Toggles & Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer">
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

                <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishIsChefSpecial}
                    onChange={(e) => setDishIsChefSpecial(e.target.checked)}
                    className="accent-aura-gold rounded"
                  />
                  <span className="font-bold text-aura-gold">Chef Special</span>
                </label>

                <label className="p-3 bg-aura-obsidian border border-aura-border rounded-2xl flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishIsAvailable}
                    onChange={(e) => setDishIsAvailable(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span className="font-bold text-aura-ivory">In Stock</span>
                </label>
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
                  className="px-6 py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl uppercase tracking-wider shadow-lg shadow-aura-gold/20 cursor-pointer"
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
                <Layers className="w-6 h-6 text-aura-gold" />
                <h3 className="font-serif text-xl font-bold text-aura-ivory">
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
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
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
                  className="w-full px-4 py-3 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory focus:outline-none focus:border-aura-gold font-mono"
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
                  className="px-6 py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-2xl uppercase tracking-wider shadow-lg shadow-aura-gold/20 cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
