/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — theme.js | تم دارک/روشن خودکار
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var KEY = "ronin-theme";
  var root = document.documentElement;

  function readSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemTheme() {
    try {
      return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch (e) { return "dark"; }
  }

  var saved = readSaved();
  var manual = (saved === "light" || saved === "dark");
  var theme = manual ? saved : systemTheme();
  root.dataset.theme = theme;

  function syncMeta(t) {
    var a = document.querySelector('meta[name="theme-color"]');
    if (a) a.content = t === "light" ? "#f4f6fb" : "#05070f";
    var b = document.querySelector('meta[name="color-scheme"]');
    if (b) b.content = t;
  }
  syncMeta(theme);

  function injectCss() {
    if (document.getElementById("theme-css")) return;
    var s = document.createElement("style");
    s.id = "theme-css";
    s.textContent =
      'html[data-theme="light"]{color-scheme:light;' +
      '--bg:#f4f6fb;--ink:#1b2030;--mut:#626b80;' +
      '--g1:rgba(255,255,255,.72);--g2:rgba(255,255,255,.88);--g3:rgba(248,249,253,.96);' +
      '--ln:rgba(44,56,90,.16);--ln2:rgba(124,92,255,.30);' +
      '--sh:0 18px 45px rgba(25,35,60,.14)}' +
      'html[data-theme="light"] .card{background:linear-gradient(150deg,#fff,#f0f2f8)}' +
      'html[data-theme="light"] #city,html[data-theme="light"] #rbCanvas,' +
      'html[data-theme="light"] #rbVig{display:none!important}';
    document.head.appendChild(s);
  }

  function apply(t, save) {
    root.dataset.theme = t;
    syncMeta(t);
    var b = document.getElementById("themeToggle");
    if (b) {
      b.textContent = t === "dark" ? "🌙" : "☀️";
      b.setAttribute("aria-label",
        t === "dark" ? "تغییر به تم روشن" : "تغییر به تم تاریک");
    }
    if (save) {
      manual = true;
      try { localStorage.setItem(KEY, t); } catch (e) {}
    }
  }

  function injectBtn() {
    var tools = document.querySelector("#top .tools");
    if (!tools || document.getElementById("themeToggle")) return;
    var b = document.createElement("button");
    b.id = "themeToggle";
    b.type = "button";
    b.className = "icobtn";
    b.textContent = root.dataset.theme === "dark" ? "🌙" : "☀️";
    b.setAttribute("aria-label", "تغییر تم");
    b.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      apply(next, true);
    });
    tools.insertBefore(b, tools.firstChild);
  }

  try {
    var mq = matchMedia("(prefers-color-scheme: light)");
    var onSys = function (e) { if (!manual) apply(e.matches ? "light" : "dark", false); };
    if (mq.addEventListener) mq.addEventListener("change", onSys);
    else if (mq.addListener) mq.addListener(onSys);
  } catch (e) {}

  function ready() {
    injectCss();
    injectBtn();
    var b = document.getElementById("themeToggle");
    if (b) b.textContent = root.dataset.theme === "dark" ? "🌙" : "☀️";
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
