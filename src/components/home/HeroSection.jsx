// src/components/home/HeroSection.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../../utils/useNews';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { ASCII_BANNER } from '../../config/theme';

const SESSION_KEY = 'shelnet_booted';
const GREEN = '#43c08c';   // banner + numbers + cursor
const ACCENT = '#7e9b86';  // dim phosphor: status markers + `guest`
const REVEAL_MS = 90;       // opacity-transition duration per line (reads as a crisp print)
const ALL_REVEALED = 999;   // step sentinel: every element shown (skip / reduced-motion / repeat visit)

// `to` => direct path (/bytes, /resources).
// `dir` => opens the file-explorer at /resources/<dir>.
// `anchor` => opens the matching route (/about, /connect).
const MENU = [
  { n: '1', cmd: './certs',     desc: 'A+ · Security+ · more',          dir: 'certs' },
  { n: '2', cmd: './bytes',     desc: 'rapid-fire practice · mobile',        to: '/bytes' },
  { n: '3', cmd: './resources', desc: 'labs · viz · notes',             to: '/resources' },
  { n: '4', cmd: 'man about',   desc: 'what is shelnet?',                         anchor: 'about' },
  { n: '5', cmd: './connect',   desc: 'newsletter · github · contact',  anchor: 'connect' },
];

const fmt = (v) => (v == null ? '-' : v);

// Bracketed status marker, e.g. [  OK  ]. `inner` is the padded 6-char label.
const Mark = ({ inner }) => (
  <>
    <span className="text-white/30">[</span>
    <span style={{ color: ACCENT }}>{inner}</span>
    <span className="text-white/30">]</span>
  </>
);

// Boot/mount log as an array of nodes. `narrow` trims leaders + uname for phones.
function buildLines(counts, newsText, narrow) {
  const feed = newsText ? newsText.split('\n')[0] : 'latest updates loading…';
  const sims = (counts.pbqs == null && counts.exams == null)
    ? null : (counts.pbqs || 0) + (counts.exams || 0);
  if (narrow) {
    const feedShort = feed.length > 22 ? `${feed.slice(0, 21)}…` : feed;
    return [
      <><Mark inner=" 0.00 " /> booting userland{'…'}</>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/certs</span>{'  '}<span className="text-white/55">{fmt(counts.certs)} tracks</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/bytes</span>{'  '}<span className="text-white/55">{fmt(counts.bytes)} qs</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/resrc</span>{' '}<span className="text-white/55">{fmt(counts.viz)} viz {'·'} {fmt(counts.labs)} labs</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">trackers=0 {'·'} $0.00</span></>,
      <><Mark inner=" feed " /> {feedShort}</>,
    ];
  }
  const dots = (s) => <span className="text-white/20" aria-hidden="true">{s}</span>;
  return [
    <><Mark inner=" 0.00 " /> shelnet kernel v3.0: booting userland{'…'}</>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/certs</span> {dots('···········')} <span className="text-white/55">{fmt(counts.certs)} tracks {'·'} {fmt(sims)} sims</span></>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/bytes</span> {dots('···········')} <span className="text-white/55">{fmt(counts.bytes)} questions</span></>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/resources</span> {dots('·······')} <span className="text-white/55">{fmt(counts.viz)} modules {'·'} {fmt(counts.labs)} labs</span></>,
    <><Mark inner="  OK  " /> security: <span className="text-white/90">trackers=0  paywall=none  cost=$0.00</span></>,
    <><Mark inner=" feed " /> {feed}</>,
  ];
}

