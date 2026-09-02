import React from 'react';
import { PassPlayProvider, usePassPlay } from './context/PassPlayContext';
import { PassPlaySetupPage } from './pages/PassPlaySetupPage';
import { PassPlayGamePage } from './pages/PassPlayGamePage';

const PassPlayRouter: React.FC = () => {
  const { phase } = usePassPlay();

  if (phase === 'SETUP') {
    return <PassPlaySetupPage />;
  }

  return <PassPlayGamePage />;
};

export const App: React.FC = () => {
  return (
    <PassPlayProvider>
      <PassPlayRouter />
    </PassPlayProvider>
  );
};

export default App;
