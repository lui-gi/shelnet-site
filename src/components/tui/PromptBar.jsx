// src/components/tui/PromptBar.jsx
// Global sticky tty status line pinned to the top of every page. Renders the
// shell prompt `guest@shelnet <~/path> $` — the working directory housed in
// green inside angle brackets, ancestor segments clickable, the current segment
// inert. A single `[ cd ~ ]` button on the right is the only home affordance
// (no `[ ~ ]` chip, no blinking cursor). Mounted once in Layout, above Outlet.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SHELL } from '../../config/theme';
import { segmentsForPath, routeForSegments } from '../../config/resourcePaths';

const SLASH = 'rgba(67,192,140,0.45)';

const PromptBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const segments = segmentsForPath(pathname);

  return (
    <nav aria-label="Terminal path"
         className="fixed inset-x-0 top-0 z-50 h-9 border-b border-white/10 bg-black/90 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 font-mono text-xs sm:text-sm">
        {/* prompt + breadcrumb */}
        <div className="flex min-w-0 items-center">
          <span className="hidden sm:inline" style={{ color: SHELL.dim }}>guest@shelnet</span>
          <span className="hidden sm:inline">&nbsp;</span>
          <span className="text-white/30">&lt;</span>
          <span className="min-w-0 truncate">
            <span style={{ color: SHELL.green }}>~</span>
            {segments.map((seg, i) => {
              const last = i === segments.length - 1;
              return (
                <span key={i}>
                  <span style={{ color: SLASH }}>/</span>
                  {last ? (
                    <span aria-current="page" style={{ color: SHELL.green, fontWeight: 600 }}>{seg}</span>
                  ) : (
                    <Link to={routeForSegments(segments.slice(0, i + 1))}
                          className="hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60" style={{ color: SHELL.green }}>{seg}</Link>
                  )}
                </span>
              );
            })}
          </span>
          <span className="text-white/30">&gt;</span>
          <span>&nbsp;</span>
          <span style={{ color: SHELL.green }}>$</span>
        </div>

        {/* home button */}
        <button type="button" onClick={() => navigate('/')} aria-label="cd ~ (home)"
                className="group shrink-0 rounded-sm transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60">
          <span className="text-white/25">[</span>
          <span style={{ color: SHELL.dim }}>&nbsp;cd&nbsp;</span>
          <span style={{ color: SHELL.green }}>~</span>
          <span className="text-white/25">&nbsp;]</span>
        </button>
      </div>
    </nav>
  );
};

export default PromptBar;
