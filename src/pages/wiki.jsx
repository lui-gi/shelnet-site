// src/pages/wiki.jsx
// Interim "build in progress" screen for /wiki, the section that replaces the
// old /about page. Keeps the bare-TTY shell with a purple accent and teases the
// writeups/guides knowledge base still being written. esc → home, ↵ → /connect.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { Panel, ProgressBar } from '../components/tui/ascii';
import { ACCENTS, SHELL } from '../config/theme';

const PURPLE = ACCENTS.purple.hex;
const GREEN = SHELL.green;

// figlet "standard" font, matching the hero banner's typeface.
const WIKI_ART = String.raw`__        __ _  _     _
\ \      / /(_)| | __(_)
 \ \ /\ / / | || |/ /| |
  \ V  V /  | ||   < | |
   \_/\_/   |_||_|\_\|_|`;

const Mark = ({ label, color }) => (
  <span><span className="text-white/30">[</span><span style={{ color }} className="whitespace-pre">{label}</span><span className="text-white/30">]</span></span>
);

const Wiki = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/'); }
      else if (e.key === 'Enter') { e.preventDefault(); navigate('/connect'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <TerminalShell maxWidthClass="max-w-2xl">
      <div className="font-mono text-sm leading-relaxed">
        <div className="text-white/30 mb-3">SHELNET GNU/Linux 3.0 LTS · tty3 · 80×24</div>

        <pre aria-label="wiki" className="mb-4 whitespace-pre text-[10px] leading-[1.1] sm:text-xs"
             style={{ color: PURPLE, textShadow: '0 0 8px rgba(192,132,252,.25)' }}>{WIKI_ART}</pre>

        <div className="text-white/70">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/wiki</span>$ make build
        </div>
        <div className="mt-2 space-y-1 text-white/55">
          <div><Mark label="  ok  " color={SHELL.dim} /> cloning notes &amp; writeups</div>
          <div><Mark label="  ok  " color={SHELL.dim} /> mounting markdown renderer</div>
          <div><Mark label=" wip  " color={PURPLE} /> indexing writeups &amp; guides</div>
          <div><Mark label=" .... " color={PURPLE} /> compiling cheatsheets &amp; walkthroughs</div>
        </div>
        <div className="mt-3 text-white/40">
          <ProgressBar pct={25} hex={PURPLE} width={24} /> &nbsp;~25% · compiling
        </div>

        <div className="mt-5">
          <Panel
            hex={PURPLE}
            title={<><span style={{ color: PURPLE }}>wiki/</span> <span className="text-white/30">under construction</span></>}
          >
            <div className="py-1 text-white/70">
              <p>Writeups, guides, and more: a growing knowledge base for breaking into cybersecurity, written as I learn it.</p>
              <div className="mt-3 flex gap-2">
                <span className="text-white/30 shrink-0">coming</span>
                <span className="text-white/55">writeups · guides · cheatsheets · walkthroughs</span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-5 text-white/40">
          <span className="text-white/20">‹</span> <button type="button" onClick={() => navigate('/')} style={{ color: GREEN }} className="hover:underline">esc</button> back to home <span className="text-white/20">›</span>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <button type="button" onClick={() => navigate('/connect')} className="hover:text-white"><span style={{ color: GREEN }}>↵</span> get notified → <span style={{ color: GREEN }}>/connect</span></button>
        </div>
        <div className="mt-3 text-white/70">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:<span style={{ color: GREEN }}>~/wiki</span>$
          <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse reduce-static" style={{ backgroundColor: PURPLE }} aria-hidden="true" />
        </div>
      </div>
    </TerminalShell>
  );
};

export default Wiki;
