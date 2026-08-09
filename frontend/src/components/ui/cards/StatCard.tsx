import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-aura-gold',
  badge
}) => {
  return (
    <div className="bg-aura-container/80 backdrop-blur-xl border border-aura-border/60 p-5 rounded-2xl space-y-3 shadow-xl hover:border-aura-gold/40 transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-semibold text-aura-slate uppercase tracking-wider">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-aura-obsidian border border-aura-border ${iconColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-aura-ivory tracking-tight">{value}</h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-aura-gold/10 text-aura-gold text-[10px] font-bold border border-aura-gold/20">
              {badge}
            </span>
          )}
        </div>

        {trend && (
          <p className={`text-[10px] font-bold flex items-center space-x-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>{isPositive ? '↑' : '↓'} {trend}</span>
          </p>
        )}

        {subtitle && (
          <p className="text-[10px] text-aura-slate font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
