import React, { useState } from 'react';
import { Terminal, Maximize2, ExternalLink, ChevronLeft, Shield } from 'lucide-react';

const SecurityPlusPBQs = () => {
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PLACEHOLDER DATA: Update these paths to match your actual files in 'public/security-pbqs'
  const pbqs = [
    { 
      id: 1, 
      title: 'Firewall Configuration', 
      file: '/security-pbqs/firewall-config-pbq-1.html', 
      description: 'Configure ACLs to permit/deny traffic based on security requirements.' 
    },
    { 
      id: 2, 
      title: 'Vulnerability Scanning', 
      file: '/security-pbqs/vuln-scan-pbq-2.html', 
      description: 'Analyze vulnerability scan logs and prioritize remediation.' 
    },
    { 
      id: 3, 
      title: 'Secure Wireless Setup', 
      file: '/security-pbqs/wireless-setup-pbq-3.html', 
      description: 'Configure WPA3 enterprise and RADIUS authentication.' 
    },
    { 
      id: 4, 
      title: 'Incident Response', 
      file: '/security-pbqs/incident-response-pbq-4.html', 
      description: 'Identify indicators of compromise (IoC) and isolate affected systems.' 
    },
    { 
      id: 5, 
      title: 'Data Privacy Controls', 
      file: '/security-pbqs/data-privacy-pbq-5.html', 
      description: 'Implement DLP policies and classify sensitive data types.' 
    },
  ];

  const handleOpenInNewTab = () => {
    if (selectedPBQ) {
      window.open(selectedPBQ.file, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* MAIN CONTENT */}
      {/* pt-24 ensures content clears the fixed Navbar from Layout.jsx */}
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Header & Back Button */}
          <div className="mb-8">
            {/* Changed from <Link> to <a> to prevent crashes if run outside a Router context */}
            <a href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-blue-400 transition-colors font-mono text-sm mb-6">
              <ChevronLeft size={16} />
              ../BACK_TO_HOME
            </a>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/50 rounded flex items-center justify-center">
                <Shield size={20} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-tight">Security+ PBQs</h1>
                <div className="text-sm text-white/50 font-mono">SY0-701 // PERFORMANCE BASED QUESTIONS</div>
              </div>
            </div>
            <div className="text-white/60 max-w-2xl">
              Select a PBQ from the list below to begin. Each simulation tests practical skills required for the Security+ exam.
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
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-sm text-blue-400/80">PBQ_0{pbq.id}</div>
                      {selectedPBQ?.id === pbq.id && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
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
                        <span className="text-blue-400">EXECUTING:</span> {selectedPBQ.file}
                      </>
                    ) : (
                      <span className="text-white/40">Waiting for input...</span>
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
                      className="p-2 border border-white/20 hover:border-blue-500 hover:text-blue-400 transition-colors"
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
                      <div className="text-xs mt-2">Select a simulation to initialize environment</div>
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

export default SecurityPlusPBQs;