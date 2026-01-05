import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';
import SpinningKey from '../animations/SpinningKey';

const VisualizationsSection = () => {
  return (
    <section id="visualizations" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="VISUALIZATIONS" subtitle="C:\Shelnet> INTERACTIVE CONCEPTS" />

        {/* Single Card */}
        <div className="max-w-3xl mx-auto">
          <div className="border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Visualizations</h3>
                  <div className="text-sm text-white/50 font-mono">Interactive visual explanations</div>
                </div>
                <div className="opacity-40 group-hover:opacity-60 transition-opacity">
                  <Layers size={48} strokeWidth={1} className="text-purple-400" />
                </div>
              </div>
              {/* Spinning Key Animation */}
              <div className="flex justify-center items-center my-12">
                <SpinningKey />
              </div>
            </div>

            {/* Terminal Action */}
            <div className="border border-white/10 bg-black p-4 font-mono text-sm">
              <div className="text-white/40 mb-2">root@shelnet:~# cd /visualizations</div>
              <div className="text-purple-500 mb-4">Loading interactive learning tools...</div>
              <Link
                to="/visualizations"
                className="block w-full border border-white/30 text-white hover:bg-white hover:text-black font-bold py-3 px-4 transition-all text-center uppercase"
              >
                Explore Visualizations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualizationsSection;
