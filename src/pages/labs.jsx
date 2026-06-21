// src/pages/labs.jsx
// Interim "build in progress" screen for /resources/labs. The labs section is
// being rebuilt as a self-contained showcase; this keeps the shell + orange
// accent and teases the revamp. esc → /resources, ↵ → /connect.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { COMING_LABS } from '../config/labsShowcase';

const ORANGE = '#fb923c';
const Mark = ({ label, color }) => (
  <span><span className="text-white/30">[</span><span style={{ color }}>{label}</span><span className="text-white/30">]</span></span>
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
        <div className="text-white/30 mb-4">SHELNET GNU/Linux 3.0 LTS · tty3 · 80×24</div>
        <div className="text-white/70">
          <span style={{ color: '#7e9b86' }}>guest@shelnet</span>:<span style={{ color: '#43c08c' }}>~/resources/labs</span>$ make showcase
        </div>
        <div className="mt-2 space-y-1 text-white/65">
          <div><Mark label="  ok  " color="#7e9b86" /> archiving old lab specs &amp; writeups</div>
          <div><Mark label="  ok  " color="#7e9b86" /> tearing down embedded iframes</div>
          <div><Mark label=" wip  " color={ORANGE} /> rebuilding labs as a curated showcase</div>
        </div>
        <div className="mt-3 text-white/40">
          <span style={{ color: ORANGE }}>▓▓▓▓▓▓▓▓▓</span><span className="text-white/20">░░░░░░░░░░░░░░░░░░░░░</span> ~30% · compiling
        </div>

        <div className="mt-6 pl-4" style={{ borderLeft: `2px solid ${ORANGE}` }}>
          <div className="font-semibold" style={{ color: ORANGE }}>labs/ — under construction</div>
          <p className="mt-2 text-white/70">A curated showcase of the labs I've built, and why each one matters if you're breaking into cybersecurity.</p>
          <div className="mt-3 text-white/40">coming&nbsp;&nbsp;<span className="text-white/60">{COMING_LABS.join(' · ')}</span></div>
        </div>

        <div className="mt-6 text-white/40">
          ‹ <button type="button" onClick={() => navigate('/resources')} style={{ color: '#43c08c' }} className="hover:underline">esc</button> back to /resources ›
          &nbsp;·&nbsp;
          <button type="button" onClick={() => navigate('/connect')} style={{ color: '#43c08c' }} className="hover:underline">↵ get notified → /connect</button>
        </div>
      </div>
    </TerminalShell>
  );
};

export default Labs;
