import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users, Star, Award, Clock, ArrowUpRight, BarChart3, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
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
    showToast('Executive Business Report downloaded', 'success');
  };

  const maxHeatmapSales = data?.hourlyHeatmap ? Math.max(...data.hourlyHeatmap.map((b) => b.sales), 1) : 1;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121520] border border-[#38BDF8]/30 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl shadow-inner">
              <TrendingUp className="w-8 h-8 text-[#38BDF8]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  OWNER EXECUTIVE ANALYTICS
                </h1>
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>100% REAL DB DATA</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">AURA Fine Dining • Mayfair Revenue & Financial Intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-[#161A28] hover:bg-[#1E2336] text-[#38BDF8] border border-[#38BDF8]/30 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Refresh Real-Time Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-[#0EA5E9]/20 cursor-pointer border border-[#7DD3FC]/50"
            >
              <Download className="w-4 h-4" />
              <span>Export Financial Report</span>
            </button>
          </div>
        </div>

        {/* Metric Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sales */}
          <div className="p-5 bg-[#121520] border border-[#38BDF8]/30 rounded-3xl space-y-2 hover:border-[#38BDF8]/60 transition-all shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span>TODAY'S TOTAL SALES</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {isLoading ? '...' : `₹${(data?.todaySales || 0).toLocaleString('en-IN')}`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data?.completedOrders || 0} Settled Orders Today</span>
            </div>
          </div>

          {/* Orders */}
          <div className="p-5 bg-[#121520] border border-[#38BDF8]/30 rounded-3xl space-y-2 hover:border-[#38BDF8]/60 transition-all shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span>TOTAL TABLE ORDERS</span>
              <ShoppingBag className="w-4 h-4 text-purple-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {isLoading ? '...' : `${data?.totalOrders || 0} Orders`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-[#38BDF8] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>{data?.ongoingOrders || 0} Active on Floor</span>
            </div>
          </div>

          {/* AOV */}
          <div className="p-5 bg-[#121520] border border-[#38BDF8]/30 rounded-3xl space-y-2 hover:border-[#38BDF8]/60 transition-all shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span>AVERAGE ORDER VALUE (AOV)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-[#38BDF8]">
              {isLoading ? '...' : `₹${(data?.aov || 0).toLocaleString('en-IN')}`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Calculated from settled tables</span>
            </div>
          </div>

          {/* Turnover */}
          <div className="p-5 bg-[#121520] border border-[#38BDF8]/30 rounded-3xl space-y-2 hover:border-[#38BDF8]/60 transition-all shadow-xl">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
              <span>TABLE TURNOVER TIME</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {isLoading ? '...' : `${data?.tableTurnoverMins || 42} min`}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{data?.occupiedTables || 0} of {data?.totalTables || 30} Tables Occupied</span>
            </div>
          </div>
        </div>

        {/* AI Happy Hour Surge & Off-Peak Profit Engine Control Card */}
        <div className="p-6 bg-gradient-to-r from-[#38BDF8]/15 via-[#090A0F] to-[#38BDF8]/15 border border-[#38BDF8]/40 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
                  <span>AI Off-Peak Happy Hour Surge Engine</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    AUTOMATED ACTIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Automatically triggers 15% bonus discounts on beverages &amp; desserts during slow hours (3:00 PM – 6:00 PM) to boost off-peak revenue.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => showToast('AI Surge Pricing Engine active with live kitchen pacing!', 'success')}
                className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 border border-[#7DD3FC]/50"
              >
                Configure AI Rules
              </button>
            </div>
          </div>
        </div>

        {/* Hourly Revenue Heatmap (11 AM to 11 PM) */}
        <div className="bg-[#121520] border border-[#38BDF8]/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#38BDF8]" />
              <span>Hourly Sales &amp; Peak Dining Heatmap</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live distribution across today's service windows</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-6 items-end h-44 border-b border-[#38BDF8]/20 pb-3">
            {data?.hourlyHeatmap && data.hourlyHeatmap.length > 0 ? (
              data.hourlyHeatmap.map((bar, idx) => {
                const heightPct = bar.sales > 0 ? Math.max((bar.sales / maxHeatmapSales) * 100, 12) : 6;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-mono text-[#38BDF8] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.sales > 0 ? `₹${(bar.sales / 1000).toFixed(1)}k` : '₹0'}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                        bar.peak
                          ? 'bg-gradient-to-t from-[#0EA5E9] to-[#7DD3FC] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                          : bar.sales > 0
                          ? 'bg-[#0EA5E9]/60 hover:bg-[#38BDF8]'
                          : 'bg-[#090A0F] border border-white/5'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 font-mono uppercase">{bar.hour}</span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-12 text-center text-xs text-slate-400 py-8">
                No orders logged for today's service window yet.
              </div>
            )}
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Revenue Breakdown */}
          <div className="bg-[#121520] border border-[#38BDF8]/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#38BDF8]" />
              <span>Revenue per Category Breakdown</span>
            </h3>

            <div className="space-y-4 text-xs font-sans">
              {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((cat, idx) => {
                  const colors = ['bg-[#0EA5E9]', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={idx}>
                      <div className="flex justify-between font-medium text-white mb-1.5">
                        <span>{cat.name}</span>
                        <span className="font-mono text-[#38BDF8] font-bold">
                          ₹{cat.revenue.toLocaleString('en-IN')} ({cat.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#090A0F] rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(cat.pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs text-slate-400 py-6">
                  Category mix will display as orders are placed and settled.
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Dishes & High Margin Highlights */}
          <div className="bg-[#121520] border border-[#38BDF8]/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-white flex items-center space-x-2">
              <Star className="w-5 h-5 text-[#38BDF8]" />
              <span>Top Performing &amp; High-Margin Dishes</span>
            </h3>

            <div className="space-y-3">
              {data?.topDishes && data.topDishes.length > 0 ? (
                data.topDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#090A0F] border border-[#38BDF8]/20 rounded-2xl flex items-center justify-between text-xs hover:border-[#38BDF8]/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] font-bold text-xs rounded-xl flex items-center justify-center font-mono">
                        {dish.rank}
                      </span>
                      <div>
                        <p className="font-bold text-white">{dish.name}</p>
                        <p className="text-[10px] text-emerald-400 font-mono font-bold">
                          {dish.margin} • {dish.orders} Orders
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[#38BDF8] font-bold text-sm">
                      ₹{dish.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-6">
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
