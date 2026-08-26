// Sliding window counter held in module scope. This is per warm instance and
// not shared between them, so it is a speed bump against scripted lookups
// rather than a guarantee. Do not rely on it as the only defence.

const windows = new Map();

export function allow(key, limit, windowMs) {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((at) => at > now - windowMs);

  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }

  hits.push(now);
  windows.set(key, hits);

  // Stop the map growing without bound on a long lived instance.
  if (windows.size > 5000) {
    for (const [k, v] of windows) {
      if (v.every((at) => at <= now - windowMs)) windows.delete(k);
    }
  }

  return true;
}

export function callerIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return 'unknown';
}
