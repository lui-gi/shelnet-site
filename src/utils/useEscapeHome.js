// src/utils/useEscapeHome.js
// Wires the global `esc → cd ~` affordance (advertised in the BottomBar) on
// otherwise-static pages that have no key handling of their own. Ignores Esc
// while typing in a form field.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useEscapeHome() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}
