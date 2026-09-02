import { useContext } from 'react';
import { SocketContext, SocketContextType } from '../context/SocketContext';

/**
 * Custom hook to interact with the Socket.io room and game context.
 */
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default useSocket;
