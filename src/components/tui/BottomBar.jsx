// src/components/tui/BottomBar.jsx
// Global sticky tty bar pinned to the bottom of every page, the mirror of
// PromptBar. Left: fixed quickstart launcher CTAs (same on every route).
// Right: contextual keyboard shortcuts for the current route (hidden on mobile,
// where there is no keyboard). Mounted once in Layout, below the Outlet.
import { Link, useLocation } from 'react-router-dom';
import { SHELL, ACCENTS } from '../../config/theme';
import { shortcutsForPath } from '../../config/shortcuts';

const CTAS = [
  { to: '/resources/certs/a-plus',        label: 'A+ Core 2', hex: ACCENTS.red.hex },
  { to: '/resources/certs/security-plus', label: 'Security+', hex: ACCENTS.blue.hex },
  { to: '/connect',                       label: 'connect',   hex: SHELL.green },
];

const BottomBar = () => {
  const { pathname } = useLocation();
  const hints = shortcutsForPath(pathname);

  return (
    <nav aria-label="Quick actions"
         className="fixed inset-x-0 bottom-0 z-50 h-9 border-t border-white/10 bg-black/90 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-3 px-6 font-mono text-xs sm:text-sm">
        {/* launcher CTAs */}
        <div className="flex items-center gap-3 overflow-x-auto">
          {CTAS.map((c) => (
            <Link key={c.to} to={c.to} className="shrink-0 whitespace-nowrap rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60">
              <span className="text-white/25">[</span>
              <span style={{ color: c.hex }}>&nbsp;▸&nbsp;</span>
              <span className="text-white/90">{c.label}</span>
              <span className="text-white/25">&nbsp;]</span>
            </Link>
          ))}
        </div>

        {/* contextual shortcuts (no keyboard on mobile → hidden) */}
        <div className="hidden sm:flex shrink-0 items-center gap-2">
          {hints.map((h, i) => (
            <span key={i} className="whitespace-nowrap">
              {i > 0 && <span className="mr-2 text-white/25">·</span>}
              <span style={{ color: SHELL.green, fontWeight: 600 }}>{h.keys}</span>{' '}
              <span className="text-white/60">{h.label}</span>
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomBar;
