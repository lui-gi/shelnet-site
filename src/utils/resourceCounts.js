// src/utils/resourceCounts.js
import { labs } from '../data/labs';

/**
 * Pure: derive display counts from a manifest object + local labs.
 * Returns { pbqs, exams, viz, labs } where each is a number or null (unknown).
 */
export function deriveCounts(manifest) {
  const r = (manifest && manifest.resources) || null;
  const len = (key) => (r && Array.isArray(r[key]) ? r[key].length : 0);
  if (!r) {
    return { pbqs: null, exams: null, viz: null, labs: labs.length };
  }
  return {
    pbqs: len('aPlusPBQs') + len('securityPlusPBQs'),
    exams: len('aPlusExams') + len('securityPlusExams'),
    viz: len('visualizations'),
    labs: labs.length,
  };
}
