// src/components/wiki/WikiSearchHits.jsx
// Pure presentational hit list used by both the WikiSearch modal and the
// inline hero search on the wiki home. Cursor + onPick come from the parent;
// this component never owns state.
const WikiSearchHits = ({ hits, cursor, onCursorChange, onPick, emptyText, query }) => {
  if (!hits.length && query) {
    return (
      <ul className="max-h-80 overflow-y-auto">
        <li className="px-3 py-2 text-neutral-500">{emptyText}</li>
      </ul>
    );
  }
  return (
    <ul className="max-h-80 overflow-y-auto">
      {hits.map((h, i) => {
        const active = i === cursor;
        return (
          <li
            key={h.id}
            className={[
              'px-3 py-1.5 cursor-pointer',
              active ? 'bg-purple-50 text-purple-900' : 'text-neutral-700 hover:bg-neutral-50',
            ].join(' ')}
            onMouseEnter={() => onCursorChange(i)}
            onClick={() => onPick(h)}
          >
            <span className="text-neutral-400">{h.section}/</span>
            {h.title}
            {h.summary && <span className="text-neutral-500"> — {h.summary}</span>}
          </li>
        );
      })}
    </ul>
  );
};

export default WikiSearchHits;
