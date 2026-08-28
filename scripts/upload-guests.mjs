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
import { loadGuests, writeGuests } from '../lib/firebaseRest.mjs';

const replace = process.argv.includes('--replace');
const force = process.argv.includes('--force');

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

// An access code that has already been emailed must never move. Compare
// against what is live before writing anything.
try {
  const live = await loadGuests();
  const liveByKey = new Map(live.map((g) => [g.key, g]));
  const drift = [];

  for (const [key, entry] of Object.entries(guests)) {
    const existing = liveByKey.get(key);
    if (existing?.code && entry.code && existing.code !== entry.code) {
      drift.push(`${entry.name}: #${existing.code} would become #${entry.code}`);
    }
  }

  if (drift.length > 0 && !force) {
    console.error('This upload would change access codes that are already live.');
    console.error('Anyone already emailed one of these would arrive with the wrong code.\n');
    for (const item of drift) console.error(`  ${item}`);
    console.error('\nFix guests.txt to match, or pass --force if you really mean it.');
    process.exit(1);
  }

  if (drift.length > 0) {
    console.warn(`--force given, changing ${drift.length} live access ${drift.length === 1 ? 'code' : 'codes'}.`);
  }

  if (replace) {
    const removed = live.filter((g) => !guests[g.key]);
    if (removed.length > 0) {
      console.warn(`Replacing will remove ${removed.length} guest(s) no longer in guests.txt:`);
      for (const g of removed) console.warn(`  ${g.name}`);
    }
  }
} catch (error) {
  if (error?.exitCode !== undefined) throw error;
  console.error(`Could not read the current guest list: ${error.message}`);
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
