import React, { useState } from 'react';
import { Star, Tag, Zap, Check, Sparkles, MapPin, Award, Clock } from 'lucide-react';

interface CustomerHeroBannerProps {
  tableId?: string;
  zoneName?: string;
}

export const CustomerHeroBanner: React.FC<CustomerHeroBannerProps> = ({
  tableId = '10',
  zoneName = 'Main Dining',
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    // Hidden on mobile screens per user specification; authoritative luxury hero for tablet and desktop
    <div className="hidden md:block px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 max-w-[1560px] mx-auto">
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/70 p-5 lg:p-7 flex items-center justify-between gap-6 lg:gap-10 min-h-[180px]">
        {/* Left Gourmet Branding & Details */}
        <div className="space-y-3 min-w-0 flex-1">
          {/* Status Badges Row */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5">
            <div className="flex items-center space-x-1.5 bg-[#0C831F] text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs shrink-0">
              <Zap className="w-3.5 h-3.5" />
              <span>12–15m PREP GUARANTEE</span>
            </div>

            <div className="flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>4.9★</span>
              <span className="text-amber-800 font-semibold">(850+ Verified Reviews)</span>
            </div>

            <div className="flex items-center space-x-1 bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Michelin Inspired</span>
            </div>
          </div>

          {/* Restaurant Master Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-2xl lg:text-3xl text-slate-950 tracking-tight uppercase">
                AURA GASTRONOMY
              </span>
              <span className="text-xs font-mono font-black tracking-widest text-[#0C831F] bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase border border-emerald-300">
                Botanical Bar
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed max-w-2xl mt-1">
              Artisanal farm-to-table cuisine, wood-fired gastronomy, and handcrafted botanical mocktails prepared live for your table.
            </p>
          </div>

          {/* Address & Table Location */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>42 Royal Palms Avenue, Sector 5, Gourmet District</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-900 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
              Table {tableId} ({zoneName})
            </span>
          </div>

          {/* Active Dining Offers & Coupon Strip */}
          <div className="pt-1 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Active Offers:
            </span>

            {/* Offer 1 */}
            <button
              onClick={() => handleCopyCode('WELCOME100')}
              className="inline-flex items-center space-x-1.5 text-emerald-900 font-black bg-emerald-100/90 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-mono shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Tap to copy WELCOME100"
            >
              {copiedCode === 'WELCOME100' ? (
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

            {/* Offer 2 */}
            <button
              onClick={() => handleCopyCode('AURA200')}
              className="inline-flex items-center space-x-1.5 text-amber-900 font-black bg-amber-100/90 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-mono shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Tap to copy AURA200"
            >
              {copiedCode === 'AURA200' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-700" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>AURA200 (-₹200 on &gt;₹1000)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Architectural Dining Ambience Window */}
        <div className="w-80 lg:w-96 h-44 lg:h-48 rounded-2xl overflow-hidden border border-slate-200/90 shadow-md shrink-0 relative group">
          <img
            src="/images/aura_hero_interior.png"
            alt="AURA Gastronomy Dining Ambience"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Culinary Theatre</span>
            </div>
            <span className="text-[10px] text-white/90 font-mono font-bold bg-emerald-600/80 px-2 py-0.5 rounded-full border border-emerald-400/40">
              Open Till 11:30 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHeroBanner;
