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
- **types.ts**: TypeScript interfaces (WeddingEvent, GalleryImage, RsvpSubmission)
- **services/rsvpService.ts**: Writes RSVPs to the existing Firebase Realtime Database over REST, no SDK. One record per person, sent as a single atomic PATCH so a party lands whole. Access is governed entirely by the database rules, which allow create-only writes and no reads

### Styling
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

## Deployment

Vercel, building from `main` on push. There is no workflow file in this repo. The old Azure Static Web Apps workflow was deleted because it had been failing on every push since June, and the site has not been hosted there.
