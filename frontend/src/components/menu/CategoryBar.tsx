import React from 'react';
import { Category } from '../../types/menu.types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-4 bg-aura-obsidian/90 backdrop-blur-md sticky top-16 z-20 border-b border-aura-border">
      <div className="flex space-x-2 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            selectedCategoryId === null
              ? 'bg-aura-gold text-aura-obsidian shadow-md shadow-aura-gold/20'
              : 'bg-aura-container border border-aura-border text-aura-slate hover:text-aura-ivory'
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
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                isSelected
                  ? 'bg-aura-gold text-aura-obsidian shadow-md shadow-aura-gold/20'
                  : 'bg-aura-container border border-aura-border text-aura-slate hover:text-aura-ivory'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
