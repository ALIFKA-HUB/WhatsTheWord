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
  // Grace period disconnect: player dijadwalkan dikeluarkan setelah koneksi putus
  // agar refresh/hiccup jaringan tidak menghilangkan kursi, tapi ghost player akhirnya dibersihkan.
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Schedule periodic idle room cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleRooms();
    }, 15 * 60 * 1000);
  }

  /**
   * Schedules removal of a player whose socket disconnected. Cancelled if they
   * reconnect (or explicitly leave) within the grace period.
   */
  public schedulePlayerCleanup(
    roomId: string,
    playerId: string,
    graceMs: number,
    onExpired: (roomId: string, playerId: string, room: RoomState | null) => void
  ): void {
    const normalized = roomId.trim().toUpperCase();
    const key = `${normalized}:${playerId}`;
    if (this.disconnectTimers.has(key)) return; // already scheduled (multi-tab / duplicate disconnect)

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(key);
      const room = this.leaveRoom(normalized, playerId);
      onExpired(normalized, playerId, room);
    }, graceMs);
    this.disconnectTimers.set(key, timer);
  }

  /**
   * Cancels a scheduled disconnect cleanup (player reconnected or left explicitly).
   */
  public cancelPlayerCleanup(roomId: string, playerId: string): void {
    const normalized = roomId.trim().toUpperCase();
    const key = `${normalized}:${playerId}`;
    const timer = this.disconnectTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(key);
    }
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
      name: (hostName || '').trim() || 'Host',
      avatar: avatar || 'avatar_1',
      isHost: true,
      isAlive: true,
      hasVoted: false,
    };

    const defaultSettings: GameSettings = {
      category: 'Semua Kategori',
      civilianCount: 2,
      undercoverCount: 1,
      mrWhiteCount: 0,
      turnDurationSeconds: 45,
      enableMrWhite: false,
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
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (existingToken) {
      const session = this.sessions.get(existingToken);
      if (session && session.roomId === normalizedRoomId) {
        const existingPlayer = room.players.find((p) => p.id === session.playerId);
        if (existingPlayer) {
          this.cancelPlayerCleanup(normalizedRoomId, existingPlayer.id);
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
      throw new Error('Tidak dapat bergabung: permainan sedang berlangsung');
    }

    if (room.players.length >= 20) {
      throw new Error('Ruangan sudah penuh (maksimal 20 pemain)');
    }

    const cleanName = (playerName || '').trim() || `Player ${room.players.length + 1}`;
    const isDuplicate = room.players.some(
      (p) => p.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error(`Nama "${cleanName}" sudah digunakan dalam ruangan ini`);
    }

    const playerId = randomUUID();
    const playerToken = randomUUID();

    const newPlayer: Player = {
      id: playerId,
      name: cleanName,
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
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) return null;

    // Leave eksplisit membatalkan cleanup yang dijadwalkan dari disconnect
    this.cancelPlayerCleanup(normalizedRoomId, playerId);

    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return room;

    const leavingPlayer = room.players[playerIndex];
    const wasHost = leavingPlayer.isHost;
    const wasLiving = leavingPlayer.isAlive;
    const livingSpeakersBefore = room.speakingOrder.filter((id) =>
      room.players.find((p) => p.id === id)?.isAlive
    );
    const removedLivingSpeakerIdx = wasLiving
      ? livingSpeakersBefore.indexOf(playerId)
      : -1;

    room.players.splice(playerIndex, 1);

    // Always clean up session tokens belonging to the leaving player
    for (const [token, session] of this.sessions.entries()) {
      if (session.roomId === normalizedRoomId && session.playerId === playerId) {
        this.sessions.delete(token);
      }
    }

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

    if (room.phase === 'LOBBY') {
      const effectiveMrWhite =
        room.players.length <= 3 ? 0 : room.settings.enableMrWhite ? 1 : 0;
      const maxUndercover = Math.max(
        1,
        Math.floor((Math.max(3, room.players.length) - effectiveMrWhite - 1) / 2)
      );
      room.settings.undercoverCount = Math.min(
        Math.max(1, room.settings.undercoverCount || 1),
        maxUndercover
      );
    }

    if (room.phase !== 'LOBBY' && room.phase !== 'GAME_OVER') {
      room.speakingOrder = room.speakingOrder.filter((id) => id !== playerId);
      if (
        removedLivingSpeakerIdx !== -1 &&
        removedLivingSpeakerIdx < room.currentSpeakerIndex
      ) {
        room.currentSpeakerIndex = Math.max(0, room.currentSpeakerIndex - 1);
      }

      const winner = GameEngine.checkWinCondition(room.players);
      if (winner) {
        room.phase = 'GAME_OVER';
        room.winningRole = winner;
        room.players.forEach((p) => {
          p.isSpeaking = false;
        });
        this.roomLastActivity.set(normalizedRoomId, Date.now());
        return room;
      }

      if (room.phase === 'TURN_PHASE') {
        const livingSpeakerIds = room.speakingOrder.filter((id) =>
          room.players.find((p) => p.id === id)?.isAlive
        );
        if (room.currentSpeakerIndex >= livingSpeakerIds.length) {
          room.phase = 'VOTING';
          room.currentSpeakerIndex = 0;
          room.players.forEach((p) => {
            p.hasVoted = false;
            p.votedTargetId = undefined;
            p.isSpeaking = false;
          });
        } else {
          const curSpeakerId = livingSpeakerIds[room.currentSpeakerIndex];
          room.players.forEach((p) => {
            p.isSpeaking = p.id === curSpeakerId;
          });
        }
      } else if (room.phase === 'VOTING') {
        const livingPlayers = room.players.filter((p) => p.isAlive);
        if (livingPlayers.length > 0 && livingPlayers.every((p) => p.hasVoted)) {
          this.resolveVoting(normalizedRoomId);
          return room;
        }
      } else if (
        room.phase === 'MR_WHITE_GUESS' &&
        room.eliminatedPlayer?.id === playerId
      ) {
        this.handleMrWhiteGuess(normalizedRoomId, '');
        return room;
      }
    } else if (room.speakingOrder.includes(playerId)) {
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
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (room.phase !== 'LOBBY') {
      throw new Error('Pengaturan tidak dapat diubah saat permainan sedang berlangsung');
    }

    const totalPlayers = room.players.length;
    const prospectiveUndercover = Math.max(
      1,
      settings.undercoverCount ?? room.settings.undercoverCount ?? 1
    );
    const prospectiveEnableMrWhite = settings.enableMrWhite ?? room.settings.enableMrWhite ?? false;
    const prospectiveMrWhite = prospectiveEnableMrWhite ? 1 : 0;

    if (totalPlayers >= 3) {
      const effectiveMrWhite = totalPlayers === 3 ? 0 : prospectiveMrWhite;
      const maxUndercover = Math.max(
        1,
        Math.floor((totalPlayers - effectiveMrWhite - 1) / 2)
      );
      if (prospectiveUndercover > maxUndercover) {
        throw new Error(
          `Konfigurasi peran tidak valid: Maksimal ${maxUndercover} Undercover untuk ${totalPlayers} pemain.`
        );
      }
    }

    room.settings = {
      ...room.settings,
      ...settings,
      enableMrWhite: prospectiveEnableMrWhite,
      mrWhiteCount: prospectiveMrWhite,
      undercoverCount: prospectiveUndercover,
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
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (room.phase !== 'LOBBY') {
      throw new Error('Permainan sudah berlangsung');
    }

    if (room.players.length < 3) {
      throw new Error('Minimal 3 pemain untuk memulai permainan.');
    }

    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    if (room.players.length === 3) {
      room.settings.enableMrWhite = false;
      room.settings.mrWhiteCount = 0;
      room.settings.undercoverCount = 1;
    } else {
      room.settings.mrWhiteCount = room.settings.enableMrWhite ? 1 : 0;
      const maxUndercover = Math.max(
        1,
        Math.floor((room.players.length - room.settings.mrWhiteCount - 1) / 2)
      );
      room.settings.undercoverCount = Math.min(
        Math.max(1, room.settings.undercoverCount || 1),
        maxUndercover
      );
    }

    const rawCustomPair = customWordPair || room.settings.customWordPair;
    let wordPair: WordPair;
    if (rawCustomPair) {
      const civWord = (rawCustomPair.civilianWord || '').trim();
      const ucWord = (rawCustomPair.undercoverWord || '').trim();
      if (!civWord || !ucWord || civWord.toLowerCase() === ucWord.toLowerCase()) {
        throw new Error('Pasangan kata kustom tidak valid atau identik');
      }
      wordPair = {
        ...rawCustomPair,
        category: (rawCustomPair.category || '').trim() || 'Kustom',
        civilianWord: civWord,
        undercoverWord: ucWord,
      };
    } else {
      wordPair = getRandomWordPair(room.settings.category);
    }

    const { players: assignedPlayers, speakingOrder } = GameEngine.assignRoles(
      room.players,
      room.settings,
      wordPair
    );

    room.phase = 'ROLE_REVEAL';
    room.round = 1;
    room.consecutiveTies = 0;
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
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (room.phase !== 'ROLE_REVEAL' && room.phase !== 'TURN_PHASE') {
      throw new Error('Fase giliran tidak sedang aktif');
    }

    room.eliminatedPlayer = undefined;

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
   * Transitions room to next speaking round with a fresh speaking order.
   */
  private startNextTurnRound(room: RoomState, clearEliminated: boolean): void {
    if (clearEliminated) {
      room.eliminatedPlayer = undefined;
    }
    room.round++;
    room.phase = 'TURN_PHASE';
    room.speakingOrder = GameEngine.generateSpeakingOrder(room.players);
    room.currentSpeakerIndex = 0;
    room.activeTurnRemainingSeconds = room.settings.turnDurationSeconds || 45;
    const firstSpeakerId = room.speakingOrder[0];
    room.players.forEach((p) => {
      p.hasVoted = false;
      p.votedTargetId = undefined;
      p.isSpeaking = p.id === firstSpeakerId;
    });
  }

  /**
   * Casts a vote from an active player for another player.
   * If all active players have voted, calculates outcome: Instant Skip on tie, Mr. White Guess, or Elimination.
   */
  public castVote(roomId: string, voterId: string, targetId: string): CastVoteResult {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (room.phase !== 'VOTING') {
      throw new Error('Sesi voting belum aktif');
    }

    if (voterId === targetId) {
      throw new Error('Tidak bisa memilih diri sendiri');
    }

    const voter = room.players.find((p) => p.id === voterId);
    const target = room.players.find((p) => p.id === targetId);

    if (!voter || !voter.isAlive) {
      throw new Error('Pemain yang memilih tidak aktif dalam permainan');
    }

    if (voter.hasVoted) {
      throw new Error('Kamu sudah memberikan suara');
    }

    if (!target || !target.isAlive) {
      throw new Error('Target voting tidak ditemukan atau sudah tereliminasi');
    }

    voter.hasVoted = true;
    voter.votedTargetId = targetId;

    const livingPlayers = room.players.filter((p) => p.isAlive);
    const allVoted = livingPlayers.every((p) => p.hasVoted);

    if (!allVoted) {
      this.roomLastActivity.set(normalizedRoomId, Date.now());
      return { room, isComplete: false };
    }

    return this.resolveVoting(normalizedRoomId);
  }

  /**
   * Resolves voting once all living players have voted.
   */
  public resolveVoting(roomId: string): CastVoteResult {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    const livingPlayers = room.players.filter((p) => p.isAlive);
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
      this.startNextTurnRound(room, true);
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
    this.startNextTurnRound(room, false);

    this.roomLastActivity.set(normalizedRoomId, Date.now());
    return { room, isComplete: true, isTie: false, eliminatedPlayer: eliminated };
  }

  /**
   * Handles Mr. White's emergency guess using fuzzy text matching.
   */
  public handleMrWhiteGuess(
    roomId: string,
    guess: string,
    callerPlayerId?: string
  ): MrWhiteGuessResult {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
    }

    if (room.phase !== 'MR_WHITE_GUESS') {
      throw new Error('Fase tebak kata Mr. White tidak sedang aktif');
    }

    if (callerPlayerId && room.eliminatedPlayer && callerPlayerId !== room.eliminatedPlayer.id) {
      const isHostTimeout =
        typeof guess === 'string' &&
        guess.trim() === '' &&
        room.players.some((p) => p.id === callerPlayerId && p.isHost);
      if (!isHostTimeout) {
        throw new Error('Hanya Mr. White yang tereliminasi yang dapat menebak kata');
      }
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

    this.startNextTurnRound(room, true);

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

    // Reconnect berhasil membatalkan cleanup timer disconnect
    this.cancelPlayerCleanup(session.roomId, session.playerId);

    this.roomLastActivity.set(session.roomId, Date.now());
    return { player, room };
  }

  /**
   * Resets room back to LOBBY for a rematch while retaining connected players.
   */
  public rematch(roomId: string): RoomState {
    const normalizedRoomId = (roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error(`Ruangan tidak ditemukan: ${normalizedRoomId}`);
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
    return this.rooms.get((roomId || '').trim().toUpperCase());
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
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
  }
}
