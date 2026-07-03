// src/utils/randomTarget.js
// Random discovery pool for the global `r` shortcut. Coin-flip across every
// bytes track and every wiki entry; returns a path to navigate to, or null
// when both manifests are still empty.
import { getBytesCerts } from './manifestService';

export function pickRandomTarget(manifest, wikiManifest) {
  const bytes = manifest ? getBytesCerts(manifest).map((b) => `/bytes/${b.slug}`) : [];
  const wiki = (wikiManifest?.entries || []).map((e) => `/wiki/${e.path}`);
  const pool = bytes.concat(wiki);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
