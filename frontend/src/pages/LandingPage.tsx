import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Utensils, ShieldCheck, Coffee, Layers, Receipt, Award, 
  ArrowRight, Sparkles, CheckCircle2, Clock, MapPin, Phone, 
  Star, Wine, ChevronRight, Quote, QrCode, Heart, Flame
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center space-y-4 z-50">
        <div className="w-16 h-16 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-[#F59E0B]/10">
          <Coffee className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-[#F59E0B] animate-pulse">SILIGURI'S CHAI ADDAA</h1>
        <p className="text-xs text-aura-slate tracking-[0.25em] uppercase font-mono">Good Food • Better Chai • Happier People</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-white font-sans overflow-x-hidden selection:bg-[#F59E0B] selection:text-[#090A0F]">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center justify-between bg-[#090A0F]/85 backdrop-blur-xl border-b border-[#F59E0B]/20 z-50 transition-all duration-300">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl flex items-center justify-center group-hover:border-[#F59E0B] transition-colors">
            <Coffee className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wider text-white">Siliguri's Chai Addaa</h1>
            <p className="text-[9px] text-[#F59E0B] uppercase tracking-widest font-mono">Est. 2021 • Siliguri</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-aura-slate">
          <a href="#experience" className="hover:text-[#F59E0B] transition-colors">The Experience</a>
          <a href="#menu" className="hover:text-[#F59E0B] transition-colors">Specialties</a>
          <a href="#acclaim" className="hover:text-[#F59E0B] transition-colors">Customer Love</a>
          <a href="#visit" className="hover:text-white transition-colors">Location &amp; Hours</a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/menu')}
            className="px-4 py-2 bg-[#0C831F] hover:bg-[#096918] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Explore Menu</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline">Staff Terminal</span>
            <ArrowRight className="w-3 h-3 hidden sm:inline" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background Image & Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1920&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'scroll'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/95 via-[#07090E]/85 to-[#07090E] z-0" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 my-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span>Chai • Food • People • Stories</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15] text-white drop-shadow-2xl">
            Good Food. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-amber-200 to-[#F59E0B]">
              Better Chai. Happier People.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Welcome to Siliguri's Chai Addaa — where steaming artisanal teas, popping boba creations, Japanese matcha, cheesy burgers, and wok-tossed chowmein meet effortless table-side QR ordering.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto px-8 py-4 bg-[#0C831F] hover:bg-[#096918] text-white font-black rounded-2xl text-sm transition-transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 cursor-pointer shadow-emerald-950/40"
            >
              <Utensils className="w-5 h-5" />
              <span>Explore Table Menu &amp; Order</span>
            </button>
            <a
              href="#visit"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer backdrop-blur-sm"
            >
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>Location &amp; Hours</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 mt-8 flex flex-col items-center justify-center space-y-2 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#F59E0B] font-mono">Scroll to Discover</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#F59E0B] to-transparent animate-pulse" />
        </div>
      </section>

      {/* The Experience Section */}
      <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 relative bg-[#090A0F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-[#F59E0B] text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-[#F59E0B]" />
              <span>A Little Place, A Bigger Feeling</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              More Than Just <br />
              <span className="text-[#F59E0B]">A Café Experience</span>
            </h2>
            <p className="text-aura-slate leading-relaxed text-sm sm:text-base font-light">
              At Siliguri's Chai Addaa, every cup is brewed with love and every dish is cooked to crisp perfection. Scan the QR code placed at your table to browse all 93 handcrafted specialties, customize your drink, and send your order straight to the kitchen.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#121520] border border-[#F59E0B]/20 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-2">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Authentic Kadak Chai</h4>
                <p className="text-aura-slate text-xs leading-relaxed">Hand-crushed whole spices, premium Darjeeling leaves, and rich creamy whole milk brewed to golden warmth.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#121520] border border-emerald-500/20 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Instant Table QR Ordering</h4>
                <p className="text-aura-slate text-xs leading-relaxed">No app downloads or signups. Point your camera at your table stand and start ordering right away.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] sm:aspect-square rounded-[2rem] overflow-hidden border border-[#F59E0B]/30 relative z-10 shadow-2xl shadow-[#F59E0B]/10">
              <img 
                src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200&auto=format&fit=crop" 
                alt="Siliguri Chai Addaa Ambiance" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#F59E0B]/15 to-transparent rounded-[2.5rem] -z-10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Culinary Vision Showcase */}
      <section id="menu" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0c0d10] border-y border-[#F59E0B]/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 text-[#F59E0B] text-xs uppercase tracking-widest font-mono">
              <span className="w-8 h-[1px] bg-[#F59E0B]" />
              <span>Café Menu Highlights</span>
              <span className="w-8 h-[1px] bg-[#F59E0B]" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Signature <span className="text-[#F59E0B]">Favorites</span>
            </h2>
            <p className="text-aura-slate text-sm font-light">
              Explore 93 freshly crafted items across 15 curated categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Signature Masala Chai",
                category: "Chai & Teas",
                desc: "Hand-crushed elaichi, ginger, cloves, and premium Assam leaves steeped in creamy milk. The ultimate comfort.",
                img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Nutty Taro Boba Tea",
                category: "Boba Series",
                desc: "Creamy nutty taro milk tea topped with bursting lychee popping boba pearls. Served chilled.",
                img: "https://images.unsplash.com/photo-1558857563-b37cfb4226f8?auto=format&fit=crop&w=800&q=80"
              },
              {
                title: "Strawberry Matcha Latte",
                category: "Matcha Series",
                desc: "Tri-layered crushed fresh strawberry puree, velvety whole milk, and stone-ground Japanese Uji matcha.",
                img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80"
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="group rounded-2xl bg-[#121520] border border-[#F59E0B]/20 overflow-hidden shadow-xl hover:border-[#F59E0B]/60 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[#090A0F]/80 backdrop-blur-md rounded-full border border-[#F59E0B]/30 text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#F59E0B] transition-colors">{item.title}</h3>
                  <p className="text-aura-slate text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => navigate('/menu')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-[#090A0F] font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <span>View Full 93-Item Menu</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Customer Love & Reviews */}
      <section id="acclaim" className="py-16 sm:py-20 px-4 sm:px-6 bg-[#090A0F]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold text-white">Guest <span className="text-[#F59E0B]">Stories</span></h2>
            <p className="text-aura-slate text-xs uppercase tracking-widest font-mono">Good Chai • Good Mood • Great Memories</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121520] border border-[#F59E0B]/20 space-y-3 relative shadow-lg">
              <Quote className="w-7 h-7 text-[#F59E0B]/30" />
              <p className="text-aura-slate text-xs italic leading-relaxed">
                "The Masala Tea and Tandoori Chicken Sandwich are out of this world. Best place in Siliguri to hang out with friends!"
              </p>
              <div className="pt-3 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-bold text-white text-xs">Rohit &amp; Friends</span>
                <div className="flex text-[#F59E0B]"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121520] border border-[#F59E0B]/20 space-y-3 relative shadow-lg">
              <Quote className="w-7 h-7 text-[#F59E0B]/30" />
              <p className="text-aura-slate text-xs italic leading-relaxed">
                "Super smooth QR table ordering. We scanned the stand card, ordered Matcha Lattes and Boba Teas, and they arrived in minutes!"
              </p>
              <div className="pt-3 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-bold text-white text-xs">Pooja Sharma</span>
                <div className="flex text-[#F59E0B]"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121520] border border-[#F59E0B]/20 space-y-3 relative shadow-lg">
              <Quote className="w-7 h-7 text-[#F59E0B]/30" />
              <p className="text-aura-slate text-xs italic leading-relaxed">
                "Their Arrabbiata Pasta and Chicken Chilly are pure perfection. Cozy ambiance with great vibes and fast Wi-Fi."
              </p>
              <div className="pt-3 border-t border-aura-border/40 flex items-center justify-between">
                <span className="font-bold text-white text-xs">Ankit Roy</span>
                <div className="flex text-[#F59E0B]"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 bg-[#0a0b0d] border-t border-[#F59E0B]/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-[#F59E0B]">4.9 / 5</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">1,200+ Happy Guests</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-[#F59E0B]">93</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Handcrafted Dishes</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-[#F59E0B]">15</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Artisan Categories</p>
          </div>
          <div className="text-center space-y-1 px-4">
            <h3 className="font-serif text-3xl font-bold text-[#F59E0B]">100%</h3>
            <p className="text-[10px] text-aura-slate uppercase tracking-widest font-mono">Contactless QR Ordering</p>
          </div>
        </div>
      </section>

      {/* Footer / Location */}
      <footer id="visit" className="bg-[#090A0F] border-t border-[#F59E0B]/20 pt-12 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg flex items-center justify-center text-[#F59E0B]">
                <Coffee className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-xl font-bold tracking-wider text-white">Siliguri's Chai Addaa</h1>
            </div>
            <p className="text-aura-slate text-xs max-w-md leading-relaxed font-light">
              Good food, better chai, and happier people. Handcrafted teas, popping boba, frappes, hot snacks, and contactless QR table-ordering in Siliguri.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Location</h4>
            <ul className="space-y-2 text-xs text-aura-slate">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
                <span>Siliguri, West Bengal, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-widest text-xs font-mono">Café Hours</h4>
            <ul className="space-y-2 text-xs text-aura-slate font-mono">
              <li className="flex justify-between"><span>Mon - Sun</span><span>10:00 AM - 11:00 PM</span></li>
              <li className="flex justify-between"><span>Dine-In &amp; QR</span><span className="text-[#F59E0B]">Live All Day</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-aura-border/40 text-center flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-aura-slate/60 font-mono">
          <p>&copy; {new Date().getFullYear()} Siliguri's Chai Addaa. All rights reserved.</p>
          <div className="flex items-center flex-wrap justify-center gap-4">
            <a href="/menu" className="hover:text-[#F59E0B] transition-colors">Digital Menu</a>
            <a href="/login" className="hover:text-[#F59E0B] transition-colors text-[#F59E0B]/80">Staff Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
