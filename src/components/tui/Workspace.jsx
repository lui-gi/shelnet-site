// src/components/tui/Workspace.jsx
// Borderless file workspace: a flat explorer (left) + iframe viewer (right).
// The breadcrumb + exit live in the surrounding TerminalShell; this renders
// only the body. Accent = cert color.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize2, Minimize2, ExternalLink, ChevronLeft, Menu } from 'lucide-react';
import { themeColors } from '../../config/themeColors';

const Workspace = ({
  accent = 'red', items = [], itemPrefix = 'PBQ_0',
  statusLabel = 'EXECUTING:', loading = false, error = null, metaRight = '', showSandbox = false,
}) => {
  const colors = themeColors[accent] || themeColors.green;
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const idx = selected ? items.findIndex((i) => i.id === selected.id) : -1;
  const select = useCallback((item) => { setSelected(item); setDrawerOpen(false); }, []);

  // Keyboard: ↑↓ move, f fullscreen, esc exits fullscreen then returns home.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); const n = items[idx < 0 ? 0 : (idx + 1) % items.length]; if (n) setSelected(n); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); const n = items[idx < 0 ? items.length - 1 : (idx - 1 + items.length) % items.length]; if (n) setSelected(n); }
      if (e.key === 'f' && selected) { setFullscreen((v) => !v); }
      if (e.key === 'Escape') { if (fullscreen) setFullscreen(false); else navigate('/'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, items, selected, fullscreen, navigate]);

  const Explorer = (
    <div className="overflow-y-auto" aria-label="File explorer">
      <div className="text-white/40 text-[10px] tracking-widest px-2 py-2">EXPLORER · AVAILABLE</div>
      {items.map((item) => {
        const on = selected?.id === item.id;
        return (
          <button type="button" key={item.id} onClick={() => select(item)}
            className={`w-full text-left px-2 py-2 rounded mb-0.5 transition-colors ${on ? 'bg-white/[0.04] text-white' : 'text-white/65 hover:bg-white/5'}`}
            style={on ? { boxShadow: 'inset 2px 0 0 currentColor' } : undefined}>
            <div className={`text-[11px] font-bold ${colors.text}`}>{itemPrefix}{item.id}{on ? ' ●' : ''}</div>
            <div className="text-xs font-semibold">{item.title}</div>
            <div className="text-[10px] text-white/40">{item.description}</div>
          </button>
        );
      })}
    </div>
  );

  if (loading) return <div className="p-16 text-center text-white/50 text-sm">Loading…</div>;
  if (error) return <div className="p-8 text-red-400 text-sm">Failed to load resources: {error}</div>;

  return (
    <div className="font-mono">
      <button type="button" onClick={() => setDrawerOpen((v) => !v)}
        className="md:hidden mb-2 inline-flex items-center gap-1 text-white/60 text-xs" aria-label="Toggle explorer">
        <Menu size={14} /> explorer
      </button>

      <div className={`grid ${fullscreen ? 'grid-cols-1' : 'md:grid-cols-[260px_1fr]'} min-h-[60vh]`}>
        {/* Explorer (hidden in fullscreen; drawer on mobile) */}
        {!fullscreen && (
          <div className={`md:border-r border-white/10 md:pr-2 ${drawerOpen ? 'block' : 'hidden md:block'}`}>{Explorer}</div>
        )}

        {/* Viewer */}
        <div className="flex flex-col md:pl-4">
          <div className="flex items-center justify-between gap-2 py-2 text-xs">
            <span className="flex items-center gap-2 min-w-0">
              {fullscreen && <button type="button" aria-label="Exit fullscreen" onClick={() => setFullscreen(false)}><ChevronLeft size={16} className="text-white/60" /></button>}
              {selected
                ? <span className="truncate"><span className={colors.text}>{statusLabel}</span> <span className="text-white">{selected.title}</span></span>
                : <span className="text-white/40">{statusLabel} waiting for input…</span>}
            </span>
            {selected && (
              <span className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setFullscreen((v) => !v)} className={`inline-flex items-center gap-1 text-white/55 ${colors.textHover}`} title="Fullscreen (f)">
                  {fullscreen ? <><Minimize2 size={13} /> min</> : <><Maximize2 size={13} /> full</>}
                </button>
                <button type="button" onClick={() => window.open(selected.file, '_blank', 'noopener,noreferrer')} className={`inline-flex items-center gap-1 text-white/55 ${colors.textHover}`} title="Open in new tab">
                  <ExternalLink size={13} /> open
                </button>
              </span>
            )}
          </div>

          <div className="flex-1 relative rounded border border-white/10 bg-white" style={{ height: fullscreen ? '85vh' : '60vh' }}>
            {selected ? (
              <iframe src={selected.file} title={selected.title} className="w-full h-full border-0"
                {...(showSandbox && { sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups' })} />
            ) : (
              <div className="absolute inset-0 bg-black flex items-center justify-center text-center text-white/40">
                <div>
                  <div className="text-3xl opacity-30">▢</div>
                  <div className="mt-2 text-sm">// no file loaded</div>
                  <div className="text-xs mt-1 opacity-70">select a file to initialize environment</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-2 text-[10.5px]">
            <span className="text-white/50">↑↓ select · f fullscreen · esc home</span>
            <span className={colors.text}>{items.length} files{metaRight ? ` · ${metaRight}` : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
