// src/utils/useChannelPings.js
// Synthetic, decorative ping telemetry for the connect page: a live stream of
// per-channel round-trip times (for the inline sparklines) plus a rolling log of
// `ping`-style reply lines. Purely cosmetic: NO real network calls are made (the
// site is client-only and privacy-first), and all output is aria-hidden at the
// render layer. Freezes to a single static frame under prefers-reduced-motion.
import { useEffect, useRef, useState } from 'react';

const TICK_MS = 600;
const HISTORY = 8;     // sparkline samples kept per channel
const LOG_CAP = 40;    // reply lines retained (older ones clip off-screen)
const SEED_ROUNDS = 6; // static-frame reply rounds (fills the log on first paint)
const SPARK = ' ▁▂▃▄▅▆▇';

// Map a round-trip time (ms) onto a spark glyph across a fixed 4..40ms range.
export function sparkline(history) {
  return history
    .map((ms) => {
      const i = Math.round(((ms - 4) / 36) * 7);
      return SPARK[Math.max(0, Math.min(7, i))];
    })
    .join('');
}

// One synthetic RTT for a channel: base plus a few ms jitter, clamped to a floor.
function nextMs(baseMs) {
  return Math.max(4, baseMs + (Math.random() * 7 - 1.5));
}

function reply(channel, seq) {
  return {
    id: `${seq}-${channel.id}`,
    channel,
    seq,
    ttl: 52 + Math.floor(Math.random() * 6),
    ms: channel.lastMs,
  };
}

// Initial / reduced-motion-static frame: each channel at its base RTT with a flat
// history, and several seed reply rounds so the log looks full on first paint.
function staticFrame(channels) {
  const seeded = channels.map((c) => ({
    ...c,
    lastMs: c.baseMs,
    history: Array.from({ length: HISTORY }, () => c.baseMs),
  }));
  let seq = 160;
  const log = [];
  for (let r = 0; r < SEED_ROUNDS; r += 1) {
    seq += 1;
    seeded.forEach((c) => log.push(reply(c, seq)));
  }
  return { channels: seeded, log, seq };
}

export function useChannelPings(channels, reducedMotion) {
  const [frame, setFrame] = useState(() => staticFrame(channels));
  // Mutable working copy so the interval evolves state without re-deriving it.
  const ref = useRef(frame);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => {
      const prev = ref.current;
      const seq = prev.seq + 1;
      const nextChannels = prev.channels.map((c) => {
        const ms = nextMs(c.baseMs);
        return { ...c, lastMs: ms, history: [...c.history, ms].slice(-HISTORY) };
      });
      const replies = nextChannels.map((c) => reply(c, seq));
      if (Math.random() < 0.12) {
        replies.push({ id: `${seq}-timeout`, timeout: true, seq });
      }
      const next = { channels: nextChannels, log: [...prev.log, ...replies].slice(-LOG_CAP), seq };
      ref.current = next;
      setFrame(next);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return frame;
}
