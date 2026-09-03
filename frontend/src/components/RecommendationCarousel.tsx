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
        <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-aura-ivory tracking-tight">Chef's Curated Pairings</h2>
          <p className="text-xs text-aura-slate">Intelligent dish recommendations tailored for your table</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl p-4 bg-aura-container backdrop-blur-xl border border-[#38BDF8]/30 hover:border-[#38BDF8] transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/5 rounded-full blur-2xl group-hover:bg-[#38BDF8]/10 transition-colors pointer-events-none" />

            <div>
              {item.imageUrl && (
                <div className="h-36 w-full rounded-xl overflow-hidden mb-3 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aura-obsidian/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-aura-obsidian/80 backdrop-blur-md text-[10px] font-medium text-[#38BDF8] border border-[#38BDF8]/30">
                    {item.category?.name || 'Curated'}
                  </span>
                </div>
              )}

              <h3 className="font-serif font-bold text-aura-ivory group-hover:text-[#38BDF8] transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-aura-slate line-clamp-2 mt-1 mb-3">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#38BDF8]/20">
              <span className="text-lg font-mono font-bold text-[#38BDF8]">
                ₹{item.price.toFixed(2)}
              </span>

              <button
                onClick={() => handleAdd(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  addedIds.includes(item.id)
                    ? 'bg-emerald-500 text-aura-obsidian font-bold'
                    : 'bg-[#0EA5E9] hover:bg-[#0284C7] text-[#090A0F] shadow-[0_2px_15px_rgba(14,165,233,0.4)] border border-[#7DD3FC]/60 active:scale-95'
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
