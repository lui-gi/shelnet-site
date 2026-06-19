// src/components/tui/Workspace.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Maximize2, Minimize2, ExternalLink, ChevronLeft, Menu } from 'lucide-react';
import { themeColors } from '../../config/themeColors';
import { PROMPT } from '../../config/theme';

const ACCENT_BORDER = {
  green: 'border-emerald-500/40', red: 'border-red-500/40', blue: 'border-blue-500/40',
  purple: 'border-purple-500/40', orange: 'border-orange-500/40', slate: 'border-slate-400/40',
};
const ACCENT_DIV = {
  green: 'border-emerald-500/25', red: 'border-red-500/25', blue: 'border-blue-500/25',
  purple: 'border-purple-500/25', orange: 'border-orange-500/25', slate: 'border-slate-400/25',
};

/**
 * @param {string} accent          theme color key (cert color)
 * @param {string[]} pathSegments  e.g. ['pbqs','a-plus']
 * @param {Array} items            [{ id, title, description, file }]
 * @param {string} itemPrefix      e.g. 'PBQ_0'
 * @param {string} statusLabel     e.g. 'EXECUTING:'
 * @param {string} loading,error   pass-through states
 * @param {string} metaRight       status-bar right text (e.g. '220-1202')
 * @param {boolean} showSandbox
 */
const Workspace = ({
  accent = 'red', pathSegments = [], items = [], itemPrefix = 'PBQ_0',
  statusLabel = 'EXECUTING:', loading = false, error = null, metaRight = '', showSandbox = false,
}) => {
  const colors = themeColors[accent];
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const idx = selected ? items.findIndex((i) => i.id === selected.id) : -1;

  const select = useCallback((item) => { setSelected(item); setDrawerOpen(false); }, []);

  // Keyboard nav: ↑↓ move, f fullscreen, esc home/exit.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); const n = items[(idx + 1 + items.length) % items.length]; if (n) setSelected(n); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); const n = items[(idx - 1 + items.length) % items.length]; if (n) setSelected(n); }
      if (e.key === 'f' && selected) { setFullscreen((v) => !v); }
      if (e.key === 'Escape') { if (fullscreen) setFullscreen(false); else navigate('/'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, items, selected, fullscreen, navigate]);

  const Explorer = (
    <div className={`p-2 overflow-y-auto ${ACCENT_DIV[accent]}`} aria-label="File explorer">
      <div className="text-white/40 text-[10px] tracking-widest px-2 py-2">EXPLORER · AVAILABLE</div>
      {items.map((item) => {
        const on = selected?.id === item.id;
        return (
          <button key={item.id} onClick={() => select(item)}
            className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${on ? `${colors.bgActive} text-white` : 'text-white/65 hover:bg-white/5'}`}>
            <div className={`text-[11px] font-bold ${colors.text}`}>{itemPrefix}{item.id}{on ? ' ●' : ''}</div>
            <div className="text-xs font-semibold">{item.title}</div>
            <div className="text-[10px] text-white/40">{item.description}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`border ${ACCENT_BORDER[accent]} rounded-md font-mono bg-black/40`}>
      {/* Path bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${ACCENT_DIV[accent]} text-xs`}>
        <div className="flex items-center gap-2 min-w-0">
          <button className="md:hidden text-white/60" onClick={() => setDrawerOpen((v) => !v)} aria-label="Toggle explorer"><Menu size={16} /></button>
          <Link to="/" className="text-white/40 hover:text-white">~</Link>
          {pathSegments.map((seg, i) => (
            <span key={i} className="text-white/40 truncate">/ {i === pathSegments.length - 1 ? <span className={colors.text}>{seg}</span> : seg}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <>
              <button onClick={() => setFullscreen((v) => !v)} className="p-1.5 border border-white/20 rounded hover:border-white/40" title="Fullscreen (f)">
                {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => window.open(selected.file, '_blank', 'noopener')} className={`p-1.5 border border-white/20 rounded ${colors.hoverBorder} ${colors.textHover}`} title="Open in new tab">
                <ExternalLink size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-16 text-center text-white/50 text-sm">Loading…</div>
      ) : error ? (
        <div className="p-8 text-red-400 text-sm">Failed to load resources: {error}</div>
      ) : (
        <div className={`grid ${fullscreen ? 'grid-cols-1' : 'md:grid-cols-[260px_1fr]'} min-h-[60vh]`}>
          {/* Explorer: hidden in fullscreen; drawer on mobile */}
          {!fullscreen && (
            <div className={`md:border-r ${ACCENT_DIV[accent]} ${drawerOpen ? 'block' : 'hidden md:block'}`}>{Explorer}</div>
          )}
          {/* Viewer */}
          <div className="flex flex-col">
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${ACCENT_DIV[accent]} text-xs`}>
              {fullscreen && <button onClick={() => setFullscreen(false)}><ChevronLeft size={16} className="text-white/60" /></button>}
              {selected
                ? <span><span className={colors.text}>{statusLabel}</span> <span className="text-white">{selected.title}</span></span>
                : <span className="text-white/40">{statusLabel} waiting for input…</span>}
            </div>
            <div className="flex-1 bg-white relative" style={{ height: fullscreen ? '85vh' : '60vh' }}>
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
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-t ${ACCENT_DIV[accent]} text-[10.5px]`}>
        <span className="text-white/50">↑↓ select · f fullscreen · esc → home</span>
        <span className={colors.text}>{items.length} files{metaRight ? ` · ${metaRight}` : ''}</span>
      </div>
    </div>
  );
};

export default Workspace;
