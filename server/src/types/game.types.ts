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
  votingStartRound?: number;
  maxConsecutiveTies?: number;
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
  consecutiveTies?: number;
  settings: GameSettings;
  winningRole?: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE';
  eliminatedPlayer?: Player;
  wordPair?: WordPair;
}

export interface VoteRecord {
  voterId: string;
  targetId: string;
}

export interface WordPack {
  id: string;
  name: string;
  category: string;
  description?: string;
  isOfficial: boolean;
  wordPairs: WordPair[];
  createdAt?: string;
}

export interface CustomWordPack {
  id: string;
  title: string;
  authorName: string;
  shareCode: string;
  wordPairs: WordPair[];
  isPublic?: boolean;
  createdAt?: string;
}

