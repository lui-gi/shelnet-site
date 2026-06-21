// src/pages/cert-dashboard.jsx
// One screen per cert: pbqs + exams grouped in a single Workspace, viewer on
// the right, the cert's accent applied. Unknown :cert redirects to the list.
// ?focus=pbqs|exams (from the cert console) pre-selects that group's first file.
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';
import { getCert } from '../utils/manifestService';

const CertDashboard = () => {
  const { cert: slug } = useParams();
  const [params] = useSearchParams();
  const focus = params.get('focus'); // 'pbqs' | 'exams' | null
  const { manifest, loading, error } = useManifest();
  const cert = manifest ? getCert(manifest, slug) : null;

  if (!loading && !error && manifest && !cert) {
    return <Navigate to="/resources/certs" replace />;
  }

  return (
    <TerminalShell fill>
      <Workspace
        accent={cert?.accent || 'green'}
        groups={cert?.groups || []}
        statusLabel="EXECUTING:"
        metaRight={cert?.code || ''}
        initialType={focus}
        loading={loading}
        error={error}
      />
    </TerminalShell>
  );
};

export default CertDashboard;
