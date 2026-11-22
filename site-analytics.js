/* RONIN SITE ANALYTICS — شمارندهٔ بازدید سبک و بدون سرویس بیرونی
   ثبت هر بازدید با «تراکنش» REST فایربیس انجام می‌شود: خواندن با X-Firebase-ETag و
   نوشتن با if-match. اگر کسی هم‌زمان مقدار را عوض کرده باشد فایربیس 412 برمی‌گرداند،
   دوباره می‌خوانیم و می‌نویسیم؛ پس بازدید هم‌زمان گم نمی‌شود.
   نام صفحه را می‌توان با window.__rnPage تعیین کرد. هیچ اطلاعات شخصی ذخیره نمی‌شود. */
"use strict";
(function () {
  if (window.__rnStats) return;
  window.__rnStats = true;

  var DB = "https://ronin-store-3d738-default-rtdb.firebaseio.com";
  var MAX_TRIES = 5;

  var page = String(window.__rnPage || "").trim();
  if (!page) page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
  page = page.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "other";

  var key = "rn_seen_" + page;
  try { if (sessionStorage.getItem(key)) return; } catch (e) {}

  /* اگر قواعد دیتابیس خواندن/نوشتن را رد کند، بی‌صدا ۶ ساعت خاموش می‌شود */
  var OFF = "rn_stats_off";
  try { if (+localStorage.getItem(OFF) > Date.now()) return; } catch (e) {}
  function denied() {
    try { localStorage.setItem(OFF, String(Date.now() + 6 * 3600e3)); } catch (e) {}
  }

  var d = new Date();
  var day = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

  /* تراکنش امن: n ← n + ۱ با if-match؛ روی تضاد (412) دوباره تلاش می‌کند */
  function bump(node, next) {
    var url = DB + "/" + node + ".json";
    var tries = 0;

    function done() {
      try { sessionStorage.setItem(key, "1"); } catch (e) {}
      if (next) next();
    }

    function attempt() {
      tries++;
      fetch(url, { headers: { "X-Firebase-ETag": "true" } })
        .then(function (r) {
          if (r.status === 401 || r.status === 403) { denied(); throw new Error("denied"); }
          if (!r.ok) throw new Error("read " + r.status);
          var etag = r.headers.get("ETag") || "null_etag";
          return r.text().then(function (t) {
            var v = null;
            try { v = JSON.parse(t); } catch (e) {}
            return { etag: etag, n: (+v || 0) + 1 };
          });
        })
        .then(function (st) {
          return fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "if-match": st.etag },
            body: String(st.n)
          });
        })
        .then(function (r) {
          if (r.status === 412) {
            if (tries < MAX_TRIES) { setTimeout(attempt, 80 * tries + Math.floor(Math.random() * 60)); return; }
            throw new Error("conflict");
          }
          if (r.status === 401 || r.status === 403) { denied(); throw new Error("denied"); }
          if (!r.ok) throw new Error("put " + r.status);
          done();
        })
        .catch(function () {});
    }
    attempt();
  }

  /* زنجیره‌ای: اگر اولین تراکنش رد شود، بقیه فرستاده نمی‌شوند */
  bump("site/views/" + page + "/" + day, function () {
    bump("site/views/_total/" + day, function () {
      setTimeout(function () { bump("site/views/" + page + "/_last"); }, 1200);
    });
  });
})();
