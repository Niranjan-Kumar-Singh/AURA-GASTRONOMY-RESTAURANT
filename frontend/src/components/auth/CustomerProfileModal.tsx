import React, { useState, useEffect } from 'react';
import { X, User, Phone, CheckCircle2 } from 'lucide-react';
import { useToast } from '../feedback/ToastContainer';
import { useAuthStore } from '../../store/use-auth-store';
import { authService } from '../../services/auth.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const { showToast } = useToast();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const updatedData = await authService.updateProfile(user._id, name, phone);
      updateUser(updatedData);
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
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
          <h3 className="font-serif text-xl font-bold text-aura-ivory">Edit Profile</h3>
          <p className="text-xs text-aura-slate">Update your personal dining details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3">
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-aura-gold hover:bg-aura-gold-hover disabled:bg-aura-gold/50 text-aura-obsidian font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
