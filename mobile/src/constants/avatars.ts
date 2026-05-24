/** 8 gradient avatar seçeneği (4x2 grid) */
export const AVATAR_GRADIENTS: [string, string][] = [
  ['#22d3ee', '#0891b2'],
  ['#a78bfa', '#7c3aed'],
  ['#f472b6', '#db2777'],
  ['#fb923c', '#ea580c'],
  ['#4ade80', '#16a34a'],
  ['#facc15', '#ca8a04'],
  ['#60a5fa', '#2563eb'],
  ['#f87171', '#dc2626'],
];

export function avatarInitials(name: string, email: string): string {
  const n = (name || email || '?').trim();
  const parts = n.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}
