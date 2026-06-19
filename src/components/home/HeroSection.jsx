// src/components/home/HeroSection.jsx
import { useEffect, useRef, useState } from 'react';
import { useNews } from '../../utils/useNews';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { ASCII_BANNER, SITE } from '../../config/theme';

const SESSION_KEY = 'shelnet_booted';

const HeroSection = () => {
  const { newsText } = useNews();
  const counts = useResourceCounts();

  // Build boot lines from live data. `null` count renders as "—".
  const n = (v) => (v == null ? '—' : v);
  const lines = [
    { html: <><span className="text-white/40">[ <span className="text-emerald-400">0.00</span> ] shelnet kernel {SITE.version} — booting userland…</span></> },
    { html: <><span className="text-emerald-400">[  OK  ]</span> mounting <span className="text-red-400">/pbqs</span> <span className="text-white/20">······</span> <span className="text-white/40">{n(counts.pbqs)} simulations</span></> },
    { html: <><span className="text-emerald-400">[  OK  ]</span> mounting <span className="text-blue-400">/exams</span> <span className="text-white/20">·····</span> <span className="text-white/40">{n(counts.exams)} mock tests</span></> },
    { html: <><span className="text-emerald-400">[  OK  ]</span> mounting <span className="text-purple-400">/visualizations</span> <span className="text-white/40">{n(counts.viz)} modules</span></> },
    { html: <><span className="text-emerald-400">[  OK  ]</span> mounting <span className="text-orange-400">/labs</span> <span className="text-white/20">······</span> <span className="text-white/40">{n(counts.labs)} writeups</span></> },
    { html: <><span className="text-emerald-400">[  OK  ]</span> security: <span className="text-white">trackers=0  paywall=none  cost=$0.00</span></> },
    { html: <><span className="text-white/40">[ <span className="text-emerald-400">feed</span> ] {newsText ? newsText.split('\n')[0] : 'latest updates loading…'}</span></> },
  ];

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyBooted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';

  // visibleCount: how many boot lines are shown. Start fully shown if reduced/already booted.
  const [visibleCount, setVisibleCount] = useState(prefersReduced || alreadyBooted ? lines.length : 0);
  const [finished, setFinished] = useState(prefersReduced || alreadyBooted);
  const timer = useRef(null);

  const finishNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisibleCount(lines.length);
    setFinished(true);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  };

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

  // Skip on any key/click/scroll.
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

  // After boot completes, Enter key scrolls to #resources.
  useEffect(() => {
    if (!finished) return;
    const onEnter = (e) => { if (e.key === 'Enter') scrollToBrowser(); };
    window.addEventListener('keydown', onEnter);
    return () => window.removeEventListener('keydown', onEnter);
  }, [finished]);

  const scrollToBrowser = () => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToAbout = () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden glow-green">
      <div className="absolute inset-0 bg-scanlines pointer-events-none" aria-hidden="true" />
      <div className="max-w-3xl w-full mx-auto relative z-10 font-mono text-sm md:text-base">
        {/* Banner: ASCII on desktop, wordmark on mobile */}
        <pre className="hidden sm:block text-emerald-400 text-[10px] md:text-xs leading-tight whitespace-pre"
             style={{ textShadow: '0 0 14px rgba(52,211,153,.4)' }} aria-label="SHELNET">{ASCII_BANNER}</pre>
        <div className="sm:hidden font-display text-4xl font-bold text-emerald-400">SHELNET_</div>
        <div className="text-white/45 text-xs mt-1 mb-5">{SITE.version} · open-source cybersecurity education</div>

        {/* Boot log */}
        <div className="space-y-1 leading-relaxed min-h-[200px]">
          {lines.slice(0, visibleCount).map((l, idx) => (
            <div key={idx}>{l.html}</div>
          ))}
        </div>

        {/* Login + CTAs (only after boot completes) */}
        {finished && (
          <>
            <div className="mt-4">
              <span className="text-emerald-400">shelnet login:</span> <span className="text-white">guest</span>
              <span className="text-white/40"> — press </span>
              <span className="border border-white/30 rounded px-1.5 text-xs">enter</span>
              <span className="text-white/40"> to start</span>
              <span className="inline-block w-2 h-4 bg-emerald-400 align-text-bottom ml-1 animate-pulse" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={scrollToBrowser}
                className="px-4 py-2 bg-emerald-400 text-black font-bold rounded text-sm hover:bg-emerald-300 transition-colors btn-scanline">
                ▸ Try a PBQ
              </button>
              <button onClick={scrollToAbout}
                className="px-4 py-2 border border-white/25 text-white rounded text-sm hover:bg-white/5 transition-colors">
                $ man shelnet
              </button>
            </div>
          </>
        )}
      </div>

      {/* Scroll cue */}
      {finished && (
        <button onClick={scrollToBrowser}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono hover:text-emerald-400 transition-colors">
          scroll to browse the filesystem
          <span className="block text-emerald-400 text-base animate-bounce reduce-static">▾</span>
        </button>
      )}
    </section>
  );
};

export default HeroSection;
