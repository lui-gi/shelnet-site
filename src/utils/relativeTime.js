// src/utils/relativeTime.js
// Compact relative-time helper used by the wiki home recently-updated list.
// Returns one of: "Nd", "Nw", "Nmo", "Ny". Empty string on bad input.
export function relativeTimeAgo(iso, now = new Date()) {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.max(0, Math.floor((now - then) / 86_400_000));
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}
