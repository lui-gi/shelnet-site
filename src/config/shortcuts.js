// src/config/shortcuts.js
// Single source of truth for the contextual keyboard-hint text shown on the
// right of the global BottomBar. Keep in sync with the real key handlers in
// ResourceTUI / Workspace. Returns an ordered list of { keys, label } pairs.

export function shortcutsForPath(pathname) {
  if (pathname === '/') {
    // '1–5' tracks HeroSection.jsx MENU (5 items); update if that menu grows
    return [
      { keys: '↑↓', label: 'move' },
      { keys: '↵', label: 'open' },
      { keys: '1–5', label: 'jump' },
    ];
  }
  // File viewers: cert dashboards + the visualizations workspace.
  if (/^\/resources\/certs\/[^/]+\/?$/.test(pathname) || pathname === '/resources/visualizations') {
    return [
      { keys: '↑↓', label: 'file' },
      { keys: 'f', label: 'full' },
      { keys: 'esc', label: '~' },
    ];
  }
  // Explorer: /resources root or a browsable dir (certs/labs/notes).
  if (/^\/resources(\/(certs|labs|notes))?\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'move' },
      { keys: '←→', label: 'pane' },
      { keys: '↵', label: 'open' },
      { keys: 'esc', label: 'back' },
    ];
  }
  // /resources/labs/:slug, /about, /connect, and any fallback
  return [{ keys: 'esc', label: '~' }];
}
