// src/config/resourcePaths.js
// The router stays flat; the shell shows a clean ~/resources/... path and links
// each breadcrumb segment to the route that renders that level.

export const ROUTE_BY_PATH = {
  'resources':                    '/resources/pbqs',
  'resources/pbqs':               '/resources/pbqs',
  'resources/exams':              '/resources/exams',
  'resources/visualizations':     '/visualizations',
  'resources/labs':               '/resources/labs',
  'resources/notes':              '/resources/notes',
  'resources/pbqs/a-plus':        '/a-plus-pbqs',
  'resources/pbqs/security-plus': '/security-plus-pbqs',
  'resources/exams/a-plus':       '/a-plus-exams',
  'resources/exams/security-plus':'/security-plus-exams',
};

// Best route for a prefix of segments, e.g. ['resources','pbqs'] -> '/resources/pbqs'.
// Unknown deeper paths fall back to the directory explorer for that dir.
export function routeForSegments(segments) {
  const key = segments.join('/');
  if (ROUTE_BY_PATH[key]) return ROUTE_BY_PATH[key];
  if (segments[0] === 'resources' && segments[1]) return `/resources/${segments[1]}`;
  return '/resources/pbqs';
}

// Reverse of the route table: the canonical ~/ path segments shown for a route.
// Drives the global PromptBar breadcrumb. Ancestor segments resolve back through
// routeForSegments, so the bar and the in-shell breadcrumb agree by construction.
export const SEGMENTS_BY_ROUTE = {
  '/':                    [],
  '/about':               ['about'],
  '/connect':             ['connect'],
  '/visualizations':      ['resources', 'visualizations'],
  '/a-plus-pbqs':         ['resources', 'pbqs', 'a-plus'],
  '/security-plus-pbqs':  ['resources', 'pbqs', 'security-plus'],
  '/a-plus-exams':        ['resources', 'exams', 'a-plus'],
  '/security-plus-exams': ['resources', 'exams', 'security-plus'],
};

// ~/ path segments for the current location. Static routes come from the table;
// /resources/:dir and /labs/:slug are matched dynamically. Unknown -> home (~).
export function segmentsForPath(pathname) {
  if (pathname in SEGMENTS_BY_ROUTE) return SEGMENTS_BY_ROUTE[pathname];
  const dir = pathname.match(/^\/resources\/([^/]+)\/?$/);
  if (dir) return ['resources', dir[1]];
  const lab = pathname.match(/^\/labs\/([^/]+)\/?$/);
  if (lab) return ['resources', 'labs', lab[1]];
  return [];
}

// Real path-segment name for a workspace route, used as the drill child's display
// name in the explorer (e.g. the A+ PBQ item renders as `a-plus/`).
export const SUBDIR_NAME = {
  '/a-plus-pbqs':        'a-plus',
  '/security-plus-pbqs': 'security-plus',
  '/a-plus-exams':       'a-plus',
  '/security-plus-exams':'security-plus',
};
