import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/ui/cards/StatCard';
import { DataToolbar } from '../../components/ui/data-display/DataToolbar';
import { StatusBadge } from '../../components/ui/data-display/StatusBadge';
import { RevenueAreaChart, PeakHoursBarChart, CategoryDonutChart, OccupancyGauge } from '../../components/analytics/ChartComponents';
import { useDemoSimulation } from '../../hooks/useDemoSimulation';
import { adminService, AdminMetrics } from '../../services/admin.service';
import {
  DollarSign, ShoppingBag, LayoutGrid, ChefHat, TrendingUp, RefreshCw, Layers, ShieldCheck,
  Calendar, Users, Play, Pause, AlertTriangle, Sparkles, Clock, Heart, Award, Utensils, Receipt, CheckCircle2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isSimulating, toggleSimulation, latestEvent } = useDemoSimulation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AUDIT_LOGS'>('OVERVIEW');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

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
    const interval = setInterval(fetchMetrics, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

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
    <div className="h-full overflow-y-auto p-6">
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-aura-ivory pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-aura-container border border-aura-border/80 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl shadow-inner">
            <TrendingUp className="w-8 h-8 text-aura-gold" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-aura-ivory">
              ADMIN MISSION CONTROL
            </h1>
            <p className="text-xs text-aura-slate mt-0.5">Live Operational Analytics & Enterprise Floor Audit</p>
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

      {/* Live Simulation Event Stream Ticker */}
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
      <div className="flex items-center space-x-3 text-xs border-b border-aura-border/60 pb-3">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border ${
            activeTab === 'OVERVIEW'
              ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
              : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
          }`}
        >
          Operational Overview
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-lg'
              : 'bg-aura-obsidian text-aura-slate border-aura-border hover:border-aura-gold/50'
          }`}
        >
          Security Audit Stream
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* 12 Operational KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Revenue Today" value={`₹${metrics?.revenue.toLocaleString('en-IN') || '0'}`} subtitle="Calculated from settled bills" trend="Live Data" icon={DollarSign} iconColor="text-emerald-400" />
            <StatCard title="Ongoing Orders" value={metrics?.ongoingOrders || 0} subtitle="Active dining tickets" trend="Live Data" icon={ShoppingBag} iconColor="text-aura-gold" />
            <StatCard title="Completed Orders" value={metrics?.completedOrders || 0} subtitle="Successfully served" icon={CheckCircle2} iconColor="text-blue-400" />
            <StatCard title="Total Menu Dishes" value={metrics?.dishes || 0} subtitle="Active catalog items" icon={ChefHat} iconColor="text-amber-400" />

            <StatCard title="Active Reservations" value="31 Bookings" subtitle="4 VIP party bookings" icon={Calendar} iconColor="text-purple-400" />
            <StatCard title="Est. Gross Profit" value={`₹${metrics?.profit.toLocaleString('en-IN') || '0'}`} subtitle="Based on 35% margin" icon={TrendingUp} iconColor="text-rose-400" />
            <StatCard title="Kitchen Efficiency" value="98.2%" subtitle="Recipe waste score" icon={Utensils} iconColor="text-emerald-400" />
            <StatCard title="Refund Rate" value="0.1%" subtitle="₹0 refunded today" icon={ShieldCheck} iconColor="text-blue-400" />

            <StatCard title="Registered Guests" value={metrics?.users || 0} subtitle="Customer accounts" icon={Users} iconColor="text-aura-gold" />
            <StatCard title="Total Staff On Duty" value={metrics?.staff || 0} subtitle="Admins, Waiters, Chefs" icon={Users} iconColor="text-rose-400" />
            <StatCard title="Average Table Bill" value="₹1,850" subtitle="Dinner service average" icon={Receipt} iconColor="text-emerald-400" />
            <StatCard title="Loyalty Coupons" value="18 Used" subtitle="AURA20 promo active" icon={Sparkles} iconColor="text-purple-400" />
          </div>

          {/* Visual Analytics Suite Grid */}
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

          {/* Operational Data Toolbar & Table */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-aura-ivory">Management Control Toolbar</h3>
            <DataToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={['Main Dining', 'VIP Lounge', 'Terrace Bar', 'Family Suite']}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onExportCSV={handleExportCSV}
              placeholder="Search staff, tables, or orders..."
            />
          </div>
        </div>
      )}

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
    </div>
  );
};
