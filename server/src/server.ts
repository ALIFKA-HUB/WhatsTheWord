import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './managers/RoomManager.js';
import { registerRoomHandlers } from './handlers/roomHandler.js';
import { registerGameHandlers } from './handlers/gameHandler.js';
import { registerVoteHandlers } from './handlers/voteHandler.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

const roomManager = new RoomManager();
const startTime = Date.now();

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    activeRooms: roomManager.getActiveRoomsCount(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    service: 'whatstheword-server',
  });
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  registerRoomHandlers(io, socket, roomManager);
  registerGameHandlers(io, socket, roomManager);
  registerVoteHandlers(io, socket, roomManager);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Server] What's The Word server running on port ${PORT}`);
  });
}

export { app, server, io, roomManager };
