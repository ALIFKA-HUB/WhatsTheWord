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
  const [homeIntent, setHomeIntent] = useState<{ focus?: 'local' | 'online'; openPacks?: boolean }>({});
  const { phase: passPlayPhase, resetToSetup } = usePassPlay();
  const { room } = useSocket();

  const goToApp = (view: Exclude<AppView, 'LANDING'>, intent: { focus?: 'local' | 'online'; openPacks?: boolean } = {}) => {
    setHomeIntent(intent);
    if (window.location.pathname !== PLAY_PATH) {
      window.history.pushState({}, '', PLAY_PATH + window.location.search);
    }
    setCurrentView(view);
  };

  const goToHome = () => {
    setHomeIntent({});
    setCurrentView('HOME');
  };

  useEffect(() => {
    if (currentView !== 'LANDING' && window.location.pathname !== PLAY_PATH) {
      window.history.pushState({}, '', PLAY_PATH + window.location.search);
    }
  }, [currentView]);

  useEffect(() => {
    const onPop = () => {
      setHomeIntent({});
      setCurrentView(resolveInitialView(window.location.pathname, window.location.search));
    };
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
      goToHome();
    }
  }, [room, currentView]);

  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onPlayLocal={() => goToApp('PASS_PLAY')}
        onPlayOnline={() => goToApp('HOME', { focus: 'online' })}
        onOpenCustomPacks={() => goToApp('HOME', { openPacks: true })}
      />
    );
  }

  if (currentView === 'PASS_PLAY') {
    if (passPlayPhase === 'SETUP') {
      return <PassPlaySetupPage onBack={goToHome} />;
    }
    return (
      <PassPlayGamePage
        onBackToHome={() => {
          resetToSetup();
          goToHome();
        }}
      />
    );
  }

  if (currentView === 'ONLINE') {
    if (!room || room.phase === 'LOBBY') {
      return (
        <LobbyPage
          onLeaveRoom={goToHome}
          onGameStarted={() => {}}
        />
      );
    }
    return (
      <RoomGamePage
        onReturnToLobby={() => {}}
        onExitRoom={goToHome}
      />
    );
  }

  return (
    <HomePage
      onStartPassPlay={() => goToApp('PASS_PLAY')}
      onEnterOnlineLobby={() => goToApp('ONLINE')}
      initialFocus={homeIntent.focus}
      initialOpenPacks={homeIntent.openPacks}
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
