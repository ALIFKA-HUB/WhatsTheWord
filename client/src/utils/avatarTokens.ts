export type TokenShape =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'octagon'
  | 'shield'
  | 'ticket'
  | 'stamp'
  | 'badge'
  | 'crest'
  | 'seal';

export type TokenIconKey =
  | 'eye'
  | 'detective'
  | 'compass'
  | 'key'
  | 'lightning'
  | 'crown'
  | 'skull'
  | 'star'
  | 'crosshair'
  | 'fingerprint'
  | 'flame'
  | 'spade';

export interface TokenAvatarPreset {
  id: string;
  shape: TokenShape;
  iconKey: TokenIconKey;
  code: string;
  name: string;
  description: string;
  accentInverted?: boolean;
}

export const PRESET_TOKEN_AVATARS: TokenAvatarPreset[] = [
  { id: 'token-eye', shape: 'circle', iconKey: 'eye', code: '01', name: 'Mata Elang', description: 'Pengamat tajam' },
  { id: 'token-detective', shape: 'shield', iconKey: 'detective', code: '02', name: 'Inspektur', description: 'Detektif meja' },
  { id: 'token-triangle', shape: 'triangle', iconKey: 'compass', code: '03', name: 'Penjejak', description: 'Ahli arah' },
  { id: 'token-key', shape: 'square', iconKey: 'key', code: '04', name: 'Juru Kunci', description: 'Pemegang sandi' },
  { id: 'token-bolt', shape: 'diamond', iconKey: 'lightning', code: '05', name: 'Kilat Hitam', description: 'Eksekutor cepat' },
  { id: 'token-crown', shape: 'hexagon', iconKey: 'crown', code: '06', name: 'Komandan', description: 'Pemimpin sidang' },
  { id: 'token-skull', shape: 'octagon', iconKey: 'skull', code: '07', name: 'Bayangan', description: 'Saksi bisu' },
  { id: 'token-star', shape: 'stamp', iconKey: 'star', code: '08', name: 'Bintang', description: 'Kartu truf', accentInverted: true },
  { id: 'token-crosshair', shape: 'ticket', iconKey: 'crosshair', code: '09', name: 'Penembak', description: 'Tepat sasaran' },
  { id: 'token-print', shape: 'badge', iconKey: 'fingerprint', code: '10', name: 'Sidik Jari', description: 'Bukti forensik' },
  { id: 'token-flame', shape: 'crest', iconKey: 'flame', code: '11', name: 'Api Unggun', description: 'Pemantik debat', accentInverted: true },
  { id: 'token-spade', shape: 'seal', iconKey: 'spade', code: '12', name: 'As Sekop', description: 'Kartu penentu' },
];

const LEGACY_EMOJI_MAP: Record<string, string> = {
  '🕵️': 'token-eye',
  '🤖': 'token-detective',
  '🦊': 'token-triangle',
  '🦅': 'token-crosshair',
  '🐺': 'token-skull',
  '🐱': 'token-key',
  '🐉': 'token-flame',
  '⚡': 'token-bolt',
  '🔮': 'token-star',
  '🕶️': 'token-print',
  '🎭': 'token-spade',
  '👑': 'token-crown',
};

export function getPlayerInitials(name?: string): string {
  const cleaned = (name || '').trim().replace(/[^a-zA-Z0-9\s]/g, ' ');
  if (!cleaned) return 'AG';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  const single = parts[0];
  return single.slice(0, 2).toUpperCase();
}

export interface ResolvedTokenAvatar extends TokenAvatarPreset {
  initials: string;
}

export function resolveTokenAvatar(avatarOrId?: string, playerName?: string): ResolvedTokenAvatar {
  const initials = getPlayerInitials(playerName);
  const raw = (avatarOrId || '').trim();

  const direct = PRESET_TOKEN_AVATARS.find((t) => t.id === raw);
  if (direct) {
    return { ...direct, initials };
  }

  const mappedId = LEGACY_EMOJI_MAP[raw];
  if (mappedId) {
    const found = PRESET_TOKEN_AVATARS.find((t) => t.id === mappedId);
    if (found) return { ...found, initials };
  }

  // Deterministic fallback hash from name or avatar string
  const seedStr = raw || playerName || 'default';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const preset = PRESET_TOKEN_AVATARS[hash % PRESET_TOKEN_AVATARS.length];
  return { ...preset, initials };
}
