/**
 * Safely registers the Service Worker in the browser lifecycle.
 * Ensures registration is deferred until after the initial page load
 * to avoid competing with critical first-render assets and bandwidth.
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Defer registration until the page has fully loaded
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Monitor for new service worker updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log(
                '[PWA] New version available. Refresh to update.'
              );
              // Dispatch custom window event if UI needs to show an update banner
              window.dispatchEvent(new CustomEvent('pwa-update-available'));
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}
