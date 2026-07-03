// src/components/room/Room.jsx
// The generic two-pane "room" renderer. Left: the lesson (a card surface with a
// mac-style header, a section list, and per-section block content). Right: the
// live lab stage named by module.stageKind. The Room owns section gating (one
// active at a time, review-back over completed ones), checkpoint evaluation,
// hints/reveal, the post-pass explain, and progress writes. Stage and lesson
// advance in lockstep: a via:'stage' checkpoint passes when the stage emits a
// matching event; a via:'answer' checkpoint passes on a typed answer.
//
// A module gives the Room: { slug, name, category, difficulty, stageKind,
// stageConfig, sections[] }. Section: { id, title, blocks[], checkpoint? }.
// Checkpoint: { via:'stage'|'answer', expect|accept, hints[], reveal?, explain }.
import { useEffect, useRef, useState } from 'react';
import Blocks from './blocks';
import { stageFor } from './stages';
import { setModuleProgress, getModuleProgress } from '../../utils/moduleProgress';
import { accentForCategory } from '../../config/moduleRegistry';
import { ACCENTS } from '../../config/theme';
import { useRoomTheme, THEME_VARS } from '../../utils/useRoomTheme';

const norm = (s) => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
const REVEAL_AFTER = 2; // misses before the reveal affordance is offered

// A typed answer satisfies `accept` (regex, or a normalized string compare).
function answerOk(accept, input) {
  if (accept instanceof RegExp) return accept.test(input.trim());
  return norm(accept) === norm(input);
}

// A stage event satisfies `expect`: a predicate (event => boolean) or a regex
// tested against the event's command/query string (else its serialized payload).
function stageOk(expect, event) {
  if (typeof expect === 'function') return !!expect(event);
  if (expect instanceof RegExp) {
    const s = event.command ?? event.query ?? JSON.stringify(event.payload ?? '');
    return expect.test(s);
  }
  return false;
}

