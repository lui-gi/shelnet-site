// src/pages/labs.jsx
// Interim "build in progress" screen for /resources/labs. The labs section is
// being rebuilt as a self-contained showcase; this keeps the shell + orange
// accent and teases the revamp. esc → /resources, ↵ → /connect.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { Panel, ProgressBar } from '../components/tui/ascii';
import { COMING_LABS } from '../config/labsShowcase';
import { SHELL } from '../config/theme';

const ORANGE = '#fb923c';
const GREEN = SHELL.green;

const Mark = ({ label, color }) => (
  <span><span className="text-white/30">[</span><span style={{ color }} className="whitespace-pre">{label}</span><span className="text-white/30">]</span></span>
);

const Labs = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/resources'); }
      else if (e.key === 'Enter') { e.preventDefault(); navigate('/connect'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <TerminalShell maxWidthClass="max-w-2xl">
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/30 mb-3">SHELNET GNU/Linux 3.0 LTS · tty3 · 80×24</div>
        <div className="text-white/70">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/resources/labs</span>$ make showcase
        </div>
        <div className="mt-2 space-y-1 text-white/55">
          <div><Mark label="  ok  " color={SHELL.dim} /> archiving old lab specs &amp; writeups</div>
          <div><Mark label="  ok  " color={SHELL.dim} /> tearing down embedded iframes</div>
          <div><Mark label=" wip  " color={ORANGE} /> rebuilding labs as a curated showcase</div>
          <div><Mark label=" .... " color={ORANGE} /> writing "why this matters" for each build</div>
        </div>
        <div className="mt-3 text-white/40">
          <ProgressBar pct={30} hex={ORANGE} width={24} /> &nbsp;~30% · compiling
        </div>

        <div className="mt-5">
          <Panel
            hex={ORANGE}
            title={<><span style={{ color: ORANGE }}>labs/</span> <span className="text-white/30">under construction</span></>}
          >
            <div className="py-1 text-white/70">
              <p>A curated showcase of the labs I&apos;ve built, and why each one matters if you&apos;re breaking into cybersecurity.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-white/30 shrink-0">coming</span>
                <span className="text-white/55">{COMING_LABS.join(' · ')}</span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-5 text-white/40">
          <span className="text-white/20">‹</span> <button type="button" onClick={() => navigate('/resources')} style={{ color: GREEN }} className="hover:underline">esc</button> back to /resources <span className="text-white/20">›</span>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <button type="button" onClick={() => navigate('/connect')} className="hover:text-white"><span style={{ color: GREEN }}>↵</span> get notified → <span style={{ color: GREEN }}>/connect</span></button>
        </div>
        <div className="mt-3 text-white/70">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/resources/labs</span>$
          <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse reduce-static" style={{ backgroundColor: ORANGE }} aria-hidden="true" />
        </div>
      </div>
    </TerminalShell>
  );
};

export default Labs;
