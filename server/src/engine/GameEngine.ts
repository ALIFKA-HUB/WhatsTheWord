import { Player, GameSettings, WordPair, PlayerRole } from '../types/game.types.js';

export interface RoleAssignmentResult {
  players: Player[];
  speakingOrder: string[];
}

export interface VoteCalculationResult {
  isTie: boolean;
  eliminatedPlayerId: string | null;
  voteCounts: Record<string, number>;
}

/**
 * Shuffles an array in-place using Fisher-Yates algorithm and returns a new shuffled array.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a randomized speaking order of living players, ensuring Mr. White
 * never speaks first when at least one word-holder is alive.
 */
export function generateSpeakingOrder(players: Player[]): string[] {
  const livingPlayers = players.filter((p) => p.isAlive);
  const shuffled = shuffleArray(livingPlayers);

  if (shuffled.length > 1 && shuffled[0].role === 'MR_WHITE') {
    const nonMrWhiteIdx = shuffled.findIndex((p, idx) => idx > 0 && p.role !== 'MR_WHITE');
    if (nonMrWhiteIdx !== -1) {
      [shuffled[0], shuffled[nonMrWhiteIdx]] = [shuffled[nonMrWhiteIdx], shuffled[0]];
    }
  }

  return shuffled.map((p) => p.id);
}

/**
 * Assigns roles and words to all players according to room settings and selected word pair.
 */
export function assignRoles(
  players: Player[],
  settings: GameSettings,
  wordPair: WordPair
): RoleAssignmentResult {
  const totalPlayers = players.length;

  if (totalPlayers < 3) {
    throw new Error('Minimal 3 pemain untuk memulai permainan.');
  }

  const rawMrWhite = settings.enableMrWhite
    ? Math.min(Math.max(0, settings.mrWhiteCount ?? 1), 1)
    : 0;
  // Mr. White is only allowed for 4+ players so Civilians outnumber Impostors at start
  const mrWhiteCount = totalPlayers >= 4 && rawMrWhite === 1 ? 1 : 0;

  const maxUndercover = Math.max(1, Math.floor((totalPlayers - mrWhiteCount - 1) / 2));
  const undercoverCount = Math.min(
    Math.max(1, settings.undercoverCount || 1),
    maxUndercover
  );
  const civilianCount = totalPlayers - undercoverCount - mrWhiteCount;

  const rolePool: PlayerRole[] = [
    ...Array(undercoverCount).fill('UNDERCOVER' as PlayerRole),
    ...Array(mrWhiteCount).fill('MR_WHITE' as PlayerRole),
    ...Array(civilianCount).fill('CIVILIAN' as PlayerRole),
  ];

  const shuffledRoles = shuffleArray(rolePool);

  const assignedPlayers: Player[] = players.map((player, index) => {
    const role = shuffledRoles[index];
    let word = '';

    if (role === 'CIVILIAN') {
      word = wordPair.civilianWord;
    } else if (role === 'UNDERCOVER') {
      word = wordPair.undercoverWord;
    } else if (role === 'MR_WHITE') {
      word = '';
    }

    return {
      ...player,
      role,
      word,
      isAlive: true,
      hasVoted: false,
      votedTargetId: undefined,
      isSpeaking: false,
    };
  });

  const speakingOrder = generateSpeakingOrder(assignedPlayers);

  return {
    players: assignedPlayers,
    speakingOrder,
  };
}

/**
 * Calculates the tally of votes for active players.
 * If 2 or more candidates have the same highest votes, returns isTie = true (Instant Skip rule).
 */
export function calculateVotes(
  votes: Record<string, string>,
  activePlayers: Player[]
): VoteCalculationResult {
  const alivePlayers = activePlayers.filter((p) => p.isAlive);
  const aliveIds = new Set(alivePlayers.map((p) => p.id));

  const voteCounts: Record<string, number> = {};
  alivePlayers.forEach((p) => {
    voteCounts[p.id] = 0;
  });

  Object.entries(votes).forEach(([voterId, targetId]) => {
    if (aliveIds.has(voterId) && aliveIds.has(targetId)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  });

  const totalVotesCast = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  if (totalVotesCast === 0) {
    return {
      isTie: true,
      eliminatedPlayerId: null,
      voteCounts,
    };
  }

  const maxVotes = Math.max(...Object.values(voteCounts));

  if (maxVotes === 0) {
    return {
      isTie: true,
      eliminatedPlayerId: null,
      voteCounts,
    };
  }

  const topCandidates = Object.keys(voteCounts).filter(
    (playerId) => voteCounts[playerId] === maxVotes
  );

  if (topCandidates.length === 1) {
    return {
      isTie: false,
      eliminatedPlayerId: topCandidates[0],
      voteCounts,
    };
  }

  // Instant Skip on Tie
  return {
    isTie: true,
    eliminatedPlayerId: null,
    voteCounts,
  };
}

/**
 * Checks whether any team has achieved victory.
 * Returns: 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null
 */
export function checkWinCondition(players: Player[]): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
  const alive = players.filter((p) => p.isAlive);
  const totalOriginal = players.length;
  const totalAlive = alive.length;

  // If no one is eliminated yet (game started with 2 players), continue game
  if (totalOriginal === 2 && totalAlive === 2) {
    return null;
  }

  const aliveCivilians = alive.filter((p) => p.role === 'CIVILIAN').length;
  const aliveUndercovers = alive.filter((p) => p.role === 'UNDERCOVER').length;
  const aliveMrWhites = alive.filter((p) => p.role === 'MR_WHITE').length;

  // 1. Civilian Victory: All Undercovers and Mr. Whites are eliminated
  if (aliveUndercovers === 0 && aliveMrWhites === 0) {
    return 'CIVILIAN';
  }

  // 2. All civilians eliminated: Undercover takes priority over Mr. White
  if (aliveCivilians === 0) {
    return aliveUndercovers > 0 ? 'UNDERCOVER' : 'MR_WHITE';
  }

  // 3. Final 2 survivors (when original game had > 2 players): Undercover takes priority
  if (totalAlive <= 2 && totalOriginal > 2) {
    if (aliveUndercovers > 0) return 'UNDERCOVER';
    if (aliveMrWhites > 0) return 'MR_WHITE';
  }

  // 4. Undercover parity/majority: win immediately if no Mr. White remains, or if Undercovers strictly outnumber Civilians
  if ((aliveUndercovers >= aliveCivilians && aliveMrWhites === 0) || aliveUndercovers > aliveCivilians) {
    return 'UNDERCOVER';
  }

  // Game continues
  return null;
}

export class GameEngine {
  static generateSpeakingOrder(players: Player[]): string[] {
    return generateSpeakingOrder(players);
  }
  static assignRoles(
    players: Player[],
    settings: GameSettings,
    wordPair: WordPair
  ): RoleAssignmentResult {
    return assignRoles(players, settings, wordPair);
  }

  static calculateVotes(
    votes: Record<string, string>,
    activePlayers: Player[]
  ): VoteCalculationResult {
    return calculateVotes(votes, activePlayers);
  }

  static checkWinCondition(
    players: Player[]
  ): 'CIVILIAN' | 'UNDERCOVER' | 'MR_WHITE' | null {
    return checkWinCondition(players);
  }

  static shuffle<T>(array: readonly T[]): T[] {
    return shuffleArray(array);
  }
}
