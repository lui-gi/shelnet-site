import React from 'react';
import { Terminal } from 'lucide-react';
import { themeColors } from '../../config/themeColors';

/**
 * Reusable sidebar component for displaying selectable items (PBQs or Exams).
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items [{id, title, file, description}]
 * @param {Object} props.selectedItem - Currently selected item
 * @param {Function} props.onSelectItem - Click handler for item selection
 * @param {String} props.themeColor - Theme color ('red' | 'blue' | 'purple' | 'orange')
 * @param {String} props.itemPrefix - Prefix for item labels (e.g., 'PBQ_0' or 'EXAM_0')
 * @param {String} props.sidebarTitle - Title for the sidebar (e.g., 'Available Simulations')
 * @param {Boolean} props.showHoverEffect - Optional: Show hover color effect on titles
 */
const PBQSidebar = ({
  items,
  selectedItem,
  onSelectItem,
  themeColor = 'green',
  itemPrefix = 'PBQ_0',
  sidebarTitle = 'Available Simulations',
  showHoverEffect = false
}) => {
  const colors = themeColors[themeColor];

  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Terminal size={14} />
        {sidebarTitle}
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectItem(item)}
          className={`w-full text-left p-4 border transition-all ${showHoverEffect ? 'group' : ''} ${
            selectedItem?.id === item.id
              ? `${colors.borderActive} ${colors.bgActive} text-white`
              : `${colors.border} bg-white/[0.02] text-white/70 ${colors.borderHover} ${colors.bgHover}`
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`font-bold text-sm ${colors.textMuted}`}>
              {itemPrefix}{item.id}
            </div>
            {selectedItem?.id === item.id && (
              <div className={`w-2 h-2 ${colors.pulse} rounded-full animate-pulse`}></div>
            )}
          </div>
          <div className={`font-semibold mb-1 ${showHoverEffect ? `${colors.textHover} transition-colors` : ''}`}>
            {item.title}
          </div>
          <div className="text-xs text-white/50 leading-relaxed">{item.description}</div>
        </button>
      ))}
    </div>
  );
};

export default PBQSidebar;
