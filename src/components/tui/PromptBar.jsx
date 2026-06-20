// src/components/tui/PromptBar.jsx
// Global sticky tty status line pinned to the top of every page. Renders the
// live shell prompt — `guest@shelnet:~/path$` — with the path as a clickable
// breadcrumb (ancestors link via routeForSegments; the current segment is inert)
// plus a `[ ~ ]` home chip on the right, echoing the hero's `[ OK ]` markers.
// Stays shell-green chrome on every route so it reads as the constant terminal
// frame around the page content. Mounted once in Layout, above the Outlet.
import { Link, useLocation } from 'react-router-dom';
import { SHELL } from '../../config/theme';
import { segmentsForPath, routeForSegments } from '../../config/resourcePaths';

const PromptBar = () => {
  const { pathname } = useLocation();
  const segments = segmentsForPath(pathname);
  const atHome = segments.length === 0;

  return (
    <nav aria-label="Terminal path"
         className="fixed inset-x-0 top-0 z-50 h-9 border-b border-white/10 bg-black/90 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 font-mono text-xs sm:text-sm">
        {/* prompt + breadcrumb + cursor */}
        <div className="flex min-w-0 items-center">
          <span className="hidden sm:inline text-white/40">guest@shelnet</span>
          <span className="hidden sm:inline text-white/25">:</span>

          <span className="min-w-0 truncate">
            {atHome ? (
              <span aria-current="page" style={{ color: SHELL.green }}>~</span>
            ) : (
              <Link to="/" aria-label="Home"
                    className="opacity-90 transition-opacity hover:opacity-100"
                    style={{ color: SHELL.green }}>~</Link>
            )}
            {segments.map((seg, i) => {
              const last = i === segments.length - 1;
              return (
                <span key={i}>
                  <span className="text-white/30">/</span>
                  {last ? (
                    <span aria-current="page" className="text-white/90">{seg}</span>
                  ) : (
                    <Link to={routeForSegments(segments.slice(0, i + 1))}
                          className="text-white/55 transition-colors hover:text-white">{seg}</Link>
                  )}
                </span>
              );
            })}
          </span>

          <span className="ml-px" style={{ color: SHELL.green }}>$</span>
          <span aria-hidden="true"
                className="ml-1 inline-block h-3.5 w-1.5 animate-pulse reduce-static"
                style={{ backgroundColor: SHELL.green }} />
        </div>

        {/* home chip */}
        <Link to="/" aria-label="Return home"
              className="group shrink-0 transition-colors">
          <span className="text-white/25 transition-colors group-hover:text-white/45">[</span>
          <span className="px-1 opacity-90 transition-opacity group-hover:opacity-100"
                style={{ color: SHELL.green }}>~</span>
          <span className="text-white/25 transition-colors group-hover:text-white/45">]</span>
        </Link>
      </div>
    </nav>
  );
};

export default PromptBar;
