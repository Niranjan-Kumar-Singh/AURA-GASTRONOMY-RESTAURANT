import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils, ShieldCheck, ArrowRight, Sparkles, Clock, MapPin, Phone,
  Star, Wine, QrCode, ChefHat, CheckCircle2, ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between bg-[#07090E]/90 backdrop-blur-xl border-b border-slate-800/80 z-50 transition-all duration-300">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">
            <Utensils className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-widest text-white">AURA</h1>
            <p className="text-[9px] text-emerald-400 uppercase tracking-[0.25em] font-mono font-bold">Gastronomy &amp; Lounge</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <a href="#experience" className="hover:text-emerald-400 transition-colors">Culinary Vision</a>
          <a href="#specialties" className="hover:text-emerald-400 transition-colors">Signature Offerings</a>
          <a href="#visit" className="hover:text-white transition-colors">Hours &amp; Location</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/menu')}
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Digital Menu</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Staff Terminal</span>
            <ArrowRight className="w-3 h-3 hidden sm:inline" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background Visual Backdrop */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1920&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/95 via-[#07090E]/85 to-[#07090E] z-0" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 my-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fine Dining • Botanical Craft • Table-side QR</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] text-white drop-shadow-2xl">
            Haute Cuisine Meets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300">
              Modern Gastronomy.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Welcome to AURA Gastronomy. Immerse in artisanal culinary craft, exquisite wine pairings, and frictionless table-side QR ordering delivered straight to our culinary pass.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-black rounded-2xl text-sm transition-transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 cursor-pointer shadow-emerald-950/40"
            >
              <Utensils className="w-5 h-5" />
              <span>Explore Menu &amp; Order</span>
            </button>
            <a
              href="#specialties"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer backdrop-blur-sm"
            >
              <ChefHat className="w-5 h-5 text-emerald-400" />
              <span>Chef's Specialties</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 mt-8 flex flex-col items-center justify-center space-y-2 opacity-70 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-mono">Discover Experience</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-emerald-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Culinary Vision Section */}
      <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 relative bg-[#07090E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-emerald-400" />
              <span>The Philosophy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Culinary Artistry <br />
              <span className="text-emerald-400">&amp; Modern Precision</span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base font-light">
              At AURA Gastronomy, every recipe is orchestrated with seasonal botanicals, premium heritage spices, and modern culinary precision. Guests browse our live digital catalog, customize dietary preferences, and signal floor staff with a single touch.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Artisanal Master Craft</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Carefully sourced ingredients prepared fresh to order by our kitchen station brigade.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Frictionless Table QR</h4>
                <p className="text-slate-400 text-xs leading-relaxed">No app installations or downloads. Simply scan your table stand and enjoy immediate dining.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] sm:aspect-square rounded-[2rem] overflow-hidden border border-slate-800 relative z-10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1200&auto=format&fit=crop"
                alt="AURA Gastronomy Ambiance"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[2.5rem] -z-10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Signature Specialties */}
      <section id="specialties" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#090D15] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-emerald-400" />
              <span>Chef's Repertoire</span>
              <span className="w-8 h-[1px] bg-emerald-400" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Signature <span className="text-emerald-400">Creations</span>
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Crafted with culinary technique and served at the peak of flavor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Truffle Infused Risotto",
                category: "Artisan Mains",
                desc: "Arborio rice slowly simmered with forest porcini mushrooms, black summer truffle emulsion, and aged Parmigiano.",
                img: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Slow Braised Lamb Shank",
                category: "Chef Specials",
                desc: "Rosemary and saffron braised lamb shank accompanied by parsnip silk puree and roasted reduction.",
                img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Pistachio Matcha Fondant",
                category: "Dessert & Patisserie",
                desc: "Molten ceremonial Uji matcha cake with roasted Iranian pistachios and Madagascar vanilla bean glaze.",
                img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl bg-[#0D121F] border border-slate-800 overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[#07090E]/85 backdrop-blur-md rounded-full border border-slate-700 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-[#059669] hover:text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <span>Explore Complete Digital Menu</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Operational Highlights */}
      <section className="py-12 px-4 sm:px-6 bg-[#07090E] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-emerald-400">30</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Dining Tables</p>
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-emerald-400">&lt; 15m</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Kitchen Prep Target</p>
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-emerald-400">100%</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Live KDS Stream</p>
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-emerald-400">GST Ready</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Instant Thermal Billing</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="visit" className="bg-[#05070B] border-t border-slate-800/80 pt-12 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400">
                <Utensils className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-xl font-bold tracking-widest text-white">AURA GASTRONOMY</h1>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed font-light">
              Luxury dining, botanical pairings, and real-time floor operations management.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Location &amp; Inquiries</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Mayfair Luxury Dining Enclave</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Dining Hours</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex justify-between"><span>Mon - Sun</span><span>12:00 PM - 11:30 PM</span></li>
              <li className="flex justify-between"><span>Kitchen Pass</span><span className="text-emerald-400">Open Daily</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 text-center flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <p>&copy; {new Date().getFullYear()} AURA Gastronomy. All rights reserved.</p>
          <div className="flex items-center flex-wrap justify-center gap-4">
            <a href="/menu" className="hover:text-emerald-400 transition-colors">Digital Menu</a>
            <a href="/login" className="hover:text-emerald-400 transition-colors text-emerald-400/90 font-bold">Staff Operations Terminal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
