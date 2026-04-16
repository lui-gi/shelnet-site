import { MousePointerClick, List, Search } from 'lucide-react';
import BrutalHeader from '../shared/BrutalHeader';

const NotesSection = () => {
  return (
    <section id="notes" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="NOTES" subtitle="C:\Shelnet> MY LEARNING JOURNEY" />

        <div className="border border-white/15 bg-white/[0.03] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column: Description */}
            <div className="space-y-6">
              <p className="text-lg text-white/80 font-light leading-relaxed">
                A live feed of my Obsidian notes repository. This section is continuously updated as I study for certifications, explore new concepts, and document my other projects. Use the tools below to navigate and find topics of interest.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 border border-white/10 bg-white/[0.02]">
                  <div className="p-2 border border-white/10">
                    <MousePointerClick size={18} className="text-white/60" />
                  </div>
                  <span className="text-sm text-white/70 font-light">Click a note title to read it</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-white/10 bg-white/[0.02]">
                  <div className="p-2 border border-white/10">
                    <List size={18} className="text-white/60" />
                  </div>
                  <span className="text-sm text-white/70 font-light">Use [ all notes ] to browse the full archive</span>
                </div>
                <div className="flex items-center gap-4 p-4 border border-white/10 bg-white/[0.02]">
                  <div className="p-2 border border-white/10">
                    <Search size={18} className="text-white/60" />
                  </div>
                  <span className="text-sm text-white/70 font-light">Search by note title to find a topic</span>
                </div>
              </div>

              <div className="border border-white/15 bg-black p-4 font-mono text-sm">
                <div className="text-white/40 mb-2">root@shelnet:~# cd /notes</div>
                <div className="text-white/50 mb-4">Syncing notes repository...</div>
                <a
                  href="https://lui-gi.github.io/shelnet-notes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-gray-600 bg-gray-500/10 text-white hover:bg-gray-500/20 hover:text-gray-300 font-bold py-3 px-4 transition-all text-center uppercase btn-scanline"
                >
                  Open Notes in New Tab
                </a>
              </div>
            </div>

            {/* Right Column: Iframe */}
            <div className="border border-white/10 bg-black">
              <iframe
                src="https://lui-gi.github.io/shelnet-notes/"
                title="Shelnet Notes Platform"
                className="w-full h-[400px] md:h-[600px]"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotesSection;
