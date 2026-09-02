# Task 1 Brief: Monorepo Root, Workspace Tooling, Shared Types & Env Configuration

## Goal
Setup the monorepo workspace for What's The Word in C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword:
- Root package.json with concurrently to run client and server
- client/ setup: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, motion, @supabase/supabase-js, socket.io-client
- client/src/index.css with dark cyber styling & Outfit/Cabinet Grotesk/JetBrains Mono fonts
- client/src/types/game.types.ts
- server/ setup: Node.js, Express, Socket.io, TypeScript, Vitest, cors, dotenv
- server/src/types/game.types.ts
- .env.example & .env with Supabase URL and keys
- Verify build & typecheck passes.

## Exact Types Specification (game.types.ts in client and server):
`	ypescript
export type PlayerRole = 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'TURN_PHASE'
  | 'VOTING'
  | 'MR_WHITE_GUESS'
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  role?: PlayerRole;
  word?: string;
  isAlive: boolean;
  hasVoted: boolean;
  votedTargetId?: string;
  isSpeaking?: boolean;
}

export interface WordPair {
  id?: string;
  category: string;
  civilianWord: string;
  undercoverWord: string;
}

export interface GameSettings {
  category: string;
  civilianCount: number;
  undercoverCount: number;
  mrWhiteCount: number;
  turnDurationSeconds: number;
  enableMrWhite: boolean;
  customWordPair?: WordPair;
}

export interface RoomState {
  roomId: string;
  phase: GamePhase;
  round: number;
  players: Player[];
  speakingOrder: string[];
  currentSpeakerIndex: number;
  activeTurnRemainingSeconds: number;
  settings: GameSettings;
  winningRole?: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
  eliminatedPlayer?: Player;
  wordPair?: WordPair;
}
`

## Report Contract
Write report to: .superpowers/sdd/2026-09-02-whatstheword-implementation/task-1-report.md
Return: status (DONE / BLOCKED), commits, one-line test summary.
