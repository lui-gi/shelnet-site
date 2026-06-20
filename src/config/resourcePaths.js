// src/config/resourcePaths.js
// Routes equal breadcrumb paths, so the shell prompt derives its segments
// directly from the pathname and links each ancestor to its own path.

/** ~/ path segments for the current location. '/' -> [] (just `~`). */
export function segmentsForPath(pathname) {
  return pathname.split('/').filter(Boolean);
}

/** The route for a prefix of segments, e.g. ['resources','certs'] -> '/resources/certs'. */
export function routeForSegments(segments) {
  return '/' + segments.join('/');
}
