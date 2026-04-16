import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import BrutalHeader from '../shared/BrutalHeader';
import ScanningWordCloud from '../animations/ScanningWordCloud';

const VisualizationsSection = () => {
  return (
    <section id="visualizations" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="VISUALIZATIONS" subtitle="C:\Shelnet> INTERACTIVE CONCEPTS" />

        {/* Single Card */}
        <div className="border border-purple-500/30 bg-purple-500/[0.08] backdrop-blur-sm shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 hover:bg-purple-500/[0.13] transition-all duration-300 p-8 flex flex-col justify-between rounded-lg relative overflow-hidden cursor-pointer">
            {/* Glass sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Core Concepts</h3>
                  <div className="text-sm text-white/50 font-mono">Interactive modules for core cybersecurity concepts.</div>
                </div>
                <div className="opacity-40 group-hover:opacity-60 transition-opacity">
                  <Layers size={48} strokeWidth={1} className="text-purple-400" />
                </div>
              </div>
              {/* Scanning Word Cloud Animation */}
              <div className="flex justify-center items-center my-12">
                <ScanningWordCloud />
              </div>
            </div>

            {/* Terminal Action */}
            <div className="border border-purple-500/15 bg-black/60 backdrop-blur-sm p-4 font-mono text-sm rounded">
              <div className="text-white/40 mb-2">root@shelnet:~# cd /visualizations</div>
              <div className="text-purple-500 mb-4">Loading interactive learning tools...</div>
              <Link
                to="/visualizations"
                className="block w-full border border-purple-600 bg-purple-500/10 text-white hover:bg-purple-500/20 hover:text-purple-400 font-bold py-3 px-4 transition-all text-center uppercase btn-scanline rounded"
              >
                Explore Visualizations
              </Link>
            </div>
        </div>
      </div>
    </section>
  );
};

export default VisualizationsSection;
