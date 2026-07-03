// src/components/tui/HelpOverlay.jsx
// Modal cheat sheet opened by the global `?` shortcut. Two columns: the site-
// wide chord vocabulary (source: JUMP_MAP + BottomBar), and the current page's
// contextual keys (source: shortcutsForPath). Meant to be the answer to "what
// were the leader letters again?" — not a marketing page.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SHELL } from '../../config/theme';
import { shortcutsForPath } from '../../config/shortcuts';
import { JUMP_MAP, CHORD_ACTIONS } from '../../utils/useGlobalShortcuts';

const GLOBAL_ROWS = [
  { keys: '/',   label: 'command palette (skips on /wiki — local search)' },
  { keys: '?',   label: 'this help' },
  { keys: 'r',   label: 'random — wiki entry or bytes track' },
  { keys: 'n',   label: 'news / changelog (skips on /bytes/<cert> — next)' },
  { keys: 'g _', label: 'jump leader (see below)' },
  { keys: 'esc', label: 'close · back · bail chord' },
];

const HelpOverlay = ({ open, onClose }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose?.(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const localHints = shortcutsForPath(pathname);

  return (
    <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"
         className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 pt-[10vh]"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-2xl rounded-sm border border-white/15 bg-black/95 font-mono text-sm shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-white/70">keyboard shortcuts</span>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-xs">esc</button>
        </div>

        <div className="grid gap-8 px-4 py-4 sm:grid-cols-2">
          <section>
            <h3 className="mb-2 text-white/45 text-xs uppercase tracking-wider">global</h3>
            <ul className="space-y-1.5">
              {GLOBAL_ROWS.map((r) => (
                <li key={r.keys} className="flex items-baseline gap-3">
                  <span className="w-14 shrink-0" style={{ color: SHELL.green, fontWeight: 600 }}>{r.keys}</span>
                  <span className="text-white/75">{r.label}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-5 mb-2 text-white/45 text-xs uppercase tracking-wider">g&nbsp;leader</h3>
            <ul className="grid grid-cols-2 gap-y-1 gap-x-3">
              {Object.entries(JUMP_MAP).map(([k, v]) => (
                <li key={k} className="flex items-baseline gap-2">
                  <span className="w-8 shrink-0" style={{ color: SHELL.green, fontWeight: 600 }}>g {k}</span>
                  <span className="text-white/70 truncate">{v.label}</span>
                </li>
              ))}
              {Object.entries(CHORD_ACTIONS).map(([k, v]) => (
                <li key={`a-${k}`} className="flex items-baseline gap-2">
                  <span className="w-8 shrink-0" style={{ color: SHELL.green, fontWeight: 600 }}>g {k}</span>
                  <span className="text-white/70 truncate">{v.label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-white/45 text-xs uppercase tracking-wider">this page</h3>
            <div className="mb-2 text-white/40 text-xs truncate">
              <span style={{ color: SHELL.dim }}>guest@shelnet</span>
              <span className="text-white/30">&nbsp;&lt;</span>
              <span style={{ color: SHELL.green }}>~{pathname === '/' ? '' : pathname}</span>
              <span className="text-white/30">&gt;</span>
            </div>
            <ul className="space-y-1.5">
              {localHints.map((h, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="w-14 shrink-0" style={{ color: SHELL.green, fontWeight: 600 }}>{h.keys}</span>
                  <span className="text-white/75">{h.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-white/10 px-4 py-1.5 text-xs text-white/40">
          chord leader has an ~800ms window; press esc to bail
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;
