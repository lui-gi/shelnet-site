// src/utils/useEscapeHome.js
// Wires the global `esc → cd ../` affordance (advertised by the PromptBar
// button) on otherwise-static pages that have no key handling of their own.
// Ignores Esc while typing in a form field. At `/` this is a no-op.
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { segmentsForPath, routeForSegments } from '../config/resourcePaths';

export function useEscapeHome() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const segments = segmentsForPath(pathname);
      if (segments.length === 0) return;
      const parent = segments.length === 1 ? '/' : routeForSegments(segments.slice(0, -1));
      navigate(parent);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, pathname]);
}
