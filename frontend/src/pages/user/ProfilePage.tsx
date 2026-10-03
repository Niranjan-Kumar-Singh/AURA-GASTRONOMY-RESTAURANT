import React from 'react';
import { User, ShieldCheck, Mail, Phone, Calendar, Award, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/use-auth-store';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();

  const userName = user?.name || 'AURA Staff Member';
  const userEmail = user?.email || (user?.phone ? `${user.phone}@aura-guest.com` : 'staff@aura.com');
  const userPhone = user?.phone || 'Not Specified';
  const userRole = (user?.role || 'STAFF').toUpperCase();
  const userId = user?._id ? `EMP-${user._id.slice(-6).toUpperCase()}` : 'EMP-2026-001';

  // Calculate initials dynamically
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AU';

  // Role color accents
  const isManagement = ['ADMIN', 'MANAGER', 'RESTAURANT_OWNER', 'SUPER_ADMIN'].includes(userRole);
  const isChef = userRole === 'CHEF';
  const isCashier = userRole === 'CASHIER';

  const badgeColorClass = isManagement
    ? 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30'
    : isChef
    ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    : isCashier
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    : 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/30';

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24 font-sans text-aura-ivory">
      {/* Header */}
      <div className="border-b border-aura-border pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#38BDF8]/10 border border-[#38BDF8]/30 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-wide text-white">STAFF USER PROFILE</h1>
            <p className="text-xs text-aura-slate">Personal Shift Schedule, Role Permissions & Credentials</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Badge Card */}
        <div className="bg-aura-container/80 backdrop-blur-xl border border-[#38BDF8]/20 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#38BDF8]/10 border-2 border-[#38BDF8] mx-auto flex items-center justify-center font-serif text-2xl font-bold text-[#38BDF8] shadow-xl">
            {initials}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-white">{userName}</h2>
            <p className="text-xs text-aura-slate">AURA Gastronomy Staff Member</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${badgeColorClass}`}>
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {userRole}
          </span>

          <div className="pt-2 border-t border-aura-border/40 text-left space-y-2 text-xs text-aura-slate">
            <div className="flex items-center justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            {user?.loyaltyTier && (
              <div className="flex items-center justify-between">
                <span>Tier:</span>
                <span className="text-amber-400 font-bold">{user.loyaltyTier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2 bg-aura-container/80 backdrop-blur-xl border border-[#38BDF8]/20 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="font-serif text-base font-bold text-white border-b border-aura-border pb-3">Staff Credentials & Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#38BDF8]/20 space-y-1">
              <span className="text-aura-slate font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#38BDF8]" /> Email Address</span>
              <p className="font-bold text-white truncate">{userEmail}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#38BDF8]/20 space-y-1">
              <span className="text-aura-slate font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#38BDF8]" /> Contact Phone</span>
              <p className="font-bold text-white">{userPhone}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#38BDF8]/20 space-y-1">
              <span className="text-aura-slate font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#38BDF8]" /> Assigned Shift</span>
              <p className="font-bold text-white">All-Day Dining Service (11:00 - 23:30)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#38BDF8]/20 space-y-1">
              <span className="text-aura-slate font-semibold flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-[#38BDF8]" /> Staff Identifier</span>
              <p className="font-mono font-bold text-[#38BDF8]">{userId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

