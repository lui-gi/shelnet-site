# Shelnet Terminal-Native Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Shelnet homepage and inner pages around a cohesive terminal/shell identity — a boot-sequence hero, a TUI resource browser, and TUI inner-page workspaces — with a unified visual system.

**Architecture:** React 19 + React Router 7 SPA, Vite 7, Tailwind v4. Reuses existing data flows (`manifestService`/`useManifest`, `labs.js`, `useNews`). Introduces a small set of shared TUI primitives (`TuiFrame`, `Prompt`, `Workspace`) that the homepage and inner pages compose. Removes the global `BinaryRain` canvas. No backend, no new runtime dependencies.

**Tech Stack:** React, React Router DOM, Tailwind CSS v4, lucide-react, Vite.

**Spec:** `docs/superpowers/specs/2026-06-19-shelnet-terminal-revamp-design.md`

**Branch:** `redesign/terminal-native` (already created; spec committed).

---

## Conventions for this plan

- **No test runner exists** in this repo (`package.json` has only `lint`). This is a visual redesign, so per-task verification is:
  1. `npm run lint` → no new errors.
  2. `npm run build` → succeeds.
  3. A **specific manual check** in `npm run dev` (stated per task).
  The one piece of pure logic (`useResourceCounts` derivation) is extracted as a pure function so it *could* be unit-tested later; we verify it by a temporary console assertion described in its task.
- **Accent vocabulary** (used everywhere): global/home = green; A+ = red; Security+ = blue; Visualizations = purple; Labs = orange; Notes = slate.
- **Prompt string**: always `shelnet:~$`. Never `C:\…`, `root@…`, or a bare `$` as a section header again.
- **Commit after every task** on branch `redesign/terminal-native`. Commit messages use the `feat:`/`refactor:`/`style:` prefixes shown.
- Tailwind class strings below are real and compile; visual fine-tuning during execution is expected and fine.

---

## Phase 0 — Design-system foundation

### Task 1: Central theme/config module

**Files:**
- Create: `src/config/theme.js`

- [ ] **Step 1: Create the config module**

```js
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
  // TODO(confirm-with-owner): real production domain. Default below.
  domain: 'shelnet.dev',
};

// ASCII banner for the boot hero (desktop). Monospace required.
export const ASCII_BANNER = String.raw`
 ███████ ██   ██ ███████ ██      ███    ██ ███████ ████████
 ██      ██   ██ ██      ██      ████   ██ ██         ██
 ███████ ███████ █████   ██      ██ ██  ██ █████      ██
      ██ ██   ██ ██      ██      ██  ██ ██ ██         ██
 ███████ ██   ██ ███████ ███████ ██   ████ ███████    ██`;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds (module is imported nowhere yet, so this just checks syntax once imported later; run `npm run lint` to confirm no parse errors).

- [ ] **Step 3: Commit**

```bash
git add src/config/theme.js
git commit -m "feat: add central theme/config module (accents, prompt, ascii banner)"
```

---

### Task 2: Extend `themeColors.js` with the global green accent

**Files:**
- Modify: `src/config/themeColors.js`

- [ ] **Step 1: Add a `green` entry mirroring the existing shape**

Add this object inside the `themeColors` export (same keys as `red`/`blue`/etc., so every component that reads `themeColors[color]` works with `green`):

```js
  green: {
    bgActive: 'bg-green-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-green-500',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-green-500',
    text: 'text-green-400',
    textMuted: 'text-green-400/80',
    textHover: 'hover:text-green-400',
    pulse: 'bg-green-400',
    iconBg: 'bg-green-500/20',
    iconBorder: 'border-green-500/50',
  },
```

- [ ] **Step 2: Add a `slate` entry for Notes** (same shape, `slate`/`gray` classes):

```js
  slate: {
    bgActive: 'bg-slate-500/10',
    bgHover: 'bg-white/[0.05]',
    border: 'border-white/10',
    borderActive: 'border-slate-400',
    borderHover: 'border-white/30',
    hoverBorder: 'hover:border-slate-400',
    text: 'text-slate-300',
    textMuted: 'text-slate-300/80',
    textHover: 'hover:text-slate-200',
    pulse: 'bg-slate-300',
    iconBg: 'bg-slate-500/20',
    iconBorder: 'border-slate-400/50',
  },
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/config/themeColors.js
git commit -m "feat: add green (global) and slate (notes) theme color entries"
```

---

### Task 3: Base CSS — fonts, scanlines utility, remove dead styles

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Self-host one monospace webfont**

Use Fontsource (no build config needed for Vite). Install:

Run: `npm install @fontsource-variable/jetbrains-mono`

- [ ] **Step 2: Import the font and add base/utility CSS**

At the **top** of `src/index.css`, add the font import before the existing `@import "tailwindcss";` line:

```css
@import '@fontsource-variable/jetbrains-mono';
```

Then update the `body`/base block so the mono font is the default UI face and define a display stack:

```css
body {
  background-color: #000000;
  color: #fff;
  font-family: 'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Display headings (big hero/section titles) use a grotesk system stack. */
.font-display {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: -0.02em;
}
```

- [ ] **Step 3: Add a reusable scanline + glow utility** inside the existing `@layer utilities` block:

```css
  .bg-scanlines {
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.025) 0 1px,
      transparent 1px 3px
    );
  }
  .glow-green {
    background-image: radial-gradient(120% 80% at 50% -10%, rgba(52, 197, 153, 0.10), transparent 60%);
  }
  @media (prefers-reduced-motion: reduce) {
    .reduce-static { animation: none !important; }
  }
```

- [ ] **Step 4: Update `index.html` head with SEO/meta**

Replace the `<head>` contents of `index.html` with:

```html
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/shelnet-v3.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <title>Shelnet — Free, open-source CompTIA A+ &amp; Security+ prep</title>
    <meta name="description" content="Free, no-signup CompTIA A+ and Security+ performance-based questions, full-length mock exams, lab writeups, and live study notes. Open-source, privacy-first, built by a student." />
    <link rel="canonical" href="https://shelnet.dev/" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Shelnet — Free, open-source cybersecurity prep" />
    <meta property="og:description" content="Free CompTIA A+ &amp; Security+ PBQs, mock exams, and lab writeups. No signup, no tracking." />
    <meta property="og:url" content="https://shelnet.dev/" />
    <meta property="og:image" content="https://shelnet.dev/og-image.png" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Shelnet — Free, open-source cybersecurity prep" />
    <meta name="twitter:description" content="Free CompTIA A+ &amp; Security+ PBQs, mock exams, and lab writeups. No signup, no tracking." />
    <meta name="twitter:image" content="https://shelnet.dev/og-image.png" />
  </head>
