/**
 * Service for fetching and caching the resource manifest from shelnet-resources.
 *
 * Handles:
 * - Fetching manifest.json from external repository
 * - Local caching with TTL (time-to-live)
 * - Error handling and fallbacks
 * - Path construction for resources
 */

const MANIFEST_CACHE_KEY = 'shelnet_manifest_cache';
const MANIFEST_TIMESTAMP_KEY = 'shelnet_manifest_timestamp';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches the manifest from shelnet-resources repository.
 * Uses sessionStorage for caching to avoid repeated fetches during a session.
 *
 * @returns {Promise<Object>} Parsed manifest object
 * @throws {Error} If fetch fails or manifest is invalid
 */
export async function fetchManifest() {
  const baseUrl = import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';
  const manifestUrl = `${baseUrl}/manifest.json`;

  // Check cache first
  const cached = getCachedManifest();
  if (cached) {
    console.log('[ManifestService] Using cached manifest');
    return cached;
  }

  try {
    console.log('[ManifestService] Fetching manifest from:', manifestUrl);
    const response = await fetch(manifestUrl, {
      cache: 'no-cache', // Always check for updates
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const manifest = await response.json();

    // Validate manifest structure
    if (!manifest.resources) {
      throw new Error('Invalid manifest structure: missing "resources" key');
    }

    // Cache the manifest
    cacheManifest(manifest);

    return manifest;
  } catch (error) {
    console.error('[ManifestService] Failed to fetch manifest:', error);

    // Try to return stale cache as fallback
    const staleCache = getStaleCache();
    if (staleCache) {
      console.warn('[ManifestService] Using stale cache as fallback');
      return staleCache;
    }

    throw error;
  }
}

/**
 * Gets cached manifest if it exists and is not expired.
 * @returns {Object|null} Cached manifest or null
 */
function getCachedManifest() {
  try {
    const cached = sessionStorage.getItem(MANIFEST_CACHE_KEY);
    const timestamp = sessionStorage.getItem(MANIFEST_TIMESTAMP_KEY);

    if (!cached || !timestamp) {
      return null;
    }

    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_TTL_MS) {
      console.log('[ManifestService] Cache expired');
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('[ManifestService] Cache read error:', error);
    return null;
  }
}

/**
 * Gets stale cached manifest (ignoring TTL) for fallback purposes.
 * @returns {Object|null} Stale cached manifest or null
 */
function getStaleCache() {
  try {
    const cached = sessionStorage.getItem(MANIFEST_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Caches manifest in sessionStorage.
 * @param {Object} manifest - Manifest to cache
 */
function cacheManifest(manifest) {
  try {
    sessionStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
    sessionStorage.setItem(MANIFEST_TIMESTAMP_KEY, Date.now().toString());
    console.log('[ManifestService] Manifest cached');
  } catch (error) {
    console.error('[ManifestService] Cache write error:', error);
  }
}

/**
 * Clears the manifest cache.
 * Useful for forcing a refresh.
 */
export function clearManifestCache() {
  sessionStorage.removeItem(MANIFEST_CACHE_KEY);
  sessionStorage.removeItem(MANIFEST_TIMESTAMP_KEY);
  console.log('[ManifestService] Cache cleared');
}

/**
 * Transforms manifest resource entries to the format expected by components.
 * Adds the full `file` URL by constructing the path based on resource type.
 *
 * @param {Array} resources - Array of resource objects from manifest
 * @param {String} resourceType - Type of resource ('aPlusPBQs', 'securityPlusPBQs', 'aPlusExams', 'securityPlusExams')
 * @returns {Array} Transformed resources with full `file` URLs
 */
export function transformManifestResources(resources, resourceType) {
  const baseUrl = import.meta.env.VITE_RESOURCES_BASE_URL || 'https://lui-gi.github.io/shelnet-resources';

  // Map resource types to their URL paths
  const pathMap = {
    'aPlusPBQs': 'practice-pbqs/a-plus',
    'securityPlusPBQs': 'practice-pbqs/security-plus',
    'aPlusExams': 'practice-exams/a-plus',
    'securityPlusExams': 'practice-exams/security-plus'
  };

  const basePath = pathMap[resourceType];
  if (!basePath) {
    console.error(`[ManifestService] Unknown resource type: ${resourceType}`);
    return [];
  }

  return resources.map(resource => ({
    id: resource.id,
    title: resource.title,
    file: `${baseUrl}/${basePath}/${resource.filename}`,
    description: resource.description
  }));
}
