import { useState } from 'react';
import { Layers, Play, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import PBQSidebar from '../components/shared/PBQSidebar';
import ContentViewer from '../components/shared/ContentViewer';
import { useManifest } from '../utils/useManifest';

const Visualizations = () => {
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load visualizations from manifest
  const { resources: visualizations, loading, error } = useManifest('visualizations');

  const handleOpenInNewTab = () => {
    if (selectedVisualization) {
      window.open(selectedVisualization.file, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* PADDING-TOP: 24 (6rem) to clear the fixed navbar */}
      <div className="pt-24 px-6 pb-12 relative">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* HEADER SECTION */}
          <PageHeader
            icon={<Layers size={20} />}
            iconColor="purple"
            title="Visualizations"
            subtitle="CYBERSECURITY CONCEPTS"
            description="Interactive visual explanations of cybersecurity concepts, protocols, and attack scenarios. Select a visualization from the list to explore."
          />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 text-purple-500 animate-spin" />
                <div className="font-mono text-sm text-white/60">Loading visualizations...</div>
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

          {/* MAIN LAYOUT GRID - Only show when loaded */}
          {!loading && !error && (
            <div className={`grid gap-6 transition-all duration-300 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-[300px_1fr]'}`}>

            {/* SIDEBAR (Hidden in fullscreen) */}
            {!isFullscreen && (
              <PBQSidebar
                items={visualizations}
                selectedItem={selectedVisualization}
                onSelectItem={setSelectedVisualization}
                themeColor="purple"
                itemPrefix="VIZ_0"
                sidebarTitle="Visualizations"
                showHoverEffect={true}
              />
            )}

            {/* VIEWER AREA */}
            <ContentViewer
              selectedItem={selectedVisualization}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              onOpenInNewTab={handleOpenInNewTab}
              themeColor="purple"
              statusLabel="VIEWING:"
              emptyStateIcon={
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Play size={24} className="ml-1 opacity-50" />
                </div>
              }
              emptyStateText="SELECT A VISUALIZATION TO EXPLORE"
              height="80vh"
              fullscreenHeight="90vh"
              showSandbox={true}
            />

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
