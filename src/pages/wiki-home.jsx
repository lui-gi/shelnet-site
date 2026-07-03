// src/pages/wiki-home.jsx
// Landing page for /wiki — inline hero search (typeahead) with the shared
// minisearch backend, 3-up section cards with latest-in-section, recently-
// updated feed, top-12 tag cloud, and explore links. The modal flow stays
// available via the sidebar and the "advanced search" explore link.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WikiShell from '../components/wiki/WikiShell';
import WikiSidebar from '../components/wiki/WikiSidebar';
import WikiSearch from '../components/wiki/WikiSearch';
import WikiSearchHits from '../components/wiki/WikiSearchHits';
import { useWikiSearchEngine } from '../components/wiki/useWikiSearchEngine';
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
    <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">shelnet wiki</h1>
    <p className="text-sm text-neutral-500 mt-1">
      a personal wiki for notes, writeups, and guides
      {entryCount > 0 && (
        <>
          {' · '}{entryCount} entries
          {lastEditedLabel && <> · last edited {lastEditedLabel}</>}
        </>
      )}
    </p>
  </header>
);

const InlineHeroSearch = ({ q, onQChange, onKeyDown, inputRef, hits, cursor, onCursorChange, onPick }) => {
  const showPanel = q.trim().length > 0;
  return (
    <div className="relative max-w-xl mx-auto mb-3">
      <div
        className={[
          'flex items-center justify-between bg-white border rounded-lg px-4 py-3 text-base',
          'focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200',
          'shadow-sm',
          showPanel ? 'border-purple-600' : 'border-neutral-300',
        ].join(' ')}
      >
        <span className="text-lg text-neutral-400 mr-2 select-none">⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={onQChange}
          onKeyDown={onKeyDown}
          aria-label="Search wiki"
          placeholder="Search entries, tags, or full text..."
          className="flex-1 bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400 selection:bg-purple-200 selection:text-neutral-900"
        />
        <kbd className="ml-2 text-xs text-neutral-500 border border-neutral-200 rounded px-1.5 py-0.5 bg-neutral-50 select-none">/</kbd>
      </div>
      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-md shadow-lg z-30 text-sm">
          <WikiSearchHits
            hits={hits}
            cursor={cursor}
            onCursorChange={onCursorChange}
            onPick={onPick}
            emptyText={`no results for "${q}"`}
            query={q}
          />
          <div className="px-3 py-1.5 text-xs text-neutral-400 border-t border-neutral-100 select-none">
            ↑/↓ navigate · ↵ open · Esc to blur
          </div>
        </div>
      )}
    </div>
  );
};

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

const WikiHome = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useWikiManifest();

  // Inline hero search state
  const inputRef = useRef(null);
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const { hits } = useWikiSearchEngine(q);

  // Modal still exists for sidebar + advanced-search explore link
  const [searchOpen, setSearchOpen] = useState(false);

  const focusInline = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Reset cursor whenever the query changes
  useEffect(() => { setCursor(0); }, [q]);

  // `/` on /wiki focuses the inline input; `Esc` exits to /.
  // We intentionally do NOT use `useWikiSearchTrigger` here so the home page can
  // own the `/` behavior.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        focusInline();
      } else if (e.key === 'Escape' && !isTyping) {
        e.preventDefault();
        navigate(window.location.pathname === '/wiki' ? '/' : '/wiki');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, focusInline]);

  const onInputKey = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(hits.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && hits[cursor]) {
      e.preventDefault();
      navigate(`/wiki/${hits[cursor].path}`);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  }, [hits, cursor, navigate]);

  const onPickHit = useCallback((h) => navigate(`/wiki/${h.path}`), [navigate]);
  const onChipPick = useCallback((tag) => {
    setQ(tag);
    setCursor(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeSearch = () => setSearchOpen(false);

  const topTags = useMemo(() => getTopTags(manifest, 12), [manifest]);
  const suggestedTags = useMemo(() => topTags.slice(0, 5), [topTags]);

  const sidebar = (
    <WikiSidebar manifest={manifest} currentPath={null} onOpenSearch={() => setSearchOpen(true)} />
  );

  if (loading) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-500 text-sm">loading wiki manifest...</div>
        <WikiSearch open={searchOpen} onClose={closeSearch} />
      </WikiShell>
    );
  }
  if (error) {
    return (
      <WikiShell sidebar={sidebar} toc={null}>
        <div className="text-neutral-700 text-sm">! failed to load wiki manifest</div>
        <WikiSearch open={searchOpen} onClose={closeSearch} />
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

  const searching = q.trim().length > 0;

  return (
    <WikiShell sidebar={sidebar} toc={null}>
      <WikiSearch open={searchOpen} onClose={closeSearch} />

      <div className="max-w-3xl mx-auto">
        <HomeHero entryCount={entryCount} lastEditedLabel={lastEditedLabel} />
        <InlineHeroSearch
          q={q}
          onQChange={(e) => setQ(e.target.value)}
          onKeyDown={onInputKey}
          inputRef={inputRef}
          hits={hits}
          cursor={cursor}
          onCursorChange={setCursor}
          onPick={onPickHit}
        />
        <SuggestedChips tags={suggestedTags} onPick={onChipPick} />
        <div
          aria-hidden={searching ? 'true' : 'false'}
          className={[
            'transition-opacity',
            searching ? 'opacity-40 pointer-events-none' : 'opacity-100',
          ].join(' ')}
        >
          <SectionCards sections={sections} />
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">
            <RecentlyUpdatedList entries={recent} />
            <TagCloud tags={topTags} onPick={onChipPick} />
          </div>
        </div>
      </div>
    </WikiShell>
  );
};

export default WikiHome;
