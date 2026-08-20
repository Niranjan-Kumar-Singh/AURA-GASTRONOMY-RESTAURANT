import React, { useState } from 'react';
import { X, User, Phone, Lock } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useAuthStore } from '../../store/use-auth-store';
import { authService } from '../../services/auth.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ isOpen, onClose, tableId }) => {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { setAuth } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'LOGIN') {
        const data = await authService.login(phone, password);
        setAuth(data.user, data.token || data.accessToken, tableId);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else if (mode === 'REGISTER') {
        const data = await authService.register(name, phone, password);
        setAuth(data, data.token, tableId);
        showToast(`Account created for ${data.name}!`, 'success');
      }
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Authentication failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-aura-container border border-aura-gold/40 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-aura-slate hover:text-aura-ivory rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-aura-gold/10 border border-aura-gold/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6 text-aura-gold" />
          </div>
          <h3 className="font-serif text-xl font-bold text-aura-ivory">
            {mode === 'LOGIN' ? 'Customer Sign In' : 'Create Account'}
          </h3>
          <p className="text-xs text-aura-slate">Unlock loyalty rewards, past history & personalized recommendations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'REGISTER' && (
            <div className="relative">
              <User className="w-4 h-4 text-aura-slate absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none focus:border-aura-gold"
              />
            </div>
          )}

          <div className="relative">
            <Phone className="w-4 h-4 text-aura-slate absolute left-3.5 top-3.5" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number (+91)"
              className="w-full pl-10 pr-4 py-3 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none focus:border-aura-gold"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-aura-slate absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-aura-obsidian border border-aura-border rounded-xl text-xs text-aura-ivory placeholder:text-aura-slate focus:outline-none focus:border-aura-gold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            {mode === 'LOGIN' ? 'SIGN IN' : 'REGISTER NOW'}
          </button>
        </form>

        <div className="pt-2 border-t border-aura-border text-center text-xs space-y-1">
          {mode === 'LOGIN' ? (
            <p className="text-aura-slate">
              Don't have an account?{' '}
              <button onClick={() => setMode('REGISTER')} className="text-aura-gold font-bold hover:underline">
                Register Now
              </button>
            </p>
          ) : (
            <p className="text-aura-slate">
              Already registered?{' '}
              <button onClick={() => setMode('LOGIN')} className="text-aura-gold font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
