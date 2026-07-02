// src/components/room/Room.jsx
// The generic two-pane "room" renderer. Left: the lesson (a gated list of
// sections, each a block list plus an optional checkpoint). Right: the live lab
// stage named by module.stageKind. The Room owns section gating (one active at a
// time, review-back over completed ones), checkpoint evaluation, hints/reveal,
// the post-pass explain, and progress writes. Stage and lesson advance in
// lockstep: a via:'stage' checkpoint passes when the stage emits a matching
// event; a via:'answer' checkpoint passes on a typed answer.
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

// A pane's box-drawing rule (top carries `┌─ TITLE`, bottom carries `└`).
const FILL = '─'.repeat(300);
const PaneRule = ({ hex, lead }) => (
  <div className="overflow-hidden whitespace-nowrap shrink-0" style={{ color: hex }} aria-hidden="true">
    {lead}{FILL}
  </div>
);

const RoomPane = ({ hex, title, right = null, children }) => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <div className="relative shrink-0">
      <PaneRule hex={hex} lead={<span aria-hidden="true">┌─ {title} </span>} />
      {right && <div className="absolute right-0 top-0 bg-black pl-2 text-white/40">{right}</div>}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">{children}</div>
    <PaneRule hex={hex} lead={<span aria-hidden="true">└</span>} />
  </div>
);

// Glyph + tint for a section by its state relative to the active index.
const sectionGlyph = (state) => (state === 'done' ? '+' : state === 'active' ? '>' : 'o');

const Room = ({ module, onProgress }) => {
  const sections = module.sections || [];
  const len = sections.length;
  const hex = (ACCENTS[accentForCategory(module.category)] || ACCENTS.green).hex;

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

  const doReveal = () => { setRevealShown(true); passSection(activeIndex); };

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

  // ── lesson pane ────────────────────────────────────────────────────────────
  const lessonBody = (
    <div className="space-y-1.5 font-mono text-sm">
      {sections.map((sec, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'locked';
        const isOpen = state === 'active' || (state === 'done' && expanded.has(i));
        const onCursor = i === cursor && i <= activeIndex;
        const glyph = sectionGlyph(state);
        const clickable = state !== 'locked';
        return (
          <div key={sec.id || i}>
            {/* section header row */}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => { if (state === 'done') toggleExpand(i); setCursor(Math.min(i, activeIndex)); }}
              aria-current={state === 'active' ? 'true' : undefined}
              className={`flex w-full items-baseline gap-2 rounded px-1 text-left ${
                onCursor ? 'bg-white/[0.06]' : clickable ? 'hover:bg-white/[0.04]' : 'cursor-default'
              }`}
            >
              <span className="shrink-0" style={{ color: state === 'locked' ? undefined : hex }}>
                <span className={state === 'locked' ? 'text-white/25' : ''}>{glyph}</span>
              </span>
              <span className={`shrink-0 tabular-nums ${state === 'locked' ? 'text-white/25' : 'text-white/40'}`}>{i + 1}</span>
              <span className={state === 'locked' ? 'text-white/30' : state === 'active' ? 'text-white/90' : 'text-white/60'}>
                {sec.title}
              </span>
              {state === 'locked' && <span className="ml-auto text-white/20">(locked)</span>}
            </button>

            {/* section body */}
            {isOpen && (
              <div className="ml-5 mt-1.5 mb-2 border-l border-white/10 pl-3">
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
                  <div className="mt-1 text-xs text-white/45">{sec.checkpoint.explain}</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {complete && (
        <div className="mt-3 rounded border px-3 py-2 text-sm" style={{ borderColor: hex, color: hex }}>
          <span className="text-white/85">Room complete.</span> Type <code>exit</code> or press Esc to return to the lobby.
        </div>
      )}
    </div>
  );

  // ── stage pane ─────────────────────────────────────────────────────────────
  const stageBody = StageComp ? (
    <StageComp
      config={module.stageConfig}
      accentHex={hex}
      onEvent={handleStageEvent}
      active={checkpoint?.via === 'stage'}
      activeIndex={Math.min(activeIndex, Math.max(0, len - 1))}
    />
  ) : (
    <div className="text-rose-400/90 text-xs">unknown stage kind: {String(module.stageKind)}</div>
  );

  const headerRight = `${module.difficulty || ''} · ${Math.min(activeIndex, len)}/${len}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* mobile pane toggle */}
      <div className="mb-2 flex shrink-0 items-center gap-2 md:hidden">
        {['lesson', 'stage'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded border px-3 py-1 text-xs ${view === v ? 'text-black' : 'text-white/60'}`}
            style={view === v ? { backgroundColor: hex, borderColor: hex } : { borderColor: 'rgba(255,255,255,0.15)' }}
          >
            {v === 'lesson' ? 'Lesson' : 'Stage'}
            {v === 'stage' && checkpoint?.via === 'stage' && view !== 'stage' && (
              <span className="ml-1" style={{ color: hex }}>●</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/35">{headerRight}</span>
      </div>

      {/* desktop: two panes; mobile: the selected one */}
      <div className="hidden min-h-0 flex-1 gap-3 md:flex">
        <RoomPane hex={hex} title={`LESSON · ${module.name}`} right={headerRight}>{lessonBody}</RoomPane>
        <RoomPane hex={hex} title="LAB STAGE">{stageBody}</RoomPane>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:hidden">
        <RoomPane hex={hex} title={view === 'lesson' ? `LESSON · ${module.name}` : 'LAB STAGE'}>
          {view === 'lesson' ? lessonBody : stageBody}
        </RoomPane>
      </div>
    </div>
  );
};

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
        className="mt-2 rounded border px-3 py-1 text-xs text-black"
        style={{ backgroundColor: hex, borderColor: hex }}
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
            className="min-w-0 flex-1 rounded border border-white/15 bg-black/40 px-2 py-1 text-sm text-white/90 outline-none placeholder:text-white/25"
            aria-label="checkpoint answer"
          />
          <button
            type="button"
            onClick={onSubmitAnswer}
            className="shrink-0 rounded px-2 py-1 text-xs text-black"
            style={{ backgroundColor: hex }}
          >
            check
          </button>
        </div>
      ) : (
        <div className="text-xs" style={{ color: hex }}>→ do it in the lab stage</div>
      )}

      {feedback === 'wrong' && <div className="text-xs text-amber-400/90">not quite; try again (press h for a hint).</div>}

      {/* progressive hints */}
      {hints.slice(0, hintsShown).map((hint, i) => (
        <div key={i} className="text-xs text-white/50">hint {i + 1}: {hint}</div>
      ))}

      <div className="flex flex-wrap items-center gap-3 text-xs">
        {hintsShown < hints.length && (
          <button type="button" onClick={onHint} className="text-white/45 underline-offset-2 hover:underline">
            hint ({hintsShown}/{hints.length}) · h
          </button>
        )}
        {canReveal && (
          <button type="button" onClick={onReveal} className="text-white/45 underline-offset-2 hover:underline">
            reveal solution
          </button>
        )}
      </div>

      {revealShown && checkpoint.reveal && (
        <div className="rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white/70">
          solution: <code className="text-white/90">{checkpoint.reveal}</code>
        </div>
      )}
    </div>
  );
};

export default Room;
