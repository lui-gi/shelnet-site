# Shelnet — Terminal-Native Redesign (Design Spec)

**Date:** 2026-06-19
**Status:** Approved direction, pending spec review
**Author:** Luigi + Claude (brainstorming session)

## 1. Summary

Modernize the Shelnet homepage and inner pages by **leaning into** the terminal/hacker
identity rather than sanding it off. The current site has character but feels dated
because of overused tropes (Matrix binary rain, a meaningless `v2.0.4` badge, decorative
fake-terminal blocks on every card), an inconsistent shell metaphor (`C:\` vs `root@` vs
`$`), and a flat homepage where 8 sections share identical weight.

The redesign reframes the entire site as **one coherent machine you boot into and
navigate**:

1. A full-viewport **boot-sequence hero** (screen 1).
2. A **TUI file-manager** for browsing all resources (screen 2).
3. A compact, distinctly-styled **About / Connect** strip below.
4. Inner pages rebuilt as **TUI workspaces** (explorer + live viewer + run controls).
5. A unified visual system: one shell prompt, one signature accent + functional cert
   colors, no binary rain, real SEO/meta, real fonts, copy fixes.

This is a visual/UX redesign. It reuses existing data flows (manifest, `labs.js`,
`useNews`) and existing routes/detail behavior.

## 2. Goals / Non-goals

**Goals**
- Keep and amplify the site's original terminal character; make it deliberate and cohesive.
- Establish clear hierarchy so core resources (PBQs, Exams) read as primary.
- Make the homepage feel like a single designed system, not a theme sprinkled on blocks.
- Fix credibility gaps: real value prop, live stats, SEO metadata, consistent metaphor.
- Preserve all current functionality (iframe viewers, fullscreen, open-in-new-tab, labs docs).

**Non-goals**
- No backend, no data collection, no auth — stays 100% client-side (core promise).
- No change to where resource content lives (still `shelnet-resources` / `shelnet-notes`).
- No redesign of the embedded resource HTML itself (the PBQ/exam apps in the iframes).
- No light mode (out of scope for this pass).

## 3. Design decisions (locked during brainstorming)

| # | Decision |
|---|----------|
| Direction | Modernize the current terminal theme (keep DNA, cut clichés, add hierarchy + value prop). |
| Hero | Boot-sequence, **full viewport** (`min-h-screen`). |
| Hero stats | **Live counts** from manifest (PBQs/exams/viz) + `labs.js` (labs); `[ feed ]` line from `useNews`. |
| Hero top-right chips | **Removed** — values live only in the `trackers=0 paywall=none cost=$0.00` boot line. |
| Hero replay | Animate **once per session** (sessionStorage); instant on repeat loads. |
| Hero motion | Skippable (key/click/scroll completes instantly); full `prefers-reduced-motion` fallback. |
| Hero background | Full-bleed, subtle green radial glow + faint CRT scanlines. |
| Hero mobile | ASCII banner falls back to bold `SHELNET_` wordmark under 640px. |
| Hero buttons | Keep `▸ Try a PBQ` (primary, scrolls to TUI) and `$ man shelnet` (secondary → About). |
| Resource browser | **TUI file-manager**: directory tree (left) + contents pane (right). |
| Open behavior | TUI items navigate to existing detail routes (`/a-plus-pbqs`, lab writeups, notes site). |
| About / Connect | Separate **compact** section below the browser with its **own** (distinct) TUI styling. |
| Shell metaphor | One prompt — `shelnet:~$ cd /…` — replaces all `C:\` / `root@` / `$` variants. |
| Accent system | Green = global signature accent; red/blue/purple/orange = functional cert colors (refined). |
| Binary rain | **Removed.** |
| Inner pages | Rebuilt as **TUI workspaces** (explorer + viewer + path bar + status bar). |
| Inner-page chrome | **Cert-colored** for wayfinding (A+ red, Sec+ blue, Viz purple); green is global only. |
| Keyboard nav | **Real** `↑↓ / enter / f / esc` on the TUI components (progressive enhancement). |
| Labs detail | Keep rich blueprint panels; wrap in the same outer chrome (path bar + status bar). |

## 4. Visual system

### 4.1 Shell prompt motif
A single prompt string is the connective tissue: `shelnet:~$ cd /pbqs`. Used as every
section header and in the status/footer (`shelnet:~$ logout`). Replaces `BrutalHeader`'s
mixed `C:\Shelnet>` subtitles and the scattered `root@shelnet:~#` decorative blocks.

### 4.2 Color
- **Green (`#34d399` family)** — global chrome: nav, hero, home TUI, primary CTAs, prompt.
- **Functional cert colors** (refined, less neon than today):
  - A+ → red (`#fb7185`), Security+ → blue (`#38bdf8`), Visualizations → purple
    (`#c084fc`), Labs → orange (`#fb923c`), Notes → slate/gray.
- Inner pages adopt their cert color as the local accent (borders, file highlights,
  `EXECUTING:` label). Home/boot stay green.
- Centralize in `src/config/themeColors.js` (extend with a `green`/global entry; ensure
  every color has the classes the components consume).

### 4.3 Background
Remove `BinaryRain` globally (delete usage in `App.jsx` and `Layout.jsx`). Replace with a
cheap, static treatment: a subtle green radial glow at the top of the hero + faint CSS
scanlines (`repeating-linear-gradient`), gated by `prefers-reduced-motion`. No per-frame
canvas redraws.

### 4.4 Typography
- Adopt **one self-hosted monospace variable font** (e.g. JetBrains Mono / Geist Mono) as
  the primary UI/terminal face — the site is mono-forward, so this carries most text.
- Display headings (e.g. `LEARN CYBER_SECURITY`) use a bold grotesk; default to the system
  stack to keep payload small (README flags site-size sensitivity). Stop declaring
  `Helvetica Neue` inline with no fallback strategy; define it once in CSS.
- Load with `font-display: swap`; preload the mono.

### 4.5 SEO / `index.html`
Currently only `<title>Shelnet</title>`. Add: meaningful `<title>`, `<meta name="description">`,
Open Graph + Twitter card tags (title/description/image — reuse `src/assets/homepage.png`
or a dedicated OG image), `theme-color`, canonical URL. Keep the existing sitemap/robots.

### 4.6 Copy fixes
- A+ PBQ blurb: fix the double space and reword "…and  suspicious activity."
- Remove the meaningless `SYSTEM_READY: v2.0.4` badge (hero now shows `v3.0` as flavor).
- Verify the footer domain (`SHELNET.ORG`) matches the real domain; align (`shelnet.dev`?).
- Normalize all fake prompts to the single `shelnet:~$` style.

## 5. Components

### 5.1 Boot hero — `src/components/home/HeroSection.jsx` (rewrite)
- Full-viewport black section; green radial glow + scanlines (reduced-motion aware).
- ASCII `SHELNET` banner (desktop) / `SHELNET_` wordmark (<640px) + `v3.0` tagline.
- Auto-typing boot log:
  - `[ OK ] mounting /pbqs … <N> simulations` (N live from manifest), cert-tinted path.
  - Same for `/exams`, `/visualizations`, `/labs` (labs N from `labs.js`).
  - `[ OK ] security: trackers=0  paywall=none  cost=$0.00`
  - `[ feed ] <latest news>` from `useNews` (falls back to existing fallback text).
- Ends on `shelnet login: guest — press [enter] to start` + buttons: `▸ Try a PBQ`
  (scrolls to TUI), `$ man shelnet` (→ About).
- Behavior: types once per session (sessionStorage flag); any key/click/scroll finishes it
  instantly; `prefers-reduced-motion` renders the final state with no animation. Blinking
  `▾ scroll to browse the filesystem` cue at the bottom.
- Retire/repurpose the old `TerminalComponent` (its `useNews` usage migrates into the hero).

### 5.2 Home TUI resource browser — new `src/components/home/ResourceTUI.jsx`
- Replaces the separate `PBQsSection`, `ExamsSection`, `VisualizationsSection`,
  `LabsSection`, `NotesSection` cards on the homepage with one navigable unit.
- Layout: bordered panel; top title bar (`┤ shelnet · ~/resources ├`, dir/file count),
  directory tree (left), contents pane (right), bottom status bar with keyboard hints.
- Directories: `pbqs/`, `exams/`, `visualizations/`, `labs/`, `notes/` with live counts.
- Selecting a directory renders its items (cert-colored) in the right pane; selecting an
  item routes to the existing detail page / external resource.
- Mouse-first; keyboard `↑↓ / enter / /`(search-ready) as enhancement.
- Note: `labs/` continues to surface the existing interactive blueprint cards / lab list;
  the strong existing Labs components are reused inside the contents pane where it makes
  sense, not thrown away.

### 5.3 About / Connect — `AboutSection.jsx` + `ConnectSection.jsx` (restyle, compact)
- One compact strip below the TUI with a **distinct** TUI styling (e.g. a `cat about.md`
  document panel + a `./connect` links panel) so it reads as related-but-different.
- Keep the About story + timeline content (condensed) and the three social links.
- Footer line becomes `shelnet:~$ logout` + copyright.

### 5.4 Inner page workspace — `src/pages/*.jsx` + shared components (rebuild chrome)
- Applies to `a-plus-pbqs`, `security-plus-pbqs`, `a-plus-exams`, `security-plus-exams`,
  `visualizations`.
- Rebuild `PageHeader` + (`PBQSidebar` + `ContentViewer`) into a unified **workspace TUI**:
  - Top **path bar** (`~ / pbqs / a-plus`) + window controls (fullscreen, open-in-new-tab,
    back-to-home).
  - **Explorer** pane (the file list) with active highlight + descriptions.
  - **Viewer** pane: `EXECUTING: <title>` header + the existing iframe (white bg kept
    intentionally) + loading/error/empty states re-skinned.
  - **Status bar** with working keyboard hints.
  - Fullscreen collapses the explorer; mobile collapses it to a top drawer.
- Accent = cert color per page. Reuse existing loading/error/empty logic.

### 5.5 Labs detail — `src/pages/lab-detail.jsx` (wrap, don't rebuild)
- Keep all rich panels (host/components, topology diagram, overview/setup/workflow/
  findings, writeup iframe).
- Wrap in the same outer chrome (path bar `~ / labs / <slug>` + status bar) and normalize
  the accent so it joins the family. Orange stays the labs accent.

### 5.6 Navigation — `src/Layout.jsx` (update)
- Keep fixed nav + mobile drawer. Update link styling to the unified accent/prompt
  language; consider emphasizing primary destinations (PBQs/Exams). Remove binary-rain
  wrapper. Keep scroll-to-top and hash-scroll behavior.

## 6. Data sources
- **Counts:** derive from the manifest `resources` arrays per type (already fetched via
  `manifestService` / `useManifest`) + `labs.length`. Add a small helper/hook to expose
  totals for the hero + TUI; degrade gracefully to `—` if the manifest is unavailable.
- **News:** existing `useNews` / `newsService` feeds the hero `[ feed ]` line.
- No new network calls beyond what exists.

## 7. Accessibility & performance
- `prefers-reduced-motion`: no typing animation, no scanline/bob animation; final states render.
- Keyboard navigation on TUI components; visible focus states; semantic buttons/links so
  content is real DOM (good for SEO + screen readers), not canvas.
- Maintain contrast on the refined palette (check green/cert text on black).
- Remove the per-frame `BinaryRain` canvas (CPU win). Self-host/preload one font; lazy-load
  iframes (already done).

## 8. Responsive
- Hero: ASCII → wordmark under 640px; boot lines shorten (drop dotted leaders).
- Home TUI + inner workspace: two-pane on desktop; explorer collapses to a top drawer on
  mobile, viewer goes full-width.
- About/Connect strip stacks.

## 9. File impact map
**Rewrite:** `HeroSection.jsx`, `Layout.jsx`, `index.html`, `index.css`,
`a-plus-pbqs.jsx`, `security-plus-pbqs.jsx`, `a-plus-exams.jsx`,
`security-plus-exams.jsx`, `visualizations.jsx`, `ContentViewer.jsx`, `PBQSidebar.jsx`,
`PageHeader.jsx`, `AboutSection.jsx`, `ConnectSection.jsx`.
**New:** `ResourceTUI.jsx` (+ small subcomponents), a counts helper/hook, TUI shared
chrome component(s), font assets.
**Update:** `App.jsx` (remove BinaryRain + reorganize sections), `themeColors.js` (green/
global entry), `lab-detail.jsx` (outer chrome).
**Remove:** `BinaryRain.jsx`; retire `TerminalComponent.jsx` and `BrutalHeader.jsx` once
their roles migrate. (Reassess `ScanningWordCloud` — keep as a viz preview or drop.)

## 10. Risks / watch-items
- ASCII banner fragility across fonts/widths → enforce monospace + the wordmark fallback.
- Keyboard nav vs. page scroll conflicts (arrow keys) → scope handlers to focused TUI.
- Iframe white viewer inside a dark TUI → intentional, but verify it reads as "the program."
- Don't regress the strong existing Labs components — reuse, don't rewrite.
- Live counts must degrade gracefully when the manifest fetch fails.

## 11. Out of scope (possible later passes)
- Light mode; full TUI rebuild of the embedded resource HTML; search/`fzf` palette
  (the `/` hint is reserved but search itself can be a follow-up); a dedicated `/about` route.
