// src/components/tui/ChangelogOverlay.jsx
// Modal `motd`-style news feed opened by the global `n` shortcut (or `g n`).
// Reads CHANGELOG (newest first), groups by date, shows a per-entry tag chip
// tinted by category. Kept intentionally minimal — full history stays here.
import { useEffect } from 'react';
import { SHELL, ACCENTS } from '../../config/theme';
import { CHANGELOG } from '../../config/changelog';

const TAG_ACCENT = {
  shortcuts: 'green',
  modules:   'yellow',
  wiki:      'purple',
  bytes:     'blue',
  certs:     'red',
  fix:       'orange',
};

const hexOfTag = (tag) => (ACCENTS[TAG_ACCENT[tag] || 'green']).hex;

const ChangelogOverlay = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); onClose?.(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Changelog"
         className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 pt-[10vh]"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-2xl rounded-sm border border-white/15 bg-black/95 font-mono text-sm shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-white/70">
            <span style={{ color: SHELL.dim }}>guest@shelnet</span>
            <span className="text-white/40">:</span>
            <span style={{ color: SHELL.green }}>~</span>
            <span className="text-white/40">$ </span>
            cat /var/log/shelnet
          </span>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-xs">esc</button>
        </div>

        <ul className="max-h-[65vh] overflow-y-auto px-4 py-3 space-y-3">
          {CHANGELOG.map((e, i) => {
            const hex = hexOfTag(e.tag);
            return (
              <li key={i} className="flex gap-3">
                <span className="w-24 shrink-0 text-white/40 tabular-nums">{e.date}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white/25">[</span>
                    <span style={{ color: hex, fontWeight: 600 }}>{e.tag}</span>
                    <span className="text-white/25">]</span>
                    <span className="text-white/90">{e.title}</span>
                  </div>
                  <div className="text-white/60">{e.blurb}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-white/10 px-4 py-1.5 text-xs text-white/40">
          {CHANGELOG.length} entr{CHANGELOG.length === 1 ? 'y' : 'ies'} · newest first · press <span style={{ color: SHELL.green, fontWeight: 600 }}>esc</span> to close
        </div>
      </div>
    </div>
  );
};

export default ChangelogOverlay;
