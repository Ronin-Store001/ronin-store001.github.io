/* RONIN ANIME WORLD LOADER — anime-light.js (v4)
   فایل استایل کامل صفحهٔ انیمه (anime-world.css) را بارگذاری می‌کند و کلاس
   aw-anime را روی <html> می‌گذارد؛ فقط در حالت انیمه فعال می‌شود. */
"use strict";
(function () {
  if (window.__rnAnimeWorld) return;
  window.__rnAnimeWorld = true;

  function css() {
    if (document.getElementById("rnAnimeWorldCss")) return;
    var l = document.createElement("link");
    l.id = "rnAnimeWorldCss";
    l.rel = "stylesheet";
    l.href = "anime-world.css?v=4";
    (document.head || document.documentElement).appendChild(l);
  }

  function isAnime() {
    if (/(^|[?&])kind=anime(&|$)/.test(location.search)) return true;
    if (document.body && document.body.classList.contains("cx-anime-mode")) return true;
    try {
      var s = window.RoninCinema && RoninCinema.state;
      if (s) return s.kind === "anime" && !s.mine;
    } catch (e) {}
    return false;
  }

  function sync() {
    var on = isAnime();
    var html = document.documentElement;
    if (html.classList.contains("aw-anime") !== on) html.classList.toggle("aw-anime", on);
    if (on) {
      if (document.body && !document.body.classList.contains("cx-anime-mode")) document.body.classList.add("cx-anime-mode");
      var rail = document.getElementById("cxAnimeRail");
      if (rail && rail.hidden && rail.querySelector(".cx-ar-card")) rail.hidden = false;
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && on) meta.setAttribute("content", "#fdfcff");
  }

  css();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sync);
  else sync();
  setInterval(sync, 700);
})();
