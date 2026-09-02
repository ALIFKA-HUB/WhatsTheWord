import React from 'react';
import ReactDOM from 'react-dom/client';
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
