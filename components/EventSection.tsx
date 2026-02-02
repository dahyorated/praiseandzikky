import React, { useState, useEffect } from 'react';
import { WeddingEvent } from '../types';

interface EventSectionProps {
  event: WeddingEvent;
  reversed?: boolean;
}

const EventSection: React.FC<EventSectionProps> = ({ event, reversed }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const isProposal = event.id === 'proposal';
  const displayImages = event.eventImages || [];
  const hasValidAddress = event.address && event.address.toLowerCase() !== 'to be communicated';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
        setIsMapOpen(false);
      }
    };

    if (selectedImage !== null || isMapOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, isMapOpen]);

  const closeModal = () => {
    setSelectedImage(null);
  };

  const closeMapModal = () => {
    setIsMapOpen(false);
  };

  const getMapUrl = () => {
    const query = encodeURIComponent(`${event.venue}, ${event.address}`);
    return `https://www.openstreetmap.org/export/embed.html?bbox=3.0%2C6.3%2C4.0%2C7.0&layer=mapnik`;
  };

  const getMapSearchUrl = () => {
    const query = encodeURIComponent(`${event.venue}, ${event.address}`);
    return `https://www.openstreetmap.org/search?query=${query}#map=15`;
  };

  return (
    <section 
      id={event.id} 
      className="py-24 overflow-hidden bg-white even:bg-amber-50/30 border-b border-amber-100/50 scroll-mt-24"
    >
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
          <div className="w-full md:w-1/2 relative">
            <div 
              className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
              onClick={() => setSelectedImage(event.image)}
            >
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className={`absolute -bottom-6 ${reversed ? '-left-6' : '-right-6'} bg-white p-8 rounded-xl shadow-xl hidden lg:block border border-amber-100`}>
              <div className="text-amber-600 font-serif text-3xl mb-1">{event.date.split(',')[0]}</div>
              <div className="text-gray-400 uppercase tracking-[0.2em] text-xs font-semibold">{event.time}</div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900">{event.title}</h2>
              <div className="h-1 w-20 bg-amber-500 rounded-full"></div>
            </div>

            <p className="text-gray-600 leading-relaxed text-lg italic">
              "{event.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Venue</span>
                <p className="text-gray-800 font-medium">{event.venue}</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-500 text-sm">{event.address}</p>
                  {hasValidAddress && (
                    <button
                      onClick={() => setIsMapOpen(true)}
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 transition-colors"
                      aria-label="View on map"
                      title="View on map"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Theme</span>
                <p className="text-gray-800 font-medium">{event.theme}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Dress Code</span>
                <p className="text-gray-800 font-medium">{event.dressCode}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Colors</span>
                <div className="flex gap-2 items-center mt-1">
                  {event.colors.map(color => (
                    <span key={color} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-wrap gap-4">
              {/* RSVP removed — no RSVP on the site */}
 
               {displayImages.length > 0 && (
                 <button 
                   onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                   className="inline-flex items-center gap-2 border-2 border-amber-500 text-amber-600 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-amber-50 transition-all shadow-md active:scale-95"
                 >
                   {isGalleryOpen ? 'Close Highlights' : 'View Highlights'}
                   <svg className={`w-4 h-4 transition-transform duration-300 ${isGalleryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Collapsible Gallery */}
        <div className={`mt-12 overflow-hidden transition-all duration-700 ease-in-out ${isGalleryOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100">
            <div className="flex justify-center items-center mb-8 px-4">
              <h3 className="text-2xl font-serif text-amber-800 italic">{event.title} Highlights</h3>
            </div>
            
            {isProposal && displayImages.length > 0 ? (
              /* Show Images for Proposal */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayImages.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedImage(url)}
                    className="group relative aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-white transform transition-all duration-300 hover:scale-105 hover:rotate-1 cursor-pointer"
                  >
                    <img src={url} alt={`${event.title} snapshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              /* Responsive Message for Other Events */
              <div className="max-w-2xl mx-auto p-6 md:p-8 lg:p-10 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 shadow-lg">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-200 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-serif text-gray-900 font-semibold">
                    Pictures Will Be Available After Event
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 max-w-md">
                    We're excited to share our special moments with you. Check back here after our celebration to view all the beautiful memories we'll create together.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              src={selectedImage}
              alt={event.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-center">
              <p className="text-white font-medium text-lg">{event.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={closeMapModal}
        >
          <button
            onClick={closeMapModal}
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors z-10"
            aria-label="Close map"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <h3 className="text-lg font-serif text-gray-900">{event.venue}</h3>
              <p className="text-sm text-gray-600">{event.address}</p>
            </div>

            <div className="aspect-video w-full bg-gray-100">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(event.venue + ', ' + event.address)}&output=embed`}
                className="w-full h-full border-0"
                title={`Map of ${event.venue}`}
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-amber-50 border-t border-amber-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Map data © OpenStreetMap contributors</p>
              <a
                href={getMapSearchUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Open in OpenStreetMap
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventSection;
