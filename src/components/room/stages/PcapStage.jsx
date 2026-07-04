// src/components/room/stages/PcapStage.jsx
// The `pcap` lab stage: a mocked Wireshark UI. Four panes (menu bar + display
// filter + packet list + details tree) render against a hand-authored table of
// captures in stageConfig. The stage tracks the currently loaded pcap, applied
// filter, and selected packet as internal state; it emits load / filter /
// action events via onEvent so the Room can test them against the active
// via:'stage' checkpoint. Nothing real is parsed.
//
// Stage contract: ({ config, accentHex, onEvent, active }) => JSX.
// Surface colors read from CSS custom properties on the Room root so the stage
// flips with the room's light/dark theme.
import { useRef, useEffect, useState } from 'react';

const PcapStage = ({ config = {}, accentHex, onEvent, active }) => {
  // Placeholder — replaced in Task 2.
  const { initialPcap = '(no capture)' } = config;
  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono text-xs leading-relaxed">
      <div style={{ color: 'var(--text-dim)' }}>
        <span style={{ color: accentHex }}>wireshark</span>
        {' · '}
        <span style={{ color: 'var(--text-mute)' }}>{initialPcap}</span>
      </div>
      <div className="mt-2" style={{ color: 'var(--text-dim)' }}>
        pcap stage online — panes wire up in Task 2.
      </div>
    </div>
  );
};

export default PcapStage;
