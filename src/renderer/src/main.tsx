import './assets/styles/main.css';
import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ToastProvider } from './components/ui/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="520701726183-iahovg08fss0u82mabmvjp2qindl55r2.apps.googleusercontent.com">
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
