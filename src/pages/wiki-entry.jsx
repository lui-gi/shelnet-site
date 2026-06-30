// src/pages/wiki-entry.jsx
// Viewer route for /wiki/:section/* — resolves the full path to an entry,
// hands it to WikiViewer, and renders the standard WikiShell with sidebar.
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiViewer from '../components/wiki/WikiViewer';
import WikiSearch from '../components/wiki/WikiSearch';
import { useWikiSearchTrigger } from '../components/wiki/useWikiSearchTrigger';
import { useWikiManifest } from '../utils/useWikiManifest';
import { getEntryByPath } from '../utils/wikiService';

const WikiEntry = () => {
  const params = useParams();
  // section is the named segment; rest is the splat (* matches the remainder).
  const rest = params['*'] || '';
  const path = rest ? `${params.section}/${rest}` : params.section;

  const { manifest, loading, error } = useWikiManifest();
  const [searchOpen, setSearchOpen] = useState(false);
  useWikiSearchTrigger(setSearchOpen);

  const sidebar = (
    <WikiSidebar
      manifest={manifest}
      currentPath={path}
      onOpenSearch={() => setSearchOpen(true)}
    />
  );

  if (loading) return <WikiShell sidebar={sidebar} currentPath={path}><div className="py-6 text-white/40 text-xs">loading...</div></WikiShell>;
  if (error)   return <WikiShell sidebar={sidebar} currentPath={path}><div className="py-6 text-white/60 text-xs">! failed to load wiki manifest</div></WikiShell>;

  const entry = getEntryByPath(manifest, path);
  if (!entry) {
    return (
      <WikiShell sidebar={sidebar} currentPath={path}>
        <div className="py-6 text-white/60 text-xs">
          ! no entry at <span className="text-white/80">{path}</span> ·{' '}
          <Link to="/wiki" className="hover:text-white" style={{ color: '#c084fc' }}>back to /wiki</Link>
        </div>
        <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </WikiShell>
    );
  }

  return (
    <WikiShell sidebar={sidebar} currentPath={path}>
      <WikiViewer entry={entry} manifest={manifest} />
      <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </WikiShell>
  );
};

export default WikiEntry;