```

(Note: `og-image.png` is a follow-up asset — see Task 19. Update the `shelnet.dev` URLs once the real domain is confirmed.)

- [ ] **Step 5: Verify**

Run: `npm run dev`, open the site. Expected: text renders in JetBrains Mono; no console errors; page title in the browser tab reads the new title.
Run: `npm run build`. Expected: succeeds (font bundled).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/index.css index.html
git commit -m "feat: self-host JetBrains Mono, add scanline/glow utilities, real SEO/OG meta"
```

---

### Task 4: Remove BinaryRain globally

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/Layout.jsx` (only if it references BinaryRain — it does not currently; verify)
- Delete: `src/components/animations/BinaryRain.jsx` (after references removed)

- [ ] **Step 1: Remove BinaryRain from `App.jsx`**

In `src/App.jsx`, delete the `import BinaryRain ...` line and the entire fixed wrapper:

```jsx
{/* DELETE this block */}
<div className="fixed inset-0 z-0 pointer-events-none">
  <BinaryRain />
</div>
```

Leave the rest of `App.jsx` intact for now (section reorg happens in Task 11).

- [ ] **Step 2: Grep for any other references**

Run: `grep -rn "BinaryRain" src/`
Expected: no matches after the App.jsx edit. If any remain, remove them.

- [ ] **Step 3: Delete the component file**

Run: `git rm src/components/animations/BinaryRain.jsx`

- [ ] **Step 4: Verify**

Run: `npm run dev`. Expected: homepage loads with a plain black background (no falling binary), no console errors.
Run: `npm run build`. Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove global BinaryRain canvas"
```

---

## Phase 1 — Shared TUI primitives

### Task 5: `TuiFrame` and `Prompt` components

**Files:**
- Create: `src/components/tui/TuiFrame.jsx`
- Create: `src/components/tui/Prompt.jsx`

- [ ] **Step 1: Create `Prompt.jsx`** (the unified section header)

```jsx
// src/components/tui/Prompt.jsx
import { PROMPT } from '../../config/theme';
import { themeColors } from '../../config/themeColors';

/**
 * Unified shell-prompt section header: `shelnet:~$ cd /pbqs`
 * @param {string} command - text after the prompt (e.g. "cd /pbqs && ls")
 * @param {string} accent  - theme color key for the prompt glyph (default green)
 */
const Prompt = ({ command, accent = 'green', className = '' }) => {
  const colors = themeColors[accent];
  return (
    <div className={`font-mono text-sm ${className}`}>
      <span className={colors.text}>{PROMPT}</span>{' '}
      <span className="text-white/70">{command}</span>
    </div>
  );
};

export default Prompt;
```

- [ ] **Step 2: Create `TuiFrame.jsx`** (bordered panel with title + status bars)

```jsx
// src/components/tui/TuiFrame.jsx
import { themeColors } from '../../config/themeColors';

/**
 * Generic bordered TUI panel.
 * @param {string} accent       - theme color key (border/title tint)
 * @param {ReactNode} titleLeft  - left side of the top bar (e.g. "┤ shelnet · ~/resources ├")
 * @param {ReactNode} titleRight - right side of the top bar
 * @param {ReactNode} footerLeft - left side of the status bar (keyboard hints)
 * @param {ReactNode} footerRight- right side of the status bar
 * @param {ReactNode} children   - panel body
 */
const ACCENT_BORDER = {
  green: 'border-green-500/40', red: 'border-red-500/40', blue: 'border-blue-500/40',
  purple: 'border-purple-500/40', orange: 'border-orange-500/40', slate: 'border-slate-400/40',
};
const ACCENT_DIV = {
  green: 'border-green-500/25', red: 'border-red-500/25', blue: 'border-blue-500/25',
  purple: 'border-purple-500/25', orange: 'border-orange-500/25', slate: 'border-slate-400/25',
};

const TuiFrame = ({ accent = 'green', titleLeft, titleRight, footerLeft, footerRight, children, className = '' }) => {
  const colors = themeColors[accent];
  return (
    <div className={`border ${ACCENT_BORDER[accent]} rounded-md font-mono bg-black/40 ${className}`}>
      {(titleLeft || titleRight) && (
        <div className={`flex items-center justify-between px-3 py-2 border-b ${ACCENT_DIV[accent]} text-xs`}>
          <span className={colors.text}>{titleLeft}</span>
          <span className="text-white/40">{titleRight}</span>
        </div>
      )}
      {children}
      {(footerLeft || footerRight) && (
        <div className={`flex items-center justify-between px-3 py-2 border-t ${ACCENT_DIV[accent]} text-[10.5px]`}>
          <span className="text-white/50">{footerLeft}</span>
          <span className={colors.text}>{footerRight}</span>
        </div>
      )}
    </div>
  );
};

export default TuiFrame;
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`. Expected: both succeed (components compile; used in later tasks).

- [ ] **Step 4: Commit**

```bash
git add src/components/tui/
git commit -m "feat: add TuiFrame and Prompt shared TUI primitives"
```

---

### Task 6: `useResourceCounts` hook

**Files:**
- Create: `src/utils/resourceCounts.js` (pure helper)
- Create: `src/utils/useResourceCounts.js` (hook)

- [ ] **Step 1: Create the pure counting helper**

```js
// src/utils/resourceCounts.js
import { labs } from '../data/labs';

/**
 * Pure: derive display counts from a manifest object + local labs.
 * Returns { pbqs, exams, viz, labs } where each is a number or null (unknown).
 */
export function deriveCounts(manifest) {
  const r = (manifest && manifest.resources) || null;
  const len = (key) => (r && Array.isArray(r[key]) ? r[key].length : 0);
  if (!r) {
    return { pbqs: null, exams: null, viz: null, labs: labs.length };
  }
  return {
    pbqs: len('aPlusPBQs') + len('securityPlusPBQs'),
    exams: len('aPlusExams') + len('securityPlusExams'),
    viz: len('visualizations'),
    labs: labs.length,
  };
}
```

- [ ] **Step 2: Temporary assertion to verify the pure function**

Add this at the bottom of `src/utils/resourceCounts.js` **temporarily**, run dev, confirm the console line, then delete it:

```js
// TEMP: remove after verifying
if (import.meta.env.DEV) {
  const t = deriveCounts({ resources: { aPlusPBQs: [1,2], securityPlusPBQs: [1], visualizations: [1,1,1] } });
  console.assert(t.pbqs === 3 && t.viz === 3 && t.exams === 0, 'deriveCounts wrong', t);
  console.assert(deriveCounts(null).pbqs === null, 'null manifest should give null pbqs');
}
```

Run: `npm run dev`, open console. Expected: no `console.assert` failures. Then **delete the TEMP block**.

- [ ] **Step 3: Create the hook**

