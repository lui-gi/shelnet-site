import { useState } from 'react';
import { Terminal, Shield } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import GridBackground from '../components/shared/GridBackground';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';

const SecurityPlusPBQs = () => {
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PLACEHOLDER DATA: Update these paths to match your actual files in 'public/security-pbqs'
  const pbqs = [
    { 
      /*
      id: 1, 
      title: 'In progress...', 
      file: './security-pbqs/firewall-config-pbq-1.html', 
      description: 'Most likely will be about ACLs.' 
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
    },*/}
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
            description="[In progress...] Select a PBQ from the list below to begin. Each simulation tests practical skills required for the Security+ exam."
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