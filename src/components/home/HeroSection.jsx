// src/components/home/HeroSection.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../../utils/useNews';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { ASCII_BANNER } from '../../config/theme';

const SESSION_KEY = 'shelnet_booted';
const GREEN = '#43c08c';   // banner + numbers + cursor
const ACCENT = '#7e9b86';  // dim phosphor: status markers + `guest`

// `dir` => opens the file-explorer at /resources/<dir>.
// `anchor` => opens the matching route (/about · /connect).
const MENU = [
  { n: '1', cmd: './pbqs',           desc: 'performance-based questions',   dir: 'pbqs' },
  { n: '2', cmd: './exams',          desc: 'full-length mock exams',        dir: 'exams' },
  { n: '3', cmd: './labs',           desc: 'guided lab writeups',           dir: 'labs' },
  { n: '4', cmd: './visualizations', desc: 'interactive modules',           dir: 'visualizations' },
  { n: '5', cmd: 'man about',        desc: 'what is shelnet?',              anchor: 'about' },
  { n: '6', cmd: './connect',        desc: 'newsletter · github · contact', anchor: 'connect' },
];

const fmt = (v) => (v == null ? '—' : v);

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
  if (narrow) {
    const feedShort = feed.length > 22 ? `${feed.slice(0, 21)}…` : feed;
    return [
      <><Mark inner=" 0.00 " /> booting userland…</>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/pbqs</span>{'   '}<span className="text-white/55">{fmt(counts.pbqs)} sims</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/exams</span>{'  '}<span className="text-white/55">{fmt(counts.exams)} exams</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/viz</span>{'    '}<span className="text-white/55">{fmt(counts.viz)} modules</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">/labs</span>{'   '}<span className="text-white/55">{fmt(counts.labs)} writeups</span></>,
      <><Mark inner="  OK  " /> <span className="text-white/90">trackers=0 · $0.00</span></>,
      <><Mark inner=" feed " /> {feedShort}</>,
    ];
  }
  const dots = (s) => <span className="text-white/20" aria-hidden="true">{s}</span>;
  return [
    <><Mark inner=" 0.00 " /> shelnet kernel v3.0 — booting userland…</>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/pbqs</span> {dots('·················')} <span className="text-white/55">{fmt(counts.pbqs)} simulations</span></>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/exams</span> {dots('················')} <span className="text-white/55">{fmt(counts.exams)} mock tests</span></>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/visualizations</span> {dots('·······')} <span className="text-white/55">{fmt(counts.viz)} modules</span></>,
    <><Mark inner="  OK  " /> mounting <span className="text-white/90">/labs</span> {dots('·················')} <span className="text-white/55">{fmt(counts.labs)} writeups</span></>,
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

  const [visibleCount, setVisibleCount] = useState(prefersReduced || alreadyBooted ? lines.length : 0);
  const [finished, setFinished] = useState(prefersReduced || alreadyBooted);
  const timer = useRef(null);

  const finishNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisibleCount(lines.length);
    setFinished(true);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  };

  // Type the boot lines in sequence (once per session).
  useEffect(() => {
    if (prefersReduced || alreadyBooted) return;
    let i = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i >= lines.length) { finishNow(); return; }
      timer.current = setTimeout(tick, 230);
    };
    timer.current = setTimeout(tick, 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip the boot animation on any interaction.
  useEffect(() => {
    if (finished) return;
    const skip = () => finishNow();
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('click', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
      window.removeEventListener('wheel', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const activate = useCallback((item) => {
    if (item.dir) navigate(`/resources/${item.dir}`);  // open the file-explorer here
    else if (item.anchor) navigate(`/${item.anchor}`); // /about · /connect
  }, [navigate]);

  // After boot, keys 1–6 trigger the matching menu item.
  useEffect(() => {
    if (!finished) return;
    const onKey = (e) => {
      const item = MENU.find((m) => m.n === e.key);
      if (item) { e.preventDefault(); activate(item); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished, activate]);

  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-8 [@media(min-height:900px)]:py-16 glow-green">
      <div className="w-fit max-w-full font-mono text-sm md:text-base">
        <pre aria-label="shelnet"
             className="mb-3 whitespace-pre text-[8px] leading-[1.1] sm:text-xs md:text-sm"
             style={{ color: GREEN, textShadow: '0 0 8px rgba(52,211,153,.28)' }}>{ASCII_BANNER}</pre>

        <div className="mb-2 space-y-0.5 text-white/30">
          {stats.map((s, i) => <div key={i}>{s}</div>)}
        </div>

        <div className="space-y-0.5 leading-snug text-white/65" style={{ minHeight: narrow ? 148 : 168 }}>
          {lines.slice(0, visibleCount).map((node, i) => <div key={i}>{node}</div>)}
        </div>

        {finished && (
          <>
            <div className="mt-3 text-white/55">
              shelnet login: <span style={{ color: ACCENT }}>guest</span>
              <span className="text-white/40"> — press a key or click a destination:</span>
            </div>

            <nav className="mt-2" aria-label="Site sections">
              {MENU.map((item) => (
                <button key={item.n} onClick={() => activate(item)}
                  className="flex w-full items-start gap-3 rounded px-2 py-1.5 text-left transition-colors hover:bg-[#43c08c]/10 focus-visible:bg-[#43c08c]/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60">
                  <span className="shrink-0 leading-6" style={{ color: GREEN }}>{item.n}</span>
                  <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="text-white/90 sm:w-44">{item.cmd}</span>
                    <span className="text-xs text-white/40 sm:text-inherit">{item.desc}</span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-2 text-white/60">
              guest@shelnet:~$
              <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse reduce-static"
                    style={{ backgroundColor: GREEN }} aria-hidden="true" />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
