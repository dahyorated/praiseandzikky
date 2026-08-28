// Turns guests.txt into guests.json, ready to upload to /guests.
//
//   npm run guests              dry run, reports problems only
//   npm run guests -- --json    writes guests.json, and pins any newly
//                               generated access code back into guests.txt
//
// One guest per line:
//
//   Dayo Adedayo +1 #PE111E     two extra guests allowed, fixed access code
//   Baroh Balogun +2            allowance only, a code will be generated
//   Bolu Balogun                neither
//
// Both suffixes are optional and order independent. Blank lines and lines
// starting with # are comments. Neither guests.txt nor guests.json is ever
// committed, this repo is public.

import { readFileSync, writeFileSync } from 'node:fs';
import {
  CODE_PREFIX,
  MAX_PLUS_ONES,
  generateCode,
  guestKey,
  normalise,
  parseGuestLine,
  tokenise,
} from '../lib/names.mjs';

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

const rawLines = raw.split('\n');

// A code at the start of a line would be swallowed as a comment and the guest
// would vanish silently. Refuse loudly instead.
const misplaced = [];
rawLines.forEach((line, index) => {
  const match = line.trim().match(new RegExp(`^#(${CODE_PREFIX}[0-9A-Z-]{2,})\\s+\\S`, 'i'));
  if (match) misplaced.push(`line ${index + 1}: ${line.trim()}`);
});

if (misplaced.length > 0) {
  console.error('A line starts with an access code, which reads as a comment.');
  console.error('Put the name first, then the code:  Dayo Adedayo +1 #PE111E\n');
  for (const item of misplaced) console.error(`  ${item}`);
  process.exit(1);
}

// Keep the original line index so codes can be pinned back in place later.
const entries = rawLines
  .map((line, index) => ({ index, text: line.trim() }))
  .filter(({ text }) => text && !text.startsWith('#'))
  .map(({ index, text }) => ({ index, text, ...parseGuestLine(text) }));

if (entries.length === 0) {
  console.error(`${SOURCE} has no names in it.`);
  process.exit(1);
}

const guests = {};
const keyByCode = new Map();
const seenNames = new Map();
const duplicates = [];
const duplicateCodes = [];
const collisions = [];
const singleWord = [];
const unusable = [];
const clampedList = [];
const assigned = [];
let totalSeats = 0;

// Hand written codes are claimed first, so a generated one can never take a
// code that someone has already written down.
for (const entry of entries) {
  if (!entry.code) continue;
  if (keyByCode.has(entry.code)) {
    duplicateCodes.push(`${entry.name} and ${keyByCode.get(entry.code)} both use #${entry.code}`);
    continue;
  }
  keyByCode.set(entry.code, entry.name);
}

if (duplicateCodes.length > 0) {
  console.error('Two guests share an access code, which makes check in meaningless.\n');
  for (const item of duplicateCodes) console.error(`  ${item}`);
  process.exit(1);
}

const takenCodes = new Set(keyByCode.keys());
const pinned = new Map();

for (const entry of entries) {
  const { name, plusOnes, requested, clamped, index } = entry;
  const tokens = tokenise(name);

  if (tokens.length === 0) {
    unusable.push(entry.text);
    continue;
  }
  if (tokens.length === 1) {
    singleWord.push(name);
  }
  if (clamped) {
    clampedList.push(`${name}  asked for +${requested}, capped at +${MAX_PLUS_ONES}`);
  }

  const normalised = normalise(name);
  if (seenNames.has(normalised)) {
    duplicates.push(entry.text);
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

  let code = entry.code;
  if (!code) {
    code = generateCode(key, takenCodes);
    takenCodes.add(code);
    assigned.push(`${name}  ->  #${code}`);
    pinned.set(index, `${entry.text} #${code}`);
  }

  guests[key] = { name, plusOnes, code };
  totalSeats += 1 + plusOnes;
}

const total = Object.keys(guests).length;
const withPlusOnes = Object.values(guests).filter((g) => g.plusOnes > 0).length;

console.log(`Read ${entries.length} guest lines from ${SOURCE}`);
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
report('Allowance capped', clampedList);
report(
  writeJson ? 'Access codes assigned and pinned into guests.txt' : 'Access codes that would be assigned',
  assigned,
  'Generated from the guest key, so they are stable. Once pinned they never change.'
);
report('Single word entries', singleWord, 'Matchable only by typing that exact word. A guest typing one word is asked for a full name, so these can never be found.');
report('Unusable, skipped', unusable, 'Nothing left after normalisation.');

if (writeJson) {
  writeFileSync(OUTPUT, `${JSON.stringify(guests, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT}`);

  if (pinned.size > 0) {
    // Rewrite in place so comments, blank lines and ordering all survive.
    const updated = rawLines.map((line, index) => pinned.get(index) ?? line);
    // Normalise the trailing newline, so appending a guest later cannot glue
    // the new line onto the last one.
    const text = updated.join('\n').replace(/\n*$/, '\n');
    writeFileSync(SOURCE, text);
    console.log(`Pinned ${pinned.size} new access ${pinned.size === 1 ? 'code' : 'codes'} into ${SOURCE}`);
  }

  console.log('Next: npm run guests:upload');
} else {
  console.log('Dry run. Nothing written. Pass --json to write guests.json');
}

if (singleWord.length > 0) {
  console.log('\nFix the single word entries before uploading, they cannot be matched.');
}
