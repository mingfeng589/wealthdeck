import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DataProviderRoot } from './data/context';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProviderRoot>
      <App />
    </DataProviderRoot>
  </StrictMode>,
);
