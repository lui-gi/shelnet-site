// src/components/room/QuakeConsole.jsx
// The collapsed terminal that persists under an open room: a thin bottom dock
// showing the last prompt, summonable to a small overlay console with backtick
// (`) or a click. From the overlay you can run lobby commands (help / list /
// load <other> / clear) and `exit`. Loading another module swaps the room;
// `exit` (or Escape from the closed dock) returns to the full-screen lobby.
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
    <div className="shrink-0">
      {open && (
        <div
          className="mb-1 flex max-h-[38vh] min-h-[8rem] flex-col rounded-t border-t border-x bg-black/85 font-mono text-xs leading-relaxed backdrop-blur"
          style={{ borderColor: accentHex }}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-1.5">
            {buffer.length === 0 && (
              <div className="text-white/35">summoned console · try <span style={{ color: SHELL.green }}>list</span>, <span style={{ color: SHELL.green }}>load &lt;module&gt;</span>, or <span style={{ color: SHELL.green }}>exit</span></div>
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
                aria-label="summoned console input"
              />
            </div>
          </div>
        </div>
      )}

      {/* dock strip */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-left font-mono text-xs hover:bg-white/[0.06]"
        aria-label={open ? 'collapse console' : 'summon console'}
      >
        <Prompt path={path} />
        <span className="ml-auto text-white/35" aria-hidden="true">{open ? '[v]' : '[^] `'}</span>
      </button>
    </div>
  );
};

export default QuakeConsole;
