import React from 'react';
import { Star, Clock, Utensils, Sparkles, MapPin, Tag } from 'lucide-react';

interface CustomerHeroBannerProps {
  tableId?: string;
  zoneName?: string;
}

export const CustomerHeroBanner: React.FC<CustomerHeroBannerProps> = ({
  tableId = '14',
  zoneName = 'VIP Lounge',
}) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 max-w-7xl mx-auto">
      {/* Sleek Compact Mobile Offer Strip (< 768px Viewport) */}
      <div className="block md:hidden bg-gradient-to-r from-[#0EA5E9]/20 via-[#161A28] to-[#0EA5E9]/15 border border-[#38BDF8]/40 rounded-2xl p-3 shadow-[0_4px_20px_rgba(56,189,248,0.15)] my-1.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0 animate-pulse" />
            <span className="text-white text-xs font-medium truncate">
              Special Offer: Get <strong className="text-[#38BDF8] font-bold">₹100 OFF</strong> your order
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px] shrink-0 font-mono shadow-sm">
            <Tag className="w-3 h-3" />
            <span>WELCOME100</span>
          </div>
        </div>
      </div>

      {/* Full Luxury Hero Card (Desktop >= 768px Viewport) */}
      <div className="hidden md:block">
        <div className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row border border-[#38BDF8]/40 shadow-[0_12px_45px_rgba(56,189,248,0.18)] bg-[#090A0F] min-h-[290px]">
          
          {/* Ambient Cyan Radial Glow */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#0EA5E9]/20 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none z-0" />

          {/* Left Side: Content Box */}
          <div className="relative z-10 w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-between order-2 md:order-1 bg-gradient-to-br from-[#090A0F]/95 via-[#10131E]/95 to-[#090A0F]/90">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center space-x-2 bg-[#38BDF8]/10 border border-[#38BDF8]/30 px-3.5 py-1.5 rounded-full shadow-lg">
                <Utensils className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="font-serif font-bold text-xs text-[#38BDF8] tracking-widest uppercase">
                  AURA FINE DINING
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-[10px] font-mono font-bold text-white uppercase">Bengaluru</span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 px-3 py-1 rounded-full text-[#38BDF8] font-bold shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-[#38BDF8] text-[#38BDF8]" />
                  <span>4.9</span>
                </div>

                <div className="bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] font-mono font-extrabold text-[10px] sm:text-xs uppercase px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-md">
                  LUXURY DINING • 5-STAR SELECTION
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-3.5 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#38BDF8]/15 border border-[#38BDF8]/40 rounded-full text-[#38BDF8] text-[11px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
                <span>Table-Side Gastronomy</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide leading-snug text-white">
                Where Exceptional Cuisine Meets{' '}
                <span className="text-[#38BDF8] font-serif font-black inline-block drop-shadow-[0_2px_14px_rgba(56,189,248,0.6)]">
                  Intelligent Dining
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-lg">
                Experience 36-hour slow-cooked dals, Japanese Wagyu, royal saffron tikkas, and artisanal desserts seared over wood fire.
              </p>
            </div>

            {/* Footer Info Rail */}
            <div className="pt-6 mt-4 border-t border-[#38BDF8]/20 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center space-x-5 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-white">11:00 AM – 11:30 PM</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-white">Indiranagar</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-sm">
                <Tag className="w-3.5 h-3.5" />
                <span>Use <strong>WELCOME100</strong> for ₹100 Off</span>
              </div>
            </div>
          </div>

          {/* Right Side: Image Box */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto order-1 md:order-2 overflow-hidden">
            {/* Gradient blend to seamlessly transition image into the left background */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#090A0F] via-[#090A0F]/80 to-transparent z-10 hidden md:block" />
            
            <img
              src="/images/aura_hero_interior.png"
              alt="AURA Fine Dining Atmosphere"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
