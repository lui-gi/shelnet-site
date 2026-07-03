// src/components/room/stages/SearchStage.jsx
// The `search` lab stage: a query box plus a results table. It matches a typed
// query against a hand-authored table in stageConfig and renders the canned
// result set (no real search backend). Submitting a query emits
// onEvent({ type:'query', query, payload:{ columns, rows } }) so the Room can
// test it against the active via:'stage' checkpoint.
//
// Stage contract: ({ config, accentHex, onEvent, active }) => JSX.
// Surface colors read from CSS custom properties on the Room root so the stage
// flips with the room's light/dark theme.
import { useRef, useEffect, useState } from 'react';

// Resolve a typed query to its canned result, or null if unrecognized.
function lookup(queries, input) {
  for (const q of queries || []) {
    const ok = q.match instanceof RegExp
      ? q.match.test(input.trim())
      : q.match.trim().toLowerCase() === input.trim().toLowerCase();
    if (ok) return q;
  }
  return null;
}

const SearchStage = ({ config = {}, accentHex, onEvent, active }) => {
  const { product = 'search', index, placeholder = 'enter a query…', queries = [] } = config;
  const [value, setValue] = useState('');
  // result: null (nothing run yet) | { columns, rows, note } | { miss: true }
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  const submit = () => {
    const input = value;
    if (!input.trim()) return;
    const match = lookup(queries, input);
    if (!match) {
      setResult({ miss: true });
      onEvent?.({ type: 'query', query: input, payload: { query: input, matched: false } });
      return;
    }
    setResult({ columns: match.columns || [], rows: match.rows || [], note: match.note });
    onEvent?.({
      type: 'query',
      query: input,
      payload: { query: input, matched: true, columns: match.columns, rows: match.rows },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono text-xs leading-relaxed">
      <div className="shrink-0 pb-1" style={{ color: 'var(--text-dim)' }}>
        <span style={{ color: accentHex }}>{product}</span>
        {index != null && <> · index=<span style={{ color: 'var(--text-mute)' }}>{index}</span></>}
      </div>

      {/* query bar */}
      <div
        className="flex shrink-0 items-center gap-2 rounded border px-2 py-1.5"
        style={{ borderColor: accentHex, background: 'var(--block-bg)' }}
        onClick={() => inputRef.current?.focus()}
      >
        <span aria-hidden="true" style={{ color: accentHex }}>&gt;</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ color: 'var(--text-strong)', caretColor: 'var(--cursor)' }}
          spellCheck={false}
          autoComplete="off"
          aria-label="search query"
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 rounded px-2 py-0.5 text-[0.7rem] font-semibold text-black"
          style={{ backgroundColor: accentHex }}
        >
          run
        </button>
      </div>

      {/* results */}
      <div className="mt-2 min-h-0 flex-1 overflow-auto pr-1">
        {result == null && (
          <div style={{ color: 'var(--text-dim)' }}>run a query to see matching events.</div>
        )}
        {result?.miss && (
          <div className="text-amber-500">no events found. check your syntax and fields.</div>
        )}
        {result && !result.miss && (
          <>
            {result.note && <div className="mb-1" style={{ color: 'var(--text-mute)' }}>{result.note}</div>}
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {result.columns.map((c, i) => (
                    <th
                      key={i}
                      className="border-b pb-1 pr-4 font-semibold"
                      style={{ borderColor: 'var(--block-border)', color: 'var(--text-mute)' }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, ri) => (
                  <tr key={ri} className="align-top">
                    {row.map((cell, ci) => (
                      <td key={ci} className="whitespace-pre py-0.5 pr-4" style={{ color: 'var(--text)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1" style={{ color: 'var(--text-dim)' }}>{result.rows.length} result{result.rows.length === 1 ? '' : 's'}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchStage;
