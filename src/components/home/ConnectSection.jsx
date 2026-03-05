import { Youtube, Linkedin, Mail } from 'lucide-react';
import BrutalHeader from '../shared/BrutalHeader';

const ConnectSection = () => {
  return (
    <section id="connect" className="py-24 px-6 relative bg-black border-t border-white/5 z-[1]">
      <div className="max-w-6xl mx-auto relative z-10">
         <BrutalHeader title="CONNECT WITH ME" subtitle="C:\Shelnet> SOCIALS" />

         <div className="grid md:grid-cols-3 gap-4">
            {/* YouTube */}
            <a href="https://youtube.com/@Shelnet" target="_blank" className="group border border-white/10 bg-white/[0.02] hover:bg-red-900/10 hover:border-red-500/50 p-8 transition-all text-center">
               <div className="w-12 h-12 bg-red-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Youtube className="text-white" />
               </div>
               <h4 className="text-xl font-bold mb-2">YouTube</h4>
               <p className="text-white/50 text-sm mb-4">Video explanations of PBQs and visualizations.</p>
               <div className="text-xs font-mono text-red-400">SUBSCRIBE / COMMENT &rarr;</div>
            </a>

            {/* LinkedIn */}
            <a href="https://linkedin.com/in/luigi-fernandez-502647333" target="_blank" className="group border border-white/10 bg-white/[0.02] hover:bg-blue-900/10 hover:border-blue-500/50 p-8 transition-all text-center">
               <div className="w-12 h-12 bg-blue-700 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Linkedin className="text-white" />
               </div>
               <h4 className="text-xl font-bold mb-2">LinkedIn</h4>
               <p className="text-white/50 text-sm mb-4">Connect with me.</p>
               <div className="text-xs font-mono text-blue-400">CONNECT &rarr;</div>
            </a>

            {/* Email */}
            <a href="https://forms.gle/WRM23ktXNZiupPaZA" target="_blank" className="group border border-white/10 bg-white/[0.02] hover:bg-gray-800 hover:border-white/50 p-8 transition-all text-center">
               <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="text-white" />
               </div>
               <h4 className="text-xl font-bold mb-2">Email</h4>
               <p className="text-white/50 text-sm mb-4">Resource requests or business inquiries.</p>
               <div className="text-xs font-mono text-gray-300">SEND MESSAGE &rarr;</div>
            </a>
         </div>


         {/* Footer Line */}
         <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs font-mono">
            <div>&copy; {new Date().getFullYear()} SHELNET.ORG</div>
         </div>
      </div>
    </section>
  );
};

export default ConnectSection;
