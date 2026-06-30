// src/components/wiki/useWikiSearchTrigger.js
// Global keybinds for the wiki search modal: `/` and cmd/ctrl+k. Skips when
// the user is typing in an input/textarea.
import { useEffect } from 'react';

export function useWikiSearchTrigger(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
}
