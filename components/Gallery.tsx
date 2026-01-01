
import React, { useState, useEffect } from 'react';
import { GALLERY } from '../constants';

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage !== null) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <section id="gallery" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-serif text-gray-900">Captured Moments</h2>
            <p className="text-gray-500 font-light tracking-widest uppercase text-sm">A glimpse into our journey together</p>
          </div>
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {GALLERY.map((img, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedImage(idx)}
                className="break-inside-avoid group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img 
                  src={img.url} 
                  alt={img.caption} 
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div>
                    <span className="text-amber-400 text-[10px] uppercase tracking-widest font-bold">{img.category}</span>
                    <p className="text-white font-medium">{img.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={GALLERY[selectedImage].url} 
              alt={GALLERY[selectedImage].caption}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
              <span className="text-amber-400 text-xs uppercase tracking-widest font-bold block mb-2">
                {GALLERY[selectedImage].category}
              </span>
              <p className="text-white font-medium text-lg">{GALLERY[selectedImage].caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
