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
import { LandingPage } from './landing/LandingPage';
import { AppView, PLAY_PATH, resolveInitialView } from './utils/initialView';

const AppRouter: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() =>
    resolveInitialView(window.location.pathname, window.location.search)
  );
  const { phase: passPlayPhase, resetToSetup } = usePassPlay();
  const { room } = useSocket();

  const goToApp = (view: Exclude<AppView, 'LANDING'>) => {
    if (window.location.pathname !== PLAY_PATH) {
      window.history.pushState({}, '', PLAY_PATH + window.location.search);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    const onPop = () => setCurrentView(resolveInitialView(window.location.pathname, window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // If a room is active, switch to ONLINE view
  useEffect(() => {
    if (room && currentView === 'HOME') {
      setCurrentView('ONLINE');
    }
  }, [room, currentView]);

  useEffect(() => {
    if (!room && currentView === 'ONLINE') {
      goToApp('HOME');
    }
  }, [room, currentView]);

  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onPlayLocal={() => goToApp('PASS_PLAY')}
        onPlayOnline={() => goToApp('HOME')}
      />
    );
  }

  if (currentView === 'PASS_PLAY') {
    if (passPlayPhase === 'SETUP') {
      return <PassPlaySetupPage onBack={() => goToApp('HOME')} />;
    }
    return (
      <PassPlayGamePage
        onBackToHome={() => {
          resetToSetup();
          goToApp('HOME');
        }}
      />
    );
  }

  if (currentView === 'ONLINE') {
    if (!room || room.phase === 'LOBBY') {
      return (
        <LobbyPage
          onLeaveRoom={() => goToApp('HOME')}
          onGameStarted={() => {}}
        />
      );
    }
    return (
      <RoomGamePage
        onReturnToLobby={() => {}}
        onExitRoom={() => goToApp('HOME')}
      />
    );
  }

  return (
    <HomePage
      onStartPassPlay={() => goToApp('PASS_PLAY')}
      onEnterOnlineLobby={() => goToApp('ONLINE')}
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
