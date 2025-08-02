// 🟢 Service Worker для push-уведомлений WorkInCZ
self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'WorkInCZ', {
      body: data.body || 'У вас новая вакансия или отклик!',
      icon: '/favicon.ico',
      data: data.url || '/' // Куда перейти по клику
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(clients.openWindow(url));
}); 