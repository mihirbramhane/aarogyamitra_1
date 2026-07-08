// Minimal service worker: caches the static app shell (JS/CSS/pages) only, so
// the app can be added to the home screen and reopen instantly. It NEVER
// caches /api/* calls — scheme eligibility, hospital and progress data must
// always come fresh from the network.
const CACHE_NAME = "aarogyamitra-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isApi = url.pathname.startsWith("/api/");
  const isSameOrigin = url.origin === self.location.origin;

  if (req.method !== "GET" || isApi || !isSameOrigin) {
    return; // let the browser handle it normally — always fresh
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const networkFetch = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached ?? networkFetch;
    })
  );
});
