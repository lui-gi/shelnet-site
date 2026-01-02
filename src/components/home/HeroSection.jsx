import { ChevronRight } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import TerminalComponent from '../animations/TerminalComponent';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      {/* BACKGROUNDS */}
      <GridBackground />

      <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div>
           <div className="mb-6 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-green-400">
             SYSTEM_READY: v2.0.4
           </div>
           <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
             LEARN CYBER<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
               WITH ME.
             </span>
           </h1>
           <p className="text-white/60 text-base md:text-base max-w-base leading-relaxed mb-8">
             Welcome to Shelnet! My mission is to provide everyone with free cybersecurity resources with no strings attached. I just want to share what I learn with others so we all can succeed in the world of cyber.
           </p>
           <div className="flex flex-wrap gap-4">
             <a
              href="#pbqs"
              onClick={(e) => {
                e.preventDefault(); // Stop HashRouter from hijacking the URL
                document.getElementById('pbqs')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group px-6 py-3 bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              START SIMULATION <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
             <a
              href="#about"
              onClick={(e) => {
                e.preventDefault(); // Stop the router from changing the URL
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 border border-white/20 text-white hover:bg-white/5 transition-colors font-mono text-sm flex items-center cursor-pointer"
            >
              $ man shelnet
            </a>
           </div>
        </div>

        {/* Right Content - Terminal */}
        <div className="relative">
           <div className="absolute -inset-1 bg-gradient-to-b from-green-500/20 to-purple-500/20 blur-2xl opacity-30"></div>
           <TerminalComponent />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
