import React from 'react';
import { Star, Clock, Sparkles, MapPin, Tag, Zap } from 'lucide-react';

interface CustomerHeroBannerProps {
  tableId?: string;
  zoneName?: string;
}

export const CustomerHeroBanner: React.FC<CustomerHeroBannerProps> = ({
  tableId = '10',
  zoneName = 'Main Dining',
}) => {
  return (
    <div className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 max-w-[1560px] mx-auto">
      {/* Mobile Offer Strip (< 768px Viewport) */}
      <div className="block md:hidden bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 shadow-sm my-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 min-w-0">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-800 text-xs font-semibold truncate">
              Order to Table: <strong className="text-emerald-700 font-bold">12-15 Mins</strong>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 text-[10px] shrink-0 font-mono shadow-sm">
            <Tag className="w-3 h-3" />
            <span>WELCOME100</span>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Fresh Hero Banner */}
      <div className="hidden md:block">
        <div className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row border border-slate-200/90 shadow-sm bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 min-h-[220px]">
          {/* Left Side: Content */}
          <div className="relative z-10 w-full md:w-3/5 p-6 sm:p-7 flex flex-col justify-between">
            {/* Top Badges */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-1.5 bg-[#0C831F] text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
                <Zap className="w-3.5 h-3.5" />
                <span>12–15 MINS PREP</span>
              </div>

              <div className="flex items-center space-x-1 bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>4.9 (500+ Reviews)</span>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                <span>📍 Table {tableId} • {zoneName}</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Fresh Gastronomy,{' '}
                <span className="text-[#0C831F] underline decoration-emerald-300 decoration-wavy underline-offset-4">
                  Served Fast
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                Explore hand-crafted wood-fired delicacies, artisanal kebabs, and farm-fresh signature dishes prepared live for your table.
              </p>
            </div>

            {/* Bottom Promo Strip */}
            <div className="pt-4 mt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center space-x-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Open: 11:00 AM – 11:30 PM</span>
                </div>
                <div className="flex items-center space-x-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Main Dining Flagship</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-emerald-800 font-black bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300 shadow-sm">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Use code <strong>WELCOME100</strong> for ₹100 Off</span>
              </div>
            </div>
          </div>

          {/* Right Side: Image Box */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden">
            <img
              src="/images/aura_hero_interior.png"
              alt="AURA Dining Experience"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomerHeroBanner;
