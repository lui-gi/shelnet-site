// src/pages/a-plus-exams.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const APlusExams = () => {
  const { resources, loading, error } = useManifest('aPlusExams');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /exams/a-plus && ls" accent="red" className="mb-4" />
        <Workspace accent="red" pathSegments={['exams', 'a-plus']} items={resources}
          itemPrefix="EXAM_0" statusLabel="RUNNING:" metaRight="220-1202" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default APlusExams;
