import { describe, it, expect, afterAll } from 'vitest';
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
});
