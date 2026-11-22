/* RONIN LIGHT CINEMA LOADER — anime-light.js (v6)
   استایل روشن و رنگی صفحهٔ سینما (همه / فیلم / سریال / انیمه) را بارگذاری می‌کند.
   نشانهٔ فعال‌سازی کلاس aw-light روی <body> است (کلاس <html> را خود سایت بازنویسی می‌کند).
   بخش‌های مخصوص انیمه (آمار، استودیوها، ریل) فقط در حالت انیمه نمایش داده می‌شوند. */
"use strict";
(function () {
  if (window.__rnLightCinema) return;
  window.__rnLightCinema = true;

  function css() {
    if (document.getElementById("rnLightCss")) return;
    var l = document.createElement("link");
    l.id = "rnLightCss";
    l.rel = "stylesheet";
    l.href = "anime-world.css?v=5";
    (document.head || document.documentElement).appendChild(l);
  }

  function state() {
    try { return (window.RoninCinema && RoninCinema.state) || null; } catch (e) { return null; }
  }

  function kind() {
    var s = state();
    if (s && s.kind) return s.mine ? "mine" : s.kind;
    var m = /(^|[?&])kind=(anime|film|series)(&|$)/.exec(location.search);
    return m ? m[2] : "all";
  }

  function sync() {
    var body = document.body;
    if (!body) return;
    var onCinema = !!document.querySelector(".cx-wrap") || !!document.getElementById("cxGrid");
    if (onCinema && !body.classList.contains("aw-light")) body.classList.add("aw-light");
    if (!onCinema) {
      if (body.classList.contains("aw-light")) body.classList.remove("aw-light");
      return;
    }
    var k = kind();
    if (body.getAttribute("data-aw-kind") !== k) body.setAttribute("data-aw-kind", k);
    if (k === "anime") {
      if (!body.classList.contains("cx-anime-mode")) body.classList.add("cx-anime-mode");
      var rail = document.getElementById("cxAnimeRail");
      if (rail && rail.hidden && rail.querySelector(".cx-ar-card")) rail.hidden = false;
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#fdfcff");
  }

  css();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
  setInterval(sync, 700);
})();
