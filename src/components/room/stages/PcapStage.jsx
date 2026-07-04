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
import { useRef, useEffect, useState, useMemo } from 'react';

const norm = (s) => String(s).trim();

// Resolve a typed display filter to its matcher entry, or null on miss.
function lookupFilter(filters, input) {
  const trimmed = norm(input);
  for (const f of filters || []) {
    const ok = f.match instanceof RegExp
      ? f.match.test(trimmed)
      : norm(f.match).toLowerCase() === trimmed.toLowerCase();
    if (ok) return f;
  }
  return null;
}

const PcapStage = ({ config = {}, accentHex, onEvent, active }) => {
  const { pcaps = {}, initialPcap } = config;
  const [activePcap, setActivePcap] = useState(initialPcap);
  const [filterText, setFilterText] = useState('');
  const [appliedFilter, setAppliedFilter] = useState(null); // { keep, miss, note }
  const [selectedNo, setSelectedNo] = useState(null);
  const filterRef = useRef(null);

  const pcap = pcaps[activePcap] || { packets: [], filters: [], actions: [] };
  const visiblePackets = useMemo(() => {
    if (!appliedFilter || appliedFilter.miss) return pcap.packets;
    const keepSet = new Set(appliedFilter.keep);
    return pcap.packets.filter((p) => keepSet.has(p.no));
  }, [pcap.packets, appliedFilter]);

  // Default selection: first visible packet whenever the visible set changes.
  useEffect(() => {
    if (visiblePackets.length === 0) { setSelectedNo(null); return; }
    if (selectedNo == null || !visiblePackets.some((p) => p.no === selectedNo)) {
      setSelectedNo(visiblePackets[0].no);
    }
  }, [visiblePackets, selectedNo]);

  // Pull focus to the filter input when this stage becomes the active surface.
  useEffect(() => { if (active) filterRef.current?.focus(); }, [active]);

  const selectedPacket = selectedNo == null ? null : pcap.packets.find((p) => p.no === selectedNo);

  const applyFilter = () => {
    const input = filterText;
    if (!input.trim()) {
      setAppliedFilter(null);
      onEvent?.({ type: 'filter', filter: '', payload: { filter: '', matched: false, keep: null } });
      return;
    }
    const match = lookupFilter(pcap.filters, input);
    if (!match) {
      setAppliedFilter({ keep: [], miss: true });
      onEvent?.({ type: 'filter', filter: input.trim(), payload: { filter: input.trim(), matched: false, keep: null } });
      return;
    }
    setAppliedFilter({ keep: match.keep, miss: false, note: match.note });
    onEvent?.({ type: 'filter', filter: input.trim(), payload: { filter: input.trim(), matched: true, keep: match.keep } });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col font-mono text-xs leading-relaxed">
      {/* menu bar placeholder (Task 3 fills the buttons) */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-2 py-1"
        style={{ borderColor: 'var(--card-head-border)', color: 'var(--text-mute)' }}
      >
        <span style={{ color: accentHex }}>wireshark</span>
        <span className="ml-auto shrink-0" style={{ color: 'var(--text-dim)' }}>{activePcap}</span>
      </div>

      {/* filter bar */}
      <div
        className="flex shrink-0 items-center gap-2 rounded border px-2 py-1.5"
        style={{ borderColor: accentHex, background: 'var(--block-bg)', marginTop: '0.5rem' }}
        onClick={() => filterRef.current?.focus()}
      >
        <span aria-hidden="true" style={{ color: accentHex }}>&gt;</span>
        <input
          ref={filterRef}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyFilter(); } }}
          placeholder="display filter, e.g. ip.addr == 10.0.0.9"
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ color: 'var(--text-strong)', caretColor: 'var(--cursor)' }}
          spellCheck={false}
          autoComplete="off"
          aria-label="wireshark display filter"
        />
        <button
          type="button"
          onClick={applyFilter}
          className="shrink-0 rounded px-2 py-0.5 text-[0.7rem] font-semibold text-black"
          style={{ backgroundColor: accentHex }}
        >
          apply
        </button>
      </div>

      {/* packet list */}
      <div className="mt-2 min-h-0 flex-1 overflow-auto pr-1">
        {appliedFilter?.miss && (
          <div className="mb-1 text-amber-500">no display filter matches. check syntax.</div>
        )}
        {appliedFilter?.note && !appliedFilter.miss && (
          <div className="mb-1" style={{ color: 'var(--text-mute)' }}>{appliedFilter.note}</div>
        )}
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {['No.', 'Time', 'Source', 'Destination', 'Proto', 'Info'].map((h) => (
                <th
                  key={h}
                  className="border-b pb-1 pr-3 font-semibold"
                  style={{ borderColor: 'var(--block-border)', color: 'var(--text-mute)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePackets.map((p) => {
              const isSel = p.no === selectedNo;
              return (
                <tr
                  key={p.no}
                  onClick={() => setSelectedNo(p.no)}
                  className="cursor-pointer align-top"
                  style={isSel ? { background: `color-mix(in srgb, ${accentHex} 22%, transparent)` } : undefined}
                >
                  <td className="whitespace-pre py-0.5 pr-3 tabular-nums" style={{ color: 'var(--text-mute)' }}>{p.no}</td>
                  <td className="whitespace-pre py-0.5 pr-3 tabular-nums" style={{ color: 'var(--text-dim)' }}>{p.time}</td>
                  <td className="whitespace-pre py-0.5 pr-3" style={{ color: 'var(--text)' }}>{p.src}</td>
                  <td className="whitespace-pre py-0.5 pr-3" style={{ color: 'var(--text)' }}>{p.dst}</td>
                  <td className="whitespace-pre py-0.5 pr-3" style={{ color: accentHex }}>{p.proto}</td>
                  <td className="whitespace-pre py-0.5 pr-3" style={{ color: 'var(--text)' }}>{p.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visiblePackets.length === 0 && !appliedFilter?.miss && (
          <div className="mt-2" style={{ color: 'var(--text-dim)' }}>no packets in this capture.</div>
        )}
      </div>

      {/* details tree */}
      <div
        className="mt-2 min-h-0 shrink-0 border-t pt-2"
        style={{ borderColor: 'var(--card-head-border)', maxHeight: '38%', overflow: 'auto' }}
      >
        {selectedPacket ? (
          selectedPacket.details.map((layer, i) => (
            <div key={i} className="mb-1">
              <div style={{ color: accentHex }}>▼ {layer.layer}</div>
              {layer.rows.map((row, ri) => (
                <div key={ri} className="pl-4" style={{ color: 'var(--text)' }}>{row}</div>
              ))}
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-dim)' }}>select a packet to see its decode.</div>
        )}
      </div>
    </div>
  );
};

export default PcapStage;
