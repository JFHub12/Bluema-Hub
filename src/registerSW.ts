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
        // Force check for newest service worker version
        registration.update().catch(() => {});

        // Monitor for new service worker updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[PWA] New version activated.');
                // Notify waiting worker to take over immediately
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                window.dispatchEvent(new CustomEvent('pwa-update-available'));
              }
            }
          });
        });

        // If there's an already waiting worker, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}
