import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager.js';
import { GameSettings, WordPair } from '../types/game.types.js';
import { broadcastRoomState, sanitizeRoomForPlayer } from '../utils/sanitize.js';

export function registerGameHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  // Start Game
  socket.on(
    'game:start',
    (
      payload?: { settings?: GameSettings; customWordPair?: WordPair },
      callback?: (res: any) => void
    ) => {
      try {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        if (!roomId) {
          throw new Error('Not connected to a room');
        }

        const roomToStart = roomManager.getRoom(roomId);
        if (!roomToStart) {
          throw new Error('Ruangan tidak ditemukan');
        }

        const caller = roomToStart.players.find((p) => p.id === playerId);
        if (!caller || !caller.isHost) {
          throw new Error('Hanya host yang dapat memulai permainan');
        }

        const room = roomManager.startGame(
          roomId,
          payload?.settings,
          payload?.customWordPair
        );

        broadcastRoomState(io, room, 'room:updated');
        broadcastRoomState(io, room, 'game:started');

        if (callback) {
          callback({ success: true, room: sanitizeRoomForPlayer(room, playerId) });
        }
      } catch (err: any) {
        if (callback) {
          callback({ success: false, error: err.message });
        }
      }
    }
  );

  // Advance / End Turn
  socket.on('turn:end', (callback?: (res: any) => void) => {
    try {
      const roomId = socket.data.roomId;
      const playerId = socket.data.playerId;
      if (!roomId) {
        throw new Error('Not connected to a room');
      }

      const room = roomManager.advanceTurn(roomId);
      broadcastRoomState(io, room, 'room:updated');

      if (callback) {
        callback({ success: true, room: sanitizeRoomForPlayer(room, playerId) });
      }
    } catch (err: any) {
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Turn Timer Tick Sync
  socket.on('turn:timer_tick', (payload: { remainingSeconds: number }) => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.activeTurnRemainingSeconds = payload.remainingSeconds;
        io.to(roomId).emit('turn:timer_sync', {
          remainingSeconds: payload.remainingSeconds,
        });
      }
    }
  });

  // Rematch
  socket.on('game:rematch', (callback?: (res: any) => void) => {
    try {
      const roomId = socket.data.roomId;
      const playerId = socket.data.playerId;
      if (!roomId) {
        throw new Error('Not connected to a room');
      }

      const roomToRematch = roomManager.getRoom(roomId);
      if (!roomToRematch) {
        throw new Error('Ruangan tidak ditemukan');
      }

      const caller = roomToRematch.players.find((p) => p.id === playerId);
      if (!caller || !caller.isHost) {
        throw new Error('Hanya host yang dapat memulai pertandingan ulang');
      }

      const room = roomManager.rematch(roomId);
      broadcastRoomState(io, room, 'room:updated');
      broadcastRoomState(io, room, 'game:rematch_started');

      if (callback) {
        callback({ success: true, room: sanitizeRoomForPlayer(room, playerId) });
      }
    } catch (err: any) {
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });
}
