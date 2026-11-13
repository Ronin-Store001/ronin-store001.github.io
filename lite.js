/* ═══ RONIN LITE — حالت کم‌مصرف + لودر لایه‌های تازه (فایل جدید؛ به چیزی دست نمی‌زند) ═══ */
(function () {
  var K = "ronin_lite";
  function get() { try { return localStorage.getItem(K) === "1"; } catch (e) { return false; } }
  function set(v) { try { localStorage.setItem(K, v ? "1" : "0"); } catch (e) {} }
  function css() {
    if (document.getElementById("liteCss")) return;
    var s = document.createElement("style"); s.id = "liteCss";
    s.textContent =
      "html.lite .rain,html.lite .fog,html.lite .haze,html.lite .stars,html.lite .scan,html.lite .train{display:none!important}" +
      "html.lite .moon{opacity:.45!important}" +
      "html.lite .skyline,html.lite .sign,html.lite .street{animation:none!important}" +
      "html.lite #top,html.lite #rail,html.lite #dock .dwrap,html.lite .card,html.lite .qc{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}";
    document.head.appendChild(s);
  }
  function paint() {
    var v = get();
    document.documentElement.classList.toggle("lite", v);
    var b = document.getElementById("liteBtn");
    if (b) { b.textContent = v ? "روشن ✅" : "خاموش"; b.classList.toggle("p", v); }
  }
  function flip() {
    set(!get()); paint();
    try { if (window.R && R.toast) R.toast(get() ? "حالت کم‌مصرف روشن شد ⚡" : "حالت کم‌مصرف خاموش شد", "ok"); } catch (e) {}
  }
  function load(src, id) {
    if (document.getElementById(id)) return;
    var s = document.createElement("script");
    s.id = id; s.src = src; s.defer = true;
    document.head.appendChild(s);
  }
  css(); paint();
  document.addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("#liteBtn")) { e.preventDefault(); flip(); }
  });

  /* پنل مالک: پیام‌ها و آمار بازدید — فقط وقتی R آماده و کاربر مالک است */
  function ownerLayer() {
    var n = 0;
    (function wait() {
      if (window.R && R.isOwner && R.isOwner()) {
        if (!window.__ownerSite) load("owner-site.js?v=1", "ownerSiteJs");
        return;
      }
      if (n++ < 24) setTimeout(wait, 500);
    })();
  }

  /* پرمیوم: قیمت‌ها و تایمر — بعد از آماده شدن لایهٔ پرمیوم */
  function premCore() {
    var n = 0;
    (function wait() {
      if (window.R && R.premPlus) {
        if (!window.__premCore) load("premium-core.js?v=1", "premCoreJs");
        return;
      }
      if (n++ < 40) setTimeout(wait, 400);
    })();
  }

  function boot() {
    premCore();
    if (document.getElementById("sec-owner")) ownerLayer();
    if (document.getElementById("sec-ads") && !window.__adsStudio) load("ads-studio.js?v=1", "adsStudioJs");
    if (!window.__themePack2) load("theme-pack2.js?v=1", "themePack2Js");
    if (!window.__compPack2) load("companion-pack2.js?v=1", "compPack2Js");
    if (!window.__rnSeo) load("seo-pack.js?v=4", "rnSeoJs");
    if (!window.__rnStats) load("site-analytics.js?v=1", "rnStatsJs");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
