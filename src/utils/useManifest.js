import { useState, useEffect } from 'react';
import { fetchManifest } from './manifestService';

/**
 * Fetches the manifest once on mount.
 * @returns {{ manifest: object|null, loading: boolean, error: string|null }}
 */
export function useManifest() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchManifest()
      .then((m) => { if (alive) { setManifest(m); setLoading(false); } })
      .catch((err) => { if (alive) { setError(err.message || 'Failed to load resources'); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  return { manifest, loading, error };
}
