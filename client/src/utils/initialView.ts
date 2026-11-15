export type AppView = 'LANDING' | 'HOME' | 'PASS_PLAY' | 'ONLINE';
export const PLAY_PATH = '/play';

export function resolveInitialView(pathname: string, search: string): 'LANDING' | 'HOME' {
  if (new URLSearchParams(search).has('room')) return 'HOME';
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean === PLAY_PATH ? 'HOME' : 'LANDING';
}
