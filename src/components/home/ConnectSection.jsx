// src/components/home/ConnectSection.jsx
// The /connect identity page: a bare-TTY `finger luigi` card whose channels show
// live (synthetic) ping telemetry, over a raw scrolling ping-reply log that fills
// the column. Keyboard-navigable (up/down select, enter or right opens, 1-3 jump,
// esc home). The ping data is decorative and aria-hidden; the 3 channel links are
// the real, accessible content.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../tui/TerminalShell';
import { Panel } from '../tui/ascii';
import { ACCENTS, SHELL } from '../../config/theme';
import { useChannelPings, sparkline } from '../../utils/useChannelPings';

const GREEN = SHELL.green;
const PANEL_HEX = '#2f6b4b'; // muted green chrome shared by both panels

const CHANNELS = [
  { id: 'youtube',  label: 'youtube',  hex: ACCENTS.red.hex,  handle: '@Shelnet',
    href: 'https://youtube.com/@Shelnet',
    desc: 'Video explanations of PBQs & visualizations',
    host: 'youtube.com',  ip: '142.250.190.78', baseMs: 12 },
  { id: 'linkedin', label: 'linkedin', hex: ACCENTS.blue.hex, handle: '/in/luigi-fernandez',
    href: 'https://linkedin.com/in/luigi-fernandez-502647333',
    desc: 'Connect with me',
    host: 'linkedin.com', ip: '13.107.42.14',  baseMs: 8 },
  { id: 'email',    label: 'email',    hex: '#e8eef0',        handle: 'forms.gle ↗',
    href: 'https://forms.gle/WRM23ktXNZiupPaZA',
    desc: 'Resource requests & business inquiries',
    host: 'forms.gle',    ip: '142.251.16.100', baseMs: 31 },
];

const FIELDS = [
  ['Login', 'luigi'],
  ['Name', 'Luigi Fernandez'],
  ['Role', 'maintainer'],
  ['Host', 'shelnet.org'],
];

// Subscribe to the OS reduced-motion preference (used to freeze the stream).
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// One channel as an accessible link with inline live RTT + sparkline. Hover/focus
// moves the cursor; native click/enter opens the href in a new tab.
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
    <span className="w-[7ch] shrink-0 text-right text-white/45" aria-hidden="true">{ch.lastMs.toFixed(0)}ms</span>
    <span className="w-[10ch] shrink-0 pl-[1ch] whitespace-pre" style={{ color: GREEN }} aria-hidden="true">{sparkline(ch.history)}</span>
    <span className="hidden truncate pl-[1ch] text-white/40 md:inline">{ch.desc}</span>
  </a>
);

const IdentityCard = ({ channels, selected, onSelect, className = '' }) => (
  <Panel hex={PANEL_HEX} title={<span style={{ color: GREEN }}>~/connect</span>} className={className}>
    {FIELDS.map(([k, v]) => (
      <div key={k} className="flex">
        <span className="w-[8ch] shrink-0 text-white/40">{k}</span>
        <span className="text-white/90">{v}</span>
      </div>
    ))}
    <div aria-hidden="true">{' '}</div>
    <div className="text-white/35">── channels ── <span style={{ color: GREEN }}>live ↻</span></div>
    {channels.map((ch, i) => (
      <ChannelRow key={ch.id} ch={ch} selected={i === selected} onSelect={() => onSelect(i)} />
    ))}
  </Panel>
);

const LogLine = ({ reply }) => {
  if (reply.timeout) {
    return <div className="whitespace-nowrap text-white/25">request timeout for icmp_seq={reply.seq}</div>;
  }
  const c = reply.channel;
  return (
    <div className="whitespace-nowrap text-white/35">
      64 bytes from <span style={{ color: c.hex }}>{c.host}</span>
      <span className="hidden md:inline"> ({c.ip})</span>: icmp_seq={reply.seq}
      <span className="hidden md:inline"> ttl={reply.ttl}</span> time={reply.ms.toFixed(1)} ms
    </div>
  );
};

const PingLog = ({ log, className = '' }) => (
  <div className={`flex min-h-0 flex-1 flex-col ${className}`} aria-hidden="true">
    <Panel hex={PANEL_HEX} title={<span style={{ color: GREEN }}>ping channels</span>} fill className="min-h-0 flex-1">
      {log.map((r) => <LogLine key={r.id} reply={r} />)}
    </Panel>
  </div>
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
  const reducedMotion = usePrefersReducedMotion();
  const { channels, log } = useChannelPings(CHANNELS, reducedMotion);

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
    <TerminalShell fill>
      <div className="mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col font-mono text-xs leading-relaxed md:text-sm">
        <div className="shrink-0 text-white/45"><Prompt path="~" /> finger luigi</div>

        <IdentityCard
          className="mt-2 shrink-0"
          channels={channels}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="mt-3 shrink-0 text-white/45"><Prompt path="~" /> ping channels</div>

        <PingLog className="mt-2" log={log} />

        <div className="mt-3 flex shrink-0 items-center justify-between text-white/30">
          <span><span style={{ color: GREEN }}>●</span> {CHANNELS.length} channels online</span>
          <span>
            <Prompt path="~/connect" />
            <span
              className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse reduce-static"
              style={{ backgroundColor: GREEN }}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </TerminalShell>
  );
};

export default ConnectSection;
