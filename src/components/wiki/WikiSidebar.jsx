// src/components/wiki/WikiSidebar.jsx
// Collapsible section tree for /wiki. Each section is a top-level dir, entries
// are leaves. Current path is highlighted. The search input is pinned at top
// and surfaces a `?` placeholder until WikiSearch is wired (Task 13).
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildSidebarTree } from './sidebarTree';
import { WIKI_ACCENT } from '../../config/wikiConfig';

const EntryLeaf = ({ node, currentPath, depth }) => {
  const active = currentPath === node.path;
  return (
    <Link
      to={`/wiki/${node.path}`}
      className={active ? 'block truncate' : 'block truncate text-white/55 hover:text-white'}
      style={{
        paddingLeft: `${depth + 2}ch`,
        ...(active ? { color: WIKI_ACCENT } : null),
      }}
    >
      {active ? '• ' : '  '}{node.name}
    </Link>
  );
};

const DirBranch = ({ node, currentPath, depth }) => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block w-full text-left text-white/70 hover:text-white truncate"
        style={{ paddingLeft: `${depth}ch` }}
      >
        <span className="text-white/40">{open ? '▾' : '▸'}</span> {node.name}/
      </button>
      {open && node.children?.map((c) => (
        <Branch key={c.path} node={c} currentPath={currentPath} depth={depth + 1} />
      ))}
    </div>
  );
};

const Branch = ({ node, currentPath, depth = 0 }) =>
  node.type === 'entry'
    ? <EntryLeaf node={node} currentPath={currentPath} depth={depth} />
    : <DirBranch node={node} currentPath={currentPath} depth={depth} />;

const WikiSidebar = ({ manifest, currentPath, onOpenSearch }) => {
  const tree = useMemo(() => buildSidebarTree(manifest?.entries || []), [manifest?.entries]);
  return (
    <div className="text-xs font-mono leading-relaxed">
      <div className="mb-2 text-white/40">~/wiki</div>
      <button
        type="button"
        onClick={onOpenSearch}
        className="mb-3 w-full text-left text-white/40 hover:text-white"
      >
        ⌕ search... <span className="text-white/20">(/)</span>
      </button>
      {tree.map((root) => (
        <Branch key={root.name} node={root} currentPath={currentPath} />
      ))}
      <Link to="/wiki/graph" className="mt-4 block text-white/40 hover:text-white">
        ⌘ graph view
      </Link>
    </div>
  );
};

export default WikiSidebar;
