// src/components/wiki/WikiToc.jsx
// Light-themed on-page table of contents. Sticky positioning is handled by
// WikiShell's right column wrapper; this component renders inline content.
const WikiToc = ({ headings, activeId }) => {
  if (!headings?.length) return null;
  return (
    <nav aria-label="on this page">
      <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
        On this page
      </div>
      <ul className="text-sm leading-relaxed">
        {headings.map((h) => {
          const active = activeId === h.id;
          return (
            <li key={h.id} className={h.level === 3 ? 'ml-3' : ''}>
              <a
                href={`#${h.id}`}
                className={[
                  'block py-0.5 pl-2 border-l-2 -ml-[2px]',
                  active
                    ? 'text-purple-700 font-medium border-purple-600'
                    : 'text-neutral-600 hover:text-neutral-900 border-transparent',
                ].join(' ')}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default WikiToc;
