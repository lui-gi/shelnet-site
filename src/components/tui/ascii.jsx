// src/components/tui/ascii.jsx
// Framed-ASCII primitives for the resource pages: real box-drawing glyphs
// (corners, rails, rules, dot-leaders, bars) drawn as text, while CSS owns the
// layout so content wraps and reflows without breaking the art. Shared so every
// /resources page speaks one vocabulary (matches the hero's bare-TTY look).

// A run of fill characters long enough to span any panel; clipped by overflow.
const FILL = (ch) => ch.repeat(300);

// Horizontal rule that fills its container and clips. `lead` prefixes it (e.g.
// a corner + title), `char` is the line glyph.
export const Rule = ({ lead = null, char = '─', hex, className = '' }) => (
  <div
    className={`overflow-hidden whitespace-nowrap ${className}`}
    style={{ color: hex }}
    aria-hidden="true"
  >
    {lead}
    {FILL(char)}
  </div>
);

// Vertical rail of repeating glyphs, absolutely filling its (relative) parent's
// height and clipped. `match` keeps one glyph per text line (line-height 1.5);
// otherwise the glyphs pack tight for a continuous edge.
const VRail = ({ char = '│', hex, match = false, side = 'left' }) => (
  <div
    className="absolute top-0 bottom-0 overflow-hidden whitespace-pre"
    style={{ color: hex, lineHeight: match ? undefined : 1, [side]: 0 }}
    aria-hidden="true"
  >
    {`${char}\n`.repeat(200)}
  </div>
);

// `[X]` tag with dim brackets and an accent (or dim) label.
export const Bracket = ({ children, hex, dim = false }) => (
  <span>
    <span className="text-white/30">[</span>
    <span style={dim ? undefined : { color: hex }} className={dim ? 'text-white/40' : ''}>{children}</span>
    <span className="text-white/30">]</span>
  </span>
);

// Dot-leader filler.
export const Dots = ({ n = 5 }) => (
  <span className="text-white/20" aria-hidden="true">{'·'.repeat(n)}</span>
);

// Block progress bar: ▓ filled / ░ track.
export const ProgressBar = ({ pct = 0, hex, width = 24 }) => {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return (
    <span aria-hidden="true">
      <span style={{ color: hex }}>{'▓'.repeat(filled)}</span>
      <span className="text-white/20">{'░'.repeat(width - filled)}</span>
    </span>
  );
};

// A single open-right ascii box with a left rail. `title` is the header content
// (drawn after `┌─ `), `right` overlays at the top-right (e.g. an exam code),
// `marker` sits in a 2ch gutter so selected/unselected boxes stay aligned.
// `flush` drops that gutter so the box border sits flush-left with the container
// (used by the bytes quiz card, which has no marker and lines up with the prompt).
// `fill` makes the body flex to its parent's height and clip overflow, with the
// newest content bottom-aligned (used by the scrolling ping log).
export const Panel = ({ hex, title, right = null, marker = null, children, fill = false, flush = false, className = '' }) => (
  <div className={`flex ${fill ? 'min-h-0 h-full' : ''} ${className}`}>
    {!flush && <span className="shrink-0 w-[2ch]" style={{ color: hex }} aria-hidden="true">{marker}</span>}
    <div className={`relative flex-1 min-w-0 ${fill ? 'flex flex-col min-h-0' : ''}`}>
      {/* top rule: corner + title + fill */}
      <div className="relative overflow-hidden whitespace-nowrap shrink-0" style={{ color: hex }}>
        <span aria-hidden="true">┌─ </span>{title} {FILL('─')}
      </div>
      {right && (
        <div className="absolute right-0 top-0 pl-2 bg-black" style={{ color: hex }}>{right}</div>
      )}
      {/* body: rail + content */}
      <div className={`relative pl-[1.8ch] ${fill ? 'flex-1 min-h-0 overflow-hidden flex flex-col justify-end' : ''}`}>
        <VRail hex={hex} match={!fill} />
        {children}
      </div>
      {/* bottom rule */}
      <Rule lead={<span aria-hidden="true">└</span>} hex={hex} className="shrink-0" />
    </div>
  </div>
);

// Four-sided frame around flexible content (an iframe). `dashed` swaps to the
// rounded/dotted set used by the live-run panes. Header/footer are single lines
// rendered above/below the framed body.
export const Frame = ({ hex, dashed = false, header = null, footer = null, children, className = '' }) => {
  const g = dashed
    ? { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '┄', v: '┊' }
    : { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' };
  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      {header && <div className="shrink-0">{header}</div>}
      {/* top edge */}
      <div className="flex shrink-0 whitespace-nowrap" style={{ color: hex }} aria-hidden="true">
        <span>{g.tl}</span>
        <span className="flex-1 overflow-hidden">{FILL(g.h)}</span>
        <span>{g.tr}</span>
      </div>
      {/* body: rail + content + rail */}
      <div className="flex flex-1 min-h-0">
        <div className="relative w-[1ch] shrink-0"><VRail char={g.v} hex={hex} /></div>
        <div className="flex-1 min-h-0">{children}</div>
        <div className="relative w-[1ch] shrink-0"><VRail char={g.v} hex={hex} side="right" /></div>
      </div>
      {/* bottom edge */}
      <div className="flex shrink-0 whitespace-nowrap" style={{ color: hex }} aria-hidden="true">
        <span>{g.bl}</span>
        <span className="flex-1 overflow-hidden">{FILL(g.h)}</span>
        <span>{g.br}</span>
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
};

// Open-right two-pane box: outer-left rail + a divider rail, right side open.
// Used by the explorer and the Workspace file rail. `leftTitle`/`rightTitle`
// label the header; `bottomHints` sits on the footer rule (right side); `left`
// and `right` are the pane bodies.
export const TwoPane = ({
  hex, leftTitle, rightTitle = null, bottomHints = null, left, right, fill = false, className = '',
}) => (
  <div
    className={`grid ${fill ? 'h-full min-h-0' : ''} ${className}`}
    style={{
      gridTemplateColumns: 'min-content max-content min-content minmax(0,1fr)',
      gridTemplateRows: fill ? 'auto minmax(0,1fr) auto' : undefined,
      color: hex,
    }}
  >
    {/* ── top row ── */}
    <div aria-hidden="true">┌</div>
    <div className="relative overflow-hidden">
      <span aria-hidden="true">&nbsp;</span>
      <span className="absolute left-0 top-0 whitespace-nowrap" aria-hidden="true">─ {leftTitle} {FILL('─')}</span>
    </div>
    <div aria-hidden="true">┬</div>
    <div className="overflow-hidden whitespace-nowrap pl-[1ch] text-white/40">{rightTitle}</div>

    {/* ── body row ── */}
    <div className="relative"><VRail hex={hex} match={!fill} /></div>
    <div className={fill ? 'min-h-0 overflow-y-auto py-0.5' : 'py-0.5'}>{left}</div>
    <div className="relative"><VRail hex={hex} match={!fill} /></div>
    <div className="min-w-0 min-h-0 pl-[1.5ch]">{right}</div>

    {/* ── bottom row ── */}
    <div aria-hidden="true">└</div>
    <div className="relative overflow-hidden">
      <span aria-hidden="true">&nbsp;</span>
      <span className="absolute left-0 top-0 whitespace-nowrap" aria-hidden="true">{FILL('─')}</span>
    </div>
    <div aria-hidden="true">┴</div>
    <div className="overflow-hidden whitespace-nowrap pl-[1ch] text-white/30">{bottomHints}</div>
  </div>
);
