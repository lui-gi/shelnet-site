# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shelnet is a cybersecurity education platform providing free CompTIA certification resources (A+ and Security+). The site features interactive Performance Based Questions (PBQs) and full-length mock exams, all running client-side with zero tracking.

**Mission**: Learn cybersecurity and share the journey completely free.
**Philosophy**: Always free, no data collection, no logins, no paywalls.

## Development Commands

```bash
# Development server (runs on http://localhost:5173 by default)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Deploy to GitHub Pages
npm run deploy
```

## Tech Stack

- **Framework**: React 19 with Vite 7
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Icons**: lucide-react
- **Deployment**: GitHub Pages (via gh-pages package)

## Project Structure

```
src/
├── main.jsx              # App entry point with React Router setup
├── Layout.jsx            # Shared layout with navigation bar
├── App.jsx               # Home page with hero, features, binary rain animation
├── index.css             # Global CSS imports
└── pages/
    ├── a-plus-pbqs.jsx         # A+ PBQ viewer with sidebar + iframe
    ├── APlusExams.jsx          # A+ exam viewer
    ├── SecurityPlusPBQs.jsx    # Security+ PBQ viewer
    └── SecurityPlusExams.jsx   # Security+ exam viewer

public/
├── a-pbqs/               # Standalone HTML simulations for A+ PBQs
├── a-exams/              # Standalone HTML for A+ exams
└── _redirects            # Netlify/hosting redirects for SPA routing
```

## Architecture

### Routing Architecture

The app uses a layout-based routing pattern:
- `Layout.jsx` provides the persistent navigation bar across all pages
- All routes render as children of `<Layout>` via `<Outlet />`
- Navigation uses hash anchors (`/#pbqs`, `/#exams`, `/#about`) for same-page sections on home
- Page routes use standard paths (`/a-plus-pbqs`, `/security-plus-exams`, etc.)

### PBQ & Exam System

**PBQ Pages** (`a-plus-pbqs.jsx`, `SecurityPlusPBQs.jsx`):
- Sidebar list of simulations with metadata (title, description)
- Each PBQ is a standalone HTML file loaded in an iframe
- Fullscreen toggle for distraction-free practice
- "Open in new tab" option for independent windows

**Exam Pages** (`APlusExams.jsx`, `SecurityPlusExams.jsx`):
- Similar structure to PBQ pages
- Load full 90-question HTML-based exams

**Content Location**:
- All interactive content (PBQs/exams) lives in `/public/` as standalone HTML files
- These files are completely self-contained and client-side only

### Home Page Components

`App.jsx` contains several key sections:
1. **Binary Rain Animation**: Canvas-based "Matrix" effect using binary digits
2. **Hero Section**: Terminal-style introduction with animated typing
3. **Features Grid**: Displays PBQs, exams, and resources
4. **About Section**: Philosophy and privacy commitment
5. **Footer**: Social links (YouTube, LinkedIn, contact form)

### Styling Patterns

- Dark theme (black background) with green accents (`#00ff00`, green-400/500)
- Brutalist design with sharp borders, uppercase headers, monospace fonts
- Grid background patterns with low opacity for visual depth
- Consistent use of `border-white/10` for subtle dividers
- Animation: pulse effects, hover transitions, binary rain

## Key Implementation Details

### Navigation Behavior
- The navbar is fixed with scroll-based styling changes (transparency → backdrop blur)
- Hash anchors work from any page via `href="/#section"`
- Back buttons use React Router's `<Link to="/">`

### Content Management
When adding new PBQs or exams:
1. Create the standalone HTML file in `/public/a-pbqs/` or `/public/a-exams/`
2. Update the `pbqs` or `exams` array in the corresponding page component
3. Use relative paths for A+ (`./a-pbqs/file.html`) and absolute paths for Security+ (`/security-pbqs/file.html`)

### ESLint Configuration
- React Hooks and React Refresh plugins enabled
- Custom rule: `no-unused-vars` ignores uppercase/constant patterns
- Uses flat config format (ESLint 9+)

## Deployment Notes

- `npm run deploy` builds and pushes to the `gh-pages` branch
- The site is deployed at shelnet.org (configured via GitHub Pages)
- `public/_redirects` handles SPA routing for hosting platforms
- All assets must be in `/public/` to be accessible in production

## Important Conventions

1. **File naming**: PBQ pages use kebab-case for A+ (`a-plus-pbqs.jsx`) and PascalCase for Security+ (`SecurityPlusPBQs.jsx`)
2. **Component structure**: All page components are self-contained with embedded data arrays
3. **Icons**: Import from `lucide-react` - commonly used: Terminal, Shield, Monitor, Award
4. **No backend**: Everything runs client-side; no API calls or server logic
5. **Privacy first**: No analytics, no external tracking scripts, no cookies
