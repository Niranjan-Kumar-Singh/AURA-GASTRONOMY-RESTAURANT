import React, { useState, useEffect } from 'react';
import { Search, X, Flame } from 'lucide-react';

interface CustomerSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (term: string) => void;
}

export const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  value,
  onChange,
  onSelectSuggestion,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    'Search Dal AURA 36-Hour Dum...',
    'Search Kashmiri Saffron Tikka...',
    'Search Awadhi Lamb Biryani...',
    'Search Black Truffle Tagliolini...',
    'Search 24K Gold Chocolate Sphere...',
  ];

  const popularSearches = [
    'Dal AURA',
    'Butter Chicken',
    'Lamb Biryani',
    'Wagyu Ribeye',
    'Truffle Pasta',
    'Gold Sphere',
    'Saffron Elixir',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 max-w-7xl mx-auto my-3 relative z-20">
      <div className="relative">
        <Search className="w-4 h-4 text-aura-gold absolute left-4 top-3.5" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholders[placeholderIndex]}
          className="w-full pl-11 pr-10 py-3.5 bg-aura-container border border-aura-border hover:border-aura-gold/50 rounded-2xl text-aura-ivory text-xs placeholder:text-aura-slate focus:outline-none focus:border-aura-gold shadow-lg transition-colors"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3.5 top-3.5 p-0.5 text-aura-slate hover:text-aura-ivory rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popular Search Suggestions Popup */}
      {isFocused && !value && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-aura-container border border-aura-gold/30 rounded-2xl p-4 shadow-2xl space-y-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2 text-xs font-bold text-aura-gold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Popular Guest Searches</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  onChange(term);
                  if (onSelectSuggestion) onSelectSuggestion(term);
                }}
                className="px-3 py-1.5 bg-aura-obsidian hover:bg-aura-gold/20 border border-aura-border hover:border-aura-gold text-aura-ivory text-xs rounded-xl font-medium transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
