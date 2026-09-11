// -----------------------------------------------------------------------------
// Description: Application bootstrap and initialization logic.
// Author: Janis Bedeicis
// Github: https://github.com/loom-framework
// E-mail: loom.framework@gmail.com
// Created: 2008
// -----------------------------------------------------------------------------

// --- Versioning -------------------------------------------------------------
const SW_VERSION = "4"; 
const CACHE_NAME = `kineport-app-cache-${SW_VERSION}`;

const PRECACHE_URLS = [
    "/",
    "/about",
    "/contact",
    "/offline",
    "/debug",
    "/css/variables.css",
    "/css/base.css",
    "/css/typography.css",
    "/css/layout.css",
    "/css/components.css",
    "/css/themes.css",
    "/js/loader.js",
    "/js/main.js",
    "/js/global.js",
    "/js/storage.js",
    "/js/offline.js",
    "/js/install.js",
    "/components/header.html",
    "/components/nav.html",
    "/components/footer.html",
    "/components/cart.html",
];

// --- Install: precache and activate immediately -----------------------------
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );

    // Activate new SW immediately
    self.skipWaiting();
});

// --- Activate: cleanup old caches and take control --------------------------
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// --- Fetch ------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Ignore non-HTTP(S) schemes (chrome-extension://, file://, data://, blob://)
    if (!req.url.startsWith("http")) {
        return;
    }

    // Ignore cross-origin requests (optional but recommended for clean caches)
    if (url.origin !== self.location.origin) {
        return;
    }

    // Navigation requests: network-first
    if (req.mode === "navigate") {
        event.respondWith(
            fetch(req).catch(() => caches.match("/offline"))
        );
        return;
    }

    // Other GET requests: cache-first
    if (req.method === "GET") {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached;

                return fetch(req)
                    .then((res) => {
                        // Only cache valid responses
                        if (!res || res.status !== 200 || res.type !== "basic") {
                            return res;
                        }

                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(req, copy);
                        });

                        return res;
                    })
                    .catch(() => {
                        // Optional: fallback for failed GETs
                        return caches.match("/offline");
                    });
            })
        );
    }
});

// -----------------------------------------------------------------------------

self.addEventListener("push", (event) => {
    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/assets/icons/android-chrome-192x192.png"
        })
    );
}); 



