import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
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
  return (
    <div
      className={`sticky z-20 w-full bg-[#090A0F] border-b border-[#38BDF8]/20 shadow-2xl transition-all duration-300 ${
        isHeaderVisible ? 'top-[52px] sm:top-[57px]' : 'top-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2.5">
        {/* Mobile Search Bar & Category Navigation Header */}
        <div className="flex items-center justify-between gap-3">
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#38BDF8] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search dishes, ingredients, drinks..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#161A28]/90 border border-[#38BDF8]/25 focus:border-[#38BDF8] hover:border-[#38BDF8]/50 rounded-xl text-white text-xs placeholder:text-slate-400 focus:outline-none shadow-inner transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <span className="text-[10px] font-mono font-bold px-3 py-1.5 bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 rounded-lg whitespace-nowrap shrink-0 animate-pulse">
              Filtered
            </span>
          )}
        </div>

        {/* Scrollable Categories Rail with Bespoke Spaced Luxury Horizontal Scrollbar */}
        <div className="overflow-x-auto luxury-scrollbar-x flex items-center space-x-2.5 px-2 pt-1 pb-2.5 min-w-full select-none scroll-smooth">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] shadow-[0_0_15px_rgba(56,189,248,0.35)] font-extrabold scale-[1.02]'
                : 'bg-[#161A28]/80 border border-[#38BDF8]/20 text-slate-300 hover:text-white hover:border-[#38BDF8]/50 hover:scale-[1.01]'
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
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap tracking-wide transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#161A28] border-2 border-[#38BDF8] text-[#7DD3FC] shadow-[0_0_15px_rgba(56,189,248,0.35)] font-extrabold scale-[1.02]'
                    : 'bg-[#161A28]/80 border border-[#38BDF8]/20 text-slate-300 hover:text-white hover:border-[#38BDF8]/50 hover:scale-[1.01]'
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

