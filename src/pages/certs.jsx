// src/pages/certs.jsx
// Cert study console: one study-station panel per cert (blurb + topic preview),
// selection-driven, with a single global action bar. Locked certs render dim and
// are not selectable. Actions open the existing CertDashboard.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { useManifest } from '../utils/useManifest';
import { getCerts } from '../utils/manifestService';
import { ACCENTS } from '../config/theme';

const PREVIEW = 3;
const hexOf = (accent) => (ACCENTS[accent] || ACCENTS.green).hex;
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
            <button type="button" onClick={() => window.location.reload()} style={{ color: '#43c08c' }} className="hover:underline">↵ retry</button>
            &nbsp;·&nbsp;
            <button type="button" onClick={() => navigate('/resources')} style={{ color: '#43c08c' }} className="hover:underline">esc home</button>
          </div>
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell maxWidthClass="max-w-3xl">
      <div className="font-mono text-sm">
        <div className="text-white/40 mb-4">
          certs/: pick a track, jump to PBQs &amp; mock exams · {open.length} track{open.length === 1 ? '' : 's'}
        </div>

        <div className="space-y-4">
          {certs.map((c) => {
            const hex = hexOf(c.accent);
            if (c.locked) {
              return (
                <div key={c.slug} className="pl-3" style={{ borderLeft: '2px solid rgba(255,255,255,0.12)' }}>
                  <div className="text-white/40">[{c.code || '-'}] {c.label} · locked</div>
                  {c.blurb && <div className="text-white/30">{c.blurb}</div>}
                </div>
              );
            }
            const openIdx = open.indexOf(c);
            const on = openIdx === sel;
            return (
              <button key={c.slug} type="button"
                onClick={() => { setSel(openIdx); openDash(c.slug); }}
                onMouseEnter={() => setSel(openIdx)}
                className="block w-full text-left pl-3"
                style={{ borderLeft: `2px solid ${on ? hex : 'rgba(255,255,255,0.12)'}`, background: on ? 'rgba(255,255,255,0.03)' : undefined }}>
                <div className="flex items-baseline gap-2">
                  <span style={{ color: hex }}>{on ? '▸' : ' '}</span>
                  <span style={{ color: hex }} className="font-semibold">{c.label}</span>
                  <span className="text-white/40 ml-auto">{c.code}</span>
                </div>
                {c.blurb && <div className="text-white/70 mt-1">{c.blurb}</div>}
                <div className="text-white/55 mt-1">pbqs <span style={{ color: hex }}>▸</span> {topicLine(c.pbqTitles)}</div>
                <div className="text-white/55">exams <span style={{ color: hex }}>▸</span> {topicLine(c.examTitles)}</div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-6 pt-3 border-t border-white/10 text-white/60 flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="text-white/40">sel <span style={{ color: hexOf(selected.accent) }}>[{selected.code || selected.label}]</span></span>
            <button type="button" onClick={() => openDash(selected.slug)} className="hover:text-white"><span style={{ color: '#43c08c' }}>↵</span> dashboard</button>
            <button type="button" onClick={() => openDash(selected.slug, 'pbqs')} className="hover:text-white"><span style={{ color: '#43c08c' }}>p</span> pbqs</button>
            <button type="button" onClick={() => openDash(selected.slug, 'exams')} className="hover:text-white"><span style={{ color: '#43c08c' }}>e</span> mock exam</button>
          </div>
        )}
      </div>
    </TerminalShell>
  );
};

export default Certs;
