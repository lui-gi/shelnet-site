// src/utils/useRoomTheme.js
// Room-scoped light/dark theme. Persisted in localStorage; consumed by Room.jsx
// which sets the returned CSS custom properties on its root so the whole subtree
// (lesson card, section rail, blocks, checkpoint, lab stage, terminal) reads
// off the same tokens. Category accents pass through untouched.
import { useCallback, useEffect, useState } from 'react';

export const ROOM_THEME_KEY = 'shelnet_room_theme';

const readInitial = () => {
  try {
    return localStorage.getItem(ROOM_THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

export function useRoomTheme() {
  const [theme, setTheme] = useState(readInitial);
  useEffect(() => {
    try { localStorage.setItem(ROOM_THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);
  const toggle = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );
  return { theme, toggle, isLight: theme === 'light' };
}

// Token maps consumed as inline style on the Room root. Keeping them here means
// Room.jsx stays readable and future theme tweaks land in one place.
export const THEME_VARS = {
  dark: {
    '--room-bg':          '#000000',
    '--card-bg':          '#1e2029',
    '--card-border':      'rgba(255,255,255,0.14)',
    '--card-head-bg':     'rgba(255,255,255,0.02)',
    '--card-head-border': 'rgba(255,255,255,0.08)',
    '--text':             'rgba(255,255,255,0.85)',
    '--text-strong':      'rgba(255,255,255,0.96)',
    '--text-mute':        'rgba(255,255,255,0.55)',
    '--text-dim':         'rgba(255,255,255,0.40)',
    '--code-bg':          'rgba(255,255,255,0.08)',
    '--block-bg':         'rgba(0,0,0,0.40)',
    '--block-border':     'rgba(255,255,255,0.08)',
    '--stage-bg':         '#000000',
    '--stage-border':     'rgba(255,255,255,0.10)',
    '--stage-head-bg':    'rgba(255,255,255,0.02)',
    '--stage-head-border':'rgba(255,255,255,0.08)',
    '--stage-head-text':  'rgba(255,255,255,0.92)',
    '--stage-head-sub':   'rgba(255,255,255,0.50)',
    '--stage-text':       'rgba(255,255,255,0.72)',
    '--stage-prompt':     'rgba(255,255,255,0.55)',
    '--stage-cmd':        'rgba(255,255,255,0.95)',
    '--cursor':           'rgba(255,255,255,0.85)',
    '--toggle-bg':        'rgba(255,255,255,0.05)',
    '--toggle-border':    'rgba(255,255,255,0.15)',
    '--toggle-text':      'rgba(255,255,255,0.75)',
    '--traffic-dot':      'rgba(255,255,255,0.15)',
    '--input-bg':         'rgba(0,0,0,0.40)',
    '--input-border':     'rgba(255,255,255,0.15)',
  },
  light: {
    // Outer gutter stays dark so the light cards read as floating tiles with
    // visible rounded corners; only the cards + stage flip to light.
    '--room-bg':          '#000000',
    '--card-bg':          '#f0f1f4',
    '--card-border':      'rgba(20,22,28,0.12)',
    '--card-head-bg':     '#e6e8ec',
    '--card-head-border': 'rgba(20,22,28,0.08)',
    '--text':             'rgba(20,22,28,0.90)',
    '--text-strong':      'rgba(20,22,28,1.00)',
    '--text-mute':        'rgba(20,22,28,0.62)',
    '--text-dim':         'rgba(20,22,28,0.42)',
    '--code-bg':          'rgba(20,22,28,0.08)',
    '--block-bg':         '#ffffff',
    '--block-border':     'rgba(20,22,28,0.10)',
    '--stage-bg':         '#ffffff',
    '--stage-border':     'rgba(20,22,28,0.12)',
    '--stage-head-bg':    '#f6f7f9',
    '--stage-head-border':'rgba(20,22,28,0.08)',
    '--stage-head-text':  'rgba(20,22,28,0.95)',
    '--stage-head-sub':   'rgba(20,22,28,0.50)',
    '--stage-text':       'rgba(20,22,28,0.78)',
    '--stage-prompt':     'rgba(20,22,28,0.55)',
    '--stage-cmd':        'rgba(20,22,28,0.95)',
    '--cursor':           'rgba(20,22,28,0.85)',
    '--toggle-bg':        'rgba(20,22,28,0.05)',
    '--toggle-border':    'rgba(20,22,28,0.12)',
    '--toggle-text':      'rgba(20,22,28,0.70)',
    '--traffic-dot':      'rgba(20,22,28,0.15)',
    '--input-bg':         '#ffffff',
    '--input-border':     'rgba(20,22,28,0.15)',
  },
};
