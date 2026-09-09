import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/use-auth-store';
import { ShieldCheck, Utensils, Eye, EyeOff, Lock, User as UserIcon, ArrowRight, ArrowLeft, ChefHat, UserCheck, CreditCard, LayoutDashboard, Award, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('chef@aura.com');
  const [password, setPassword] = useState('chef123');
  const [showPassword, setShowPassword] = useState(false);
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
    { role: 'CHEF', title: 'Head Chef KDS', email: 'chef@aura.com', pass: 'chef123', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: <ChefHat className="w-4 h-4 text-amber-400" /> },
    { role: 'WAITER', title: 'Floor Waiter', email: 'waiter@aura.com', pass: 'waiter123', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
    { role: 'CASHIER', title: 'Cashier POS', email: 'cashier@aura.com', pass: 'cashier123', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: <CreditCard className="w-4 h-4 text-cyan-400" /> },
    { role: 'OWNER', title: 'Executive CEO', email: 'owner@aura.com', pass: 'owner123', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: <Award className="w-4 h-4 text-purple-400" /> },
    { role: 'ADMIN', title: 'System Admin', email: 'admin@aura.com', pass: 'admin123', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <div className="page-theme-login min-h-screen bg-theme-bg text-theme-text flex relative overflow-hidden font-sans">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Website</span>
      </button>

      {/* Left Panel: High-Impact Luxury Culinary Atmosphere */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B0F17] border-r border-slate-800/80 p-12 flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-25"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#0B0F17]/80 to-transparent" />

        <div className="relative z-10 space-y-3 pt-12">
          <div className="w-12 h-12 bg-white/5 border border-slate-700 rounded-2xl flex items-center justify-center shadow-md">
            <Utensils className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-widest text-white">AURA GASTRONOMY</h1>
          <p className="text-xs text-emerald-400 uppercase tracking-[0.2em] font-mono font-bold">Authorized Operations Command</p>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="font-serif text-3xl font-bold leading-snug text-slate-100">
            "Precision operational command for Mayfair's premier gastronomy destination."
          </h2>
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div>
              <h3 className="text-xl font-black text-white font-mono">30 Tables</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Live Grid</p>
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-400 font-mono">KDS Stream</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Real-Time Pass</p>
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-400 font-mono">Financials</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Live DB Stream</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} AURA Gastronomy. Authorized Personnel Only.
        </p>
      </div>

      {/* Right Panel: Staff Login & Role Fast Access */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 overflow-y-auto my-auto py-12">
        <div className="w-full max-w-md bg-[#0D121F]/90 backdrop-blur-2xl border border-slate-800/90 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              <span className="font-mono text-[10px] tracking-widest text-slate-300 font-bold uppercase">Staff Workspace Access</span>
            </div>
            <h2 className="text-2xl font-black text-white">Staff Sign In</h2>
            <p className="text-xs text-slate-400">Sign in to your operational terminal</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Staff Email or ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef@aura.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#070A12] border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#070A12] border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Staff Workspace Access Selectors */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
              1-Click Staff Access Presets
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickRoles.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    setIdentifier(item.email);
                    setPassword(item.pass);
                    handleLoginSubmit(item.email, item.pass);
                  }}
                  className="p-2.5 bg-[#070A12]/90 border border-slate-800/90 hover:border-slate-600 text-left rounded-xl transition-all flex items-center space-x-2 group cursor-pointer"
                >
                  <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 group-hover:border-slate-600">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{item.title}</h4>
                    <span className="text-[9px] text-slate-500 font-mono block truncate">{item.email}</span>
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
