// src/components/home/ResourceTUI.jsx
// The ~/resources borderless two-pane explorer (/resources and /resources/:dir).
// Left = the top-level dirs (certs/labs/visualizations/notes); right = the
// highlighted dir's contents. Dir highlight is local: ↑↓ move it without
// navigating; →/↵ activate — browsable dirs (certs/labs/notes) reveal their
// contents pane, the visualizations destination dir opens its workspace, and an
// item opens its route / external link.
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { RESOURCE_TREE } from '../../config/resourceTree';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { useManifest } from '../../utils/useManifest';
import { getCerts } from '../../utils/manifestService';
import { labs } from '../../data/labs';
import { themeColors } from '../../config/themeColors';
import { ACCENTS, SHELL } from '../../config/theme';

const ResourceTUI = () => {
  const counts = useResourceCounts();
  const { manifest } = useManifest();
  const navigate = useNavigate();
  const { dir } = useParams();

  // Inject dynamic contents: certs from the manifest, labs from labs.js.
  const tree = useMemo(() => {
    const certItems = getCerts(manifest).map((c) => ({
      tag: c.code || 'CERT', accent: c.accent || 'green',
      name: c.label, desc: `${c.count} resource${c.count === 1 ? '' : 's'}`,
      to: `/resources/certs/${c.slug}`, peek: c.count,
    }));
    const labItems = labs.map((l) => ({
      tag: l.type === 'hardware' ? 'HW' : 'VM', accent: 'orange',
      name: l.name, desc: l.description, to: `/resources/labs/${l.slug}`,
    }));
    return RESOURCE_TREE.map((d) => {
      if (d.key === 'certs') return { ...d, items: certItems };
      if (d.key === 'labs') return { ...d, items: labItems };
      return d;
    });
  }, [manifest]);

  // Local dir highlight; the URL :dir only seeds the initial highlight.
  const indexForDir = (key) => Math.max(0, tree.findIndex((d) => d.key === key));
  const [dirIndex, setDirIndex] = useState(() => indexForDir(dir));
  const [pane, setPane] = useState('dirs');
  const [itemIndex, setItemIndex] = useState(0);

  // Resync when the URL dir changes (e.g. arriving from the hero menu).
  const [prevDir, setPrevDir] = useState(dir);
  if (dir !== prevDir) {
    setPrevDir(dir);
    setDirIndex(indexForDir(dir));
    setPane('dirs');
    setItemIndex(0);
  }

  const current = tree[dirIndex] || tree[0];
  const countFor = (d) => (d.countKey ? counts[d.countKey] : 'live');

  const activateDir = useCallback((i) => {
    const d = tree[i];
    if (!d) return;
    if (d.to) { navigate(d.to); return; }              // destination dir → workspace
    setDirIndex(i);
    if (d.items.length) { setPane('items'); setItemIndex(0); }
  }, [tree, navigate]);

  const openItem = useCallback((item) => {
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
  }, [navigate]);

  useEffect(() => {
    const items = current.items;
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (pane === 'items' && items.length) setItemIndex((n) => (n + 1) % items.length);
        else setDirIndex((n) => (n + 1) % tree.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (pane === 'items' && items.length) setItemIndex((n) => (n - 1 + items.length) % items.length);
        else setDirIndex((n) => (n - 1 + tree.length) % tree.length);
      } else if (e.key === 'ArrowRight') {
        if (pane === 'dirs') { e.preventDefault(); activateDir(dirIndex); }
      } else if (e.key === 'ArrowLeft') {
        if (pane === 'items') { e.preventDefault(); setPane('dirs'); }
      } else if (e.key === 'Enter') {
        if (tag === 'A') return;
        e.preventDefault();
        if (pane === 'items') { const it = items[itemIndex]; if (it) openItem(it); }
        else activateDir(dirIndex);
      } else if (e.key === 'Escape') {
        if (pane === 'items') { e.preventDefault(); setPane('dirs'); } else navigate('/');
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (tree[i]) { e.preventDefault(); setDirIndex(i); setPane('dirs'); setItemIndex(0); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, pane, itemIndex, dirIndex, tree, activateDir, openItem, navigate]);

  return (
    <TerminalShell>
      <div className="text-white/40 text-xs mb-3">total {current.items.length} · # {current.sub}</div>

      <div className="grid md:grid-cols-[180px_1fr]">
        {/* Directory tree */}
        <div className="pb-3 md:pb-0" aria-label="Resource directories">
          {tree.map((d, i) => {
            const on = i === dirIndex;
            return (
              <button key={d.key} type="button" onClick={() => activateDir(i)}
                aria-current={on ? 'page' : undefined}
                className={`flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm transition-colors
                  ${on ? 'font-semibold' : 'text-white/[0.62] hover:bg-white/[0.04] hover:text-white/90'}`}
                style={on ? { background: SHELL.green, color: '#000' } : undefined}>
                <span><span className="inline-block w-4">{on ? '▸' : ''}</span>{d.label}</span>
                <span className="text-xs" style={on ? { color: 'rgba(0,0,0,0.55)' } : { color: 'rgba(255,255,255,0.3)' }}>
                  {countFor(d) ?? '—'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contents of the highlighted dir */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5"
             aria-label="Directory contents">
          {current.items.map((item, i) => {
            const c = themeColors[item.accent] || themeColors.green;
            const hex = (ACCENTS[item.accent] || ACCENTS.green).hex;
            const isExt = !!item.href;
            const on = pane === 'items' && i === itemIndex;
            return (
              <button key={item.to || item.href || item.name} type="button" onClick={() => openItem(item)}
                onMouseEnter={() => { setPane('items'); setItemIndex(i); }}
                aria-current={on ? 'true' : undefined}
                className={`grid w-full grid-cols-[84px_1fr_auto] items-baseline gap-3 px-2 py-1.5 text-left transition-colors ${on ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'}`}
                style={on ? { boxShadow: `inset 2px 0 0 ${hex}` } : undefined}>
                <span className={`text-xs font-bold ${c.text}`}>{item.tag}</span>
                <span className="min-w-0 truncate">
                  <span className="text-white/90">
                    {item.name}
                    {isExt && <span style={{ color: hex }}> ↗</span>}
                  </span>
                  <span className="text-white/45 text-xs">&nbsp; {item.desc}</span>
                </span>
                {item.peek != null
                  ? <span className="text-white/30 text-xs whitespace-nowrap">{item.peek} <span style={{ color: hex }}>›</span></span>
                  : (item.to && !isExt ? <span className="text-white/30 text-xs"><span style={{ color: hex }}>›</span></span> : <span />)}
              </button>
            );
          })}
          {!current.items.length && (
            <div className="text-white/30 text-xs px-2 py-2">
              {current.to ? '// press → to open' : '// empty'}
            </div>
          )}
        </div>
      </div>
    </TerminalShell>
  );
};

export default ResourceTUI;
