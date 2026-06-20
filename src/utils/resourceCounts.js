// src/utils/resourceCounts.js
import { labs } from '../data/labs';

/**
 * Pure: derive display counts from a manifest object + local labs.
 * Returns { pbqs, exams, viz, labs, children }. A count is null when its source
 * data is unavailable (unknown) — distinct from 0 (known to be empty).
 */
export function deriveCounts(manifest) {
  const r = (manifest && manifest.resources) || null;
  if (!r) {
    return { pbqs: null, exams: null, viz: null, labs: labs.length, children: {} };
  }
  const len = (k) => (Array.isArray(r[k]) ? r[k].length : null);
  const count = (...keys) => {
    const arrs = keys.map((k) => r[k]).filter(Array.isArray);
    return arrs.length ? arrs.reduce((n, a) => n + a.length, 0) : null;
  };
  return {
    pbqs: count('aPlusPBQs', 'securityPlusPBQs'),
    exams: count('aPlusExams', 'securityPlusExams'),
    viz: count('visualizations'),
    labs: labs.length,
    // Per-subdirectory counts for the explorer's child-count peek, keyed by the
    // child item's route. Sourced from the same single cached manifest fetch.
    children: {
      '/a-plus-pbqs':        len('aPlusPBQs'),
      '/security-plus-pbqs': len('securityPlusPBQs'),
      '/a-plus-exams':       len('aPlusExams'),
      '/security-plus-exams':len('securityPlusExams'),
    },
  };
}
