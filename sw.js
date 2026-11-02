// Vino service worker
// - App files: stale-while-revalidate. Start instantly from the stored copy, check GitHub Pages
//   in the background, and tell the app when a newer version is ready (it shows a Refresh bar).
// - Pinned libraries and fonts: cache first, they never change.
const VERSION = "vino-v17";
const SHELL = ["./", "index.html", "dict.js", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const TEXT = /\.(html|js|json)$|\/$/;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const old = (await caches.keys()).filter(k => k !== VERSION && k !== "vino-cdn");
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    if (old.length) notify("vino-update"); // a new worker replaced an older version
  })());
});

async function notify(type) {
  for (const c of await self.clients.matchAll({ type: "window" })) c.postMessage({ type, version: VERSION });
}

// Fetch a fresh copy, store it, and report whether it differs from what we had.
async function revalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request, { ignoreSearch: true });
  const res = await fetch(request, { cache: "no-cache" });
  if (!res.ok) return { res, changed: false };
  let changed = false;
  if (cached && TEXT.test(new URL(request.url).pathname)) changed = (await cached.clone().text()) !== (await res.clone().text());
  await cache.put(request, res.clone());
  return { res, changed };
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.open("vino-cdn").then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok || res.type === "opaque") c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith("/wines.json")) return; // big wine list: the app stores it itself
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = revalidate(e.request).then(r => { if (r.changed) notify("vino-update"); return r.res; });
    if (cached) { e.waitUntil(fresh.catch(() => {})); return cached; }
    try { return await fresh; }
    catch { return (await cache.match("index.html")) || Response.error(); }
  })());
});

// "Check for updates" from the app.
self.addEventListener("message", e => {
  if (e.data?.type === "version") e.ports[0]?.postMessage({ version: VERSION });
  if (e.data?.type === "check") e.waitUntil((async () => {
    let changed = false;
    for (const u of SHELL) { try { changed = (await revalidate(new Request(u))).changed || changed; } catch {} }
    notify(changed ? "vino-update" : "vino-current");
  })());
});
