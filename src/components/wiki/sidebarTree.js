// src/components/wiki/sidebarTree.js
// Pure helper that converts a flat manifest.entries[] into a nested tree for
// rendering the sidebar. Each section is a top-level dir; entries are leaves.
// Intermediate path segments (e.g. "security-plus" in
// notes/security-plus/cryptography) become nested dirs.

const SECTIONS = ['notes', 'writeups', 'guides'];

export function buildSidebarTree(entries) {
  const roots = SECTIONS.map((name) => ({ name, type: 'dir', path: name, children: [] }));
  const rootMap = new Map(roots.map((r) => [r.name, r]));

  for (const entry of entries) {
    const segs = entry.path.split('/'); // [section, ...mid, slug]
    const sectionRoot = rootMap.get(segs[0]);
    if (!sectionRoot) continue;
    let cursor = sectionRoot;
    for (let i = 1; i < segs.length - 1; i++) {
      const dirPath = segs.slice(0, i + 1).join('/');
      let child = cursor.children.find((c) => c.type === 'dir' && c.name === segs[i]);
      if (!child) {
        child = { name: segs[i], type: 'dir', path: dirPath, children: [] };
        cursor.children.push(child);
      }
      cursor = child;
    }
    cursor.children.push({
      name: segs[segs.length - 1],
      type: 'entry',
      path: entry.path,
      entry,
    });
  }

  // Sort: dirs before entries, alphabetic within.
  const sortNode = (node) => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  };
  roots.forEach(sortNode);

  return roots;
}
