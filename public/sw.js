// Service Worker — Memodate
// Etapa 2: esqueleto básico para registro do PWA
// Etapa 5: receberá o handler de push notifications

const CACHE_NAME = 'memodate-v1'

// Install — abre o cache e pré-carrega recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/'])
    }),
  )
  self.skipWaiting()
})

// Activate — limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

// Fetch — network first, fallback para cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})

// Push — será implementado na Etapa 5
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon',
      badge: '/icon',
      data: data,
    }),
  )
})

// Notification click — abre o app ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus()
        }
        return self.clients.openWindow('/')
      }),
  )
})
