// src/components/room/CeremonyLog.jsx
// The "load" ceremony: a pseudo-provisioning log that plays before a room opens,
// to make loading a module feel heavy and earned. Lines are hand-authored per
// module (module.ceremony: { toolkit, target }). Runtime is ~1.5-2.5s and
// skippable on any key/click; prefers-reduced-motion jumps straight to ready.
import { useEffect, useRef, useState } from 'react';
import { SHELL } from '../../config/theme';

const DOTS = (label) => {
  const pad = Math.max(1, 38 - label.length);
  return '.'.repeat(pad);
};

// Build the per-module log lines from its ceremony config.
function buildLog(module) {
  const { toolkit = [], target } = module.ceremony || {};
  const rows = [
    { t: '0.01', label: 'allocating lab vlan' },
    target && { t: '0.34', label: `spawning target host ${target}` },
    toolkit.length ? { t: '0.92', label: `mounting toolkit (${toolkit.join(', ')})` } : null,
    { t: '1.40', label: `loading lesson: ${module.name}` },
  ].filter(Boolean);
  return rows;
}

const CeremonyLog = ({ module, accentHex, onDone }) => {
  const rows = buildLog(module);
  const total = rows.length + 1; // +1 for the "ready" line

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [step, setStep] = useState(prefersReduced ? total : 0);
  const timer = useRef(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (timer.current) clearTimeout(timer.current);
    onDone?.();
  };

  // Reveal each line, then hand off to the room.
  useEffect(() => {
    if (prefersReduced) { timer.current = setTimeout(finish, 250); return () => clearTimeout(timer.current); }
    let current = 0;
    const advance = () => {
      current += 1;
      setStep(current);
      if (current >= total) { timer.current = setTimeout(finish, 420); return; }
      timer.current = setTimeout(advance, 260);
    };
    timer.current = setTimeout(advance, 260);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip the animation on any interaction.
  useEffect(() => {
    const skip = () => { setStep(total); finish(); };
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('click', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
      window.removeEventListener('wheel', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono text-sm leading-relaxed">
      <div className="flex items-baseline gap-2">
        <span className="whitespace-pre">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>
          <span className="text-white/40">:</span>
          <span style={{ color: SHELL.green }}>~/resources/modules</span>
          <span className="text-white/40">$</span>
        </span>
        <span className="text-white/90">load {module.slug}</span>
      </div>

      <div className="mt-2 space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} style={{ opacity: step > i ? 1 : 0, transition: prefersReduced ? undefined : 'opacity 90ms linear' }}>
            <span className="text-white/30">[{r.t}]</span>{' '}
            <span className="text-white/70">{r.label}</span>{' '}
            <span className="text-white/15" aria-hidden="true">{DOTS(r.label)}</span>{' '}
            <span className="text-emerald-400">ok</span>
          </div>
        ))}
        <div style={{ opacity: step >= total ? 1 : 0, transition: prefersReduced ? undefined : 'opacity 90ms linear' }}>
          <span style={{ color: accentHex }}>ready</span> <span className="text-white/40">&gt; entering room…</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/25">press any key to skip</div>
    </div>
  );
};

export default CeremonyLog;
