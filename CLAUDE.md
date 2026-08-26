# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding website for Praise & Ezekiel built with React 19, TypeScript, and Vite. Deployed as a static site on Vercel at praizandzikky.info.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://0.0.0.0:3000)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build
```

## Architecture

### Component Structure
- **App.tsx**: Main layout with hero section, countdown timer, event sections, gallery, RSVP, registry, and footer
- **components/EventSection.tsx**: Individual event display with collapsible image gallery
- **components/Gallery.tsx**: Photos are not ready yet, so this shows a "not quite yet" dialog. The masonry grid and lightbox were removed and the GALLERY data is still in constants.tsx for when they land
- **components/Rsvp.tsx**: RSVP form, up to 4 extra guests, thank you overlay with a countdown, then scrolls to the top
- **components/CountryCodeSelect.tsx**: Dial code listbox, defaults to +234, keyboard navigable with typeahead
- **components/Registry.tsx**: Bank details with copy-to-clipboard functionality
- **components/Navbar.tsx**: Fixed navigation with glass morphism effect on scroll

### Data Layer
- **constants.tsx**: All wedding event data, gallery images, and bank details
- **types.ts**: TypeScript interfaces (WeddingEvent, GalleryImage, MatchResponse, RsvpRequest, RsvpResponse)
- **services/rsvpService.ts**: Thin client for the two serverless endpoints. The browser never touches the database

#### Guest list and RSVP API
The guest list must never reach a browser, so matching runs server-side.

- **lib/names.mjs**: Normalisation, key generation and fuzzy matching. Imported by both the API and the upload script so keys can never drift. Changing normalisation invalidates every stored key and forces a re-import
- **lib/firebaseRest.mjs**: Service account JWT flow, then RTDB over REST. Bypasses database rules, which is why the rules can deny every client read and write. Caches the guest list for 5 minutes, so a freshly imported name can take that long to go live
- **lib/rsvpToken.mjs**: HMAC token issued by /api/match, required by /api/rsvp. Stops anyone posting an RSVP for a name they only guessed
- **lib/rateLimit.mjs**: Per instance sliding window. A speed bump, not a guarantee
- **api/match.js**: POST { name }, returns exact, suggest, single or none. At most one suggestion, never a count
- **api/rsvp.js**: POST with token, writes one record per person keyed on the guest key, so a second attempt returns `already` instead of duplicating
- **scripts/build-guests.mjs**: guests.txt to guests.json, dry run by default. Import the result at /guests in the Firebase console
- **test/names.test.mjs**: The regression baseline. Run before tuning COVERAGE_MIN or ANCHOR_MIN

Additional guests are vouched for by the named invitee and are not checked
against the list themselves.

`npm run dev` does not serve /api. Use `npm run dev:api` for that.

## Styling
- Tailwind CSS via CDN
- Google Fonts: Playfair Display (headings), Montserrat (body), Dancing Script (accents)
- Amber/gold color scheme (#d4af37, #f9f295)
- Custom classes in index.html: `.font-serif`, `.font-cursive`, `.gold-gradient`, `.glass-nav`

## Key Patterns

- Path alias: `@/*` maps to project root
- Images hosted on Azure Blob Storage (sgaiservices.blob.core.windows.net)
- Countdown timer updates daily at midnight using setTimeout
- Escape key closes modal dialogs, which also lock body scroll and return focus to their trigger
- Scroll events trigger navbar styling changes
- Animations live in the `index.html` style block, prefixed `rsvp-`, and are all disabled under `prefers-reduced-motion`

## Environment

Three variables, set in the Vercel dashboard and in .env.local for local API
work. See .env.example. Never commit real values, this repo is public.

Database rules deny all client access to both /guests and /rsvps. Only the
service account and the Firebase console can read or write them.

## Deployment

Vercel, building from `main` on push. There is no workflow file in this repo. The old Azure Static Web Apps workflow was deleted because it had been failing on every push since June, and the site has not been hosted there.
