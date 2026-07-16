/* Minimal service worker: cache the app shell so it opens offline. */
const CACHE = "stokup-v1";
const SHELL = [
  "index.html",
  "admin.html",
  "config.js",
  "css/styles.css",
  "js/data.js",
  "js/store.js",
  "js/app.js",
  "js/admin.js",
  "icon.svg",
  "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Never cache Supabase API calls — always hit the network for live data.
  if (url.pathname.includes("/rest/v1/")) return;
  if (e.request.method !== "GET") return;
  // Network-first so code edits show up immediately; fall back to cache offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
