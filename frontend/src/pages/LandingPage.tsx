import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, ShieldCheck, ChefHat, Layers, Receipt, Award, 
  ArrowRight, Sparkles, CheckCircle2, Clock, MapPin, Phone, 
  Star, Coffee, Wine, ChevronRight, Quote, QrCode
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center space-y-4 z-50">
        <div className="w-16 h-16 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-[#38BDF8]/10">
          <Utensils className="w-8 h-8 text-[#38BDF8]" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-[#38BDF8] animate-pulse">AURA GASTRONOMY</h1>
        <p className="text-xs text-aura-slate tracking-[0.25em] uppercase font-mono">Mayfair • London</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-sans overflow-x-hidden selection:bg-[#38BDF8] selection:text-[#090A0F]">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-[#090A0F]/85 backdrop-blur-xl border-b border-[#38BDF8]/20 z-50 transition-all duration-300">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex items-center justify-center group-hover:border-[#38BDF8] transition-colors">
            <Utensils className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-widest text-white">AURA</h1>
            <p className="text-[9px] text-[#38BDF8] uppercase tracking-widest font-mono">Mayfair Flagship</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-aura-slate">
          <a href="#experience" className="hover:text-[#38BDF8] transition-colors">The Experience</a>
          <a href="#menu" className="hover:text-[#38BDF8] transition-colors">Culinary Vision</a>
          <a href="#acclaim" className="hover:text-[#38BDF8] transition-colors">Acclaim</a>
          <a href="#visit" className="hover:text-[#38BDF8] transition-colors">Location & Hours</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black text-xs rounded-xl shadow-lg shadow-[#0EA5E9]/20 transition-all flex items-center space-x-2 border border-[#7DD3FC]/50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Staff Portal</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Background Image & Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-aura-obsidian/95 via-aura-obsidian/80 to-aura-obsidian z-0" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 my-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Modern Fine Dining Redefined</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-2xl">
            A Symphony of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#7DD3FC] to-[#38BDF8] drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              Taste & Elegance.
            </span>
          </h1>

          <p className="text-aura-slate text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Step into Mayfair's premier culinary destination where gastronomic mastery converges with table-side QR innovation and instant digital dispatch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#experience"
              className="w-full sm:w-auto px-8 py-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl text-sm transition-transform hover:scale-105 shadow-xl shadow-[#0EA5E9]/20 flex items-center justify-center space-x-2 border border-[#7DD3FC]/50 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Discover The Experience</span>
            </a>
            <a
              href="#visit"
              className="w-full sm:w-auto px-8 py-4 bg-aura-container/80 border border-[#38BDF8]/30 hover:border-[#38BDF8] text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MapPin className="w-5 h-5 text-[#38BDF8]" />
              <span>Location & Hours</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator - Perfectly Centered */}
        <div className="relative z-10 mt-12 flex flex-col items-center justify-center space-y-2 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#38BDF8] font-mono">Scroll to Discover</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#38BDF8] to-transparent animate-pulse" />
        </div>
      </section>

      {/* The Experience Section */}
      <section id="experience" className="py-28 px-6 relative bg-[#090A0F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 text-[#38BDF8] text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-[#38BDF8]" />
              <span>Table-Side Innovation</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
              Crafted For The <br />
              <span className="text-[#38BDF8]">Discerning Palate</span>
            </h2>
            <p className="text-aura-slate leading-relaxed text-base sm:text-lg font-light">
              At AURA, we blend culinary excellence with seamless table ordering. Guests simply scan their unique table QR code to explore our interactive menu, place orders directly to the kitchen, and enjoy uninterrupted conversation.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-[#121520] border border-[#38BDF8]/20 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mb-3">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Michelin Artisans</h4>
                <p className="text-aura-slate text-xs leading-relaxed">Our kitchen brigade crafts seasonal tasting menus sourced from sustainable UK micro-farms.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121520] border border-[#38BDF8]/20 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">Instant QR Order</h4>
                <p className="text-aura-slate text-xs leading-relaxed">Scan table code to order items instantly without waiting for waitstaff attention.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] sm:aspect-square rounded-[2.5rem] overflow-hidden border border-[#38BDF8]/30 relative z-10 shadow-2xl shadow-[#38BDF8]/10">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop" 
                alt="AURA Fine Dining Atmosphere" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#38BDF8]/15 to-transparent rounded-[3rem] -z-10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Culinary Vision Showcase */}
      <section id="menu" className="py-28 px-6 bg-[#0c0d10] border-y border-[#38BDF8]/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 text-[#38BDF8] text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-[#38BDF8]" />
              <span>Gastronomic Portfolio</span>
              <span className="w-8 h-[1px] bg-[#38BDF8]" />
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Signature <span className="text-[#38BDF8]">Creations</span>
            </h2>
            <p className="text-aura-slate text-base sm:text-lg font-light">
              A glimpse into our meticulously engineered menu items, executed with precision and flair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "A5 Japanese Wagyu Ribeye",
                category: "Grill & Roast",
                desc: "Kagoshima Prefecture Wagyu, bone marrow jus, smoked fleur de sel, fermented truffle paste.",
                img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
              },
              {
                title: "Black Truffle Tagliolini",
                desc: "Hand-extruded semolina pasta, 36-month Aged Parmigiano Reggiano, shaved Umbrian black truffles.",
                category: "Pasta & Grains",
                img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop"
              },
              {
                title: "AURA Diamond Smoked Elixir",
                category: "Mixology",
                desc: "18-year Single Malt Scotch, Madagascar maple cedar smoke, electric diamond ice prism.",
                img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop"
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="group rounded-3xl bg-[#121520] border border-[#38BDF8]/20 overflow-hidden shadow-2xl hover:border-[#38BDF8]/60 transition-all duration-500 hover:-translate-y-1.5"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#090A0F]/80 backdrop-blur-md rounded-full border border-[#38BDF8]/30 text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">{item.title}</h3>
                  <p className="text-aura-slate text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <a
              href="#visit"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#0EA5E9] hover:text-[#090A0F] font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <span>Visit Us In Mayfair</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Critical Acclaim & Reviews */}
      <section id="acclaim" className="py-24 px-6 bg-[#090A0F]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Critical <span className="text-[#38BDF8]">Acclaim</span></h2>
            <p className="text-aura-slate text-xs uppercase tracking-widest font-mono">Recognized by World-Renowned Critics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#121520] border border-[#38BDF8]/20 space-y-4 relative shadow-xl">
              <Quote className="w-8 h-8 text-[#38BDF8]/30" />
              <p className="text-aura-slate text-sm italic leading-relaxed">
                "An extraordinary convergence of Mayfair luxury and effortless technology. The Wagyu Ribeye is flawless."
              </p>
              <div className="pt-4 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-serif font-bold text-white text-sm">Michelin Guide Inspector</span>
                <div className="flex text-[#38BDF8]"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#121520] border border-[#38BDF8]/20 space-y-4 relative shadow-xl">
              <Quote className="w-8 h-8 text-[#38BDF8]/30" />
              <p className="text-aura-slate text-sm italic leading-relaxed">
                "AURA sets a new benchmark for UK dining. Table ordering is seamless, and the kitchen execution speed is unheard of."
              </p>
              <div className="pt-4 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-serif font-bold text-white text-sm">The London Gourmet</span>
                <div className="flex text-[#38BDF8]"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#121520] border border-[#38BDF8]/20 space-y-4 relative shadow-xl">
              <Quote className="w-8 h-8 text-[#38BDF8]/30" />
              <p className="text-aura-slate text-sm italic leading-relaxed">
                "The atmosphere is electric yet refined. A masterclass in modern European and Asian fusion cuisine."
              </p>
              <div className="pt-4 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-serif font-bold text-white text-sm">Food & Wine Magazine</span>
                <div className="flex text-[#38BDF8]"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 bg-[#0a0b0d] border-t border-[#38BDF8]/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-aura-border/40">
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-4xl font-bold text-[#38BDF8]">4.9 / 5</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Over 500+ Guest Reviews</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-4xl font-bold text-[#38BDF8]">30</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Table Dining Spaces</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-4xl font-bold text-[#38BDF8]">2</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Michelin Stars Awarded</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-4xl font-bold text-[#38BDF8]">100%</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Digital Kitchen Integration</p>
          </div>
        </div>
      </section>

      {/* Footer / Location */}
      <footer id="visit" className="bg-[#090A0F] border-t border-[#38BDF8]/20 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-lg flex items-center justify-center text-[#38BDF8]">
                <Utensils className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-widest text-white">AURA GASTRONOMY</h1>
            </div>
            <p className="text-aura-slate text-sm max-w-md leading-relaxed font-light">
              Mayfair's flagship luxury dining experience. Powered by intelligent digital order routing, real-time kitchen display integration, and C-Suite operational management.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Flagship Location</h4>
            <ul className="space-y-3 text-xs text-aura-slate">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#38BDF8] mt-0.5 shrink-0" />
                <span>124 Mayfair Boulevard,<br/>London, W1K 2AL, United Kingdom</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>+44 (0) 20 7946 0912</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Service Hours</h4>
            <ul className="space-y-2 text-xs text-aura-slate font-mono">
              <li className="flex justify-between"><span>Mon - Thu</span><span>17:00 - 23:00</span></li>
              <li className="flex justify-between"><span>Fri - Sat</span><span>17:00 - 00:30</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="text-[#38BDF8]">12:00 - 21:30</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-aura-border/40 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-aura-slate/60 font-mono">
          <p>&copy; {new Date().getFullYear()} AURA Gastronomy Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-[#38BDF8] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#38BDF8] transition-colors">Terms of Service</a>
            <a href="/login" className="hover:text-[#38BDF8] transition-colors text-[#38BDF8]/80">Staff Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
