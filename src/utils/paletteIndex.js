// src/utils/paletteIndex.js
// Builds the searchable pool for the global command palette (`/`). Includes:
//   - fixed top-level routes (home, wiki, certs/modules/labs/visualizations, bytes, connect)
//   - every cert dashboard from the resources manifest
//   - every module room from the static moduleRegistry
// Each entry has a hex accent so the marker glyph matches the destination's
// existing color language (certs pick up their manifest accent; modules pick
// up their category accent).
import { ACCENTS } from '../config/theme';
import { MODULES, accentForCategory } from '../config/moduleRegistry';
import { getCerts } from './manifestService';

const hex = (accent) => (ACCENTS[accent] || ACCENTS.green).hex;

const STATIC_ROUTES = [
  { label: 'home',           sub: '~',                          path: '/',                accent: 'green'  },
  { label: 'wiki',           sub: 'notes + writeups + guides',  path: '/wiki',            accent: 'purple' },
  { label: 'certs',          sub: 'study console',              path: '/certs',           accent: 'green'  },
  { label: 'modules',        sub: 'interactive rooms',          path: '/modules',         accent: 'green'  },
  { label: 'labs',           sub: 'wip lab environments',       path: '/labs',            accent: 'orange' },
  { label: 'visualizations', sub: 'foundational primers',       path: '/visualizations',  accent: 'purple' },
  { label: 'bytes',          sub: 'rapid-fire practice',        path: '/bytes',           accent: 'green'  },
  { label: 'connect',        sub: 'contact + socials',          path: '/connect',         accent: 'green'  },
];

export function buildPaletteIndex(manifest) {
  const certs = manifest
    ? getCerts(manifest).map((c) => ({
        label: c.label.toLowerCase(),
        sub: `cert · ${c.code || c.slug}`,
        path: `/certs/${c.slug}`,
        accent: c.accent,
      }))
    : [];
  const modules = MODULES.map((m) => ({
    label: m.name.toLowerCase(),
    sub: `module · ${m.category}${m.status === 'soon' ? ' · soon' : ''}`,
    path: `/modules/${m.slug}`,
    accent: accentForCategory(m.category),
  }));
  return STATIC_ROUTES.concat(certs, modules).map((e) => ({ ...e, hex: hex(e.accent) }));
}

// Cheap fuzzy score: substring match on either label or sub, weighted so that
// prefix matches on the label rank highest.
export function scoreEntry(query, entry) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const l = entry.label;
  if (l === q) return 1000;
  if (l.startsWith(q)) return 500;
  const li = l.indexOf(q);
  if (li >= 0) return 200 - li;
  const si = entry.sub.toLowerCase().indexOf(q);
  if (si >= 0) return 100 - si;
  return -1;
}

export function filterPalette(query, index) {
  if (!query) return index;
  const scored = [];
  for (const e of index) {
    const s = scoreEntry(query, e);
    if (s >= 0) scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.map(([, e]) => e);
}
