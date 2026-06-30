// src/components/wiki/WikiSearch.jsx
// Light-themed wiki search modal. Reuses the shared useWikiSearchEngine hook
// and WikiSearchHits component so the inline hero search on /wiki shares the
// same backend and hit rendering.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWikiSearchEngine } from './useWikiSearchEngine';
import WikiSearchHits from './WikiSearchHits';

const WikiSearch = ({ open, onClose, initialQuery = '' }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const prevOpenRef = useRef(false);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const { hits } = useWikiSearchEngine(q);

  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    const wasClosed = !prevOpenRef.current;
    prevOpenRef.current = true;
    if (wasClosed) {
      inputRef.current?.focus();
      if (initialQuery) {
        setQ(initialQuery);
        setCursor(0);
      }
    }
  }, [open, initialQuery]);

  const open_ = (h) => { navigate(`/wiki/${h.path}`); onClose(); };

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, Math.max(hits.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter' && hits[cursor]) { e.preventDefault(); open_(hits[cursor]); }
  };

  const handleQueryChange = (e) => {
    setQ(e.target.value);
    setCursor(0);
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
        <WikiSearchHits
          hits={hits}
          cursor={cursor}
          onCursorChange={setCursor}
          onPick={open_}
          emptyText="no results"
          query={q}
        />
      </div>
    </div>
  );
};

export default WikiSearch;
