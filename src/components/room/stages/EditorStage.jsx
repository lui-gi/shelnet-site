// src/components/room/stages/EditorStage.jsx
// The `editor` lab stage: a fill-in-the-blanks script with a Run button and a
// result pane. Blanks are validated against per-blank `expect` regexes; a Run
// press emits onEvent({ type:'run', payload:{ matched, blanks } }) so the Room
// can test it against the active via:'stage' checkpoint. The stage owns its own
// working state; it resets when `activeIndex` changes so blanks clear between
// sections.
//
// Stage contract: ({ config, accentHex, onEvent, active, activeIndex }) => JSX.
import { useEffect, useMemo, useRef, useState } from 'react';

const norm = (s) => String(s).trim().replace(/\s+/g, ' ');

// A blank's typed value satisfies `expect`: a regex (whitespace-normalized) or a
// string compare (case-insensitive, whitespace-normalized).
function matchBlank(expect, value) {
  const v = norm(value);
  if (expect instanceof RegExp) return expect.test(v);
  return norm(expect).toLowerCase() === v.toLowerCase();
}

const EditorStage = ({ config = {}, accentHex, onEvent, active, activeIndex = 0 }) => {
  const scripts = config.scripts || [];
  const idx = scripts.length ? Math.min(Math.max(activeIndex, 0), scripts.length - 1) : 0;
  const current = scripts[idx] || { script: [], runOutput: [], motd: [] };
  const { filename, motd = [], script = [], runOutput = [] } = current;

  // Blank initial-values array is keyed by section index; recomputed on idx.
  const initialValues = useMemo(
    () => script.map((row) => (row.blank ? '' : null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idx],
  );
  const [values, setValues] = useState(initialValues);
  const [result, setResult] = useState(null); // null | { matched, failed: [{ index, value, matched }] }
  const [focusIndex, setFocusIndex] = useState(null);
  const firstInputRef = useRef(null);

  // Reset state when the active section changes.
  useEffect(() => {
    setValues(initialValues);
    setResult(null);
    setFocusIndex(null);
  }, [idx, initialValues]);

  // Focus the first blank when this stage becomes the active checkpoint surface.
  useEffect(() => {
    if (active) firstInputRef.current?.focus();
  }, [active, idx]);

  const run = () => {
    const evaluated = script
      .map((row, i) =>
        row.blank
          ? { index: i, value: values[i] || '', matched: matchBlank(row.expect, values[i] || '') }
          : null,
      )
      .filter(Boolean);
    const failed = evaluated.filter((b) => !b.matched);
    const matched = failed.length === 0;
    setResult({ matched, failed });
    onEvent?.({ type: 'run', payload: { matched, blanks: evaluated } });
  };

  const setBlank = (i, v) => setValues((prev) => prev.map((x, j) => (j === i ? v : x)));

  const firstBlankIndex = script.findIndex((r) => r.blank);

  return (
    <div className="flex flex-1 min-h-0 flex-col font-mono text-xs leading-relaxed">
      {filename && (
        <div className="shrink-0 pb-1 text-white/35">
          file: <span style={{ color: accentHex }}>{filename}</span>
        </div>
      )}

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* editor pane */}
        <div className="rounded border border-white/10 bg-black/40 p-2 overflow-y-auto">
          {motd.map((m, i) => (
            <div key={`m${i}`} className="text-white/40">{m}</div>
          ))}
          {script.map((row, i) => {
            if (!row.blank) {
              return (
                <div key={i} className="whitespace-pre text-white/80">{row.line}</div>
              );
            }
            const failed = result && !result.matched && result.failed.some((b) => b.index === i);
            const showHint = focusIndex === i && row.hint;
            const ref = i === firstBlankIndex ? firstInputRef : null;
            return (
              <div key={i}>
                <div className="whitespace-pre text-white/80">
                  <span>{row.before || ''}</span>
                  <input
                    ref={ref}
                    value={values[i] || ''}
                    onChange={(e) => setBlank(i, e.target.value)}
                    onFocus={() => setFocusIndex(i)}
                    onBlur={() => setFocusIndex(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } }}
                    className={`mx-0.5 rounded bg-black/60 px-1 outline-none ${
                      failed
                        ? 'border border-rose-400/80 text-rose-200'
                        : 'border border-white/25 text-white/95'
                    }`}
                    style={{ minWidth: '10ch' }}
                    aria-label={`blank ${i + 1}`}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <span>{row.after || ''}</span>
                </div>
                {showHint && (
                  <div className="ml-2 text-white/40">hint: {row.hint}</div>
                )}
              </div>
            );
          })}
          <div className="mt-2">
            <button
              type="button"
              onClick={run}
              className="rounded px-2 py-0.5 text-[0.7rem] text-black"
              style={{ backgroundColor: accentHex }}
            >
              run
            </button>
          </div>
        </div>

        {/* run pane */}
        <div className="rounded border border-white/10 bg-black/40 p-2 overflow-y-auto">
          <div className="pb-1 text-white/35">$ python3 {filename || 'script.py'}</div>
          {result == null && (
            <div className="text-white/30">press run to execute.</div>
          )}
          {result && !result.matched && (
            <div className="text-rose-400/90">
              traceback: {result.failed.length} blank(s) unfilled or wrong
            </div>
          )}
          {result?.matched && runOutput.map((o, i) => (
            <div key={i} className="whitespace-pre-wrap text-white/80">{o}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorStage;
