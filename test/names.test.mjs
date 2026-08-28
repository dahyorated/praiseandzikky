import test from 'node:test';
import assert from 'node:assert/strict';
import {
  guestKey,
  matchName,
  normalise,
  parseGuestLine,
  tokenise,
  wordScore,
  generateCode,
  derivePartyCode,
  MAX_PLUS_ONES,
} from '../lib/names.mjs';

const GUESTS = [
  'John Doe',
  'Praise Aboaba',
  'Chief Adebayo Ogunlesi',
  'Ngozi Okonkwo-Eze',
  'Tolulope Adeyemi',
  'John Smith',
  'Maryam Bello',
  'Sarah Doe',
].map((name) => ({ key: guestKey(name), name }));

// The baseline from the brief. These are the cases that must not regress when
// COVERAGE_MIN or ANCHOR_MIN are tuned against the real list.
const CASES = [
  ['John Doe', 'exact', 'John Doe'],
  ['Doe John', 'suggest', 'John Doe'],
  ['Doe Johnson', 'suggest', 'John Doe'],
  ['Jon Doe', 'suggest', 'John Doe'],
  ['John', 'single', null],
  ['Doe', 'single', null],
  ['Tolu Adeyemi', 'suggest', 'Tolulope Adeyemi'],
  ['Adeyemi Tolulope', 'suggest', 'Tolulope Adeyemi'],
  ['Ngozi Okonkwo Eze', 'exact', 'Ngozi Okonkwo-Eze'],
  ['Chief Ogunlesi Adebayo', 'suggest', 'Chief Adebayo Ogunlesi'],
  ['Mary Bello', 'suggest', 'Maryam Bello'],
  ['Praise Abaoba', 'suggest', 'Praise Aboaba'],
  ['Mrs Praise Aboaba', 'exact', 'Praise Aboaba'],
  ['Sara Doe', 'suggest', 'Sarah Doe'],
  ['Random Person', 'none', null],
];

for (const [input, expectedStatus, expectedName] of CASES) {
  test(`"${input}" -> ${expectedStatus}${expectedName ? ` (${expectedName})` : ''}`, () => {
    const result = matchName(input, GUESTS);
    assert.equal(result.status, expectedStatus, `status for "${input}"`);

    if (expectedStatus === 'exact') {
      assert.equal(result.guest.name, expectedName);
    }
    if (expectedStatus === 'suggest') {
      assert.equal(result.picks[0].name, expectedName, `top pick for "${input}"`);
      assert.ok(result.picks.length <= 2, 'never more than two picks');
    }
  });
}

test('reversed and duplicated word order share one key', () => {
  assert.equal(guestKey('John Doe'), guestKey('Doe John'));
  assert.equal(guestKey('Mrs Praise Aboaba'), guestKey('Praise Aboaba'));
});

test('accents, hyphens and punctuation normalise away', () => {
  assert.equal(normalise('Adéyemi-Olú'), 'adeyemi olu');
  assert.deepEqual(tokenise("Chief O'Brien"), ['o', 'brien']);
});

test('a name of only titles keeps its original tokens', () => {
  assert.deepEqual(tokenise('Chief Otunba'), ['chief', 'otunba']);
});

test('nothing is ever offered for an empty or unknown name', () => {
  assert.equal(matchName('', GUESTS).status, 'none');
  assert.equal(matchName('Zzz Qqq', GUESTS).status, 'none');
});

test('a trailing +N is read as a plus one allowance', () => {
  assert.deepEqual(
    { ...parseGuestLine('Baroh Balogun +2') },
    { name: 'Baroh Balogun', plusOnes: 2, requested: 2, clamped: false, code: '' }
  );
  assert.equal(parseGuestLine('Oyinlola Ganiyu +1').plusOnes, 1);
  assert.equal(parseGuestLine('Tight+2').plusOnes, 2);
  assert.equal(parseGuestLine('Chief Adebayo Ogunlesi  +3').plusOnes, 3);
});

test('no suffix means no extra guests', () => {
  assert.equal(parseGuestLine('Bolu Balogun').plusOnes, 0);
  assert.equal(parseGuestLine('Zero Allowance +0').plusOnes, 0);
});

test('the allowance suffix never reaches the name or the key', () => {
  assert.equal(parseGuestLine('Baroh Balogun +2').name, 'Baroh Balogun');
  // Adding an allowance to an existing line must not move that guest's key.
  assert.equal(
    guestKey(parseGuestLine('Baroh Balogun +2').name),
    guestKey('Baroh Balogun')
  );
});

