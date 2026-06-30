// src/utils/wikiContent.js
// Fetches per-entry raw markdown, the graph JSON, and the MiniSearch index.
// Markdown is sessionStorage-cached per path (5-min TTL); graph and index are
// module-scope memoized for the session.
import { WIKI_BASE_URL } from '../config/wikiConfig';

const MD_TTL_MS = 5 * 60 * 1000;
let graphPromise = null;
let searchIndexPromise = null;

export async function fetchEntryMarkdown(path) {
  const key = `shelnet_wiki_md_${path}`;
  const tsKey = `${key}__ts`;
  try {
    const cached = sessionStorage.getItem(key);
    const ts = sessionStorage.getItem(tsKey);
    if (cached && ts && Date.now() - parseInt(ts, 10) <= MD_TTL_MS) return cached;
  } catch { /* sessionStorage unavailable */ }

  try {
    const res = await fetch(`${WIKI_BASE_URL}/content/${path}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try {
      sessionStorage.setItem(key, text);
      sessionStorage.setItem(tsKey, Date.now().toString());
    } catch { /* sessionStorage unavailable */ }
    return text;
  } catch (err) {
    const stale = sessionStorage.getItem(key);
    if (stale) { console.warn('[WikiContent] using stale md cache for', path); return stale; }
    throw err;
  }
}

export function fetchGraph() {
  if (!graphPromise) {
    graphPromise = fetch(`${WIKI_BASE_URL}/graph.json`).then((r) => {
      if (!r.ok) throw new Error(`graph fetch HTTP ${r.status}`);
      return r.json();
    });
  }
  return graphPromise;
}

export function fetchSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = (async () => {
      const [{ default: MiniSearch }, raw] = await Promise.all([
        import('minisearch'),
        fetch(`${WIKI_BASE_URL}/search-index.json`).then((r) => {
          if (!r.ok) throw new Error(`search-index fetch HTTP ${r.status}`);
          return r.text();
        }),
      ]);
      return MiniSearch.loadJSON(raw, {
        fields: ['title', 'body', 'tags', 'summary'],
        storeFields: ['slug', 'title', 'section', 'path', 'summary'],
      });
    })();
  }
  return searchIndexPromise;
}
