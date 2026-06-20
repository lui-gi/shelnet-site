// src/pages/security-plus-pbqs.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';

const SecurityPlusPBQs = () => {
  const { resources, loading, error } = useManifest('securityPlusPBQs');
  return (
    <TerminalShell cwd={['resources', 'pbqs', 'security-plus']} accent="blue">
      <Workspace accent="blue" items={resources} itemPrefix="PBQ_0"
        statusLabel="EXECUTING:" metaRight="SY0-701" loading={loading} error={error} />
    </TerminalShell>
  );
};

export default SecurityPlusPBQs;
