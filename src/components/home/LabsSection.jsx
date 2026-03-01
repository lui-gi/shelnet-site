import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';
import LabBlueprintCard from './LabBlueprintCard';
import { labs } from '../../data/labs';

const LabsSection = () => {
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
              {labs.map((lab) => (
                <LabBlueprintCard key={lab.id} lab={lab} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LabsSection;
