// src/components/room/stages/index.js
// Maps a module's stageKind to its lab-stage component. A new mechanic (e.g. a
// `console` panel or a packet-capture viewer) is a new component registered
// here; the Room engine does not change.
import ShellStage from './ShellStage';
import SearchStage from './SearchStage';
import EditorStage from './EditorStage';

export const STAGES = {
  shell: ShellStage,
  search: SearchStage,
  editor: EditorStage,
};

/** The stage component for a kind, or null if unknown. */
export function stageFor(kind) {
  return STAGES[kind] || null;
}
