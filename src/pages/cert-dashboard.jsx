// src/pages/cert-dashboard.jsx
// One screen per cert: pbqs + exams grouped in a single Workspace, viewer on
// the right, the cert's accent applied. Unknown :cert redirects to the list.
import { useParams, Navigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';
import { getCert } from '../utils/manifestService';

const CertDashboard = () => {
  const { cert: slug } = useParams();
  const { manifest, loading, error } = useManifest();
  const cert = manifest ? getCert(manifest, slug) : null;

  // Manifest loaded but no such cert → bounce to the cert list.
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
        loading={loading}
        error={error}
      />
    </TerminalShell>
  );
};

export default CertDashboard;
