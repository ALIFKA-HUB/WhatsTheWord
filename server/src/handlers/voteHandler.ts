import { Server, Socket } from 'socket.io';
import { RoomManager } from '../managers/RoomManager.js';

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

        const result = roomManager.castVote(roomId, voterId, payload.targetId);
        io.to(roomId).emit('room:updated', result.room);

        if (result.isComplete) {
          io.to(roomId).emit('vote:completed', {
            room: result.room,
            isTie: result.isTie,
            eliminatedPlayer: result.eliminatedPlayer,
            winner: result.winner,
          });
        }

        if (callback) {
          callback({
            success: true,
            ...result,
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
        if (!roomId) {
          throw new Error('Not connected to a room');
        }

        const result = roomManager.handleMrWhiteGuess(roomId, payload.guess);
        io.to(roomId).emit('room:updated', result.room);
        io.to(roomId).emit('mrwhite:result', {
          isCorrect: result.isCorrect,
          winner: result.winner,
          room: result.room,
        });

        if (callback) {
          callback({
            success: true,
            ...result,
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
