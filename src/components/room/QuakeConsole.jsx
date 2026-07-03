// src/components/room/QuakeConsole.jsx
// A persistent bottom dock under the open room that reads as a real prompt at
// rest ("guest@shelnet:~/resources/modules/<slug>$ … summon `") and, on click or
// backtick (`), opens a centered modal terminal with a blurred backdrop. From
// the modal you can run lobby commands (help / list / load <other> / clear) and
// `exit`. Loading another module swaps the room; `exit` (or Escape from the
// closed dock) returns to the full-screen lobby.
//
// The prompt glyph + cursor stay SHELL.green regardless of the room accent, for
// continuity with the lobby terminal.
import { useEffect, useRef, useState } from 'react';
import { runCommand } from '../terminal/commands';
import { loadStore } from '../../utils/moduleProgress';
import { SHELL } from '../../config/theme';

const norm = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

const TONE = {
  out: 'text-white/75', sys: 'text-white/45', ok: 'text-emerald-400',
  warn: 'text-amber-400', err: 'text-rose-400', accent: 'text-white/70',
};

const Prompt = ({ path }) => (
  <span className="shrink-0 whitespace-pre">
    <span style={{ color: SHELL.dim }}>guest@shelnet</span>
    <span className="text-white/40">:</span>
    <span style={{ color: SHELL.green }}>{path}</span>
    <span className="text-white/40">$</span>
  </span>
);

const QuakeConsole = ({ slug, manifest, accentHex, onLoad, onExit }) => {
  const [open, setOpen] = useState(false);
  const [buffer, setBuffer] = useState([]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const path = `~/resources/modules/${slug}`;

  // Backtick toggles the console; Escape closes it (or exits the room when closed).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '`') { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === 'Escape') {
        if (open) { e.preventDefault(); setOpen(false); }
        else onExit?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onExit]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [buffer, open]);

  const append = (lines) => setBuffer((b) => [...b, ...lines]);

  const submit = () => {
    const input = value;
    setValue('');
    const echo = { tone: 'cmd', text: input };
    if (!input.trim()) { append([echo]); return; }

    const n = norm(input);
    if (n === 'exit' || n === 'back') { onExit?.(); return; }

    const { lines, action } = runCommand(input, manifest, loadStore());
    if (action?.type === 'clear') { setBuffer([]); return; }
    if (action?.type === 'load') {
      if (action.module.slug === slug) { append([echo, { text: 'already in this room.', tone: 'sys' }]); return; }
      append([echo, { text: `loading ${action.module.name}…`, tone: 'sys' }]);
      onLoad?.(action.module.slug);
      setOpen(false);
      return;
    }
    if (action?.type === 'navigate') {
      append([echo, ...lines, { text: 'exit the room first to open a foundation primer.', tone: 'sys' }]);
      return;
    }
    append([echo, ...lines]);
  };

  return (
    <>
      {/* dock strip — always visible under the room */}
      <div className="shrink-0 pt-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 rounded-lg border bg-white/[0.04] px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-white/[0.07]"
          style={{
            borderColor: `${SHELL.green}47`, // site shell green ~28% alpha
            boxShadow: `0 0 0 4px ${SHELL.green}0d, 0 8px 20px rgba(0,0,0,0.35)`,
          }}
          aria-label={open ? 'close console' : 'open console'}
        >
          <Prompt path={path} />
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/55">
            summon
            <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-[1px] font-mono text-[10.5px] text-white/85">`</kbd>
          </span>
        </button>
      </div>

      {/* centered modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border shadow-2xl"
            style={{
              background: 'rgba(20, 22, 28, 0.94)',
              borderColor: `${accentHex}55`,
              boxShadow: `0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px ${accentHex}22`,
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="module console"
          >
            <div
              className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5 text-xs"
              style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="font-sans text-sm font-semibold text-white/90">Console</span>
              <span className="ml-auto font-mono text-[11px] text-white/45">
                <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-[1px] text-white/70">Esc</kbd> close ·{' '}
                <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-[1px] text-white/70">`</kbd> toggle
              </span>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {buffer.length === 0 && (
                <div className="text-white/45">
                  summoned console · try{' '}
                  <span style={{ color: SHELL.green }}>list</span>,{' '}
                  <span style={{ color: SHELL.green }}>load &lt;module&gt;</span>, or{' '}
                  <span style={{ color: SHELL.green }}>exit</span>
                </div>
              )}
              {buffer.map((l, i) =>
                l.tone === 'cmd' ? (
                  <div key={i} className="flex items-baseline gap-2">
                    <Prompt path={path} />
                    <span className="min-w-0 break-words text-white/90">{l.text}</span>
                  </div>
                ) : (
                  <div key={i} className={`whitespace-pre-wrap break-words ${TONE[l.tone] || TONE.out}`}>{l.text || ' '}</div>
                )
              )}
              <div className="flex items-baseline gap-2">
                <Prompt path={path} />
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                  className="min-w-0 flex-1 bg-transparent text-white/90 outline-none"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="module console input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuakeConsole;
