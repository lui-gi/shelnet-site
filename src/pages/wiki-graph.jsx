// src/pages/wiki-graph.jsx
// Light full-screen graph view: white canvas, gray edges, purple nodes, dark
// sans-serif labels. Click a node to open the entry; Esc returns to /wiki.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGraph } from '../utils/wikiContent';
import { useWikiManifest } from '../utils/useWikiManifest';
import { layoutGraph } from '../components/wiki/forceLayout';
import { getEntryBySlug } from '../utils/wikiService';

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
      <main className="bg-white text-neutral-900 font-sans pt-9 pb-9 min-h-dvh p-6">
        <div className="text-sm text-neutral-500">loading graph...</div>
      </main>
    );
  }

  const byId = new Map(laid.nodes.map((n) => [n.id, n]));

  return (
    <main className="bg-white text-neutral-900 font-sans pt-9 pb-9 min-h-dvh flex flex-col px-6 py-4">
      <div className="text-sm text-neutral-500 mb-3">
        wiki graph · {laid.nodes.length} entries, {laid.edges.length} links · <span className="text-purple-700">esc</span> back
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 min-h-0 w-full bg-white">
        {laid.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="rgb(212 212 212)" strokeWidth="1"
            />
          );
        })}
        {laid.nodes.map((n) => {
          const entry = manifest ? getEntryBySlug(manifest, n.id) : null;
          return (
            <g
              key={n.id}
              onClick={() => entry && navigate(`/wiki/${entry.path}`)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={n.x} cy={n.y} r="6" fill="rgb(147 51 234)" />
              <text x={n.x + 9} y={n.y + 3} fontSize="11" fill="rgb(64 64 64)" fontFamily="ui-sans-serif, system-ui, sans-serif">
                {n.title}
              </text>
            </g>
          );
        })}
      </svg>
    </main>
  );
};

export default WikiGraph;
