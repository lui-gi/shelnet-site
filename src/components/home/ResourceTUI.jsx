// src/components/home/ResourceTUI.jsx
// The ~/resources hub: a framed-ASCII two-pane index. Left = the four
// categories; right = a peek into the highlighted one (certs/viz from the
// manifest; labs "soon"; notes "● LIVE"). Open (→/↵/click) routes to the
// bespoke page. On phones it collapses to a single tappable list.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { TwoPane } from '../tui/ascii';
import { useManifest } from '../../utils/useManifest';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { getCerts, getVisualizations } from '../../utils/manifestService';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;

const CATS = [
  { key: 'certs',          label: 'certs/',          to: '/resources/certs' },
  { key: 'labs',           label: 'labs/',           to: '/resources/labs' },
  { key: 'visualizations', label: 'visualizations/', to: '/resources/visualizations' },
  { key: 'notes',          label: 'notes/',          to: '/resources/notes' },
];

const accentHex = (a) => (ACCENTS[a] || ACCENTS.green).hex;

const ResourceTUI = () => {
  const navigate = useNavigate();
  const counts = useResourceCounts();
  const { manifest, loading, error } = useManifest();
  const [sel, setSel] = useState(0);

  const peeks = {
    certs: getCerts(manifest).filter((c) => !c.locked).map((c) => ({ name: c.label, meta: c.code || '', accent: c.accent })),
    visualizations: getVisualizations(manifest).map((v) => ({ name: v.title, meta: '', accent: 'purple' })),
  };

  const open = useCallback((i) => { const c = CATS[i]; if (c) navigate(c.to); }, [navigate]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((n) => (n + 1) % CATS.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((n) => (n - 1 + CATS.length) % CATS.length); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); open(sel); }
      else if (e.key === 'Escape') { e.preventDefault(); navigate('/'); }
      else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); setSel(Number(e.key) - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, open, navigate]);

  const cur = CATS[sel];
  const countFor = (k) =>
    k === 'certs' ? (counts.certs ?? '-')
    : k === 'visualizations' ? (counts.viz ?? '-')
    : k === 'labs' ? 'soon'
    : 'live';

  const rightTitle =
    cur.key === 'certs' ? `certs/ · ${countFor('certs')} tracks`
    : cur.key === 'visualizations' ? `visualizations/ · ${countFor('visualizations')} modules`
    : cur.key === 'labs' ? 'labs/ · soon'
    : 'notes/ · ● LIVE';

  const renderPeek = () => {
    if (cur.key === 'labs') return <div className="text-white/40">soon: showcase under construction</div>;
    if (cur.key === 'notes') return <div style={{ color: '#cbd5e1' }}>Obsidian Vault <span className="text-emerald-300">● LIVE</span> <span className="text-white/40">↗</span></div>;
    if (error) return <div className="text-white/50">! peek offline <button type="button" onClick={() => window.location.reload()} style={{ color: GREEN }} className="hover:underline">↵ retry</button></div>;
    const rows = peeks[cur.key] || [];
    if (loading && !rows.length) return <div className="text-white/30">…</div>;
    if (!rows.length) return <div className="text-white/30">// nothing here yet</div>;
    return rows.map((r, i) => {
      const hex = accentHex(r.accent);
      return (
        <div key={i} className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="inline-block w-[2ch] shrink-0" style={{ color: GREEN }} aria-hidden="true">{i === 0 ? '▸' : ''}</span>
          <span style={{ color: hex }}>{r.name}</span>
          {r.meta && <span className="text-white/40 ml-auto pl-3">{r.meta}</span>}
        </div>
      );
    });
  };

  const catRows = CATS.map((c, i) => {
    const on = i === sel;
    return (
      <button
        key={c.key}
        type="button"
        onClick={() => open(i)}
        onMouseEnter={() => setSel(i)}
        aria-current={on ? 'page' : undefined}
        className="block w-full text-left whitespace-nowrap pr-[2ch] hover:text-white/90"
      >
        <span className="inline-block w-[2ch]" style={{ color: GREEN }} aria-hidden="true">{on ? '▸' : ''}</span>
        <span className={on ? 'text-white/90 font-semibold' : 'text-white/55'}>{c.label}</span>
      </button>
    );
  });

  return (
    <TerminalShell>
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/40 mb-2">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~</span>$ cd resources
        </div>

        {/* desktop: two-pane tree */}
        <div className="hidden md:block">
          <TwoPane
            hex="rgba(255,255,255,0.3)"
            leftTitle="resources"
            rightTitle={rightTitle}
            left={<div className="space-y-0.5">{catRows}</div>}
            right={renderPeek()}
          />
        </div>

        {/* mobile: single tappable list */}
        <div className="md:hidden">
          <div className="text-white/30 mb-1">~/resources</div>
          {CATS.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => open(i)}
              className="flex w-full items-baseline justify-between gap-2 py-2 text-left border-b border-white/[0.06]"
            >
              <span className="text-white/80">{c.label}</span>
              <span className="flex items-baseline gap-3">
                <span className="text-white/40 text-xs">{countFor(c.key)}</span>
                <span style={{ color: GREEN }}>›</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </TerminalShell>
  );
};

export default ResourceTUI;
