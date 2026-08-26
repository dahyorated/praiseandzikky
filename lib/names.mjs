// Name normalisation and fuzzy matching, shared by the upload script and the
// match API so a key generated at upload time always matches at lookup time.
//
// If you change normalisation, every stored key shifts and the guest list has
// to be rebuilt and re-imported. Nothing here is safe to tweak in isolation.

// Both conditions must hold before a name is offered as a suggestion. The
// coverage floor alone would offer "John Doe" to "John Smith", the anchor is
// what stops it.
export const COVERAGE_MIN = 0.62;
export const ANCHOR_MIN = 0.82;
// Every input word must clear this on its own. Without it a perfect surname
// carries a weak first name, and "Dami Adedayo" gets offered "Dayo Adedayo".
export const WORST_MIN = 0.7;
// A second pick is only shown when it is this close to the first.
export const RUNNER_UP_WITHIN = 0.04;

// A sane ceiling, so a typo like "+100" cannot generate a monstrous form.
export const MAX_PLUS_ONES = 10;

/**
 * Splits a guests.txt line into a name and a plus one allowance.
 * "Baroh Balogun +2" becomes { name: 'Baroh Balogun', plusOnes: 2 }.
 * A line with no suffix means no extra guests.
 */
export function parseGuestLine(line) {
  const raw = String(line ?? '').trim();
  const match = raw.match(/^(.*?)\s*\+\s*(\d+)\s*$/);

  if (!match || !match[1].trim()) {
    return { name: raw, plusOnes: 0, requested: 0, clamped: false };
  }

  const requested = Number(match[2]);
  const plusOnes = Math.min(requested, MAX_PLUS_ONES);
  return {
    name: match[1].trim(),
    plusOnes,
    requested,
    clamped: requested > MAX_PLUS_ONES,
  };
}

const TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'engr', 'chief', 'sir', 'lady',
  'pastor', 'pst', 'rev', 'reverend', 'alhaji', 'alhaja', 'otunba', 'barr',
  'arc', 'hon', 'elder', 'deacon', 'deaconess', 'mama', 'papa', 'aunty',
  'uncle',
]);

export function normalise(raw) {
  return String(raw ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Titles are stripped from both sides so one never breaks a match. If stripping
// would leave nothing, the original tokens are kept.
export function tokenise(raw) {
  const tokens = normalise(raw).split(' ').filter(Boolean);
  const stripped = tokens.filter((t) => !TITLES.has(t));
  return stripped.length > 0 ? stripped : tokens;
}

// Sorted so "John Doe" and "Doe John" land on the same key.
export function guestKey(raw) {
  return [...tokenise(raw)].sort().join('_');
}

// Optimal string alignment, so a transposition costs one edit rather than two.
// Real typos are mostly swapped letters, and counting "Abaoba" for "Aboaba" as
// a single mistake separates genuine slips from genuinely different names.
function editDistance(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Three rows, because a transposition looks back two positions.
  let twoBack = null;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = new Array(b.length + 1);
    current[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], twoBack[j - 2] + 1);
      }
    }

    twoBack = previous;
    previous = current;
  }

  return previous[b.length];
}

// The prefix boost is what makes "Tolu" find "Tolulope", which matters more
// than anything else here for Yoruba names.
export function wordScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 3 && longer.startsWith(shorter)) return 0.93;

  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
}

// Greedy best pairing. Each input token claims its best unused guest token.
export function nameScore(inputTokens, guestTokens) {
  if (inputTokens.length === 0 || guestTokens.length === 0) {
    return { score: 0, best: 0, worst: 0 };
  }

  const claimed = new Array(guestTokens.length).fill(false);
  let total = 0;
  let best = 0;
  let worst = 1;

  for (const token of inputTokens) {
    let bestIndex = -1;
    let bestValue = 0;

    for (let i = 0; i < guestTokens.length; i++) {
      if (claimed[i]) continue;
      const value = wordScore(token, guestTokens[i]);
      if (value > bestValue) {
        bestValue = value;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) claimed[bestIndex] = true;
    total += bestValue;
    if (bestValue > best) best = bestValue;
    if (bestValue < worst) worst = bestValue;
  }

  return { score: total / Math.max(inputTokens.length, guestTokens.length), best, worst };
}

/**
 * @param {string} input          what the guest typed
 * @param {{key: string, name: string}[]} guests
 * @returns {{status: 'exact'|'suggest'|'single'|'none', guest?: object, picks?: object[]}}
 */
export function matchName(input, guests) {
  const inputTokens = tokenise(input);
  if (inputTokens.length === 0) return { status: 'none' };

  const typed = inputTokens.join(' ');

  // Identical tokens in the same order goes straight through. Reversed order
  // deliberately falls through to suggest, so the guest confirms and the record
  // is stored under the canonical spelling.
  for (const guest of guests) {
    if (tokenise(guest.name).join(' ') === typed) {
      return { status: 'exact', guest };
    }
  }

  // One word is never enough to guess from.
  if (inputTokens.length < 2) return { status: 'single' };

  const candidates = [];
  for (const guest of guests) {
    const { score, best, worst } = nameScore(inputTokens, tokenise(guest.name));
    if (score >= COVERAGE_MIN && best >= ANCHOR_MIN && worst >= WORST_MIN) {
      candidates.push({ guest, score });
    }
  }

  if (candidates.length === 0) return { status: 'none' };

  candidates.sort((a, b) => b.score - a.score);

  const picks = [candidates[0].guest];
  if (candidates[1] && candidates[0].score - candidates[1].score <= RUNNER_UP_WITHIN) {
    picks.push(candidates[1].guest);
  }

  return { status: 'suggest', picks };
}
