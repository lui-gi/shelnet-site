// src/pages/a-plus-pbqs.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const APlusPBQs = () => {
  const { resources, loading, error } = useManifest('aPlusPBQs');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /pbqs/a-plus && ls" accent="red" className="mb-4" />
        <Workspace
          accent="red"
          pathSegments={['pbqs', 'a-plus']}
          items={resources}
          itemPrefix="PBQ_0"
          statusLabel="EXECUTING:"
          metaRight="220-1202"
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default APlusPBQs;
