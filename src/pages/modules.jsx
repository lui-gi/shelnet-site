// src/pages/modules.jsx
// Route page for the interactive modules terminal. Fills the viewport between the
// global bars and hands the manifest to the engine (foundations list comes from it).
import TerminalShell from '../components/tui/TerminalShell';
import Terminal from '../components/terminal/Terminal';
import { useManifest } from '../utils/useManifest';

const Modules = () => {
  const { manifest } = useManifest();
  return (
    <TerminalShell fill>
      <Terminal manifest={manifest} />
    </TerminalShell>
  );
};

export default Modules;
