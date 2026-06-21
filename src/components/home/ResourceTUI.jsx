// src/components/home/ResourceTUI.jsx
// The ~/resources hub rendered as a `tree`: the four category dirs each expanded
// to their children (certs/viz from the manifest, planned labs shown dim, notes
// as a live external vault). Clickable leaves open the resource directly; dirs
// open their page. Keyboard-navigable (↑↓ ↵/→ 1-4 esc); one render for all widths.
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { useManifest } from '../../utils/useManifest';
import { getCerts, getVisualizations } from '../../utils/manifestService';
import { COMING_LABS } from '../../config/labsShowcase';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const accentHex = (a) => (ACCENTS[a] || ACCENTS.green).hex;

// Glyph prefixes from a node's position in the tree.
const dirGlyph = (isLast) => (isLast ? '└─ ' : '├─ ');
const leafGlyph = (dirLast, leafLast) => `${dirLast ? '   ' : '│  '}${leafLast ? '└─ ' : '├─ '}`;

// One tree row: [▸ cursor gutter][tree glyphs][label][meta][hover ▸]. A row is
// interactive only when `onOpen` is provided (dim/coming rows pass none).
const Row = ({ prefix, label, meta, labelHex, bold = false, dim = false, on = false, onOpen, onHover }) => {
  const interactive = !!onOpen;
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onOpen}
      onMouseEnter={onHover}
      aria-current={on ? 'true' : undefined}
      className={`group flex w-full items-baseline rounded-sm -mx-1.5 px-1.5 text-left ${
        on ? 'bg-[#43c08c]/[0.12]' : interactive ? 'hover:bg-[#43c08c]/10' : 'cursor-default'
      }`}
    >
      <span className="w-[2ch] shrink-0 whitespace-pre" style={{ color: GREEN }} aria-hidden="true">{on ? '▸' : ' '}</span>
      <span className="shrink-0 whitespace-pre text-white/30" aria-hidden="true">{prefix}</span>
      <span
        className={dim ? 'text-white/30' : bold ? 'font-semibold' : 'text-white/70'}
        style={labelHex && !dim ? { color: labelHex } : undefined}
      >{label}</span>
      {meta && <span className="ml-2 text-white/40">{meta}</span>}
      {interactive && (
        <span className="ml-auto pl-3 text-[#43c08c] opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-60" aria-hidden="true">▸</span>
      )}
    </button>
  );
};

// Inline retry row shown under a dynamic dir when the manifest is unreachable.
const ErrorRow = ({ prefix }) => (
  <button
    type="button"
    onClick={() => window.location.reload()}
    className="group flex w-full items-baseline rounded-sm -mx-1.5 px-1.5 text-left hover:bg-rose-500/10"
  >
    <span className="w-[2ch] shrink-0" aria-hidden="true">{' '}</span>
    <span className="shrink-0 whitespace-pre text-white/30" aria-hidden="true">{prefix}</span>
    <span className="text-rose-400">! offline</span>
    <span className="ml-2 text-white/40"><span style={{ color: GREEN }}>↵</span> retry</span>
  </button>
);

// Ordered directory model from the manifest + local config.
function buildDirs(manifest, loading, error) {
  const certs = getCerts(manifest).filter((c) => !c.locked);
  const viz = getVisualizations(manifest);
  const dyn = (rows, mapFn) => (error ? [{ error: true }] : rows.map(mapFn));
  const countMeta = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return [
    {
      key: 'certs', label: 'certs/', to: '/resources/certs', accent: 'red',
      meta: loading && !certs.length ? '…' : countMeta(certs.length, 'track'),
      leaves: dyn(certs, (c) => ({ label: c.label, meta: c.code, to: `/resources/certs/${c.slug}` })),
    },
    {
      key: 'labs', label: 'labs/', to: '/resources/labs', accent: 'orange',
      meta: `soon · ${COMING_LABS.length} planned`,
      leaves: COMING_LABS.map((name) => ({ label: name, dim: true })),
    },
    {
      key: 'visualizations', label: 'visualizations/', to: '/resources/visualizations', accent: 'purple',
      meta: loading && !viz.length ? '…' : countMeta(viz.length, 'module'),
      leaves: dyn(viz, (v) => ({ label: v.title, to: `/resources/visualizations?m=${v.id}` })),
    },
    {
      key: 'notes', label: 'notes/', to: '/resources/notes', accent: 'slate',
      meta: null, live: true, leaves: [],
    },
  ];
}

