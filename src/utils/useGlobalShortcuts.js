// src/utils/useGlobalShortcuts.js
// Window-level keydown for the site-wide chord vocabulary rendered by BottomBar:
//   /   open command palette         (skipped on /wiki* — wiki-home owns `/`)
//   ?   open help / cheat sheet
//   r   random discovery jump
//   n   open changelog / news feed
//   g<x> vim-style leader — jump to a global destination or fire a chord action
// The handler ignores keystrokes while an editable field is focused and while
// any modifier is held, so browser shortcuts and typing are untouched.
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CHORD_MS = 800;

// `g<x>` navigation targets. Keep in sync with the help overlay's rendered map.
export const JUMP_MAP = {
  h: { path: '/',                        label: 'home'         },
  w: { path: '/wiki',                    label: 'wiki'         },
  r: { path: '/resources',               label: 'resources'    },
  m: { path: '/resources/modules',       label: 'modules'      },
  c: { path: '/resources/certs',         label: 'certs'        },
  b: { path: '/bytes',                   label: 'bytes'        },
  l: { path: '/resources/labs',          label: 'labs'         },
  v: { path: '/resources/visualizations', label: 'visualizations' },
  x: { path: '/connect',                 label: 'connect'      },
};

// `g<x>` action targets — chord second-halves that fire a callback instead of
// navigating. Kept separate from JUMP_MAP so the help overlay can render both
// with the same key-map ergonomics.
export const CHORD_ACTIONS = {
  n: { action: 'news', label: 'news' },
};

function isEditableTarget() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function useGlobalShortcuts({ onPalette, onHelp, onRandom, onNews, disabled }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const chordRef = useRef({ leader: null, timer: null });
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const clearChord = () => {
      if (chordRef.current.timer) window.clearTimeout(chordRef.current.timer);
      chordRef.current = { leader: null, timer: null };
    };

    const fireAction = (action) => {
      if (action === 'news') onNews?.();
    };

    const onKey = (e) => {
      if (disabled) return;
      if (isEditableTarget()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Resolve second half of a `g` chord.
      if (chordRef.current.leader === 'g') {
        const k = e.key.toLowerCase();
        const dest = JUMP_MAP[k];
        const act = CHORD_ACTIONS[k];
        clearChord();
        if (dest) { e.preventDefault(); navigate(dest.path); return; }
        if (act)  { e.preventDefault(); fireAction(act.action); return; }
        return;
      }

      if (e.key === 'Escape') { clearChord(); return; }

      if (e.key === '/') {
        // `/wiki*` owns `/` locally (focuses the inline search input).
        if (pathRef.current.startsWith('/wiki')) return;
        e.preventDefault();
        onPalette?.();
        return;
      }
      if (e.key === '?') { e.preventDefault(); onHelp?.(); return; }
      if (e.key === 'r' || e.key === 'R') {
        // Cert-file viewers use `↑↓/e/f/esc` but not `r`; still, skip when the
        // route ends in a slug we know binds arrow-heavy input so a stray key
        // doesn't rip the reader out of context.
        e.preventDefault();
        onRandom?.();
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        // `/bytes/<cert>` owns `n` locally (advance to next question).
        if (/^\/bytes\/[^/]+/.test(pathRef.current)) return;
        e.preventDefault();
        onNews?.();
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        chordRef.current.leader = 'g';
        chordRef.current.timer = window.setTimeout(clearChord, CHORD_MS);
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (chordRef.current.timer) window.clearTimeout(chordRef.current.timer);
    };
  }, [disabled, navigate, onPalette, onHelp, onRandom, onNews]);
}
