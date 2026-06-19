// src/components/home/AboutSection.jsx
import TuiFrame from '../tui/TuiFrame';
import Prompt from '../tui/Prompt';

const AboutSection = () => (
  <section id="about" className="py-20 px-6">
    <div className="max-w-4xl mx-auto">
      <Prompt command="cat about.md" accent="green" className="mb-4" />
      <TuiFrame accent="green" titleLeft="┤ about.md ├" titleRight="readme">
        <div className="p-6 md:p-8 space-y-5 text-white/75 leading-relaxed text-sm md:text-[15px]">
          <p>
            Shelnet began as a private repo where I tracked my progress as a university
            student into cybersecurity. It started as a personal tool to solidify my
            understanding — but I realized how hard it is to find study materials that are
            high-quality, current, and actually free.
          </p>
          <p>
            Every practice resource I found was outdated, untrue to the exam, or paywalled.
            So I open-sourced all of my notes and study resources, and built Shelnet to run
            entirely client-side. No data harvesting, no hidden content — fully open-source
            and privacy-first.
          </p>
          <p>
            Shelnet is proof that learning through teaching works. By sharing the journey
            publicly — mistakes and breakthroughs — I want a living resource that grows into
            a barrier-free community where anyone can break into tech without paying for the
            privilege.
          </p>

          {/* timeline */}
          <div className="pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
            <span className="text-white/40">2024 <span className="text-white/30">private repo</span></span>
            <span className="text-white/20">→</span>
            <span className="text-emerald-400">now <span className="text-white">open source</span></span>
            <span className="text-white/20">→</span>
            <span className="text-white/40">next <span className="text-white/30">growing community</span></span>
          </div>
        </div>
      </TuiFrame>
    </div>
  </section>
);

export default AboutSection;
