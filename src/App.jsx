import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Youtube, Linkedin, Mail, Shield, Monitor, Command, ChevronRight, BookOpen, Activity, Globe } from 'lucide-react';

/* --- UTILITY COMPONENTS --- */

const BrutalHeader = ({ title, subtitle, counter, id }) => (
  <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-white/10 pb-6">
    <div>
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight uppercase" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
        {title}
      </h2>
      <div className="text-xs text-white/40 uppercase tracking-widest font-mono">
        {subtitle}
      </div>
    </div>
    <div className="text-right hidden md:block">
      <div className="text-2xl font-bold text-white font-mono">
        [{counter}]
      </div>
      <div className="text-xs text-white/40 uppercase tracking-widest">
        {id}
      </div>
    </div>
  </div>
);

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="w-full h-full opacity-[0.03]" 
         style={{ 
           backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
           backgroundSize: '50px 50px' 
         }}>
    </div>
  </div>
);

/* --- BINARY RAIN COMPONENT --- */

const BinaryRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    
    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random positions above screen
    }

    const draw = () => {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text settings - Faint Blue-Green (Cyan/Teal mix)
      ctx.fillStyle = 'rgba(64, 224, 208, 0.35)'; // Turquoise/Teal with low opacity
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random binary digit
        const text = Math.random() > 0.5 ? '1' : '0';
        
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset drop to top randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 77);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-60 pointer-events-none"
    />
  );
};

/* --- TERMINAL COMPONENT --- */

/* --- TERMINAL COMPONENT --- */

const TerminalComponent = () => {
  const [typedCmd, setTypedCmd] = useState('');
  const [output, setOutput] = useState(null); // null = hidden, string = visible
  const [showCursor, setShowCursor] = useState(true);
  
  // Refs for managing the loop safely
  const isMounted = useRef(true);

  const introText = `Shelnet is a free study hub for all things cybersecurity.

Contents:
• Completely free, self-made practice PBQs and Exams
• Core concept visualizations
• YouTube tutorials for the above

Goal: to document my own cybersecurity journey while also teaching others.`;

  const commands = [
    { cmd: 'whoami', out: 'shelnet' },
    { cmd: 'ip a | grep inet', out: 'inet 10.0.0.42/24 brd 10.0.0.255 scope global eth0' },
    { cmd: 'cat current_status.txt', out: 'Rolling out Security+ PBQs.' },
    { cmd: 'ls', out: 'PBQS     Exams     About     contact.pcap' }
  ];

  // Helper for delays
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  useEffect(() => {
    isMounted.current = true;

    const runTerminalLoop = async () => {
      let cmdIndex = 0;

      while (isMounted.current) {
        const current = commands[cmdIndex];

        // --- STEP 1: RESET ---
        // Clear previous command and output, leaving only Intro
        setTypedCmd('');
        setOutput(null);
        await delay(800); // Pause before starting next command

        // --- STEP 2: TYPE COMMAND ---
        if (!isMounted.current) return;
        for (let i = 0; i <= current.cmd.length; i++) {
          if (!isMounted.current) return;
          setTypedCmd(current.cmd.slice(0, i));
          // Typing speed variation
          await delay(50 + Math.random() * 40); 
        }

        // --- STEP 3: PROCESS DELAY ---
        await delay(400); // Slight pause after typing before enter is "hit"

        // --- STEP 4: SHOW OUTPUT ---
        if (!isMounted.current) return;
        setOutput(current.out);

        // --- STEP 5: READ DELAY ---
        // Wait for user to read the output before clearing
        await delay(2500); 

        // --- STEP 6: LOOP INCREMENT ---
        cmdIndex = (cmdIndex + 1) % commands.length;
      }
    };

    runTerminalLoop();

    return () => { isMounted.current = false; };
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto font-mono text-xs md:text-sm leading-relaxed bg-[#0c0c0c] border border-white/20 rounded-lg shadow-2xl overflow-hidden relative z-20">      {/* Terminal Bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        <div className="ml-2 text-white/30 text-xs">bash — shelnet@studio</div>
      </div>
      
      {/* Terminal Body */}
      <div className="h-[350px] md:h-[450px] overflow-y-auto p-4 md:p-6 text-gray-300 font-mono">
        
        {/* 1. Static Intro Text (Always visible) */}
        <div className="mb-6 whitespace-pre-wrap text-gray-400">
          {introText}
        </div>

        {/* 2. Dynamic Command Line */}
        <div className="flex flex-wrap">
          <span className="text-green-500 mr-2 shrink-0">$</span>
          <span className="text-white/90 break-all">{typedCmd}</span>
          
          {/* Cursor: Only show if output isn't displayed yet (mimics typing active) */}
          {!output && (
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} w-2.5 h-5 bg-white ml-1 block`}></span>
          )}
        </div>

        {/* 3. Output Section */}
        {output && (
          <div className="mt-2 text-gray-400 whitespace-pre-wrap animate-in fade-in duration-300">
            {output}
          </div>
        )}

        {/* Empty prompt shown after output to mimic terminal waiting state */}
        {output && (
           <div className="flex mt-2">
            <span className="text-green-500 mr-2">$</span>
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} w-2.5 h-5 bg-white ml-1 block`}></span>
           </div>
        )}

      </div>
    </div>
  );
};

