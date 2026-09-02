import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager.js';
import { GameSettings, WordPair } from '../types/game.types.js';

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
        if (!roomId) {
          throw new Error('Not connected to a room');
        }

        const room = roomManager.startGame(
          roomId,
          payload?.settings,
          payload?.customWordPair
        );

        io.to(roomId).emit('room:updated', room);
        io.to(roomId).emit('game:started', room);

        if (callback) {
          callback({ success: true, room });
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
      if (!roomId) {
        throw new Error('Not connected to a room');
      }

      const room = roomManager.advanceTurn(roomId);
      io.to(roomId).emit('room:updated', room);

      if (callback) {
        callback({ success: true, room });
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
      if (!roomId) {
        throw new Error('Not connected to a room');
      }

      const room = roomManager.rematch(roomId);
      io.to(roomId).emit('room:updated', room);
      io.to(roomId).emit('game:rematch_started', room);

      if (callback) {
        callback({ success: true, room });
      }
    } catch (err: any) {
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });
}
