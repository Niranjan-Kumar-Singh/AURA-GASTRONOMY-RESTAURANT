import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader } from 'lucide-react';
import { contentService } from '../../services/content.service';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useBackHandler } from '../../hooks/useBackHandler';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  useBackHandler(isOpen, onClose);
  const [images, setImages] = useState<{imageUrl: string, title: string, description: string, category: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGallery();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await contentService.getGallery();
      setImages(data);
    } catch (error) {
      console.error('Failed to load Gallery', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col" onClick={onClose}>
      <div className="p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-[#38BDF8]" />
          <h2 className="font-serif text-2xl font-bold text-white">AURA Story & Gallery</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-[#090A0F] hover:bg-black rounded-full text-white transition-colors border border-white/20 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-24 pb-10 px-6" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="font-serif text-4xl font-extrabold bg-gradient-to-r from-[#38BDF8] via-[#7DD3FC] to-[#38BDF8] bg-clip-text text-transparent">Culinary Excellence.</h1>
            <p className="text-aura-slate text-sm leading-relaxed">
              Founded in 2023, AURA Fine Dining redefines modern gastronomy by blending traditional 
              techniques with avant-garde presentation. Our executive chefs source the rarest ingredients 
              globally to craft an unforgettable, multi-sensory dining experience right here at your table.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-[#38BDF8]" /></div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {images.map((img, i) => (
                <div key={i} className="break-inside-avoid group relative rounded-2xl overflow-hidden shadow-2xl border border-[#38BDF8]/20">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[#38BDF8] font-serif italic text-lg shadow-black drop-shadow-md mb-2">{img.title}</span>
                    <span className="text-xs text-white">{img.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
