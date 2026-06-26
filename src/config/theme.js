// src/config/theme.js
// Single source of truth for the redesign's accent vocabulary, ASCII art,
// and the shell prompt. Hex values are used where Tailwind classes can't
// be (canvas/inline). Tailwind class tokens live in themeColors.js.

export const ACCENTS = {
  green:  { hex: '#34d399', name: 'green'  }, // global / home / boot
  red:    { hex: '#fb7185', name: 'red'    }, // A+
  blue:   { hex: '#38bdf8', name: 'blue'   }, // Security+
  purple: { hex: '#c084fc', name: 'purple' }, // Visualizations
  orange: { hex: '#fb923c', name: 'orange' }, // Labs
  cyan:   { hex: '#22d3ee', name: 'cyan'   }, // CySA+
  slate:  { hex: '#cbd5e1', name: 'slate'  }, // Notes
};

// Canonical bare-TTY shell palette (matches HeroSection's GREEN / ACCENT).
// TerminalShell + the resource chrome share these so the whole site uses one
// green, instead of the resource pages' older emerald (#34d399).
export const SHELL = {
  green: '#43c08c', // prompt glyph, cursor, shell accents
  dim:   '#7e9b86', // `guest`, secondary markers
};

export const SITE = {
  version: 'v3.0',
  // Production domain (matches public/robots.txt + public/sitemap.xml).
  domain: 'shelnet.org',
};

// ASCII banner for the boot hero. Lowercase figlet (figlet "standard" font).
// Monospace required. Rendered green + subtle glow in HeroSection.
export const ASCII_BANNER = String.raw`     _          _            _
 ___| |__   ___| |_ __   ___| |_
/ __| '_ \ / _ \ | '_ \ / _ \ __|
\__ \ | | |  __/ | | | |  __/ |_
|___/_| |_|\___|_|_| |_|\___|\__|`;
