import React from 'react';
import { Utensils, Heart, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="relative mt-12 overflow-hidden bg-[#07080a] text-aura-slate text-xs pt-12 pb-8 px-4 border-t border-aura-border/60">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-aura-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mb-12">
        {/* Col 1: Brand & About (Spans 4 columns) */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-aura-gold/10 border border-aura-gold/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Utensils className="w-5 h-5 text-aura-gold" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wider text-aura-ivory">AURA</span>
          </div>
          <p className="text-xs leading-relaxed text-aura-slate/80 pr-4">
            Where exceptional cuisine meets intelligent dining. Transforming every table visit into an unforgettable, luxury digital gastronomy experience.
          </p>
          <div className="flex items-center space-x-4 pt-2">
            <a href="#" className="p-2 bg-aura-obsidian hover:bg-aura-gold hover:text-black rounded-lg border border-aura-border hover:border-aura-gold transition-all">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-aura-obsidian hover:bg-aura-gold hover:text-black rounded-lg border border-aura-border hover:border-aura-gold transition-all">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-aura-obsidian hover:bg-aura-gold hover:text-black rounded-lg border border-aura-border hover:border-aura-gold transition-all">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Opening Hours (Spans 3 columns) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="font-serif font-bold text-aura-ivory text-sm uppercase tracking-widest">Opening Hours</h4>
          <div className="space-y-3 text-xs text-aura-slate/80">
            <div className="flex flex-col space-y-1">
              <span className="text-aura-ivory">Lunch Service</span>
              <span className="font-mono text-aura-gold">11:00 AM – 3:30 PM</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-aura-ivory">Dinner Service</span>
              <span className="font-mono text-aura-gold">7:00 PM – 11:30 PM</span>
            </div>
            <div className="inline-block mt-2 text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              Open Now
            </div>
          </div>
        </div>

        {/* Col 3: Legal & Quick Links (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-serif font-bold text-aura-ivory text-sm uppercase tracking-widest">Explore</h4>
          <ul className="space-y-2.5 text-xs text-aura-slate/80">
            <li><a href="#" className="hover:text-aura-gold transition-colors">Our Story</a></li>
            <li><a href="#" className="hover:text-aura-gold transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-aura-gold transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-aura-gold transition-colors">FSSAI Compliance</a></li>
          </ul>
        </div>

        {/* Col 4: Newsletter (Spans 3 columns) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="font-serif font-bold text-aura-ivory text-sm uppercase tracking-widest">VIP Newsletter</h4>
          <p className="text-[11px] text-aura-slate/80 leading-relaxed">
            Subscribe to receive exclusive invitations to tasting menus, secret chef specials, and wine pairings.
          </p>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-aura-slate" />
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-aura-obsidian border border-aura-border rounded-xl py-2.5 pl-9 pr-24 text-xs text-aura-ivory focus:outline-none focus:border-aura-gold transition-colors"
            />
            <button className="absolute right-1 top-1 bottom-1 bg-aura-gold hover:bg-aura-gold-hover text-black font-bold px-3 rounded-lg text-[10px] uppercase tracking-wider transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-aura-border/30 flex flex-col sm:flex-row items-center justify-between text-[10px] space-y-3 sm:space-y-0 text-aura-slate/60 relative z-10">
        <p className="uppercase tracking-widest">© 2026 AURA Fine Dining. All rights reserved.</p>
        <p className="flex items-center space-x-1.5 bg-aura-obsidian px-3 py-1.5 rounded-full border border-aura-border/50">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
          <span>in Bengaluru</span>
        </p>
      </div>
    </footer>
  );
};

