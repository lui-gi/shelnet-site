import { useState, useEffect } from 'react';
import { fetchBank } from './bytesService';

/**
 * Fetches one cert's bytes question bank on mount (and when slug changes).
 * @returns {{ bank: object|null, loading: boolean, error: string|null }}
 */
export function useBytesBank(slug) {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchBank(slug)
      .then((b) => { if (alive) { setBank(b); setLoading(false); setError(null); } })
      .catch((err) => { if (alive) { setError(err.message || 'Failed to load questions'); setLoading(false); } });
    return () => { alive = false; };
  }, [slug]);

  return { bank, loading, error };
}
