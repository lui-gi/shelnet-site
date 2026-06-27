// src/components/room/stages/index.js
// Maps a module's stageKind to its lab-stage component. A new mechanic (e.g. a
// `console` panel or a packet-capture viewer) is a new component registered
// here; the Room engine does not change.
import ShellStage from './ShellStage';
import SearchStage from './SearchStage';

export const STAGES = {
  shell: ShellStage,
  search: SearchStage,
};

/** The stage component for a kind, or null if unknown. */
export function stageFor(kind) {
  return STAGES[kind] || null;
}
