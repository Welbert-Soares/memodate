// Service Worker — Memodate

const CACHE_NAME = 'memodate-v2'
const OFFLINE_URL = '/offline'

// Install — pré-carrega recursos essenciais e a página offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', OFFLINE_URL])
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

// Fetch — network first, fallback para cache, fallback para offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  // Não interceptar chamadas de API nem chrome-extension
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/') || url.protocol === 'chrome-extension:') return

  const isNavigation = event.request.mode === 'navigate'

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Só cachear respostas válidas de mesma origem
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        if (isNavigation) {
          return caches.match(OFFLINE_URL)
        }
        return new Response('', { status: 503 })
      }),
  )
})

// Push — exibe a notificação recebida
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icone_memodate.webp',
      badge: '/icone_memodate.webp',
      tag: data.tag || 'memodate',
      data: data,
    }),
  )
})

// Notification click — abre o app ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].navigate(url).then((client) => client.focus())
        }
        return self.clients.openWindow(url)
      }),
  )
})
