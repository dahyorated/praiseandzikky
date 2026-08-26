// Uploads guests.json straight to /guests, using the same service account the
// API uses.
//
//   npm run guests:upload             merge, adds and updates, removes nothing
//   npm run guests:upload -- --replace  swap the whole node
//
// Safer than the console Import JSON, which replaces whichever node you happen
// to be viewing. Imported at the root, that wipes /rsvps too. This can only
// ever address /guests.

import { readFileSync } from 'node:fs';
import { writeGuests } from '../lib/firebaseRest.mjs';

const replace = process.argv.includes('--replace');

if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_DATABASE_URL) {
  console.error('Missing credentials.');
  console.error('');
  console.error('Create .env.local in the project root with:');
  console.error('  FIREBASE_SERVICE_ACCOUNT=<the base64 blob>');
  console.error('  FIREBASE_DATABASE_URL=<your database url>');
  console.error('');
  console.error('Same two values you put in Vercel. .env.local is gitignored.');
  process.exit(1);
}

let guests;
try {
  guests = JSON.parse(readFileSync('guests.json', 'utf8'));
} catch {
  console.error('Could not read guests.json.');
  console.error('Run `npm run guests -- --json` first.');
  process.exit(1);
}

const count = Object.keys(guests).length;
if (count === 0) {
  console.error('guests.json is empty. Refusing to upload.');
  process.exit(1);
}

const names = Object.values(guests).map((g) => g?.name);
if (names.some((name) => typeof name !== 'string' || !name.trim())) {
  console.error('Every entry needs a name. Rebuild with `npm run guests -- --json`.');
  process.exit(1);
}

console.log(`${replace ? 'Replacing' : 'Merging'} ${count} guests at /guests`);

try {
  await writeGuests(guests, { replace });
  console.log('Done. /rsvps was not touched.');
  console.log('Allow up to 5 minutes for the API cache to pick up new names.');
} catch (error) {
  console.error(`Upload failed: ${error.message}`);
  console.error('Check FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL in .env.local');
  process.exit(1);
}
