self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
    // No-op: satisfies PWA installability requirement while letting the browser handle all fetches normally
});
