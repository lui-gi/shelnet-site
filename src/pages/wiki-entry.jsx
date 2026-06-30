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
import { getEntryByPath } from '../utils/wikiService';

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
      if (e.key === 'g') { e.preventDefault(); navigate('/wiki/graph'); }
      else if (e.key === 'Escape') {
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

  if (loading) return <WikiShell sidebar={sidebar} toc={null}><div className="py-6 text-white/40 text-xs">loading...</div></WikiShell>;
  if (error)   return <WikiShell sidebar={sidebar} toc={null}><div className="py-6 text-white/60 text-xs">! failed to load wiki manifest</div></WikiShell>;

  const entry = getEntryByPath(manifest, path);
  if (!entry) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="py-6 text-white/60 text-xs">
          ! no entry at <span className="text-white/80">{path}</span> ·{' '}
          <Link to="/wiki" className="hover:text-white" style={{ color: '#c084fc' }}>back to /wiki</Link>
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
