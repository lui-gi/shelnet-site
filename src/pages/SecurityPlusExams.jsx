import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Maximize2, ExternalLink, ChevronLeft, Shield, Play } from 'lucide-react';

const SecurityPlusExams = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // DATA: This points to the file in your /public/sec-exams/ folder
  const exams = [
    { 
      id: 1, 
      title: 'Security+ SY0-701 Practice Exam 1', 
      // Ensure you create this folder and file in 'public'
      file: '/sec-exams/practice-exam-1.html', 
      description: '90 Questions covering General Security Concepts, Threats, Vulnerabilities, and Architecture.' 
    },
    // Add more exams here in the future
  ];

  const handleOpenInNewTab = () => {
    if (selectedExam) {
      window.open(selectedExam.file, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* PADDING-TOP: 24 (6rem) to clear the fixed navbar */}
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER SECTION */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-blue-400 transition-colors font-mono text-sm mb-6">
              <ChevronLeft size={16} />
              ../BACK_TO_HOME
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/50 rounded flex items-center justify-center">
                <Shield size={20} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold uppercase tracking-tight">Security+ Exams</h1>
                <div className="text-sm text-white/50 font-mono">SY0-701 // FULL SIMULATIONS</div>
              </div>
            </div>
            <div className="text-white/60 max-w-2xl">
              Full-length practice exams for CompTIA Security+. Select an exam or quiz from the list to initialize the secure environment.
            </div>
          </div>

          {/* MAIN LAYOUT GRID */}
          <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>
            
            {/* SIDEBAR (Hidden in fullscreen) */}
            {!isFullscreen && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14} />
                  Available Exams
                </div>
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left p-4 border transition-all group ${
                      selectedExam?.id === exam.id
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-sm text-blue-400/80">EXAM_0{exam.id}</div>
                      {selectedExam?.id === exam.id && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{exam.title}</div>
                    <div className="text-xs text-white/50 leading-relaxed">{exam.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* VIEWER AREA */}
            <div className="border border-white/10 bg-[#0c0c0c] overflow-hidden flex flex-col" style={{ height: isFullscreen ? '90vh' : '80vh' }}>
              
              {/* VIEWER TOOLBAR */}
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
                  <div className="text-sm font-mono truncate max-w-[200px] md:max-w-none">
                    {selectedExam ? (
                      <>
                        <span className="text-blue-400">RUNNING:</span> {selectedExam.title}
                      </>
                    ) : (
                      <span className="text-white/40">Waiting for selection...</span>
                    )}
                  </div>
                </div>
                
                {selectedExam && (
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

              {/* IFRAME CONTAINER */}
              <div className="flex-1 relative bg-[#0c0c0c] flex flex-col">
                {selectedExam ? (
                  <iframe
                    src={selectedExam.file}
                    className="w-full h-full border-0"
                    title={selectedExam.title}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/40 bg-white/[0.02]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Play size={24} className="ml-1 opacity-50" />
                    </div>
                    <div className="font-mono text-sm">SELECT AN EXAM TO BEGIN</div>
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

export default SecurityPlusExams;