const HeroSection = () => {
  const navigate = useNavigate();
  const { newsText } = useNews();
  const counts = useResourceCounts();

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyBooted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';

  // Responsive: condense the boot log + stats on phones.
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 639px)').matches : false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const lines = buildLines(counts, newsText, narrow);
  const stats = narrow
    ? ['SHELNET 3.0 LTS · tty3']
    : ['SHELNET GNU/Linux 3.0 LTS · tty3 · 80×24',
       'Linux shelnet 6.9.0-shelnet x86_64 · up 0:00 · load 0.00'];

  // Reveal-step boundaries (1-based); each element shows once `step` reaches its slot.
  const STATS_START = 2;                            // banner is step 1
  const LINES_START = STATS_START + stats.length;   // first boot-log line
  const LOGIN_STEP  = LINES_START + lines.length;   // login line
  const MENU_START  = LOGIN_STEP + 1;               // first menu row
  const PROMPT_STEP = MENU_START + MENU.length;     // prompt + cursor (final step)
  const TOTAL_STEPS = PROMPT_STEP;

  const initialDone = prefersReduced || alreadyBooted;
  const [step, setStep] = useState(initialDone ? ALL_REVEALED : 0);
  const [finished, setFinished] = useState(initialDone);
  const timer = useRef(null);

  // Opacity gate per element: reserves layout space (no shift) and prints in fast.
  const revealStyle = (slot) => ({
    opacity: step >= slot ? 1 : 0,
    transition: prefersReduced ? undefined : `opacity ${REVEAL_MS}ms linear`,
  });

  const complete = () => {
    if (timer.current) clearTimeout(timer.current);
    setStep(ALL_REVEALED);
    setFinished(true);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  };

  // Reveal each hero element in sequence (once per session), like a TTY booting.
  useEffect(() => {
    if (initialDone) return;
    // ms to wait *before* revealing the given step.
    const delayFor = (s) => {
      if (s <= 1) return 300;                 // banner
      if (s < LINES_START) return 150;        // uname/stats lines
      if (s < LOGIN_STEP) return 220;         // boot-log lines
      if (s === LOGIN_STEP) return 250;       // login line
      if (s < PROMPT_STEP) return 100;        // menu rows
      return 150;                             // prompt
    };
    let current = 0;
    const advance = () => {
      current += 1;
      setStep(current);
      if (current >= TOTAL_STEPS) { complete(); return; }
      timer.current = setTimeout(advance, delayFor(current + 1));
    };
    timer.current = setTimeout(advance, delayFor(1));
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip the boot animation on any interaction.
  useEffect(() => {
    if (finished) return;
    const skip = () => complete();
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('click', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
      window.removeEventListener('wheel', skip);
    };
  }, [finished]);

  // Index of the menu row the keyboard cursor sits on (↑↓ move it, ↵ selects).
  const [selected, setSelected] = useState(0);

  const activate = useCallback((item) => {
    if (item.to) navigate(item.to);              // direct path (/bytes, /resources)
    else if (item.dir) navigate(`/resources/${item.dir}`); // open the file-explorer here
    else if (item.anchor) navigate(`/${item.anchor}`);     // /about, /connect
  }, [navigate]);

  // After boot: ↑↓ move the cursor, ↵ opens it, and keys 1–6 jump straight in.
  useEffect(() => {
    if (!finished) return;
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => (s + 1) % MENU.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => (s - 1 + MENU.length) % MENU.length); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(MENU[selected]); }
      else {
        const item = MENU.find((m) => m.n === e.key);
        if (item) { e.preventDefault(); setSelected(MENU.indexOf(item)); activate(item); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, activate, selected]);

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-12 pb-12 [@media(min-height:900px)]:py-16 glow-green">
      <div className="w-fit max-w-full font-mono text-sm md:text-base">
        <pre aria-label="shelnet"
             className="mb-3 whitespace-pre text-[8px] leading-[1.1] sm:text-xs md:text-sm"
             style={{ color: GREEN, textShadow: '0 0 8px rgba(52,211,153,.28)', ...revealStyle(1) }}>{ASCII_BANNER}</pre>

        <div className="mb-2 space-y-0.5 text-white/30">
          {stats.map((s, i) => <div key={i} style={revealStyle(STATS_START + i)}>{s}</div>)}
        </div>

        <div className="space-y-0.5 leading-snug text-white/65" style={{ minHeight: narrow ? 148 : 168 }}>
          {lines.map((node, i) => <div key={i} style={revealStyle(LINES_START + i)}>{node}</div>)}
        </div>

        <div className="mt-3 text-white/55" style={revealStyle(LOGIN_STEP)}>
          shelnet login: <span style={{ color: ACCENT }}>guest</span>
          <span className="text-white/40">: ↑↓ + ↵, press 1–5, or click a destination:</span>
        </div>

        <nav className="mt-2" aria-label="Site sections">
          {MENU.map((item, i) => {
            const on = i === selected;
            return (
            <div key={item.n} style={revealStyle(MENU_START + i)}>
              <button onClick={() => activate(item)}
                onMouseEnter={() => setSelected(i)}
                aria-current={on ? 'true' : undefined}
                className={`flex w-full items-start gap-3 rounded px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60 ${on ? 'bg-[#43c08c]/10 ring-1 ring-[#43c08c]/40' : 'hover:bg-[#43c08c]/10'}`}>
                <span className="shrink-0 leading-6" style={{ color: GREEN }}>{item.n}</span>
                <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="text-white/90 sm:w-44">{item.cmd}</span>
                  <span className="text-xs text-white/40 sm:text-inherit">{item.desc}</span>
                </span>
              </button>
            </div>
            );
          })}
        </nav>

        <div className="mt-2 text-white/60" style={revealStyle(PROMPT_STEP)}>
          guest@shelnet:~$
          <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse reduce-static"
                style={{ backgroundColor: GREEN }} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
