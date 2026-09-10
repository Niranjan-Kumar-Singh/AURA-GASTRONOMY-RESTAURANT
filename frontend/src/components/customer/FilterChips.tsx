import React from 'react';
import { Flame, Sparkles, Award, Tag, Wheat } from 'lucide-react';

export type ActiveFilter = 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN' | 'GF' | 'SPECIAL' | 'BESTSELLER' | 'UNDER300' | 'SPICY';

interface FilterChipsProps {
  selectedFilters: ActiveFilter[];
  onToggleFilter: (filter: ActiveFilter) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ selectedFilters, onToggleFilter }) => {
  const isSelected = (filter: ActiveFilter) => selectedFilters.includes(filter);

  const chips: { id: ActiveFilter; label: string; icon?: React.ReactNode; activeClass: string }[] = [
    {
      id: 'ALL',
      label: 'All Items',
      activeClass: 'bg-[#0C831F] text-white border-[#0C831F] shadow-sm font-black',
    },
    {
      id: 'VEG',
      label: 'Pure Veg',
      icon: (
        <span className="w-3.5 h-3.5 rounded-sm border border-emerald-600 flex items-center justify-center bg-white shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        </span>
      ),
      activeClass: 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black shadow-sm',
    },
    {
      id: 'NON_VEG',
      label: 'Non-Veg',
      icon: (
        <span className="w-3.5 h-3.5 rounded-sm border border-rose-600 flex items-center justify-center bg-white shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        </span>
      ),
      activeClass: 'bg-rose-50 border-rose-600 text-rose-800 font-black shadow-sm',
    },
    {
      id: 'SPECIAL',
      label: "Chef's Special",
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      activeClass: 'bg-amber-50 border-amber-500 text-amber-900 font-black shadow-sm',
    },
    {
      id: 'BESTSELLER',
      label: 'Bestseller',
      icon: <Award className="w-3.5 h-3.5 text-emerald-600" />,
      activeClass: 'bg-emerald-50 border-emerald-600 text-emerald-800 font-black shadow-sm',
    },
    {
      id: 'UNDER300',
      label: 'Under ₹300',
      icon: <Tag className="w-3.5 h-3.5 text-slate-500" />,
      activeClass: 'bg-slate-100 border-slate-700 text-slate-900 font-black shadow-sm',
    },
    {
      id: 'JAIN',
      label: 'Jain Friendly',
      activeClass: 'bg-purple-50 border-purple-500 text-purple-900 font-black shadow-sm',
    },
    {
      id: 'GF',
      label: 'Gluten-Free',
      icon: <Wheat className="w-3.5 h-3.5 text-amber-600" />,
      activeClass: 'bg-amber-50 border-amber-500 text-amber-900 font-black shadow-sm',
    },
    {
      id: 'SPICY',
      label: 'Spicy',
      icon: <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />,
      activeClass: 'bg-rose-50 border-rose-500 text-rose-800 font-black shadow-sm',
    },
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto px-1 py-1 text-xs no-scrollbar select-none scroll-smooth">
      {chips.map((chip) => {
        const active = isSelected(chip.id);

        return (
          <button
            key={chip.id}
            onClick={() => onToggleFilter(chip.id)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap border cursor-pointer shrink-0 text-xs shadow-sm ${
              active
                ? chip.activeClass
                : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
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
export default FilterChips;
