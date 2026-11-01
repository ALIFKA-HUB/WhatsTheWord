import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/nunito';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import App from './App';
import { AudioProvider } from './context/AudioContext';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AudioProvider>
        <App />
      </AudioProvider>
    </React.StrictMode>
  );
}
