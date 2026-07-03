// src/components/wiki/WikiSidebar.jsx
// Light-themed wiki sidebar. Top-level dirs become section headers
// (NOTES/WRITEUPS/GUIDES); children render as a collapsible tree.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildSidebarTree } from './sidebarTree';

const EntryLeaf = ({ node, currentPath, depth }) => {
  const active = currentPath === node.path;
  const indent = `${depth * 1.5}rem`;
  return (
    <Link
      to={`/wiki/${node.path}`}
      className={[
        'block truncate text-sm py-0.5 pr-2',
        active
          ? 'text-purple-700 font-medium border-l-2 border-purple-600 -ml-[2px]'
          : 'text-neutral-700 hover:text-neutral-900 border-l-2 border-transparent -ml-[2px]',
      ].join(' ')}
      style={{ paddingLeft: `calc(${indent} + 0.5rem)` }}
    >
      {node.name}
    </Link>
  );
};

const DirBranch = ({ node, currentPath, depth }) => {
  const [open, setOpen] = useState(true);
  const indent = `${depth * 1.5}rem`;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'block w-full text-left text-[13px] py-0.5 pr-2 truncate border-l-2 border-transparent -ml-[2px]',
          'font-semibold tracking-wide text-neutral-800 hover:text-neutral-950',
        ].join(' ')}
        style={{ paddingLeft: `calc(${indent} + 0.5rem)` }}
      >
        <span className="text-neutral-500 mr-1 inline-block w-3">{open ? '▾' : '▸'}</span>
        {node.name}
        <span className="text-neutral-400 font-normal">/</span>
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

const SectionBlock = ({ root, currentPath }) => (
  <div className="mt-5 first:mt-0">
    <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1 px-2">
      {root.name}
    </div>
    {root.children?.map((c) => (
      <Branch key={c.path} node={c} currentPath={currentPath} depth={0} />
    ))}
  </div>
);

const WikiSidebar = ({ manifest, currentPath, onOpenSearch }) => {
  const tree = useMemo(() => buildSidebarTree(manifest?.entries || []), [manifest?.entries]);
  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={onOpenSearch}
        className="mb-4 w-full text-left text-neutral-500 hover:text-neutral-900 flex items-center justify-between"
      >
        <span>⌕ search...</span>
        <kbd className="text-xs text-neutral-400 border border-neutral-200 rounded px-1">/</kbd>
      </button>
      {tree.map((root) => (
        <SectionBlock key={root.name} root={root} currentPath={currentPath} />
      ))}
    </div>
  );
};

export default WikiSidebar;
