// src/pages/security-plus-exams.jsx
import Workspace from '../components/tui/Workspace';
import Prompt from '../components/tui/Prompt';
import { useManifest } from '../utils/useManifest';

const SecurityPlusExams = () => {
  const { resources, loading, error } = useManifest('securityPlusExams');
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <Prompt command="cd /exams/security-plus && ls" accent="blue" className="mb-4" />
        <Workspace accent="blue" pathSegments={['exams', 'security-plus']} items={resources}
          itemPrefix="EXAM_0" statusLabel="RUNNING:" metaRight="SY0-701" loading={loading} error={error} />
      </div>
    </div>
  );
};
export default SecurityPlusExams;
