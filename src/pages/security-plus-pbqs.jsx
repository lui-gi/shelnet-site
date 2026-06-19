// src/pages/security-plus-pbqs.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const SecurityPlusPBQs = () => {
  const { resources, loading, error } = useManifest('securityPlusPBQs');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /pbqs/security-plus && ls" accent="blue" className="mb-4" />
        <Workspace accent="blue" pathSegments={['pbqs', 'security-plus']} items={resources}
          itemPrefix="PBQ_0" statusLabel="EXECUTING:" metaRight="SY0-701" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default SecurityPlusPBQs;
