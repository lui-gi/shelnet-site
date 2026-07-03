// src/components/room/blocks.jsx
// The lesson-pane block vocabulary: a list of typed blocks (each an object with
// one discriminating key) rendered to JSX by a generic renderer. New teaching
// needs add a block type here; they do not change existing rooms. `accentHex`
// tints accents (callouts, the task statement) with the room's category accent.
// Colors read from CSS custom properties set by the Room root so blocks flip
// with the room's light/dark theme without prop drilling.

// Light inline markup for paragraphs/list items: `code` -> mono chip, **bold**.
// Kept tiny on purpose; rich content belongs in dedicated blocks.
function inline(text) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code
          key={i}
          className="rounded px-1 font-mono text-[0.9em]"
          style={{ background: 'var(--code-bg)', color: 'var(--text-strong)' }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={i} className="font-semibold" style={{ color: 'var(--text-strong)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function Block({ block, accentHex }) {
  if (block.h2 != null) {
    return (
      <h2
        className="font-sans text-[1rem] font-semibold tracking-tight"
        style={{ color: 'var(--text-strong)' }}
      >
        {block.h2}
      </h2>
    );
  }
  if (block.h3 != null) {
    return (
      <h3
        className="font-sans text-sm font-semibold"
        style={{ color: 'var(--text-strong)' }}
      >
        {block.h3}
      </h3>
    );
  }
  if (block.p != null) {
    return (
      <p
        className="font-sans text-[0.9375rem] leading-relaxed"
        style={{ color: 'var(--text)' }}
      >
        {inline(block.p)}
      </p>
    );
  }
  if (block.callout != null) {
    return (
      <div
        className="border-l-2 py-1 pl-3 font-sans text-[0.9375rem] leading-relaxed"
        style={{
          borderColor: accentHex,
          background: 'var(--code-bg)',
          color: 'var(--text)',
        }}
      >
        {inline(block.callout)}
      </div>
    );
  }
  if (block.code != null) {
    return (
      <pre
        className="overflow-x-auto whitespace-pre rounded border p-2 font-mono text-xs"
        style={{
          background: 'var(--block-bg)',
          borderColor: 'var(--block-border)',
          color: 'var(--text-strong)',
        }}
      >
        {block.code}
      </pre>
    );
  }
  if (block.list != null) {
    const items = block.list.map((it, i) => <li key={i}>{inline(it)}</li>);
    return block.ordered ? (
      <ol
        className="list-decimal space-y-1 pl-5 font-sans text-[0.9375rem] leading-relaxed marker:opacity-60"
        style={{ color: 'var(--text)' }}
      >
        {items}
      </ol>
    ) : (
      <ul
        className="list-disc space-y-1 pl-5 font-sans text-[0.9375rem] leading-relaxed marker:opacity-60"
        style={{ color: 'var(--text)' }}
      >
        {items}
      </ul>
    );
  }
  if (block.figure != null) {
    return (
      <figure
        className="rounded border p-1"
        style={{ background: 'var(--block-bg)', borderColor: 'var(--block-border)' }}
      >
        <img src={block.figure.src} alt={block.figure.alt || ''} className="w-full" />
      </figure>
    );
  }
  if (block.task != null) {
    return (
      <div
        className="flex gap-2 rounded border px-3 py-2 font-mono text-sm"
        style={{
          borderColor: accentHex,
          color: accentHex,
          background: 'color-mix(in srgb, ' + accentHex + ' 6%, transparent)',
        }}
      >
        <span aria-hidden="true" className="shrink-0">$</span>
        <span style={{ color: 'var(--text-strong)' }}>{inline(block.task)}</span>
      </div>
    );
  }
  return null;
}

/** Render a block list to JSX. */
export default function Blocks({ blocks = [], accentHex }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => <Block key={i} block={block} accentHex={accentHex} />)}
    </div>
  );
}
