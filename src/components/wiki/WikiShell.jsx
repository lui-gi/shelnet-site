// src/components/wiki/WikiShell.jsx
// Two-pane shell for /wiki. Reuses TwoPane from components/tui/ascii to keep
// the visual vocabulary consistent with /resources pages. Purple accent.
import TerminalShell from '../tui/TerminalShell';
import { TwoPane } from '../tui/ascii';
import { WIKI_ACCENT } from '../../config/wikiConfig';
import { SHELL } from '../../config/theme';

const WikiShell = ({ sidebar, children, currentPath }) => {
  const cmd = currentPath ? `cat ${currentPath}.md` : 'ls';
  return (
    <TerminalShell fill>
      <div className="flex flex-col min-h-0 flex-1 font-mono text-sm">
        <div className="px-2 py-1 text-xs">
          <span style={{ color: SHELL.dim }}>guest@shelnet</span>:
          <span style={{ color: SHELL.green }}>~/wiki</span>$ {cmd}
        </div>
        <TwoPane
          hex={WIKI_ACCENT}
          leftTitle="sidebar"
          rightTitle={currentPath || 'home'}
          left={<div className="pr-2">{sidebar}</div>}
          right={<div className="pl-1 pr-2 overflow-y-auto h-full">{children}</div>}
          fill
          className="flex-1"
        />
      </div>
    </TerminalShell>
  );
};

export default WikiShell;
