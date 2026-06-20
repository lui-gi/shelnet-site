// src/config/shortcuts.js
// Single source of truth for the contextual keyboard-hint text shown on the
// right of the global BottomBar. Keep in sync with the real key handlers in
// ResourceTUI / Workspace. Returns an ordered list of { keys, label } pairs.

const WORKSPACE_ROUTES = new Set([
  '/a-plus-pbqs', '/security-plus-pbqs',
  '/a-plus-exams', '/security-plus-exams',
  '/visualizations',
]);

export function shortcutsForPath(pathname) {
  if (pathname === '/') {
    // '1–6' tracks HeroSection.jsx MENU (6 items); update if that menu grows
    return [{ keys: '1–6', label: 'jump' }];
  }
  if (/^\/resources\/[^/]+\/?$/.test(pathname)) {
    return [
      { keys: '↑↓', label: 'dir' },
      { keys: '↵', label: 'open' },
      { keys: 'esc', label: '~' },
    ];
  }
  if (WORKSPACE_ROUTES.has(pathname)) {
    return [
      { keys: '↑↓', label: 'file' },
      { keys: 'f', label: 'full' },
      { keys: 'esc', label: '~' },
    ];
  }
  // /labs/:slug, /about, /connect, and any fallback
  return [{ keys: 'esc', label: '~' }];
}
