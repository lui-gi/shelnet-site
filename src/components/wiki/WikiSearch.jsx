// src/components/wiki/WikiSearch.jsx
// Search modal. Lazy-loads minisearch + the index on first open. Results are
// keyboard-navigable (↑/↓ to move, Enter to open, Esc to close).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSearchIndex } from '../../utils/wikiContent';
import { WIKI_ACCENT } from '../../config/wikiConfig';

const WikiSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [index, setIndex] = useState(null);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (!index) fetchSearchIndex().then(setIndex).catch(() => {});
  }, [open, index]);

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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-black border font-mono text-sm"
        style={{ borderColor: WIKI_ACCENT }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(192,132,252,0.3)' }}>
          <input
            ref={inputRef}
            value={q}
            onChange={handleQueryChange}
            onKeyDown={onKey}
            placeholder="search wiki..."
            className="w-full bg-transparent outline-none text-white placeholder-white/30"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto text-xs">
          {hits.length === 0 && q && (
            <li className="px-3 py-2 text-white/40">no results</li>
          )}
          {hits.map((h, i) => (
            <li
              key={h.id}
              className={`px-3 py-1.5 cursor-pointer ${i === cursor ? '' : 'text-white/65'}`}
              style={i === cursor ? { color: WIKI_ACCENT, backgroundColor: 'rgba(192,132,252,0.08)' } : undefined}
              onMouseEnter={() => setCursor(i)}
              onClick={() => open_(h)}
            >
              <span className="text-white/40">{h.section}/</span>
              {h.title}
              {h.summary && <span className="text-white/30"> — {h.summary}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WikiSearch;
