import { describe, it, expect } from 'vitest';
import { resolveInitialView, PLAY_PATH } from '../utils/initialView';

describe('resolveInitialView', () => {
  it('shows the landing on the bare root', () => {
    expect(resolveInitialView('/', '')).toBe('LANDING');
  });
  it('opens the app on /play', () => {
    expect(resolveInitialView(PLAY_PATH, '')).toBe('HOME');
    expect(resolveInitialView('/play/', '')).toBe('HOME');
  });
  it('opens the app directly for invite links', () => {
    expect(resolveInitialView('/', '?room=8K29PX')).toBe('HOME');
  });
  it('falls back to the landing for unknown paths', () => {
    expect(resolveInitialView('/apa-saja', '')).toBe('LANDING');
  });
});
