import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// -------------------------------------------------------------
//  Native Web Push Notification Handler
// -------------------------------------------------------------
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'staffEase Notification';
    const options = {
      body: payload.body || 'You have an update in staffEase.',
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      data: payload.data || { url: payload.url || '/' },
      tag: payload.tag || `staffease-${Date.now()}`,
      vibrate: [100, 50, 100],
      actions: payload.actions || [
        { action: 'open', title: 'Open staffEase' },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[ServiceWorker] Push event error:', err);
  }
});

// -------------------------------------------------------------
//  Notification Click & Action Routing
// -------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
