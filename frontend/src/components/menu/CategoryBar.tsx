import React from 'react';
import { Search, X, Utensils } from 'lucide-react';
import { Category } from '../../types/menu.types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isHeaderVisible?: boolean;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
}) => {

  return (
    <div className="w-full bg-white/95 backdrop-blur-md">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-8 py-2 space-y-2">
        {/* Quick Search Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search dishes, drinks, desserts..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 focus:border-[#0C831F] focus:bg-white rounded-xl text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none shadow-sm transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg whitespace-nowrap shrink-0">
              Filtered
            </span>
          )}
        </div>

        {/* Scrollable Category Pills Rail */}
        <div className="overflow-x-auto blinkit-scrollbar-x flex items-center space-x-2 px-1 pt-0.5 pb-1.5 min-w-full select-none scroll-smooth">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
              selectedCategoryId === null
                ? 'bg-[#0C831F] text-white shadow-sm font-black scale-[1.02]'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>All Dishes</span>
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#0C831F] text-white shadow-sm font-black scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm'
                }`}
              >
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default CategoryBar;

