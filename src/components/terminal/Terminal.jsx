// src/components/terminal/Terminal.jsx
// The interactive modules shell: a scrolling output buffer above a focused input
// line. In 'shell' mode, submitted lines run global commands (commands.js); when a
// module is loaded ('module' mode), lines route to that module's kind runner until
// `exit`. The terminal owns a focused <input>, so the site's global window keydown
// handlers (which bail on INPUT focus) do not interfere.
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runCommand } from './commands';
import { RUNNERS } from './kinds';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const DIM = SHELL.dim;
const norm = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

// tone -> Tailwind class. 'accent' is colored inline with the active accent.
const TONE = {
  out: 'text-white/75',
  sys: 'text-white/45',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  err: 'text-rose-400',
  prompt: 'text-white/55',
};

const Terminal = ({ manifest }) => {
  const navigate = useNavigate();
  const [buffer, setBuffer] = useState(() => ([
    { text: 'shelnet modules · interactive skill terminal', tone: 'accent' },
    { text: 'type `help` for commands, `list` to browse modules.', tone: 'sys' },
    { text: '', tone: 'out' },
  ]));
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('shell');     // 'shell' | 'module'
  const [active, setActive] = useState(null);    // { ...module, def, runner }
  const [mstate, setMstate] = useState(null);    // active runner state
  const [history, setHistory] = useState([]);    // submitted commands, oldest first
  const [hpos, setHpos] = useState(-1);          // -1 = live input; 0 = newest

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const accentHex = (ACCENTS[active?.accent] || ACCENTS.green).hex;
  const pathStr = mode === 'module' && active
    ? `~/resources/modules/${active.slug}`
    : '~/resources/modules';
  const promptText = `guest@shelnet:${pathStr}$`;

  // Keep the view pinned to the latest output. (DOM side effect, not state sync.)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [buffer]);

  const append = (lines) => setBuffer((b) => [...b, ...lines]);
  const focusInput = () => inputRef.current?.focus();

  const leaveModule = () => {
    setMode('shell');
    setActive(null);
    setMstate(null);
  };

  const recall = (dir) => {
    if (!history.length) return;
    const np = Math.min(history.length - 1, Math.max(-1, hpos + dir));
    setHpos(np);
    setValue(np === -1 ? '' : history[history.length - 1 - np]);
  };

  const submit = async () => {
    const input = value;
    const echo = { text: `${promptText} ${input}`, tone: 'prompt' };
    setValue('');
    setHpos(-1);
    if (!input.trim()) { append([echo]); return; }
    setHistory((h) => [...h, input]);

    if (mode === 'module' && active) {
      const n = norm(input);
      if (n === 'exit' || n === 'back') {
        leaveModule();
        append([echo, { text: 'left module.', tone: 'sys' }]);
        return;
      }
      const { lines, state } = active.runner.onInput(input, mstate, active);
      setMstate(state);
      append([echo, ...lines]);
      return;
    }

    const { lines, action } = runCommand(input, manifest);
    if (action?.type === 'clear') { setBuffer([]); return; }
    if (action?.type === 'navigate') {
      append([echo, ...lines]);
      navigate(action.to);
      return;
    }
    if (action?.type === 'load') {
      append([echo]);
      try {
        const loaded = await action.module.load();
        const runner = RUNNERS[action.module.kind];
        const built = { ...action.module, def: loaded.default, runner };
        const { lines: initLines, state } = runner.init(built);
        setActive(built);
        setMstate(state);
        setMode('module');
        append(initLines);
      } catch {
        append([{ text: `${action.module.name} failed to load; not yet available.`, tone: 'warn' }]);
      }
      return;
    }
    append([echo, ...lines]);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') {
      e.preventDefault();
      if (mode === 'module') { leaveModule(); append([{ text: 'left module.', tone: 'sys' }]); }
      else navigate('/');
    }
    else if (e.key === 'ArrowUp' && mode === 'shell') { e.preventDefault(); recall(1); }
    else if (e.key === 'ArrowDown' && mode === 'shell') { e.preventDefault(); recall(-1); }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-mono text-sm leading-relaxed" onClick={focusInput}>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
        {buffer.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words ${TONE[l.tone] || TONE.out}`}
            style={l.tone === 'accent' ? { color: accentHex } : undefined}
          >
            {l.text || ' '}
          </div>
        ))}
      </div>

      <div className="shrink-0 flex items-baseline gap-2 pt-1">
        <span className="whitespace-pre">
          <span style={{ color: DIM }}>guest@shelnet</span>
          <span className="text-white/40">:</span>
          <span style={{ color: GREEN }}>{pathStr}</span>
          <span className="text-white/40">$</span>
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none text-white/90"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  );
};

export default Terminal;
