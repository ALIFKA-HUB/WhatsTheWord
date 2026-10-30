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
        if (!payload || typeof payload !== 'object') {
          throw new Error('Data permintaan tidak valid');
        }
        const safePlayerName = (payload.playerName || '').trim() || 'Host';
        const safeAvatar = payload.avatar || '🕵️';

        const { roomId, playerToken, player, room } = roomManager.createRoom(
          safePlayerName,
          safeAvatar
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
          callback({ success: false, error: err.message || 'Gagal membuat ruangan' });
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
        if (!payload || typeof payload !== 'object') {
          throw new Error('Data permintaan tidak valid');
        }
        if (!payload.roomId || typeof payload.roomId !== 'string' || !payload.roomId.trim()) {
          throw new Error('Kode ruangan wajib diisi');
        }
        const safePlayerName = (payload.playerName || '').trim() || 'Agen Rahasia';
        const safeAvatar = payload.avatar || '🕵️';

        const { playerToken, player, room } = roomManager.joinRoom(
          payload.roomId,
          safePlayerName,
          safeAvatar,
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
          callback({ success: false, error: err.message || 'Gagal bergabung ke ruangan' });
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
        } else {
          io.to(roomId).emit('room:deleted', {
            roomId,
            reason: 'Ruangan telah dibubarkan karena semua pemain telah keluar.',
          });
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
        if (!payload || typeof payload !== 'object' || !payload.settings || typeof payload.settings !== 'object') {
          throw new Error('Data pengaturan tidak valid');
        }
        const roomId = socket.data.roomId;
        if (!roomId) {
          throw new Error('Tidak terhubung ke ruangan manapun');
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
        if (!payload || typeof payload !== 'object' || !payload.playerToken || typeof payload.playerToken !== 'string') {
          throw new Error('Token pemain tidak valid');
        }
        const result = roomManager.reconnectPlayer(payload.playerToken);
        if (!result) {
          if (callback) {
            callback({
              success: false,
              error: 'Sesi telah berakhir atau ruangan tidak ditemukan',
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
