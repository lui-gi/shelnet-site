// src/pages/visualizations.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const Visualizations = () => {
  const { resources, loading, error } = useManifest('visualizations');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /visualizations && ls" accent="purple" className="mb-4" />
        <Workspace accent="purple" pathSegments={['visualizations']} items={resources}
          itemPrefix="VIZ_0" statusLabel="VIEWING:" loading={loading} error={error} showSandbox />
      </div>
    </div>
  );
};
export default Visualizations;
