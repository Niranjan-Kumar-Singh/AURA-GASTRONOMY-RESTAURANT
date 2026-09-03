import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/use-auth-store';
import { ShieldCheck, Utensils, Eye, EyeOff, Lock, User as UserIcon, ArrowRight, ArrowLeft, ChefHat, UserCheck, CreditCard, LayoutDashboard, Award } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('chef@aura.com');
  const [password, setPassword] = useState('chef123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLoginSubmit = async (loginId: string, loginPass: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login({ identifier: loginId, password: loginPass });
      const user = data.user;
      const token = data.accessToken || data.token;

      setAuth(user, token, '');

      // Dynamic Role-Based Redirection
      const userRole = (user.role || '').toUpperCase();
      switch (userRole) {
        case 'CHEF':
        case 'KITCHEN':
          navigate('/kitchen');
          break;
        case 'WAITER':
          navigate('/waiter');
          break;
        case 'CASHIER':
          navigate('/cashier');
          break;
        case 'RESTAURANT_OWNER':
        case 'OWNER':
          navigate('/owner');
          break;
        case 'ADMIN':
        case 'MANAGER':
        default:
          navigate('/admin');
          break;
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your staff email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your staff ID / email and password');
      return;
    }
    handleLoginSubmit(identifier, password);
  };

  const quickRoles = [
    { role: 'CHEF', title: 'Head Chef KDS', email: 'chef@aura.com', pass: 'chef123', icon: <ChefHat className="w-4 h-4 text-amber-400" /> },
    { role: 'WAITER', title: 'Waiter Dispatch', email: 'waiter@aura.com', pass: 'waiter123', icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
    { role: 'CASHIER', title: 'Cashier POS', email: 'cashier@aura.com', pass: 'cashier123', icon: <CreditCard className="w-4 h-4 text-sky-400" /> },
    { role: 'OWNER', title: 'Owner Suite', email: 'owner@aura.com', pass: 'owner123', icon: <Award className="w-4 h-4 text-purple-400" /> },
    { role: 'ADMIN', title: 'System Admin', email: 'admin@aura.com', pass: 'admin123', icon: <LayoutDashboard className="w-4 h-4 text-[#38BDF8]" /> },
  ];

  return (
    <div className="min-h-screen bg-aura-obsidian text-aura-ivory flex relative overflow-hidden font-sans">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-4 py-2 bg-aura-obsidian/70 backdrop-blur-md border border-aura-border/60 hover:border-[#38BDF8] text-aura-slate hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Website</span>
      </button>

      {/* Left Panel: Luxury Brand & Imagery */}
      <div className="hidden lg:flex flex-1 relative bg-aura-container border-r border-aura-border/60 p-12 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aura-obsidian via-aura-obsidian/60 to-transparent" />

        <div className="relative z-10 space-y-3 pt-12">
          <div className="w-12 h-12 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-2xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/10">
            <Utensils className="w-6 h-6 text-[#38BDF8]" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-widest text-white">AURA GASTRONOMY</h1>
          <p className="text-xs text-[#38BDF8] uppercase tracking-[0.2em] font-mono font-semibold">Mayfair Enterprise Staff Hub</p>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="font-serif text-3xl font-bold leading-snug text-white">
            "Precision operations for Mayfair's premier fine dining establishment."
          </h2>
          <div className="grid grid-cols-3 gap-4 border-t border-aura-border/60 pt-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#38BDF8]">30 Tables</h3>
              <p className="text-[10px] text-aura-slate uppercase font-mono">Live Occupancy</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#38BDF8]">KDS Live</h3>
              <p className="text-[10px] text-aura-slate uppercase font-mono">Kitchen Stream</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#38BDF8]">CEO Suite</h3>
              <p className="text-[10px] text-aura-slate uppercase font-mono">Real-Time Metrics</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-aura-slate/70 font-mono">
          &copy; {new Date().getFullYear()} AURA Gastronomy Ltd. Authorized Personnel Only.
        </p>
      </div>

      {/* Right Panel: Staff Login & Role Fast Access */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 overflow-y-auto my-auto py-12">
        <div className="w-full max-w-md bg-aura-container/90 backdrop-blur-2xl border border-aura-border/80 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-7">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-full">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8] mr-2" />
              <span className="font-mono text-xs tracking-widest text-[#38BDF8] font-bold uppercase">Staff Portal</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-white">Secure Sign In</h2>
            <p className="text-xs text-aura-slate font-light">Access your operational role workspace</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-aura-slate uppercase tracking-wider">Staff Email or ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-aura-slate">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef@aura.com"
                  className="w-full pl-10 pr-4 py-3.5 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory text-xs placeholder:text-aura-slate/50 focus:outline-none focus:border-[#38BDF8] transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-aura-slate uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-aura-slate">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3.5 bg-aura-obsidian border border-aura-border rounded-2xl text-aura-ivory text-xs placeholder:text-aura-slate/50 focus:outline-none focus:border-[#38BDF8] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-aura-slate hover:text-aura-ivory transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#0EA5E9]/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border border-[#7DD3FC]/50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Staff Workspace Access Selectors */}
          <div className="pt-5 border-t border-aura-border/60 space-y-3">
            <p className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-widest text-center">
              1-Click Staff Workspace Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {quickRoles.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    setIdentifier(item.email);
                    setPassword(item.pass);
                    handleLoginSubmit(item.email, item.pass);
                  }}
                  className="p-3 bg-aura-obsidian/80 border border-aura-border/60 hover:border-[#38BDF8] text-left rounded-2xl transition-all flex items-center space-x-2.5 group cursor-pointer"
                >
                  <div className="p-2 bg-aura-container border border-aura-border rounded-xl group-hover:border-[#38BDF8]/50 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#38BDF8] transition-colors">{item.title}</h4>
                    <span className="text-[9px] text-aura-slate font-mono block">{item.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
