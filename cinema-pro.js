/* ═══════════════════════════════════════════════════════════════
   RONIN CINEMA — cinema-pro.js
   ارتقای تدریجی صفحهٔ انیمه بدون دست‌زدن به منطق اصلی:
   • مدال طلا/نقره/برنز برای سه رتبهٔ اول ریل
   • نوار امتیاز و دکمهٔ پخش روی کارت‌های ریل
   • ساخت کالکشن‌های ژانر از فیلترهای کنار صفحه
   همهٔ کارها idempotent هستند (دوبار اجرا مشکل ایجاد نمی‌کند).
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__rnCinemaPro) return;
  window.__rnCinemaPro = true;

  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fa(n) { return String(n == null ? "" : n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function animeMode() {
    return document.body.classList.contains("cx-anime-mode") || /(^|[?&])kind=anime(&|$)/.test(location.search);
  }

  /* ── ۱. ریل: مدال، نوار امتیاز، دکمهٔ پخش ─────────────────── */
  function upgradeRail() {
    qa(".cx-ar-track .cx-ar-card").forEach(function (card, i) {
      var rank = q(".cx-ar-rank", card);
      if (rank && i < 3) {
        var cls = "g" + (i + 1);
        if (!rank.classList.contains(cls)) rank.classList.add(cls);
      }
      var art = q(".cx-ar-art", card);
      if (art && !q(".cx-ar-play", art)) {
        var play = document.createElement("span");
        play.className = "cx-ar-play";
        play.textContent = "▶";
        play.setAttribute("aria-hidden", "true");
        art.appendChild(play);
      }
      var meta = q(".cx-ar-meta", card);
      if (meta && !q(".cx-ar-bar", meta)) {
        var small = q("small", meta);
        var m = /[\d.۰-۹]+/.exec(small ? small.textContent : "");
        var rate = 0;
        if (m) {
          var digits = m[0].replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); });
          rate = parseFloat(digits) || 0;
        }
        var bar = document.createElement("span");
        bar.className = "cx-ar-bar";
        var fill = document.createElement("i");
        fill.style.width = Math.max(4, Math.min(100, Math.round(rate * 10))) + "%";
        bar.appendChild(fill);
        meta.appendChild(bar);
      }
    });
  }

  /* ── ۲. کالکشن‌های ژانر ───────────────────────────────────── */
  function upgradeGenres() {
    var box = q("#cxAnimeGenres");
    if (!box) return;
    if (!animeMode()) { box.hidden = true; return; }
    box.hidden = false;
    if (q(".cx-ag-card", box)) return;                    /* از قبل ساخته شده */
    var pills = qa("#cxSide [data-fg]");
    if (!pills.length) return;
    var count = qa('#cxGrid .cx-card[data-kind="anime"]').length;
    var list = pills.map(function (p) { return p.getAttribute("data-fg"); })
      .filter(function (g) { return g && g !== "همه"; }).slice(0, 8);
    if (!list.length) return;
    var icons = ["🌸", "⚡", "✨", "🔥", "🌙", "💫", "🎴", "🗡"];
    box.innerHTML = '<div class="cx-ar-head"><b>🎴 کالکشن‌های انیمه</b><span>COLLECTIONS</span></div>' +
      '<div class="cx-ag-strip">' + list.map(function (g, i) {
        var h1 = (hue(g) + i * 14) % 360, h2 = (h1 + 52) % 360;
        return '<button class="cx-ag-card" type="button" data-anime-genre="' + g.replace(/"/g, "&quot;") + '" ' +
          'style="background:linear-gradient(150deg,hsl(' + h1 + ' 68% 26%),hsl(' + h2 + ' 72% 16%))">' +
          '<b>' + g + '</b><small>' + (count ? fa(count) + " عنوان" : "کالکشن") + '</small>' +
          '<i aria-hidden="true">' + icons[i % icons.length] + '</i></button>';
      }).join("") + "</div>";
  }

  function hue(s) {
    var h = 0; s = String(s || "x");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  function run() {
    try { upgradeRail(); upgradeGenres(); } catch (e) {}
  }

  function boot() {
    run();
    if (!window.MutationObserver) { setTimeout(run, 600); return; }
    var mo = new MutationObserver(function () { run(); });
    ["#cxGrid", "#cxAnimeRail", "#cxTitle"].forEach(function (sel) {
      var n = q(sel);
      if (n) mo.observe(n, { childList: true, subtree: true });
    });
    /* وقتی آدرس عوض شد (تب انیمه ↔ فیلم) هم دوباره اجرا شود */
    window.addEventListener("popstate", run);
    setTimeout(run, 500);
    setTimeout(run, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
