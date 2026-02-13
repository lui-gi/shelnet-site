import React from 'react';
import { Maximize2, ExternalLink, ChevronLeft } from 'lucide-react';
import { themeColors } from '../../config/themeColors';

/**
 * Reusable content viewer component for displaying iframe simulations with controls.
 *
 * @param {Object} props
 * @param {Object} props.selectedItem - Currently selected item {title, file}
 * @param {Boolean} props.isFullscreen - Fullscreen state
 * @param {Function} props.onToggleFullscreen - Fullscreen toggle handler
 * @param {Function} props.onOpenInNewTab - New tab handler
 * @param {String} props.themeColor - Theme color ('red' | 'blue' | 'purple' | 'orange')
 * @param {String} props.statusLabel - Status label text (e.g., 'EXECUTING:' or 'RUNNING:')
 * @param {ReactNode} props.emptyStateIcon - Icon to display in empty state
 * @param {String} props.emptyStateText - Main empty state text
 * @param {String} props.emptyStateSubtext - Optional empty state subtext
 * @param {String} props.height - Normal height (e.g., '70vh' or '80vh')
 * @param {String} props.fullscreenHeight - Fullscreen height (e.g., '90vh')
 * @param {Boolean} props.showSandbox - Optional: Add sandbox attribute to iframe
 */
const ContentViewer = ({
  selectedItem,
  isFullscreen,
  onToggleFullscreen,
  onOpenInNewTab,
  themeColor = 'green',
  statusLabel = 'EXECUTING:',
  emptyStateIcon,
  emptyStateText = 'No item selected',
  emptyStateSubtext,
  height = '70vh',
  fullscreenHeight = '90vh',
  showSandbox = false
}) => {
  const colors = themeColors[themeColor];

  return (
    <div
      className="border border-white/10 bg-black/50 overflow-hidden flex flex-col"
      style={{ height: isFullscreen ? fullscreenHeight : height }}
    >
      {/* Viewer Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          {isFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="text-sm font-mono truncate max-w-[200px] md:max-w-none">
            {selectedItem ? (
              <>
                <span className={colors.text}>{statusLabel}</span> {selectedItem.title}
              </>
            ) : (
              <span className="text-white/40">Waiting for input...</span>
            )}
          </div>
        </div>

        {selectedItem && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFullscreen}
              className="p-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Expand"}
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onOpenInNewTab}
              className={`p-2 border border-white/20 ${colors.hoverBorder} ${colors.textHover} transition-colors`}
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>

      {/* iFrame Container */}
      <div className="flex-1 relative bg-white">
        {selectedItem ? (
          <iframe
            src={selectedItem.file}
            className="w-full h-full border-0"
            title={selectedItem.title}
            {...(showSandbox && { sandbox: "allow-same-origin allow-scripts allow-forms allow-popups" })}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/40 bg-black/50">
            <div className="text-center">
              {emptyStateIcon}
              <div className="font-mono text-sm">{emptyStateText}</div>
              {emptyStateSubtext && (
                <div className="text-xs mt-2">{emptyStateSubtext}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentViewer;
