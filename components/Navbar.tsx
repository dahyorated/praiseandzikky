
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
        <div className="text-2xl font-serif font-bold tracking-widest text-gray-800 shrink-0">
          P<span className="text-amber-500 mx-1">&</span>E
        </div>
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
      </div>
    </nav>
  );
};

export default Navbar;
