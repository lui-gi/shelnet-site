// src/pages/notes.jsx
// Inline reader for the live-synced obsidian vault: the published vault embedded
// inside a drawn slate ┌──┐ frame, with a permanent "open in new tab" fallback
// (the published site controls whether it can be framed). esc → /resources,
// o → new tab, f → fullscreen.
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { Frame } from '../components/tui/ascii';
import { RESOURCE_TREE } from '../config/resourceTree';
import { SHELL } from '../config/theme';

const VAULT_URL =
  RESOURCE_TREE.find((d) => d.key === 'notes')?.items?.[0]?.href
  || 'https://lui-gi.github.io/shelnet-notes/';
const SLATE = '#cbd5e1';
const GREEN = SHELL.green;

const Notes = () => {
  const navigate = useNavigate();
  const frameRef = useRef(null);
  const boxRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ok | blocked
  const [reloadKey, setReloadKey] = useState(0);

  // If onLoad never fires, assume the vault refused embedding. The timer
  // restarts whenever reloadKey changes (retry); status is reset in the handler.
  useEffect(() => {
    const t = setTimeout(() => setStatus((s) => (s === 'loading' ? 'blocked' : s)), 6000);
    return () => clearTimeout(t);
  }, [reloadKey]);

  const openTab = useCallback(() => window.open(VAULT_URL, '_blank', 'noopener,noreferrer'), []);
  const full = useCallback(() => { boxRef.current?.requestFullscreen?.().catch(() => {}); }, []);
  const retry = useCallback(() => { setStatus('loading'); setReloadKey((k) => k + 1); }, []);

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

  const header = (
    <div className="flex items-center justify-between py-2 text-xs" style={{ color: SLATE }}>
      <span>shelnet-notes <span className="text-emerald-300">● LIVE</span></span>
      <span className="flex items-center gap-3">
        <button type="button" onClick={openTab} className="text-white/55 hover:text-white">↗ open</button>
        <button type="button" onClick={full} className="text-white/55 hover:text-white">⛶ full</button>
      </span>
    </div>
  );

  const footer = (
    <div className="py-2 text-xs text-white/30">esc back · ↵ focus reader · o open · f fullscreen</div>
  );

  return (
    <TerminalShell fill>
      <div ref={boxRef} className="flex flex-col flex-1 min-h-0 font-mono text-sm">
        <Frame hex={SLATE} header={header} footer={footer} className="flex-1">
          {status !== 'blocked' ? (
            <iframe
              key={reloadKey}
              ref={frameRef}
              src={VAULT_URL}
              title="shelnet-notes"
              className="w-full h-full border-0 bg-white"
              onLoad={() => setStatus('ok')}
            />
          ) : (
            <div className="h-full bg-black grid place-items-center text-center text-white/50">
              <div>
                <div style={{ color: SLATE }}>! can&apos;t embed the vault here</div>
                <div className="text-white/40 text-xs mt-1">(frame policy or load error)</div>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button type="button" onClick={openTab} className="hover:underline" style={{ color: GREEN }}>↗ open in new tab</button>
                  <button type="button" onClick={retry} className="hover:underline" style={{ color: GREEN }}>↵ retry</button>
                </div>
              </div>
            </div>
          )}
        </Frame>
      </div>
    </TerminalShell>
  );
};

export default Notes;
