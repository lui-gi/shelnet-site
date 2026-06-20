// src/pages/visualizations.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';

const Visualizations = () => {
  const { resources, loading, error } = useManifest('visualizations');
  return (
    <TerminalShell cwd={['resources', 'visualizations']} accent="purple">
      <Workspace accent="purple" items={resources} itemPrefix="VIZ_0"
        statusLabel="VIEWING:" loading={loading} error={error} showSandbox />
    </TerminalShell>
  );
};

export default Visualizations;
