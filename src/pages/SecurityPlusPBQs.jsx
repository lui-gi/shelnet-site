import { useState } from 'react';
import { Terminal, Shield } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import GridBackground from '../components/shared/GridBackground';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';
import { convertLegacyPath } from '../utils/resourcePaths';

const SecurityPlusPBQs = () => {
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const pbqs = [
    {
      id: 1,
      title: 'Identity Access Management',
      file: convertLegacyPath('./security-pbqs/iam-pbq-1.html'),
      description: 'Assign the correct permissions based on "Least Privilege."'
    },
    {
      id: 2,
      title: 'Firewall ACL Configuration',
      file: convertLegacyPath('./security-pbqs/firewall-acl-pbq-2.html'),
      description: 'Secure a network by assigning correct action (allow/deny) for specific traffic flows.'
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
            icon={<Shield size={20} />}
            iconColor="blue"
            title="Security+ PBQs"
            subtitle="SY0-701 // PERFORMANCE BASED QUESTIONS"
            description="Select a PBQ from the list below to begin. Each simulation tests practical skills required for the Security+ exam."
          />

          {/* Main Layout: Sidebar + Viewer */}
          <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>

            {/* Sidebar - PBQ List */}
            {!isFullscreen && (
              <PBQSidebar
                items={pbqs}
                selectedItem={selectedPBQ}
                onSelectItem={setSelectedPBQ}
                themeColor="blue"
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
              themeColor="blue"
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

export default SecurityPlusPBQs;