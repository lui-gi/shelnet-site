// src/pages/wiki-home.jsx
// Landing page for /wiki — hero search, 3-up section cards with latest-in-
// section, recently-updated feed. Tag cloud and explore links land in the
// next slice; this revision already removes the old flat "suggested topics"
// list.
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiSearch from '../components/wiki/WikiSearch';
import { useWikiSearchTrigger } from '../components/wiki/useWikiSearchTrigger';
import { useWikiManifest } from '../utils/useWikiManifest';
import {
  getRecent,
  getEntriesBySection,
  getMostRecentInSection,
  getLastEditedDate,
  getTopTags,
} from '../utils/wikiService';
import { relativeTimeAgo } from '../utils/relativeTime';
import { SECTION_META } from '../config/wikiConfig';

const SECTION_ORDER = ['notes', 'writeups', 'guides'];

const formatLastEdited = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const HomeHero = ({ entryCount, lastEditedLabel }) => (
  <header className="text-center mb-8">
    <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Shelnet wiki</h1>
    <p className="text-sm text-neutral-500 mt-1">
      A personal wiki for notes, writeups, and guides
      {entryCount > 0 && (
        <>
          {' · '}{entryCount} entries
          {lastEditedLabel && <> · last edited {lastEditedLabel}</>}
        </>
      )}
    </p>
  </header>
);

const HeroSearch = ({ onOpen }) => (
  <div className="flex justify-center mb-3">
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open wiki search"
      className="w-full max-w-xl border border-neutral-300 rounded-lg px-4 py-3 text-base text-neutral-400 bg-white shadow-sm flex items-center justify-between hover:border-neutral-400"
    >
      <span><span className="mr-2 text-lg">⌕</span>Search entries, tags, or full text...</span>
      <kbd className="text-xs text-neutral-500 border border-neutral-200 rounded px-1.5 py-0.5 bg-neutral-50">/</kbd>
    </button>
  </div>
);

const SectionCards = ({ sections }) => (
  <section className="mb-8">
    <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Sections</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {sections.map(({ key, meta, count, latest }) => (
        <div
          key={key}
          className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300"
        >
          <div className="flex items-baseline justify-between">
            <Link to={`/wiki/${key}`} className="text-purple-700 font-semibold hover:underline">
              {meta.label}
            </Link>
            <span className="text-neutral-400 text-sm">{count}</span>
          </div>
          <div className="text-neutral-500 text-sm mt-0.5">{meta.blurb}</div>
          {latest.length > 0 && (
            <ul className="mt-2 text-sm">
              {latest.map((e) => (
                <li key={e.slug} className="py-0.5">
                  <span className="text-neutral-400 mr-1">·</span>
                  <Link to={`/wiki/${e.path}`} className="text-neutral-700 hover:text-purple-700">
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  </section>
);

const RecentlyUpdatedList = ({ entries }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
      Recently updated
    </div>
    <ul className="text-sm">
      {entries.map((e, i) => (
        <li
          key={e.slug}
          className={[
            'flex items-baseline justify-between py-1',
            i < entries.length - 1 ? 'border-b border-dashed border-neutral-100' : '',
          ].join(' ')}
        >
          <Link to={`/wiki/${e.path}`} className="text-purple-700 hover:underline truncate mr-2">
            {e.title}
          </Link>
          <span className="text-neutral-400 text-xs shrink-0">
            {e.section}/ · {relativeTimeAgo(e.updated)}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const SuggestedChips = ({ tags, onPick }) => {
  if (!tags.length) return null;
  return (
    <div className="text-center text-sm text-neutral-500 mb-8">
      <span className="mr-1">try:</span>
      {tags.map(({ tag }) => (
        <button
          key={tag}
          type="button"
          onClick={() => onPick(tag)}
          className="inline-block bg-purple-50 text-purple-700 rounded-full px-3 py-0.5 mx-0.5 font-medium hover:bg-purple-100"
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

const TagCloud = ({ tags, onPick }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
      Browse by tag
    </div>
    <div className="flex flex-wrap gap-1.5">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          type="button"
          onClick={() => onPick(tag)}
          className="border border-neutral-200 text-purple-700 rounded-full px-2.5 py-0.5 text-sm hover:border-neutral-300"
        >
          {tag} <span className="text-neutral-400 text-xs">{count}</span>
        </button>
      ))}
    </div>
  </div>
);

const ExploreLinks = ({ onOpenSearch }) => (
  <div className="mt-6">
    <div className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
      Explore
    </div>
    <Link to="/wiki/graph" className="block text-sm text-purple-700 py-1 hover:underline">
      ◆ open graph view →
    </Link>
    <button
      type="button"
      onClick={onOpenSearch}
      className="block w-full text-left text-sm text-purple-700 py-1 hover:underline"
    >
      ⌕ advanced search →
    </button>
  </div>
);

const WikiHome = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useWikiManifest();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeed, setSearchSeed] = useState('');
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

  const openSearch = (seed = '') => {
    setSearchSeed(seed);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchSeed('');
  };

  const sidebar = (
    <WikiSidebar manifest={manifest} currentPath={null} onOpenSearch={() => openSearch('')} />
  );

  if (loading) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-500 text-sm">loading wiki manifest...</div>
        <WikiSearch open={searchOpen} onClose={closeSearch} initialQuery={searchSeed} />
      </WikiShell>
    );
  }
  if (error) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-700 text-sm">! failed to load wiki manifest</div>
        <WikiSearch open={searchOpen} onClose={closeSearch} initialQuery={searchSeed} />
      </WikiShell>
    );
  }

  const entryCount = manifest.entries?.length || 0;
  const lastEditedLabel = formatLastEdited(getLastEditedDate(manifest));
  const recent = getRecent(manifest, 5);
  const sections = SECTION_ORDER.map((key) => ({
    key,
    meta: SECTION_META[key],
    count: getEntriesBySection(manifest, key).length,
    latest: getMostRecentInSection(manifest, key, 3),
  }));
  const topTags = getTopTags(manifest, 12);
  const suggestedTags = topTags.slice(0, 5);

  return (
    <WikiShell sidebar={sidebar} toc={null}>
      <WikiSearch open={searchOpen} onClose={closeSearch} initialQuery={searchSeed} />

      <div className="max-w-3xl mx-auto">
        <HomeHero entryCount={entryCount} lastEditedLabel={lastEditedLabel} />
        <HeroSearch onOpen={() => openSearch('')} />
        <SuggestedChips tags={suggestedTags} onPick={openSearch} />
        <SectionCards sections={sections} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
          <RecentlyUpdatedList entries={recent} />
          <div>
            <TagCloud tags={topTags} onPick={openSearch} />
            <ExploreLinks onOpenSearch={() => openSearch('')} />
          </div>
        </div>
      </div>
    </WikiShell>
  );
};

export default WikiHome;
