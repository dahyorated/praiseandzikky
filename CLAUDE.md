# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding website for Praise & Ezekiel built with React 19, TypeScript, and Vite. Deployed as a static site on Azure Static Web Apps.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://0.0.0.0:3000)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build
```

## Architecture

### Component Structure
- **App.tsx**: Main layout with hero section, countdown timer, event sections, gallery, registry, and footer
- **components/EventSection.tsx**: Individual event display with collapsible image gallery
- **components/Gallery.tsx**: Masonry photo gallery with lightbox modal
- **components/Registry.tsx**: Bank details with copy-to-clipboard functionality
- **components/Navbar.tsx**: Fixed navigation with glass morphism effect on scroll

### Data Layer
- **constants.tsx**: All wedding event data, gallery images, and bank details
- **types.ts**: TypeScript interfaces (WeddingEvent, GalleryImage)

### Styling
- Tailwind CSS via CDN
- Google Fonts: Playfair Display (headings), Montserrat (body), Dancing Script (accents)
- Amber/gold color scheme (#d4af37, #f9f295)
- Custom classes in index.html: `.font-serif`, `.font-cursive`, `.gold-gradient`, `.glass-nav`

## Key Patterns

- Path alias: `@/*` maps to project root
- Images hosted on Azure Blob Storage (sgaiservices.blob.core.windows.net)
- Countdown timer updates daily at midnight using setTimeout
- Escape key closes lightbox modals
- Scroll events trigger navbar styling changes

## Deployment

Azure Static Web Apps with CI/CD configured in `.github/workflows/azure-static-web-apps-thankful-stone-05a7a3003.yml`
