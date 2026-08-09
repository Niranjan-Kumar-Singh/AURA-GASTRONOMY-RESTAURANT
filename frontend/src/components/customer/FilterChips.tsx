import React from 'react';
import { Leaf, Flame, Sparkles, Award, Tag, Wheat } from 'lucide-react';

export type ActiveFilter = 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN' | 'GF' | 'SPECIAL' | 'BESTSELLER' | 'UNDER300' | 'SPICY';

interface FilterChipsProps {
  selectedFilters: ActiveFilter[];
  onToggleFilter: (filter: ActiveFilter) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ selectedFilters, onToggleFilter }) => {
  const isSelected = (filter: ActiveFilter) => selectedFilters.includes(filter);

  const chips: { id: ActiveFilter; label: string; icon?: React.ReactNode; activeBg: string }[] = [
    { id: 'ALL', label: 'All Items', activeBg: 'bg-aura-gold text-aura-obsidian' },
    { id: 'VEG', label: 'Veg', icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />, activeBg: 'bg-emerald-500 text-aura-obsidian' },
    { id: 'NON_VEG', label: 'Non-Veg', activeBg: 'bg-rose-500 text-white' },
    { id: 'JAIN', label: 'Jain Friendly', activeBg: 'bg-purple-500 text-white' },
    { id: 'GF', label: 'Gluten-Free', icon: <Wheat className="w-3.5 h-3.5 text-amber-400" />, activeBg: 'bg-amber-500 text-aura-obsidian' },
    { id: 'SPECIAL', label: "Chef's Special", icon: <Sparkles className="w-3.5 h-3.5 text-aura-gold" />, activeBg: 'bg-aura-gold text-aura-obsidian' },
    { id: 'BESTSELLER', label: 'Best Sellers', icon: <Award className="w-3.5 h-3.5 text-amber-400" />, activeBg: 'bg-amber-500 text-aura-obsidian' },
    { id: 'UNDER300', label: 'Under ₹300', icon: <Tag className="w-3.5 h-3.5 text-emerald-400" />, activeBg: 'bg-emerald-500 text-aura-obsidian' },
    { id: 'SPICY', label: 'Spicy Delights', icon: <Flame className="w-3.5 h-3.5 text-rose-400" />, activeBg: 'bg-rose-500 text-white' },
  ];

  return (
    <div className="px-4 max-w-7xl mx-auto my-2">
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        {chips.map((chip) => {
          const active = isSelected(chip.id);

          return (
            <button
              key={chip.id}
              onClick={() => onToggleFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap border shadow-sm ${
                active
                  ? `${chip.activeBg} font-bold border-transparent scale-105`
                  : 'bg-aura-container text-aura-slate border-aura-border hover:border-aura-gold/50'
              }`}
            >
              {chip.icon && <span>{chip.icon}</span>}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
