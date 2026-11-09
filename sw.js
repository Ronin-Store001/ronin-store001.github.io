/* RONIN STORE — service worker v3
   آفلاین واقعی: پوستهٔ سایت + صفحهٔ آفلاین + بازی کش می‌شوند */
var CACHE = "ronin-v20";

/* فقط چیزهایی که برای «باز شدن سایت بدون اینترنت» لازم‌اند */
var CORE = [
  "./",
  "./index.html",
  "./offline.html",
  "./ronin-offline.js?v=7",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./ronin-zero.css?v=12",
  "./ronin-2026.css?v=1",
  "./ronin-events-rank.css?v=8",
  "./ronin-events-rank.js?v=2",
  "./nav-drawer.js?v=5",
  "./cinema.html",
  "./cinema.css?v=5",
  "./cinema-player.css?v=3",
  "./cinema-player.js?v=2",
  "./cinema-app.js?v=6"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* تک‌تک اضافه می‌کنیم تا یک ۴۰۴ کل نصب را خراب نکند */
      return Promise.all(CORE.map(function (u) {
        return c.add(new Request(u, { cache: "reload" })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isNav(req) {
  return req.mode === "navigate" || (req.method === "GET" && req.headers.get("accept") &&
    req.headers.get("accept").indexOf("text/html") >= 0);
}

function isStatic(u) {
  return /\.(css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|json|mp3|ogg|webmanifest)$/i.test(u.pathname);
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var u = new URL(req.url);
  if (u.origin !== location.origin) return;            /* فایربیس/فونت دست‌نخورده */

  /* ── صفحه‌ها: شبکه اول، بعد کش، بعد offline.html ── */
  if (isNav(req)) {
    e.respondWith(
      new Promise(function (res) {
        var done = false;
        var timer = setTimeout(function () {
          if (done) return;
          caches.match("./index.html").then(function (c) {
            if (c) { done = true; res(c); }
          });
        }, 3500);
        fetch(req).then(function (r) {
          clearTimeout(timer);
          if (done) return;
          done = true;
          var copy = r.clone();
          /* صفحهٔ دیده‌شده را با کلید خودش کش کن (index.html جای صفحه‌های دیگر را نگیرد) */
          caches.open(CACHE).then(function (c) {
            c.put(req, copy).catch(function () {});
            if (new URL(req.url).pathname.replace(/^\//, "") === "index.html" || req.url.indexOf(location.origin + "/") === 0 && new URL(req.url).pathname === "/") {
              c.put("./index.html", r.clone()).catch(function () {});
            }
          });
          res(r);
        }).catch(function () {
          clearTimeout(timer);
          if (done) return;
          done = true;
          caches.match(req, { ignoreSearch: true })
            .then(function (c) { return c || caches.match("./index.html"); })
            .then(function (c) { res(c || caches.match("./offline.html")); });
        });
      })
    );
    return;
  }

  /* ── دارایی‌های ثابت: کش اول ── */
  if (isStatic(u)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) {
          fetch(req).then(function (r) {
            if (r && r.ok) caches.open(CACHE).then(function (c) { c.put(req, r.clone()); });
          }).catch(function () {});
          return hit;
        }
        return fetch(req).then(function (r) {
          if (r && (r.ok || r.type === "opaque")) {
            var copy = r.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function () {}); });
          }
          return r;
        }).catch(function () {
          return caches.match("./offline.html");
        });
      })
    );
    return;
  }

  /* ── بقیهٔ درخواست‌ها: شبکه اول ── */
  e.respondWith(
    fetch(req).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function () {}); });
      return r;
    }).catch(function () { return caches.match(req); })
  );
});
