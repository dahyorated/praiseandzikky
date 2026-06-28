# RSVP Feature Plan

## Context
The wedding site needs an RSVP page at `/rsvp` where guests can look themselves up by name/phone, confirm their identity via fuzzy matching, and RSVP. After RSVP, a barcode/QR code is generated and sent to the guest's email as their event access pass. Uses the existing Firebase Realtime Database at `https://praizandzikky-default-rtdb.europe-west1.firebasedatabase.app/`.

## What Changes

### 1. Install Dependencies
```bash
npm install react-router-dom firebase qrcode emailjs-com
npm install -D @types/qrcode
```
- `react-router-dom` — client-side routing for `/rsvp`
- `firebase` — Realtime Database access
- `qrcode` — generate QR code image (contains guest RSVP ID for event check-in)
- `emailjs-com` — send email from the client side (no backend needed). Free tier: 200 emails/month.

### 2. Firebase Setup — `lib/firebase.ts` (new)
- Initialize Firebase with config from `import.meta.env.VITE_FIREBASE_*` env vars
- Export the database instance
- Create `.env.local` with Firebase config (API key, app ID, etc. from Firebase Console)
- Database URL: `https://praizandzikky-default-rtdb.europe-west1.firebasedatabase.app`

### 3. Firebase Data Model
**`/guests` node** (pre-populated by you in Firebase Console):
```json
{ "guest_001": { "firstName": "Adebayo", "lastName": "Ogundimu", "phoneNumber": "08012345678" } }
```

**`/rsvps` node** (written by the app on RSVP):
```json
{
  "guest_001": {
    "guestName": "Adebayo Ogundimu",
    "email": "adebayo@example.com",
    "rsvpStatus": "attending",
    "rsvpCode": "PZ-2027-A1B2C3",
    "timestamp": 1719590400000
  }
}
```

Security rules: `/guests` read-only from client, `/rsvps` write-only per guest key.

### 4. Add Routing — Modify `index.tsx`, `App.tsx`
- Wrap app in `BrowserRouter` in `index.tsx`
- Extract current App.tsx content into `components/HomePage.tsx`
- Convert `App.tsx` to a layout shell: `<Navbar />` + `<Routes>` with `/` → HomePage, `/rsvp` → RsvpPage
- Clean up the import map in `index.html` (remove unused `@google/genai`)

### 5. Update Navbar — Modify `components/Navbar.tsx`
- Add "RSVP" link (styled as a CTA button)
- Use `useLocation()` to show hash links only on home page
- On `/rsvp` page: show only Home + RSVP links

### 6. Fuzzy Matching — `lib/fuzzyMatch.ts` (new)
- Custom Levenshtein distance (~20 lines, no library needed)
- Handles: partial name matches, swapped first/last names, phone number partial match
- Scoring: name similarity (0.7 weight) + phone match bonus (0.3 weight)
- Threshold: score >= 0.55 returns a match, otherwise no match

### 7. Guest Service — `services/guestService.ts` (new)
- `fetchGuests()` — reads all guests from Firebase `/guests` node
- `submitRsvp()` — writes to Firebase `/rsvps/{guestId}` including email and generated rsvpCode

### 8. QR Code & Email — `services/rsvpMailService.ts` (new)
**QR Code Generation:**
- Generate a unique RSVP code per guest: `PZ-2027-{random6chars}`
- Use `qrcode` library to create a QR code image (as data URL) containing: `{ code: "PZ-2027-A1B2C3", guest: "Adebayo Ogundimu", event: "Praise & Ezekiel Wedding 2027" }`
- The QR code serves as the guest's digital access pass for event check-in

**Email Delivery (EmailJS):**
- Set up an EmailJS account (free: 200 emails/month)
- Create an email template with:
  - Guest name
  - RSVP confirmation details
  - QR code barcode image (inline or as attachment link)
  - Event summary info
- `sendRsvpEmail(guestName, email, qrCodeDataUrl, rsvpCode)` — sends the confirmation email via EmailJS
- EmailJS config stored in env vars: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`

### 9. RSVP Page — `components/rsvp/` (new directory)
Flow as a state machine with 5 steps:

| Step | Component | What happens |
|------|-----------|-------------|
| **lookup** | `RsvpLookupForm` | User enters first name, last name, phone number, **email**. Fuzzy match runs. |
| **confirm** | `RsvpConfirmation` | Shows matched name: "Is this you?" Yes/No. |
| **respond** | `RsvpResponse` | "Will you be joining us?" Attending / Can't make it. |
| **thankyou** | `RsvpThankYou` | Sweet message + "Your access barcode has been sent to your email!" |
| **not_found** | `RsvpNotFound` | "We couldn't find you" + try again button. |

**Updated lookup form fields:**
- First Name (required)
- Last Name (required)
- Phone Number (required)
- Email Address (required) — for receiving the barcode

**Thank you message (attending):**
> "Thank you for choosing to celebrate with us! We can't wait to see your beautiful face. Your personalised access barcode has been sent to your email — please keep it safe for the big day. Details about Aso-ebi and event access will be shared with you in the coming weeks. With love, Praise & Ezekiel"

**After RSVP "attending" flow:**
1. Generate unique RSVP code
2. Generate QR code image from the code
3. Save RSVP to Firebase (including email and rsvpCode)
4. Send email with QR code via EmailJS
5. Show thank-you screen

### 10. Types — Modify `types.ts`
Add `Guest` and `RsvpSubmission` interfaces:
```typescript
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RsvpSubmission {
  guestName: string;
  email: string;
  rsvpStatus: 'attending' | 'not_attending';
  rsvpCode: string;
  timestamp: number;
}
```

### 11. SPA Fallback — `staticwebapp.config.json` (new)
Ensures direct navigation to `/rsvp` serves `index.html` on Azure Static Web Apps.

## Files Summary
| Action | File |
|--------|------|
| New | `lib/firebase.ts`, `lib/fuzzyMatch.ts` |
| New | `services/guestService.ts`, `services/rsvpMailService.ts` |
| New | `components/HomePage.tsx` |
| New | `components/rsvp/RsvpPage.tsx`, `RsvpLookupForm.tsx`, `RsvpConfirmation.tsx`, `RsvpResponse.tsx`, `RsvpThankYou.tsx`, `RsvpNotFound.tsx` |
| New | `.env.local`, `staticwebapp.config.json` |
| Modify | `index.tsx`, `App.tsx`, `components/Navbar.tsx`, `types.ts` |
| Cleanup | `vite.config.ts` (remove dead Gemini vars), `index.html` (clean import map) |

## External Setup Required
1. **Firebase Console**: Set security rules for `/guests` (read-only) and `/rsvps` (write-only)
2. **Firebase Console**: Pre-populate `/guests` node with guest data
3. **EmailJS**: Create account at emailjs.com, set up email service + template
4. **Azure**: Add `VITE_FIREBASE_*` and `VITE_EMAILJS_*` env vars to Static Web Apps config
5. **`.env.local`**: Populate with Firebase + EmailJS credentials

## Verification
1. Run `npm run dev` and check `/` still works identically
2. Navigate to `/rsvp` — form should render with all 4 fields
3. Add a test guest in Firebase Console, enter their name → confirm fuzzy match works
4. Complete RSVP → verify record appears in Firebase `/rsvps` node with email and rsvpCode
5. Check email received with QR code barcode
6. Test edge cases: swapped names, partial names, wrong phone, no match
7. Run `npm run build` to verify production build succeeds
