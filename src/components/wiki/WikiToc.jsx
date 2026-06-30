// src/components/wiki/WikiToc.jsx
// On-page table of contents extracted from H2/H3 headings. Active heading
// driven by scrollspy in WikiViewer.
import { Panel } from '../tui/ascii';
import { WIKI_ACCENT } from '../../config/wikiConfig';

const WikiToc = ({ headings, activeId }) => {
  if (!headings?.length) return null;
  return (
    <div className="my-3">
      <Panel hex={WIKI_ACCENT} title={<span style={{ color: WIKI_ACCENT }}>on this page</span>}>
        <ul className="py-1 text-xs leading-relaxed">
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
              <a
                href={`#${h.id}`}
                className="hover:text-white"
                style={activeId === h.id ? { color: WIKI_ACCENT } : { color: 'rgba(255,255,255,0.55)' }}
              >
                • {h.text}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};

export default WikiToc;
