// src/pages/wiki-entry.jsx
// Viewer route for /wiki/:section/* — resolves the full path to an entry,
// hands it to WikiViewer, and renders the standard WikiShell with sidebar.
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiViewer from '../components/wiki/WikiViewer';
import WikiToc from '../components/wiki/WikiToc';
import WikiSearch from '../components/wiki/WikiSearch';
import { useWikiSearchTrigger } from '../components/wiki/useWikiSearchTrigger';
import { useWikiManifest } from '../utils/useWikiManifest';
import { getEntryByPath, getEntriesUnderPath } from '../utils/wikiService';
import { relativeTimeAgo } from '../utils/relativeTime';
import { SECTION_META } from '../config/wikiConfig';

const sortByUpdatedDesc = (a, b) =>
  (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0);

const DirectoryListing = ({ path, entries }) => {
  const segments = path.split('/');
  const depth = segments.length;
  const groups = new Map();
  const direct = [];
  for (const e of entries) {
    const parts = e.path.split('/');
    if (parts.length === depth + 1) {
      direct.push(e);
    } else {
      const subdir = parts[depth];
      if (!groups.has(subdir)) groups.set(subdir, []);
      groups.get(subdir).push(e);
    }
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  direct.sort(sortByUpdatedDesc);

  const sectionKey = segments[0];
  const meta = depth === 1 ? SECTION_META[sectionKey] : null;
  const heading = meta ? meta.label : `${path}/`;

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{heading}</h1>
        {meta?.blurb && (
          <p className="text-sm text-neutral-500 mt-1">{meta.blurb} · {entries.length} entries</p>
        )}
        {!meta && (
          <p className="text-sm text-neutral-500 mt-1">{entries.length} entries</p>
        )}
      </header>

      {sortedGroups.map(([subdir, subEntries]) => {
        const subPath = `${path}/${subdir}`;
        const sorted = [...subEntries].sort(sortByUpdatedDesc);
        return (
          <section key={subdir} className="mb-6">
            <div className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
              <Link to={`/wiki/${subPath}`} className="text-neutral-700 hover:text-purple-700">
                {subdir}/
              </Link>
              <span className="text-neutral-400 ml-2 normal-case tracking-normal">{subEntries.length}</span>
            </div>
            <ul className="text-sm">
              {sorted.map((e) => (
                <li key={e.path} className="flex items-baseline justify-between py-1 border-b border-dashed border-neutral-100 last:border-0">
                  <Link to={`/wiki/${e.path}`} className="text-purple-700 hover:underline truncate mr-2">
                    {e.title}
                  </Link>
                  <span className="text-neutral-400 text-xs shrink-0">
                    {relativeTimeAgo(e.updated)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {direct.length > 0 && (
        <section className="mb-6">
          {sortedGroups.length > 0 && (
            <div className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
              in this section
            </div>
          )}
          <ul className="text-sm">
            {direct.map((e) => (
              <li key={e.path} className="flex items-baseline justify-between py-1 border-b border-dashed border-neutral-100 last:border-0">
                <Link to={`/wiki/${e.path}`} className="text-purple-700 hover:underline truncate mr-2">
                  {e.title}
                </Link>
                <span className="text-neutral-400 text-xs shrink-0">
                  {relativeTimeAgo(e.updated)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

const WikiEntry = () => {
  const params = useParams();
  // section is the named segment; rest is the splat (* matches the remainder).
  const rest = params['*'] || '';
  const path = rest ? `${params.section}/${rest}` : params.section;

  const navigate = useNavigate();
  const { manifest, loading, error } = useWikiManifest();
  const [searchOpen, setSearchOpen] = useState(false);
  useWikiSearchTrigger(setSearchOpen);

  const [toc, setToc] = useState({ headings: [], activeId: null });
  const handleTocChange = useCallback((headings, activeId) => {
    setToc({ headings, activeId });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        // entry: go up one path segment; home: go to /
        navigate('/wiki' === window.location.pathname ? '/' : '/wiki');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const sidebar = (
    <WikiSidebar
      manifest={manifest}
      currentPath={path}
      onOpenSearch={() => setSearchOpen(true)}
    />
  );

  if (loading) return <WikiShell sidebar={sidebar} toc={null}><div className="text-sm text-neutral-500">loading...</div></WikiShell>;
  if (error)   return <WikiShell sidebar={sidebar} toc={null}><div className="text-sm text-neutral-700">! failed to load wiki manifest</div></WikiShell>;

  const entry = getEntryByPath(manifest, path);
  if (!entry) {
    const under = getEntriesUnderPath(manifest, path);
    if (under.length > 0) {
      return (
        <WikiShell sidebar={sidebar} toc={null}>
          <DirectoryListing path={path} entries={under} />
          <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </WikiShell>
      );
    }
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-sm text-neutral-700">
          ! no entry at <span className="text-neutral-900">{path}</span> ·{' '}
          <Link to="/wiki" className="text-purple-700 hover:underline">back to /wiki</Link>
        </div>
        <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </WikiShell>
    );
  }

  return (
    <WikiShell
      sidebar={sidebar}
      toc={<WikiToc headings={toc.headings} activeId={toc.activeId} />}
    >
      <WikiViewer entry={entry} manifest={manifest} onTocChange={handleTocChange} />
      <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </WikiShell>
  );
};

export default WikiEntry;
