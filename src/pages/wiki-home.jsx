// src/pages/wiki-home.jsx
// Landing page for /wiki. Shows recent entries, suggested topics, and
// per-section counts inside the standard WikiShell layout.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiSearch from '../components/wiki/WikiSearch';
import { useWikiSearchTrigger } from '../components/wiki/useWikiSearchTrigger';
import { Panel } from '../components/tui/ascii';
import { useWikiManifest } from '../utils/useWikiManifest';
import { getRecent, getSuggested, getEntriesBySection } from '../utils/wikiService';
import { SECTION_META, WIKI_ACCENT } from '../config/wikiConfig';

const EntryList = ({ entries }) => (
  <ul className="py-1 text-xs leading-relaxed">
    {entries.map((e) => (
      <li key={e.slug} className="truncate">
        <Link to={`/wiki/${e.path}`} className="hover:text-white" style={{ color: 'rgba(255,255,255,0.65)' }}>
          • {e.title}
        </Link>
        <span className="text-white/30"> — {e.summary}</span>
      </li>
    ))}
  </ul>
);

const WikiHome = () => {
  const { manifest, loading, error } = useWikiManifest();
  const [searchOpen, setSearchOpen] = useState(false);
  useWikiSearchTrigger(setSearchOpen);

  const sidebar = <WikiSidebar manifest={manifest} currentPath={null} onOpenSearch={() => setSearchOpen(true)} />;

  if (loading) {
    return (
      <WikiShell sidebar={sidebar}>
        <div className="py-6 text-white/40 text-xs">loading wiki manifest...</div>
        <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </WikiShell>
    );
  }
  if (error) {
    return (
      <WikiShell sidebar={sidebar}>
        <div className="py-6 text-white/60 text-xs">! failed to load wiki manifest</div>
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
    <WikiShell sidebar={sidebar}>
      <WikiSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="py-3 space-y-4">
        <Panel hex={WIKI_ACCENT} title={<span style={{ color: WIKI_ACCENT }}>recent</span>}>
          <EntryList entries={recent} />
        </Panel>
        {suggested.length > 0 && (
          <Panel hex={WIKI_ACCENT} title={<span style={{ color: WIKI_ACCENT }}>suggested topics</span>}>
            <EntryList entries={suggested} />
          </Panel>
        )}
        <Panel hex={WIKI_ACCENT} title={<span style={{ color: WIKI_ACCENT }}>sections</span>}>
          <ul className="py-1 text-xs leading-relaxed">
            {sectionRows.map(({ key, meta, count }) => (
              <li key={key} className="flex justify-between">
                <Link to={`/wiki/${key}`} className="hover:text-white" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {meta.label} <span className="text-white/30">— {meta.blurb}</span>
                </Link>
                <span className="text-white/40">{count}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </WikiShell>
  );
};

export default WikiHome;
