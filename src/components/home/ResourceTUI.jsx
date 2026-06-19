// src/components/home/ResourceTUI.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';
import { RESOURCE_TREE } from '../../config/resourceTree';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { labs } from '../../data/labs';
import { themeColors } from '../../config/themeColors';

const ACCENT_HL = {
  green: 'bg-emerald-500/14', red: 'bg-red-500/14', blue: 'bg-blue-500/14',
  purple: 'bg-purple-500/14', orange: 'bg-orange-500/14', slate: 'bg-slate-500/14',
};
const ACCENT_BAR = {
  green: 'shadow-[inset_2px_0_0_#34d399]', red: 'shadow-[inset_2px_0_0_#fb7185]',
  blue: 'shadow-[inset_2px_0_0_#38bdf8]', purple: 'shadow-[inset_2px_0_0_#c084fc]',
  orange: 'shadow-[inset_2px_0_0_#fb923c]', slate: 'shadow-[inset_2px_0_0_#cbd5e1]',
};

const ResourceTUI = () => {
  const counts = useResourceCounts();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  // Inject live lab items into the labs directory.
  const tree = RESOURCE_TREE.map((dir) =>
    dir.key === 'labs'
      ? { ...dir, items: labs.map((l) => ({
          tag: l.type === 'hardware' ? 'HW' : 'VM', accent: 'orange',
          name: l.name, desc: l.description, to: `/labs/${l.slug}`,
        })) }
      : dir
  );

  const countFor = (dir) => (dir.countKey ? counts[dir.countKey] : 'live');
  const current = tree[active];

  const openItem = (item) => {
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
  };

  // Keyboard nav within the tree (progressive enhancement).
  const onTreeKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % tree.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => (i - 1 + tree.length) % tree.length); }
    if (e.key === 'Enter' && current.items[0]) { e.preventDefault(); openItem(current.items[0]); }
  };

  return (
    <section id="resources" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Prompt command="cd /resources && ls -la" accent="green" className="mb-4" />
        <TuiFrame
          accent="green"
          titleLeft="┤ shelnet · ~/resources ├"
          titleRight={`${tree.length} dirs`}
          footerLeft="↑↓ select · enter open"
          footerRight="free · open-source · no-login"
        >
          <div className="grid md:grid-cols-[230px_1fr] min-h-[320px]">
            {/* Tree */}
            <div
              tabIndex={0}
              onKeyDown={onTreeKey}
              className="border-b md:border-b-0 md:border-r border-emerald-500/25 p-2 outline-none focus:bg-white/[0.02]"
              aria-label="Resource directories"
            >
              {tree.map((dir, i) => (
                <button
                  key={dir.key}
                  onClick={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left text-sm transition-colors
                    ${i === active ? `${ACCENT_HL[dir.accent]} text-white ${ACCENT_BAR[dir.accent]}` : 'text-white/65 hover:bg-white/5'}`}
                >
                  <span>{i === active ? '▸ ' : '  '}{dir.label}</span>
                  <span className="text-white/40 text-xs">{countFor(dir) ?? '—'}</span>
                </button>
              ))}
            </div>

            {/* Contents */}
            <div className="p-4">
              <div className="font-display text-lg font-bold text-white">{current.title}</div>
              <div className="text-white/40 text-xs mb-4">~/resources/{current.label} — {current.sub}</div>
              <div className="space-y-2">
                {current.items.map((item, i) => {
                  const c = themeColors[item.accent] || themeColors.green;
                  return (
                    <button
                      key={i}
                      onClick={() => openItem(item)}
                      className={`w-full flex items-center gap-3 text-left p-3 rounded border ${c.border} bg-white/[0.02] ${c.hoverBorder} ${c.bgHover} transition-colors`}
                    >
                      <span className={`text-[9px] font-bold px-2 py-1 rounded ${c.bgActive} ${c.text} min-w-[64px] text-center`}>{item.tag}</span>
                      <span>
                        <span className="block text-white text-sm font-bold">{item.name}</span>
                        <span className="block text-white/45 text-xs">{item.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TuiFrame>
      </div>
    </section>
  );
};

export default ResourceTUI;