/* --- MAIN APP --- */

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30 selection:text-green-200 relative">
      {/* GLOBAL BINARY RAIN - Fixed position covering entire viewport */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BinaryRain />
      </div>
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Barcode SVG */}
            <svg width="100" height="24" viewBox="0 0 140 30" className="opacity-80 fill-white hidden md:block">
              <rect x="0" y="0" width="2" height="30" />
              <rect x="4" y="0" width="1" height="30" />
              <rect x="7" y="0" width="3" height="30" />
              <rect x="15" y="0" width="2" height="30" />
              <rect x="22" y="0" width="4" height="30" />
              <rect x="31" y="0" width="2" height="30" />
              <rect x="38" y="0" width="3" height="30" />
              <rect x="46" y="0" width="2" height="30" />
              <rect x="53" y="0" width="4" height="30" />
              <rect x="62" y="0" width="2" height="30" />
              <rect x="74" y="0" width="2" height="30" />
              <rect x="81" y="0" width="3" height="30" />
              <rect x="93" y="0" width="4" height="30" />
              <rect x="102" y="0" width="2" height="30" />
              <rect x="117" y="0" width="2" height="30" />
              <rect x="124" y="0" width="4" height="30" />
            </svg>
            <span className="font-bold text-xl tracking-tighter">SHELNET_</span>
          </div>
          <div className="flex gap-8 font-mono text-sm text-white/60">
            <a href="#pbqs" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">PBQs</a>
            <a href="#exams" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Exams</a>
            <a href="#about" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">About</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
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
               <a href="#pbqs" className="group px-6 py-3 bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                 START SIMULATION <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </a>
               <a href="#about" className="px-6 py-3 border border-white/20 text-white hover:bg-white/5 transition-colors font-mono text-sm flex items-center">
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent mx-auto"></div>
        </div>
      </section>

      {/* PBQS SECTION */}
      <section id="pbqs" className="py-24 px-6 relative bg-black border-t border-white/5">
        <GridBackground />
        <div className="max-w-6xl mx-auto relative z-10">
          <BrutalHeader title="PRACTICE PBQS" subtitle="C:\Shelnet>  PERFORMANCE BASED QUESTIONS" counter="01" id="CORE" />
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* A+ Card */}
            <div className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="text-green-400 font-mono text-xs mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  220-1202
                </div>
                <h3 className="text-3xl font-bold mb-4">A+</h3>
                <p className="text-white/60 mb-8 leading-relaxed h-20">
                  Interactive simulations for hardware troubleshooting, printer configuration, and network setup. 
                </p>
                <button className="w-full py-4 border border-white/20 hover:border-green-500 hover:text-green-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center group-hover:bg-white/[0.02]">
                  <span>Load Module</span>
                  <span>./launch_a_plus.sh</span>
                </button>
              </div>
            </div>

            {/* Sec+ Card */}
            <div className="group border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 transition-all duration-300 relative overflow-hidden">
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
                <button className="w-full py-4 border border-white/20 hover:border-blue-500 hover:text-blue-400 transition-colors font-mono text-sm uppercase flex justify-between px-6 items-center group-hover:bg-white/[0.02]">
                  <span>Load Module</span>
                  <span>./launch_sec_plus.sh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXAMS SECTION */}
      <section id="exams" className="py-24 px-6 relative bg-black border-t border-white/5">
        <GridBackground />
        <div className="max-w-6xl mx-auto relative z-10">
          <BrutalHeader title="PRACTICE EXAMS" subtitle="C:\Shelnet> FULL LENGTH MOCK TESTS" counter="02" id="TEST" />

          {/* Using the layout from "Get Involved" (two columns with terminal accent) */}
          <div className="grid lg:grid-cols-2 gap-6">
             
             {/* A+ Exam */}
             <div className="border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">A+ Full Exam</h3>
                      <div className="text-sm text-white/50 font-mono">// 90 questions • 90 mins</div>
                    </div>
                    <div className="text-lg font-mono text-white/40">[220-1202]</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-green-500 font-mono">01.</span>
                       <span>Mobile Devices & Networking</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-green-500 font-mono">02.</span>
                       <span>Hardware & Virtualization</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-green-500 font-mono">03.</span>
                       <span>Cloud Computing Basics</span>
                    </div>
                  </div>
                </div>
                
                {/* Terminal Action */}
                <div className="border border-white/10 bg-black p-4 font-mono text-sm">
                   <div className="text-white/40 mb-2">root@shelnet:~# exam-runner --type a-plus</div>
                   <div className="text-green-500 mb-4">Generating question pool... Done.</div>
                   <button className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 px-4 transition-colors text-center">
                     START EXAM SESSION
                   </button>
                </div>
             </div>

             {/* Sec+ Exam */}
             <div className="border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Sec+ Full Exam</h3>
                      <div className="text-sm text-white/50 font-mono">// 90 questions • 90 mins</div>
                    </div>
                    <div className="text-lg font-mono text-white/40">[SY0-701]</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-blue-500 font-mono">01.</span>
                       <span>Attacks, Threats & Vulnerabilities</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-blue-500 font-mono">02.</span>
                       <span>Architecture & Design</span>
                    </div>
                    <div className="flex items-center space-x-3 text-white/70">
                       <span className="text-blue-500 font-mono">03.</span>
                       <span>Implementation & Operations</span>
                    </div>
                  </div>
                </div>
                
                {/* Terminal Action */}
                <div className="border border-white/10 bg-black p-4 font-mono text-sm">
                   <div className="text-white/40 mb-2">root@shelnet:~# exam-runner --type sec-plus</div>
                   <div className="text-blue-500 mb-4">Decrypting exam key... Done.</div>
                   <button className="w-full border border-white/30 text-white hover:bg-white hover:text-black font-bold py-3 px-4 transition-all text-center">
                     START EXAM SESSION
                   </button>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 relative bg-black border-t border-white/5">
        <GridBackground />
        <div className="max-w-5xl mx-auto relative z-10">
          <BrutalHeader title="ABOUT SHELNET" subtitle="C:\Shelnet> MISSION STATEMENT" counter="03" id="INFO" />
          
          <div className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <div className="grid md:grid-cols-[1fr_200px] gap-12 items-start">
               <div className="space-y-6 text-lg text-white/80 font-light leading-relaxed">
                 <p>
                   The site was created to host all of my self-made study resources so other students like me can succeed in the world of cyber.

                   Shelnet focuses on <span className="text-white font-bold">fill</span>.
                 </p>
                 <p>
                   Most "free" resources require email signups or hide the best content behind paywalls. 
                   We don't do that here. Everything runs client-side in your browser. 
                   No tracking. No logins. Just raw practice.
                 </p>
               </div>
               
               {/* Stat Box */}
               <div className="hidden md:block space-y-4">
                  <div className="p-4 bg-white/5 border-l-2 border-green-500">
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-xs text-white/40 uppercase">Free</div>
                  </div>
                  <div className="p-4 bg-white/5 border-l-2 border-green-500">
                    <div className="text-2xl font-bold text-white">0ms</div>
                    <div className="text-xs text-white/40 uppercase">Latency</div>
                  </div>
                  <div className="p-4 bg-white/5 border-l-2 border-green-500">
                    <div className="text-2xl font-bold text-white">NO</div>
                    <div className="text-xs text-white/40 uppercase">Ads</div>
                  </div>
               </div>
            </div>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/10">
               <div className="text-center">
                 <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Terminal size={20} /></div>
                 <div className="text-xs font-mono text-white/50">BASH INSPIRED</div>
               </div>
               <div className="text-center">
                 <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Activity size={20} /></div>
                 <div className="text-xs font-mono text-white/50">LIGHTWEIGHT</div>
               </div>
               <div className="text-center">
                 <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><Globe size={20} /></div>
                 <div className="text-xs font-mono text-white/50">OFFLINE READY</div>
               </div>
               <div className="text-center">
                 <div className="mx-auto w-10 h-10 bg-white/10 rounded flex items-center justify-center mb-2"><BookOpen size={20} /></div>
                 <div className="text-xs font-mono text-white/50">OPEN SOURCE</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONNECT / FOOTER */}
      <section id="connect" className="py-24 px-6 relative bg-black border-t border-white/5">
        <div className="max-w-6xl mx-auto relative z-10">
           <BrutalHeader title="GET INVOLVED" subtitle="C:\Shelnet> SOCIALS" counter="04" id="SOCIAL" />
           
           <div className="grid md:grid-cols-3 gap-4">
              {/* YouTube */}
              <a href="#" className="group border border-white/10 bg-white/[0.02] hover:bg-red-900/10 hover:border-red-500/50 p-8 transition-all text-center">
                 <div className="w-12 h-12 bg-red-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Youtube className="text-white" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">YouTube</h4>
                 <p className="text-white/50 text-sm mb-4">Video explanations of PBQs and visualizations.</p>
                 <div className="text-xs font-mono text-red-400 group-hover:underline">SUBSCRIBE & COMMENT &rarr;</div>
              </a>

              {/* LinkedIn */}
              <a href="#" className="group border border-white/10 bg-white/[0.02] hover:bg-blue-900/10 hover:border-blue-500/50 p-8 transition-all text-center">
                 <div className="w-12 h-12 bg-blue-700 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Linkedin className="text-white" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">LinkedIn</h4>
                 <p className="text-white/50 text-sm mb-4">If you would like to talk employment.</p>
                 <div className="text-xs font-mono text-blue-400 group-hover:underline">CONNECT &rarr;</div>
              </a>

              {/* Email */}
              <a href="#" className="group border border-white/10 bg-white/[0.02] hover:bg-gray-800 hover:border-white/50 p-8 transition-all text-center">
                 <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mail className="text-white" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">Email</h4>
                 <p className="text-white/50 text-sm mb-4">Resource requests or bug reports.</p>
                 <div className="text-xs font-mono text-gray-300 group-hover:underline">SEND MESSAGE &rarr;</div>
              </a>
           </div>

           {/* Footer Line */}
           <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/30 text-xs font-mono">
              <div>&copy; {new Date().getFullYear()} SHELNET ORG.</div>
              <div className="mt-4 md:mt-0 space-x-6">
                 <span className="hover:text-white cursor-pointer">PRIVACY</span>
                 <span className="hover:text-white cursor-pointer">TERMS</span>
                 <span className="hover:text-white cursor-pointer">SOURCE</span>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}