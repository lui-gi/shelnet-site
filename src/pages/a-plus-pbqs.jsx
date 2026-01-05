import { useState } from 'react';
import { Terminal, Monitor } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import GridBackground from '../components/shared/GridBackground';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';
import { convertLegacyPath } from '../utils/resourcePaths';

const APlusPBQs = () => {
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pbqs = [
    {
      id: 1,
      title: 'Network Connectivity',
      file: convertLegacyPath('./a-pbqs/network-connectivity-pbq-1.html'),
      description: 'Diagnose and repair internet connection issues using CLI tools.'
    },
    {
      id: 2,
      title: 'Boot Repair',
      file: convertLegacyPath('./a-pbqs/boot-repair-pbq-2.html'),
      description: 'Troubleshoot "Boot Device Not Found" errors and fix MBR.'
    },
    {
      id: 3,
      title: 'Suspicious Services',
      file: convertLegacyPath('./a-pbqs/suspicious-services-pbq-3.html'),
      description: 'Stop malicious services using Windows Task Manager.'
    },
    {
      id: 4,
      title: 'Phishing Investigation',
      file: convertLegacyPath('./a-pbqs/phishing-pbq-4.html'),
      description: 'Analyze emails to identify social engineering attacks.'
    },
    {
      id: 5,
      title: 'Disk Management',
      file: convertLegacyPath('./a-pbqs/disk-management-pbq-5.html'),
      description: 'Partition, format, and rename volumes safely.'
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
      <div className="pt-24 px-6 pb-12 relative">
        <GridBackground />
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header & Back Button */}
          <PageHeader
            icon={<Monitor size={20} />}
            iconColor="green"
            title="A+ Core 2 PBQs"
            subtitle="220-1202 // PERFORMANCE BASED QUESTIONS"
            description="Select a PBQ from the list below to begin. Each simulation tests practical skills required for the A+ Core 2 exam."
          />

          {/* Main Layout: Sidebar + Viewer */}
          <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>

            {/* Sidebar - PBQ List */}
            {!isFullscreen && (
              <PBQSidebar
                items={pbqs}
                selectedItem={selectedPBQ}
                onSelectItem={setSelectedPBQ}
                themeColor="green"
                itemPrefix="PBQ_0"
                sidebarTitle="Available Simulations"
              />
            )}

            {/* Viewer Area */}
            <ContentViewer
              selectedItem={selectedPBQ}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onOpenInNewTab={handleOpenInNewTab}
              themeColor="green"
              statusLabel="EXECUTING:"
              emptyStateIcon={<Terminal size={48} className="mx-auto mb-4 opacity-20" />}
              emptyStateText="No PBQ selected"
              emptyStateSubtext="Select a simulation to initialize environment"
              height="70vh"
              fullscreenHeight="90vh"
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default APlusPBQs;