test('an absurd allowance is capped and flagged', () => {
  const result = parseGuestLine('Silly Person +100');
  assert.equal(result.plusOnes, MAX_PLUS_ONES);
  assert.equal(result.requested, 100);
  assert.equal(result.clamped, true);
});

test('a line that is only a suffix is left alone rather than emptied', () => {
  assert.equal(parseGuestLine('+5').plusOnes, 0);
});

// A shared surname must not carry a mismatched first name. "Dami Adedayo" was
// being offered "Dayo Adedayo" because the perfect surname dragged the average
// over the coverage floor.
test('a matching surname does not rescue a different first name', () => {
  const list = [{ key: 'adedayo_dayo', name: 'Dayo Adedayo' }];
  assert.equal(matchName('Dami Adedayo', list).status, 'none');
  assert.equal(matchName('Tunde Adedayo', list).status, 'none');
  assert.equal(matchName('Bolu Adedayo', list).status, 'none');
});

test('genuine typos in a surname are still caught', () => {
  const list = [{ key: 'adedayo_dayo', name: 'Dayo Adedayo' }];
  assert.equal(matchName('Dayo Adedyao', list).picks[0].name, 'Dayo Adedayo');
  assert.equal(matchName('Dayo Adedayoo', list).picks[0].name, 'Dayo Adedayo');
});

test('a real guest always matches themselves exactly, before any suggestion', () => {
  const list = [
    { key: 'adedayo_dayo', name: 'Dayo Adedayo' },
    { key: 'adedayo_tayo', name: 'Tayo Adedayo' },
  ];
  assert.equal(matchName('Tayo Adedayo', list).status, 'exact');
  assert.equal(matchName('Dayo Adedayo', list).status, 'exact');
});

test('transpositions count as one mistake, not two', () => {
  // "Abaoba" for "Aboaba" is a single swap. Scoring it as two edits would drag
  // it under the per word floor and lose a very common kind of typo.
  assert.ok(wordScore('abaoba', 'aboaba') > 0.8);
  assert.ok(wordScore('dami', 'dayo') < 0.7);
});

test('an access code is read from the line, in either order', () => {
  assert.equal(parseGuestLine('Dayo Adedayo +1 #PE111E').code, 'PE111E');
  assert.equal(parseGuestLine('Dayo Adedayo #PE111E +1').code, 'PE111E');
  assert.equal(parseGuestLine('Dayo Adedayo #PE111E +1').plusOnes, 1);
  assert.equal(parseGuestLine('Bolu Balogun #pe204a').code, 'PE204A', 'codes normalise to upper case');
  assert.equal(parseGuestLine('Plain Name').code, '');
});

test('neither suffix leaks into the name or the key', () => {
  assert.equal(parseGuestLine('Dayo Adedayo +1 #PE111E').name, 'Dayo Adedayo');
  // Adding a code to an existing line must not move that guest's key, or an
  // RSVP already filed under it would be orphaned.
  assert.equal(
    guestKey(parseGuestLine('Dayo Adedayo +1 #PE111E').name),
    guestKey('Dayo Adedayo')
  );
});

test('generated codes are stable for the same guest', () => {
  assert.equal(generateCode('adedayo_dayo'), generateCode('adedayo_dayo'));
  assert.notEqual(generateCode('adedayo_dayo'), generateCode('balogun_bolu'));
});

test('generated codes avoid characters that get misread aloud', () => {
  const codes = Array.from({ length: 300 }, (_, i) => generateCode(`guest_${i}`));
  for (const code of codes) {
    assert.match(code, /^PE[2-9A-HJ-NP-Z]{4}$/, `${code} should avoid 0, O, 1, I and L`);
  }
});

test('a taken code is never handed out twice', () => {
  const first = generateCode('adedayo_dayo');
  const second = generateCode('adedayo_dayo', new Set([first]));
  assert.notEqual(second, first);
  const third = generateCode('adedayo_dayo', new Set([first, second]));
  assert.ok(third !== first && third !== second);
});

test('party codes hang off the invitee code and start at 2', () => {
  assert.equal(derivePartyCode('PETFKQ', 0), 'PETFKQ-2');
  assert.equal(derivePartyCode('PETFKQ', 1), 'PETFKQ-3');
  assert.equal(derivePartyCode('', 0), '', 'no invitee code means no derived code');
});
