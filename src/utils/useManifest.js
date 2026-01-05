import { useState, useEffect } from 'react';
import { fetchManifest, transformManifestResources } from './manifestService';

/**
 * Custom React hook for loading and managing manifest resources.
 *
 * Handles:
 * - Fetching manifest on mount
 * - Loading states
 * - Error handling
 * - Resource transformation
 *
 * @param {String} resourceType - Type of resource to load ('aPlusPBQs', 'securityPlusPBQs', etc.)
 * @returns {Object} { resources, loading, error }
 */
export function useManifest(resourceType) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadResources() {
      try {
        setLoading(true);
        setError(null);

        const manifest = await fetchManifest();

        // Get resources for this specific type
        const rawResources = manifest.resources[resourceType] || [];

        // Transform to component format
        const transformedResources = transformManifestResources(rawResources, resourceType);

        if (isMounted) {
          setResources(transformedResources);
          setLoading(false);
        }
      } catch (err) {
        console.error(`[useManifest] Failed to load ${resourceType}:`, err);
        if (isMounted) {
          setError(err.message || 'Failed to load resources');
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      isMounted = false;
    };
  }, [resourceType]);

  return { resources, loading, error };
}
