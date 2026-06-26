// src/pages/bytes.jsx
// bytes cert picker: one framed panel per cert that has a question bank. Select
// a track to start the endless rapid-fire quiz at /bytes/<slug>. Mobile-first,
// reusing the resource pages' framed-ASCII vocabulary.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { Panel, Bracket, Rule } from '../components/tui/ascii';
import { useManifest } from '../utils/useManifest';
import { getBytesCerts } from '../utils/manifestService';
import { ACCENTS, SHELL } from '../config/theme';

const GREEN = SHELL.green;
const BOX_OPEN = 'rgba(255,255,255,0.22)';

const hexOf = (accent) => (ACCENTS[accent] || ACCENTS.green).hex;

// Short bracket tag from a cert label: "CompTIA A+" -> "A+", "Security+" -> "S+",
// "CySA+" -> "CS+" (up to two leading capitals/digits of the plus-word).
const tagOf = (label = '') => {
  const t = label.split(/\s+/).find((w) => w.endsWith('+'));
  if (t) {
    if (t.length <= 2) return t;
    const caps = t.replace(/\+$/, '').match(/[A-Z0-9]/g) || [];
    return `${caps.length >= 2 ? caps.slice(0, 2).join('') : t[0]}+`;
  }
  return label.slice(0, 2).toUpperCase();
};

const Bytes = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useManifest();
  const banks = manifest ? getBytesCerts(manifest) : [];

  const [sel, setSel] = useState(0);
  const selected = banks[sel] || null;

  const start = useCallback((slug) => navigate(`/bytes/${slug}`), [navigate]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/'); return; }
      if (!banks.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((n) => (n + 1) % banks.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((n) => (n - 1 + banks.length) % banks.length); }
      else if (e.key === 'Enter' && selected) { e.preventDefault(); start(selected.slug); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [banks.length, selected, start, navigate]);

  if (loading) {
    return <TerminalShell><div className="font-mono text-sm text-white/50">{'…'} fetching questions</div></TerminalShell>;
  }
  if (error) {
    return (
      <TerminalShell>
        <div className="font-mono text-sm">
          <div className="text-rose-400">! manifest unreachable: no banks to show.</div>
          <div className="mt-2 text-white/40">
            <button type="button" onClick={() => window.location.reload()} style={{ color: GREEN }} className="hover:underline">{'↵'} retry</button>
            &nbsp;&middot;&nbsp;
            <button type="button" onClick={() => navigate('/')} style={{ color: GREEN }} className="hover:underline">esc home</button>
          </div>
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell maxWidthClass="max-w-2xl">
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/40 mb-4">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~</span>$ cd bytes
        </div>
        <div className="flex items-baseline justify-between text-white/40 mb-3">
          <span>bytes/: rapid-fire practice; pick a track</span>
          <span className="text-white/30">{banks.length} bank{banks.length === 1 ? '' : 's'}</span>
        </div>

        {banks.length === 0 ? (
          <div className="text-white/55">
            No question banks yet.{' '}
            <button type="button" onClick={() => navigate('/connect')} className="hover:text-white">
              <span style={{ color: GREEN }}>{'↵'}</span> get notified {'→'} <span style={{ color: GREEN }}>/connect</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {banks.map((b, idx) => {
              const hex = hexOf(b.accent);
              const tag = tagOf(b.label);
              const on = idx === sel;
              return (
                <button key={b.slug} type="button" onClick={() => { setSel(idx); start(b.slug); }} onMouseEnter={() => setSel(idx)} className="block w-full text-left">
                  <Panel
                    hex={on ? hex : BOX_OPEN}
                    marker={on ? '▸' : null}
                    title={<><Bracket hex={hex}>{tag}</Bracket> <span style={{ color: hex }} className="font-semibold">{b.label}</span></>}
                    right={<span className="text-white/40">{b.code}</span>}
                  >
                    {b.blurb && <div className="text-white/70">{b.blurb}</div>}
                    <div className="text-white/55">{b.count} questions <span className="text-white/30">&middot;</span> instant feedback</div>
                  </Panel>
                </button>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="mt-6">
            <Rule hex="rgba(255,255,255,0.18)" />
            <div className="mt-1 text-white/60 flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="text-white/40">sel <span style={{ color: hexOf(selected.accent) }}>[{tagOf(selected.label)}]</span></span>
              <button type="button" onClick={() => start(selected.slug)} className="hover:text-white"><span style={{ color: GREEN }}>{'↵'}</span> start</button>
            </div>
          </div>
        )}
      </div>
    </TerminalShell>
  );
};

export default Bytes;
