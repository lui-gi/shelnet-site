// src/components/home/AboutSection.jsx
import TerminalShell from '../tui/TerminalShell';
import { useEscapeHome } from '../../utils/useEscapeHome';

const AboutSection = () => {
  useEscapeHome();
  return (
  <TerminalShell maxWidthClass="max-w-3xl">
    <div className="space-y-5 text-white/75 leading-relaxed text-sm md:text-[15px]">
      <p>
        Shelnet began as a private repo where I tracked my progress as a university
        student into cybersecurity. It started as a personal tool to solidify my
        understanding; but I realized how hard it is to find study materials that are
        high-quality, current, and actually free.
      </p>
      <p>
        Every practice resource I found was outdated, untrue to the exam, or paywalled.
        So I open-sourced all of my notes and study resources, and built Shelnet to run
        entirely client-side. No data harvesting, no hidden content: fully open-source
        and privacy-first.
      </p>
      <p>
        Shelnet is proof that learning through teaching works. By sharing the journey
        publicly, mistakes and breakthroughs, I want a living resource that grows into
        a barrier-free community where anyone can break into tech without paying for the
        privilege.
      </p>

      <div className="pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
        <span className="text-white/40">2024 <span className="text-white/30">private repo</span></span>
        <span className="text-white/20">→</span>
        <span style={{ color: '#43c08c' }}>now <span className="text-white">open source</span></span>
        <span className="text-white/20">→</span>
        <span className="text-white/40">next <span className="text-white/30">growing community</span></span>
      </div>
    </div>
  </TerminalShell>
  );
};

export default AboutSection;
