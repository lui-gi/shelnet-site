import { useState, useEffect, useRef } from 'react';
import { useNews } from '../../utils/useNews';

const BASE_INTRO_TEXT = `Shelnet is a free study hub for all things cybersecurity.

Contents:
• Completely free, self-made practice PBQs and Exams
• YouTube walkthroughs
• A searchable, live-synced archive of my personal notes

`;

const FALLBACK_NEWS = `News 1/4/26:
• Released Security+ resources and my personal notes.`;

const commands = [
  { cmd: 'whoami', out: 'shelnet' },
  { cmd: 'ip a | grep inet', out: 'inet 10.0.0.42/24 brd 10.0.0.255 scope global eth0' },
  { cmd: 'cat current_status.txt', out: 'Rolling out Security+ PBQs.' },
  { cmd: 'ls', out: 'PBQS     Exams     About     contact.pcap' }
];

const TerminalComponent = () => {
  const { newsText, loading, error } = useNews();

  // Build intro text dynamically
  const introText = BASE_INTRO_TEXT + (newsText || FALLBACK_NEWS);

  const [typedCmd, setTypedCmd] = useState('');
  const [output, setOutput] = useState(null); // null = hidden, string = visible
  const [showCursor, setShowCursor] = useState(true);

  // Refs for managing the loop safely
  const isMounted = useRef(true);

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

export default TerminalComponent;
