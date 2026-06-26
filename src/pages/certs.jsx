// src/pages/certs.jsx
// Cert study console: one framed-ASCII study-station panel per cert (blurb +
// topic preview), selection-driven, with a single global action bar. Locked
// certs render dim and are not selectable. Actions open the existing CertDashboard.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { Panel, Bracket, Rule } from '../components/tui/ascii';
import { useManifest } from '../utils/useManifest';
import { getCerts } from '../utils/manifestService';
import { ACCENTS, SHELL } from '../config/theme';

const PREVIEW = 3;
const GREEN = SHELL.green;
const BOX_SEL = (hex) => hex;
const BOX_OPEN = 'rgba(255,255,255,0.22)';
const BOX_LOCK = 'rgba(255,255,255,0.14)';

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

const topicLine = (titles) => {
  if (!titles.length) return '-';
  const head = titles.slice(0, PREVIEW).join(' · ');
  const extra = titles.length - PREVIEW;
  return extra > 0 ? `${head} +${extra}` : head;
};

const Certs = () => {
  const navigate = useNavigate();
  const { manifest, loading, error } = useManifest();
  const certs = manifest ? getCerts(manifest) : [];
  const open = certs.filter((c) => !c.locked);

  const [sel, setSel] = useState(0);
  const selected = open[sel] || null;

  const openDash = useCallback((slug, focus) => {
    navigate(`/resources/certs/${slug}${focus ? `?focus=${focus}` : ''}`);
  }, [navigate]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/resources'); return; }
      if (!open.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((n) => (n + 1) % open.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((n) => (n - 1 + open.length) % open.length); }
      else if (e.key === 'Enter' && selected) { e.preventDefault(); openDash(selected.slug); }
      else if (e.key === 'p' && selected) { e.preventDefault(); openDash(selected.slug, 'pbqs'); }
      else if (e.key === 'e' && selected) { e.preventDefault(); openDash(selected.slug, 'exams'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open.length, selected, openDash, navigate]);

  if (loading) {
    return <TerminalShell><div className="font-mono text-sm text-white/50">… fetching manifest</div></TerminalShell>;
  }
  if (error || !certs.length) {
    return (
      <TerminalShell>
        <div className="font-mono text-sm">
          <div className="text-rose-400">! manifest unreachable: no tracks to show.</div>
          <div className="mt-2 text-white/40">
            <button type="button" onClick={() => window.location.reload()} style={{ color: GREEN }} className="hover:underline">↵ retry</button>
            &nbsp;·&nbsp;
            <button type="button" onClick={() => navigate('/resources')} style={{ color: GREEN }} className="hover:underline">esc home</button>
          </div>
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell maxWidthClass="max-w-3xl">
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/40 mb-4">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~</span>$ cd resources/certs
        </div>
        <div className="flex items-baseline justify-between text-white/40 mb-3">
          <span>certs/: pick a track, jump to PBQs &amp; mock exams</span>
          <span className="text-white/30">{open.length} track{open.length === 1 ? '' : 's'}</span>
        </div>

        <div className="space-y-4">
          {certs.map((c) => {
            const hex = hexOf(c.accent);
            const tag = tagOf(c.label);
            if (c.locked) {
              return (
                <Panel
                  key={c.slug}
                  hex={BOX_LOCK}
                  title={<><Bracket hex={hex} dim>{tag}</Bracket> <span className="text-white/40">{c.label}</span> <span className="text-white/20">··· locked ···</span></>}
                  right={<span className="text-white/40">{c.code || '-'}</span>}
                >
                  <div className="text-white/40">{c.blurb || 'Coming soon.'}</div>
                </Panel>
              );
            }
            const openIdx = open.indexOf(c);
            const on = openIdx === sel;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => { setSel(openIdx); openDash(c.slug); }}
                onMouseEnter={() => setSel(openIdx)}
                className="block w-full text-left"
              >
                <Panel
                  hex={on ? BOX_SEL(hex) : BOX_OPEN}
                  marker={on ? '▸' : null}
                  title={<><Bracket hex={hex}>{tag}</Bracket> <span style={{ color: hex }} className="font-semibold">{c.label}</span></>}
                  right={<span className="text-white/40">{c.code}</span>}
                >
                  {c.blurb && <div className="text-white/70">{c.blurb}</div>}
                  <div className="text-white/55">pbqs <span style={{ color: GREEN }}>▸</span> {topicLine(c.pbqTitles)}</div>
                  <div className="text-white/55">exams <span style={{ color: GREEN }}>▸</span> {topicLine(c.examTitles)}</div>
                </Panel>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-6">
            <Rule hex="rgba(255,255,255,0.18)" />
            <div className="mt-1 text-white/60 flex flex-wrap items-center gap-x-5 gap-y-1">
              <span className="text-white/40">sel <span style={{ color: hexOf(selected.accent) }}>[{tagOf(selected.label)}]</span></span>
              <button type="button" onClick={() => openDash(selected.slug)} className="hover:text-white"><span style={{ color: GREEN }}>↵</span> dashboard</button>
              <button type="button" onClick={() => openDash(selected.slug, 'pbqs')} className="hover:text-white"><span style={{ color: GREEN }}>p</span> pbqs</button>
              <button type="button" onClick={() => openDash(selected.slug, 'exams')} className="hover:text-white"><span style={{ color: GREEN }}>e</span> mock exam</button>
            </div>
          </div>
        )}
      </div>
    </TerminalShell>
  );
};

export default Certs;
