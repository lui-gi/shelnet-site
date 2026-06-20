// src/utils/resourceCounts.js
import { labs } from '../data/labs';

/**
 * Pure: derive display counts from a manifest object + local labs.
 * Returns { certs, pbqs, exams, viz, labs }. A count is null when its source
 * data is unavailable (unknown) — distinct from 0 (known to be empty).
 */
export function deriveCounts(manifest) {
  const certs = (manifest && manifest.certs) || null;
  if (!certs) {
    return { certs: null, pbqs: null, exams: null, viz: null, labs: labs.length };
  }
  const entries = Object.values(certs);
  const sumType = (t) => entries.reduce((n, c) => {
    const arr = c?.resources?.[t];
    return n + (Array.isArray(arr) ? arr.length : 0);
  }, 0);
  return {
    certs: Object.keys(certs).length,
    pbqs: sumType('pbqs'),
    exams: sumType('exams'),
    viz: Array.isArray(manifest.visualizations) ? manifest.visualizations.length : null,
    labs: labs.length,
  };
}
