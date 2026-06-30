// src/pages/wiki-graph.jsx
// Full-screen graph view: nodes = entries, edges = resolved wikilinks. Layout
// is computed once on load (deterministic). Click a node to open the entry.
// Esc returns to /wiki.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalShell from '../components/tui/TerminalShell';
import { fetchGraph } from '../utils/wikiContent';
import { useWikiManifest } from '../utils/useWikiManifest';
import { layoutGraph } from '../components/wiki/forceLayout';
import { getEntryBySlug } from '../utils/wikiService';
import { WIKI_ACCENT } from '../config/wikiConfig';

const W = 1000;
const H = 700;

const WikiGraph = () => {
  const navigate = useNavigate();
  const { manifest } = useWikiManifest();
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    fetchGraph().then(setGraph).catch(() => setGraph({ nodes: [], edges: [] }));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); navigate('/wiki'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const laid = useMemo(() => {
    if (!graph) return null;
    return layoutGraph(graph, { width: W, height: H });
  }, [graph]);

  if (!laid) {
    return (
      <TerminalShell fill>
        <div className="p-4 text-white/40 text-sm">loading graph...</div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell fill>
      <div className="flex flex-col flex-1 min-h-0 p-2">
        <div className="text-xs mb-2 text-white/40">
          wiki graph · {laid.nodes.length} entries, {laid.edges.length} links · <span style={{ color: WIKI_ACCENT }}>esc</span> back
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 min-h-0 w-full bg-black">
          {(() => {
            const byId = new Map(laid.nodes.map((n) => [n.id, n]));
            return laid.edges.map((e) => {
              const a = byId.get(e.from);
              const b = byId.get(e.to);
              if (!a || !b) return null;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="rgba(192,132,252,0.25)" strokeWidth="1"
                />
              );
            });
          })()}
          {laid.nodes.map((n) => {
            const entry = manifest ? getEntryBySlug(manifest, n.id) : null;
            return (
              <g
                key={n.id}
                onClick={() => entry && navigate(`/wiki/${entry.path}`)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={n.x} cy={n.y} r="6" fill={WIKI_ACCENT} fillOpacity="0.85" />
                <text x={n.x + 9} y={n.y + 3} fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="monospace">
                  {n.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </TerminalShell>
  );
};

export default WikiGraph;
