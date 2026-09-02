import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, RoomState, GameSettings, WordPair, PlayerRole } from '../types/game.types';

export const STORAGE_KEYS = {
  PLAYER_TOKEN: 'whatstheword_player_token',
  ROOM_ID: 'whatstheword_room_id',
  SAVED_NAME: 'whatstheword_saved_name',
  SAVED_AVATAR: 'whatstheword_saved_avatar',
};

export interface VoteResultPayload {
  room: RoomState;
  isTie?: boolean;
  eliminatedPlayer?: Player;
  winner?: PlayerRole;
}

export interface MrWhiteResultPayload {
  isCorrect: boolean;
  winner?: PlayerRole;
  room: RoomState;
}

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  room: RoomState | null;
  currentPlayer: Player | null;
  playerToken: string | null;
  lastVoteResult: VoteResultPayload | null;
  lastMrWhiteResult: MrWhiteResultPayload | null;
  tieNotification: boolean;
  createRoom: (playerName: string, avatar: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
  joinRoom: (roomId: string, playerName: string, avatar: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => Promise<{ success: boolean; error?: string }>;
  startGame: (customWordPair?: WordPair) => Promise<{ success: boolean; error?: string }>;
  advanceTurn: () => Promise<{ success: boolean; error?: string }>;
  syncTimerTick: (remainingSeconds: number) => void;
  castVote: (targetId: string) => Promise<{ success: boolean; error?: string }>;
  submitMrWhiteGuess: (guess: string) => Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }>;
  rematch: () => Promise<{ success: boolean; error?: string }>;
  clearTieNotification: () => void;
  clearError: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

const getSocketUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // If running in development with Vite proxy or standard dev setup
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return window.location.origin;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN);
    }
    return null;
  });
  const [lastVoteResult, setLastVoteResult] = useState<VoteResultPayload | null>(null);
  const [lastMrWhiteResult, setLastMrWhiteResult] = useState<MrWhiteResultPayload | null>(null);
  const [tieNotification, setTieNotification] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const currentPlayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    currentPlayerIdRef.current = currentPlayer?.id || null;
  }, [currentPlayer]);

  // Establish socket connection on mount
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // Attempt session restoration if token exists
      const savedToken = localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN);
      if (savedToken) {
        newSocket.emit('player:reconnect', { playerToken: savedToken }, (res: any) => {
          if (res?.success && res?.room && res?.player) {
            setRoom(res.room);
            setCurrentPlayer(res.player);
            setPlayerToken(savedToken);
            currentPlayerIdRef.current = res.player.id;
          } else {
            // Expired session
            localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
            setPlayerToken(null);
            setRoom(null);
            setCurrentPlayer(null);
          }
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setIsConnecting(false);
      setError(`Gagal terhubung ke server: ${err.message}`);
    });

    // Realtime Game Events
    newSocket.on('room:updated', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
      if (currentPlayerIdRef.current) {
        const me = updatedRoom.players.find((p) => p.id === currentPlayerIdRef.current);
        if (me) {
          setCurrentPlayer(me);
        }
      }
    });

    newSocket.on('game:started', (startedRoom: RoomState) => {
      setRoom(startedRoom);
      setLastVoteResult(null);
      setLastMrWhiteResult(null);
      setTieNotification(false);
      if (currentPlayerIdRef.current) {
        const me = startedRoom.players.find((p) => p.id === currentPlayerIdRef.current);
        if (me) {
          setCurrentPlayer(me);
        }
      }
    });

    newSocket.on('turn:timer_sync', (payload: { remainingSeconds: number }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          activeTurnRemainingSeconds: payload.remainingSeconds,
        };
      });
    });

    newSocket.on('vote:completed', (payload: VoteResultPayload) => {
      setLastVoteResult(payload);
      setRoom(payload.room);

      if (payload.isTie) {
        setTieNotification(true);
      }

      if (currentPlayerIdRef.current) {
        const me = payload.room.players.find((p) => p.id === currentPlayerIdRef.current);
        if (me) {
          setCurrentPlayer(me);
        }
      }
    });

    newSocket.on('mrwhite:result', (payload: MrWhiteResultPayload) => {
      setLastMrWhiteResult(payload);
      setRoom(payload.room);
      if (currentPlayerIdRef.current) {
        const me = payload.room.players.find((p) => p.id === currentPlayerIdRef.current);
        if (me) {
          setCurrentPlayer(me);
        }
      }
    });

    newSocket.on('game:rematch_started', (rematchRoom: RoomState) => {
      setRoom(rematchRoom);
      setLastVoteResult(null);
      setLastMrWhiteResult(null);
      setTieNotification(false);
      if (currentPlayerIdRef.current) {
        const me = rematchRoom.players.find((p) => p.id === currentPlayerIdRef.current);
        if (me) {
          setCurrentPlayer(me);
        }
      }
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []);

  const clearTieNotification = useCallback(() => {
    setTieNotification(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create Room
  const createRoom = useCallback(
    async (playerName: string, avatar: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Belum terhubung ke server game' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'room:create',
          { playerName, avatar },
          (res: any) => {
            if (res?.success && res.room && res.player && res.playerToken) {
              setRoom(res.room);
              setCurrentPlayer(res.player);
              setPlayerToken(res.playerToken);
              currentPlayerIdRef.current = res.player.id;
              localStorage.setItem(STORAGE_KEYS.PLAYER_TOKEN, res.playerToken);
              localStorage.setItem(STORAGE_KEYS.ROOM_ID, res.roomId);
              localStorage.setItem(STORAGE_KEYS.SAVED_NAME, playerName);
              localStorage.setItem(STORAGE_KEYS.SAVED_AVATAR, avatar);
              resolve({ success: true, roomId: res.roomId });
            } else {
              const errMsg = res?.error || 'Gagal membuat room';
              setError(errMsg);
              resolve({ success: false, error: errMsg });
            }
          }
        );
      });
    },
    []
  );

  // Join Room
  const joinRoom = useCallback(
    async (
      roomId: string,
      playerName: string,
      avatar: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Belum terhubung ke server game' };
      }

      const existingToken = localStorage.getItem(STORAGE_KEYS.PLAYER_TOKEN) || undefined;

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'room:join',
          {
            roomId: roomId.trim().toUpperCase(),
            playerName,
            avatar,
            playerToken: existingToken,
          },
          (res: any) => {
            if (res?.success && res.room && res.player && res.playerToken) {
              setRoom(res.room);
              setCurrentPlayer(res.player);
              setPlayerToken(res.playerToken);
              currentPlayerIdRef.current = res.player.id;
              localStorage.setItem(STORAGE_KEYS.PLAYER_TOKEN, res.playerToken);
              localStorage.setItem(STORAGE_KEYS.ROOM_ID, res.room.roomId);
              localStorage.setItem(STORAGE_KEYS.SAVED_NAME, playerName);
              localStorage.setItem(STORAGE_KEYS.SAVED_AVATAR, avatar);
              resolve({ success: true });
            } else {
              const errMsg = res?.error || 'Gagal bergabung ke room';
              setError(errMsg);
              resolve({ success: false, error: errMsg });
            }
          }
        );
      });
    },
    []
  );

  // Leave Room
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('room:leave');
    }
    localStorage.removeItem(STORAGE_KEYS.PLAYER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROOM_ID);
    setRoom(null);
    setCurrentPlayer(null);
    setPlayerToken(null);
    setLastVoteResult(null);
    setLastMrWhiteResult(null);
    setTieNotification(false);
  }, []);

  // Update Settings
  const updateSettings = useCallback(
    async (settings: Partial<GameSettings>): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Tidak terhubung ke server' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'room:update_settings',
          { settings },
          (res: any) => {
            if (res?.success && res.room) {
              setRoom(res.room);
              resolve({ success: true });
            } else {
              resolve({ success: false, error: res?.error || 'Gagal memperbarui pengaturan' });
            }
          }
        );
      });
    },
    []
  );

  // Start Game
  const startGame = useCallback(
    async (customWordPair?: WordPair): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Tidak terhubung ke server' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit(
          'game:start',
          { customWordPair },
          (res: any) => {
            if (res?.success && res.room) {
              setRoom(res.room);
              resolve({ success: true });
            } else {
              const errMsg = res?.error || 'Gagal memulai game';
              setError(errMsg);
              resolve({ success: false, error: errMsg });
            }
          }
        );
      });
    },
    []
  );

  // Advance Turn
  const advanceTurn = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!socketRef.current || !socketRef.current.connected) {
      return { success: false, error: 'Tidak terhubung ke server' };
    }

    return new Promise((resolve) => {
      socketRef.current!.emit('turn:end', (res: any) => {
        if (res?.success && res.room) {
          setRoom(res.room);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res?.error || 'Gagal mengakhiri giliran' });
        }
      });
    });
  }, []);

  // Sync Timer Tick
  const syncTimerTick = useCallback((remainingSeconds: number) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('turn:timer_tick', { remainingSeconds });
    }
  }, []);

  // Cast Vote
  const castVote = useCallback(
    async (targetId: string): Promise<{ success: boolean; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Tidak terhubung ke server' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit('vote:cast', { targetId }, (res: any) => {
          if (res?.success && res.room) {
            setRoom(res.room);
            resolve({ success: true });
          } else {
            const errMsg = res?.error || 'Gagal memilih target';
            setError(errMsg);
            resolve({ success: false, error: errMsg });
          }
        });
      });
    },
    []
  );

  // Submit Mr White Guess
  const submitMrWhiteGuess = useCallback(
    async (
      guess: string
    ): Promise<{ success: boolean; isCorrect?: boolean; winner?: PlayerRole; error?: string }> => {
      if (!socketRef.current || !socketRef.current.connected) {
        return { success: false, error: 'Tidak terhubung ke server' };
      }

      return new Promise((resolve) => {
        socketRef.current!.emit('mrwhite:guess', { guess }, (res: any) => {
          if (res?.success && res.room) {
            setRoom(res.room);
            resolve({
              success: true,
              isCorrect: res.isCorrect,
              winner: res.winner,
            });
          } else {
            const errMsg = res?.error || 'Gagal mengirim tebakan';
            setError(errMsg);
            resolve({ success: false, error: errMsg });
          }
        });
      });
    },
    []
  );

  // Rematch
  const rematch = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!socketRef.current || !socketRef.current.connected) {
      return { success: false, error: 'Tidak terhubung ke server' };
    }

    return new Promise((resolve) => {
      socketRef.current!.emit('game:rematch', (res: any) => {
        if (res?.success && res.room) {
          setRoom(res.room);
          setLastVoteResult(null);
          setLastMrWhiteResult(null);
          setTieNotification(false);
          resolve({ success: true });
        } else {
          const errMsg = res?.error || 'Gagal melakukan rematch';
          setError(errMsg);
          resolve({ success: false, error: errMsg });
        }
      });
    });
  }, []);

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    error,
    room,
    currentPlayer,
    playerToken,
    lastVoteResult,
    lastMrWhiteResult,
    tieNotification,
    createRoom,
    joinRoom,
    leaveRoom,
    updateSettings,
    startGame,
    advanceTurn,
    syncTimerTick,
    castVote,
    submitMrWhiteGuess,
    rematch,
    clearTieNotification,
    clearError,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
