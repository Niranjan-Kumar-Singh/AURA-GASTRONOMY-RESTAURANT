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

  const maxHeatmapSales = data?.hourlyHeatmap ? Math.max(...data.hourlyHeatmap.map((b) => b.sales), 1) : 1;

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

        {/* Peak Dining & Hourly Heatmap */}
        <div className="bg-[#0E1422] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Hourly Service Window Heatmap</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live hourly sales distribution</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-6 items-end h-44 border-b border-slate-800 pb-3">
            {data?.hourlyHeatmap && data.hourlyHeatmap.length > 0 ? (
              data.hourlyHeatmap.map((bar, idx) => {
                const heightPct = bar.sales > 0 ? Math.max((bar.sales / maxHeatmapSales) * 100, 12) : 6;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.sales > 0 ? `₹${(bar.sales / 1000).toFixed(1)}k` : '₹0'}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t transition-all duration-500 ${
                        bar.peak
                          ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                          : bar.sales > 0
                          ? 'bg-slate-700 hover:bg-emerald-500'
                          : 'bg-slate-900 border border-slate-800'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 font-mono uppercase">{bar.hour}</span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-12 text-center text-xs text-slate-500 py-8">
                No orders logged for today's service window yet.
              </div>
            )}
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
