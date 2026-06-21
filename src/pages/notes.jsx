// src/pages/notes.jsx
// Inline reader for the live-synced obsidian vault. Embeds the published vault
// in the shell with a permanent "open in new tab" fallback (the published site
// controls whether it can be framed). esc → /resources, o → new tab, f → fullscreen.
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { RESOURCE_TREE } from '../config/resourceTree';

const VAULT_URL =
  RESOURCE_TREE.find((d) => d.key === 'notes')?.items?.[0]?.href
  || 'https://lui-gi.github.io/shelnet-notes/';
const SLATE = '#cbd5e1';

const Notes = () => {
  const navigate = useNavigate();
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | blocked

  // If onLoad never fires, assume the vault refused embedding.
  useEffect(() => {
    const t = setTimeout(() => setStatus((s) => (s === 'loading' ? 'blocked' : s)), 6000);
    return () => clearTimeout(t);
  }, []);

  const openTab = useCallback(() => window.open(VAULT_URL, '_blank', 'noopener,noreferrer'), []);
  const full = useCallback(() => { boxRef.current?.requestFullscreen?.().catch(() => {}); }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'o') { e.preventDefault(); openTab(); }
      else if (e.key === 'f') { e.preventDefault(); full(); }
      else if (e.key === 'Enter') { e.preventDefault(); frameRef.current?.focus(); }
      else if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else { e.preventDefault(); navigate('/resources'); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openTab, full, navigate]);

  return (
    <TerminalShell fill>
      <div className="flex flex-col flex-1 min-h-0 font-mono text-sm">
        <div className="flex items-center justify-between py-2 text-xs shrink-0">
          <span style={{ color: SLATE }}>shelnet-notes <span className="text-emerald-300">● LIVE</span></span>
          <span className="flex items-center gap-3">
            <button type="button" onClick={openTab} className="text-white/55 hover:text-white">↗ open</button>
            <button type="button" onClick={full} className="text-white/55 hover:text-white">⛶ full</button>
          </span>
        </div>
        <div ref={boxRef} className="relative flex-1 min-h-0 bg-white border border-white/10 rounded">
          {status !== 'blocked' ? (
            <iframe ref={frameRef} src={VAULT_URL} title="shelnet-notes"
              className="w-full h-full border-0" onLoad={() => setStatus('ok')} />
          ) : (
            <div className="absolute inset-0 bg-black grid place-items-center text-center text-white/50">
              <div>
                <div style={{ color: SLATE }}>! can't embed the vault here</div>
                <button type="button" onClick={openTab} className="mt-3 hover:underline" style={{ color: '#43c08c' }}>↗ open in new tab</button>
              </div>
            </div>
          )}
        </div>
        <div className="py-2 text-xs text-white/30 shrink-0">esc back · ↵ focus reader · o open · f fullscreen</div>
      </div>
    </TerminalShell>
  );
};

export default Notes;
