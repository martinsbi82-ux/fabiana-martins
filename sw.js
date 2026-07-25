const CACHE_NAME = 'caderno-curadoria-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/core.js',
  './js/view-dashboard.js',
  './js/view-agenda.js',
  './js/view-editorial.js',
  './js/view-marcas.js',
  './js/view-tendencias.js',
  './js/view-colecoes.js',
  './js/view-concorrentes.js',
  './js/view-pesquisa.js',
  './js/view-biblioteca.js',
  './js/view-moodboards.js',
  './js/view-objetivos.js',
  './js/view-relatorios.js',
  './js/view-busca.js',
  './js/view-assistente.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        if(response && response.status === 200 && response.type === 'basic'){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
