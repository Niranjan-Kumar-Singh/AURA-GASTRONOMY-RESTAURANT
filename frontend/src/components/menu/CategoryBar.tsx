import React, { useState } from 'react';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
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
  isHeaderVisible = true,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div
      className={`sticky z-20 w-full bg-aura-obsidian/95 backdrop-blur-xl border-b border-aura-border/80 shadow-xl transition-all duration-300 ${
        isHeaderVisible ? 'top-[52px] sm:top-[57px]' : 'top-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 space-y-2">
        {/* Mobile Search Bar & Category Navigation Header */}
        <div className="flex items-center justify-between gap-2">
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-aura-gold absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search dishes, ingredients, drinks..."
              className="w-full pl-9 pr-8 py-2 bg-aura-container/80 border border-aura-border/80 focus:border-aura-gold hover:border-aura-gold/50 rounded-xl text-aura-ivory text-xs placeholder:text-aura-slate/80 focus:outline-none shadow-inner transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-aura-slate hover:text-aura-ivory p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-aura-gold/15 text-aura-gold border border-aura-gold/30 rounded-lg whitespace-nowrap shrink-0 animate-pulse">
              Filtered
            </span>
          )}
        </div>

        {/* Scrollable Categories Rail */}
        <div className="overflow-x-auto no-scrollbar flex items-center space-x-2 py-0.5 min-w-full select-none">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer border ${
              selectedCategoryId === null
                ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-md font-black'
                : 'bg-aura-container/90 border-aura-border/70 text-aura-slate hover:text-aura-ivory hover:border-aura-gold/40'
            }`}
          >
            All Dishes
          </button>

          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-aura-gold text-aura-obsidian border-aura-gold shadow-md font-black'
                    : 'bg-aura-container/90 border-aura-border/70 text-aura-slate hover:text-aura-ivory hover:border-aura-gold/40'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

