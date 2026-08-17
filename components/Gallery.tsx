
import React, { useState, useRef, useEffect } from 'react';

// The photos are not ready yet. The masonry grid and lightbox were removed for
// now, and the GALLERY data is still in constants.tsx for when they are.
const Gallery: React.FC = () => {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeNotice = () => setIsNoticeOpen(false);

  useEffect(() => {
    if (!isNoticeOpen) return;

    dialogRef.current?.focus({ preventScroll: true });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNotice();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isNoticeOpen]);

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
              ref={triggerRef}
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

      {isNoticeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeNotice}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-notice-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-amber-100 p-10 text-center space-y-5 overflow-hidden focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>

            <svg className="w-12 h-12 mx-auto text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h1.5l1-2h6l1 2H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3.25" />
            </svg>

            <h3 id="gallery-notice-title" className="text-3xl font-serif text-gray-900">
              Not quite yet
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Our pre-wedding photos are still being put together. They will show up right here as
              soon as they are ready, so do check back.
            </p>

            <button
              type="button"
              onClick={closeNotice}
              className="inline-flex items-center justify-center bg-amber-500 text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
