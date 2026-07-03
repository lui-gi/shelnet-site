// src/components/tui/CommandPalette.jsx
// Modal fuzzy launcher opened by the global `/` shortcut. Fuzzy-matches against
// routes + cert dashboards + module rooms (built from the resources manifest
// plus the static module registry). ↑↓ to move, ↵ to open, esc to close.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHELL } from '../../config/theme';
import { useManifest } from '../../utils/useManifest';
import { buildPaletteIndex, filterPalette } from '../../utils/paletteIndex';

const CommandPalette = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { manifest } = useManifest();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const index = useMemo(() => buildPaletteIndex(manifest), [manifest]);
  const hits = useMemo(() => filterPalette(query, index).slice(0, 12), [query, index]);

  // Reset on open; focus the input.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setCursor(0);
    // Defer to next frame so autofocus lands after the modal mounts.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => { setCursor(0); }, [query]);

  const submit = (i = cursor) => {
    const hit = hits[i];
    if (!hit) return;
    onClose?.();
    navigate(hit.path);
  };

  const onKey = (e) => {
    // Keep the palette's navigation keys from co-firing with page-level window
    // keydown handlers (e.g. HeroSection's MENU). Native stopPropagation is what
    // guarantees this — React synthetic bubbling is a separate channel.
    const swallow = () => { e.preventDefault(); e.stopPropagation(); e.nativeEvent?.stopPropagation(); };
    if (e.key === 'Escape')    { swallow(); onClose?.(); return; }
    if (e.key === 'ArrowDown') { swallow(); setCursor((n) => Math.min(hits.length - 1, n + 1)); return; }
    if (e.key === 'ArrowUp')   { swallow(); setCursor((n) => Math.max(0, n - 1)); return; }
    if (e.key === 'Enter')     { swallow(); submit(); return; }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette"
         className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 pt-[15vh]"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="w-full max-w-xl rounded-sm border border-white/15 bg-black/95 font-mono text-sm shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span style={{ color: SHELL.green }}>/</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="jump to route, cert, or module…"
            aria-label="Palette query"
            className="flex-1 bg-transparent text-white/90 placeholder-white/30 outline-none"
          />
          <span className="text-white/25 text-xs">esc</span>
        </div>
        <ul role="listbox" aria-label="Palette results" className="max-h-[50vh] overflow-y-auto py-1">
          {hits.length === 0 ? (
            <li className="px-3 py-2 text-white/40">no matches</li>
          ) : hits.map((h, i) => {
            const on = i === cursor;
            return (
              <li key={h.path}
                  role="option"
                  aria-selected={on}
                  onMouseEnter={() => setCursor(i)}
                  onMouseDown={(e) => { e.preventDefault(); submit(i); }}
                  className={`flex items-baseline gap-2 px-3 py-1.5 cursor-pointer ${on ? 'bg-white/[0.06]' : ''}`}>
                <span style={{ color: on ? h.hex : 'rgba(255,255,255,0.25)' }}>{on ? '▸' : ' '}</span>
                <span className="text-white/90">{h.label}</span>
                <span className="text-white/35 truncate">{h.sub}</span>
                <span className="ml-auto text-white/30 truncate">{h.path}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-1.5 text-xs text-white/40">
          <span><span style={{ color: SHELL.green }}>↑↓</span> move · <span style={{ color: SHELL.green }}>↵</span> open · <span style={{ color: SHELL.green }}>esc</span> close</span>
          <span>{hits.length} result{hits.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
