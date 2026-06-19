// src/config/resourceTree.js
// Static structure of the home TUI. Counts are injected at render time.
// `to` = internal route (React Router); `href` = external link (new tab).

export const RESOURCE_TREE = [
  {
    key: 'pbqs', label: 'pbqs/', accent: 'green', countKey: 'pbqs',
    title: 'Practice PBQs', sub: 'Interactive performance-based simulations',
    items: [
      { tag: '220-1202', accent: 'red',  name: 'A+ Core 2', desc: 'OS troubleshooting, disk mgmt, suspicious activity', to: '/a-plus-pbqs' },
      { tag: 'SY0-701',  accent: 'blue', name: 'Security+',  desc: 'Firewall logs, vuln scanning, secure architecture', to: '/security-plus-pbqs' },
    ],
  },
  {
    key: 'exams', label: 'exams/', accent: 'green', countKey: 'exams',
    title: 'Practice Exams', sub: 'Full-length mock tests',
    items: [
      { tag: 'A+ CORE 2', accent: 'red',  name: 'A+ Core 2 Mock', desc: '90 questions · 4 domains', to: '/a-plus-exams' },
      { tag: 'SY0-701',   accent: 'blue', name: 'Security+ Mock',  desc: '90 questions · 5 domains', to: '/security-plus-exams' },
    ],
  },
  {
    key: 'visualizations', label: 'visualizations/', accent: 'purple', countKey: 'viz',
    title: 'Visualizations', sub: 'Interactive concept modules',
    items: [
      { tag: 'CONCEPTS', accent: 'purple', name: 'Core Concepts', desc: 'Visual explanations of security concepts', to: '/visualizations' },
    ],
  },
  {
    key: 'labs', label: 'labs/', accent: 'orange', countKey: 'labs',
    title: 'Labs', sub: 'Threat simulation range + writeups',
    // items injected from labs.js at render (see ResourceTUI)
    items: [],
  },
  {
    key: 'notes', label: 'notes/', accent: 'slate', countKey: null,
    title: 'Notes', sub: 'Live-synced study notes',
    items: [
      { tag: 'LIVE', accent: 'slate', name: 'Obsidian Vault', desc: 'Continuously synced as I study', href: 'https://lui-gi.github.io/shelnet-notes/' },
    ],
  },
];
