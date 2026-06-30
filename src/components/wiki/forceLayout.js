// src/components/wiki/forceLayout.js
// Simple iterative spring + Coulomb-style repulsion. Deterministic (seeded
// PRNG). Tuned for ~5-200 nodes; not a D3 replacement, just enough to make
// the wiki graph view feel alive.

function mulberry32(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function layoutGraph({ nodes, edges }, opts = {}) {
  const {
    width = 800,
    height = 600,
    iterations = 250,
    repulsion = 1800,
    springLen = 90,
    springK = 0.04,
    damping = 0.85,
    seed = 1337,
  } = opts;

  const rand = mulberry32(seed);
  const pos = nodes.map(() => ({
    x: width / 2 + (rand() - 0.5) * 200,
    y: height / 2 + (rand() - 0.5) * 200,
    vx: 0,
    vy: 0,
  }));
  const idIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const adj = edges
    .map((e) => [idIndex.get(e.from), idIndex.get(e.to)])
    .filter(([a, b]) => a !== undefined && b !== undefined);

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between every pair.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const d2 = dx * dx + dy * dy + 0.01;
        const d = Math.sqrt(d2);
        const f = repulsion / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        pos[i].vx += fx; pos[i].vy += fy;
        pos[j].vx -= fx; pos[j].vy -= fy;
      }
    }
    // Springs along edges.
    for (const [a, b] of adj) {
      const dx = pos[b].x - pos[a].x;
      const dy = pos[b].y - pos[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const disp = (d - springLen) * springK;
      const fx = (dx / d) * disp;
      const fy = (dy / d) * disp;
      pos[a].vx += fx; pos[a].vy += fy;
      pos[b].vx -= fx; pos[b].vy -= fy;
    }
    // Centering nudge.
    const cx = width / 2;
    const cy = height / 2;
    // Integrate with damping.
    for (let i = 0; i < pos.length; i++) {
      pos[i].vx = (pos[i].vx + (cx - pos[i].x) * 0.001) * damping;
      pos[i].vy = (pos[i].vy + (cy - pos[i].y) * 0.001) * damping;
      pos[i].x += pos[i].vx;
      pos[i].y += pos[i].vy;
    }
  }

  return {
    nodes: nodes.map((n, i) => ({ ...n, x: pos[i].x, y: pos[i].y })),
    edges,
  };
}
