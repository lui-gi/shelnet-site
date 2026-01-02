import { Terminal, Activity, Globe, BookOpen } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="ABOUT SHELNET" subtitle="C:\Shelnet> OUR PURPOSE" />

        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr_200px] gap-12 items-start">
             <div className="space-y-6 text-lg text-white/80 font-light leading-relaxed">
               <p>
                 Created by a cybersecurity student, this site began as a private repository to track my own 
                 learning progress. After realizing how difficult it is to find high-quality, truly free 
                 educational materials, I decided to open-source my notes to provide a 
                 barrier-free platform for everyone.
                </p>
                <p>
                  Unlike platforms that hide content behind signups or paywalls, Shelnet runs entirely 
                  client-side in your browser. We are committed to a privacy-first experience,
                   which means no tracking, no data collection, and no logins required.
                </p>
             </div>

             {/* Stat Box */}
             <div className="hidden md:block space-y-4">
                <div className="p-4 bg-white/5 border-l-2 border-red-500">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/40 uppercase">Free</div>
                </div>
                <div className="p-4 bg-white/5 border-l-2 border-yellow-500">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/40 uppercase">Available</div>
                </div>
                <div className="p-4 bg-white/5 border-l-2 border-green-500">
                  <div className="text-2xl font-bold text-white">0.00 MB</div>
                  <div className="text-xs text-white/40 uppercase">Data Collected</div>
                </div>
             </div>
          </div>

          {/* Tech Stack Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/10">
             <div className="text-center">
               <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Terminal size={20} /></div>
               <div className="text-xs font-mono text-white/50">BASH THEMED</div>
             </div>
             <div className="text-center">
               <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Activity size={20} /></div>
               <div className="text-xs font-mono text-white/50">LIGHTWEIGHT</div>
             </div>
             <div className="text-center">
               <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Globe size={20} /></div>
               <div className="text-xs font-mono text-white/50">ACCESSIBLE</div>
             </div>
             <div className="text-center">
               <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><BookOpen size={20} /></div>
               <div className="text-xs font-mono text-white/50">OPEN SOURCE</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
