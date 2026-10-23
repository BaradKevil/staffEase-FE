import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { registerSW } from 'virtual:pwa-register';

// Capture PWA beforeinstallprompt globally as early as possible
window.__staffEaseInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__staffEaseInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('staffease:installable'));
});

// Register PWA service worker for native push notifications and offline caching
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[staffEase PWA] New version available.');
  },
  onOfflineReady() {
    console.log('[staffEase PWA] App cached and ready for offline use.');
  },
});

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
