import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest';
import { app, roomManager, io, server } from '../src/server.js';
import { registerRoomHandlers } from '../src/handlers/roomHandler.js';
import { registerGameHandlers } from '../src/handlers/gameHandler.js';
import { registerVoteHandlers } from '../src/handlers/voteHandler.js';

describe('Server and Handlers Integration', () => {
  afterAll(() => {
    roomManager.destroy();
  });

  it('should export app, server, io, and roomManager instances', () => {
    expect(app).toBeDefined();
    expect(server).toBeDefined();
    expect(io).toBeDefined();
    expect(roomManager).toBeDefined();
  });

  it('should register socket handlers without throwing errors', () => {
    const mockSocket: any = {
      id: 'test-socket-1',
      data: {},
      join: () => {},
      leave: () => {},
      on: () => {},
    };

    expect(() => {
      registerRoomHandlers(io, mockSocket, roomManager);
      registerGameHandlers(io, mockSocket, roomManager);
      registerVoteHandlers(io, mockSocket, roomManager);
    }).not.toThrow();
  });

  describe('Room socket handlers payload validation', () => {
    let handlers: Record<string, Function> = {};
    let mockSocket: any;

    beforeEach(() => {
      handlers = {};
      mockSocket = {
        id: 'test-socket-handler',
        data: {},
        join: vi.fn(),
        leave: vi.fn(),
        on: (event: string, fn: Function) => {
          handlers[event] = fn;
        },
      };
      registerRoomHandlers(io, mockSocket, roomManager);
    });

    it('should reject room:create with invalid payload', () => {
      let result: any;
      handlers['room:create'](null, (res: any) => {
        result = res;
      });
      expect(result).toEqual({ success: false, error: 'Data permintaan tidak valid' });
    });

    it('should reject room:join with invalid payload or missing roomId', () => {
      let result1: any;
      handlers['room:join'](null, (res: any) => {
        result1 = res;
      });
      expect(result1).toEqual({ success: false, error: 'Data permintaan tidak valid' });

      let result2: any;
      handlers['room:join']({ roomId: '   ' }, (res: any) => {
        result2 = res;
      });
      expect(result2).toEqual({ success: false, error: 'Kode ruangan wajib diisi' });
    });

    it('should reject room:update_settings with invalid payload or when not in room', () => {
      let result1: any;
      handlers['room:update_settings'](null, (res: any) => {
        result1 = res;
      });
      expect(result1).toEqual({ success: false, error: 'Data pengaturan tidak valid' });

      let result2: any;
      handlers['room:update_settings']({ settings: {} }, (res: any) => {
        result2 = res;
      });
      expect(result2).toEqual({ success: false, error: 'Tidak terhubung ke ruangan manapun' });
    });

    it('should reject player:reconnect with invalid payload or expired token', () => {
      let result1: any;
      handlers['player:reconnect'](null, (res: any) => {
        result1 = res;
      });
      expect(result1).toEqual({ success: false, error: 'Token pemain tidak valid' });

      let result2: any;
      handlers['player:reconnect']({ playerToken: 'invalid-token' }, (res: any) => {
        result2 = res;
      });
      expect(result2).toEqual({
        success: false,
        error: 'Sesi telah berakhir atau ruangan tidak ditemukan',
      });
    });
  });
});
