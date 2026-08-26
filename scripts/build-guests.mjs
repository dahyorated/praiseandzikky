// Turns guests.txt into guests.json, ready for Import JSON in the Firebase
// console at /guests.
//
//   node scripts/build-guests.mjs           dry run, reports problems only
//   node scripts/build-guests.mjs --json    also writes guests.json
//
// guests.txt is one full name per line. Blank lines and lines starting with #
// are ignored. Neither file is ever committed, this repo is public.

import { readFileSync, writeFileSync } from 'node:fs';
import { guestKey, normalise, tokenise } from '../lib/names.mjs';

const SOURCE = 'guests.txt';
const OUTPUT = 'guests.json';
const writeJson = process.argv.includes('--json');

let raw;
try {
  raw = readFileSync(SOURCE, 'utf8');
} catch {
  console.error(`Could not read ${SOURCE}.`);
  console.error('Create it with one full name per line, then run this again.');
  process.exit(1);
}

const names = raw
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

if (names.length === 0) {
  console.error(`${SOURCE} has no names in it.`);
  process.exit(1);
}

const guests = {};
const seenNames = new Map();
const duplicates = [];
const collisions = [];
const singleWord = [];
const unusable = [];

for (const name of names) {
  const tokens = tokenise(name);

  if (tokens.length === 0) {
    unusable.push(name);
    continue;
  }
  if (tokens.length === 1) {
    singleWord.push(name);
  }

  const normalised = normalise(name);
  if (seenNames.has(normalised)) {
    duplicates.push(name);
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

  guests[key] = { name };
}

const total = Object.keys(guests).length;

console.log(`Read ${names.length} lines from ${SOURCE}`);
console.log(`${total} guests will be written\n`);

const report = (label, items, note) => {
  if (items.length === 0) return;
  console.log(`${label} (${items.length})`);
  if (note) console.log(`  ${note}`);
  for (const item of items) console.log(`  - ${item}`);
  console.log('');
};

report('Repeated names, skipped', duplicates);
report('Key collisions, suffixed', collisions, 'Two different names normalise the same. Check these are really two people.');
report('Single word entries', singleWord, 'Matchable only by typing that exact word. A guest typing one word is asked for a full name, so these can never be found.');
report('Unusable, skipped', unusable, 'Nothing left after normalisation.');

if (writeJson) {
  writeFileSync(OUTPUT, `${JSON.stringify(guests, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT}`);
  console.log('Next: Firebase console, Realtime Database, the three dots menu, Import JSON, at /guests');
} else {
  console.log('Dry run. Nothing written. Pass --json to write guests.json');
}

if (singleWord.length > 0) {
  console.log('\nFix the single word entries before importing, they cannot be matched.');
}
