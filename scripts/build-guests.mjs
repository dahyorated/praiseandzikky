// Turns guests.txt into guests.json, ready to upload to /guests.
//
//   npm run guests              dry run, reports problems only
//   npm run guests -- --json    also writes guests.json
//
// One guest per line. Add a plus one allowance with a trailing +N:
//
//   Baroh Balogun +2            may bring two extra guests
//   Bolu Balogun                may not bring anyone
//
// Blank lines and lines starting with # are ignored. Neither guests.txt nor
// guests.json is ever committed, this repo is public.

import { readFileSync, writeFileSync } from 'node:fs';
import { guestKey, normalise, parseGuestLine, tokenise, MAX_PLUS_ONES } from '../lib/names.mjs';

const SOURCE = 'guests.txt';
const OUTPUT = 'guests.json';
const writeJson = process.argv.includes('--json');

let raw;
try {
  raw = readFileSync(SOURCE, 'utf8');
} catch {
  console.error(`Could not read ${SOURCE}.`);
  console.error('Create it with one guest per line, then run this again.');
  process.exit(1);
}

const lines = raw
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

if (lines.length === 0) {
  console.error(`${SOURCE} has no names in it.`);
  process.exit(1);
}

const guests = {};
const seenNames = new Map();
const duplicates = [];
const collisions = [];
const singleWord = [];
const unusable = [];
const clamped = [];
let totalSeats = 0;

for (const line of lines) {
  const { name, plusOnes, requested, clamped: wasClamped } = parseGuestLine(line);
  const tokens = tokenise(name);

  if (tokens.length === 0) {
    unusable.push(line);
    continue;
  }
  if (tokens.length === 1) {
    singleWord.push(name);
  }
  if (wasClamped) {
    clamped.push(`${name}  asked for +${requested}, capped at +${MAX_PLUS_ONES}`);
  }

  const normalised = normalise(name);
  if (seenNames.has(normalised)) {
    duplicates.push(line);
    continue;
  }
  seenNames.set(normalised, name);

  // Different people can normalise to the same key. Suffix rather than
  // silently dropping one of them.
  let key = guestKey(name);
  if (guests[key]) {
    const original = key;
    let n = 2;
    while (guests[`${original}_${n}`]) n++;
    key = `${original}_${n}`;
    collisions.push(`${name}  ->  ${key}`);
  }

  guests[key] = { name, plusOnes };
  totalSeats += 1 + plusOnes;
}

const total = Object.keys(guests).length;
const withPlusOnes = Object.values(guests).filter((g) => g.plusOnes > 0).length;

console.log(`Read ${lines.length} lines from ${SOURCE}`);
console.log(`${total} guests, ${withPlusOnes} of them with a plus one allowance`);
console.log(`${totalSeats} seats if everyone comes and brings their full allowance\n`);

const report = (label, items, note) => {
  if (items.length === 0) return;
  console.log(`${label} (${items.length})`);
  if (note) console.log(`  ${note}`);
  for (const item of items) console.log(`  - ${item}`);
  console.log('');
};

report('Repeated names, skipped', duplicates);
report('Key collisions, suffixed', collisions, 'Two different names normalise the same. Check these are really two people.');
report('Allowance capped', clamped);
report('Single word entries', singleWord, 'Matchable only by typing that exact word. A guest typing one word is asked for a full name, so these can never be found.');
report('Unusable, skipped', unusable, 'Nothing left after normalisation.');

if (writeJson) {
  writeFileSync(OUTPUT, `${JSON.stringify(guests, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT}`);
  console.log('Next: npm run guests:upload');
} else {
  console.log('Dry run. Nothing written. Pass --json to write guests.json');
}

if (singleWord.length > 0) {
  console.log('\nFix the single word entries before uploading, they cannot be matched.');
}
