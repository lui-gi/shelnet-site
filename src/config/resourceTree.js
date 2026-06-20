// src/config/resourceTree.js
// Top-level structure of the ~/resources explorer. certs/ and labs/ contents are
// injected at render (ResourceTUI) from the manifest / labs.js. visualizations/ is
// a destination dir: activating it opens the workspace at /resources/visualizations.
// notes/ holds one external link.

export const RESOURCE_TREE = [
  {
    key: 'certs', label: 'certs/', countKey: 'certs',
    sub: 'Certification tracks — PBQs + practice exams',
    items: [], // injected from the manifest
  },
  {
    key: 'labs', label: 'labs/', countKey: 'labs',
    sub: 'Build-your-own lab writeups',
    items: [], // injected from labs.js
  },
  {
    key: 'visualizations', label: 'visualizations/', countKey: 'viz',
    sub: 'Interactive concept modules',
    to: '/resources/visualizations', // destination dir
    items: [],
  },
  {
    key: 'notes', label: 'notes/', countKey: null,
    sub: 'Live-synced study notes',
    items: [
      { tag: 'LIVE', accent: 'slate', name: 'Obsidian Vault', desc: 'Continuously synced as I study', href: 'https://lui-gi.github.io/shelnet-notes/' },
    ],
  },
];