```js
// src/utils/useResourceCounts.js
import { useEffect, useState } from 'react';
import { fetchManifest } from './manifestService';
import { deriveCounts } from './resourceCounts';
import { labs } from '../data/labs';

/** Loads the manifest and returns derived counts; degrades to null counts on failure. */
export function useResourceCounts() {
  const [counts, setCounts] = useState({ pbqs: null, exams: null, viz: null, labs: labs.length });
  useEffect(() => {
    let alive = true;
    fetchManifest()
      .then((m) => { if (alive) setCounts(deriveCounts(m)); })
      .catch(() => { /* keep null counts + local labs */ });
    return () => { alive = false; };
  }, []);
  return counts;
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build`. Expected: succeed.

- [ ] **Step 5: Commit**

```bash
git add src/utils/resourceCounts.js src/utils/useResourceCounts.js
git commit -m "feat: add resource counts helper + useResourceCounts hook"
```

---

## Phase 2 — Boot hero

### Task 7: Boot hero component

**Files:**
- Rewrite: `src/components/home/HeroSection.jsx`

This is the centerpiece; the animation lifecycle must be exact.

- [ ] **Step 1: Replace `HeroSection.jsx` entirely**

```jsx
// src/components/home/HeroSection.jsx
import { useEffect, useRef, useState } from 'react';
import { useNews } from '../../utils/useNews';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { ASCII_BANNER, SITE } from '../../config/theme';

const SESSION_KEY = 'shelnet_booted';

const HeroSection = () => {
  const { newsText } = useNews();
  const counts = useResourceCounts();

  // Build boot lines from live data. `null` count renders as "—".
  const n = (v) => (v == null ? '—' : v);
  const lines = [
    { html: <><span className="text-white/40">[ <span className="text-green-400">0.00</span> ] shelnet kernel {SITE.version} — booting userland…</span></> },
    { html: <><span className="text-green-400">[  OK  ]</span> mounting <span className="text-red-400">/pbqs</span> <span className="text-white/20">······</span> <span className="text-white/40">{n(counts.pbqs)} simulations</span></> },
    { html: <><span className="text-green-400">[  OK  ]</span> mounting <span className="text-blue-400">/exams</span> <span className="text-white/20">·····</span> <span className="text-white/40">{n(counts.exams)} mock tests</span></> },
    { html: <><span className="text-green-400">[  OK  ]</span> mounting <span className="text-purple-400">/visualizations</span> <span className="text-white/40">{n(counts.viz)} modules</span></> },
    { html: <><span className="text-green-400">[  OK  ]</span> mounting <span className="text-orange-400">/labs</span> <span className="text-white/20">······</span> <span className="text-white/40">{n(counts.labs)} writeups</span></> },
    { html: <><span className="text-green-400">[  OK  ]</span> security: <span className="text-white">trackers=0  paywall=none  cost=$0.00</span></> },
    { html: <><span className="text-white/40">[ <span className="text-green-400">feed</span> ] {newsText ? newsText.split('\n')[0] : 'latest updates loading…'}</span></> },
  ];

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyBooted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';

  // visibleCount: how many boot lines are shown. Start fully shown if reduced/already booted.
  const [visibleCount, setVisibleCount] = useState(prefersReduced || alreadyBooted ? lines.length : 0);
  const [finished, setFinished] = useState(prefersReduced || alreadyBooted);
  const timer = useRef(null);

  const finishNow = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisibleCount(lines.length);
    setFinished(true);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (prefersReduced || alreadyBooted) return;
    let i = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i >= lines.length) { finishNow(); return; }
      timer.current = setTimeout(tick, 230);
    };
    timer.current = setTimeout(tick, 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Skip on any key/click/scroll.
  useEffect(() => {
    if (finished) return;
    const skip = () => finishNow();
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('click', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
      window.removeEventListener('wheel', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const scrollToBrowser = () => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToAbout = () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden glow-green">
      <div className="absolute inset-0 bg-scanlines pointer-events-none" aria-hidden="true" />
      <div className="max-w-3xl w-full mx-auto relative z-10 font-mono text-sm md:text-base">
        {/* Banner: ASCII on desktop, wordmark on mobile */}
        <pre className="hidden sm:block text-green-400 text-[10px] md:text-xs leading-tight whitespace-pre"
             style={{ textShadow: '0 0 14px rgba(52,211,153,.4)' }} aria-label="SHELNET">{ASCII_BANNER}</pre>
        <div className="sm:hidden font-display text-4xl font-bold text-green-400">SHELNET_</div>
        <div className="text-white/45 text-xs mt-1 mb-5">{SITE.version} · open-source cybersecurity education</div>

        {/* Boot log */}
        <div className="space-y-1 leading-relaxed min-h-[200px]">
          {lines.slice(0, visibleCount).map((l, idx) => (
            <div key={idx}>{l.html}</div>
          ))}
        </div>

        {/* Login + CTAs (only after boot completes) */}
        {finished && (
          <>
            <div className="mt-4">
              <span className="text-green-400">shelnet login:</span> <span className="text-white">guest</span>
              <span className="text-white/40"> — press </span>
              <span className="border border-white/30 rounded px-1.5 text-xs">enter</span>
              <span className="text-white/40"> to start</span>
              <span className="inline-block w-2 h-4 bg-green-400 align-text-bottom ml-1 animate-pulse" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={scrollToBrowser}
                className="px-4 py-2 bg-green-400 text-black font-bold rounded text-sm hover:bg-green-300 transition-colors btn-scanline">
                ▸ Try a PBQ
              </button>
              <button onClick={scrollToAbout}
                className="px-4 py-2 border border-white/25 text-white rounded text-sm hover:bg-white/5 transition-colors">
                $ man shelnet
              </button>
            </div>
          </>
        )}
      </div>

      {/* Scroll cue */}
      {finished && (
        <button onClick={scrollToBrowser}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono hover:text-green-400 transition-colors">
          scroll to browse the filesystem
          <span className="block text-green-400 text-base animate-bounce reduce-static">▾</span>
        </button>
      )}
    </section>
  );
};

export default HeroSection;
```

- [ ] **Step 2: Bind `enter` to start** (append inside the existing skip-effect area is risky; add a dedicated effect)

The skip handler already completes the boot on any keydown. Add a separate effect so that **after** boot, pressing Enter scrolls to the browser:

```jsx
  useEffect(() => {
    if (!finished) return;
    const onEnter = (e) => { if (e.key === 'Enter') scrollToBrowser(); };
    window.addEventListener('keydown', onEnter);
    return () => window.removeEventListener('keydown', onEnter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);
```

Place this effect directly below the skip effect in the component.

- [ ] **Step 3: Verify manually**

Run: `npm run dev`.
- First load: boot lines type out (~2s), then login + buttons + scroll cue appear. Counts show real numbers (or `—` if offline).
- Reload in the same tab: boot is **instant** (sessionStorage). Open a new tab/incognito: animates again.
- Click/scroll/keypress mid-boot: completes instantly.
- DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → reload: renders fully, no typing, no bouncing arrow.
- "▸ Try a PBQ" and the scroll cue scroll down (target `#resources` exists after Task 10; until then it no-ops — acceptable).

