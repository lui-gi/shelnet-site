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

// Group `File→A→B` / `Statistics→X` menu paths under their first segment.
function groupMenus(actions) {
  const groups = new Map(); // topLabel -> [{ path, leaf }]
  for (const a of actions || []) {
    const path = a.match?.menu;
    if (!path) continue;
    const [top, ...rest] = path.split('→');
    const leaf = rest.join('→') || top;
    const bucket = groups.get(top) || [];
    if (!bucket.some((e) => e.path === path)) bucket.push({ path, leaf });
    groups.set(top, bucket);
  }
  return groups;
}

const Dropdown = ({ label, items, accentHex, onPick }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded px-1.5 py-0.5 text-[0.7rem]"
        style={{ color: 'var(--text-mute)' }}
      >
        {label} ▾
      </button>
      {open && items.length > 0 && (
        <div
          className="absolute left-0 top-full z-10 mt-0.5 min-w-[10rem] rounded border shadow"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          {items.map((it) => (
            <button
              key={it.path}
              type="button"
              onClick={() => { setOpen(false); onPick(it.path); }}
              className="block w-full whitespace-nowrap px-2 py-1 text-left text-[0.7rem] hover:opacity-80"
              style={{ color: 'var(--text)' }}
            >
              {it.leaf}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Modal = ({ title, payload, accentHex, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-auto rounded-lg border"
        style={{ background: 'var(--card-bg)', borderColor: accentHex }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: 'var(--card-head-border)', color: 'var(--text-strong)' }}
        >
          <span>{title}</span>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-mute)' }}>close ✕</button>
        </div>
        <div className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--text)' }}>
          {payload.kind === 'table' && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {payload.columns.map((c, i) => (
                    <th key={i} className="border-b pb-1 pr-4 font-semibold" style={{ borderColor: 'var(--block-border)', color: 'var(--text-mute)' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="whitespace-pre py-0.5 pr-4" style={{ color: 'var(--text)' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {payload.kind === 'stream' && (
            <pre className="whitespace-pre-wrap break-words" style={{ color: 'var(--text)' }}>{payload.text}</pre>
          )}
          {payload.kind === 'objects' && (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {['Filename', 'Size'].map((c) => (
                    <th key={c} className="border-b pb-1 pr-4 font-semibold" style={{ borderColor: 'var(--block-border)', color: 'var(--text-mute)' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rows.map((r, i) => (
                  <tr key={i}>
                    <td className="py-0.5 pr-4" style={{ color: accentHex }}>{r.filename}</td>
                    <td className="py-0.5 pr-4" style={{ color: 'var(--text)' }}>{r.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const PcapStage = ({ config = {}, accentHex, onEvent, active }) => {
  const { pcaps = {}, initialPcap } = config;
  const [activePcap, setActivePcap] = useState(initialPcap);
  const [filterText, setFilterText] = useState('');
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);
  const [modal, setModal] = useState(null); // { title, payload }
  const filterRef = useRef(null);

  const pcap = pcaps[activePcap] || { packets: [], filters: [], actions: [] };
  const visiblePackets = useMemo(() => {
    if (!appliedFilter || appliedFilter.miss) return pcap.packets;
    const keepSet = new Set(appliedFilter.keep);
    return pcap.packets.filter((p) => keepSet.has(p.no));
  }, [pcap.packets, appliedFilter]);

  useEffect(() => {
    if (visiblePackets.length === 0) { setSelectedNo(null); return; }
    if (selectedNo == null || !visiblePackets.some((p) => p.no === selectedNo)) {
      setSelectedNo(visiblePackets[0].no);
    }
  }, [visiblePackets, selectedNo]);

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

  const loadPcap = (name) => {
    if (!pcaps[name]) return;
    setActivePcap(name);
    setFilterText('');
    setAppliedFilter(null);
    setSelectedNo(null);
    setModal(null);
    onEvent?.({ type: 'load', pcap: name });
  };

  const runAction = (path) => {
    const entry = (pcap.actions || []).find((a) => a.match?.menu === path);
    if (!entry) return;
    setModal({ title: path, payload: entry.payload });
    onEvent?.({ type: 'action', action: path, payload: entry.payload });
  };

  // Menu structure: File always exists (for Open); Statistics / Analyze appear
  // if the active pcap has any action with a matching top segment. File → Open
  // → <each pcap in config.pcaps> is always available.
  const grouped = groupMenus(pcap.actions);
  const fileItems = [
    ...Object.keys(pcaps).map((name) => ({ path: `File→Open→${name}`, leaf: `Open · ${name}` })),
    ...(grouped.get('File') || []),
  ];
  const statsItems = grouped.get('Statistics') || [];
  const analyzeItems = grouped.get('Analyze') || [];

  const pickMenu = (path) => {
    if (path.startsWith('File→Open→')) {
      const name = path.slice('File→Open→'.length);
      loadPcap(name);
      return;
    }
    runAction(path);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col font-mono text-xs leading-relaxed">
      {/* menu bar */}
      <div
        className="flex shrink-0 items-center gap-2 border-b px-2 py-1"
        style={{ borderColor: 'var(--card-head-border)' }}
      >
        <Dropdown label="File" items={fileItems} accentHex={accentHex} onPick={pickMenu} />
        <Dropdown label="Statistics" items={statsItems} accentHex={accentHex} onPick={pickMenu} />
        <Dropdown label="Analyze" items={analyzeItems} accentHex={accentHex} onPick={pickMenu} />
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
                <th key={h} className="border-b pb-1 pr-3 font-semibold" style={{ borderColor: 'var(--block-border)', color: 'var(--text-mute)' }}>{h}</th>
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

      {modal && (
        <Modal title={modal.title} payload={modal.payload} accentHex={accentHex} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

export default PcapStage;
