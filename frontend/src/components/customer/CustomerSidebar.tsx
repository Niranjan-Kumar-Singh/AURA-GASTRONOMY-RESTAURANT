import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, User, Utensils, Clock, History, Heart, Calendar, Tag, BookOpen, HelpCircle, LogIn, LogOut, Edit2
} from 'lucide-react';
import { useAuthStore } from '../../store/use-auth-store';
import { useOrderStore } from '../../store/use-order-store';
import { useTableStore } from '../../store/use-table-store';
import { tableService } from '../../services/table.service';
import { useToast } from '../feedback/ToastContainer';
import { FileText } from 'lucide-react';

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
  onOpenReservations,
  onOpenOffers,
  onOpenGallery,
  onOpenFaq,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { activeOrderId } = useOrderStore();
  const { activeSessionId, clearSession } = useTableStore();
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



  if (!isOpen) return null;

  const links = [
    { 
      label: 'Current Session Order', 
      icon: <Utensils className="w-4 h-4 text-aura-gold" />, 
      action: () => { onClose(); onOpenCart(); } 
    },
    {
      label: 'Request Final Bill',
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      action: () => { onClose(); handleRequestBill(); }
    },
    { 
      label: 'Track Order Timeline', 
      icon: <Clock className="w-4 h-4 text-sky-400" />, 
      action: () => {
        if (activeOrderId) navigate(`/table/${tableId}/order/${activeOrderId}`);
        else showToast('No active orders to track currently.', 'info');
      }
    },
    { 
      label: 'Order History', 
      icon: <History className="w-4 h-4 text-purple-400" />, 
      action: () => { onClose(); onOpenHistory(); } 
    },
    { 
      label: 'Saved Wishlist', 
      icon: <Heart className="w-4 h-4 text-rose-400" />, 
      action: () => { onClose(); onOpenWishlist(); } 
    },
    { 
      label: 'Active Offers & Coupons', 
      icon: <Tag className="w-4 h-4 text-emerald-400" />, 
      action: () => { onClose(); onOpenOffers(); } 
    },
    { 
      label: 'Restaurant Story & Gallery', 
      icon: <BookOpen className="w-4 h-4 text-aura-gold" />, 
      action: () => { onClose(); onOpenGallery(); } 
    },
    { 
      label: 'FAQs & Support', 
      icon: <HelpCircle className="w-4 h-4 text-aura-slate" />, 
      action: () => { onClose(); onOpenFaq(); } 
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs bg-aura-container border-r border-aura-border h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-aura-border flex items-center justify-between bg-gradient-to-br from-aura-obsidian to-aura-container">
          <div className="flex items-center space-x-3">
            <div className="flex-col">
              <h3 className="font-serif font-bold text-lg text-aura-gold">
                {isAuthenticated ? user?.name : 'Guest User'}
              </h3>
              <div className="flex items-center mt-0.5">
                <span className="px-2 py-0.5 bg-aura-gold/10 border border-aura-gold/40 text-[9px] uppercase tracking-widest text-aura-gold rounded-full font-bold shadow-sm">
                  {isAuthenticated ? (user?.status === 'VIP' ? 'VIP MEMBER' : 'AURA MEMBER') : 'TABLE ' + tableId}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="p-1.5 text-aura-slate hover:text-aura-gold rounded-full hover:bg-aura-obsidian transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-aura-slate hover:text-aura-ivory rounded-full hover:bg-aura-obsidian transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
          {links.map((link, idx) => (
            <button
              key={idx}
              onClick={() => {
                link.action();
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-aura-obsidian border border-transparent hover:border-aura-gold/20 text-aura-slate hover:text-aura-ivory transition-all group"
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Auth / Account Switcher Footer */}
        <div className="p-4 border-t border-aura-border bg-aura-obsidian space-y-2">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 bg-aura-gold hover:bg-aura-gold-hover text-aura-obsidian font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Register Account</span>
            </button>
          ) : (
            <button
              onClick={() => {
                logout();
                onClose();
                showToast('Logged out successfully', 'info');
              }}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Secure Logout</span>
            </button>
          )}

          <p className="text-[9px] text-center text-aura-slate">
            AURA Digital Dining Platform v1.0 • Bengaluru
          </p>
        </div>
      </div>
    </div>
  );
};
