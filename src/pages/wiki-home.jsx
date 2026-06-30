// src/pages/wiki-home.jsx
// Landing page for /wiki — three light-theme sections (Recent / Suggested /
// Sections) rendered inside the standard WikiShell.
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiSearch from '../components/wiki/WikiSearch';
import { useWikiSearchTrigger } from '../components/wiki/useWikiSearchTrigger';
import { useWikiManifest } from '../utils/useWikiManifest';
import { getRecent, getSuggested, getEntriesBySection } from '../utils/wikiService';
import { SECTION_META } from '../config/wikiConfig';

const SectionHeading = ({ children }) => (
  <h2 className="text-xl font-semibold text-neutral-900 mt-8 mb-1 pb-1 border-b border-neutral-200 first:mt-0">
    {children}
  </h2>
);

const EntryList = ({ entries }) => (
  <ul className="text-sm leading-relaxed">
    {entries.map((e) => (
      <li key={e.slug} className="py-0.5">
        <Link to={`/wiki/${e.path}`} className="text-purple-700 hover:underline">
          {e.title}
        </Link>
        {e.summary && <span className="text-neutral-500"> — {e.summary}</span>}
      </li>
    ))}
  </ul>
);

const WikiHome = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useWikiManifest();
  const [searchOpen, setSearchOpen] = useState(false);
  useWikiSearchTrigger(setSearchOpen);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'g') { e.preventDefault(); navigate('/wiki/graph'); }
      else if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/wiki' === window.location.pathname ? '/' : '/wiki');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const sidebar = (
    <WikiSidebar manifest={manifest} currentPath={null} onOpenSearch={() => setSearchOpen(true)} />
  );

  if (loading) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-500 text-sm">loading wiki manifest...</div>
        <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </WikiShell>
    );
  }
  if (error) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-700 text-sm">! failed to load wiki manifest</div>
        <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </WikiShell>
    );
  }

  const recent = getRecent(manifest, 10);
  const suggested = getSuggested(manifest);
  const sectionRows = ['notes', 'writeups', 'guides'].map((k) => ({
    key: k,
    meta: SECTION_META[k],
    count: getEntriesBySection(manifest, k).length,
  }));

  return (
    <WikiShell sidebar={sidebar} toc={null}>
      <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <SectionHeading>recent</SectionHeading>
      <EntryList entries={recent} />

      {suggested.length > 0 && (
        <>
          <SectionHeading>suggested topics</SectionHeading>
          <EntryList entries={suggested} />
        </>
      )}

      <SectionHeading>sections</SectionHeading>
      <ul className="text-sm leading-relaxed">
        {sectionRows.map(({ key, meta, count }) => (
          <li key={key} className="flex justify-between py-0.5">
            <Link to={`/wiki/${key}`} className="text-purple-700 hover:underline">
              {meta.label}
              <span className="text-neutral-500"> — {meta.blurb}</span>
            </Link>
            <span className="text-neutral-500">{count}</span>
          </li>
        ))}
      </ul>
    </WikiShell>
  );
};

export default WikiHome;
