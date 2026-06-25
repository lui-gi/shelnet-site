// src/components/terminal/Terminal.jsx
// The interactive modules shell: a bare-TTY header (uname line + figlet title +
// greyed blurbs, matching the sibling /resources pages) above a single scrolling
// column where submitted commands echo `$ cmd`, their output stacks beneath, and
// the live input is the last row, so the prompt always follows the latest output
// instead of floating against the viewport bottom. In 'shell' mode submitted
// lines run global commands (commands.js); when a module is loaded ('module'
// mode), lines route to that module's kind runner until `exit`. The terminal owns
// a focused <input>, so the site's global window keydown handlers (which bail on
// INPUT focus) do not interfere.
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runCommand } from './commands';
import { RUNNERS } from './kinds';
import { ACCENTS, SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const DIM = SHELL.dim;
const norm = (s) => s.trim().replace(/\s+/g, ' ').toLowerCase();

// figlet "standard" font, matching the hero banner + sibling page titles. Kept as
// an array (the glyphs carry backticks, which a template literal can't hold raw).
const MODULES_ART = [
  '                     _       _           ',
  ' _ __ ___   ___   __| |_   _| | ___  ___ ',
  "| '_ ` _ \\ / _ \\ / _` | | | | |/ _ \\/ __|",
  '| | | | | | (_) | (_| | |_| | |  __/\\__ \\',
  '|_| |_| |_|\\___/ \\__,_|\\__,_|_|\\___||___/',
].join('\n');

// tone -> Tailwind class. 'accent' is colored inline with the active accent;
// 'cmd' is a structured prompt echo rendered by <PromptLine>, not via this map.
const TONE = {
  out: 'text-white/75',
  sys: 'text-white/45',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  err: 'text-rose-400',
};

// The colored prompt segments, shared by command echoes and the live input row so
// scrollback lines up pixel-for-pixel under the cursor.
const Prompt = ({ path }) => (
  <span className="shrink-0 whitespace-pre">
    <span style={{ color: DIM }}>guest@shelnet</span>
    <span className="text-white/40">:</span>
    <span style={{ color: GREEN }}>{path}</span>
    <span className="text-white/40">$</span>
  </span>
);

const Terminal = ({ manifest }) => {
  const navigate = useNavigate();
  const [buffer, setBuffer] = useState([]);      // output lines, oldest first
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
    const echo = { tone: 'cmd', path: pathStr, text: input };
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
        if (!runner) {
          append([{ text: `${action.module.name}: unknown module kind '${action.module.kind}'.`, tone: 'err' }]);
          return;
        }
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
      {/* bare-TTY header: continuity with the sibling /resources pages */}
      <div className="shrink-0 mb-3">
        <div className="text-white/30">SHELNET GNU/Linux 3.0 LTS · tty4 · 80×24</div>
        <pre
          aria-label="modules"
          className="my-3 whitespace-pre text-[10px] leading-[1.1] sm:text-xs"
          style={{ color: GREEN, textShadow: '0 0 8px rgba(67,192,140,.25)' }}
        >{MODULES_ART}</pre>
        <div className="text-white/45">interactive skill terminal · practice real blue &amp; red team workflows</div>
        <div className="text-white/40">
          type <span style={{ color: GREEN }}>help</span> for commands · <span style={{ color: GREEN }}>list</span> to browse modules
        </div>
      </div>

      {/* one scrolling column: echoed commands, their output, then the live prompt */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pr-1">
        {buffer.map((l, i) =>
          l.tone === 'cmd' ? (
            <div key={i} className="flex items-baseline gap-2">
              <Prompt path={l.path} />
              <span className="min-w-0 break-words text-white/90">{l.text}</span>
            </div>
          ) : (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words ${TONE[l.tone] || TONE.out}`}
              style={l.tone === 'accent' ? { color: accentHex } : undefined}
            >
              {l.text || ' '}
            </div>
          )
        )}

        <div className="flex items-baseline gap-2">
          <Prompt path={pathStr} />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            className="flex-1 min-w-0 bg-transparent outline-none text-white/90"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="terminal input"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
