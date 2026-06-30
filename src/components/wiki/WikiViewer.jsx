// src/components/wiki/WikiViewer.jsx
// Fetches and renders an entry's markdown. Owns heading extraction + scrollspy
// and lifts the (headings, activeId) tuple to the parent via onTocChange so
// the entry page can place a desktop ToC in WikiShell's right column. Renders
// its own mobile <details> ToC, hidden on >=lg viewports.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEntryMarkdown } from '../../utils/wikiContent';
import { renderMarkdown, slugifyHeading } from './markdown';

const WikiViewer = ({ entry, manifest, onTocChange }) => {
  const navigate = useNavigate();
  const bodyRef = useRef(null);
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

  const status = fetch.path !== entry.path ? 'loading' : fetch.status;

  const { html, headings } = useMemo(() => {
    if (status !== 'ok') return { html: '', headings: [] };
    const body = fetch.raw.replace(/^---[\s\S]*?\n---\s*\n?/, '');
    const rendered = renderMarkdown(body, { slugMap });
    // Bake heading ids into the HTML before insertion so anchors and scrollspy
    // resolve without depending on a post-render DOM-mutation effect.
    if (typeof DOMParser === 'undefined') return rendered;
    const doc = new DOMParser().parseFromString(`<body>${rendered.html}</body>`, 'text/html');
    doc.body.querySelectorAll('h2, h3').forEach((el) => {
      el.id = slugifyHeading(el.textContent || '');
    });
    return { html: doc.body.innerHTML, headings: rendered.headings };
  }, [fetch, slugMap, status]);

  // Window-level scrollspy: page scrolls in document flow under the new shell.
  useEffect(() => {
    if (!bodyRef.current) return;
    const root = bodyRef.current;
    const onScroll = () => {
      const els = Array.from(root.querySelectorAll('h2, h3'));
      let current = null;
      for (const el of els) {
        // 80px offset so a heading remains "active" while still visible near the top.
        if (el.getBoundingClientRect().top - 80 <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [html]);

  // Notify parent of heading list + active id whenever either changes.
  useEffect(() => {
    if (onTocChange) onTocChange(headings, activeId);
  }, [headings, activeId, onTocChange]);

  const onClick = (e) => {
    const a = e.target.closest('a.wikilink');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href?.startsWith('/wiki/')) { e.preventDefault(); navigate(href); }
  };

  if (status === 'loading') {
    return <div className="text-neutral-500 text-sm">loading {entry.path}...</div>;
  }
  if (status === 'error') {
    return <div className="text-neutral-700 text-sm">! failed to load {entry.path}</div>;
  }

  return (
    <article>
      <h1 className="text-3xl font-semibold text-neutral-900 mb-1"># {entry.title}</h1>
      <div className="text-sm text-neutral-500 mb-4">
        updated {entry.updated}
        {entry.tags?.length ? <> · {entry.tags.map((t) => `#${t}`).join(' ')}</> : null}
      </div>
      <hr className="border-neutral-200 mb-6" />

      {/* Mobile inline ToC — hidden on >=lg, where the right-column ToC takes over */}
      {headings.length > 0 && (
        <details className="lg:hidden mb-6 text-sm">
          <summary className="cursor-pointer text-neutral-700 select-none">on this page</summary>
          <ul className="mt-2 ml-2 text-neutral-700">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'ml-3' : ''}>
                <a href={`#${h.id}`} className="hover:text-purple-700">{h.text}</a>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div
        ref={bodyRef}
        className="wiki-body"
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
};

export default WikiViewer;
