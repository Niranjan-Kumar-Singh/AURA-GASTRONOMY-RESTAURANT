import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Award, Clock, ArrowUpRight, BarChart3, Download, RefreshCw, CheckCircle2, ShieldCheck, Activity, Flame, Layers } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';
import { adminService, ExecutiveAnalyticsData } from '../../services/admin.service';

export const OwnerDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<ExecutiveAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await adminService.getExecutiveAnalytics();
      setData(res);
      if (isManual) {
        showToast('Executive database analytics synchronized', 'success');
      }
    } catch (err: any) {
      console.error('Failed to fetch executive analytics:', err);
      if (isManual) {
        showToast('Failed to load live analytics', 'error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(false);
    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportReport = () => {
    if (!data) return;
    const reportSummary = `AURA GASTRONOMY - EXECUTIVE FINANCIAL AUDIT
Generated: ${new Date().toLocaleString()}
Today's Settled Sales: ₹${data.todaySales.toLocaleString('en-IN')}
Total Orders in System: ${data.totalOrders}
Completed Orders: ${data.completedOrders}
Ongoing Dining Orders: ${data.ongoingOrders}
Average Order Value (AOV): ₹${data.aov.toLocaleString('en-IN')}
Floor Occupancy: ${data.occupiedTables} / ${data.totalTables} Tables
Average Table Turnover: ${data.tableTurnoverMins} minutes

TOP PERFORMING DISHES:
${data.topDishes.map((d) => `${d.rank} ${d.name} - ${d.orders} orders (₹${d.revenue.toLocaleString('en-IN')})`).join('\n')}

CATEGORY REVENUE BREAKDOWN:
${data.categoryBreakdown.map((c) => `${c.name}: ₹${c.revenue.toLocaleString('en-IN')} (${c.pct}%)`).join('\n')}
`;
    const blob = new Blob([reportSummary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA_Executive_Audit_${Date.now()}.txt`;
    a.click();
    showToast('Executive Financial Report downloaded', 'success');
  };

  const [hoveredBar, setHoveredBar] = useState<{ hour: string; sales: number; orders: number; peak: boolean } | null>(null);

  const maxHeatmapSales = data?.hourlyHeatmap ? Math.max(...data.hourlyHeatmap.map((b) => b.sales), 1) : 1;
  const totalHeatmapSales = data?.hourlyHeatmap ? data.hourlyHeatmap.reduce((sum, b) => sum + b.sales, 0) : 0;
  const totalHeatmapOrders = data?.hourlyHeatmap ? data.hourlyHeatmap.reduce((sum, b) => sum + b.orders, 0) : 0;

  return (
    <div className="page-theme-owner h-full overflow-y-auto p-4 sm:p-6 font-sans text-theme-text bg-theme-bg">
      <div className="max-w-7xl mx-auto space-y-5 pb-24">
        {/* Executive Bloomberg Ticker Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-surface border border-theme-border p-5 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-theme-primary-light border border-theme-primary/30 rounded-xl">
              <TrendingUp className="w-7 h-7 text-theme-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-sans">
                  EXECUTIVE FINANCIAL COCKPIT
                </h1>
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-theme-primary bg-theme-primary-light border border-theme-primary/30 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
                  <span>LIVE REVENUE FEED</span>
                </span>
              </div>
              <p className="text-xs text-theme-muted mt-0.5 font-medium">AURA Gastronomy • Real-Time Yield &amp; Operational Economics</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-theme-bg hover:bg-theme-surface-hover text-slate-300 hover:text-white border border-theme-border rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Live Financials"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Financial Audit</span>
            </button>
          </div>
        </div>

        {/* High-Density KPI Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Sales Card */}
          <div className="p-5 bg-theme-surface border border-theme-border hover:border-theme-primary/40 rounded-2xl space-y-2 transition-all shadow-lg">
            <div className="flex justify-between items-center text-theme-muted text-xs font-mono">
              <span className="font-bold tracking-wider">SETTLED REVENUE TODAY</span>
              <DollarSign className="w-4 h-4 text-theme-primary" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-emerald-400">
              {isLoading ? '...' : `₹${(data?.todaySales || 0).toLocaleString('en-IN')}`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data?.completedOrders || 0} Settled Invoices</span>
            </div>
          </div>

          {/* Orders Velocity Card */}
          <div className="p-5 bg-[#0E1422] border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2 transition-all shadow-lg">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span className="font-bold tracking-wider">TOTAL SESSION ORDERS</span>
              <ShoppingBag className="w-4 h-4 text-sky-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : `${data?.totalOrders || 0}`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-sky-400 font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>{data?.ongoingOrders || 0} In Kitchen / Dining</span>
            </div>
          </div>

          {/* Average Order Value (AOV) */}
          <div className="p-5 bg-[#0E1422] border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2 transition-all shadow-lg">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span className="font-bold tracking-wider">AVERAGE BASKET (AOV)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : `₹${(data?.aov || 0).toLocaleString('en-IN')}`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
              <span>Per Table Dining Session</span>
            </div>
          </div>

          {/* Floor Turnover */}
          <div className="p-5 bg-[#0E1422] border border-slate-800 hover:border-slate-700 rounded-2xl space-y-2 transition-all shadow-lg">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span className="font-bold tracking-wider">TABLE TURNOVER RATE</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-black text-white">
              {isLoading ? '...' : `${data?.tableTurnoverMins || 42} min`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{data?.occupiedTables || 0} / {data?.totalTables || 30} Tables Occupied</span>
            </div>
          </div>
        </div>

        {/* Peak Dining & Hourly Heatmap (100% Real Settled Database Orders) */}
        <div className="bg-[#0E1422] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Hourly Service Window Heatmap</span>
                </h3>
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% VERIFIED DB DATA</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Live 24-hour cycle • Aggregated strictly from completed &amp; paid dining orders
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              {hoveredBar ? (
                <div className="bg-slate-900 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-emerald-400 shadow-md animate-fadeIn">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">{hoveredBar.hour}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-white font-black">₹{hoveredBar.sales.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400">({hoveredBar.orders} {hoveredBar.orders === 1 ? 'order' : 'orders'})</span>
                  {hoveredBar.peak && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
                      PEAK
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-slate-300">
                  <span className="text-slate-400">Total Settled Volume:</span>
                  <span className="text-emerald-400 font-bold font-mono">₹{totalHeatmapSales.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400">({totalHeatmapOrders} invoices)</span>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto luxury-scrollbar-x pb-2">
            <div
              className="gap-1 sm:gap-1.5 pt-8 items-end h-48 border-b border-slate-800 pb-3 min-w-[700px]"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${data?.hourlyHeatmap?.length || 24}, minmax(0, 1fr))`
              }}
            >
              {data?.hourlyHeatmap && data.hourlyHeatmap.length > 0 ? (
                data.hourlyHeatmap.map((bar, idx) => {
                  const heightPct = bar.sales > 0 ? Math.max((bar.sales / maxHeatmapSales) * 100, 14) : 6;
                  const isCurrentHover = hoveredBar?.hour === bar.hour;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                      onMouseEnter={() => setHoveredBar(bar)}
                      onMouseLeave={() => setHoveredBar(null)}
                      title={`${bar.hour}: ₹${bar.sales.toLocaleString('en-IN')} (${bar.orders} orders)${bar.peak ? ' [Peak]' : ''}`}
                    >
                      {/* Live Amount Label above bar */}
                      <span
                        className={`text-[9px] font-mono font-bold transition-all duration-200 pointer-events-none whitespace-nowrap ${
                          isCurrentHover
                            ? 'text-white scale-110 opacity-100'
                            : bar.sales > 0
                            ? 'text-emerald-400 opacity-90 group-hover:opacity-100'
                            : 'text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {bar.sales > 0
                          ? bar.sales >= 1000
                            ? `₹${(bar.sales / 1000).toFixed(1)}k`
                            : `₹${bar.sales}`
                          : '₹0'}
                      </span>

                      {/* Bar Column */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[24px] rounded-t transition-all duration-300 ${
                          bar.peak
                            ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)] group-hover:bg-emerald-300'
                            : bar.sales > 0
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-900 border border-slate-800/80 hover:bg-slate-800'
                        } ${isCurrentHover ? 'ring-2 ring-white/50' : ''}`}
                      />

                      {/* Hour Label */}
                      <span
                        className={`text-[9px] font-mono transition-colors duration-200 ${
                          isCurrentHover
                            ? 'text-emerald-400 font-bold'
                            : bar.sales > 0
                            ? 'text-slate-300 font-medium'
                            : 'text-slate-500'
                        }`}
                      >
                        {bar.hour}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-xs text-slate-500 py-8">
                  No orders logged for today's service window yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Category Revenue Breakdown */}
          <div className="bg-[#0E1422] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Category Revenue Mix</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((cat, idx) => {
                  const colors = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-purple-500'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{cat.name}</span>
                        <span className="font-mono text-white font-bold">
                          ₹{cat.revenue.toLocaleString('en-IN')} ({cat.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(cat.pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-slate-500 py-6">
                  Category mix will appear as orders are logged.
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Dishes Leaderboard */}
          <div className="bg-[#0E1422] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Top Yield Dishes Leaderboard</span>
            </h3>

            <div className="space-y-2.5">
              {data?.topDishes && data.topDishes.length > 0 ? (
                data.topDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#080B11] border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-slate-800 text-slate-300 font-black text-xs rounded-lg flex items-center justify-center font-mono">
                        {dish.rank}
                      </span>
                      <div>
                        <p className="font-bold text-white">{dish.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono">
                          {dish.orders} Orders Placed
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-white font-bold text-sm">
                      ₹{dish.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-500 py-6">
                  Top performing dishes will appear once orders are recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OwnerDashboardPage;
