// src/utils/useResourceCounts.js
import { useEffect, useState } from 'react';
import { fetchManifest } from './manifestService';
import { deriveCounts } from './resourceCounts';
import { labs } from '../data/labs';

/** Loads the manifest and returns derived counts; degrades to null counts on failure. */
export function useResourceCounts() {
  const [counts, setCounts] = useState({ pbqs: null, exams: null, viz: null, labs: labs.length });
  useEffect(() => {
    let alive = true;
    fetchManifest()
      .then((m) => { if (alive) setCounts(deriveCounts(m)); })
      .catch(() => { /* keep null counts + local labs */ });
    return () => { alive = false; };
  }, []);
  return counts;
}
