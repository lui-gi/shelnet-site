// src/pages/a-plus-exams.jsx
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';

const APlusExams = () => {
  const { resources, loading, error } = useManifest('aPlusExams');
  return (
    <TerminalShell>
      <Workspace accent="red" items={resources} itemPrefix="EXAM_0"
        statusLabel="RUNNING:" metaRight="220-1202" loading={loading} error={error} />
    </TerminalShell>
  );
};

export default APlusExams;
