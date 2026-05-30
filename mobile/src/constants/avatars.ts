/** 8 karakter avatarı — gradient + emoji karakter */
export const AVATAR_CHARACTERS = [
  { emoji: '🦊', label: 'Tilki', colors: ['#22d3ee', '#0891b2'] as [string, string] },
  { emoji: '🐼', label: 'Panda', colors: ['#94a3b8', '#475569'] as [string, string] },
  { emoji: '🦁', label: 'Aslan', colors: ['#fbbf24', '#ea580c'] as [string, string] },
  { emoji: '🐸', label: 'Kurbağa', colors: ['#4ade80', '#16a34a'] as [string, string] },
  { emoji: '🦉', label: 'Baykuş', colors: ['#a78bfa', '#7c3aed'] as [string, string] },
  { emoji: '🐙', label: 'Ahtapot', colors: ['#f472b6', '#db2777'] as [string, string] },
  { emoji: '🦄', label: 'Unicorn', colors: ['#c084fc', '#6366f1'] as [string, string] },
  { emoji: '🐨', label: 'Koala', colors: ['#60a5fa', '#2563eb'] as [string, string] },
];

export const AVATAR_GRADIENTS = AVATAR_CHARACTERS.map((c) => c.colors);

export function getAvatarCharacter(index: number) {
  return AVATAR_CHARACTERS[index % AVATAR_CHARACTERS.length];
}

export function avatarInitials(name: string, email: string): string {
  const n = (name || email || '?').trim();
  const parts = n.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}
