// src/components/home/ResourceTUI.jsx
// The ~/resources hub: a two-pane index. Left = the four categories; right =
// a peek into the highlighted one (certs/viz from the manifest; labs "soon";
// notes "● LIVE"). Open (→/↵/click) routes to the bespoke page.
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { useManifest } from '../../utils/useManifest';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { getCerts, getVisualizations } from '../../utils/manifestService';
import { ACCENTS, SHELL } from '../../config/theme';

const CATS = [
  { key: 'certs',          label: 'certs/',          to: '/resources/certs' },
  { key: 'labs',           label: 'labs/',           to: '/resources/labs' },
  { key: 'visualizations', label: 'visualizations/', to: '/resources/visualizations' },
  { key: 'notes',          label: 'notes/',          to: '/resources/notes' },
];

const ResourceTUI = () => {
  const navigate = useNavigate();
  const counts = useResourceCounts();
  const { manifest, loading } = useManifest();
  const [sel, setSel] = useState(0);

  const peeks = useMemo(() => ({
    certs: getCerts(manifest).map((c) => ({ name: c.label, meta: c.code || '', accent: c.accent })),
    visualizations: getVisualizations(manifest).map((v) => ({ name: v.title, meta: '', accent: 'purple' })),
  }), [manifest]);

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
    k === 'certs' ? (counts.certs ?? '—')
    : k === 'visualizations' ? (counts.viz ?? '—')
    : k === 'labs' ? 'soon'
    : 'live';

  const renderPeek = () => {
    if (cur.key === 'labs') return <div className="text-white/40">soon — showcase under construction</div>;
    if (cur.key === 'notes') return <div style={{ color: '#cbd5e1' }}>Obsidian Vault <span className="text-emerald-300">● LIVE</span> <span className="text-white/40">↗</span></div>;
    const rows = peeks[cur.key] || [];
    if (loading && !rows.length) return <div className="text-white/30">…</div>;
    if (!rows.length) return <div className="text-white/30">// nothing here yet</div>;
    return rows.map((r, i) => {
      const hex = (ACCENTS[r.accent] || ACCENTS.green).hex;
      return (
        <div key={i} className="flex items-baseline gap-2 px-1 py-0.5">
          <span style={{ color: hex }}>{r.name}</span>
          {r.meta && <span className="text-white/40 text-xs">{r.meta}</span>}
        </div>
      );
    });
  };

  return (
    <TerminalShell>
      <div className="text-white/40 text-xs mb-3"># pick a section — →/↵ to open</div>
      <div className="grid md:grid-cols-[200px_1fr] font-mono text-sm">
        {/* categories */}
        <div aria-label="Resource categories">
          {CATS.map((c, i) => {
            const on = i === sel;
            return (
              <button key={c.key} type="button"
                onClick={() => open(i)} onMouseEnter={() => setSel(i)}
                aria-current={on ? 'page' : undefined}
                className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left transition-colors
                  ${on ? 'font-semibold' : 'text-white/[0.62] hover:bg-white/[0.04] hover:text-white/90'}`}
                style={on ? { background: SHELL.green, color: '#000' } : undefined}>
                <span><span className="inline-block w-4">{on ? '▸' : ''}</span>{c.label}</span>
                <span className="text-xs" style={on ? { color: 'rgba(0,0,0,0.55)' } : { color: 'rgba(255,255,255,0.3)' }}>
                  {countFor(c.key)} <span style={{ color: on ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.3)' }}>›</span>
                </span>
              </button>
            );
          })}
        </div>
        {/* peek (desktop only) */}
        <div className="hidden md:block border-l border-white/10 pl-5" aria-label="Section peek">
          <div className="text-white/30 text-xs mb-2">{cur.label}</div>
          {renderPeek()}
        </div>
      </div>
    </TerminalShell>
  );
};

export default ResourceTUI;
