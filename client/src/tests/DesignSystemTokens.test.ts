import { describe, it, expect } from 'vitest';
import {
  PRESET_TOKEN_AVATARS,
  resolveTokenAvatar,
  getPlayerInitials,
} from '../utils/avatarTokens';

describe('Tactile Board-Game Token Avatar System', () => {
  it('provides 12 distinct geometric tabletop token presets without emojis', () => {
    expect(PRESET_TOKEN_AVATARS).toHaveLength(12);
    const ids = new Set(PRESET_TOKEN_AVATARS.map((t) => t.id));
    expect(ids.size).toBe(12);
    for (const token of PRESET_TOKEN_AVATARS) {
      expect(token.id).toMatch(/^token-/);
      expect(token.name.length).toBeGreaterThan(2);
    }
  });

  it('maps legacy emoji avatars deterministically to geometric tokens', () => {
    const spyToken = resolveTokenAvatar('🕵️', 'Budi');
    expect(spyToken.id).toBe('token-eye');
    expect(spyToken.initials).toBe('BU');

    const foxToken = resolveTokenAvatar('🦊', 'Siti Nurhaliza');
    expect(foxToken.id).toBe('token-triangle');
    expect(foxToken.initials).toBe('SN');
  });

  it('extracts clean 2-letter uppercase initials from player names', () => {
    expect(getPlayerInitials('Agen Rahasia')).toBe('AR');
    expect(getPlayerInitials('Budi')).toBe('BU');
    expect(getPlayerInitials('X')).toBe('X');
    expect(getPlayerInitials('')).toBe('AG');
  });
});
