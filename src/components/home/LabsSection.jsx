import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';
import LabBlueprintCard from './LabBlueprintCard';
import { labs } from '../../data/labs';

const LabsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const prev = () => setActiveIdx(i => (i - 1 + labs.length) % labs.length);
  const next = () => setActiveIdx(i => (i + 1) % labs.length);

  return (
    <section id="labs" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="LABS" subtitle="C:\Shelnet> THREAT SIMULATION RANGE" />

        <div className="border border-white/15 bg-white/[0.03] p-8 md:p-12">
          <div className="grid lg:grid-cols-[7fr_3fr] gap-10 items-start">

            {/* Left: Writeups Wiki */}
            <div className="space-y-4">
              <div className="border-b border-white/15 pb-4">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                  WRITEUPS WIKI
                </h3>
              </div>
              <p className="text-base text-white/70 font-light leading-relaxed">
                Post-mortem reports documenting attack paths, exploitation steps,
                and lessons learned from each lab run.
              </p>
              <div className="border border-white/10 bg-black">
                <iframe
                  src="https://lui-gi.github.io/shelnet-resources/writeups/index.html"
                  title="Shelnet Writeups Wiki"
                  className="w-full h-[560px]"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                />
              </div>
              <a
                href="https://lui-gi.github.io/shelnet-resources/writeups/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full border border-orange-600 bg-orange-500/10 text-white hover:bg-orange-500/20 hover:text-orange-400 font-bold py-3 px-4 transition-all text-center uppercase font-mono text-sm btn-scanline"
              >
                Open Writeups in New Tab
              </a>
            </div>

            {/* Right: Lab Blueprint Cards */}
            <div className="space-y-4">
              <div className="border-b border-white/15 pb-4">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                  LAB LIST
                </h3>
              </div>

              {/* Named tab strip */}
              <div className="flex gap-1">
                {labs.map((lab, i) => (
                  <button
                    key={lab.id}
                    onClick={() => setActiveIdx(i)}
                    className={`flex-1 px-2 py-2.5 text-center transition-colors leading-tight
                      ${i === activeIdx
                        ? 'bg-orange-500 text-black'
                        : 'border border-white/15 text-white/40 hover:border-orange-500/40 hover:text-white/70'
                      }`}
                  >
                    <span className={`block text-[9px] font-mono mb-0.5 ${i === activeIdx ? 'text-black/60' : 'text-white/25'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] font-mono font-bold uppercase tracking-wide">
                      {lab.name.replace(/ Lab$/, '')}
                    </span>
                  </button>
                ))}
              </div>

              <LabBlueprintCard key={labs[activeIdx].id} lab={labs[activeIdx]} />

              {/* Prev / Next with destination names */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={prev}
                  className="flex items-center gap-2 px-3 py-3 border border-white/15 hover:border-orange-500/50 text-white/40 hover:text-orange-400 transition-colors text-left group"
                >
                  <ChevronLeft size={14} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono text-white/25 group-hover:text-orange-400/60 uppercase">Prev</div>
                    <div className="text-[10px] font-mono uppercase leading-tight truncate">
                      {labs[(activeIdx - 1 + labs.length) % labs.length].name.replace(/ Lab$/, '')}
                    </div>
                  </div>
                </button>
                <button
                  onClick={next}
                  className="flex items-center justify-end gap-2 px-3 py-3 border border-white/15 hover:border-orange-500/50 text-white/40 hover:text-orange-400 transition-colors text-right group"
                >
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono text-white/25 group-hover:text-orange-400/60 uppercase">Next</div>
                    <div className="text-[10px] font-mono uppercase leading-tight truncate">
                      {labs[(activeIdx + 1) % labs.length].name.replace(/ Lab$/, '')}
                    </div>
                  </div>
                  <ChevronRight size={14} className="flex-shrink-0" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LabsSection;
