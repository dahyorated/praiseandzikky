
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { submitRsvps, newPartyId, WHATSAPP_LINK } from '../services/rsvpService';
import CountryCodeSelect, { DEFAULT_COUNTRY, type Country } from './CountryCodeSelect';
import type { RsvpSubmission } from '../types';

type Status = 'form' | 'sending' | 'done';

interface PartyMember {
  id: number;
  firstName: string;
  lastName: string;
  attending: boolean | null;
}

const MAX_ADDITIONAL_GUESTS = 4;
const REDIRECT_SECONDS = 4;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The disc is clipped at the horizon so it emerges rather than slides in. The
// clip id is generated per instance, since the card and the overlay both use it.
const RisingSun: React.FC<{ className?: string }> = ({ className = 'w-48 h-28 mx-auto' }) => {
  const clipId = `rsvp-horizon-${useId().replace(/:/g, '')}`;

  return (
    <svg viewBox="0 0 120 70" className={className} role="img" aria-label="A sun rising over the horizon">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="120" height="52" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g className="rsvp-rays" stroke="#C9A961" strokeWidth="1.4" strokeLinecap="round">
          <line x1="60" y1="30" x2="60" y2="20" />
          <line x1="74.1" y1="35.1" x2="80.6" y2="27.5" />
          <line x1="45.9" y1="35.1" x2="39.4" y2="27.5" />
          <line x1="80.7" y1="44.5" x2="90.1" y2="41.1" />
          <line x1="39.3" y1="44.5" x2="29.9" y2="41.1" />
        </g>
        <circle className="rsvp-sun-disc" cx="60" cy="52" r="18" fill="#E3C079" />
      </g>
      <line x1="10" y1="52" x2="110" y2="52" stroke="#C9A961" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};

const Rsvp: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [party, setParty] = useState<PartyMember[]>([]);
  // Honeypot. Hidden from real guests, so anything in it came from a bot.
  const [website, setWebsite] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('form');
  const [sendFailed, setSendFailed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  // Focus targets, keyed by the same strings the errors are keyed by.
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const confirmationRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const nextMemberId = useRef(1);

  const phoneLabelId = useId();

  useEffect(() => {
    if (status === 'done' && !showOverlay) {
      confirmationRef.current?.focus({ preventScroll: true });
    }
  }, [status, showOverlay]);

  const finishAndScrollUp = useCallback(() => {
    setShowOverlay(false);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, []);

  // Tick the visible counter down, then hand the page back to the guest.
  useEffect(() => {
    if (!showOverlay) return;

    overlayRef.current?.focus({ preventScroll: true });

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const done = window.setTimeout(finishAndScrollUp, REDIRECT_SECONDS * 1000);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finishAndScrollUp();
    };
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showOverlay, finishAndScrollUp]);

  const addMember = () => {
    if (party.length >= MAX_ADDITIONAL_GUESTS) return;
    const id = nextMemberId.current++;
    setParty((current) => [...current, { id, firstName: '', lastName: '', attending: null }]);
    // Wait for the row to mount before sending focus into it.
    requestAnimationFrame(() => {
      fieldRefs.current[`guest-${id}-firstName`]?.focus({ preventScroll: true });
    });
  };

  const removeMember = (id: number) => {
    setParty((current) => current.filter((m) => m.id !== id));
    setErrors((current) => {
      const next = { ...current };
      delete next[`guest-${id}-firstName`];
      delete next[`guest-${id}-lastName`];
      delete next[`guest-${id}-attending`];
      return next;
    });
  };

  const updateMember = (id: number, patch: Partial<PartyMember>) => {
    setParty((current) => current.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {};

    if (!firstName.trim()) found.firstName = 'Enter your first name.';
    if (!lastName.trim()) found.lastName = 'Enter your last name.';

    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      found.phone = 'Add a phone number we can reach you on.';
    } else if (digits.replace(/^0+/, '').length < 6) {
      found.phone = 'That phone number looks too short.';
    }

    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      found.email = 'That email looks incomplete. Or leave it blank.';
    }

    if (attending === null) found.attending = 'Let us know whether you can make it.';

    party.forEach((member) => {
      if (!member.firstName.trim()) found[`guest-${member.id}-firstName`] = 'Enter their first name.';
      if (!member.lastName.trim()) found[`guest-${member.id}-lastName`] = 'Enter their last name.';
      if (member.attending === null) found[`guest-${member.id}-attending`] = 'Let us know if they can make it.';
    });

    return found;
  };

  // Errors are reported in the order the fields appear on screen.
  const focusOrder = () => [
    'firstName',
    'lastName',
    'phone',
    'email',
    'attending',
    ...party.flatMap((m) => [`guest-${m.id}-firstName`, `guest-${m.id}-lastName`, `guest-${m.id}-attending`]),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate();
    setErrors(found);

    const firstBad = focusOrder().find((key) => found[key]);
    if (firstBad) {
      fieldRefs.current[firstBad]?.focus({ preventScroll: true });
      return;
    }

    // Bots get a convincing thank you and nothing is written.
    if (website.trim()) {
      setStatus('done');
      return;
    }

    // A local number typed as 0801... would otherwise become +2340801...
    const nationalNumber = phone.replace(/\D/g, '').replace(/^0+/, '');

    const contactPhone = `${country.dial}${nationalNumber}`;
    const contactEmail = email.trim();
    const submittedBy = `${firstName.trim()} ${lastName.trim()}`;
    const shared = {
      partyId: newPartyId(),
      partySize: 1 + party.length,
      submittedBy,
      submittedAt: new Date().toISOString(),
    };

    // One record per person. Everyone in the party carries the contact details
    // of whoever filled the form in, so every row is reachable on its own.
    const entries: RsvpSubmission[] = [
      {
        ...shared,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: submittedBy,
        phone: contactPhone,
        email: contactEmail,
        attending: attending as boolean,
        isPrimary: true,
      },
      ...party.map((m) => ({
        ...shared,
        firstName: m.firstName.trim(),
        lastName: m.lastName.trim(),
        name: `${m.firstName.trim()} ${m.lastName.trim()}`,
        phone: contactPhone,
        email: contactEmail,
        attending: m.attending as boolean,
        isPrimary: false,
      })),
    ];

    setSendFailed(false);
    setStatus('sending');

    try {
      await submitRsvps(entries);
      setSecondsLeft(REDIRECT_SECONDS);
      setStatus('done');
      setShowOverlay(true);
    } catch {
      setSendFailed(true);
      setStatus('form');
    }
  };

  const totalAttending =
    (attending ? 1 : 0) + party.filter((m) => m.attending === true).length;

  const inputClasses = (hasError: boolean) =>
    `w-full bg-white border rounded-2xl px-5 py-4 text-gray-800 font-light placeholder:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
      hasError ? 'border-red-400' : 'border-amber-200 hover:border-amber-300'
    }`;

  const labelClasses = 'text-[10px] uppercase tracking-widest font-bold text-amber-600 block mb-2';
  const errorClasses = 'text-red-600 text-sm mt-2 font-light';

  // The radio itself is visually hidden, so the card carries the focus ring.
  const choiceClasses = (selected: boolean) =>
    `flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all text-left focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
      selected
        ? 'border-amber-500 bg-amber-50 shadow-md'
        : 'border-amber-100 bg-white hover:border-amber-300 hover:bg-amber-50/40'
    }`;

  const pillClasses = (selected: boolean) =>
    `flex-1 text-center px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer transition-all focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
      selected ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-amber-50'
    }`;

  const setRef = (key: string) => (el: HTMLElement | null) => {
    fieldRefs.current[key] = el;
  };

  return (
    <section id="rsvp" className="py-24 bg-gradient-to-b from-white to-amber-50/40 scroll-mt-20">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <div className="mb-12 space-y-4">
          <span className="text-amber-600 font-cursive text-3xl">Kindly Respond</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900">Will you be there?</h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
          <p className="text-gray-500 leading-relaxed max-w-xl mx-auto pt-2">
            We are excited to have you celebrate with us. Let us know if you can make it.
          </p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-amber-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>

          {status === 'done' ? (
            <div
              ref={confirmationRef}
              tabIndex={-1}
              className="relative z-10 py-6 space-y-6 focus-visible:outline-none animate-in fade-in duration-500"
            >
              {totalAttending > 0 ? (
                <>
                  <RisingSun />

                  <h3 className="text-3xl md:text-4xl font-serif text-gray-900">
                    {totalAttending > 1 ? "You're all on the list" : "You're on the list"}
                  </h3>
                  <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
                    {totalAttending > 1
                      ? `We have got all ${totalAttending} of you down. See you soon, and please, come looking boogie.`
                      : 'See you soon. And please, come looking boogie.'}
                  </p>
                  <p className="font-cursive text-2xl text-amber-600 pt-2">#ALifetimeOfSunshine</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto text-amber-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <h3 className="text-3xl md:text-4xl font-serif text-gray-900">We will miss you</h3>
                  <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
                    Thank you for letting us know. You will be with us in spirit, and we hope to
                    celebrate with you soon.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="relative z-10 space-y-6 text-left max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rsvp-first-name" className={labelClasses}>First Name</label>
                  <input
                    id="rsvp-first-name"
                    ref={setRef('firstName')}
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    placeholder="Bola"
                    aria-invalid={Boolean(errors.firstName)}
                    className={inputClasses(Boolean(errors.firstName))}
                  />
                  <div role="alert">{errors.firstName && <p className={errorClasses}>{errors.firstName}</p>}</div>
                </div>

                <div>
                  <label htmlFor="rsvp-last-name" className={labelClasses}>Last Name</label>
                  <input
                    id="rsvp-last-name"
                    ref={setRef('lastName')}
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    placeholder="Tinubu"
                    aria-invalid={Boolean(errors.lastName)}
                    className={inputClasses(Boolean(errors.lastName))}
                  />
                  <div role="alert">{errors.lastName && <p className={errorClasses}>{errors.lastName}</p>}</div>
                </div>
              </div>

              <div>
                <label htmlFor="rsvp-phone" id={phoneLabelId} className={labelClasses}>Phone Number</label>
                <div className="flex items-stretch">
                  <CountryCodeSelect value={country} onChange={setCountry} labelledBy={phoneLabelId} />
                  <input
                    id="rsvp-phone"
                    ref={setRef('phone')}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel-national"
                    placeholder="801 234 5678"
                    aria-invalid={Boolean(errors.phone)}
                    className={`flex-1 min-w-0 bg-white border rounded-r-2xl px-5 py-4 text-gray-800 font-light placeholder:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                      errors.phone ? 'border-red-400' : 'border-amber-200 hover:border-amber-300'
                    }`}
                  />
                </div>
                <div role="alert">{errors.phone && <p className={errorClasses}>{errors.phone}</p>}</div>
              </div>

              <div>
                <label htmlFor="rsvp-email" className={labelClasses}>
                  Email <span className="text-gray-400 normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  id="rsvp-email"
                  ref={setRef('email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  className={inputClasses(Boolean(errors.email))}
                />
                <div role="alert">{errors.email && <p className={errorClasses}>{errors.email}</p>}</div>
              </div>

              <fieldset className="border-0 p-0 m-0">
                <legend className={labelClasses}>Will you be joining us?</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={choiceClasses(attending === true)}>
                    <input
                      ref={setRef('attending')}
                      type="radio"
                      name="rsvp-attending"
                      className="sr-only"
                      checked={attending === true}
                      onChange={() => setAttending(true)}
                    />
                    <span
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        attending === true ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-400'
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="font-serif text-lg text-gray-800">Yes, I will be there</span>
                  </label>

                  <label className={choiceClasses(attending === false)}>
                    <input
                      type="radio"
                      name="rsvp-attending"
                      className="sr-only"
                      checked={attending === false}
                      onChange={() => setAttending(false)}
                    />
                    <span
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        attending === false ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-400'
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </span>
                    <span className="font-serif text-lg text-gray-800">I won't be able to make it</span>
                  </label>
                </div>
                <div role="alert">{errors.attending && <p className={errorClasses}>{errors.attending}</p>}</div>
              </fieldset>

              {/* Additional guests, up to four, all sent with the one button below. */}
              <div className="pt-2 border-t border-amber-100 space-y-4">
                {party.map((member, index) => (
                  <div key={member.id} className="bg-amber-50/40 border border-amber-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600">
                        Guest {index + 2}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                      >
                        <span className="sr-only">
                          Remove {member.firstName.trim() || `guest ${index + 2}`}
                        </span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`rsvp-guest-${member.id}-first`} className="sr-only">
                          Guest {index + 2} first name
                        </label>
                        <input
                          id={`rsvp-guest-${member.id}-first`}
                          ref={setRef(`guest-${member.id}-firstName`)}
                          type="text"
                          value={member.firstName}
                          onChange={(e) => updateMember(member.id, { firstName: e.target.value })}
                          placeholder="First name"
                          aria-invalid={Boolean(errors[`guest-${member.id}-firstName`])}
                          className={inputClasses(Boolean(errors[`guest-${member.id}-firstName`]))}
                        />
                        <div role="alert">
                          {errors[`guest-${member.id}-firstName`] && (
                            <p className={errorClasses}>{errors[`guest-${member.id}-firstName`]}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`rsvp-guest-${member.id}-last`} className="sr-only">
                          Guest {index + 2} last name
                        </label>
                        <input
                          id={`rsvp-guest-${member.id}-last`}
                          ref={setRef(`guest-${member.id}-lastName`)}
                          type="text"
                          value={member.lastName}
                          onChange={(e) => updateMember(member.id, { lastName: e.target.value })}
                          placeholder="Last name"
                          aria-invalid={Boolean(errors[`guest-${member.id}-lastName`])}
                          className={inputClasses(Boolean(errors[`guest-${member.id}-lastName`]))}
                        />
                        <div role="alert">
                          {errors[`guest-${member.id}-lastName`] && (
                            <p className={errorClasses}>{errors[`guest-${member.id}-lastName`]}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <fieldset className="border-0 p-0 m-0">
                      <legend className="sr-only">Will guest {index + 2} be joining us?</legend>
                      <div className="flex gap-2 bg-amber-100/50 p-1 rounded-full">
                        <label className={pillClasses(member.attending === true)}>
                          <input
                            ref={setRef(`guest-${member.id}-attending`)}
                            type="radio"
                            name={`rsvp-guest-${member.id}-attending`}
                            className="sr-only"
                            checked={member.attending === true}
                            onChange={() => updateMember(member.id, { attending: true })}
                          />
                          Coming
                        </label>
                        <label className={pillClasses(member.attending === false)}>
                          <input
                            type="radio"
                            name={`rsvp-guest-${member.id}-attending`}
                            className="sr-only"
                            checked={member.attending === false}
                            onChange={() => updateMember(member.id, { attending: false })}
                          />
                          Can't make it
                        </label>
                      </div>
                      <div role="alert">
                        {errors[`guest-${member.id}-attending`] && (
                          <p className={errorClasses}>{errors[`guest-${member.id}-attending`]}</p>
                        )}
                      </div>
                    </fieldset>
                  </div>
                ))}

                {party.length < MAX_ADDITIONAL_GUESTS ? (
                  <button
                    type="button"
                    onClick={addMember}
                    className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-amber-200 text-amber-600 rounded-2xl py-4 hover:border-amber-400 hover:bg-amber-50/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0" aria-hidden="true">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {party.length === 0 ? 'Add someone else' : 'Add another guest'}
                    </span>
                  </button>
                ) : (
                  <p className="text-center text-sm text-gray-400 font-light py-2">
                    That is the maximum of {MAX_ADDITIONAL_GUESTS} extra guests. Message us if you
                    need to add more.
                  </p>
                )}
              </div>

              {/* Honeypot. Kept out of the tab order and hidden from assistive tech. */}
              <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                <label htmlFor="rsvp-website">Website</label>
                <input
                  id="rsvp-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="pt-2 text-center space-y-4">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber-500 text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-amber-600 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                >
                  {status === 'sending' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending
                    </>
                  ) : party.length > 0 ? (
                    `Send our RSVP (${party.length + 1})`
                  ) : (
                    'Send my RSVP'
                  )}
                </button>

                <div role="alert">
                  {sendFailed && (
                    <p className={errorClasses}>
                      That did not send. Check your connection and try again, or{' '}
                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded"
                      >
                        message us
                      </a>{' '}
                      and we will sort it out.
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={finishAndScrollUp}
        >
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-overlay-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-amber-100 p-10 text-center space-y-5 overflow-hidden focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200"></div>

            {totalAttending > 0 ? (
              <RisingSun className="w-40 h-24 mx-auto" />
            ) : (
              <svg className="w-12 h-12 mx-auto text-amber-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}

            <h3 id="rsvp-overlay-title" className="text-3xl font-serif text-gray-900">
              {totalAttending > 0 ? 'Thank you for RSVPing' : 'Thank you for letting us know'}
            </h3>

            <p className="text-gray-500 leading-relaxed">
              That means a lot to us. We are taking you back to the top, in case you fancy another
              look around our page.
            </p>

            <p className="sr-only">
              Returning you to the top of the page in {REDIRECT_SECONDS} seconds. Press Escape to go
              now.
            </p>

            <div className="flex flex-col items-center gap-3 pt-1">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 48 48" className="w-16 h-16" aria-hidden="true">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#FDE68A" strokeWidth="3" />
                  <circle
                    className="rsvp-countdown-ring"
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-xl font-serif text-gray-800 tabular-nums"
                  aria-hidden="true"
                >
                  {secondsLeft}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600">
                Back to the top
              </span>
            </div>

            <button
              type="button"
              onClick={finishAndScrollUp}
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Take me there now
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Rsvp;