Run: `npm run build`. Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/HeroSection.jsx
git commit -m "feat: boot-sequence hero with live counts, once-per-session animation, reduced-motion fallback"
```

---

### Task 8: Retire `TerminalComponent`

**Files:**
- Delete: `src/components/animations/TerminalComponent.jsx`

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rn "TerminalComponent" src/`
Expected: only its own file (HeroSection no longer imports it). If `App.jsx` or others import it, remove those imports.

- [ ] **Step 2: Delete**

Run: `git rm src/components/animations/TerminalComponent.jsx`

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`. Expected: succeed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: retire TerminalComponent (role absorbed by boot hero)"
```

---

## Phase 3 — Home TUI resource browser

### Task 9: Resource tree data config

**Files:**
- Create: `src/config/resourceTree.js`

- [ ] **Step 1: Define the directory/item model**

```js
// src/config/resourceTree.js
// Static structure of the home TUI. Counts are injected at render time.
// `to` = internal route (React Router); `href` = external link (new tab).

export const RESOURCE_TREE = [
  {
    key: 'pbqs', label: 'pbqs/', accent: 'green', countKey: 'pbqs',
    title: 'Practice PBQs', sub: 'Interactive performance-based simulations',
    items: [
      { tag: '220-1202', accent: 'red',  name: 'A+ Core 2', desc: 'OS troubleshooting, disk mgmt, suspicious activity', to: '/a-plus-pbqs' },
      { tag: 'SY0-701',  accent: 'blue', name: 'Security+',  desc: 'Firewall logs, vuln scanning, secure architecture', to: '/security-plus-pbqs' },
    ],
  },
  {
    key: 'exams', label: 'exams/', accent: 'green', countKey: 'exams',
    title: 'Practice Exams', sub: 'Full-length mock tests',
    items: [
      { tag: 'A+ CORE 2', accent: 'red',  name: 'A+ Core 2 Mock', desc: '90 questions · 4 domains', to: '/a-plus-exams' },
      { tag: 'SY0-701',   accent: 'blue', name: 'Security+ Mock',  desc: '90 questions · 5 domains', to: '/security-plus-exams' },
    ],
  },
  {
    key: 'visualizations', label: 'visualizations/', accent: 'purple', countKey: 'viz',
    title: 'Visualizations', sub: 'Interactive concept modules',
    items: [
      { tag: 'CONCEPTS', accent: 'purple', name: 'Core Concepts', desc: 'Visual explanations of security concepts', to: '/visualizations' },
    ],
  },
  {
    key: 'labs', label: 'labs/', accent: 'orange', countKey: 'labs',
    title: 'Labs', sub: 'Threat simulation range + writeups',
    // items injected from labs.js at render (see ResourceTUI)
    items: [],
  },
  {
    key: 'notes', label: 'notes/', accent: 'slate', countKey: null,
    title: 'Notes', sub: 'Live-synced study notes',
    items: [
      { tag: 'LIVE', accent: 'slate', name: 'Obsidian Vault', desc: 'Continuously synced as I study', href: 'https://lui-gi.github.io/shelnet-notes/' },
    ],
  },
];
```

- [ ] **Step 2: Verify** `npm run lint`. Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/config/resourceTree.js
git commit -m "feat: add resource tree config for home TUI"
```

---

### Task 10: `ResourceTUI` component

**Files:**
- Create: `src/components/home/ResourceTUI.jsx`

- [ ] **Step 1: Create the component**

```jsx
// src/components/home/ResourceTUI.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';
import { RESOURCE_TREE } from '../../config/resourceTree';
import { useResourceCounts } from '../../utils/useResourceCounts';
import { labs } from '../../data/labs';
import { themeColors } from '../../config/themeColors';

const ACCENT_HL = {
  green: 'bg-green-500/14', red: 'bg-red-500/14', blue: 'bg-blue-500/14',
  purple: 'bg-purple-500/14', orange: 'bg-orange-500/14', slate: 'bg-slate-500/14',
};
const ACCENT_BAR = {
  green: 'shadow-[inset_2px_0_0_#34d399]', red: 'shadow-[inset_2px_0_0_#fb7185]',
  blue: 'shadow-[inset_2px_0_0_#38bdf8]', purple: 'shadow-[inset_2px_0_0_#c084fc]',
  orange: 'shadow-[inset_2px_0_0_#fb923c]', slate: 'shadow-[inset_2px_0_0_#cbd5e1]',
};

