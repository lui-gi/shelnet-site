import { useState } from 'react';
import { Shield, Play } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import GridBackground from '../components/shared/GridBackground';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';

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
      <div className="pt-24 px-6 pb-12 relative">
        <GridBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* HEADER SECTION */}
          <PageHeader
            icon={<Shield size={20} />}
            iconColor="blue"
            title="Security+ Exams"
            subtitle="SY0-701 // FULL SIMULATIONS"
            description="Full-length practice exams for CompTIA Security+. Select an exam or quiz from the list to initialize the secure environment."
          />

          {/* MAIN LAYOUT GRID */}
          <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>

            {/* SIDEBAR (Hidden in fullscreen) */}
            {!isFullscreen && (
              <PBQSidebar
                items={exams}
                selectedItem={selectedExam}
                onSelectItem={setSelectedExam}
                themeColor="blue"
                itemPrefix="EXAM_0"
                sidebarTitle="Available Exams"
                showHoverEffect={true}
              />
            )}

            {/* VIEWER AREA */}
            <ContentViewer
              selectedItem={selectedExam}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onOpenInNewTab={handleOpenInNewTab}
              themeColor="blue"
              statusLabel="RUNNING:"
              emptyStateIcon={
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Play size={24} className="ml-1 opacity-50" />
                </div>
              }
              emptyStateText="SELECT AN EXAM TO BEGIN"
              height="80vh"
              fullscreenHeight="90vh"
              showSandbox={true}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPlusExams;