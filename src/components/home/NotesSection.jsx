import { BookOpen } from 'lucide-react';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const NotesSection = () => {
  return (
    <section id="notes" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="NOTES" subtitle="C:\Shelnet> MY LEARNING JOURNEY" />

        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column: Description */}
            <div className="space-y-6 text-lg text-white/80 font-light leading-relaxed">
              <p>
                This is a living document of my cybersecurity learning journey. As I study for certifications
                and explore new concepts, I consolidate my notes here in an organized, searchable format.
                The notes cover topics from CompTIA A+, Security+, and beyond.
              </p>
              <p>
                The repository is continuously updated as I learn, making it a real-time reflection of my progress.
                Each section is structured for easy navigation, whether you're looking for specific commands,
                security concepts, or exam preparation tips.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/60 font-mono">
                <BookOpen size={16} />
                <span>Hosted on GitHub Pages</span>
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
