/**
 * Service for fetching and caching the resource manifest from shelnet-resources,
 * plus pure selectors that shape it for the UI.
 */

const MANIFEST_CACHE_KEY = 'shelnet_manifest_cache';
const MANIFEST_TIMESTAMP_KEY = 'shelnet_manifest_timestamp';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function resourceBaseUrl() {
  return import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';
}

export async function fetchManifest() {
  const manifestUrl = `${resourceBaseUrl()}/manifest.json`;

  const cached = getCachedManifest();
  if (cached) return cached;

  try {
    const response = await fetch(manifestUrl, {
      cache: 'no-cache',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const manifest = await response.json();
    if (!manifest.certs) throw new Error('Invalid manifest structure: missing "certs" key');

    cacheManifest(manifest);
    return manifest;
  } catch (error) {
    console.error('[ManifestService] Failed to fetch manifest:', error);
    const staleCache = getStaleCache();
    if (staleCache) {
      console.warn('[ManifestService] Using stale cache as fallback');
      return staleCache;
    }
    throw error;
  }
}

function getCachedManifest() {
  try {
    const cached = sessionStorage.getItem(MANIFEST_CACHE_KEY);
    const timestamp = sessionStorage.getItem(MANIFEST_TIMESTAMP_KEY);
    if (!cached || !timestamp) return null;
    if (Date.now() - parseInt(timestamp, 10) > CACHE_TTL_MS) return null;
    return JSON.parse(cached);
  } catch (error) {
    console.error('[ManifestService] Cache read error:', error);
    return null;
  }
}

function getStaleCache() {
  try {
    const cached = sessionStorage.getItem(MANIFEST_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function cacheManifest(manifest) {
  try {
    sessionStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
    sessionStorage.setItem(MANIFEST_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('[ManifestService] Cache write error:', error);
  }
}

// Per-resource-type display metadata for cert dashboards.
const TYPE_META = {
  pbqs: { label: 'pbqs/', prefix: 'PBQ_0' },
  exams: { label: 'exams/', prefix: 'EXAM_0' },
};

function toItem(base, segments, resource) {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    file: `${base}/${segments.join('/')}/${resource.filename}`,
  };
}

/** List of certs for the explorer + console (manifest key order). */
export function getCerts(manifest) {
  const certs = manifest?.certs || {};
  return Object.entries(certs).map(([slug, c]) => {
    const res = c.resources || {};
    const pbqs = Array.isArray(res.pbqs) ? res.pbqs : [];
    const exams = Array.isArray(res.exams) ? res.exams : [];
    return {
      slug,
      label: c.label,
      code: c.code,
      accent: c.accent || 'green',
      blurb: c.blurb || '',
      locked: !!c.locked,
      count: pbqs.length + exams.length,
      pbqTitles: pbqs.map((r) => r.title),
      examTitles: exams.map((r) => r.title),
    };
  });
}

/** One cert's grouped resources, or null if the slug is unknown. Empty types omitted. */
export function getCert(manifest, slug) {
  const cert = manifest?.certs?.[slug];
  if (!cert) return null;
  const base = resourceBaseUrl();
  const res = cert.resources || {};
  const groups = ['pbqs', 'exams']
    .filter((type) => Array.isArray(res[type]) && res[type].length > 0)
    .map((type) => ({
      type,
      label: TYPE_META[type].label,
      prefix: TYPE_META[type].prefix,
      items: res[type].map((r) => toItem(base, ['certs', slug, type], r)),
    }));
  return { slug, label: cert.label, code: cert.code, accent: cert.accent, groups };
}

/** Global visualizations as viewer items. */
export function getVisualizations(manifest) {
  const list = Array.isArray(manifest?.visualizations) ? manifest.visualizations : [];
  const base = resourceBaseUrl();
  return list.map((r) => toItem(base, ['visualizations'], r));
}
