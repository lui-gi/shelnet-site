import { Terminal, Activity, Globe, BookOpen } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        <BrutalHeader title="ABOUT SHELNET" subtitle="C:\Shelnet> OUR PURPOSE" counter="11.27.25" id="Status: Complete" />

        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr_200px] gap-12 items-start">
             <div className="space-y-6 text-lg text-white/80 font-light leading-relaxed">
               <p>
                 The site was created by me, a university student who is passionate about all things tech, especially cybersecurity.
                 I initially created this site as a private repo to track my progress and to solidify my own understanding of concepts by writing about them.
               </p>
               <p>
                 However, as my explanation videos started gaining traction, I realized just how difficult it is to find truly
                <span className="text-white font-bold"> free </span>
                 educational materials in this field.
                 That realization changed my goal: I decided to open-source my notes and turn this into a public resource where cybersecurity students can learn freely,
                 without paywalls or data tracking.

               </p>
               <p>
                 Most "free" resources require email signups or hide the best content behind paywalls.
                 At Shelnet, everything runs client-side in your browser. Experienced users can even view our resource source code if they want (it's pure HTML)! We promise
                 <span className="text-white font-bold"> no tracking, no data collection, no logins. </span>
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