const ResourceTUI = () => {
  const counts = useResourceCounts();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const treeRef = useRef(null);

  // Inject live lab items into the labs directory.
  const tree = RESOURCE_TREE.map((dir) =>
    dir.key === 'labs'
      ? { ...dir, items: labs.map((l) => ({
          tag: l.type === 'hardware' ? 'HW' : 'VM', accent: 'orange',
          name: l.name, desc: l.description, to: `/labs/${l.slug}`,
        })) }
      : dir
  );

  const countFor = (dir) => (dir.countKey ? counts[dir.countKey] : 'live');
  const current = tree[active];

  const openItem = (item) => {
    if (item.to) navigate(item.to);
    else if (item.href) window.open(item.href, '_blank', 'noopener');
  };

  // Keyboard nav within the tree (progressive enhancement).
  const onTreeKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % tree.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => (i - 1 + tree.length) % tree.length); }
  };

  return (
    <section id="resources" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Prompt command="cd /resources && ls -la" accent="green" className="mb-4" />
        <TuiFrame
          accent="green"
          titleLeft="┤ shelnet · ~/resources ├"
          titleRight={`${tree.length} dirs`}
          footerLeft="↑↓ select · enter open · / search"
          footerRight="free · open-source · no-login"
        >
          <div className="grid md:grid-cols-[230px_1fr] min-h-[320px]">
            {/* Tree */}
            <div
              ref={treeRef}
              tabIndex={0}
              onKeyDown={onTreeKey}
              className="border-b md:border-b-0 md:border-r border-green-500/25 p-2 outline-none focus:bg-white/[0.02]"
              aria-label="Resource directories"
            >
              {tree.map((dir, i) => (
                <button
                  key={dir.key}
                  onClick={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left text-sm transition-colors
                    ${i === active ? `${ACCENT_HL[dir.accent]} text-white ${ACCENT_BAR[dir.accent]}` : 'text-white/65 hover:bg-white/5'}`}
                >
                  <span>{i === active ? '▸ ' : '  '}{dir.label}</span>
                  <span className="text-white/40 text-xs">{countFor(dir) ?? '—'}</span>
                </button>
              ))}
            </div>

            {/* Contents */}
            <div className="p-4">
              <div className="font-display text-lg font-bold text-white">{current.title}</div>
              <div className="text-white/40 text-xs mb-4">~/resources/{current.label} — {current.sub}</div>
              <div className="space-y-2">
                {current.items.map((item, i) => {
                  const c = themeColors[item.accent] || themeColors.green;
                  return (
                    <button
                      key={i}
                      onClick={() => openItem(item)}
                      className={`w-full flex items-center gap-3 text-left p-3 rounded border ${c.border} bg-white/[0.02] ${c.hoverBorder} ${c.bgHover} transition-colors`}
                    >
                      <span className={`text-[9px] font-bold px-2 py-1 rounded ${c.bgActive} ${c.text} min-w-[64px] text-center`}>{item.tag}</span>
                      <span>
                        <span className="block text-white text-sm font-bold">{item.name}</span>
                        <span className="block text-white/45 text-xs">{item.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </TuiFrame>
      </div>
    </section>
  );
};

export default ResourceTUI;
```

- [ ] **Step 2: Verify** `npm run lint && npm run build`. Expected: succeed.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ResourceTUI.jsx
git commit -m "feat: home TUI resource browser (tree + contents, routes into detail pages)"
```

---

### Task 11: Wire the homepage together

**Files:**
- Rewrite: `src/App.jsx`

- [ ] **Step 1: Replace `App.jsx`**

```jsx
// src/App.jsx
import HeroSection from './components/home/HeroSection';
import ResourceTUI from './components/home/ResourceTUI';
import AboutSection from './components/home/AboutSection';
import ConnectSection from './components/home/ConnectSection';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-green-500/30 selection:text-green-200">
      <HeroSection />
      <ResourceTUI />
      <AboutSection />
      <ConnectSection />
    </div>
  );
}
```

(Removes the now-unused `PBQsSection`, `ExamsSection`, `VisualizationsSection`, `LabsSection`, `NotesSection` imports — those files are deleted in Task 12.)

- [ ] **Step 2: Verify**

Run: `npm run dev`. Expected: hero → scroll → ResourceTUI appears; clicking a directory swaps contents; clicking an item navigates to the correct route; "▸ Try a PBQ" and scroll cue now reach `#resources`.
Run: `npm run build`. Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: assemble homepage (hero + resource TUI + about + connect)"
```

---

### Task 12: Delete superseded homepage section components

**Files:**
- Delete: `PBQsSection.jsx`, `ExamsSection.jsx`, `VisualizationsSection.jsx`, `LabsSection.jsx`, `NotesSection.jsx`
- Evaluate: `BrutalHeader.jsx`, `ScanningWordCloud.jsx`, `LabTopologyCanvas.jsx`, `LabBlueprintCard.jsx`

- [ ] **Step 1: Confirm the five sections are unreferenced**

Run: `grep -rEn "PBQsSection|ExamsSection|VisualizationsSection|LabsSection|NotesSection" src/`
Expected: no matches (App.jsx no longer imports them).

- [ ] **Step 2: Check whether `LabBlueprintCard`/`LabTopologyCanvas` are still used**

Run: `grep -rEn "LabBlueprintCard|LabTopologyCanvas" src/`
- These were used by the old `LabsSection`. They are **kept** for potential reuse on the labs detail page only if referenced there; if `grep` shows no remaining references, leave the files in place (do not delete reusable lab components — spec says preserve strong lab work). Note in commit which were orphaned.

- [ ] **Step 3: Delete the five superseded sections**

```bash
git rm src/components/home/PBQsSection.jsx src/components/home/ExamsSection.jsx \
       src/components/home/VisualizationsSection.jsx src/components/home/LabsSection.jsx \
       src/components/home/NotesSection.jsx
```

- [ ] **Step 4: Handle `BrutalHeader`**

Run: `grep -rn "BrutalHeader" src/`
- It's used by the inner pages until Task 16 replaces them. **Do not delete yet.** Leave for Task 18.

- [ ] **Step 5: Verify** `npm run lint && npm run build`. Expected: succeed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove homepage section components superseded by ResourceTUI"
```

---

## Phase 4 — About / Connect

### Task 13: Restyle About into a `cat about.md` panel

**Files:**
- Rewrite: `src/components/home/AboutSection.jsx`

- [ ] **Step 1: Replace the component** (distinct TUI styling — a document panel, not the resource frame)

```jsx
// src/components/home/AboutSection.jsx
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';

const AboutSection = () => (
  <section id="about" className="py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <Prompt command="cat about.md" accent="green" className="mb-4" />
      <TuiFrame accent="green" titleLeft="┤ about.md ├" titleRight="readme">
        <div className="p-6 md:p-8 space-y-5 text-white/75 leading-relaxed text-sm md:text-[15px]">
          <p>
            Shelnet began as a private repo where I tracked my progress as a university
            student into cybersecurity. It started as a personal tool to solidify my
            understanding — but I realized how hard it is to find study materials that are
            high-quality, current, and actually free.
          </p>
          <p>
            Every practice resource I found was outdated, untrue to the exam, or paywalled.
            So I open-sourced all of my notes and study resources, and built Shelnet to run
            entirely client-side. No data harvesting, no hidden content — fully open-source
            and privacy-first.
          </p>
          <p>
            Shelnet is proof that learning through teaching works. By sharing the journey
            publicly — mistakes and breakthroughs — I want a living resource that grows into
            a barrier-free community where anyone can break into tech without paying for the
            privilege.
          </p>

          {/* timeline */}
          <div className="pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
            <span className="text-white/40">2024 <span className="text-white/30">private repo</span></span>
            <span className="text-white/20">→</span>
            <span className="text-green-400">now <span className="text-white">open source</span></span>
            <span className="text-white/20">→</span>
            <span className="text-white/40">next <span className="text-white/30">growing community</span></span>
          </div>
        </div>
      </TuiFrame>
    </div>
  </section>
);

export default AboutSection;
```

- [ ] **Step 2: Verify** `npm run dev` (About reads as a document panel) and `npm run build`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/AboutSection.jsx
git commit -m "style: restyle About as a cat about.md TUI panel"
```

---

### Task 14: Restyle Connect into a `./connect` panel + footer

**Files:**
- Rewrite: `src/components/home/ConnectSection.jsx`

- [ ] **Step 1: Replace the component**

```jsx
// src/components/home/ConnectSection.jsx
import { Youtube, Linkedin, Mail } from 'lucide-react';
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';
import { PROMPT, SITE } from '../../config/theme';

const LINKS = [
  { Icon: Youtube,  label: 'YouTube',  desc: 'Video explanations of PBQs & visualizations', href: 'https://youtube.com/@Shelnet',                       hover: 'hover:border-red-500/50 hover:bg-red-900/10',  cta: 'text-red-400' },
  { Icon: Linkedin, label: 'LinkedIn', desc: 'Connect with me',                              href: 'https://linkedin.com/in/luigi-fernandez-502647333', hover: 'hover:border-blue-500/50 hover:bg-blue-900/10', cta: 'text-blue-400' },
  { Icon: Mail,     label: 'Email',    desc: 'Resource requests or business inquiries',      href: 'https://forms.gle/WRM23ktXNZiupPaZA',               hover: 'hover:border-white/50 hover:bg-white/5',       cta: 'text-white/70' },
];

const ConnectSection = () => (
  <section id="connect" className="py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <Prompt command="./connect" accent="green" className="mb-4" />
      <TuiFrame accent="green" titleLeft="┤ ./connect ├" titleRight="socials">
        <div className="grid sm:grid-cols-3 gap-px bg-white/10">
          {LINKS.map(({ Icon, label, desc, href, hover, cta }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
               className={`group bg-black p-6 transition-colors ${hover}`}>
              <Icon className="text-white mb-3" size={22} />
              <div className="text-white font-bold mb-1">{label}</div>
              <div className="text-white/50 text-xs mb-3">{desc}</div>
              <div className={`text-[11px] font-mono ${cta}`}>open →</div>
            </a>
          ))}
        </div>
      </TuiFrame>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between text-white/30 text-xs font-mono">
        <span>© {new Date().getFullYear()} {SITE.domain}</span>
        <span className="text-green-400">{PROMPT} logout</span>
      </div>
    </div>
  </section>
);

export default ConnectSection;
```

- [ ] **Step 2: Verify** `npm run dev` (three links, footer shows `shelnet:~$ logout` + domain) and `npm run build`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ConnectSection.jsx
git commit -m "style: restyle Connect as ./connect TUI panel + logout footer"
```

---

## Phase 5 — Inner-page TUI workspace

### Task 15: `Workspace` shared component

**Files:**
- Create: `src/components/tui/Workspace.jsx`

This replaces the `PageHeader` + `PBQSidebar` + `ContentViewer` composition with one cohesive workspace. It owns: path bar, explorer (file list), viewer (iframe + states), status bar, fullscreen, keyboard nav, mobile drawer.

- [ ] **Step 1: Create the component**

```jsx
// src/components/tui/Workspace.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Maximize2, Minimize2, ExternalLink, ChevronLeft, Menu } from 'lucide-react';
import { themeColors } from '../../config/themeColors';
import { PROMPT } from '../../config/theme';

const ACCENT_BORDER = {
  green: 'border-green-500/40', red: 'border-red-500/40', blue: 'border-blue-500/40',
  purple: 'border-purple-500/40', orange: 'border-orange-500/40', slate: 'border-slate-400/40',
};
const ACCENT_DIV = {
  green: 'border-green-500/25', red: 'border-red-500/25', blue: 'border-blue-500/25',
  purple: 'border-purple-500/25', orange: 'border-orange-500/25', slate: 'border-slate-400/25',
};

/**
 * @param {string} accent          theme color key (cert color)
 * @param {string[]} pathSegments  e.g. ['pbqs','a-plus']
 * @param {Array} items            [{ id, title, description, file }]
 * @param {string} itemPrefix      e.g. 'PBQ_0'
 * @param {string} statusLabel     e.g. 'EXECUTING:'
 * @param {string} loading,error   pass-through states
 * @param {string} metaRight       status-bar right text (e.g. '220-1202')
 * @param {boolean} showSandbox
 */
const Workspace = ({
  accent = 'red', pathSegments = [], items = [], itemPrefix = 'PBQ_0',
  statusLabel = 'EXECUTING:', loading = false, error = null, metaRight = '', showSandbox = false,
}) => {
  const colors = themeColors[accent];
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const idx = selected ? items.findIndex((i) => i.id === selected.id) : -1;

  const select = useCallback((item) => { setSelected(item); setDrawerOpen(false); }, []);

  // Keyboard nav: ↑↓ move, enter selects highlighted (or next), f fullscreen, esc home/exit.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); const n = items[(idx + 1 + items.length) % items.length]; if (n) setSelected(n); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); const n = items[(idx - 1 + items.length) % items.length]; if (n) setSelected(n); }
      if (e.key === 'f' && selected) { setFullscreen((v) => !v); }
      if (e.key === 'Escape') { if (fullscreen) setFullscreen(false); else navigate('/'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, items, selected, fullscreen, navigate]);

  const Explorer = (
    <div className={`p-2 overflow-y-auto ${ACCENT_DIV[accent]}`} aria-label="File explorer">
      <div className="text-white/40 text-[10px] tracking-widest px-2 py-2">EXPLORER · AVAILABLE</div>
      {items.map((item) => {
        const on = selected?.id === item.id;
        return (
          <button key={item.id} onClick={() => select(item)}
            className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${on ? `${colors.bgActive} text-white` : 'text-white/65 hover:bg-white/5'}`}>
            <div className={`text-[11px] font-bold ${colors.text}`}>{itemPrefix}{item.id}{on ? ' ●' : ''}</div>
            <div className="text-xs font-semibold">{item.title}</div>
            <div className="text-[10px] text-white/40">{item.description}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`border ${ACCENT_BORDER[accent]} rounded-md font-mono bg-black/40`}>
      {/* Path bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${ACCENT_DIV[accent]} text-xs`}>
        <div className="flex items-center gap-2 min-w-0">
          <button className="md:hidden text-white/60" onClick={() => setDrawerOpen((v) => !v)} aria-label="Toggle explorer"><Menu size={16} /></button>
          <Link to="/" className="text-white/40 hover:text-white">~</Link>
          {pathSegments.map((seg, i) => (
            <span key={i} className="text-white/40 truncate">/ {i === pathSegments.length - 1 ? <span className={colors.text}>{seg}</span> : seg}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <>
              <button onClick={() => setFullscreen((v) => !v)} className="p-1.5 border border-white/20 rounded hover:border-white/40" title="Fullscreen (f)">
                {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => window.open(selected.file, '_blank', 'noopener')} className={`p-1.5 border border-white/20 rounded ${colors.hoverBorder} ${colors.textHover}`} title="Open in new tab">
                <ExternalLink size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-16 text-center text-white/50 text-sm">Loading…</div>
      ) : error ? (
        <div className="p-8 text-red-400 text-sm">Failed to load resources: {error}</div>
      ) : (
        <div className={`grid ${fullscreen ? 'grid-cols-1' : 'md:grid-cols-[260px_1fr]'} min-h-[60vh]`}>
          {/* Explorer: hidden in fullscreen; drawer on mobile */}
          {!fullscreen && (
            <div className={`md:border-r ${ACCENT_DIV[accent]} ${drawerOpen ? 'block' : 'hidden md:block'}`}>{Explorer}</div>
          )}
          {/* Viewer */}
          <div className="flex flex-col">
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${ACCENT_DIV[accent]} text-xs`}>
              {fullscreen && <button onClick={() => setFullscreen(false)}><ChevronLeft size={16} className="text-white/60" /></button>}
              {selected
                ? <span><span className={colors.text}>{statusLabel}</span> <span className="text-white">{selected.title}</span></span>
                : <span className="text-white/40">{statusLabel} waiting for input…</span>}
            </div>
            <div className="flex-1 bg-white relative" style={{ height: fullscreen ? '85vh' : '60vh' }}>
              {selected ? (
                <iframe src={selected.file} title={selected.title} className="w-full h-full border-0"
                  {...(showSandbox && { sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups' })} />
              ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center text-center text-white/40">
                  <div>
                    <div className="text-3xl opacity-30">▢</div>
                    <div className="mt-2 text-sm">// no file loaded</div>
                    <div className="text-xs mt-1 opacity-70">select a file to initialize environment</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-t ${ACCENT_DIV[accent]} text-[10.5px]`}>
        <span className="text-white/50">↑↓ select · enter run · f fullscreen · esc → home</span>
        <span className={colors.text}>{items.length} files{metaRight ? ` · ${metaRight}` : ''}</span>
      </div>
    </div>
  );
};

