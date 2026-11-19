import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager.js';
import { broadcastRoomState, sanitizeRoomForPlayer } from '../utils/sanitize.js';

export function registerVoteHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  // Cast Vote
  socket.on(
    'vote:cast',
    (payload: { targetId: string }, callback?: (res: any) => void) => {
      try {
        const roomId = socket.data.roomId;
        const voterId = socket.data.playerId;

        if (!roomId || !voterId) {
          throw new Error('Not connected to a room as active player');
        }

        if (!payload || typeof payload !== 'object' || typeof payload.targetId !== 'string') {
          throw new Error('Target voting tidak valid');
        }

        const result = roomManager.castVote(roomId, voterId, payload.targetId);
        broadcastRoomState(io, result.room, 'room:updated');

        if (result.isComplete) {
          const normalizedRoomId = result.room.roomId.trim().toUpperCase();
          const socketIds = io.sockets.adapter.rooms.get(normalizedRoomId);
          if (socketIds) {
            for (const socketId of socketIds) {
              const targetSocket = io.sockets.sockets.get(socketId);
              if (!targetSocket) continue;
              const pId = targetSocket.data?.playerId;
              const sanitized = sanitizeRoomForPlayer(result.room, pId);
              targetSocket.emit('vote:completed', {
                room: sanitized,
                isTie: result.isTie,
                eliminatedPlayer: sanitized.eliminatedPlayer,
                winner: result.winner,
              });
            }
          }
        }

        if (callback) {
          const sanitizedForVoter = sanitizeRoomForPlayer(result.room, voterId);
          callback({
            success: true,
            ...result,
            room: sanitizedForVoter,
            eliminatedPlayer: sanitizedForVoter.eliminatedPlayer,
          });
        }
      } catch (err: any) {
        if (callback) {
          callback({ success: false, error: err.message });
        }
      }
    }
  );

  // Mr. White Guess
  socket.on(
    'mrwhite:guess',
    (payload: { guess: string }, callback?: (res: any) => void) => {
      try {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        if (!roomId || !playerId) {
          throw new Error('Not connected to a room');
        }

        if (!payload || typeof payload !== 'object' || typeof payload.guess !== 'string') {
          throw new Error('Tebakan tidak valid');
        }

        const room = roomManager.getRoom(roomId);
        if (!room) {
          throw new Error('Ruangan tidak ditemukan');
        }

        if (room.phase !== 'MR_WHITE_GUESS') {
          throw new Error('Fase tebak kata Mr. White tidak sedang aktif');
        }

        const caller = room.players.find((p) => p.id === playerId);
        const isEliminatedMrWhite = room.eliminatedPlayer?.id === playerId;
        const isHostTimeout = Boolean(caller?.isHost) && payload.guess.trim() === '';

        if (!isEliminatedMrWhite && !isHostTimeout) {
          if (callback) {
            callback({
              success: false,
              error: 'Hanya Mr. White yang tereliminasi yang dapat menebak kata',
            });
          }
          return;
        }

        const result = roomManager.handleMrWhiteGuess(roomId, payload.guess, playerId);
        broadcastRoomState(io, result.room, 'room:updated');

        const normalizedRoomId = result.room.roomId.trim().toUpperCase();
        const socketIds = io.sockets.adapter.rooms.get(normalizedRoomId);
        if (socketIds) {
          for (const socketId of socketIds) {
            const targetSocket = io.sockets.sockets.get(socketId);
            if (!targetSocket) continue;
            const pId = targetSocket.data?.playerId;
            const sanitized = sanitizeRoomForPlayer(result.room, pId);
            targetSocket.emit('mrwhite:result', {
              isCorrect: result.isCorrect,
              winner: result.winner,
              room: sanitized,
            });
          }
        }

        if (callback) {
          callback({
            success: true,
            ...result,
            room: sanitizeRoomForPlayer(result.room, socket.data.playerId),
          });
        }
      } catch (err: any) {
        if (callback) {
          callback({ success: false, error: err.message });
        }
      }
    }
  );
}
