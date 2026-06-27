// src/components/room/stages/ShellStage.jsx
// The `shell` lab stage: a faux typed terminal. It matches typed commands
// against a hand-authored table in stageConfig and prints canned output (no real
// execution). Every submitted line emits onEvent({ type:'command', command })
// so the Room can test it against the active via:'stage' checkpoint.
//
// Stage contract: ({ config, accentHex, onEvent, active }) => JSX. The stage owns
// its own working state (scrollback + input); the Room never reaches into it.
import { useRef, useEffect, useState } from 'react';
import { SHELL } from '../../../config/theme';

const norm = (s) => s.trim().replace(/\s+/g, ' ');

// Resolve a typed line to its canned output lines, or null if unrecognized.
function lookup(commands, input) {
  const n = norm(input).toLowerCase();
  for (const c of commands || []) {
    const ok = c.match instanceof RegExp ? c.match.test(input.trim()) : norm(c.match).toLowerCase() === n;
    if (ok) return c.output || [];
  }
  return null;
}

const ShellStage = ({ config = {}, accentHex, onEvent, active }) => {
  const { host, prompt = 'root@kali', cwd = '~', commands = [], motd = [] } = config;
  const [lines, setLines] = useState(() => motd.map((text) => ({ kind: 'out', text })));
  const [value, setValue] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Pin to the latest output (DOM side effect, not state sync).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  // Pull focus when this stage becomes the active checkpoint surface.
  useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  const submit = () => {
    const input = value;
    setValue('');
    if (!input.trim()) { setLines((l) => [...l, { kind: 'cmd', text: '' }]); return; }
    if (norm(input).toLowerCase() === 'clear') { setLines([]); return; }
    const out = lookup(commands, input);
    const printed = out == null
      ? [{ kind: 'err', text: `${input.trim().split(/\s+/)[0]}: command not found` }]
      : out.map((text) => ({ kind: 'out', text }));
    setLines((l) => [...l, { kind: 'cmd', text: input }, ...printed]);
    onEvent?.({ type: 'command', command: input, payload: { command: input, matched: out != null } });
  };

  const promptGlyph = (
    <span className="shrink-0 whitespace-pre">
      <span style={{ color: SHELL.dim }}>{prompt}</span>
      <span className="text-white/40">:</span>
      <span style={{ color: SHELL.green }}>{cwd}</span>
      <span className="text-white/40">$ </span>
    </span>
  );

  return (
    <div
      className="flex flex-1 min-h-0 flex-col font-mono text-xs leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      {host && (
        <div className="shrink-0 pb-1 text-white/35">
          session: <span style={{ color: accentHex }}>{host}</span>
        </div>
      )}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
        {lines.map((l, i) =>
          l.kind === 'cmd' ? (
            <div key={i} className="flex items-baseline">
              {promptGlyph}
              <span className="min-w-0 break-words text-white/90">{l.text}</span>
            </div>
          ) : (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words ${l.kind === 'err' ? 'text-rose-400/90' : 'text-white/70'}`}
            >
              {l.text || ' '}
            </div>
          )
        )}
        <div className="flex items-baseline">
          {promptGlyph}
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
            className="flex-1 min-w-0 bg-transparent outline-none text-white/90"
            spellCheck={false}
            autoComplete="off"
            aria-label="lab shell input"
          />
        </div>
      </div>
    </div>
  );
};

export default ShellStage;