export default Workspace;
```

- [ ] **Step 2: Verify** `npm run lint && npm run build`. Expected: succeed (consumed next task).

- [ ] **Step 3: Commit**

```bash
git add src/components/tui/Workspace.jsx
git commit -m "feat: shared Workspace TUI (explorer + viewer + path/status bars, keyboard nav, fullscreen)"
```

---

### Task 16: Convert the five inner pages to `Workspace`

**Files:**
- Rewrite: `src/pages/a-plus-pbqs.jsx`, `src/pages/security-plus-pbqs.jsx`, `src/pages/a-plus-exams.jsx`, `src/pages/security-plus-exams.jsx`, `src/pages/visualizations.jsx`

Each page becomes a thin wrapper. Do them one at a time, verifying each.

- [ ] **Step 1: Rewrite `a-plus-pbqs.jsx`**

```jsx
// src/pages/a-plus-pbqs.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const APlusPBQs = () => {
  const { resources, loading, error } = useManifest('aPlusPBQs');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /pbqs/a-plus && ls" accent="red" className="mb-4" />
        <Workspace
          accent="red"
          pathSegments={['pbqs', 'a-plus']}
          items={resources}
          itemPrefix="PBQ_0"
          statusLabel="EXECUTING:"
          metaRight="220-1202"
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default APlusPBQs;
```

- [ ] **Step 2: Rewrite `security-plus-pbqs.jsx`** — identical but `accent="blue"`, `pathSegments={['pbqs','security-plus']}`, `useManifest('securityPlusPBQs')`, `metaRight="SY0-701"`.

```jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const SecurityPlusPBQs = () => {
  const { resources, loading, error } = useManifest('securityPlusPBQs');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /pbqs/security-plus && ls" accent="blue" className="mb-4" />
        <Workspace accent="blue" pathSegments={['pbqs', 'security-plus']} items={resources}
          itemPrefix="PBQ_0" statusLabel="EXECUTING:" metaRight="SY0-701" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default SecurityPlusPBQs;
```

- [ ] **Step 3: Rewrite `a-plus-exams.jsx`** — `accent="red"`, `useManifest('aPlusExams')`, `itemPrefix="EXAM_0"`, `statusLabel="RUNNING:"`, `pathSegments={['exams','a-plus']}`, `metaRight="220-1202"`.

```jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const APlusExams = () => {
  const { resources, loading, error } = useManifest('aPlusExams');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /exams/a-plus && ls" accent="red" className="mb-4" />
        <Workspace accent="red" pathSegments={['exams', 'a-plus']} items={resources}
          itemPrefix="EXAM_0" statusLabel="RUNNING:" metaRight="220-1202" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default APlusExams;
```

- [ ] **Step 4: Rewrite `security-plus-exams.jsx`** — `accent="blue"`, `useManifest('securityPlusExams')`, `itemPrefix="EXAM_0"`, `statusLabel="RUNNING:"`, `pathSegments={['exams','security-plus']}`, `metaRight="SY0-701"`.

```jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const SecurityPlusExams = () => {
  const { resources, loading, error } = useManifest('securityPlusExams');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /exams/security-plus && ls" accent="blue" className="mb-4" />
        <Workspace accent="blue" pathSegments={['exams', 'security-plus']} items={resources}
          itemPrefix="EXAM_0" statusLabel="RUNNING:" metaRight="SY0-701" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default SecurityPlusExams;
```

- [ ] **Step 5: Rewrite `visualizations.jsx`** — `accent="purple"`, `useManifest('visualizations')`, `itemPrefix="VIZ_0"`, `statusLabel="VIEWING:"`, `pathSegments={['visualizations']}`, `showSandbox`.

```jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const Visualizations = () => {
  const { resources, loading, error } = useManifest('visualizations');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /visualizations && ls" accent="purple" className="mb-4" />
        <Workspace accent="purple" pathSegments={['visualizations']} items={resources}
          itemPrefix="VIZ_0" statusLabel="VIEWING:" loading={loading} error={error} showSandbox />
      </div>
    </div>
  );
};
export default Visualizations;
```

- [ ] **Step 6: Verify each route**

Run: `npm run dev`. Visit `/a-plus-pbqs`, `/security-plus-pbqs`, `/a-plus-exams`, `/security-plus-exams`, `/visualizations`. For each: explorer lists files, selecting one loads the iframe with the cert-colored `EXECUTING/RUNNING/VIEWING` label, fullscreen toggles (button + `f`), `esc` returns home, open-in-new-tab works, mobile menu toggles the explorer drawer.
Run: `npm run build`. Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/a-plus-pbqs.jsx src/pages/security-plus-pbqs.jsx src/pages/a-plus-exams.jsx src/pages/security-plus-exams.jsx src/pages/visualizations.jsx
git commit -m "feat: rebuild inner resource pages as TUI workspaces with cert-colored chrome"
```

---

### Task 17: Retire `PageHeader`, `PBQSidebar`, `ContentViewer`

**Files:**
- Delete (after confirming unreferenced): `src/components/shared/PageHeader.jsx`, `src/components/shared/PBQSidebar.jsx`, `src/components/shared/ContentViewer.jsx`

- [ ] **Step 1: Confirm unreferenced**

Run: `grep -rEn "PageHeader|PBQSidebar|ContentViewer" src/`
Expected: no matches (lab-detail uses its own header, not `PageHeader`). If `lab-detail.jsx` references `PageHeader`, defer those deletions until Task 18.

- [ ] **Step 2: Delete**

```bash
git rm src/components/shared/PageHeader.jsx src/components/shared/PBQSidebar.jsx src/components/shared/ContentViewer.jsx
```

- [ ] **Step 3: Verify** `npm run lint && npm run build`. Expected: succeed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove PageHeader/PBQSidebar/ContentViewer (replaced by Workspace)"
```

---

## Phase 6 — Labs detail, nav, and final polish

### Task 18: Wrap labs detail in shared chrome + unify nav

**Files:**
- Modify: `src/pages/lab-detail.jsx` (header only)
- Modify: `src/Layout.jsx` (nav restyle)

- [ ] **Step 1: Replace the labs detail header block** with a path-bar + Prompt, keeping ALL existing content panels below untouched.

In `src/pages/lab-detail.jsx`, replace the existing header `<div className="mb-8">…</div>` (the back link + icon + title block) with:

```jsx
          {/* Header */}
          <Prompt command={`cd /labs/${lab.slug}`} accent="orange" className="mb-3" />
          <div className="mb-8 flex items-end justify-between border-b border-orange-500/25 pb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight font-display">{lab.name}</h1>
              <div className="text-sm text-white/50 font-mono">~/labs/{lab.slug} · REV {lab.revision} · {lab.date}</div>
            </div>
            <Link to="/#resources" className="text-white/40 hover:text-orange-400 font-mono text-xs whitespace-nowrap">../back</Link>
          </div>
```

Add the import at the top: `import Prompt from '../components/tui/Prompt';` (and keep the existing `Link` import). Apply the same `Prompt` + path treatment to the 404 branch's header for consistency.

- [ ] **Step 2: Restyle the nav in `Layout.jsx`**

In `src/Layout.jsx`, update the desktop + mobile nav link lists so labels reflect the new IA and accent. Replace the seven links (`PBQs/Exams/Visualizations/Labs/Notes/About/Connect`) with anchors that match the new homepage anchors (`#resources`, `#about`, `#connect`) — the per-section anchors no longer exist:

```jsx
{/* desktop links */}
<div className="hidden md:flex gap-8 font-mono text-sm text-white/60">
  <a href="/#resources" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">resources</a>
  <a href="/#about" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">about</a>
  <a href="/#connect" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">connect</a>
</div>
```

Update the mobile drawer links the same way (three links: resources/about/connect). Change the logo accent hover and the hamburger hover from the old palette to `green` (`hover:text-green-500`). Keep all scroll/escape/resize logic intact.

- [ ] **Step 3: Verify**

Run: `npm run dev`. Visit `/labs/metasploitable-2-lab`: header shows `shelnet:~$ cd /labs/…`, all spec/topology/docs/writeup panels render unchanged. Nav shows `resources / about / connect`; each scrolls to the right homepage section from any page.
Run: `npm run build`. Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/lab-detail.jsx src/Layout.jsx
git commit -m "feat: labs detail shared chrome + unified nav (resources/about/connect)"
```

---

### Task 19: Final cleanup, dead-code sweep, accessibility & responsive pass

**Files:**
- Possibly delete: `src/components/shared/BrutalHeader.jsx`, `src/components/animations/ScanningWordCloud.jsx`
- Add: `public/og-image.png`
- Modify: `README.md` screenshot note (optional)

- [ ] **Step 1: Dead-code sweep**

Run: `grep -rEn "BrutalHeader|ScanningWordCloud" src/`
- `BrutalHeader`: should now be unreferenced (inner pages use `Prompt`). If so: `git rm src/components/shared/BrutalHeader.jsx`.
- `ScanningWordCloud`: was the old viz card animation. If unreferenced and not reused in the visualizations page, `git rm src/components/animations/ScanningWordCloud.jsx`. If you want to keep it as a viz preview, leave it and note where it's used.

- [ ] **Step 2: Grep for stale prompt metaphors and the old badge**

Run: `grep -rEn "C:\\\\Shelnet|root@shelnet|SYSTEM_READY|v2\.0\.4" src/`
Expected: no matches. Fix any stragglers to use `shelnet:~$` / remove.

- [ ] **Step 3: Copy fixes**

Confirm no remaining double-space/"suspicious activity" artifacts (the old PBQ card text was deleted with `PBQsSection`; the new descriptions live in `resourceTree.js` — verify they read cleanly). Confirm footer domain (`SITE.domain`) is correct once the owner confirms the real domain; update `src/config/theme.js` and the `index.html` canonical/OG URLs together.

- [ ] **Step 4: Add an OG image**

Create `public/og-image.png` (1200×630). Quick path: screenshot the new boot hero. Place at `public/og-image.png` so the meta tags resolve. (If deferring, leave the meta tags pointing at `homepage.png` instead.)

- [ ] **Step 5: Accessibility & responsive checks**

- DevTools device toolbar at 375px: hero shows the `SHELNET_` wordmark; ResourceTUI stacks (tree above contents); inner Workspace shows the explorer drawer toggle; About/Connect stack.
- `prefers-reduced-motion: reduce`: no typing, no bouncing arrow, no pulse animations driving layout.
- Tab through the homepage: nav links, TUI directory buttons, resource items, hero buttons all focusable with visible focus.
- Contrast spot-check: green/red/blue/purple text on black meets ~4.5:1 for body-size text (the chosen `*-400` shades do; verify any smaller `/40` muted text is decorative only).

- [ ] **Step 6: Full verification**

Run: `npm run lint` → clean. `npm run build` → succeeds. `npm run preview` → click through every route once.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: dead-code sweep, og image, a11y/responsive polish"
```

---

## Self-review checklist (completed by plan author)

**Spec coverage:**
- Boot hero (full-viewport, live counts, once/session, reduced-motion, mobile wordmark, chips removed, news feed) → Tasks 6, 7. ✓
- Home TUI file-manager routing into detail pages → Tasks 9, 10, 11. ✓
- About/Connect compact, distinct TUI styling + logout footer → Tasks 13, 14. ✓
- Inner pages as TUI workspaces, cert-colored, real keyboard nav → Tasks 15, 16. ✓
- Labs detail keeps panels + shared chrome → Task 18. ✓
- One shell prompt; retire C:\/root@/$ → Prompt component + Task 19 grep. ✓
- Green chrome + functional cert colors → Tasks 1, 2, used throughout. ✓
- Binary rain removed → Task 4. ✓
- SEO/OG meta, fonts, copy fixes → Tasks 3, 19. ✓
- File-impact map items all have tasks. ✓

**Placeholder scan:** No "TBD/handle later" left; the only `TODO(confirm-with-owner)` is the real-domain decision, deliberately surfaced (Tasks 1, 3, 19).

**Type/name consistency:** `deriveCounts`/`useResourceCounts` shape `{pbqs,exams,viz,labs}` used consistently in hero + TUI; `Workspace` props match all five page call-sites; `themeColors[accent]` keys (`green/red/blue/purple/orange/slate`) exist after Task 2; accent class maps in `TuiFrame`/`ResourceTUI`/`Workspace` cover all six keys.

**Note on Labs reuse:** `LabBlueprintCard`/`LabTopologyCanvas` are intentionally preserved (Task 12 Step 2) — the spec says don't regress strong lab work.
