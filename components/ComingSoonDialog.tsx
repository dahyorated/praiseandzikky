
import React, { useEffect, useRef, useId } from 'react';

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

// Shown wherever photos are not ready yet, in place of a gallery. Used by the
// pre-wedding section and by any event still waiting on its pictures.
const ComingSoonDialog: React.FC<ComingSoonDialogProps> = ({ isOpen, onClose, title, message }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Held in a ref so an inline onClose from the parent cannot restart the effect
  // and bounce focus around on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-amber-100 p-10 text-center space-y-5 overflow-hidden focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>

        <svg className="w-12 h-12 mx-auto text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h1.5l1-2h6l1 2H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <circle cx="12" cy="13" r="3.25" />
        </svg>

        <h3 id={titleId} className="text-3xl font-serif text-gray-900">
          {title}
        </h3>

        <p className="text-gray-500 leading-relaxed">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center bg-amber-500 text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default ComingSoonDialog;
