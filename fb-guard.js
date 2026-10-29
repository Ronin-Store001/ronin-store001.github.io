/* ═══ RONIN FB-GUARD v1 — نگهبان اتصال فایربیس ═══ */
"use strict";
(function () {
  if (window.__fbGuard) return;
  window.__fbGuard = true;

  var db = window.R && window.R.db;
  if (!db) { console.warn("[fb-guard] دیتابیس آماده نیست"); return; }

  var up = true, downAt = 0, tries = 0, timer = null, banner = null;

  function css() {
    if (document.getElementById("fbgCss")) return;
    var s = document.createElement("style");
    s.id = "fbgCss";
    s.textContent =
      "#fbgBar{position:fixed;z-index:9995;inset-inline:0;bottom:0;display:none;" +
        "align-items:center;justify-content:center;gap:10px;padding:9px 14px;" +
        "font-size:12.5px;font-weight:700;color:#fff;text-align:center;" +
        "background:linear-gradient(90deg,rgba(255,86,86,.96),rgba(255,140,60,.96));" +
        "box-shadow:0 -8px 24px rgba(0,0,0,.45);padding-bottom:calc(9px + env(safe-area-inset-bottom))}" +
      "#fbgBar.on{display:flex}" +
      "#fbgBar.ok{background:linear-gradient(90deg,rgba(34,197,94,.95),rgba(34,211,238,.95))}" +
      "#fbgBar button{background:rgba(0,0,0,.28);border:0;color:#fff;font:inherit;" +
        "font-size:12px;font-weight:800;padding:6px 12px;border-radius:9px;cursor:pointer}";
    document.head.appendChild(s);
  }
  function bar() {
    css();
    if (banner) return banner;
    banner = document.createElement("div");
    banner.id = "fbgBar";
    document.body.appendChild(banner);
    return banner;
  }
  function say(html, ok, btn) {
    var b = bar();
    b.className = ok ? "on ok" : "on";
    b.innerHTML = "<span>" + html + "</span>";
    if (btn) {
      var x = document.createElement("button");
      x.type = "button";
      x.textContent = btn.label;
      x.addEventListener("click", btn.fn);
      b.appendChild(x);
    }
  }
  function hide(delay) {
    if (!banner) return;
    clearTimeout(banner._h);
    banner._h = setTimeout(function () { banner.className = ""; }, delay || 1800);
  }

  function poke() {
    try { if (typeof db.goOnline === "function") db.goOnline(); } catch (e) {}
    try { db.ref(".info/serverTimeOffset").once("value").catch(function () {}); } catch (e) {}
  }

  function retry() {
    if (!downAt || up) return;
    tries++;
    poke();
    if (tries === 1) say("📡 اتصال قطع شد — دارم وصل می‌کنم…", false, null);
    if (tries >= 6) {
      say("📡 اتصال برقرار نشد — اینترنت را چک کن", false, {
        label: "تلاش دوباره",
        fn: function () { tries = 0; downAt = Date.now(); poke(); retry(); }
      });
      return;
    }
    var wait = [3000, 6000, 10000, 15000, 20000][Math.min(tries - 1, 4)];
    clearTimeout(timer);
    timer = setTimeout(retry, wait);
  }

  function markUp() {
    if (up && tries === 0 && !downAt) return;
    up = true;
    var recovered = tries > 0 || !!downAt;
    tries = 0; downAt = 0;
    clearTimeout(timer);
    if (recovered) { say("✅ اتصال دوباره برقرار شد", true, null); hide(2200); }
  }

  function markDown() {
    if (!up || downAt) {
      if (!downAt) { downAt = Date.now(); retry(); }
      return;
    }
    up = false; downAt = Date.now(); tries = 0;
    say("📡 اتصال قطع شد — تلاش مجدد…", false, null);
    retry();
  }

  try {
    db.ref(".info/connected").on("value", function (s) {
      if (s.val() === true) markUp(); else markDown();
    }, function (e) { console.warn("[fb-guard] connected:", e.message); });
  } catch (e) { console.warn("[fb-guard]", e.message); }

  window.addEventListener("online", function () {
    tries = 0; poke();
    setTimeout(function () { if (!up) { downAt = Date.now(); retry(); } }, 1200);
  });
  window.addEventListener("offline", function () {
    up = false; downAt = Date.now(); tries = 0;
    say("📴 اینترنت وصل نیست — وقتی برگشت خودم وصل می‌کنم", false, null);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    if (!up) { tries = 0; poke(); setTimeout(retry, 900); }
    else poke();
  });
  window.addEventListener("focus", function () { if (!up) { tries = 0; poke(); } });
  window.addEventListener("pageshow", function (e) { if (e.persisted) poke(); });

  setInterval(function () {
    if (document.visibilityState !== "visible") return;
    if (navigator.onLine === false) return;
    if (!up) { if (!downAt) { downAt = Date.now(); retry(); } return; }
    poke();
  }, 30000);

  window.fbGuard = {
    state: function () { return { up: up, tries: tries, downSec: downAt ? Math.round((Date.now() - downAt) / 1000) : 0 }; },
    poke: poke
  };
})();
