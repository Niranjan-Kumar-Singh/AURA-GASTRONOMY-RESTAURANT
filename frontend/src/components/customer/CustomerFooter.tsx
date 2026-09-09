import React from 'react';
import { Utensils, Heart, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="mt-12 bg-white text-slate-600 text-xs pt-10 pb-8 px-4 border-t border-slate-200">
      <div className="max-w-[1560px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
        {/* Col 1: Brand & About */}
        <div className="md:col-span-4 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center">
              <Utensils className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">AURA GASTRONOMY</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 pr-4">
            Where exceptional cuisine meets instant digital dining. Prepared fresh to order and served directly to your table in minutes.
          </p>
          <div className="flex items-center space-x-3 pt-1">
            <a href="#" className="p-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-slate-600 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-slate-600 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-slate-600 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Col 2: Timings */}
        <div className="md:col-span-3 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Service Hours</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800 block">Lunch Service</span>
              <span className="font-mono text-emerald-800">11:00 AM – 3:30 PM</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Dinner Service</span>
              <span className="font-mono text-emerald-800">7:00 PM – 11:30 PM</span>
            </div>
            <div className="inline-block text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Open Live
            </div>
          </div>
        </div>

        {/* Col 3: Quick Links */}
        <div className="md:col-span-2 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Explore</h4>
          <ul className="space-y-1.5 text-xs text-slate-500">
            <li><a href="#" className="hover:text-emerald-700 transition-colors">Our Kitchen Story</a></li>
            <li><a href="#" className="hover:text-emerald-700 transition-colors">Hygiene & Safety</a></li>
            <li><a href="#" className="hover:text-emerald-700 transition-colors">FSSAI Certified</a></li>
            <li><a href="#" className="hover:text-emerald-700 transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="md:col-span-3 space-y-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">VIP Gourmet Club</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Get instant updates on daily chef specials, secret desserts, and member discounts.
          </p>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-20 text-xs text-slate-800 focus:outline-none focus:border-[#0C831F]"
            />
            <button className="absolute right-1 top-1 bottom-1 bg-[#0C831F] hover:bg-[#096918] text-white font-bold px-3 rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 space-y-2 sm:space-y-0">
        <p>© 2026 AURA Gastronomy. All rights reserved.</p>
        <p className="flex items-center space-x-1">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for dining excellence</span>
        </p>
      </div>
    </footer>
  );
};
export default CustomerFooter;
