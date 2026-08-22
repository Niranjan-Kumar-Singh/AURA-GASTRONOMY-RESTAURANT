import React from 'react';
import { DollarSign, TrendingUp, ShoppingBag, Users, Star, Award, Clock, ArrowUpRight, BarChart3, Download } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastContainer';

export const OwnerDashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const handleExportReport = () => {
    showToast('Executive Business Report PDF generated and downloaded', 'success');
  };

  return (
    <div className="h-full overflow-y-auto p-6">
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-aura-ivory pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-aura-container border border-aura-border/80 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl shadow-inner">
            <TrendingUp className="w-8 h-8 text-aura-gold" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-aura-ivory tracking-wide">
              OWNER EXECUTIVE ANALYTICS
            </h1>
            <p className="text-xs text-aura-slate mt-0.5">AURA Fine Dining • Mayfair Revenue & Financial Intelligence</p>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-aura-gold/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial Report</span>
        </button>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-aura-container border border-aura-border/80 rounded-3xl space-y-2 hover:border-aura-gold/50 transition-all shadow-xl">
          <div className="flex justify-between items-center text-aura-slate text-xs font-mono">
            <span>TODAY'S TOTAL SALES</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-aura-ivory">₹1,48,950</p>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs Yesterday</span>
          </div>
        </div>

        <div className="p-5 bg-aura-container border border-aura-border/80 rounded-3xl space-y-2 hover:border-aura-gold/50 transition-all shadow-xl">
          <div className="flex justify-between items-center text-aura-slate text-xs font-mono">
            <span>TOTAL TABLE ORDERS</span>
            <ShoppingBag className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-aura-ivory">124 Orders</p>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.1% Order Volume</span>
          </div>
        </div>

        <div className="p-5 bg-aura-container border border-aura-border/80 rounded-3xl space-y-2 hover:border-aura-gold/50 transition-all shadow-xl">
          <div className="flex justify-between items-center text-aura-slate text-xs font-mono">
            <span>AVERAGE ORDER VALUE (AOV)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-aura-gold">₹1,201</p>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+15.2% Upsell Target</span>
          </div>
        </div>

        <div className="p-5 bg-aura-container border border-aura-border/80 rounded-3xl space-y-2 hover:border-aura-gold/50 transition-all shadow-xl">
          <div className="flex justify-between items-center text-aura-slate text-xs font-mono">
            <span>TABLE TURNOVER TIME</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-aura-ivory">42 min</p>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8 min Faster Turnover</span>
          </div>
        </div>
      </div>

      {/* AI Happy Hour Surge & Off-Peak Profit Engine Control Card */}
      <div className="p-6 bg-gradient-to-r from-aura-gold/15 via-aura-obsidian to-aura-gold/15 border border-aura-gold/50 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center space-x-2">
                <span>AI Off-Peak Happy Hour Surge Engine</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  AUTOMATED ACTIVE
                </span>
              </h3>
              <p className="text-xs text-aura-slate mt-0.5">
                Automatically triggers 15% bonus discounts on beverages &amp; desserts during slow hours (3:00 PM – 6:00 PM) to boost off-peak revenue by +24%.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => showToast('AI Surge Pricing Engine settings updated successfully!', 'success')}
              className="px-4 py-2 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              Configure AI Rules
            </button>
          </div>
        </div>
      </div>

      {/* Hourly Revenue Heatmap (11 AM to 11 PM) */}
      <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-aura-gold" />
            <span>Hourly Sales &amp; Peak Dining Heatmap</span>
          </h3>
          <span className="text-xs text-aura-slate font-mono">Peak Hours: 1-3 PM &amp; 8-10 PM</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4 items-end h-40">
          {[
            { hour: '11am', sales: 4200, peak: false },
            { hour: '12pm', sales: 9800, peak: false },
            { hour: '1pm', sales: 24500, peak: true },
            { hour: '2pm', sales: 28900, peak: true },
            { hour: '3pm', sales: 8200, peak: false },
            { hour: '4pm', sales: 6400, peak: false },
            { hour: '5pm', sales: 7900, peak: false },
            { hour: '6pm', sales: 11200, peak: false },
            { hour: '7pm', sales: 18500, peak: false },
            { hour: '8pm', sales: 32400, peak: true },
            { hour: '9pm', sales: 36800, peak: true },
            { hour: '10pm', sales: 15400, peak: false },
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[9px] font-mono text-aura-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{(bar.sales / 1000).toFixed(1)}k
              </span>
              <div
                style={{ height: `${(bar.sales / 36800) * 100}%` }}
                className={`w-full rounded-t-lg transition-all ${
                  bar.peak
                    ? 'bg-gradient-to-t from-aura-gold to-amber-300 shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                    : 'bg-aura-obsidian hover:bg-aura-border'
                }`}
              />
              <span className="text-[9px] text-aura-slate font-mono uppercase">{bar.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Breakdown */}
        <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-aura-gold" />
            <span>Revenue per Category Breakdown</span>
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <div className="flex justify-between font-medium text-aura-ivory mb-1.5">
                <span>Chef Specials &amp; Wood-Fired Steaks</span>
                <span className="font-mono text-aura-gold font-bold">₹55,285 (37.8%)</span>
              </div>
              <div className="w-full h-2.5 bg-aura-obsidian rounded-full overflow-hidden">
                <div className="h-full bg-aura-gold rounded-full" style={{ width: '37.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-aura-ivory mb-1.5">
                <span>Tandoor &amp; Charcoal Grills</span>
                <span className="font-mono text-aura-gold font-bold">₹34,110 (22.9%)</span>
              </div>
              <div className="w-full h-2.5 bg-aura-obsidian rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '22.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-aura-ivory mb-1.5">
                <span>Italian &amp; Truffle Handcrafted Pastas</span>
                <span className="font-mono text-aura-gold font-bold">₹29,790 (20.0%)</span>
              </div>
              <div className="w-full h-2.5 bg-aura-obsidian rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '20.0%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-aura-ivory mb-1.5">
                <span>Fine Artisanal Beverages &amp; Cocktails</span>
                <span className="font-mono text-aura-gold font-bold">₹28,765 (19.3%)</span>
              </div>
              <div className="w-full h-2.5 bg-aura-obsidian rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '19.3%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Dishes & High Margin Highlights */}
        <div className="bg-aura-container border border-aura-border/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="font-serif text-lg font-bold text-aura-ivory flex items-center space-x-2">
            <Star className="w-5 h-5 text-aura-gold" />
            <span>Top Performing &amp; High-Margin Dishes</span>
          </h3>

          <div className="space-y-3">
            {[
              { rank: '#1', name: 'Wagyu Ribeye Steak', orders: 42, revenue: '₹58,800', margin: '72% Margin' },
              { rank: '#2', name: 'Black Truffle Tagliolini', orders: 38, revenue: '₹34,200', margin: '78% Margin' },
              { rank: '#3', name: 'Saffron & Gold Elixir', orders: 36, revenue: '₹14,040', margin: '86% High Profit' },
              { rank: '#4', name: 'Royal Zafrani Murgh Tikka', orders: 34, revenue: '₹22,100', margin: '75% Margin' },
            ].map((dish, idx) => (
              <div key={idx} className="p-3.5 bg-aura-obsidian border border-aura-border/40 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 bg-aura-gold/10 border border-aura-gold/30 text-aura-gold font-bold text-xs rounded-xl flex items-center justify-center font-mono">
                    {dish.rank}
                  </span>
                  <div>
                    <p className="font-bold text-aura-ivory">{dish.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono font-bold">{dish.margin} • {dish.orders} Orders</p>
                  </div>
                </div>
                <span className="font-mono text-aura-gold font-bold text-sm">{dish.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
