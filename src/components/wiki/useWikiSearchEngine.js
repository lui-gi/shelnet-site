// src/components/wiki/useWikiSearchEngine.js
// Shared search hook used by the WikiSearch modal and the inline hero search.
// Lazy-loads the minisearch index on first non-empty query, then runs the same
// prefix/fuzzy lookup the modal has always used.
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchSearchIndex } from '../../utils/wikiContent';

export function useWikiSearchEngine(query) {
  const [index, setIndex] = useState(null);
  const [status, setStatus] = useState('idle');
  const requested = useRef(false);

  const trimmed = (query || '').trim();

  useEffect(() => {
    if (!trimmed) return;
    if (index || requested.current) return;
    requested.current = true;
    setStatus('loading');
    fetchSearchIndex()
      .then((idx) => { setIndex(idx); setStatus('ok'); })
      .catch(() => {
        requested.current = false;
        setStatus('error');
      });
  }, [trimmed, index]);

  const hits = useMemo(() => {
    if (!index || !trimmed) return [];
    return index.search(trimmed, { prefix: true, fuzzy: 0.2 }).slice(0, 10);
  }, [trimmed, index]);

  const effectiveStatus = !trimmed ? 'idle' : (index ? 'ok' : status);

  return { hits, status: effectiveStatus };
}
