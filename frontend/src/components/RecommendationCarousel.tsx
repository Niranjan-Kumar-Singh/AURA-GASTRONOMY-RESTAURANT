import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Check } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: { name: string };
}

interface Props {
  onAddToCart: (item: MenuItem) => void;
}

export const RecommendationCarousel: React.FC<Props> = ({ onAddToCart }) => {
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setRecommendations(data.data);
        }
      })
      .catch((err) => console.error('Failed to load recommendations:', err));
  }, []);

  if (recommendations.length === 0) return null;

  const handleAdd = (item: MenuItem) => {
    onAddToCart(item);
    setAddedIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== item.id));
    }, 1500);
  };

  return (
    <section className="my-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-stone-100 tracking-tight">Chef's Curated Pairings</h2>
          <p className="text-xs text-stone-400">Intelligent dish recommendations tailored for your table</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl p-4 bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

            <div>
              {item.imageUrl && (
                <div className="h-36 w-full rounded-xl overflow-hidden mb-3 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-md text-[10px] font-medium text-amber-400 border border-amber-500/20">
                    {item.category?.name || 'Curated'}
                  </span>
                </div>
              )}

              <h3 className="font-medium text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-stone-400 line-clamp-2 mt-1 mb-3">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800/60">
              <span className="text-lg font-semibold text-stone-100">
                ${item.price.toFixed(2)}
              </span>

              <button
                onClick={() => handleAdd(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  addedIds.includes(item.id)
                    ? 'bg-emerald-500 text-stone-950 font-semibold'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-lg shadow-amber-500/20'
                }`}
              >
                {addedIds.includes(item.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Quick Add
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
