import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, User, Utensils, Clock, History, Heart, Tag, BookOpen, HelpCircle, LogIn, LogOut, Edit2, Star, FileText, ChevronRight, Sparkles, ShieldCheck, Bell, Award
} from 'lucide-react';
import { useAuthStore } from '../../store/use-auth-store';
import { useOrderStore } from '../../store/use-order-store';
import { useCartStore } from '../../store/use-cart-store';
import { useTableStore } from '../../store/use-table-store';
import { tableService } from '../../services/table.service';
import { useToast } from '../feedback/ToastContainer';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenHistory: () => void;
  onOpenWishlist: () => void;
  onOpenReservations?: () => void;
  onOpenOffers: () => void;
  onOpenGallery: () => void;
  onOpenFaq: () => void;
  onOpenProfile: () => void;
  onOpenFeedback?: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  isOpen,
  onClose,
  tableId,
  onOpenAuth,
  onOpenProfile,
  onOpenCart,
  onOpenHistory,
  onOpenWishlist,
  onOpenOffers,
  onOpenGallery,
  onOpenFaq,
  onOpenFeedback,
}) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { activeOrderId } = useOrderStore();
  const { getItemCount } = useCartStore();
  const { activeSessionId } = useTableStore();
  const { showToast } = useToast();

  const handleRequestBill = async () => {
    try {
      const res = await tableService.checkoutSession(tableId || activeSessionId || '10');
      showToast(res.message || 'Bill requested successfully! Your waiter will be right with you.', 'success');
      onClose();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Cannot request bill at this time.';
      showToast(errMsg, 'error');
    }
  };

  const handleCallWaiter = async (reason: string) => {
    try {
      await tableService.callWaiter(tableId, reason);
      showToast(`Waiter notified: "${reason}"`, 'success');
      onClose();
    } catch (e) {
      showToast('Waiter alert sent to floor staff.', 'info');
      onClose();
    }
  };

  if (!isOpen) return null;

  const cartCount = getItemCount();

  const links = [
    { 
      label: 'Current Session Cart', 
      badge: cartCount > 0 ? `${cartCount} Items` : undefined,
      badgeColor: 'bg-aura-gold text-aura-obsidian font-black',
      icon: <Utensils className="w-4 h-4 text-aura-gold" />, 
      action: () => { onOpenCart(); } 
    },
    { 
      label: 'Track Order Timeline', 
      badge: activeOrderId ? 'LIVE' : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse font-mono',
      icon: <Clock className="w-4 h-4 text-sky-400" />, 
      action: () => {
        if (activeOrderId) {
          onClose();
          navigate(`/table/${tableId}/order/${activeOrderId}`);
        } else {
          showToast('No active orders to track currently.', 'info');
        }
      }
    },
    {
      label: 'Request Final Bill',
      badge: '1-TAP',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-mono',
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      action: () => { handleRequestBill(); }
    },
    { 
      label: 'Rate Dining & Earn Points', 
      badge: '+100 PTS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono',
      icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, 
      action: () => { if (onOpenFeedback) onOpenFeedback(); } 
    },
    { 
      label: 'Saved Wishlist', 
      icon: <Heart className="w-4 h-4 text-rose-400" />, 
      action: () => { onOpenWishlist(); } 
    },
    { 
      label: 'Order History', 
      icon: <History className="w-4 h-4 text-purple-400" />, 
      action: () => { onOpenHistory(); } 
    },
    { 
      label: 'Active Offers & Coupons', 
      badge: 'OFFERS',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono',
      icon: <Tag className="w-4 h-4 text-emerald-400" />, 
      action: () => { onOpenOffers(); } 
    },
    { 
      label: 'Restaurant Story & Gallery', 
      icon: <BookOpen className="w-4 h-4 text-aura-gold" />, 
      action: () => { onOpenGallery(); } 
    },
    { 
      label: 'FAQs & Dining Support', 
      icon: <HelpCircle className="w-4 h-4 text-aura-slate" />, 
      action: () => { onOpenFaq(); } 
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[310px] sm:max-w-xs bg-aura-container border-r border-aura-border/80 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 relative overflow-hidden"
      >
        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-aura-gold/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Top Header Card */}
        <div className="p-5 border-b border-aura-border/80 bg-gradient-to-br from-aura-obsidian via-aura-container to-aura-obsidian relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-tr from-aura-gold/20 via-aura-obsidian to-aura-gold/10 border-2 border-aura-gold/50 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                {isAuthenticated ? (
                  <User className="w-5 h-5 text-aura-gold" />
                ) : (
                  <Sparkles className="w-5 h-5 text-aura-gold" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-base text-aura-ivory truncate">
                  {isAuthenticated ? user?.name : 'Guest Dining Session'}
                </h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="px-2.5 py-0.5 bg-aura-gold/10 border border-aura-gold/40 text-[9px] uppercase tracking-widest text-aura-gold rounded-full font-bold shadow-sm font-mono flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-aura-gold inline mr-0.5" />
                    <span>{isAuthenticated ? (user?.status === 'VIP' ? 'VIP MEMBER' : 'AURA MEMBER') : `TABLE ${tableId}`}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 shrink-0">
              {isAuthenticated && (
                <button
                  onClick={() => {
                    onOpenProfile();
                  }}
                  className="p-2 text-aura-slate hover:text-aura-gold rounded-xl hover:bg-aura-obsidian border border-transparent hover:border-aura-gold/30 transition-all cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-aura-slate hover:text-aura-ivory rounded-xl hover:bg-aura-obsidian border border-transparent hover:border-aura-border transition-all cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Table Call Shortcuts Bar */}
          <div className="pt-2 border-t border-aura-border/40 grid grid-cols-2 gap-2 text-[10px] font-bold">
            <button
              onClick={() => handleCallWaiter('Water Refill')}
              className="p-2 bg-aura-obsidian hover:bg-aura-gold/10 border border-aura-border/60 hover:border-aura-gold/40 text-aura-slate hover:text-aura-gold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Bell className="w-3 h-3 text-aura-gold" />
              <span>Water Refill</span>
            </button>

            <button
              onClick={() => handleCallWaiter('General Table Assistance')}
              className="p-2 bg-aura-obsidian hover:bg-aura-gold/10 border border-aura-border/60 hover:border-aura-gold/40 text-aura-slate hover:text-aura-gold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Award className="w-3 h-3 text-aura-gold" />
              <span>Call Waiter</span>
            </button>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar relative z-10">
          {links.map((link, idx) => (
            <button
              key={idx}
              onClick={() => link.action()}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-aura-container/40 hover:bg-aura-obsidian border border-aura-border/40 hover:border-aura-gold/40 text-aura-slate hover:text-aura-ivory transition-all group cursor-pointer shadow-sm"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 bg-aura-obsidian/80 border border-white/10 rounded-xl group-hover:border-aura-gold/50 group-hover:scale-105 transition-all shrink-0 shadow-inner">
                  {link.icon}
                </div>
                <span className="text-xs sm:text-sm font-semibold truncate text-aura-ivory/90 group-hover:text-aura-gold transition-colors">
                  {link.label}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {link.badge && (
                  <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold border ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-aura-slate/50 group-hover:text-aura-gold group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>

        {/* Auth / Account Switcher Footer */}
        <div className="p-4 border-t border-aura-border/80 bg-aura-obsidian space-y-2.5 relative z-10">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-aura-gold via-amber-400 to-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-xl shadow-aura-gold/15 active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Register Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                onClose();
                onOpenAuth();
                showToast('Logged out successfully', 'info');
              }}
              className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Secure Logout</span>
            </button>
          )}

          <div className="pt-1 text-center">
            <p className="text-[9px] text-aura-slate/70 font-mono tracking-wider">
              AURA GASTRONOMY • LUXURY DINING v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
