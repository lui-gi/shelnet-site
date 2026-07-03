// src/config/changelog.js
// User-visible changelog for the site. Hand-authored, newest first.
// Each entry: { date (ISO YYYY-MM-DD), tag (one-word category), title, blurb }.
// Rendered by ChangelogOverlay, reachable via the `n` global shortcut.

export const CHANGELOG = [
  {
    date: '2026-07-02',
    tag: 'shortcuts',
    title: 'global chord shortcuts',
    blurb: 'new bottom bar affordances: `/` command palette, `g <x>` jump leader, `r` random, `?` help, `n` news.',
  },
  {
    date: '2026-07-02',
    tag: 'modules',
    title: 'scripting rooms live',
    blurb: 'bash-scripting (6 shell sections) and python-scripting (editor stage) open on the new yellow scripting track.',
  },
  {
    date: '2026-07-02',
    tag: 'modules',
    title: 'splunk drills expanded',
    blurb: 'splunk-queries picks up column, dedup, stats, eval, and timechart drills.',
  },
  {
    date: '2026-07-02',
    tag: 'modules',
    title: 'active-recon + incident-response live',
    blurb: 'two more rooms promoted from soon to live.',
  },
  {
    date: '2026-06-30',
    tag: 'wiki',
    title: 'wiki home + hero search',
    blurb: 'inline hero search, section cards, recent feed, tag chips, and a shared search engine across modal + hero.',
  },
];
