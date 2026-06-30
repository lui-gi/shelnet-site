// src/components/wiki/WikiSearch.jsx
// Light-themed wiki search modal. Lazy-loads minisearch + index on first open.
// Keyboard: ↑/↓ to move, Enter to open, Esc to close. Click backdrop closes.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSearchIndex } from '../../utils/wikiContent';

const WikiSearch = ({ open, onClose, initialQuery = '' }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [index, setIndex] = useState(null);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (initialQuery) {
      setQ(initialQuery);
      setCursor(0);
    }
    if (!index) fetchSearchIndex().then(setIndex).catch(() => {});
  }, [open, index, initialQuery]);

  const hits = useMemo(() => {
    if (!index || !q.trim()) return [];
    return index.search(q, { prefix: true, fuzzy: 0.2 }).slice(0, 10);
  }, [q, index]);

  const handleQueryChange = (e) => {
    setQ(e.target.value);
    setCursor(0);
  };

  const open_ = (h) => { navigate(`/wiki/${h.path}`); onClose(); };

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, Math.max(hits.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter' && hits[cursor]) { e.preventDefault(); open_(hits[cursor]); }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-neutral-200 rounded-md shadow-lg text-sm font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-neutral-200">
          <input
            ref={inputRef}
            value={q}
            onChange={handleQueryChange}
            onKeyDown={onKey}
            placeholder="search wiki..."
            className="w-full bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {hits.length === 0 && q && (
            <li className="px-3 py-2 text-neutral-500">no results</li>
          )}
          {hits.map((h, i) => {
            const active = i === cursor;
            return (
              <li
                key={h.id}
                className={[
                  'px-3 py-1.5 cursor-pointer',
                  active ? 'bg-purple-50 text-purple-900' : 'text-neutral-700 hover:bg-neutral-50',
                ].join(' ')}
                onMouseEnter={() => setCursor(i)}
                onClick={() => open_(h)}
              >
                <span className="text-neutral-400">{h.section}/</span>
                {h.title}
                {h.summary && <span className="text-neutral-500"> — {h.summary}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default WikiSearch;
