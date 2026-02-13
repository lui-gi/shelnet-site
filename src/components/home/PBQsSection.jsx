import { Link } from 'react-router-dom';
import { Cpu, Shield } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const PBQsSection = () => {
  return (
    <section id="pbqs" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="PRACTICE PBQS" subtitle="C:\Shelnet>  PERFORMANCE BASED QUESTIONS" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* A+ Card */}
          <div className="group border border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.06] p-8 transition-all duration-300 relative overflow-hidden">
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

              {/* Replaced <button> with <Link> */}
              <Link
                to="/a-plus-pbqs"
                className="w-full py-4 border border-red-500 bg-red-400/10 hover:bg-red-400/20 hover:text-red-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center btn-scanline"
              >
                <span>Load Module</span>
                <span>./launch_a_plus.sh</span>
              </Link>

            </div>
          </div>

          {/* Sec+ Card */}
          <div className="group border border-blue-500/20 bg-blue-500/[0.03] hover:bg-blue-500/[0.06] p-8 transition-all duration-300 relative overflow-hidden">
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

              {/* Replace the Security+ <button> with this <Link> */}
              <Link
                to="/security-plus-pbqs"
                className="w-full py-4 border border-blue-500 bg-blue-400/10 hover:bg-blue-400/20 hover:text-blue-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center btn-scanline"
              >
                <span>Load Module</span>
                <span>./launch_sec_plus.sh</span>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PBQsSection;
