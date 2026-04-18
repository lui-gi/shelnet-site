import { Link } from 'react-router-dom';
import { Cpu, Shield } from 'lucide-react';
import BrutalHeader from '../shared/BrutalHeader';

const PBQsSection = () => {
  return (
    <section id="pbqs" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="PRACTICE PBQS" subtitle="C:\Shelnet>  PERFORMANCE BASED QUESTIONS" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* A+ Card */}
          <Link to="/a-plus-pbqs" className="block group border border-red-500/30 bg-red-500/[0.08] backdrop-blur-sm shadow-lg shadow-red-500/15 hover:shadow-red-500/25 hover:bg-red-500/[0.13] p-8 transition-all duration-300 relative overflow-hidden rounded-lg cursor-pointer">
            {/* Glass sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="text-red-400 font-mono text-xs mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                220-1202
              </div>
              <h3 className="text-3xl font-bold mb-4">A+</h3>
              <p className="text-white/60 mb-8 leading-relaxed h-20">
                Interactive simulations for OS troubleshooting, disk management, and  suspicious activity.
              </p>

              <span className="w-full py-4 border border-red-500 bg-red-400/10 hover:bg-red-400/20 hover:text-red-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center btn-scanline rounded">
                <span>Load Module</span>
                <span>./launch_a_plus.sh</span>
              </span>

            </div>
          </Link>

          {/* Sec+ Card */}
          <Link to="/security-plus-pbqs" className="block group border border-blue-500/30 bg-blue-500/[0.08] backdrop-blur-sm shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:bg-blue-500/[0.13] p-8 transition-all duration-300 relative overflow-hidden rounded-lg cursor-pointer">
            {/* Glass sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="text-blue-400 font-mono text-xs mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                SY0-701
              </div>
              <h3 className="text-3xl font-bold mb-4">Security+</h3>
              <p className="text-white/60 mb-8 leading-relaxed h-20">
                Firewall configuration logs, vulnerability scanning analysis, and secure network architecture PBQs.
              </p>

              <span className="w-full py-4 border border-blue-500 bg-blue-400/10 hover:bg-blue-400/20 hover:text-blue-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center btn-scanline rounded">
                <span>Load Module</span>
                <span>./launch_sec_plus.sh</span>
              </span>

            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PBQsSection;
