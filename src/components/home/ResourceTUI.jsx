// src/components/home/ResourceTUI.jsx
// The ~/resources borderless two-pane explorer, rendered at /resources/:dir.
// Left = the directory tree; right = the active dir's children. Directory
// children (a-plus/, security-plus/) cd deeper; leaf/app items open their route;
// the external notes vault opens in a new tab. All inside the TerminalShell.
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { RESOURCE_TREE } from '../../config/resourceTree';
import { SUBDIR_NAME } from '../../config/resourcePaths';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { labs } from '../../data/labs';
import { themeColors } from '../../config/themeColors';
import { ACCENTS, SHELL } from '../../config/theme';

const ResourceTUI = () => {
  const counts = useResourceCounts();
  const navigate = useNavigate();
  const { dir } = useParams();

  // Inject live lab items into the labs directory (static otherwise).
  const tree = useMemo(() => RESOURCE_TREE.map((d) =>
    d.key === 'labs'
      ? { ...d, items: labs.map((l) => ({
          tag: l.type === 'hardware' ? 'HW' : 'VM', accent: 'orange',
          name: l.name, desc: l.description, to: `/labs/${l.slug}`,
        })) }
      : d
  ), []);

  const fromUrl = tree.findIndex((d) => d.key === dir);
  const active = fromUrl >= 0 ? fromUrl : 0;
  const current = tree[active];
  const isSubdir = current.key === 'pbqs' || current.key === 'exams';

  const countFor = (d) => (d.countKey ? counts[d.countKey] : 'live');
  const goDir = useCallback((key) => navigate(`/resources/${key}`), [navigate]);
  const openItem = useCallback((item) => {
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
  }, [navigate]);

  // Two-pane keyboard focus: 'dirs' (left tree) or 'items' (right contents).
  // A selected index tracks which row of the contents pane the cursor is on so
  // any item in a multi-item list is reachable — not just the first.
  const [pane, setPane] = useState('dirs');
  const [itemIndex, setItemIndex] = useState(0);

  // Changing directory resets the contents cursor back to the directory pane.
  // Done during render (not an effect) per React's "adjust state on prop change".
  const [prevDir, setPrevDir] = useState(dir);
  if (dir !== prevDir) { setPrevDir(dir); setPane('dirs'); setItemIndex(0); }

  // Keyboard nav: ↑↓ move within the focused pane · →/↵ drill into the contents
  // pane (↵ opens once there) · ←/Esc step back out · Esc at root → home ·
  // 1–9 jump directly to a directory.
  useEffect(() => {
    const items = current.items;
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (pane === 'items' && items.length) setItemIndex((n) => (n + 1) % items.length);
        else goDir(tree[(active + 1) % tree.length].key);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (pane === 'items' && items.length) setItemIndex((n) => (n - 1 + items.length) % items.length);
        else goDir(tree[(active - 1 + tree.length) % tree.length].key);
      } else if (e.key === 'ArrowRight') {
        if (pane === 'dirs' && items.length) { e.preventDefault(); setPane('items'); setItemIndex(0); }
      } else if (e.key === 'ArrowLeft') {
        if (pane === 'items') { e.preventDefault(); setPane('dirs'); }
      } else if (e.key === 'Enter') {
        if (tag === 'A') return; // let a focused link activate natively
        e.preventDefault();
        if (pane === 'items') { const it = items[itemIndex]; if (it) openItem(it); }
        else if (items.length) { setPane('items'); setItemIndex(0); }
      } else if (e.key === 'Escape') {
        if (pane === 'items') { e.preventDefault(); setPane('dirs'); } else navigate('/');
      } else if (/^[1-9]$/.test(e.key)) {
        const t = tree[Number(e.key) - 1]; if (t) { e.preventDefault(); goDir(t.key); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, current, pane, itemIndex, tree, goDir, openItem, navigate]);

  return (
    <TerminalShell center>
      {/* output-only: the bars carry the prompt/breadcrumb/exit */}
      <div className="text-white/40 text-xs mb-3">total {current.items.length} · # {current.sub}</div>

      <div className="grid md:grid-cols-[180px_1fr]">
        {/* Directory tree (always the same 5 dirs; URL picks the active row) */}
        <div className="pb-3 md:pb-0" aria-label="Resource directories">
          {tree.map((d, i) => {
            const on = i === active;
            return (
              <button key={d.key} type="button" onClick={() => goDir(d.key)}
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

        {/* Contents of the active directory */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5"
             aria-label="Directory contents">
          {current.items.map((item, i) => {
            const c = themeColors[item.accent] || themeColors.green;
            const hex = (ACCENTS[item.accent] || ACCENTS.green).hex;
            const isExt = !!item.href;
            const subdirName = isSubdir ? SUBDIR_NAME[item.to] : null;
            const peek = item.to ? counts.children?.[item.to] : null;
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
                    {subdirName ?? item.name}
                    {subdirName && <span style={{ color: hex }}>/</span>}
                    {isExt && <span style={{ color: hex }}> ↗</span>}
                  </span>
                  <span className="text-white/45 text-xs">&nbsp; {item.desc}</span>
                </span>
                {subdirName
                  ? <span className="text-white/30 text-xs whitespace-nowrap">{peek != null ? `${peek} ` : ''}<span style={{ color: hex }}>›</span></span>
                  : <span />}
              </button>
            );
          })}
        </div>
      </div>
    </TerminalShell>
  );
};

export default ResourceTUI;
