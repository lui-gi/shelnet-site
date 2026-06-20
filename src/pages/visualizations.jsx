// src/pages/visualizations.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';
import { getVisualizations } from '../utils/manifestService';

const Visualizations = () => {
  const { manifest, loading, error } = useManifest();
  const items = manifest ? getVisualizations(manifest) : [];
  const groups = [{ type: 'viz', label: null, prefix: 'VIZ_0', items }];
  return (
    <TerminalShell>
      <Workspace accent="purple" groups={groups}
        statusLabel="VIEWING:" loading={loading} error={error} showSandbox />
    </TerminalShell>
  );
};

export default Visualizations;
