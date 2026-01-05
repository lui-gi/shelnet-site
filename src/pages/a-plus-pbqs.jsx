import { useState } from 'react';
import { Terminal, Monitor, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import GridBackground from '../components/shared/GridBackground';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';
import { useManifest } from '../utils/useManifest';

const APlusPBQs = () => {
  const [selectedPBQ, setSelectedPBQ] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load PBQs from manifest
  const { resources: pbqs, loading, error } = useManifest('aPlusPBQs');

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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 text-green-500 animate-spin" />
                <div className="font-mono text-sm text-white/60">Loading simulations...</div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="border border-red-500/50 bg-red-500/10 p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <div className="font-bold text-red-400 mb-2">Failed to Load Resources</div>
                  <div className="text-sm text-white/70">{error}</div>
                  <div className="text-xs text-white/50 mt-2">
                    Please check your connection and try refreshing the page.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Layout: Sidebar + Viewer - Only show when loaded */}
          {!loading && !error && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default APlusPBQs;