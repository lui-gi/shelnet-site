// src/utils/useResourceCounts.js
import { useEffect, useState } from 'react';
import { fetchManifest } from './manifestService';
import { deriveCounts } from './resourceCounts';

/** Loads the manifest and returns derived counts; degrades to null counts on failure. */
export function useResourceCounts() {
  const [counts, setCounts] = useState(() => deriveCounts(null));
  useEffect(() => {
    let alive = true;
    fetchManifest()
      .then((m) => { if (alive) setCounts(deriveCounts(m)); })
      .catch(() => { /* keep null counts + local labs */ });
    return () => { alive = false; };
  }, []);
  return counts;
}
