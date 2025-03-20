// @ts-ignore - CSS import
import { StrictMode } from 'react';
// @ts-ignore - React DOM client import
import { createRoot } from 'react-dom/client';
// @ts-ignore - CSS import
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import AuthProvider from './context/AuthProvider';
// @ts-ignore - CSS import
import './styles/visual-enhancements.css';
import { BrowserRouter } from 'react-router-dom';

// Add type declarations for missing modules
declare module 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </BrowserRouter>
);

/*createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </BrowserRouter>
);*/
