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
