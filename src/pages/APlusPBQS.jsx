import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Maximize2, ExternalLink, ChevronLeft, Monitor } from 'lucide-react';

const APlusPBQs = () => {
  const [scrolled, setScrolled] = useState(false);
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Define your 5 PBQs here - update the paths to match your actual HTML file locations
  const pbqs = [
    { id: 1, title: 'Printer Configuration', file: '/pbqs/printer-config.html', description: 'Configure network printer settings' },
    { id: 2, title: 'Network Setup', file: '/pbqs/network-setup.html', description: 'Set up a small office network' },
    { id: 3, title: 'Hardware Troubleshooting', file: '/pbqs/hardware-troubleshoot.html', description: 'Diagnose and fix hardware issues' },
    { id: 4, title: 'Windows Configuration', file: '/pbqs/windows-config.html', description: 'Configure Windows OS settings' },
    { id: 5, title: 'Mobile Device Setup', file: '/pbqs/mobile-setup.html', description: 'Configure mobile device settings' },
  ];

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenInNewTab = () => {
    if (selectedPBQ) {
      window.open(selectedPBQ.file, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-black/80 backdrop-blur-sm border-white/10 py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
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
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-mono text-sm">
            <ChevronLeft size={16} />
            BACK TO HOME
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 border border-green-500/50 rounded flex items-center justify-center">
                <Monitor size={20} className="text-green-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-tight">A+ Core 2 PBQs</h1>
                <div className="text-sm text-white/50 font-mono">220-1202 // PERFORMANCE BASED QUESTIONS</div>
              </div>
            </div>
            <div className="text-white/60 max-w-2xl">
              Select a PBQ from the list below to begin. Each simulation tests practical skills required for the A+ Core 2 exam.
            </div>
          </div>

          {/* Main Layout: Sidebar + Viewer */}
          <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>
            
            {/* Sidebar - PBQ List */}
            {!isFullscreen && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14} />
                  Available Simulations
                </div>
                {pbqs.map((pbq) => (
                  <button
                    key={pbq.id}
                    onClick={() => setSelectedPBQ(pbq)}
                    className={`w-full text-left p-4 border transition-all ${
                      selectedPBQ?.id === pbq.id
                        ? 'border-green-500 bg-green-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-sm">PBQ {pbq.id}</div>
                      {selectedPBQ?.id === pbq.id && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="font-semibold mb-1">{pbq.title}</div>
                    <div className="text-xs text-white/50">{pbq.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Viewer Area */}
            <div className="border border-white/10 bg-black/50 overflow-hidden flex flex-col" style={{ height: isFullscreen ? '90vh' : '70vh' }}>
              {/* Viewer Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  <div className="text-sm font-mono">
                    {selectedPBQ ? (
                      <>
                        <span className="text-green-400">LOADED:</span> {selectedPBQ.title}
                      </>
                    ) : (
                      <span className="text-white/40">Select a PBQ to begin</span>
                    )}
                  </div>
                </div>
                
                {selectedPBQ && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors"
                      title={isFullscreen ? "Exit fullscreen" : "Expand"}
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button
                      onClick={handleOpenInNewTab}
                      className="p-2 border border-white/20 hover:border-green-500 hover:text-green-400 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* iFrame Container */}
              <div className="flex-1 relative bg-white">
                {selectedPBQ ? (
                  <iframe
                    src={selectedPBQ.file}
                    className="w-full h-full border-0"
                    title={selectedPBQ.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/40 bg-black/50">
                    <div className="text-center">
                      <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                      <div className="font-mono text-sm">No PBQ selected</div>
                      <div className="text-xs mt-2">Choose a simulation from the list to begin</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default APlusPBQs;