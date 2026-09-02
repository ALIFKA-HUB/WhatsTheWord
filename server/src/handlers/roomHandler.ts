import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager.js';
import { GameSettings } from '../types/game.types.js';

export function registerRoomHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager
): void {
  // Create Room
  socket.on(
    'room:create',
    (
      payload: { playerName: string; avatar: string },
      callback?: (res: any) => void
    ) => {
      try {
        const { roomId, playerToken, player, room } = roomManager.createRoom(
          payload.playerName,
          payload.avatar
        );

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.playerId = player.id;
        socket.data.playerToken = playerToken;

        io.to(roomId).emit('room:updated', room);

        if (callback) {
          callback({
            success: true,
            roomId,
            playerToken,
            player,
            room,
          });
        }
      } catch (err: any) {
        if (callback) {
          callback({ success: false, error: err.message || 'Failed to create room' });
        }
      }
    }
  );

  // Join Room
  socket.on(
    'room:join',
    (
      payload: {
        roomId: string;
        playerName: string;
        avatar: string;
        playerToken?: string;
      },
      callback?: (res: any) => void
    ) => {
      try {
        const { playerToken, player, room } = roomManager.joinRoom(
          payload.roomId,
          payload.playerName,
          payload.avatar,
          payload.playerToken
        );

        const normalizedRoomId = room.roomId;
        socket.join(normalizedRoomId);
        socket.data.roomId = normalizedRoomId;
        socket.data.playerId = player.id;
        socket.data.playerToken = playerToken;

        io.to(normalizedRoomId).emit('room:updated', room);

        if (callback) {
          callback({
            success: true,
            playerToken,
            player,
            room,
          });
        }
      } catch (err: any) {
        if (callback) {
          callback({ success: false, error: err.message || 'Failed to join room' });
        }
      }
    }
  );

  // Leave Room
  socket.on('room:leave', (callback?: (res: any) => void) => {
    try {
      const roomId = socket.data.roomId;
      const playerId = socket.data.playerId;

      if (roomId && playerId) {
        socket.leave(roomId);
        const room = roomManager.leaveRoom(roomId, playerId);
        if (room) {
          io.to(roomId).emit('room:updated', room);
        }
      }

      socket.data.roomId = undefined;
      socket.data.playerId = undefined;
      socket.data.playerToken = undefined;

      if (callback) {
        callback({ success: true });
      }
    } catch (err: any) {
      if (callback) {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Update Settings
  socket.on(
    'room:update_settings',
    (
      payload: { settings: Partial<GameSettings> },
      callback?: (res: any) => void
    ) => {
      try {
        const roomId = socket.data.roomId;
        if (!roomId) {
          throw new Error('Not connected to a room');
        }

        const room = roomManager.updateSettings(roomId, payload.settings);
        io.to(roomId).emit('room:updated', room);

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

  // Player Reconnect
  socket.on(
    'player:reconnect',
    (payload: { playerToken: string }, callback?: (res: any) => void) => {
      try {
        const result = roomManager.reconnectPlayer(payload.playerToken);
        if (!result) {
          if (callback) {
            callback({
              success: false,
              error: 'Session expired or room not found',
            });
          }
          return;
        }

        const { player, room } = result;
        socket.join(room.roomId);
        socket.data.roomId = room.roomId;
        socket.data.playerId = player.id;
        socket.data.playerToken = payload.playerToken;

        io.to(room.roomId).emit('room:updated', room);

        if (callback) {
          callback({
            success: true,
            player,
            room,
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
