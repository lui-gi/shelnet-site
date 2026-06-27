// src/pages/modules.jsx
// Route page for the interactive modules. Two states share one viewport-filling
// shell:
//   /resources/modules        -> the lobby terminal (Terminal.jsx), the launcher
//   /resources/modules/:slug   -> a GUI room: the load ceremony plays, then the
//                                 two-pane Room mounts with a collapsed quake
//                                 console docked at the bottom.
// `load <slug>` in the lobby navigates here (with a ceremony flag); a deep link /
// refresh on an already-started room resumes straight into it.
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import Terminal from '../components/terminal/Terminal';
import Room from '../components/room/Room';
import CeremonyLog from '../components/room/CeremonyLog';
import QuakeConsole from '../components/room/QuakeConsole';
import { useManifest } from '../utils/useManifest';
import { getModule, accentForCategory } from '../config/moduleRegistry';
import { getModuleProgress } from '../utils/moduleProgress';
import { ACCENTS } from '../config/theme';

const hexFor = (category) => (ACCENTS[accentForCategory(category)] || ACCENTS.green).hex;

// Inline note for an unknown or not-yet-live slug, with a way back to the lobby.
const RoomMissing = ({ slug, status, onBack }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);
  return (
    <div className="font-mono text-sm text-white/70">
      <div className="text-rose-400/90">
        {status === 'soon' ? `module not yet available: ${slug}` : `no such module: ${slug}`}
      </div>
      <button type="button" onClick={onBack} className="mt-3 text-white/50 underline-offset-2 hover:underline">
        ← back to modules (Esc)
      </button>
    </div>
  );
};

// Loads the room's data object, plays the ceremony, then mounts Room + dock.
const RoomView = ({ stub, manifest, startWithCeremony, onExit, onLoad }) => {
  const [content, setContent] = useState(null);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState(startWithCeremony ? 'ceremony' : 'room');
  const hex = hexFor(stub.category);

  useEffect(() => {
    let alive = true;
    stub.load()
      .then((m) => { if (alive) setContent(m.default); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [stub]);

  if (failed) {
    return (
      <div className="font-mono text-sm text-amber-400/90">
        {stub.name} failed to load; not yet available.{' '}
        <button type="button" onClick={onExit} className="text-white/50 underline-offset-2 hover:underline">← back</button>
      </div>
    );
  }
  if (!content) return <div className="font-mono text-sm text-white/40">mounting room…</div>;

  const module = {
    slug: stub.slug,
    name: stub.name,
    category: stub.category,
    difficulty: stub.difficulty,
    stageKind: stub.stageKind || content.stageKind,
    stageConfig: content.stageConfig,
    ceremony: content.ceremony,
    sections: content.sections,
  };

  if (phase === 'ceremony') {
    return <CeremonyLog module={module} accentHex={hex} onDone={() => setPhase('room')} />;
  }

  return (
    <>
      <Room module={module} />
      <QuakeConsole slug={stub.slug} manifest={manifest} accentHex={hex} onLoad={onLoad} onExit={onExit} />
    </>
  );
};

const Modules = () => {
  const { slug } = useParams();
  const { manifest } = useManifest();
  const navigate = useNavigate();
  const location = useLocation();

  if (!slug) {
    return (
      <TerminalShell fill>
        <Terminal manifest={manifest} />
      </TerminalShell>
    );
  }

  const stub = getModule(slug);
  if (!stub || stub.status !== 'live') {
    return (
      <TerminalShell fill>
        <RoomMissing slug={slug} status={stub?.status} onBack={() => navigate('/resources/modules')} />
      </TerminalShell>
    );
  }

  // Play the ceremony when arriving from the lobby (or on a fresh, unstarted
  // room); a deep-link refresh of an in-progress room resumes straight in.
  const startWithCeremony = !!location.state?.ceremony || !getModuleProgress(slug);

  return (
    <TerminalShell fill>
      <RoomView
        key={slug}
        stub={stub}
        manifest={manifest}
        startWithCeremony={startWithCeremony}
        onExit={() => navigate('/resources/modules')}
        onLoad={(s) => navigate(`/resources/modules/${s}`, { state: { ceremony: true } })}
      />
    </TerminalShell>
  );
};

export default Modules;
