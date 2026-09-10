import React, { useState } from 'react';
import { Star, Clock, Tag, Zap, Check, Sparkles } from 'lucide-react';

interface CustomerHeroBannerProps {
  tableId?: string;
  zoneName?: string;
}

export const CustomerHeroBanner: React.FC<CustomerHeroBannerProps> = ({
  tableId = '10',
  zoneName = 'Main Dining',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('WELCOME100');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 max-w-[1560px] mx-auto">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-300 shadow-sm bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/70 p-3.5 sm:p-5 md:p-6 flex items-center justify-between gap-4 md:gap-8 min-h-[110px] md:min-h-[160px]">
        {/* Left Content: Badges, Typography & Coupon */}
        <div className="space-y-1.5 sm:space-y-2.5 min-w-0 flex-1">
          {/* Micro Badges Row */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-wrap gap-y-1">
            <div className="flex items-center space-x-1 bg-[#0C831F] text-white px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shadow-sm shrink-0">
              <Zap className="w-3 h-3" />
              <span>12–15m PREP</span>
            </div>

            <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-sm shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>4.9</span>
              <span className="hidden sm:inline">(500+ Reviews)</span>
            </div>

            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 shrink-0">
              📍 Table {tableId} • {zoneName}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate flex items-center gap-1.5">
            <span>Artisanal Gastronomy,</span>
            <span className="text-[#0C831F] underline decoration-emerald-300 underline-offset-4">
              Fresh to Table
            </span>
          </h1>

          {/* Subtitle - expansive on tablet & desktop */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl hidden sm:block">
            Hand-crafted wood-fired specialties, artisanal kebabs &amp; farm-fresh signature dishes prepared live for your table.
          </p>

          {/* Mobile brief subtitle */}
          <p className="text-[11px] text-slate-600 truncate sm:hidden font-medium">
            Wood-fired specialties &amp; live dishes crafted fresh for Table {tableId}.
          </p>

          {/* Promo Coupon Strip */}
          <div className="pt-0.5 sm:pt-1 flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 text-emerald-800 font-black bg-emerald-100 hover:bg-emerald-200 px-3 py-1 sm:py-1.5 rounded-xl border border-emerald-300 text-[10px] sm:text-xs font-mono shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Tap to copy promo code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0C831F]" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WELCOME100 (-₹100)</span>
                </>
              )}
            </button>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
              on orders &gt; ₹500
            </span>
          </div>
        </div>

        {/* Right Content: Wide Landscape Dining Showcase (Desktop & Laptop View) */}
        <div className="hidden md:block w-72 lg:w-96 h-36 lg:h-40 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md shrink-0 relative group">
          <img
            src="/images/aura_hero_interior.png"
            alt="AURA Gastronomy Dining Ambience"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold border border-white/20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Live Kitchen &amp; Garden Dining</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerHeroBanner;

