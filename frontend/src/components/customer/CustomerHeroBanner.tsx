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
    <div className="px-4 pt-3 sm:pt-4 max-w-7xl mx-auto">
      {/* Sleek Mobile Welcome Strip (Compact < 768px Viewport) */}
      <div className="block md:hidden bg-gradient-to-r from-aura-container via-aura-obsidian to-aura-container border border-aura-gold/30 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-aura-gold/15 border border-aura-gold/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-aura-gold" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xs font-bold text-aura-ivory truncate">
                AURA Table {tableId}
              </h2>
              <p className="text-[10px] text-aura-gold font-mono font-bold truncate">
                {zoneName} • Indiranagar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] text-amber-400 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.9</span>
            </div>

            <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[10px]">
              <Tag className="w-3 h-3" />
              <span>WELCOME100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Luxury Hero Card (Desktop >= 768px Viewport) */}
      <div className="hidden md:block">
        <div className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row border border-aura-gold/40 shadow-2xl bg-aura-obsidian min-h-[280px]">
          
          {/* Left Side: Content Box */}
          <div className="relative z-10 w-full md:w-3/5 p-6 sm:p-8 flex flex-col justify-between order-2 md:order-1 bg-gradient-to-br from-aura-obsidian via-aura-velvet to-aura-obsidian/95">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center space-x-2 bg-aura-gold/10 border border-aura-gold/30 px-3 py-1.5 rounded-full shadow-lg">
                <Utensils className="w-3.5 h-3.5 text-aura-gold" />
                <span className="font-serif font-bold text-xs text-aura-gold tracking-widest uppercase">
                  AURA FINE DINING
                </span>
                <span className="text-xs text-aura-slate">•</span>
                <span className="text-[10px] font-mono font-bold text-aura-ivory uppercase">Bengaluru</span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                </div>

                <div className="bg-aura-gold text-aura-obsidian font-mono font-extrabold text-[10px] sm:text-xs uppercase px-3.5 py-1.5 rounded-full shadow-lg">
                  Table {tableId} • {zoneName}
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 text-aura-gold text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Table-Side Gastronomy</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-aura-ivory tracking-wide leading-tight">
                Where Exceptional Cuisine Meets Intelligent Dining
              </h1>

              <p className="text-xs sm:text-sm text-aura-slate font-medium leading-relaxed max-w-md">
                Experience 36-hour slow-cooked dabs, Japanese Wagyu, royal saffron tikkas, and gold-leaf artisanal desserts seared over wood fire.
              </p>
            </div>

            {/* Footer Info Rail */}
            <div className="pt-6 mt-4 border-t border-aura-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-aura-slate">
              <div className="flex items-center space-x-4 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-aura-gold" />
                  <span>11:00 AM – 11:30 PM</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-aura-gold" />
                  <span>Indiranagar</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                <Tag className="w-3.5 h-3.5" />
                <span>Use <strong>WELCOME100</strong> for ₹100 Off</span>
              </div>
            </div>
          </div>

          {/* Right Side: Image Box */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto order-1 md:order-2 overflow-hidden">
            {/* Gradient blend to seamlessly transition image into the left background */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-aura-obsidian via-aura-obsidian/80 to-transparent z-10 hidden md:block" />
            
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
