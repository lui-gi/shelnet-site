// src/pages/security-plus-exams.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';

const SecurityPlusExams = () => {
  const { resources, loading, error } = useManifest('securityPlusExams');
  return (
    <TerminalShell>
      <Workspace accent="blue" items={resources} itemPrefix="EXAM_0"
        statusLabel="RUNNING:" metaRight="SY0-701" loading={loading} error={error} />
    </TerminalShell>
  );
};

export default SecurityPlusExams;
