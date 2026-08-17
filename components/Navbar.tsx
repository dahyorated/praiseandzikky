
import React, { useState, useEffect } from 'react';
import { WEDDING_EVENTS } from '../constants';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Defined order: Proposal, Introduction, Civil Wedding, White Wedding, Traditional Wedding
  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Proposal', href: '#proposal' },
    { name: 'Introduction', href: '#introduction' },
    { name: 'Civil', href: '#civil' },
    { name: 'White', href: '#white' },
    { name: 'Traditional', href: '#traditional' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Gifts', href: '#registry' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-4 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="#hero"
          aria-label="Praise and Ezekiel, back to the top"
          className="text-2xl font-serif font-bold tracking-widest text-gray-800 shrink-0 rounded hover:text-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          P<span className="text-amber-500 mx-1">&</span>E
        </a>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex space-x-6 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] font-bold tracking-widest uppercase hover:text-amber-600 transition-colors text-gray-700 whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </div>
          {/* Kept outside the desktop-only list so it stays reachable on mobile */}
          <a
            href="#rsvp"
            className="shrink-0 bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full whitespace-nowrap hover:bg-amber-600 transition-colors shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            RSVP
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
