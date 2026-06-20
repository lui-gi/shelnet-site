// src/components/tui/Workspace.jsx
// Borderless file workspace that fills the viewport between the global bars:
// a thin tty toolbar over a body of [collapsible explorer | iframe viewer].
// The viewer fills all remaining space; `f` enters true (Fullscreen-API)
// fullscreen with a CSS edge-to-edge fallback; the first file auto-selects on
// load. Accent = cert color; the breadcrumb + exit live in the global bars.
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize2, Minimize2, ExternalLink, PanelLeft, PanelLeftClose } from 'lucide-react';
import { themeColors } from '../../config/themeColors';
import { ACCENTS } from '../../config/theme';

const uidOf = (group, item) => `${group.type}:${item.id}`;

const Workspace = ({
  accent = 'red', groups = [],
  statusLabel = 'EXECUTING:', loading = false, error = null, metaRight = '', showSandbox = false,
}) => {
  const colors = themeColors[accent] || themeColors.green;
  const accentHex = (ACCENTS[accent] || ACCENTS.green).hex;
  const navigate = useNavigate();

  // Flatten groups into one ordered list for keyboard nav + lookup.
  const flat = groups.flatMap((g) => g.items.map((item) => ({
    uid: uidOf(g, item), item,
  })));

  const [selectedUid, setSelectedUid] = useState(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [apiFs, setApiFs] = useState(false);   // real Fullscreen API active
  const [cssFs, setCssFs] = useState(false);   // fallback CSS overlay active
  const fullscreen = apiFs || cssFs;
  const viewerRef = useRef(null);

  // Auto-select: if nothing chosen yet, treat the first file as selected.
  const effectiveUid = selectedUid ?? flat[0]?.uid ?? null;
  const idx = flat.findIndex((f) => f.uid === effectiveUid);
  const selected = idx >= 0 ? flat[idx].item : null;

  // True fullscreen via the Fullscreen API; CSS overlay when it's unavailable.
  // Keep side effects OUT of the state updater: under StrictMode a state
  // updater is double-invoked in dev, which would call requestFullscreen twice.
  const toggleFullscreen = useCallback(() => {
    const el = viewerRef.current;
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => setCssFs(true));
    else setCssFs((prev) => !prev);
  }, [setCssFs]);

  // Keep apiFs in sync with the browser (so pressing browser Esc updates UI).
  useEffect(() => {
    const onFsChange = () => setApiFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown' && flat.length) { e.preventDefault(); const n = flat[idx < 0 ? 0 : (idx + 1) % flat.length]; setSelectedUid(n.uid); }
      else if (e.key === 'ArrowUp' && flat.length) { e.preventDefault(); const n = flat[idx < 0 ? flat.length - 1 : (idx - 1 + flat.length) % flat.length]; setSelectedUid(n.uid); }
      else if (e.key === 'f' && selected) { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'e') { e.preventDefault(); setExplorerOpen((v) => !v); }
      else if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else if (cssFs) setCssFs(false);
        else navigate('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, flat, selected, cssFs, navigate, toggleFullscreen]);

  // On a phone the explorer is an overlay drawer — close it once a file is picked.
  const select = (uid) => {
    setSelectedUid(uid);
    if (window.matchMedia('(max-width: 767px)').matches) setExplorerOpen(false);
  };

  const Explorer = (
    <div aria-label="File explorer">
      <div className="text-white/40 text-[10px] tracking-widest px-2 py-2">EXPLORER · AVAILABLE</div>
      {groups.map((g) => (
        <div key={g.type} className="mb-1">
          {g.label && <div className="px-2 py-1 text-[10px] tracking-widest text-white/35">{g.label}</div>}
          {g.items.map((item) => {
            const uid = uidOf(g, item);
            const on = effectiveUid === uid;
            return (
              <button type="button" key={uid} onClick={() => select(uid)}
                className={`w-full text-left px-2 py-2 rounded mb-0.5 transition-colors ${on ? 'bg-white/[0.04] text-white' : 'text-white/65 hover:bg-white/5'}`}
                style={on ? { boxShadow: `inset 2px 0 0 ${accentHex}` } : undefined}>
                <div className={`text-[11px] font-bold ${colors.text}`}>{g.prefix}{item.id}{on ? ' ●' : ''}</div>
                <div className="text-xs font-semibold">{item.title}</div>
                <div className="text-[10px] text-white/40">{item.description}</div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  if (loading) return <div className="flex-1 grid place-items-center text-white/50 text-sm">Loading…</div>;
  if (error) return <div className="flex-1 grid place-items-center text-red-400 text-sm">Failed to load resources: {error}</div>;

  return (
    <div className="flex flex-col flex-1 min-h-0 font-mono">
      {/* tty toolbar */}
      <div className="flex items-center justify-between gap-2 py-2 text-xs shrink-0">
        <span className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={() => setExplorerOpen((v) => !v)}
            aria-expanded={explorerOpen} aria-controls="ws-explorer" aria-label="Toggle file explorer"
            className={`inline-flex shrink-0 items-center gap-1 text-white/55 ${colors.textHover}`} title="Toggle explorer (e)">
            {explorerOpen ? <PanelLeftClose size={13} /> : <PanelLeft size={13} />} files
          </button>
          <span className="truncate">
            {selected
              ? <><span className={colors.text}>{statusLabel}</span> <span className="text-white">{selected.title}</span></>
              : <span className="text-white/40">{statusLabel} waiting for input…</span>}
          </span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className={`hidden sm:inline ${colors.text}`}>{flat.length} files{metaRight ? ` · ${metaRight}` : ''}</span>
          {selected && (
            <>
              <button type="button" onClick={toggleFullscreen} aria-pressed={fullscreen}
                className={`inline-flex items-center gap-1 text-white/55 ${colors.textHover}`} title="Fullscreen (f)">
                {fullscreen ? <><Minimize2 size={13} /> min</> : <><Maximize2 size={13} /> full</>}
              </button>
              <button type="button" onClick={() => window.open(selected.file, '_blank', 'noopener,noreferrer')}
                className={`inline-flex items-center gap-1 text-white/55 ${colors.textHover}`} title="Open in new tab">
                <ExternalLink size={13} /> open
              </button>
            </>
          )}
        </span>
      </div>

      {/* body: collapsible push explorer + filling viewer */}
      <div className="flex flex-1 min-h-0">
        {explorerOpen && (
          <button type="button" aria-label="Close explorer" onClick={() => setExplorerOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-black/50" />
        )}
        {explorerOpen && (
          <aside id="ws-explorer"
            className="w-[280px] shrink-0 overflow-y-auto md:border-r border-white/10 md:pr-2
                       max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-[260px] max-md:bg-black max-md:pt-12 max-md:px-3 max-md:pb-12">
            {Explorer}
          </aside>
        )}
        <section ref={viewerRef}
          className={cssFs
            ? 'fixed inset-0 z-[60] bg-white'
            : `relative flex-1 min-h-0 bg-white border border-white/10 rounded ${explorerOpen ? 'md:ml-4' : ''}`}>
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
        </section>
      </div>
    </div>
  );
};

export default Workspace;
