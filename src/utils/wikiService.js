// src/utils/wikiService.js
// Fetches and caches the wiki manifest from shelnet-wiki (5-min sessionStorage
// cache, stale-on-error fallback). Pure selectors over the manifest shape.
import { WIKI_BASE_URL } from '../config/wikiConfig';

const CACHE_KEY = 'shelnet_wiki_manifest_cache';
const TS_KEY = 'shelnet_wiki_manifest_timestamp';
const TTL_MS = 5 * 60 * 1000;

export async function fetchWikiManifest() {
  const fresh = getCached();
  if (fresh) return fresh;
  try {
    const res = await fetch(`${WIKI_BASE_URL}/manifest.json`, {
      cache: 'no-cache',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const m = await res.json();
    if (!Array.isArray(m.entries)) throw new Error('invalid manifest: missing entries[]');
    cacheManifest(m);
    return m;
  } catch (err) {
    console.error('[WikiService] manifest fetch failed:', err);
    const stale = getStale();
    if (stale) { console.warn('[WikiService] using stale cache'); return stale; }
    throw err;
  }
}

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const ts = sessionStorage.getItem(TS_KEY);
    if (!raw || !ts) return null;
    if (Date.now() - parseInt(ts, 10) > TTL_MS) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function getStale() {
  try { const raw = sessionStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function cacheManifest(m) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(m));
    sessionStorage.setItem(TS_KEY, Date.now().toString());
  } catch (err) { console.error('[WikiService] cache write failed:', err); }
}

// --- selectors ---
export const getEntryBySlug = (m, slug) =>
  m?.entries?.find((e) => e.slug === slug) || null;

export const getEntryByPath = (m, path) =>
  m?.entries?.find((e) => e.path === path) || null;

export const getEntriesBySection = (m, section) =>
  (m?.entries || []).filter((e) => e.section === section);

export const getEntriesUnderPath = (m, path) => {
  const prefix = `${path}/`;
  return (m?.entries || []).filter((e) => e.path.startsWith(prefix));
};

export const getRecent = (m, n = 10) =>
  (m?.recent || []).slice(0, n).map((slug) => getEntryBySlug(m, slug)).filter(Boolean);

export const getSuggested = (m) =>
  (m?.suggested || []).map((slug) => getEntryBySlug(m, slug)).filter(Boolean);

export const getMostRecentInSection = (m, section, n = 3) =>
  (m?.entries || [])
    .filter((e) => e.section === section)
    .slice()
    .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))
    .slice(0, n);

export const getLastEditedDate = (m) => {
  const entries = m?.entries || [];
  if (entries.length === 0) return '';
  let max = entries[0].updated || '';
  for (const e of entries) if ((e.updated || '') > max) max = e.updated;
  return max;
};

export const getTagCounts = (m) => {
  const counts = new Map();
  for (const e of m?.entries || []) {
    for (const t of e.tags || []) {
      const k = t.toLowerCase();
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  }
  return counts;
};

export const getTopTags = (m, n = 12) => {
  const arr = Array.from(getTagCounts(m).entries()).map(([tag, count]) => ({ tag, count }));
  arr.sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
  return arr.slice(0, n);
};
