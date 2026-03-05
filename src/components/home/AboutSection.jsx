import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="ABOUT SHELNET" subtitle="C:\Shelnet> OUR PURPOSE" />

        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
          {/* Story Content */}
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-white/80 font-light leading-relaxed">
            <p>
              Shelnet began as a private repository where I tracked my progress as a university student passionate 
              about cybersecurity. It started as a personal tool to solidify my understanding, however I realized just 
              how hard it is to find study materials that are high-quality, up-to-date, and actually free.
            </p>
            <p>
              The turning point came when I went searching for practice questions and resources. Every resource I came across online
              was either outdated, not true to the exam content, or a paid resource. That's when I made the decision to open-source
              all of my notes and study resources. To ensure this knowledge remains accessible, I designed Shelnet to run 
              entirely client-side. Unlike other 'free' resources that harvest data or hide content, we are fully open-source and 
              privacy-first.
              
            </p>
            <p>
              Today, Shelnet is proof that learning through teaching works. By sharing my learning journey
              publicly, including all my mistakes and breakthroughs, I hope to create a living resource that grows with us. 
              Shelnet is now about building a barrier-free community where anyone can break into 
              tech without having to pay for the privilege.
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
