import { Server } from 'socket.io';
import { RoomState } from '../types/game.types.js';

/**
 * Sanitizes room state for a specific player socket to prevent role and secret word leaks.
 * In active game phases, players only see their own role & word.
 * In GAME_OVER, all roles and words are revealed for the endgame recap.
 */
export function sanitizeRoomForPlayer(
  room: RoomState,
  playerId?: string
): RoomState {
  if (!room) return room;

  // In GAME_OVER, reveal all roles and words for the post-game recap
  if (room.phase === 'GAME_OVER') {
    return room;
  }

  return {
    ...room,
    wordPair: undefined,
    settings: {
      ...room.settings,
      customWordPair: undefined,
    },
    players: room.players.map((p) => {
      if (p.id === playerId) {
        return { ...p };
      }
      return {
        ...p,
        role: undefined,
        word: undefined,
      };
    }),
    eliminatedPlayer: room.eliminatedPlayer
      ? {
          ...room.eliminatedPlayer,
          word: undefined,
          // Only reveal role if eliminated player is Mr. White during MR_WHITE_GUESS phase
          role:
            room.phase === 'MR_WHITE_GUESS' &&
            room.eliminatedPlayer.role === 'MR_WHITE'
              ? 'MR_WHITE'
              : room.eliminatedPlayer.id === playerId
              ? room.eliminatedPlayer.role
              : undefined,
        }
      : undefined,
  };
}

/**
 * Broadcasts a personalized, sanitized room state to each connected socket in the room.
 */
export function broadcastRoomState(
  io: Server,
  room: RoomState,
  eventName: string = 'room:updated',
  customPayloadGenerator?: (sanitizedRoom: RoomState) => Record<string, any>
): void {
  const normalizedRoomId = (room.roomId || '').trim().toUpperCase();
  const socketIds = io.sockets.adapter.rooms.get(normalizedRoomId);

  if (!socketIds || socketIds.size === 0) {
    return;
  }

  for (const socketId of socketIds) {
    const targetSocket = io.sockets.sockets.get(socketId);
    if (!targetSocket) continue;

    const playerId = targetSocket.data?.playerId;
    const sanitized = sanitizeRoomForPlayer(room, playerId);
    const payload = customPayloadGenerator
      ? { ...customPayloadGenerator(sanitized), room: sanitized }
      : sanitized;

    targetSocket.emit(eventName, payload);
  }
}
