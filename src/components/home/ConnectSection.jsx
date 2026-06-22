// src/components/home/ConnectSection.jsx
// The /connect identity page: a bare-TTY `dig luigi` card listing the 3 ways to
// reach the maintainer. Keyboard-navigable (up/down select, enter or right opens,
// 1-3 jump, esc home). The 3 channel links are the real, accessible content; the
// card is centered in the viewport.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { Panel } from '../tui/ascii';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const PANEL_HEX = '#2f6b4b'; // muted green chrome

const CHANNELS = [
  { id: 'youtube',  label: 'youtube',  hex: ACCENTS.red.hex,  handle: '@Shelnet',
    href: 'https://youtube.com/@Shelnet',
    desc: 'Video explanations of PBQs & visualizations' },
  { id: 'linkedin', label: 'linkedin', hex: ACCENTS.blue.hex, handle: '/in/luigi-fernandez',
    href: 'https://linkedin.com/in/luigi-fernandez-502647333',
    desc: 'Connect with me' },
  { id: 'email',    label: 'email',    hex: '#e8eef0',        handle: 'forms.gle ↗',
    href: 'https://forms.gle/WRM23ktXNZiupPaZA',
    desc: 'Resource requests & business inquiries' },
];

const FIELDS = [
  ['Login', 'luigi'],
  ['Name', 'Luigi Fernandez'],
  ['Role', 'maintainer'],
  ['Host', 'shelnet.org'],
];

// One channel as an accessible link. Hover/focus moves the cursor; native
// click/enter opens the href in a new tab.
const ChannelRow = ({ ch, selected, onSelect }) => (
  <a
    href={ch.href}
    target="_blank"
    rel="noopener noreferrer"
    onMouseEnter={onSelect}
    onFocus={onSelect}
    onClick={onSelect}
    aria-label={`${ch.label}, ${ch.handle}, opens in new tab`}
    className={`flex items-baseline rounded-sm px-1 ${selected ? 'bg-[#43c08c]/[0.12]' : 'hover:bg-[#43c08c]/10'}`}
  >
    <span className="w-[2ch] shrink-0 whitespace-pre" style={{ color: GREEN }} aria-hidden="true">{selected ? '▸' : ' '}</span>
    <span className="w-[9ch] shrink-0" style={{ color: ch.hex }}>{ch.label}</span>
    <span className="w-[21ch] shrink-0 truncate text-white/80">{ch.handle}</span>
    <span className="hidden truncate text-white/40 md:inline">{ch.desc}</span>
  </a>
);

const IdentityCard = ({ selected, onSelect, className = '' }) => (
  <Panel hex={PANEL_HEX} title={<span style={{ color: GREEN }}>~/connect</span>} className={className}>
    {FIELDS.map(([k, v]) => (
      <div key={k} className="flex">
        <span className="w-[8ch] shrink-0 text-white/40">{k}</span>
        <span className="text-white/90">{v}</span>
      </div>
    ))}
    <div aria-hidden="true">{' '}</div>
    <div className="text-white/35">── channels ──</div>
    {CHANNELS.map((ch, i) => (
      <ChannelRow key={ch.id} ch={ch} selected={i === selected} onSelect={() => onSelect(i)} />
    ))}
  </Panel>
);

const Prompt = ({ path }) => (
  <>
    <span style={{ color: SHELL.dim }}>guest@shelnet</span>
    <span className="text-white/50">:</span>
    <span style={{ color: GREEN }}>{path}</span>
    <span className="text-white/50">$</span>
  </>
);

const ConnectSection = () => {
  const navigate = useNavigate();

  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  useEffect(() => { selectedRef.current = selected; });

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/'); return; }
      // When a channel link is focused, let native click/enter handle opening.
      if (tag === 'A') return;
      const n = CHANNELS.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => (s + 1) % n); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => (s - 1 + n) % n); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        const href = CHANNELS[selectedRef.current]?.href;
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
      } else if (/^[1-3]$/.test(e.key)) { e.preventDefault(); setSelected(Number(e.key) - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <TerminalShell center maxWidthClass="max-w-2xl">
      <div className="font-mono text-xs leading-relaxed md:text-sm">
        <div className="text-white/45"><Prompt path="~" /> dig luigi</div>

        <IdentityCard className="mt-2" selected={selected} onSelect={setSelected} />

        <div className="mt-3 text-white/55">
          <Prompt path="~/connect" />
          <span
            className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse reduce-static"
            style={{ backgroundColor: GREEN }}
            aria-hidden="true"
          />
        </div>
      </div>
    </TerminalShell>
  );
};

export default ConnectSection;
