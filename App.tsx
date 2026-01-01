import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventSection from './components/EventSection';
import Gallery from './components/Gallery';
import Registry from './components/Registry';
import { WEDDING_EVENTS } from './constants';

const App: React.FC = () => {
  const [daysToGo, setDaysToGo] = useState(0);

  useEffect(() => {
    const calculateDaysToGo = () => {
      const weddingDate = new Date('2027-01-30');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      weddingDate.setHours(0, 0, 0, 0);
      
      const diffTime = weddingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysToGo(Math.max(0, diffDays));
    };

    // Calculate immediately
    calculateDaysToGo();

    // Update at midnight each day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    let intervalId: NodeJS.Timeout | null = null;
    
    const timeoutId = setTimeout(() => {
      calculateDaysToGo();
      // Set interval to update every 24 hours after the first midnight
      intervalId = setInterval(calculateDaysToGo, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1920" 
            alt="Wedding Background" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6">
          <div className="mb-6 space-y-4">
            <span className="block text-xs md:text-sm font-bold uppercase tracking-[0.5em] animate-in fade-in slide-in-from-top-4 duration-1000">The Union of</span>
            <h1 className="text-6xl md:text-9xl font-serif italic mb-2 animate-in fade-in zoom-in duration-1000">Praise & Ezekiel</h1>
            <div className="h-px w-24 bg-white/50 mx-auto"></div>
          </div>
          
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <p className="text-lg md:text-2xl font-light tracking-widest uppercase">January 2027 • Lagos, Nigeria</p>
            <div className="flex justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-serif">{daysToGo}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Days To Go</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-serif">05</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Text Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center max-w-3xl space-y-8">
          <div className="font-cursive text-amber-600 text-4xl">Our Love Story</div>
          <h2 className="text-4xl font-serif text-gray-900 leading-tight">"Starting off from a bookstore to the rest of our lives"</h2>
          <p className="text-gray-500 leading-relaxed text-lg">
            We are so excited to have you join us for our multi-day celebration of love, culture, and family. 
            Each event reflects a part of our journey and our heritage. Thank you for being a part of our lives.
          </p>
        </div>
      </section>

      {/* Event Sections - Ordered by User Request */}
      {WEDDING_EVENTS.map((event, index) => (
        <EventSection key={event.id} event={event} reversed={index % 2 !== 0} />
      ))}

      {/* Gallery Section */}
      <Gallery />

      {/* Registry Section (Gifts) */}
      <Registry />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6 text-center space-y-8">
          <div className="text-4xl font-serif font-bold italic gold-gradient">Praise & Ezekiel</div>
          <p className="text-gray-400 max-w-md mx-auto italic">
            "For where your treasure is, there your heart will be also."
          </p>
          <div className="pt-12 text-[10px] uppercase tracking-widest text-gray-600">
            © 2024 The Union. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
