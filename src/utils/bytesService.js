/**
 * Fetch + cache a cert's bytes question bank from shelnet-resources, plus a
 * shuffle helper for the endless quiz queue. Mirrors manifestService's
 * fetch + sessionStorage cache + stale-fallback pattern, keyed per cert slug.
 */

const CACHE_PREFIX = 'shelnet_bytes_cache_';
const TS_PREFIX = 'shelnet_bytes_ts_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function resourceBaseUrl() {
  return import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';
}

/** Fetch one cert's question bank. Returns { cert, version, questions }. */
export async function fetchBank(slug) {
  const url = `${resourceBaseUrl()}/bytes/${slug}.json`;

  const cached = getCached(slug);
  if (cached) return cached;

  try {
    const response = await fetch(url, { cache: 'no-cache', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const bank = await response.json();
    if (!Array.isArray(bank.questions)) throw new Error('Invalid bank: missing "questions" array');
    cacheBank(slug, bank);
    return bank;
  } catch (error) {
    console.error(`[BytesService] Failed to fetch bank "${slug}":`, error);
    const stale = getStale(slug);
    if (stale) {
      console.warn('[BytesService] Using stale cache as fallback');
      return stale;
    }
    throw error;
  }
}

function getCached(slug) {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + slug);
    const ts = sessionStorage.getItem(TS_PREFIX + slug);
    if (!cached || !ts) return null;
    if (Date.now() - parseInt(ts, 10) > CACHE_TTL_MS) return null;
    return JSON.parse(cached);
  } catch (error) {
    console.error('[BytesService] Cache read error:', error);
    return null;
  }
}

function getStale(slug) {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + slug);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function cacheBank(slug, bank) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + slug, JSON.stringify(bank));
    sessionStorage.setItem(TS_PREFIX + slug, Date.now().toString());
  } catch (error) {
    console.error('[BytesService] Cache write error:', error);
  }
}

/** Fisher-Yates shuffle returning a new array (input is not mutated). */
export function shuffle(items) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
