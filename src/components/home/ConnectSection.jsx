// src/components/home/ConnectSection.jsx
import { Youtube, Linkedin, Mail } from 'lucide-react';
import TerminalShell from '../tui/TerminalShell';
import { SITE } from '../../config/theme';
import { useEscapeHome } from '../../utils/useEscapeHome';

const LINKS = [
  { Icon: Youtube,  label: 'YouTube',  desc: 'Video explanations of PBQs & visualizations', href: 'https://youtube.com/@Shelnet',                       hover: 'hover:border-red-500/50 hover:bg-red-900/10',  cta: 'text-red-400' },
  { Icon: Linkedin, label: 'LinkedIn', desc: 'Connect with me',                              href: 'https://linkedin.com/in/luigi-fernandez-502647333', hover: 'hover:border-blue-500/50 hover:bg-blue-900/10', cta: 'text-blue-400' },
  { Icon: Mail,     label: 'Email',    desc: 'Resource requests or business inquiries',      href: 'https://forms.gle/WRM23ktXNZiupPaZA',               hover: 'hover:border-white/50 hover:bg-white/5',       cta: 'text-white/70' },
];

const ConnectSection = () => {
  useEscapeHome();
  return (
  <TerminalShell maxWidthClass="max-w-3xl">
    <div className="grid sm:grid-cols-3 gap-3">
      {LINKS.map((link) => {
        const { Icon, label, desc, href, hover, cta } = link;
        return (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
           className={`group border border-white/10 bg-white/[0.02] p-5 transition-colors ${hover}`}>
          <Icon className="text-white mb-3" size={22} />
          <div className="text-white font-bold mb-1">{label}</div>
          <div className="text-white/50 text-xs mb-3">{desc}</div>
          <div className={`text-[11px] font-mono ${cta}`}>open →</div>
        </a>
        );
      })}
    </div>

    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between text-white/30 text-xs font-mono">
      <span>© {new Date().getFullYear()} {SITE.domain}</span>
      <span style={{ color: '#43c08c' }}>guest@shelnet:~$ logout</span>
    </div>
  </TerminalShell>
  );
};

export default ConnectSection;
