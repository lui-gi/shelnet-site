// src/config/shortcuts.js
// Single source of truth for the contextual keyboard-hint text shown on the
// right of the global BottomBar. Keep in sync with the real key handlers in
// each page. Returns an ordered list of { keys, label } pairs.

export function shortcutsForPath(pathname) {
  if (pathname === '/') {
    return [
      { keys: '↑↓', label: 'move' },
      { keys: '↵', label: 'open' },
      { keys: '1–5', label: 'jump' },
    ];
  }
  // Cert study console.
  if (/^\/resources\/certs\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'select' },
      { keys: '↵', label: 'open' },
      { keys: 'p/e', label: 'pbq/exam' },
      { keys: 'esc', label: 'back' },
    ];
  }
  // File viewers: cert dashboards + the visualizations playground.
  if (/^\/resources\/certs\/[^/]+\/?$/.test(pathname) || pathname === '/resources/visualizations') {
    return [
      { keys: '↑↓', label: 'file' },
      { keys: 'e', label: 'files' },
      { keys: 'f', label: 'full' },
      { keys: 'esc', label: '~' },
    ];
  }
  // Notes reader.
  if (pathname === '/resources/notes') {
    return [
      { keys: '↵', label: 'focus' },
      { keys: 'o', label: 'open' },
      { keys: 'f', label: 'full' },
      { keys: 'esc', label: 'back' },
    ];
  }
  // Labs WIP.
  if (pathname === '/resources/labs') {
    return [
      { keys: '↵', label: 'notify' },
      { keys: 'esc', label: 'back' },
    ];
  }
  // Resources index.
  if (/^\/resources\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'move' },
      { keys: '→/↵', label: 'open' },
      { keys: '1–4', label: 'jump' },
      { keys: 'esc', label: 'home' },
    ];
  }
  // bytes cert picker.
  if (/^\/bytes\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'select' },
      { keys: '↵', label: 'start' },
      { keys: 'esc', label: 'home' },
    ];
  }
  // /about, /connect, and any fallback.
  return [{ keys: 'esc', label: '~' }];
}
