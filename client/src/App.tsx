import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioContext';
import { PassPlayProvider, usePassPlay } from './context/PassPlayContext';
import { SocketProvider } from './context/SocketContext';
import { useSocket } from './hooks/useSocket';
import { HomePage } from './pages/HomePage';
import { PassPlaySetupPage } from './pages/PassPlaySetupPage';
import { PassPlayGamePage } from './pages/PassPlayGamePage';
import { LobbyPage } from './pages/LobbyPage';
import { RoomGamePage } from './pages/RoomGamePage';


type AppView = 'HOME' | 'PASS_PLAY' | 'ONLINE';

const AppRouter: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('HOME');
  const { phase: passPlayPhase, resetToSetup } = usePassPlay();
  const { room } = useSocket();

  // If a room is active, switch to ONLINE view
  useEffect(() => {
    if (room && currentView === 'HOME') {
      setCurrentView('ONLINE');
    }
  }, [room, currentView]);

  if (currentView === 'PASS_PLAY') {
    if (passPlayPhase === 'SETUP') {
      return <PassPlaySetupPage onBack={() => setCurrentView('HOME')} />;
    }
    return (
      <PassPlayGamePage
        onBackToHome={() => {
          resetToSetup();
          setCurrentView('HOME');
        }}
      />
    );
  }

  if (currentView === 'ONLINE') {
    if (!room || room.phase === 'LOBBY') {
      return (
        <LobbyPage
          onLeaveRoom={() => setCurrentView('HOME')}
          onGameStarted={() => {}}
        />
      );
    }
    return (
      <RoomGamePage
        onReturnToLobby={() => {}}
        onExitRoom={() => setCurrentView('HOME')}
      />
    );
  }

  return (
    <HomePage
      onStartPassPlay={() => setCurrentView('PASS_PLAY')}
      onEnterOnlineLobby={() => setCurrentView('ONLINE')}
    />
  );
};

export const App: React.FC = () => {
  return (
    <AudioProvider>
      <SocketProvider>
        <PassPlayProvider>
          <AppRouter />
        </PassPlayProvider>
      </SocketProvider>
    </AudioProvider>
  );
};

export default App;

