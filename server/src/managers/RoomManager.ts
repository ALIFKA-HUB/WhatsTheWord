import { randomUUID } from 'crypto';
import { Player, RoomState, GameSettings, WordPair, PlayerRole } from '../types/game.types.js';
import { GameEngine } from '../engine/GameEngine.js';
import { getRandomWordPair } from '../data/defaultWordPacks.js';
import { FuzzyMatcher } from '../engine/FuzzyMatcher.js';

export interface RoomSession {
  roomId: string;
  playerId: string;
}

export interface CreateRoomResult {
  roomId: string;
  playerToken: string;
  player: Player;
  room: RoomState;
}

export interface JoinRoomResult {
  playerToken: string;
  player: Player;
  room: RoomState;
}

export interface CastVoteResult {
  room: RoomState;
  isComplete: boolean;
  isTie?: boolean;
  eliminatedPlayer?: Player;
  winner?: PlayerRole;
}

export interface MrWhiteGuessResult {
  room: RoomState;
  isCorrect: boolean;
  winner?: PlayerRole;
}

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private sessions: Map<string, RoomSession> = new Map();
  private roomLastActivity: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Schedule periodic idle room cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleRooms();
    }, 15 * 60 * 1000);
  }

  /**
   * Generates a unique 4-character alphanumeric uppercase room code.
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let attempts = 0;

    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
      }
      attempts++;
      if (attempts > 1000) {
        throw new Error('Unable to allocate unique room code');
      }
    } while (this.rooms.has(code));

    return code;
  }

  /**
   * Creates a new game room with the given host player.
   */
  public createRoom(hostName: string, avatar: string): CreateRoomResult {
    const roomId = this.generateRoomCode();
    const playerId = randomUUID();
    const playerToken = randomUUID();

    const hostPlayer: Player = {
      id: playerId,
      name: hostName.trim() || 'Host',
      avatar: avatar || 'avatar_1',
      isHost: true,
      isAlive: true,
      hasVoted: false,
    };

    const defaultSettings: GameSettings = {
      category: 'Semua Kategori',
      civilianCount: 3,
      undercoverCount: 1,
      mrWhiteCount: 1,
      turnDurationSeconds: 45,
      enableMrWhite: true,
    };

    const room: RoomState = {
      roomId,
      phase: 'LOBBY',
      round: 1,
      players: [hostPlayer],
      speakingOrder: [],
      currentSpeakerIndex: 0,
      activeTurnRemainingSeconds: defaultSettings.turnDurationSeconds,
      settings: defaultSettings,
    };

    this.rooms.set(roomId, room);
    this.sessions.set(playerToken, { roomId, playerId });
    this.roomLastActivity.set(roomId, Date.now());

    return {
      roomId,
      playerToken,
      player: hostPlayer,
      room,
    };
  }

  /**
   * Joins an existing room or reconnects if token matches existing player.
   */
  public joinRoom(
    roomId: string,
    playerName: string,
    avatar: string,
    existingToken?: string
  ): JoinRoomResult {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    if (existingToken) {
      const session = this.sessions.get(existingToken);
      if (session && session.roomId === normalizedRoomId) {
        const existingPlayer = room.players.find((p) => p.id === session.playerId);
        if (existingPlayer) {
          this.roomLastActivity.set(normalizedRoomId, Date.now());
          return {
            playerToken: existingToken,
            player: existingPlayer,
            room,
          };
        }
      }
    }

    if (room.phase !== 'LOBBY') {
      throw new Error('Cannot join room while game is in progress');
    }

    const playerId = randomUUID();
    const playerToken = randomUUID();

    const newPlayer: Player = {
      id: playerId,
      name: playerName.trim() || `Player ${room.players.length + 1}`,
      avatar: avatar || 'avatar_1',
      isHost: room.players.length === 0,
      isAlive: true,
      hasVoted: false,
    };

    room.players.push(newPlayer);
    this.sessions.set(playerToken, { roomId: normalizedRoomId, playerId });
    this.roomLastActivity.set(normalizedRoomId, Date.now());

    return {
      playerToken,
      player: newPlayer,
      room,
    };
  }

  /**
   * Removes a player from the room. Migrates host if needed or deletes empty room.
   */
  public leaveRoom(roomId: string, playerId: string): RoomState | null {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) return null;

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return room;

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    if (room.players.length === 0) {
      this.rooms.delete(normalizedRoomId);
      this.roomLastActivity.delete(normalizedRoomId);
      for (const [token, session] of this.sessions.entries()) {
        if (session.roomId === normalizedRoomId) {
          this.sessions.delete(token);
        }
      }
      return null;
    }

    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    if (room.speakingOrder.includes(playerId)) {
      room.speakingOrder = room.speakingOrder.filter((id) => id !== playerId);
      if (room.currentSpeakerIndex >= room.speakingOrder.length) {
        room.currentSpeakerIndex = Math.max(0, room.speakingOrder.length - 1);
      }
    }

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return room;
  }

  /**
   * Updates game settings during LOBBY phase.
   */
  public updateSettings(roomId: string, settings: Partial<GameSettings>): RoomState {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    if (room.phase !== 'LOBBY') {
      throw new Error('Cannot update settings while game is in progress');
    }

    room.settings = {
      ...room.settings,
      ...settings,
    };

    if (settings.turnDurationSeconds) {
      room.activeTurnRemainingSeconds = settings.turnDurationSeconds;
    }

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return room;
  }

  /**
   * Starts game by assigning roles, generating speaking order, and selecting word pair.
   */
  public startGame(
    roomId: string,
    settings?: GameSettings,
    customWordPair?: WordPair
  ): RoomState {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    const wordPair = customWordPair || getRandomWordPair(room.settings.category);
    const { players: assignedPlayers, speakingOrder } = GameEngine.assignRoles(
      room.players,
      room.settings,
      wordPair
    );

    room.phase = 'ROLE_REVEAL';
    room.round = 1;
    room.players = assignedPlayers;
    room.speakingOrder = speakingOrder;
    room.currentSpeakerIndex = 0;
    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
    room.wordPair = wordPair;
    room.winningRole = undefined;
    room.eliminatedPlayer = undefined;

    const firstSpeakerId = speakingOrder[0];
    room.players.forEach((p) => {
      p.isSpeaking = p.id === firstSpeakerId;
    });

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return room;
  }

  /**
   * Advances the speaker turn, or transitions to VOTING when all speakers finish.
   */
  public advanceTurn(roomId: string): RoomState {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    const livingSpeakerIds = room.speakingOrder.filter((id) =>
      room.players.find((p) => p.id === id)?.isAlive
    );

    if (room.currentSpeakerIndex >= livingSpeakerIds.length - 1) {
      // Transition to VOTING
      room.phase = 'VOTING';
      room.players.forEach((p) => {
        p.hasVoted = false;
        p.votedTargetId = undefined;
        p.isSpeaking = false;
      });
    } else {
      room.phase = 'TURN_PHASE';
      room.currentSpeakerIndex++;
      room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
      const curSpeakerId = livingSpeakerIds[room.currentSpeakerIndex];
      room.players.forEach((p) => {
        p.isSpeaking = p.id === curSpeakerId;
      });
    }

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return room;
  }

  /**
   * Casts a vote from an active player for another player.
   * If all active players have voted, calculates outcome: Instant Skip on tie, Mr. White Guess, or Elimination.
   */
  public castVote(roomId: string, voterId: string, targetId: string): CastVoteResult {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    if (room.phase !== 'VOTING') {
      throw new Error('Voting is not currently active');
    }

    const voter = room.players.find((p) => p.id === voterId);
    const target = room.players.find((p) => p.id === targetId);

    if (!voter || !voter.isAlive) {
      throw new Error('Voter is not active in this game');
    }

    if (!target || !target.isAlive) {
      throw new Error('Target is not active in this game');
    }

    voter.hasVoted = true;
    voter.votedTargetId = targetId;

    const livingPlayers = room.players.filter((p) => p.isAlive);
    const allVoted = livingPlayers.every((p) => p.hasVoted);

    if (!allVoted) {
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isComplete: false };
    }

    // All living players have voted -> calculate votes
    const votes: Record<string, string> = {};
    livingPlayers.forEach((p) => {
      if (p.votedTargetId) votes[p.id] = p.votedTargetId;
    });

    const calcResult = GameEngine.calculateVotes(votes, room.players);

    if (calcResult.isTie) {
      room.consecutiveTies = (room.consecutiveTies || 0) + 1;
      const maxTies = room.settings.maxConsecutiveTies || 3;

      if (room.consecutiveTies >= maxTies) {
        room.phase = 'GAME_OVER';
        room.winningRole = 'UNDERCOVER';
        this.roomLastActivity.set(normalizedRoomId, Date.now());
        return { room, isComplete: true, isTie: true, winner: 'UNDERCOVER' };
      }

      // Instant Skip on Tie Rule
      room.round++;
      room.phase = 'TURN_PHASE';
      room.currentSpeakerIndex = 0;
      room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
      const livingSpeakerIds = room.speakingOrder.filter((id) =>
        room.players.find((x) => x.id === id)?.isAlive
      );
      room.players.forEach((p) => {
        p.hasVoted = false;
        p.votedTargetId = undefined;
        p.isSpeaking = p.id === livingSpeakerIds[0];
      });

      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isComplete: true, isTie: true };
    }

    // Reset consecutive ties on elimination
    room.consecutiveTies = 0;

    // Elimination
    const eliminated = room.players.find((p) => p.id === calcResult.eliminatedPlayerId);
    if (eliminated) {
      eliminated.isAlive = false;
      room.eliminatedPlayer = eliminated;
    }

    if (eliminated?.role === 'MR_WHITE') {
      room.phase = 'MR_WHITE_GUESS';
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated };
    }

    const winner = GameEngine.checkWinCondition(room.players);
    if (winner) {
      room.phase = 'GAME_OVER';
      room.winningRole = winner;
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated, winner };
    }

    // Advance to next round
    room.round++;
    room.phase = 'TURN_PHASE';
    room.currentSpeakerIndex = 0;
    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
    const livingSpeakerIds = room.speakingOrder.filter((id) =>
      room.players.find((x) => x.id === id)?.isAlive
    );
    room.players.forEach((p) => {
      p.hasVoted = false;
      p.votedTargetId = undefined;
      p.isSpeaking = p.id === livingSpeakerIds[0];
    });

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated };
  }

  /**
   * Handles Mr. White's emergency guess using fuzzy text matching.
   */
  public handleMrWhiteGuess(roomId: string, guess: string): MrWhiteGuessResult {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    if (room.phase !== 'MR_WHITE_GUESS') {
      throw new Error('Mr. White guess phase is not active');
    }

    const civilianWord = room.wordPair?.civilianWord || '';
    const isCorrect = FuzzyMatcher.isMatch(guess, civilianWord);

    if (isCorrect) {
      room.phase = 'GAME_OVER';
      room.winningRole = 'MR_WHITE';
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isCorrect: true, winner: 'MR_WHITE' };
    }

    // Mr. White guessed incorrectly; check standard win condition
    const winner = GameEngine.checkWinCondition(room.players);
    if (winner) {
      room.phase = 'GAME_OVER';
      room.winningRole = winner;
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isCorrect: false, winner };
    }

    room.round++;
    room.phase = 'TURN_PHASE';
    room.currentSpeakerIndex = 0;
    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
    const livingSpeakerIds = room.speakingOrder.filter((id) =>
      room.players.find((x) => x.id === id)?.isAlive
    );
    room.players.forEach((p) => {
      p.hasVoted = false;
      p.votedTargetId = undefined;
      p.isSpeaking = p.id === livingSpeakerIds[0];
    });

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return { room, isCorrect: false };
  }

  /**
   * Reconnects a player session by their unique playerToken.
   */
  public reconnectPlayer(playerToken: string): { player: Player; room: RoomState } | null {
    const session = this.sessions.get(playerToken);
    if (!session) return null;

    const room = this.rooms.get(session.roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.id === session.playerId);
    if (!player) return null;

    this.roomLastActivity.set(session.roomId, Date.now());
    return { player, room };
  }

  /**
   * Resets room back to LOBBY for a rematch while retaining connected players.
   */
  public rematch(roomId: string): RoomState {
    const normalizedRoomId = roomId.trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Room not found: ${normalizedRoomId}`);
    }

    room.phase = 'LOBBY';
    room.round = 1;
    room.consecutiveTies = 0;
    room.speakingOrder = [];
    room.currentSpeakerIndex = 0;
    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
    room.winningRole = undefined;
    room.eliminatedPlayer = undefined;
    room.wordPair = undefined;

    room.players.forEach((p) => {
      p.role = undefined;
      p.word = undefined;
      p.isAlive = true;
      p.hasVoted = false;
      p.votedTargetId = undefined;
      p.isSpeaking = false;
    });

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return room;
  }

  /**
   * Retrieves room by roomId.
   */
  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId.trim().toUpperCase());
  }

  /**
   * Returns active room count.
   */
  public getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  /**
   * Garbage collector for inactive rooms (> maxIdleMs, default 2 hours).
   */
  public cleanupIdleRooms(maxIdleMs = 2 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [roomId, lastActive] of this.roomLastActivity.entries()) {
      if (now - lastActive > maxIdleMs) {
        this.rooms.delete(roomId);
        this.roomLastActivity.delete(roomId);
        for (const [token, session] of this.sessions.entries()) {
          if (session.roomId === roomId) {
            this.sessions.delete(token);
          }
        }
      }
    }
  }

  /**
   * Destroys timer instance (used in tests and shutdown).
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
