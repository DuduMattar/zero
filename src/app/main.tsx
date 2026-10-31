import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setupServiceWorker } from './sw';
import './styles.css';
import { App } from './App';

setupServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
