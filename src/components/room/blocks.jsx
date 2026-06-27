// src/components/room/blocks.jsx
// The lesson-pane block vocabulary: a list of typed blocks (each an object with
// one discriminating key) rendered to JSX by a generic renderer. New teaching
// needs add a block type here; they do not change existing rooms. `accentHex`
// tints accents (callouts, the task statement) with the room's category accent.

// Light inline markup for paragraphs/list items: `code` -> mono chip, **bold**.
// Kept tiny on purpose; rich content belongs in dedicated blocks.
function inline(text) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={i} className="rounded bg-white/[0.07] px-1 text-white/85">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} className="font-semibold text-white/90">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function Block({ block, accentHex }) {
  if (block.h2 != null) {
    return <h2 className="text-white/90 font-semibold text-[0.95rem] tracking-tight">{block.h2}</h2>;
  }
  if (block.h3 != null) {
    return <h3 className="text-white/80 font-semibold text-sm">{block.h3}</h3>;
  }
  if (block.p != null) {
    return <p className="text-white/65 leading-relaxed">{inline(block.p)}</p>;
  }
  if (block.callout != null) {
    return (
      <div
        className="border-l-2 pl-3 py-1 text-white/70 bg-white/[0.02]"
        style={{ borderColor: accentHex }}
      >
        {inline(block.callout)}
      </div>
    );
  }
  if (block.code != null) {
    return (
      <pre className="overflow-x-auto rounded border border-white/10 bg-black/40 p-2 text-xs text-white/80 whitespace-pre">
        {block.code}
      </pre>
    );
  }
  if (block.list != null) {
    const items = block.list.map((it, i) => <li key={i}>{inline(it)}</li>);
    return block.ordered ? (
      <ol className="list-decimal pl-5 space-y-1 text-white/65 marker:text-white/35">{items}</ol>
    ) : (
      <ul className="list-disc pl-5 space-y-1 text-white/65 marker:text-white/35">{items}</ul>
    );
  }
  if (block.figure != null) {
    return (
      <figure className="rounded border border-white/10 bg-black/30 p-1">
        <img src={block.figure.src} alt={block.figure.alt || ''} className="w-full" />
      </figure>
    );
  }
  if (block.task != null) {
    return (
      <div
        className="flex gap-2 rounded border px-3 py-2"
        style={{ borderColor: accentHex, color: accentHex }}
      >
        <span aria-hidden="true" className="shrink-0">$</span>
        <span className="text-white/85">{inline(block.task)}</span>
      </div>
    );
  }
  return null;
}

/** Render a block list to JSX. */
export default function Blocks({ blocks = [], accentHex }) {
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => <Block key={i} block={block} accentHex={accentHex} />)}
    </div>
  );
}
