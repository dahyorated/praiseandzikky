
import React, { useState } from 'react';
import ComingSoonDialog from './ComingSoonDialog';

// The photos are not ready yet. The masonry grid and lightbox were removed for
// now, and the GALLERY data is still in constants.tsx for when they are.
const Gallery: React.FC = () => {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  return (
    <>
      <section id="gallery" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-serif text-gray-900">Pre-Wedding Photos</h2>
            <p className="text-gray-500 font-light tracking-widest uppercase text-sm">
              A glimpse into our journey together
            </p>
            <button
              onClick={() => setIsNoticeOpen(true)}
              className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-600 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-amber-50 transition-all shadow-md active:scale-95 mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              View Photos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <ComingSoonDialog
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        title="Not quite yet"
        message="Our pre-wedding photos are still being put together. They will show up right here as soon as they are ready, so do check back."
      />
    </>
  );
};

export default Gallery;
