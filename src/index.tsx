import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

let PUBLISHABLE_KEY = (window as any).VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || (process.env as any).VITE_CLERK_PUBLISHABLE_KEY;

// Handle cases where the key might have been copied with the variable name prefix (e.g. "VITE_CLERK_PUBLISHABLE_KEY=pk_...")
if (PUBLISHABLE_KEY && typeof PUBLISHABLE_KEY === 'string' && PUBLISHABLE_KEY.includes('=')) {
  PUBLISHABLE_KEY = PUBLISHABLE_KEY.split('=').pop() || '';
}

if (!PUBLISHABLE_KEY) {
  console.error("Clerk Publishable Key is missing. Please ensure VITE_CLERK_PUBLISHABLE_KEY is set in your environment variables.");
}


const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    try {
      const swUrl = new URL('./sw.js', window.location.href).href;
      if (new URL(swUrl).origin !== window.location.origin) {
        console.warn('[Bulela] ServiceWorker origin mismatch. SW registration skipped.');
        return;
      }
      await navigator.serviceWorker.register(swUrl, { scope: './' });
      console.log('[Bulela] ServiceWorker registered successfully');
    } catch (err) {
      console.warn('[Bulela] ServiceWorker registration skipped:', err);
    }
  }
};

registerServiceWorker();


const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      supportEmail="support@bulela.app"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