const ResourceTUI = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useManifest();

  const dirs = buildDirs(manifest, loading, error);

  // Flat, render-ordered list of focusable nodes: each dir then its openable leaves.
  const flat = [];
  dirs.forEach((d, di) => {
    flat.push({ kind: 'dir', dirIndex: di, to: d.to });
    d.leaves.forEach((lf) => { if (lf.to) flat.push({ kind: 'leaf', to: lf.to }); });
  });

  const [sel, setSel] = useState(0);
  const cursorTo = flat[sel]?.to ?? null;
  const selectTo = (to) => setSel(flat.findIndex((n) => n.to === to));

  const open = useCallback((to) => { if (to) navigate(to); }, [navigate]);

  // Keep the latest nav model in a ref so the window key handler (bound once)
  // reads current values without taking the freshly-derived `flat`/`sel` as
  // effect deps, which would re-bind every render and trip exhaustive-deps.
  const navRef = useRef({ flat, sel });
  useEffect(() => { navRef.current = { flat, sel }; });

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/'); return; }
      const { flat, sel } = navRef.current;
      if (!flat.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((n) => (n + 1) % flat.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((n) => (n - 1 + flat.length) % flat.length); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); open(flat[sel]?.to); }
      else if (/^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const di = Number(e.key) - 1;
        const target = flat.findIndex((n) => n.kind === 'dir' && n.dirIndex === di);
        if (target >= 0) setSel(target);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, navigate]);

  const leafTotal = dirs.reduce((n, d) => n + d.leaves.filter((l) => l.to).length, 0);

  return (
    <TerminalShell>
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/40 mb-3">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~</span>$ tree resources/
        </div>

        <div style={{ color: GREEN }}>resources/</div>

        {dirs.map((d, di) => {
          const dirLast = di === dirs.length - 1;
          return (
            <div key={d.key}>
              <Row
                prefix={dirGlyph(dirLast)}
                on={cursorTo === d.to}
                bold
                labelHex={accentHex(d.accent)}
                label={d.label}
                meta={d.live
                  ? (<><span style={{ color: GREEN }}>● LIVE</span> <span className="text-white/40">Obsidian vault ↗</span></>)
                  : d.meta}
                onOpen={() => { selectTo(d.to); open(d.to); }}
                onHover={() => selectTo(d.to)}
              />
              {d.leaves.map((lf, li) => {
                const leafLast = li === d.leaves.length - 1;
                if (lf.error) return <ErrorRow key={li} prefix={leafGlyph(dirLast, leafLast)} />;
                return (
                  <Row
                    key={li}
                    prefix={leafGlyph(dirLast, leafLast)}
                    on={cursorTo === lf.to}
                    dim={lf.dim}
                    label={lf.label}
                    meta={lf.meta}
                    onOpen={lf.to ? () => { selectTo(lf.to); open(lf.to); } : undefined}
                    onHover={lf.to ? () => selectTo(lf.to) : undefined}
                  />
                );
              })}
            </div>
          );
        })}

        <div className="mt-3 text-white/25">{leafTotal} resources · {dirs.length} directories · all free, no signup</div>
        <div className="mt-1 text-white/55">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/resources</span>$
          <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse reduce-static" style={{ backgroundColor: GREEN }} aria-hidden="true" />
        </div>
      </div>
    </TerminalShell>
  );
};

export default ResourceTUI;
