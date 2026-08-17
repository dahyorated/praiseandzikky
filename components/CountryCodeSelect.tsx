
import React, { useState, useRef, useEffect, useId } from 'react';

export interface Country {
  iso: string;
  name: string;
  dial: string;
  flag: string;
}

// Pinned to the top. Nigeria first because that is where most guests are,
// then the places the rest of the family is spread across.
export const POPULAR_COUNTRIES: Country[] = [
  { iso: 'NG', name: 'Nigeria', dial: '+234', flag: '\u{1F1F3}\u{1F1EC}' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '\u{1F1EC}\u{1F1E7}' },
  { iso: 'IE', name: 'Ireland', dial: '+353', flag: '\u{1F1EE}\u{1F1EA}' },
  { iso: 'CA', name: 'Canada', dial: '+1', flag: '\u{1F1E8}\u{1F1E6}' },
];

export const OTHER_COUNTRIES: Country[] = [
  { iso: 'US', name: 'United States', dial: '+1', flag: '\u{1F1FA}\u{1F1F8}' },
  { iso: 'AU', name: 'Australia', dial: '+61', flag: '\u{1F1E6}\u{1F1FA}' },
  { iso: 'AT', name: 'Austria', dial: '+43', flag: '\u{1F1E6}\u{1F1F9}' },
  { iso: 'BE', name: 'Belgium', dial: '+32', flag: '\u{1F1E7}\u{1F1EA}' },
  { iso: 'BJ', name: 'Benin', dial: '+229', flag: '\u{1F1E7}\u{1F1EF}' },
  { iso: 'BR', name: 'Brazil', dial: '+55', flag: '\u{1F1E7}\u{1F1F7}' },
  { iso: 'CM', name: 'Cameroon', dial: '+237', flag: '\u{1F1E8}\u{1F1F2}' },
  { iso: 'CN', name: 'China', dial: '+86', flag: '\u{1F1E8}\u{1F1F3}' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '\u{1F1E8}\u{1F1EE}' },
  { iso: 'DK', name: 'Denmark', dial: '+45', flag: '\u{1F1E9}\u{1F1F0}' },
  { iso: 'EG', name: 'Egypt', dial: '+20', flag: '\u{1F1EA}\u{1F1EC}' },
  { iso: 'FR', name: 'France', dial: '+33', flag: '\u{1F1EB}\u{1F1F7}' },
  { iso: 'DE', name: 'Germany', dial: '+49', flag: '\u{1F1E9}\u{1F1EA}' },
  { iso: 'GH', name: 'Ghana', dial: '+233', flag: '\u{1F1EC}\u{1F1ED}' },
  { iso: 'IN', name: 'India', dial: '+91', flag: '\u{1F1EE}\u{1F1F3}' },
  { iso: 'IT', name: 'Italy', dial: '+39', flag: '\u{1F1EE}\u{1F1F9}' },
  { iso: 'JP', name: 'Japan', dial: '+81', flag: '\u{1F1EF}\u{1F1F5}' },
  { iso: 'KE', name: 'Kenya', dial: '+254', flag: '\u{1F1F0}\u{1F1EA}' },
  { iso: 'MT', name: 'Malta', dial: '+356', flag: '\u{1F1F2}\u{1F1F9}' },
  { iso: 'NL', name: 'Netherlands', dial: '+31', flag: '\u{1F1F3}\u{1F1F1}' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64', flag: '\u{1F1F3}\u{1F1FF}' },
  { iso: 'NO', name: 'Norway', dial: '+47', flag: '\u{1F1F3}\u{1F1F4}' },
  { iso: 'PL', name: 'Poland', dial: '+48', flag: '\u{1F1F5}\u{1F1F1}' },
  { iso: 'PT', name: 'Portugal', dial: '+351', flag: '\u{1F1F5}\u{1F1F9}' },
  { iso: 'QA', name: 'Qatar', dial: '+974', flag: '\u{1F1F6}\u{1F1E6}' },
  { iso: 'RW', name: 'Rwanda', dial: '+250', flag: '\u{1F1F7}\u{1F1FC}' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '\u{1F1F8}\u{1F1E6}' },
  { iso: 'SN', name: 'Senegal', dial: '+221', flag: '\u{1F1F8}\u{1F1F3}' },
  { iso: 'ZA', name: 'South Africa', dial: '+27', flag: '\u{1F1FF}\u{1F1E6}' },
  { iso: 'ES', name: 'Spain', dial: '+34', flag: '\u{1F1EA}\u{1F1F8}' },
  { iso: 'SE', name: 'Sweden', dial: '+46', flag: '\u{1F1F8}\u{1F1EA}' },
  { iso: 'CH', name: 'Switzerland', dial: '+41', flag: '\u{1F1E8}\u{1F1ED}' },
  { iso: 'TZ', name: 'Tanzania', dial: '+255', flag: '\u{1F1F9}\u{1F1FF}' },
  { iso: 'TG', name: 'Togo', dial: '+228', flag: '\u{1F1F9}\u{1F1EC}' },
  { iso: 'UG', name: 'Uganda', dial: '+256', flag: '\u{1F1FA}\u{1F1EC}' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '\u{1F1E6}\u{1F1EA}' },
  { iso: 'ZM', name: 'Zambia', dial: '+260', flag: '\u{1F1FF}\u{1F1F2}' },
  { iso: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '\u{1F1FF}\u{1F1FC}' },
];

export const ALL_COUNTRIES: Country[] = [...POPULAR_COUNTRIES, ...OTHER_COUNTRIES];
export const DEFAULT_COUNTRY: Country = POPULAR_COUNTRIES[0];

interface CountryCodeSelectProps {
  value: Country;
  onChange: (country: Country) => void;
  labelledBy: string;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, labelledBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: '', timer: 0 });

  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const open = () => {
    const current = ALL_COUNTRIES.findIndex((c) => c.iso === value.iso);
    setActiveIndex(current === -1 ? 0 : current);
    setIsOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) {
      buttonRef.current?.focus({ preventScroll: true });
    }
  };

  const select = (index: number) => {
    onChange(ALL_COUNTRIES[index]);
    close(true);
  };

  // Focus the list when it opens so the arrow keys have somewhere to land.
  useEffect(() => {
    if (isOpen) {
      listRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (!isOpen) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const jumpToLetter = (char: string) => {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.buffer += char.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.buffer = '';
    }, 600);

    const match = ALL_COUNTRIES.findIndex((c) =>
      c.name.toLowerCase().startsWith(typeahead.current.buffer)
    );
    if (match !== -1) {
      setActiveIndex(match);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, ALL_COUNTRIES.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(ALL_COUNTRIES.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        select(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
      default:
        if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
          jumpToLetter(e.key);
        }
    }
  };

  const renderOption = (country: Country, index: number) => (
    <li
      key={country.iso}
      id={optionId(index)}
      role="option"
      aria-selected={country.iso === value.iso}
      onClick={() => select(index)}
      onMouseEnter={() => setActiveIndex(index)}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
        index === activeIndex ? 'bg-amber-50' : ''
      } ${country.iso === value.iso ? 'font-semibold text-amber-700' : 'text-gray-700'}`}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {country.flag}
      </span>
      <span className="flex-1 text-sm truncate">{country.name}</span>
      <span className="text-sm text-gray-400 tabular-nums">{country.dial}</span>
    </li>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? close(false) : open())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelledBy}
        className="h-full flex items-center gap-2 pl-4 pr-3 py-4 rounded-l-2xl border border-r-0 border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:z-10"
      >
        <span className="text-lg leading-none" aria-hidden="true">
          {value.flag}
        </span>
        <span className="text-gray-700 font-light tabular-nums">{value.dial}</span>
        <span className="sr-only">{value.name}, change country code</span>
        <svg
          className={`w-3 h-3 text-amber-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelledBy}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={handleListKeyDown}
          className="absolute z-30 left-0 mt-2 w-72 max-w-[calc(100vw-4rem)] max-h-72 overflow-y-auto bg-white border border-amber-200 rounded-2xl shadow-2xl py-2 focus-visible:outline-none"
        >
          <li role="presentation" className="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest font-bold text-amber-600">
            Closest to us
          </li>
          {POPULAR_COUNTRIES.map((country, i) => renderOption(country, i))}

          <li role="presentation" className="px-4 pt-3 pb-2 mt-1 border-t border-amber-100 text-[10px] uppercase tracking-widest font-bold text-amber-600">
            Everywhere else
          </li>
          {OTHER_COUNTRIES.map((country, i) => renderOption(country, POPULAR_COUNTRIES.length + i))}
        </ul>
      )}
    </div>
  );
};

export default CountryCodeSelect;
