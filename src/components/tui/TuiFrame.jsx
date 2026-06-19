// src/components/tui/TuiFrame.jsx
import { themeColors } from '../../config/themeColors';

/**
 * Generic bordered TUI panel.
 * @param {string} accent       - theme color key (border/title tint)
 * @param {ReactNode} titleLeft  - left side of the top bar (e.g. "┤ shelnet · ~/resources ├")
 * @param {ReactNode} titleRight - right side of the top bar
 * @param {ReactNode} footerLeft - left side of the status bar (keyboard hints)
 * @param {ReactNode} footerRight- right side of the status bar
 * @param {ReactNode} children   - panel body
 */
const ACCENT_BORDER = {
  green: 'border-emerald-500/40', red: 'border-red-500/40', blue: 'border-blue-500/40',
  purple: 'border-purple-500/40', orange: 'border-orange-500/40', slate: 'border-slate-400/40',
};
const ACCENT_DIV = {
  green: 'border-emerald-500/25', red: 'border-red-500/25', blue: 'border-blue-500/25',
  purple: 'border-purple-500/25', orange: 'border-orange-500/25', slate: 'border-slate-400/25',
};

const TuiFrame = ({ accent = 'green', titleLeft, titleRight, footerLeft, footerRight, children, className = '' }) => {
  const colors = themeColors[accent] || themeColors.green;
  return (
    <div className={`border ${(ACCENT_BORDER[accent] || ACCENT_BORDER.green)} rounded-md font-mono bg-black/40 ${className}`}>
      {(titleLeft || titleRight) && (
        <div className={`flex items-center justify-between px-3 py-2 border-b ${(ACCENT_DIV[accent] || ACCENT_DIV.green)} text-xs`}>
          <span className={colors.text}>{titleLeft}</span>
          <span className="text-white/40">{titleRight}</span>
        </div>
      )}
      {children}
      {(footerLeft || footerRight) && (
        <div className={`flex items-center justify-between px-3 py-2 border-t ${(ACCENT_DIV[accent] || ACCENT_DIV.green)} text-[10.5px]`}>
          <span className="text-white/50">{footerLeft}</span>
          <span className={colors.text}>{footerRight}</span>
        </div>
      )}
    </div>
  );
};

export default TuiFrame;
