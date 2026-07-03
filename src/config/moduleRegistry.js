// src/config/moduleRegistry.js
// Single source of truth for the interactive modules catalog: skill-domain
// categories plus the module list. Each category has an accent; each module is
// `live` (carries a GUI room: a stageKind + a lazily imported data object) or
// `soon` (a stub that appears in `list` and advertises intended breadth).
// Foundations also surfaces the old static visualizations as inert "primers".
//
// Adding a room of an existing stage kind is a data edit here plus one module
// file under config/modules/; a genuinely new mechanic is one new stage kind
// under components/room/stages/. The taxonomy is by skill domain (no red/blue
// framing) per the GUI-rooms plan.
import { getVisualizations } from '../utils/manifestService';

// Ordered skill domains. `accent` indexes ACCENTS (config/theme.js); a room
// tints its chrome with its category's accent.
export const CATEGORIES = [
  { id: 'foundations',       label: 'Foundations',                accent: 'purple' },
  { id: 'scripting',         label: 'Scripting',                  accent: 'yellow' },
  { id: 'reconnaissance',    label: 'Reconnaissance',             accent: 'cyan'   },
  { id: 'web',               label: 'Web',                        accent: 'amber'  },
  { id: 'post-exploitation', label: 'Post-Exploitation',          accent: 'red'    },
  { id: 'detection',         label: 'Detection & Threat Hunting', accent: 'blue'   },
  { id: 'incident-response', label: 'Incident Response',          accent: 'green'  },
  { id: 'exploit-development', label: 'Exploit Development',       accent: 'orange' },
];

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/** The accent token for a category id (falls back to green). */
export function accentForCategory(categoryId) {
  return (CATEGORY_BY_ID[categoryId] || {}).accent || 'green';
}

