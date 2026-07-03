// src/utils/useGlobalShortcuts.js
// Window-level keydown for the site-wide bare-key shortcuts rendered by
// BottomBar:
//   /   open command palette         (skipped on /wiki* — wiki-home owns `/`)
//   ?   open help / cheat sheet
//   r   random discovery jump
//   n   open changelog / news feed   (skipped on /bytes/<cert> — quiz owns `n`)
// The handler ignores keystrokes while an editable field is focused and while
// any modifier is held, so browser shortcuts and typing are untouched.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function isEditableTarget() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function useGlobalShortcuts({ onPalette, onHelp, onRandom, onNews, disabled }) {
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const onKey = (e) => {
      if (disabled) return;
      if (isEditableTarget()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/') {
        if (pathRef.current.startsWith('/wiki')) return;
        e.preventDefault();
        onPalette?.();
        return;
      }
      if (e.key === '?') { e.preventDefault(); onHelp?.(); return; }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); onRandom?.(); return; }
      if (e.key === 'n' || e.key === 'N') {
        if (/^\/bytes\/[^/]+/.test(pathRef.current)) return;
        e.preventDefault();
        onNews?.();
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, onPalette, onHelp, onRandom, onNews]);
}
