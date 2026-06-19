// src/components/home/ConnectSection.jsx
import { Youtube, Linkedin, Mail } from 'lucide-react';
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';
import { PROMPT, SITE } from '../../config/theme';

const LINKS = [
  { Icon: Youtube,  label: 'YouTube',  desc: 'Video explanations of PBQs & visualizations', href: 'https://youtube.com/@Shelnet',                       hover: 'hover:border-red-500/50 hover:bg-red-900/10',  cta: 'text-red-400' },
  { Icon: Linkedin, label: 'LinkedIn', desc: 'Connect with me',                              href: 'https://linkedin.com/in/luigi-fernandez-502647333', hover: 'hover:border-blue-500/50 hover:bg-blue-900/10', cta: 'text-blue-400' },
  { Icon: Mail,     label: 'Email',    desc: 'Resource requests or business inquiries',      href: 'https://forms.gle/WRM23ktXNZiupPaZA',               hover: 'hover:border-white/50 hover:bg-white/5',       cta: 'text-white/70' },
];

const ConnectSection = () => (
  <section id="connect" className="py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <Prompt command="./connect" accent="green" className="mb-4" />
      <TuiFrame accent="green" titleLeft="┤ ./connect ├" titleRight="socials">
        <div className="grid sm:grid-cols-3 gap-px bg-white/10">
          {LINKS.map((link) => {
            const Icon = link.Icon;
            const { label, desc, href, hover, cta } = link;
            return (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
               className={`group bg-black p-6 transition-colors ${hover}`}>
              <Icon className="text-white mb-3" size={22} />
              <div className="text-white font-bold mb-1">{label}</div>
              <div className="text-white/50 text-xs mb-3">{desc}</div>
              <div className={`text-[11px] font-mono ${cta}`}>open →</div>
            </a>
            );
          })}
        </div>
      </TuiFrame>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between text-white/30 text-xs font-mono">
        <span>© {new Date().getFullYear()} {SITE.domain}</span>
        <span className="text-emerald-400">{PROMPT} logout</span>
      </div>
    </div>
  </section>
);

export default ConnectSection;
