// src/config/moduleRegistry.js
// Single source of truth for the interactive modules terminal: the two learning
// tracks plus the foundations track (the old visualizations). Engine code under
// components/terminal consumes this. Adding a module of an existing kind is a data
// edit here; a new mechanic is a new runner under components/terminal/kinds.
import { getVisualizations } from '../utils/manifestService';

export const TRACKS = [
  { id: 'blue',        label: 'Blue Team',      accent: 'blue'   },
  { id: 'red',         label: 'CTF / Red Team', accent: 'red'    },
  { id: 'foundations', label: 'Foundations',    accent: 'purple' }, // old visualizations
];

// status 'live' modules carry a kind + lazy load(); 'soon' modules are stubs that
// appear in `list` and load to a teaser.
export const MODULES = [
  // live
  { slug: 'splunk-queries', name: 'Splunk Queries', track: 'blue',
    kind: 'guided-walkthrough', accent: 'blue', status: 'live',
    blurb: 'Write SPL to triage auth logs.',
    load: () => import('./modules/splunk-queries.js') },

  // blue team (soon)
  { slug: 'incident-response', name: 'Incident Response', track: 'blue', status: 'soon',
    blurb: 'Run the IR lifecycle on a live alert.' },
  { slug: 'threat-hunting', name: 'Threat Hunting', track: 'blue', status: 'soon',
    blurb: 'Hunt for adversary behavior across telemetry.' },
  { slug: 'log-analysis', name: 'Log Analysis & Threat Intel', track: 'blue', status: 'soon',
    blurb: 'Correlate logs with threat intel.' },
  { slug: 'edr-navigation', name: 'EDR Navigation', track: 'blue', status: 'soon',
    blurb: 'Pivot through an EDR console on a detection.' },
  { slug: 'crowdstrike-queries', name: 'CrowdStrike Query Languages', track: 'blue', status: 'soon',
    blurb: 'Query endpoints with CQL and event search.' },
  { slug: 'security-dashboards', name: 'Building Security Dashboards', track: 'blue', status: 'soon',
    blurb: 'Assemble panels that surface real signal.' },

  // red team (soon)
  { slug: 'active-recon', name: 'Active Reconnaissance', track: 'red', status: 'soon',
    blurb: 'Map a target you are allowed to touch.' },
  { slug: 'enumeration', name: 'Enumeration', track: 'red', status: 'soon',
    blurb: 'Catalogue services, users, and shares.' },
  { slug: 'privilege-escalation', name: 'Privilege Escalation', track: 'red', status: 'soon',
    blurb: 'Turn a foothold into root.' },
  { slug: 'post-exploitation', name: 'Post-Exploitation', track: 'red', status: 'soon',
    blurb: 'Persist, collect, and stage exfil.' },
  { slug: 'exploit-development', name: 'Exploit Development', track: 'red', status: 'soon',
    blurb: 'Craft a working exploit from a crash.' },
  { slug: 'lateral-movement', name: 'Lateral Movement', track: 'red', status: 'soon',
    blurb: 'Move host to host with found credentials.' },
];

/** A registry module by slug, or null. (Does not include foundations.) */
export function getModule(slug) {
  return MODULES.find((m) => m.slug === slug) || null;
}

/** Built-in tracks with their modules; foundations populated from the manifest. */
export function getTrackListing(manifest) {
  const foundations = getVisualizations(manifest).map((v) => ({
    slug: v.id, name: v.title, track: 'foundations', status: 'foundation', file: v.file,
  }));
  return TRACKS.map((t) => ({
    ...t,
    modules: t.id === 'foundations' ? foundations : MODULES.filter((m) => m.track === t.id),
  }));
}

/** A foundation (old visualization) item by id, or null. Manifest-derived. */
export function getFoundation(manifest, slug) {
  return getVisualizations(manifest).find((v) => v.id === slug) || null;
}
