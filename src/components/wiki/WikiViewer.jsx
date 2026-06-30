// src/components/wiki/WikiViewer.jsx
// Fetches an entry's raw markdown, renders it (preprocessing wikilinks against
// the manifest's slug→path map), and threads the ToC at the top. Scrollspy
// updates `activeId` as the user scrolls past headings. Intercepts in-app
// wikilink clicks to use the SPA navigator instead of full page loads.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEntryMarkdown } from '../../utils/wikiContent';
import { renderMarkdown, slugifyHeading } from './markdown';
import WikiToc from './WikiToc';
import { SHELL } from '../../config/theme';
import { WIKI_ACCENT } from '../../config/wikiConfig';

const WikiViewer = ({ entry, manifest }) => {
  const navigate = useNavigate();
  const bodyRef = useRef(null);
  // `fetch` bundles path+raw+status so every async update is a single setState call.
  // The initial value already encodes 'loading' so the effect never needs a sync setState.
  const [fetch, setFetch] = useState(() => ({ path: entry.path, raw: '', status: 'loading' }));
  const [activeId, setActiveId] = useState(null);

  const slugMap = useMemo(() => {
    const m = new Map();
    for (const e of manifest?.entries || []) m.set(e.slug, e.path);
    return m;
  }, [manifest]);

  useEffect(() => {
    let cancelled = false;
    fetchEntryMarkdown(entry.path)
      .then((md) => { if (!cancelled) setFetch({ path: entry.path, raw: md, status: 'ok' }); })
      .catch(() => { if (!cancelled) setFetch({ path: entry.path, raw: '', status: 'error' }); });
    return () => { cancelled = true; };
  }, [entry.path]);

  // If the entry.path has changed but the fetch hasn't caught up yet, treat as loading.
  const status = fetch.path !== entry.path ? 'loading' : fetch.status;

  const { html, headings } = useMemo(() => {
    if (status !== 'ok') return { html: '', headings: [] };
    // Strip frontmatter (between leading --- pairs) before rendering.
    const body = fetch.raw.replace(/^---[\s\S]*?\n---\s*\n?/, '');
    return renderMarkdown(body, { slugMap });
  }, [fetch, slugMap, status]);

  // After render, inject ids onto H2/H3 elements in the rendered DOM so the
  // ToC anchors resolve. marked doesn't emit ids by default.
  useEffect(() => {
    if (!bodyRef.current) return;
    const els = bodyRef.current.querySelectorAll('h2, h3');
    els.forEach((el) => { el.id = slugifyHeading(el.textContent || ''); });
  }, [html]);

  // Scrollspy: pick the topmost heading whose top is at or just above the
  // viewer's scroll position.
  useEffect(() => {
    if (!bodyRef.current) return;
    const root = bodyRef.current;
    const onScroll = () => {
      const els = Array.from(root.querySelectorAll('h2, h3'));
      const rootTop = root.getBoundingClientRect().top;
      let current = null;
      for (const el of els) {
        const top = el.getBoundingClientRect().top - rootTop;
        if (top - 16 <= 0) current = el.id; else break;
      }
      setActiveId(current);
    };
    const target = root.closest('.overflow-y-auto') || root;
    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener('scroll', onScroll);
  }, [html]);

  // Intercept clicks on wikilinks so they use SPA navigation.
  const onClick = (e) => {
    const a = e.target.closest('a.wikilink');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href?.startsWith('/wiki/')) { e.preventDefault(); navigate(href); }
  };

  if (status === 'loading') {
    return <div className="py-6 text-white/40 text-xs">loading <span style={{ color: WIKI_ACCENT }}>{entry.path}</span>...</div>;
  }
  if (status === 'error') {
    return <div className="py-6 text-white/60 text-xs">! failed to load <span style={{ color: WIKI_ACCENT }}>{entry.path}</span></div>;
  }
  return (
    <div className="py-3">
      <h1 className="text-base mb-1" style={{ color: WIKI_ACCENT }}># {entry.title}</h1>
      <div className="text-white/40 text-xs mb-2">
        <span style={{ color: SHELL.dim }}>updated</span> {entry.updated}
        {entry.tags?.length ? <> · {entry.tags.map((t) => `#${t}`).join(' ')}</> : null}
      </div>
      <WikiToc headings={headings} activeId={activeId} />
      <div
        ref={bodyRef}
        className="wiki-body prose-invert text-white/80 text-sm leading-relaxed"
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default WikiViewer;
