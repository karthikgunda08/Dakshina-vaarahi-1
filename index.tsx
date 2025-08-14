
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Only register the service worker in production
if ('serviceWorker' in navigator && (import.meta as any).env.PROD) {
  window.addEventListener('load', () => {
    // Use an absolute URL constructed from the current origin to avoid same-origin policy issues in complex hosting environments.
    const swUrl = new URL('sw.js', window.location.origin);
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.warn('ServiceWorker registration failed: ', error);
      });
  });
}