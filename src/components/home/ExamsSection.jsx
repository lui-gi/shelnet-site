import { Link } from 'react-router-dom';
import GridBackground from '../shared/GridBackground';
import BrutalHeader from '../shared/BrutalHeader';

const ExamsSection = () => {
  return (
    <section id="exams" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <GridBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        <BrutalHeader title="PRACTICE EXAMS" subtitle="C:\Shelnet> FULL LENGTH MOCK TESTS" />

        {/* Using the layout from "Get Involved" (two columns with terminal accent) */}
        <div className="grid lg:grid-cols-2 gap-6">

           {/* A+ Exam */}
           <div className="border border-red-500/20 bg-red-500/[0.03] p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">A+ Core 2 Exams</h3>
                    <div className="text-sm text-white/50 font-mono">Custom-made practice exams/quizzes</div>
                  </div>
                  <div className="text-lg font-mono text-white/40">[220-1202]</div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-red-500 font-mono">01.</span>
                     <span>Operating Systems</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-red-500 font-mono">02.</span>
                     <span>Security</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-red-500 font-mono">03.</span>
                     <span>Software Troubleshooting</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-red-500 font-mono">04.</span>
                     <span>Operational Procedures</span>
                  </div>
                </div>
              </div>

              {/* Terminal Action */}
              <div className="border border-red-500/15 bg-black p-4 font-mono text-sm">
                 <div className="text-white/40 mb-2">root@shelnet:~# exam-runner --type a-plus</div>
                 <div className="text-red-500 mb-4">Generating question pool... Done.</div>
                 <Link
                   to="/a-plus-exams"
                   className="block w-full border border-red-600 bg-red-500/10 text-white hover:bg-red-500/20 hover:text-red-400 font-bold py-3 px-4 transition-all text-center uppercase btn-scanline"
                 >
                   Launch Exams
                 </Link>
              </div>
           </div>

           {/* Sec+ Exam */}
           <div className="border border-blue-500/20 bg-blue-500/[0.03] p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Security+ Exams</h3>
                    <div className="text-sm text-white/50 font-mono">Custom-made practice exams/quizzes</div>
                  </div>
                  <div className="text-lg font-mono text-white/40">[SY0-701]</div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-blue-500 font-mono">01.</span>
                     <span>General Security Concepts</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-blue-500 font-mono">02.</span>
                     <span>Threats, Vulnerabilities, and Mitigations</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-blue-500 font-mono">03.</span>
                     <span>Security Architecture</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-blue-500 font-mono">04.</span>
                     <span>Security Operations</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white/70">
                     <span className="text-blue-500 font-mono">05.</span>
                     <span>Security Program Management and Oversight</span>
                  </div>
                </div>
              </div>

              {/* Terminal Action */}
              <div className="border border-blue-500/15 bg-black p-4 font-mono text-sm">
                 <div className="text-white/40 mb-2">root@shelnet:~# exam-runner --type sec-plus</div>
                 <div className="text-blue-500 mb-4">Decrypting exam key... Done.</div>
                 <Link
                    to="/security-plus-exams"
                    className="block w-full border border-blue-600 bg-blue-500/10 text-white hover:bg-blue-500/20 hover:text-blue-400 font-bold py-3 px-4 transition-all text-center uppercase btn-scanline"
                  >
                    Launch Exams
                  </Link>
              </div>
           </div>

        </div>
      </div>
    </section>
  );
};

export default ExamsSection;
