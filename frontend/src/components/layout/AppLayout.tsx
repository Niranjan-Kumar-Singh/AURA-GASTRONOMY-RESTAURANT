import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandPalette } from '../navigation/CommandPalette';
import { useAuthStore } from '../../store/use-auth-store';
import {
  ShieldCheck, Award, ChefHat, Layers, Receipt, Utensils, Settings, User, Command,
  Search, Bell, LogOut, Clock, Sparkles, Home
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = (user?.role || 'ADMIN').toUpperCase();
  const userName = user?.name || 'Authorized Staff';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter navigation items dynamically based on staff role
  const getRoleNavLinks = () => {
    const isExecutive = ['ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'OWNER'].includes(userRole);
    const isChef = ['CHEF', 'KITCHEN'].includes(userRole);
    const isWaiter = ['WAITER'].includes(userRole);
    const isCashier = ['CASHIER'].includes(userRole);

    const links = [];

    if (isExecutive) {
      links.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
      links.push({ name: 'Owner CEO', path: '/owner', icon: Award });
    }

    if (isExecutive || isChef) {
      links.push({ name: 'Kitchen KDS', path: '/kitchen', icon: ChefHat });
    }
    if (isExecutive || isWaiter) {
      links.push({ name: 'Waiter Floor Map', path: '/waiter', icon: Layers });
    }
    if (isExecutive || isCashier) {
      links.push({ name: 'Cashier POS', path: '/cashier', icon: Receipt });
    }

    links.push({ name: 'Customer Menu', path: '/table/10/menu', icon: Utensils });

    return links;
  };

  const navLinks = getRoleNavLinks();

  return (
    <div className="h-screen bg-aura-obsidian text-aura-ivory flex flex-col font-sans overflow-hidden">
      {/* Top Header Navigation Bar (Replaces Outer Sidebar for Maximum Screen Width) */}
      <header className="px-6 py-3.5 bg-aura-container/95 backdrop-blur-xl border-b border-aura-border flex items-center justify-between z-40 shadow-xl sticky top-0">
        {/* Left: Brand Logo & Role Nav Chips */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex items-center justify-center shadow-md">
              <Utensils className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h1 className="font-serif text-base font-bold text-white tracking-wide leading-none">AURA</h1>
              <p className="text-[9px] text-[#38BDF8] tracking-widest uppercase font-mono font-bold mt-0.5">{userRole} PORTAL</p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-aura-border/60 hidden md:block" />

          {/* Nav Links in Header Bar */}
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path) && link.path !== '/';
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#0EA5E9] text-[#090A0F] border-[#38BDF8] shadow-md font-black'
                      : 'bg-[#090A0F]/60 text-aura-slate border-aura-border hover:text-white hover:border-[#38BDF8]/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Clock & User Profile Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="px-3 py-1.5 bg-[#090A0F] border border-aura-border hover:border-[#38BDF8] rounded-xl text-xs text-aura-slate flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="bg-aura-container px-1.5 py-0.5 rounded text-[9px] font-mono border border-aura-border text-[#38BDF8]">
              Ctrl+K
            </kbd>
          </button>

          {/* Live Clock */}
          <div className="px-3 py-1.5 bg-[#090A0F] border border-aura-border rounded-xl text-xs font-mono text-[#38BDF8] flex items-center space-x-1.5 hidden sm:flex">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{currentTime}</span>
          </div>

          {/* User Account Badge & Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-aura-border/60">
            <div className="w-8 h-8 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center font-bold text-[#38BDF8] text-xs shadow-md">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 bg-aura-obsidian border border-aura-border hover:border-rose-500/50 rounded-xl text-rose-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace — overflow-hidden, no padding. Each page controls its own scroll & padding. */}
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

      {/* Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </div>
  );
};

export default AppLayout;
