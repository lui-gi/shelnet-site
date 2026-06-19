// src/components/tui/Prompt.jsx
import { PROMPT } from '../../config/theme';
import { themeColors } from '../../config/themeColors';

/**
 * Unified shell-prompt section header: `shelnet:~$ cd /pbqs`
 * @param {string} command - text after the prompt (e.g. "cd /pbqs && ls")
 * @param {string} accent  - theme color key for the prompt glyph (default green)
 */
const Prompt = ({ command, accent = 'green', className = '' }) => {
  const colors = themeColors[accent] || themeColors.green;
  return (
    <div className={`font-mono text-sm ${className}`}>
      <span className={colors.text}>{PROMPT}</span>{' '}
      <span className="text-white/70">{command}</span>
    </div>
  );
};

export default Prompt;
