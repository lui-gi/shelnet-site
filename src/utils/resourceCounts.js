// src/utils/resourceCounts.js
import { labs } from '../data/labs';

/**
 * Pure: derive display counts from a manifest object + local labs.
 * Returns { pbqs, exams, viz, labs }. A count is null when its source
 * data is unavailable (unknown) — distinct from 0 (known to be empty).
 */
export function deriveCounts(manifest) {
  const r = (manifest && manifest.resources) || null;
  if (!r) {
    return { pbqs: null, exams: null, viz: null, labs: labs.length };
  }
  const count = (...keys) => {
    const arrs = keys.map((k) => r[k]).filter(Array.isArray);
    return arrs.length ? arrs.reduce((n, a) => n + a.length, 0) : null;
  };
  return {
    pbqs: count('aPlusPBQs', 'securityPlusPBQs'),
    exams: count('aPlusExams', 'securityPlusExams'),
    viz: count('visualizations'),
    labs: labs.length,
  };
}
