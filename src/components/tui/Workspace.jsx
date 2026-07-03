// src/components/tui/Workspace.jsx
// Framed-ASCII file workspace that fills the viewport between the global bars:
// a drawn ┌─ rail/┬/└─┴ box whose left pane is a `tree`-style file rail (color-
// coded per the cert/page accent) and whose right pane is the live viewer inside
// a solid ┌─┐ frame in that same accent. Shared by the cert dashboard and the
// visualizations playground. `f` enters real (Fullscreen-API) fullscreen with a
// CSS fallback; the first file auto-selects on load.
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Frame, TwoPane } from './ascii';
import { ACCENTS, SHELL } from '../../config/theme';

const uidOf = (group, item) => `${group.type}:${item.id}`;
const RAIL = 'rgba(255,255,255,0.3)'; // outer box / rail color (dim, per mockups)

// Tree glyphs, matching the ~/ file-tree vocabulary used across the site.
const dirGlyph = (isLast) => (isLast ? '└─ ' : '├─ ');
const leafGlyph = (dirLast, leafLast) => `${dirLast ? '   ' : '│  '}${leafLast ? '└─ ' : '├─ '}`;

const Workspace = ({
  accent = 'red', groups = [],
  statusLabel = 'EXECUTING:', loading = false, error = null, metaRight = '', showSandbox = false,
  railLabel = 'files', initialType = null, initialId = null, iconFor = null,
}) => {
  const accentHex = (ACCENTS[accent] || ACCENTS.green).hex;
  const navigate = useNavigate();

  // Flatten groups into one ordered list for keyboard nav + lookup.
  const flat = groups.flatMap((g) => g.items.map((item) => ({ uid: uidOf(g, item), item })));

  const [selectedUid, setSelectedUid] = useState(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [cssFs, setCssFs] = useState(false);   // fallback CSS overlay active (Fullscreen API unavailable)
  const [reloadKey, setReloadKey] = useState(0);
  const viewerRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 767px)').matches : false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Auto-select: prefer initialId match, then initialType match, then first file.
  const defaultUid =
    (initialId && flat.find((f) => f.item.id === initialId)?.uid)
    || (initialType && flat.find((f) => f.uid.startsWith(`${initialType}:`))?.uid)
    || flat[0]?.uid
    || null;
  const effectiveUid = selectedUid ?? defaultUid;
  const idx = flat.findIndex((f) => f.uid === effectiveUid);
  const selected = idx >= 0 ? flat[idx].item : null;

  const toggleFullscreen = useCallback(() => {
    const el = viewerRef.current;
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => setCssFs(true));
    else setCssFs((prev) => !prev);
  }, [setCssFs]);

  const select = (uid) => {
    setSelectedUid(uid);
    if (isMobile) setExplorerOpen(false);
  };

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

  if (loading) return <div className="flex-1 grid place-items-center text-white/50 text-sm">… loading</div>;
  if (error) return <div className="flex-1 grid place-items-center text-rose-400 text-sm">! failed to load: {error}</div>;

  // ── shared pieces ──────────────────────────────────────────────────────────
  // Color-coded `tree`-style file rail, matching the ~/ tree vocabulary:
  // a dim root (./), accent-colored group dirs with ├─/└─ glyphs, and leaves on
  // │  ├─ / └─ glyphs. Selected/hovered rows get a tinted background using the
  // cert/page accent so the selection cue carries the accent itself.
  const accentTint = `${accentHex}1f`; // ~12% alpha for selected row
  const accentTintHover = `${accentHex}14`; // ~8% alpha for hover row
  const onlyGroup = groups.length === 1;
  const fileList = (
    <div>
      {!onlyGroup && <div className="text-white/40">./</div>}
      {groups.map((g, gi) => {
        const dirLast = gi === groups.length - 1;
        const showDir = !!g.label && !onlyGroup;
        return (
          <div key={g.type}>
            {showDir && (
              <div className="flex items-baseline whitespace-nowrap">
                <span className="shrink-0 whitespace-pre text-white/30" aria-hidden="true">{dirGlyph(dirLast)}</span>
                <span className="font-semibold" style={{ color: accentHex }}>{g.label}</span>
                <span className="ml-2 text-white/35">{g.items.length}</span>
              </div>
            )}
            {g.items.map((item, ii) => {
              const uid = uidOf(g, item);
              const on = effectiveUid === uid;
              const leafLast = ii === g.items.length - 1;
              const prefix = showDir ? leafGlyph(dirLast, leafLast) : '';
              return (
                <button
                  key={uid}
                  type="button"
                  onClick={() => select(uid)}
                  aria-current={on ? 'true' : undefined}
                  className="group block w-full text-left rounded-sm -mx-1.5 px-1.5 transition-colors"
                  style={{ backgroundColor: on ? accentTint : 'transparent' }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.backgroundColor = accentTintHover; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="flex items-baseline whitespace-nowrap">
                    <span className="shrink-0 whitespace-pre text-white/30" aria-hidden="true">{prefix}</span>
                    {iconFor
                      ? <span className="shrink-0" style={{ color: accentHex }} aria-hidden="true">{iconFor(item)} </span>
                      : <span className="shrink-0 text-white/35 mr-2">{g.prefix}{item.id}</span>}
                    <span className={on ? 'text-white/90' : 'text-white/70'}>{item.title}</span>
                    {/* always reserve cursor space so selection never reflows the column */}
                    <span
                      className="ml-auto pl-3 shrink-0"
                      style={{ color: accentHex, opacity: on ? 1 : 0 }}
                      aria-hidden="true"
                    >▸</span>
                  </div>
                  {on && item.description && (
                    <div
                      className="text-white/45 text-xs max-w-[34ch] whitespace-normal pb-1"
                      style={{ paddingLeft: `${prefix.length}ch` }}
                    >{item.description}</div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const ctrlBtn = 'hover:text-white shrink-0';
  const controls = (
    <div className="flex items-center w-full gap-3">
      <button type="button" onClick={() => setExplorerOpen((v) => !v)} className={`${ctrlBtn} text-white/55`} title="Toggle explorer (e)">files</button>
      <span className="truncate min-w-0">
        {selected
          ? <><span style={{ color: accentHex }}>{statusLabel}</span> <span className="text-white/90">{selected.title}</span></>
          : <span className="text-white/40">{statusLabel} waiting for input…</span>}
      </span>
      <span className="ml-auto flex items-center gap-3 shrink-0 pl-2">
        <span className="hidden sm:inline text-white/30">{flat.length} files{metaRight ? ` · ${metaRight}` : ''}</span>
        {showSandbox && selected && <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={ctrlBtn} style={{ color: accentHex }} title="Reload">⟳</button>}
        {selected && <button type="button" onClick={toggleFullscreen} className={ctrlBtn} style={{ color: accentHex }} title="Fullscreen (f)">⛶</button>}
        {selected && <button type="button" onClick={() => window.open(selected.file, '_blank', 'noopener,noreferrer')} className={ctrlBtn} style={{ color: accentHex }} title="Open in new tab">↗</button>}
      </span>
    </div>
  );

  const viewerInner = selected ? (
    <iframe
      key={`${selected.file}#${reloadKey}`}
      src={selected.file}
      title={selected.title}
      className="w-full h-full border-0 bg-white"
      {...(showSandbox && { sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups' })}
    />
  ) : (
    <div className="h-full bg-black flex items-center justify-center text-center text-white/40">
      <div>
        <div className="text-3xl opacity-30">▢</div>
        <div className="mt-2 text-sm">// no file loaded</div>
        <div className="text-xs mt-1 opacity-70">select a file to initialize environment</div>
      </div>
    </div>
  );

  const viewer = <Frame hex={accentHex} className="h-full">{viewerInner}</Frame>;

  // CSS-fallback fullscreen overlay (when the Fullscreen API is unavailable).
  if (cssFs) {
    return (
      <div ref={viewerRef} className="fixed inset-0 z-[60] bg-white">{viewerInner}</div>
    );
  }

  // ── mobile: top selector + dropdown drawer + framed viewer ──────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 min-h-0 font-mono text-sm">
        <div className="shrink-0 pb-1">{controls}</div>
        {explorerOpen && (
          <div className="shrink-0 max-h-[42vh] overflow-y-auto border border-white/10 mb-1 p-2">{fileList}</div>
        )}
        <div ref={viewerRef} className="flex-1 min-h-0">{viewer}</div>
      </div>
    );
  }

  // ── desktop: explorer-open = two-pane box; collapsed = framed viewer only ────
  return explorerOpen ? (
    <div className="flex-1 min-h-0 font-mono text-sm">
      <TwoPane
        fill
        hex={RAIL}
        leftTitle={railLabel}
        rightTitle={controls}
        left={fileList}
        right={<div ref={viewerRef} className="h-full">{viewer}</div>}
        className="w-full"
      />
    </div>
  ) : (
    <div className="flex flex-col flex-1 min-h-0 font-mono text-sm">
      <div className="shrink-0 pb-1" style={{ color: RAIL }}>{controls}</div>
      <div ref={viewerRef} className="flex-1 min-h-0">{viewer}</div>
    </div>
  );
};

export default Workspace;
