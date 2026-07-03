// src/components/tui/BottomBar.jsx
// Global sticky tty bar pinned to the bottom of every page, the mirror of
// PromptBar. Left: three global affordances that work on every route —
//   [ /  find ]   command palette (routes + certs + modules)
//   [ g_ go   ]   vim-style jump leader (see JUMP_MAP)
//   [ r  ??   ]   random discovery (wiki entry or bytes track)
// Right: contextual keyboard shortcuts for the current route, plus an always-
// present [ ? help ] hint that opens the cheat sheet. Hidden on mobile where
// there is no keyboard. Mounted once in Layout, below the Outlet.
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { SHELL } from '../../config/theme';
import { shortcutsForPath } from '../../config/shortcuts';
import { useManifest } from '../../utils/useManifest';
import { useWikiManifest } from '../../utils/useWikiManifest';
import { useGlobalShortcuts } from '../../utils/useGlobalShortcuts';
import { pickRandomTarget } from '../../utils/randomTarget';
import CommandPalette from './CommandPalette';
import HelpOverlay from './HelpOverlay';
import ChangelogOverlay from './ChangelogOverlay';

// Rendered left-side affordances. Each shows a colored key hint next to a
// dim label, using the same `[ … ]` frame as the old CTAs.
const SLOTS = [
  { id: 'palette', keys: '/',  label: 'find' },
  { id: 'jump',    keys: 'g_', label: 'go'   },
  { id: 'random',  keys: 'r',  label: '??'   },
  { id: 'news',    keys: 'n',  label: 'news' },
];

const BottomBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { manifest } = useManifest();
  const { manifest: wikiManifest } = useWikiManifest();
  const hints = shortcutsForPath(pathname);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const closeAll = () => { setPaletteOpen(false); setHelpOpen(false); setNewsOpen(false); };
  const openPalette = useCallback(() => { closeAll(); setPaletteOpen(true); }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openHelp = useCallback(() => { closeAll(); setHelpOpen(true); }, []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const openNews = useCallback(() => { closeAll(); setNewsOpen(true); }, []);
  const closeNews = useCallback(() => setNewsOpen(false), []);

  const doRandom = useCallback(() => {
    const target = pickRandomTarget(manifest, wikiManifest);
    if (target) navigate(target);
  }, [manifest, wikiManifest, navigate]);

  useGlobalShortcuts({
    onPalette: openPalette,
    onHelp: openHelp,
    onRandom: doRandom,
    onNews: openNews,
    disabled: paletteOpen || helpOpen || newsOpen,
  });

  const onSlotClick = (id) => {
    if (id === 'palette') openPalette();
    else if (id === 'jump') openHelp();
    else if (id === 'random') doRandom();
    else if (id === 'news') openNews();
  };

  return (
    <>
      <nav aria-label="Quick actions"
           className="fixed inset-x-0 bottom-0 z-50 h-9 border-t border-white/10 bg-black/90 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between gap-3 px-6 font-mono text-xs sm:text-sm">
          {/* global chord affordances */}
          <div className="flex items-center gap-3 overflow-x-auto">
            {SLOTS.map((s) => (
              <button key={s.id}
                      type="button"
                      onClick={() => onSlotClick(s.id)}
                      aria-label={`${s.label} (${s.keys})`}
                      className="shrink-0 whitespace-nowrap rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60">
                <span className="text-white/25">[</span>
                <span style={{ color: SHELL.green, fontWeight: 600 }}>&nbsp;{s.keys}&nbsp;</span>
                <span className="text-white/70">{s.label}</span>
                <span className="text-white/25">&nbsp;]</span>
              </button>
            ))}
          </div>

          {/* contextual hints + persistent ? help */}
          <div className="hidden sm:flex shrink-0 items-center gap-2">
            {hints.map((h, i) => (
              <span key={i} className="whitespace-nowrap">
                {i > 0 && <span className="mr-2 text-white/25">·</span>}
                <span style={{ color: SHELL.green, fontWeight: 600 }}>{h.keys}</span>{' '}
                <span className="text-white/60">{h.label}</span>
              </span>
            ))}
            <span className="text-white/25">·</span>
            <button type="button" onClick={openHelp} aria-label="Open keyboard shortcuts (?)"
                    className="whitespace-nowrap rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#43c08c]/60">
              <span style={{ color: SHELL.green, fontWeight: 600 }}>?</span>{' '}
              <span className="text-white/60">help</span>
            </button>
          </div>
        </div>
      </nav>

      <CommandPalette   open={paletteOpen} onClose={closePalette} />
      <HelpOverlay      open={helpOpen}    onClose={closeHelp} />
      <ChangelogOverlay open={newsOpen}    onClose={closeNews} />
    </>
  );
};

export default BottomBar;