// status:'live' modules carry a stageKind + lazy load() returning a room data
// object ({ stageConfig, ceremony, sections }); 'soon' modules are stubs.
// difficulty: 'intro' | 'core' | 'advanced'. Order within a category is array order.
export const MODULES = [
  // ── Foundations (purple) ─ new cross-cutting beginner rooms (soon); the old
  // visualizations are injected as primers by getCategoryListing(). ───────────
  { slug: 'linux-cli', name: 'Linux CLI', category: 'foundations', difficulty: 'intro', status: 'soon',
    blurb: 'Move around a shell like you live there.' },
  { slug: 'networking', name: 'Networking', category: 'foundations', difficulty: 'intro', status: 'soon',
    blurb: 'Packets, ports, and how hosts talk.' },
  { slug: 'how-the-web-works', name: 'How the Web Works', category: 'foundations', difficulty: 'intro', status: 'soon',
    blurb: 'Requests, responses, and what sits between.' },
  { slug: 'reading-logs', name: 'Reading Logs', category: 'foundations', difficulty: 'intro', status: 'soon',
    blurb: 'Turn raw log noise into a timeline.' },

  // ── Reconnaissance (cyan) ───────────────────────────────────────────────────
  { slug: 'active-reconnaissance', name: 'Active Reconnaissance', category: 'reconnaissance', difficulty: 'core',
    stageKind: 'shell', status: 'live',
    blurb: 'Map a target you are allowed to touch.',
    load: () => import('./modules/active-reconnaissance.js') },
  { slug: 'enumeration', name: 'Enumeration', category: 'reconnaissance', difficulty: 'core',
    stageKind: 'shell', status: 'live',
    blurb: 'Catalogue services, users, and shares.',
    load: () => import('./modules/enumeration.js') },

  // ── Scripting (yellow) ─ advertised now via soon stubs; flipped live in
  // Tasks 3 & 4 of the scripting-category plan. ──────────────────────────────
  { slug: 'bash-scripting', name: 'Bash Scripting', category: 'scripting', difficulty: 'core',
    stageKind: 'shell', status: 'live',
    blurb: 'Automate the shell you already know.',
    load: () => import('./modules/bash-scripting.js') },
  { slug: 'python-scripting', name: 'Python Scripting', category: 'scripting', difficulty: 'core',
    stageKind: 'editor', status: 'live',
    blurb: 'Small scripts that do real work.',
    load: () => import('./modules/python-scripting.js') },

  // ── Web (amber) ─ advertised now via soon stubs ─────────────────────────────
  { slug: 'web-recon', name: 'Web Recon', category: 'web', difficulty: 'core', status: 'soon',
    blurb: 'Fingerprint a web app before you touch it.' },
  { slug: 'injection-basics', name: 'Injection Basics', category: 'web', difficulty: 'core', status: 'soon',
    blurb: 'Where untrusted input becomes code.' },

  // ── Post-Exploitation (red) ─ "after you are in" ────────────────────────────
  { slug: 'privilege-escalation', name: 'Privilege Escalation', category: 'post-exploitation', difficulty: 'advanced', status: 'soon',
    blurb: 'Turn a foothold into root.' },
  { slug: 'post-exploitation', name: 'Post-Exploitation', category: 'post-exploitation', difficulty: 'advanced', status: 'soon',
    blurb: 'Persist, collect, and stage exfil.' },
  { slug: 'lateral-movement', name: 'Lateral Movement', category: 'post-exploitation', difficulty: 'advanced', status: 'soon',
    blurb: 'Move host to host with found credentials.' },

  // ── Detection & Threat Hunting (blue) ───────────────────────────────────────
  { slug: 'splunk-queries', name: 'Splunk Queries', category: 'detection', difficulty: 'core',
    stageKind: 'search', status: 'live',
    blurb: 'Write SPL to triage auth logs.',
    load: () => import('./modules/splunk-queries.js') },
  { slug: 'crowdstrike-queries', name: 'CrowdStrike Query Languages', category: 'detection', difficulty: 'core', status: 'soon',
    blurb: 'Query endpoints with CQL and event search.' },
  { slug: 'log-analysis', name: 'Log Analysis & Threat Intel', category: 'detection', difficulty: 'core',
    stageKind: 'shell', status: 'live',
    blurb: 'Correlate logs with threat intel.',
    load: () => import('./modules/log-analysis.js') },
  { slug: 'threat-hunting', name: 'Threat Hunting', category: 'detection', difficulty: 'advanced', status: 'soon',
    blurb: 'Hunt for adversary behavior across telemetry.' },
  { slug: 'security-dashboards', name: 'Building Security Dashboards', category: 'detection', difficulty: 'core', status: 'soon',
    blurb: 'Assemble panels that surface real signal.' },
  { slug: 'edr-navigation', name: 'EDR Navigation', category: 'detection', difficulty: 'core', status: 'soon',
    blurb: 'Pivot through an EDR console on a detection.' },

  // ── Incident Response (green) ───────────────────────────────────────────────
  { slug: 'incident-response', name: 'Incident Response', category: 'incident-response', difficulty: 'advanced',
    stageKind: 'search', status: 'live',
    blurb: 'Run the IR lifecycle on a live alert.',
    load: () => import('./modules/incident-response.js') },

  // ── Exploit Development (orange) ────────────────────────────────────────────
  { slug: 'exploit-development', name: 'Exploit Development', category: 'exploit-development', difficulty: 'advanced', status: 'soon',
    blurb: 'Craft a working exploit from a crash.' },
];

/** A registry module by slug, or null. (Does not include foundation primers.) */
export function getModule(slug) {
  return MODULES.find((m) => m.slug === slug) || null;
}

/** Just the live (room-carrying) modules. */
export function getLiveModules() {
  return MODULES.filter((m) => m.status === 'live');
}

/**
 * Categories with their ordered modules, each tagged with its category accent.
 * Foundations additionally lists the manifest visualizations as `primer` items
 * (inert reading reached through the existing visualizations viewer).
 */
export function getCategoryListing(manifest) {
  const primers = getVisualizations(manifest).map((v) => ({
    slug: v.id, name: v.title, category: 'foundations', status: 'primer', file: v.file,
  }));
  return CATEGORIES.map((c) => {
    const mods = MODULES.filter((m) => m.category === c.id).map((m) => ({ ...m, accent: c.accent }));
    return {
      ...c,
      modules: c.id === 'foundations' ? [...mods, ...primers] : mods,
    };
  });
}

/** A foundation (old visualization) item by id, or null. Manifest-derived. */
export function getFoundation(manifest, slug) {
  return getVisualizations(manifest).find((v) => v.id === slug) || null;
}
