// src/config/wikiConfig.js
// Configuration for the /wiki section: base URL of the published shelnet-wiki
// artifacts and per-section display metadata used by the sidebar and home page.
import { ACCENTS } from './theme';

export const WIKI_BASE_URL =
  import.meta.env.VITE_WIKI_BASE_URL || 'https://lui-gi.github.io/shelnet-wiki';

export const SECTION_META = {
  notes:    { label: 'notes/',    blurb: 'cert + study notes',         accent: ACCENTS.purple.hex },
  writeups: { label: 'writeups/', blurb: 'ctf + lab writeups',         accent: ACCENTS.purple.hex },
  guides:   { label: 'guides/',   blurb: 'longer explanatory pieces',  accent: ACCENTS.purple.hex },
};

export const WIKI_ACCENT = ACCENTS.purple.hex;