// Sun/moon toggle. Lives in the stage header on desktop; also surfaced in the
// mobile toolbar so mobile users can flip themes without the stage on-screen.
const ThemeToggle = ({ theme, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    className="inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors hover:opacity-100"
    style={{
      background: 'var(--toggle-bg)',
      borderColor: 'var(--toggle-border)',
      color: 'var(--toggle-text)',
    }}
  >
    {theme === 'dark' ? (
      // sun (offer light)
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ) : (
      // moon (offer dark)
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )}
    <span>{theme === 'dark' ? 'light' : 'dark'}</span>
  </button>
);

// A card surface (rounded, bordered, header + scrollable body). Used for both
// panes so lesson and stage share a shell; header content is a `head` slot so
// each pane can put its own controls there.
const CardPane = ({ head, children }) => (
  <div
    className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border"
    style={{
      background: 'var(--card-bg)',
      borderColor: 'var(--card-border)',
    }}
  >
    <div
      className="flex shrink-0 items-center gap-3 border-b px-3 py-2"
      style={{
        background: 'var(--card-head-bg)',
        borderColor: 'var(--card-head-border)',
      }}
    >
      {head}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
  </div>
);

// Glyph + tint for a section by its state relative to the active index.
const sectionGlyph = (state) => (state === 'done' ? '+' : state === 'active' ? '>' : 'o');

const Room = ({ module, onProgress }) => {
  const sections = module.sections || [];
  const len = sections.length;
  const hex = (ACCENTS[accentForCategory(module.category)] || ACCENTS.green).hex;
  const { theme, toggle } = useRoomTheme();

  // Resume at the saved section (clamped); earlier sections render as done.
  const [activeIndex, setActiveIndex] = useState(() => {
    const saved = getModuleProgress(module.slug);
    const at = saved?.section ?? 0;
    return Math.max(0, Math.min(at, len));
  });
  const [cursor, setCursor] = useState(0);              // review focus over unlocked sections
  const [expanded, setExpanded] = useState(() => new Set()); // expanded completed sections
  const [answer, setAnswer] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const [misses, setMisses] = useState(0);
  const [revealShown, setRevealShown] = useState(false);
  const [feedback, setFeedback] = useState(null);       // 'wrong' | null
  const [view, setView] = useState('lesson');           // mobile pane toggle

  const complete = activeIndex >= len;
  const activeSection = complete ? null : sections[activeIndex];
  const checkpoint = activeSection?.checkpoint || null;

  // Mark the room started on first mount if it has no entry yet, so the lobby
  // `list` shows it as in-progress / resumable. (External-store write, not state sync.)
  useEffect(() => {
    if (!getModuleProgress(module.slug)) {
      setModuleProgress(module.slug, {
        status: activeIndex >= len ? 'complete' : 'in-progress',
        section: activeIndex,
        total: len,
      });
      onProgress?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.slug]);

  const resetCheckpointUI = () => {
    setAnswer(''); setHintsShown(0); setMisses(0); setRevealShown(false); setFeedback(null);
  };

  // Advance past section `i`: persist, unlock the next, reset checkpoint UI.
  const passSection = (i) => {
    const next = i + 1;
    const status = next >= len ? 'complete' : 'in-progress';
    setModuleProgress(module.slug, { status, section: Math.min(next, len), total: len });
    setActiveIndex(next);
    setCursor(Math.min(next, len - 1));
    resetCheckpointUI();
    onProgress?.();
  };

  const submitAnswer = () => {
    if (!checkpoint || checkpoint.via !== 'answer') return;
    if (answerOk(checkpoint.accept, answer)) passSection(activeIndex);
    else { setMisses((m) => m + 1); setFeedback('wrong'); }
  };

  const handleStageEvent = (event) => {
    if (checkpoint?.via === 'stage' && stageOk(checkpoint.expect, event)) passSection(activeIndex);
  };

  const showHint = () => {
    const hints = checkpoint?.hints || [];
    setHintsShown((h) => Math.min(h + 1, hints.length));
  };

  const doReveal = () => { setRevealShown(true); };

  const toggleExpand = (i) => setExpanded((prev) => {
    const nextSet = new Set(prev);
    if (nextSet.has(i)) nextSet.delete(i); else nextSet.add(i);
    return nextSet;
  });

  // Keyboard: bound once, reads latest via ref (mirrors ResourceTUI). `h` hint,
  // ↑↓ move the review cursor over unlocked sections, ↵ expands a done section or
  // continues a checkpoint-free active one. Bails while typing in a field.
  const kb = useRef({});
  kb.current = { activeIndex, len, cursor, checkpoint, hasHints: (checkpoint?.hints?.length || 0) > 0,
    showHint, setCursor, toggleExpand, passSection };
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const s = kb.current;
      const maxUnlocked = Math.min(s.activeIndex, s.len - 1);
      if (e.key === 'h' && s.hasHints) { e.preventDefault(); s.showHint(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); s.setCursor((c) => Math.min(maxUnlocked, c + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); s.setCursor((c) => Math.max(0, c - 1)); }
      else if (e.key === 'Enter') {
        if (s.cursor < s.activeIndex) { e.preventDefault(); s.toggleExpand(s.cursor); }
        else if (s.cursor === s.activeIndex && !s.checkpoint) { e.preventDefault(); s.passSection(s.activeIndex); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const StageComp = stageFor(module.stageKind);

  const progressText = `${Math.min(activeIndex, len)}/${len}`;
  const difficulty = module.difficulty || '';
  const headerRight = [difficulty, progressText].filter(Boolean).join(' · ');

  // ── lesson pane ────────────────────────────────────────────────────────────
  const lessonBody = (
    <div className="space-y-1.5 px-3 py-3 text-sm">
      {sections.map((sec, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'locked';
        const isOpen = state === 'active' || (state === 'done' && expanded.has(i));
        const onCursor = i === cursor && i <= activeIndex;
        const glyph = sectionGlyph(state);
        const clickable = state !== 'locked';
        return (
          <div key={sec.id || i}>
            {/* section header row (mono, tight — reads like a rail item) */}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => { if (state === 'done') toggleExpand(i); setCursor(Math.min(i, activeIndex)); }}
              aria-current={state === 'active' ? 'true' : undefined}
              className={`flex w-full items-baseline gap-2 rounded px-1.5 py-0.5 text-left font-mono transition-colors ${
                onCursor ? '' : clickable ? '' : 'cursor-default'
              }`}
              style={
                onCursor
                  ? { background: 'color-mix(in srgb, var(--text-strong) 6%, transparent)' }
                  : undefined
              }
            >
              <span className="shrink-0" style={{ color: state === 'locked' ? 'var(--text-dim)' : hex }}>
                {glyph}
              </span>
              <span className="shrink-0 tabular-nums" style={{ color: 'var(--text-dim)' }}>{i + 1}</span>
              <span
                style={{
                  color:
                    state === 'locked' ? 'var(--text-dim)'
                    : state === 'active' ? 'var(--text-strong)'
                    : 'var(--text-mute)',
                }}
              >
                {sec.title}
              </span>
              {state === 'locked' && <span className="ml-auto text-xs" style={{ color: 'var(--text-dim)' }}>locked</span>}
            </button>

            {/* section body */}
            {isOpen && (
              <div
                className="ml-5 mt-1.5 mb-3 border-l pl-3"
                style={{ borderColor: 'var(--card-head-border)' }}
              >
                <Blocks blocks={sec.blocks} accentHex={hex} />
                {state === 'active' && (
                  <ActiveCheckpoint
                    checkpoint={checkpoint}
                    hex={hex}
                    answer={answer} setAnswer={setAnswer}
                    onSubmitAnswer={submitAnswer}
                    onContinue={() => passSection(activeIndex)}
                    hintsShown={hintsShown} onHint={showHint}
                    misses={misses} feedback={feedback}
                    revealShown={revealShown} onReveal={doReveal}
                  />
                )}
                {state === 'done' && sec.checkpoint?.explain && (
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-mute)' }}>{sec.checkpoint.explain}</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {complete && (
        <div
          className="mt-3 rounded border px-3 py-2 text-sm"
          style={{ borderColor: hex, color: hex }}
        >
          <span style={{ color: 'var(--text-strong)' }}>Room complete.</span>{' '}
          Type <code>exit</code> or press Esc to return to the lobby.
        </div>
      )}
    </div>
  );

  // ── stage pane ─────────────────────────────────────────────────────────────
  const stageBody = StageComp ? (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
      <StageComp
        config={module.stageConfig}
        accentHex={hex}
        onEvent={handleStageEvent}
        active={checkpoint?.via === 'stage'}
        activeIndex={Math.min(activeIndex, Math.max(0, len - 1))}
      />
    </div>
  ) : (
    <div className="px-3 py-3 text-xs text-rose-400/90">unknown stage kind: {String(module.stageKind)}</div>
  );

  // ── card heads ─────────────────────────────────────────────────────────────
  const lessonHead = (
    <>
      <span
        className="truncate text-[13px] font-semibold tracking-tight"
        style={{ color: 'var(--text-strong)' }}
      >
        Lesson · {module.name}
      </span>
      <span
        className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs"
        style={{ color: 'var(--text-dim)' }}
      >
        {headerRight}
      </span>
    </>
  );

  const sessionHost = module.stageConfig?.host;
  const stageHead = (
    <>
      <span
        className="text-[13px] font-semibold tracking-tight"
        style={{ color: 'var(--stage-head-text)' }}
      >
        Lab Stage
      </span>
      {sessionHost && (
        <span
          className="ml-auto shrink-0 whitespace-nowrap font-mono text-xs"
          style={{ color: 'var(--stage-head-sub)' }}
        >
          session · <span style={{ color: hex }}>{sessionHost}</span>
        </span>
      )}
      <ThemeToggle theme={theme} onToggle={toggle} />
    </>
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      style={{ ...THEME_VARS[theme], background: 'var(--room-bg)', color: 'var(--text)' }}
    >
      {/* mobile pane toggle + theme toggle */}
      <div className="mb-2 flex shrink-0 items-center gap-2 md:hidden">
        {['lesson', 'stage'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="rounded border px-3 py-1 text-xs transition-colors"
            style={
              view === v
                ? { background: hex, borderColor: hex, color: '#000' }
                : { borderColor: 'var(--card-border)', color: 'var(--text-mute)' }
            }
          >
            {v === 'lesson' ? 'Lesson' : 'Stage'}
            {v === 'stage' && checkpoint?.via === 'stage' && view !== 'stage' && (
              <span className="ml-1" style={{ color: hex }}>●</span>
            )}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{headerRight}</span>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </span>
      </div>

      {/* desktop: 30/70 grid (lesson · lab); mobile: the selected one */}
      <div className="hidden min-h-0 flex-1 gap-3 md:grid md:grid-cols-[30%_1fr]">
        <CardPane head={lessonHead}>{lessonBody}</CardPane>
        <StageCardPane head={stageHead}>{stageBody}</StageCardPane>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:hidden">
        {view === 'lesson' ? (
          <CardPane head={lessonHead}>{lessonBody}</CardPane>
        ) : (
          <StageCardPane head={stageHead}>{stageBody}</StageCardPane>
        )}
      </div>
    </div>
  );
};

// Stage pane uses stage-specific tokens (terminal-like surface). Separate wrapper
// so its bg/border can differ from the lesson card without conditionals inside
// CardPane.
const StageCardPane = ({ head, children }) => (
  <div
    className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border"
    style={{
      background: 'var(--stage-bg)',
      borderColor: 'var(--stage-border)',
    }}
  >
    <div
      className="flex shrink-0 items-center gap-3 border-b px-3 py-2"
      style={{
        background: 'var(--stage-head-bg)',
        borderColor: 'var(--stage-head-border)',
      }}
    >
      {head}
    </div>
    <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
  </div>
);

// The active section's checkpoint affordance: an answer input (via:'answer'), a
// "do it in the stage" nudge (via:'stage'), or a Continue button (no checkpoint).
// Progressive hints and an after-N-misses reveal sit below.
const ActiveCheckpoint = ({
  checkpoint, hex, answer, setAnswer, onSubmitAnswer, onContinue,
  hintsShown, onHint, misses, feedback, revealShown, onReveal,
}) => {
  if (!checkpoint) {
    return (
      <button
        type="button"
        onClick={onContinue}
        className="mt-2 rounded border px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: hex, borderColor: hex, color: '#000' }}
      >
        Continue ↵
      </button>
    );
  }
  const hints = checkpoint.hints || [];
  const canReveal = checkpoint.reveal && (misses >= REVEAL_AFTER || hintsShown >= hints.length) && !revealShown;

  return (
    <div className="mt-2 space-y-2">
      {checkpoint.via === 'answer' ? (
        <div className="flex items-center gap-2">
          <span aria-hidden="true" style={{ color: hex }}>?</span>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmitAnswer(); } }}
            placeholder="type your answer…"
            className="min-w-0 flex-1 rounded border px-2 py-1 font-mono text-sm outline-none"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--text-strong)',
            }}
            aria-label="checkpoint answer"
          />
          <button
            type="button"
            onClick={onSubmitAnswer}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold"
            style={{ backgroundColor: hex, color: '#000' }}
          >
            check
          </button>
        </div>
      ) : (
        <div className="text-xs" style={{ color: hex }}>→ do it in the lab stage</div>
      )}

      {feedback === 'wrong' && (
        <div className="text-xs text-amber-500">not quite; try again (press h for a hint).</div>
      )}

      {/* progressive hints */}
      {hints.slice(0, hintsShown).map((hint, i) => (
        <div key={i} className="text-xs" style={{ color: 'var(--text-mute)' }}>hint {i + 1}: {hint}</div>
      ))}

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {hintsShown < hints.length && (
          <button
            type="button"
            onClick={onHint}
            className="underline-offset-2 hover:underline"
            style={{ color: 'var(--text-mute)' }}
          >
            hint ({hintsShown}/{hints.length}) · h
          </button>
        )}
        {canReveal && (
          <button
            type="button"
            onClick={onReveal}
            className="underline-offset-2 hover:underline"
            style={{ color: 'var(--text-mute)' }}
          >
            reveal solution
          </button>
        )}
      </div>

      {revealShown && checkpoint.reveal && (
        <div className="space-y-2">
          <div
            className="rounded border px-2 py-1 text-xs"
            style={{
              background: 'var(--block-bg)',
              borderColor: 'var(--block-border)',
              color: 'var(--text)',
            }}
          >
            solution: <code style={{ color: 'var(--text-strong)' }}>{checkpoint.reveal}</code>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="rounded border px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: hex, borderColor: hex, color: '#000' }}
          >
            Continue ↵
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;
