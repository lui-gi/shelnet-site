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
  slate:  { hex: '#cbd5e1', name: 'slate'  }, // Notes
};

export const PROMPT = 'shelnet:~$';

export const SITE = {
  version: 'v3.0',
  // Production domain (matches public/robots.txt + public/sitemap.xml).
  domain: 'shelnet.org',
};

// ASCII banner for the boot hero (desktop). Monospace required.
export const ASCII_BANNER = String.raw`
 ███████ ██   ██ ███████ ██      ███    ██ ███████ ████████
 ██      ██   ██ ██      ██      ████   ██ ██         ██
 ███████ ███████ █████   ██      ██ ██  ██ █████      ██
      ██ ██   ██ ██      ██      ██  ██ ██ ██         ██
 ███████ ██   ██ ███████ ███████ ██   ████ ███████    ██`;
