// src/config/shortcuts.js
// Single source of truth for the contextual keyboard-hint text shown on the
// right of the global BottomBar. Keep in sync with the real key handlers in
// each page. Returns an ordered list of { keys, label } pairs.

export function shortcutsForPath(pathname) {
  if (pathname === '/') {
    return [
      { keys: '↑↓', label: 'move' },
      { keys: '↵', label: 'open' },
      { keys: '1–6', label: 'jump' },
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
      { keys: '1–5', label: 'jump' },
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
  // bytes quiz runner.
  if (/^\/bytes\/[^/]+\/?$/.test(pathname)) {
    return [
      { keys: '1-4', label: 'answer' },
      { keys: 's', label: 'skip' },
      { keys: '↵/n', label: 'next' },
      { keys: 'esc', label: 'bytes' },
    ];
  }
  // Connect identity card.
  if (pathname === '/connect') {
    return [
      { keys: '↑↓', label: 'select' },
      { keys: '↵', label: 'open' },
      { keys: 'esc', label: '~' },
    ];
  }
  // Wiki home.
  if (pathname === '/wiki') {
    return [
      { keys: '↑↓', label: 'select' },
      { keys: '/', label: 'search' },
      { keys: 'esc', label: '~' },
    ];
  }
  // Wiki entry (anything under /wiki/).
  if (/^\/wiki\//.test(pathname)) {
    return [
      { keys: '/', label: 'search' },
      { keys: 'esc', label: 'up' },
    ];
  }
  // Modules lobby terminal.
  if (pathname === '/resources/modules') {
    return [
      { keys: 'type', label: 'command' },
      { keys: '↵', label: 'run' },
      { keys: '↑↓', label: 'history' },
      { keys: 'esc', label: '~' },
    ];
  }
  // Module room (lesson + lab stage).
  if (/^\/resources\/modules\/[^/]+\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'section' },
      { keys: 'h', label: 'hint' },
      { keys: '`', label: 'terminal' },
      { keys: 'esc', label: 'exit' },
    ];
  }
  // Any fallback.
  return [{ keys: 'esc', label: '~' }];
}
