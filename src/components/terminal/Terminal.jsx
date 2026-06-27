// src/components/terminal/Terminal.jsx
// The modules lobby shell: a bare-TTY header (uname line + figlet title + greyed
// blurbs, matching the sibling /resources pages) above a single scrolling column
// where submitted commands echo `$ cmd`, their output stacks beneath, and the
// live input is the last row. The lobby only runs global commands (commands.js);
// `load <module>` navigates to that module's room route (/resources/modules/
// <slug>), where the ceremony plays and the GUI room opens. The terminal owns a
// focused <input>, so the site's global window keydown handlers (which bail on
// INPUT focus) do not interfere.
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runCommand } from './commands';
import { loadStore } from '../../utils/moduleProgress';
import { SHELL } from '../../config/theme';

const GREEN = SHELL.green;
const DIM = SHELL.dim;

// figlet "standard" font, matching the hero banner + sibling page titles. Kept as
// an array (the glyphs carry backticks, which a template literal can't hold raw).
const MODULES_ART = [
  '                     _       _           ',
  ' _ __ ___   ___   __| |_   _| | ___  ___ ',
  "| '_ ` _ \\ / _ \\ / _` | | | | |/ _ \\/ __|",
  '| | | | | | (_) | (_| | |_| | |  __/\\__ \\',
  '|_| |_| |_|\\___/ \\__,_|\\__,_|_|\\___||___/',
].join('\n');

// tone -> Tailwind class. 'accent' is the shell green; 'cmd' is a structured
// prompt echo rendered inline, not via this map.
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

const PATH = '~/resources/modules';

const Terminal = ({ manifest }) => {
  const navigate = useNavigate();
  const [buffer, setBuffer] = useState([]);      // output lines, oldest first
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);    // submitted commands, oldest first
  const [hpos, setHpos] = useState(-1);          // -1 = live input; 0 = newest

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Keep the view pinned to the latest output. (DOM side effect, not state sync.)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [buffer]);

  const append = (lines) => setBuffer((b) => [...b, ...lines]);
  const focusInput = () => inputRef.current?.focus();

  const recall = (dir) => {
    if (!history.length) return;
    const np = Math.min(history.length - 1, Math.max(-1, hpos + dir));
    setHpos(np);
    setValue(np === -1 ? '' : history[history.length - 1 - np]);
  };

  const submit = () => {
    const input = value;
    const echo = { tone: 'cmd', path: PATH, text: input };
    setValue('');
    setHpos(-1);
    if (!input.trim()) { append([echo]); return; }
    setHistory((h) => [...h, input]);

    const { lines, action } = runCommand(input, manifest, loadStore());
    if (action?.type === 'clear') { setBuffer([]); return; }
    if (action?.type === 'load') {
      append([echo]);
      navigate(`/resources/modules/${action.module.slug}`);
      return;
    }
    if (action?.type === 'navigate') {
      append([echo, ...lines]);
      navigate(action.to);
      return;
    }
    append([echo, ...lines]);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Escape') { e.preventDefault(); navigate('/'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); recall(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); recall(-1); }
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
        <div className="text-white/45">interactive skill rooms · learn a technique, then do it in a live lab stage</div>
        <div className="text-white/40">
          type <span style={{ color: GREEN }}>help</span> for commands · <span style={{ color: GREEN }}>list</span> to browse modules · <span style={{ color: GREEN }}>load &lt;name&gt;</span> to enter
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
              style={l.tone === 'accent' ? { color: GREEN } : undefined}
            >
              {l.text || ' '}
            </div>
          )
        )}

        <div className="flex items-baseline gap-2">
          <Prompt path={PATH} />
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
