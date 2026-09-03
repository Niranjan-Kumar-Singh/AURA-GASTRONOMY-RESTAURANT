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
    { id: 'ALL', label: 'All Items', activeBg: 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] shadow-[0_0_15px_rgba(56,189,248,0.35)] font-extrabold scale-[1.02]' },
    { id: 'VEG', label: 'Veg', icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" />, activeBg: 'bg-[#062C22] border-2 border-emerald-500 text-emerald-300 font-bold scale-[1.02]' },
    { id: 'NON_VEG', label: 'Non-Veg', activeBg: 'bg-[#350A14] border-2 border-rose-500 text-rose-300 font-bold scale-[1.02]' },
    { id: 'JAIN', label: 'Jain Friendly', activeBg: 'bg-[#210D35] border-2 border-purple-500 text-purple-300 font-bold scale-[1.02]' },
    { id: 'GF', label: 'Gluten-Free', icon: <Wheat className="w-3.5 h-3.5 text-[#38BDF8]" />, activeBg: 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] font-bold scale-[1.02]' },
    { id: 'SPECIAL', label: "Chef's Special", icon: <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />, activeBg: 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] font-bold scale-[1.02]' },
    { id: 'BESTSELLER', label: 'Best Sellers', icon: <Award className="w-3.5 h-3.5 text-[#38BDF8]" />, activeBg: 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] font-bold scale-[1.02]' },
    { id: 'UNDER300', label: 'Under ₹300', icon: <Tag className="w-3.5 h-3.5 text-emerald-400" />, activeBg: 'bg-[#062C22] border-2 border-emerald-500 text-emerald-300 font-bold scale-[1.02]' },
    { id: 'SPICY', label: 'Spicy Delights', icon: <Flame className="w-3.5 h-3.5 text-rose-400" />, activeBg: 'bg-[#350A14] border-2 border-rose-500 text-rose-300 font-bold scale-[1.02]' },
  ];

  return (
    <div className="flex items-center space-x-2.5 overflow-x-auto px-1 py-1 text-xs no-scrollbar select-none scroll-smooth">
      {chips.map((chip) => {
        const active = isSelected(chip.id);

        return (
          <button
            key={chip.id}
            onClick={() => onToggleFilter(chip.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap border cursor-pointer shrink-0 ${
              active
                ? chip.activeBg
                : 'bg-[#161A28]/80 text-slate-300 border-[#38BDF8]/20 hover:border-[#38BDF8]/50 hover:text-white hover:scale-[1.01]'
            }`}
          >
            {chip.icon && <span>{chip.icon}</span>}
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};
