// src/pages/a-plus-pbqs.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';

const APlusPBQs = () => {
  const { resources, loading, error } = useManifest('aPlusPBQs');
  return (
    <TerminalShell cwd={['resources', 'pbqs', 'a-plus']} accent="red">
      <Workspace accent="red" items={resources} itemPrefix="PBQ_0"
        statusLabel="EXECUTING:" metaRight="220-1202" loading={loading} error={error} />
    </TerminalShell>
  );
};

export default APlusPBQs;
