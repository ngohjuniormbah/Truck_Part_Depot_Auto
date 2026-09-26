/* Truck Parts Depot Auto — Web Push service worker */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'New Depot Order', body: event.data ? event.data.text() : 'A new customer order was received.' };
  }

  const title = payload.title || 'New Depot Order';
  const options = {
    body: payload.body || 'A new customer order was received.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: payload.tag || `order-${payload.orderId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || '/admin/orders',
      orderId: payload.orderId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/admin/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(targetUrl);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
