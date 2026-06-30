// src/utils/useWikiManifest.js
// React hook wrapping fetchWikiManifest. Mirrors useManifest.js shape.
import { useEffect, useState } from 'react';
import { fetchWikiManifest } from './wikiService';

export function useWikiManifest() {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchWikiManifest()
      .then((m) => { if (!cancelled) { setManifest(m); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { manifest, loading, error };
}
