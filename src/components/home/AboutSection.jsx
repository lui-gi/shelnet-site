import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 relative bg-black border-t border-white/5">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="ABOUT SHELNET" subtitle="C:\Shelnet> OUR PURPOSE" />

        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
          {/* Story Content */}
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-white/80 font-light leading-relaxed">
            <p>
              Shelnet began as a private repository—a personal collection of notes created by a university
              cybersecurity student trying to make sense of dense certification material. What started as
              scattered Obsidian notes slowly evolved into a structured learning system, born out of necessity
              and late-night study sessions.
            </p>
            <p>
              The turning point came when searching for practice questions and resources. Behind every
              promising link was a paywall, a subscription, or worse—low-quality content disguised as
              "premium." The frustration was real: why should quality education be locked behind barriers?
              That's when the decision was made to open-source everything and build a platform that would
              remain free, forever.
            </p>
            <p>
              Today, Shelnet stands as proof that learning through teaching works. By sharing my journey
              publicly—mistakes, breakthroughs, and all—we create a resource that grows stronger with each
              certification, each topic explored, each concept understood. This isn't just about passing exams;
              it's about building a barrier-free foundation for everyone pursuing cybersecurity.
            </p>
          </div>

          {/* Timeline */}
          <div className="mt-12 pt-12 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
              <div className="text-center flex-shrink-0">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-2 font-mono">2024</div>
                <div className="text-sm font-mono text-white/60">Private Repo</div>
              </div>

              <div className="hidden md:block flex-1 border-t border-white/20 mx-6"></div>
              <div className="md:hidden w-px h-8 bg-white/20"></div>

              <div className="text-center flex-shrink-0">
                <div className="text-xs text-green-400 uppercase tracking-widest mb-2 font-mono">Now</div>
                <div className="text-sm font-mono text-white">Open Source</div>
              </div>

              <div className="hidden md:block flex-1 border-t border-white/20 mx-6"></div>
              <div className="md:hidden w-px h-8 bg-white/20"></div>

              <div className="text-center flex-shrink-0">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-2 font-mono">Future</div>
                <div className="text-sm font-mono text-white/60">Growing Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
