// src/pages/visualizations.jsx
// Playground: the visualizations workspace (annotated rail + live run pane).
// ?m=<id> deep-links a specific module; each module gets a small ascii glyph.
import { useSearchParams } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import Workspace from '../components/tui/Workspace';
import { useManifest } from '../utils/useManifest';
import { getVisualizations } from '../utils/manifestService';

// Keyword → ascii glyph; falls back to ▸.
const GLYPHS = [
  [/key|crypt|cipher|pki/i, '▦'],
  [/nmap|scan|port/i, '↯'],
  [/osi|model|layer|network/i, '≡'],
  [/linux|shell|command|terminal|bash/i, '$'],
];
const glyphFor = (item) => {
  const t = `${item.title} ${item.description || ''}`;
  const hit = GLYPHS.find(([re]) => re.test(t));
  return hit ? hit[1] : '▸';
};

const Visualizations = () => {
  const [params] = useSearchParams();
  const { manifest, loading, error } = useManifest();
  const items = manifest ? getVisualizations(manifest) : [];
  const groups = [{ type: 'viz', label: null, prefix: 'VIZ_0', items }];

  return (
    <TerminalShell fill>
      <Workspace accent="purple" groups={groups}
        statusLabel="VIEWING:" loading={loading} error={error} showSandbox
        railLabel="modules" initialId={params.get('m')} iconFor={glyphFor} />
    </TerminalShell>
  );
};

export default Visualizations;
