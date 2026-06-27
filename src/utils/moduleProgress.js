// src/utils/moduleProgress.js
// Local-only progress for the interactive module rooms. One localStorage key
// holds a map of slug -> { status, section, total, updatedAt }. No accounts, no
// backend. A pure selector derives completion counts for the hero / tree, and a
// hook exposes them while preserving the null-vs-zero convention (null = the
// store has not been read yet / unknown, distinct from 0 = known none complete).
import { useEffect, useState } from 'react';
import { getLiveModules } from '../config/moduleRegistry';

export const MODULE_PROGRESS_KEY = 'shelnet_modules_progress';

/** Read the whole progress map (synchronously). Returns {} on any failure. */
export function loadStore() {
  try {
    const raw = localStorage.getItem(MODULE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(MODULE_PROGRESS_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota / private-mode failures */
  }
}

/** One module's progress entry, or undefined. Accepts a preloaded store. */
export function getModuleProgress(slug, store = loadStore()) {
  return store[slug];
}

/**
 * Persist a module's progress and return the updated store. `section` is the
 * index of the active section; `total` is the room's section count (so `list`
 * can show a resume fraction without loading the room). `status` is
 * 'in-progress' | 'complete'.
 */
export function setModuleProgress(slug, { status, section, total }) {
  const store = loadStore();
  const prev = store[slug] || {};
  const next = {
    ...store,
    [slug]: {
      status,
      section: section ?? prev.section ?? 0,
      total: total ?? prev.total,
      updatedAt: Date.now(),
    },
  };
  writeStore(next);
  return next;
}

/**
 * Pure: completion counts over a module list + a progress store. Denominator is
 * live rooms only (so it reflects actually completable content and grows as
 * rooms ship); `soon` stubs are not in the denominator. Returns
 * { complete, total }. `complete` is null when `store` is null (not yet read).
 */
export function moduleProgressCounts(modules, store) {
  const live = modules.filter((m) => m.status === 'live');
  const total = live.length;
  if (store == null) return { complete: null, total };
  const complete = live.reduce(
    (n, m) => n + (store[m.slug]?.status === 'complete' ? 1 : 0),
    0,
  );
  return { complete, total };
}

/**
 * Live-room completion counts for the hero / tree. Starts null (unknown) and
 * reads the store after mount, mirroring useResourceCounts so the null-vs-zero
 * distinction survives. `bump` lets a caller force a re-read after writing.
 */
export function useModuleCounts(bump = 0) {
  const [store, setStore] = useState(null);
  // Deferred (async) read so the count starts null (unknown) before resolving to
  // a number, mirroring useResourceCounts and keeping setState out of the
  // synchronous effect body.
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => { if (alive) setStore(loadStore()); });
    return () => { alive = false; };
  }, [bump]);
  return moduleProgressCounts(getLiveModules(), store);
}
