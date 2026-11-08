/* ═══════════════════════════════════════════════════════════════
   RONIN CINEMA — پل به صفحهٔ مستقل فیلم و انیمه  ·  ronin-cinema.js
   ───────────────────────────────────────────────────────────────
   کار این فایل فقط یک چیز است: اضافه‌کردن «🎬 فیلم و انیمه» به منوی
   سایت و بردن کاربر به صفحهٔ کامل cinema.html.
   خود صفحه (کاتالوگ، جست‌وجو، فیلتر، پلیر و آپلود) در سه فایل است:
     cinema.html  ·  cinema.css  ·  cinema-app.js
   بدون این فایل هم سایت مثل قبل کار می‌کند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__rnCinemaLink) return;
  window.__rnCinemaLink = true;

  var TARGET = "cinema.html";
  var SEL = '[data-cine="link"]';

  /* اگر کسی قدیمی‌ترین لینک #cinema را باز کرد، به صفحهٔ تازه برود */
  if (location.hash === "#cinema") {
    try { location.replace(TARGET); } catch (e) {}
  }

  function addNav() {
    var rail = document.getElementById("rail");
    if (rail && !rail.querySelector(SEL)) {
      var item = document.createElement("a");
      item.className = "ditem";
      item.href = TARGET;
      item.setAttribute("data-cine", "link");
      item.innerHTML = "<i>🎬</i>فیلم و انیمه";
      var anchor = rail.querySelector('.ditem[data-go="discover"]') ||
                   rail.querySelector('.ditem[data-go="bulletin"]');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(item, anchor.nextSibling);
      else rail.appendChild(item);
    }

    var nav = document.querySelector("#top .nav");
    if (nav && !nav.querySelector(SEL)) {
      var a = document.createElement("a");
      a.href = TARGET;
      a.setAttribute("data-cine", "link");
      a.textContent = "🎬 فیلم و انیمه";
      nav.appendChild(a);
    }
  }

  /* اگر نسخهٔ قدیمی بخش داخلی ساخته شده بود، فقط آن را برمی‌داریم */
  function cleanup() {
    var old = document.getElementById("sec-cinema");
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  /* هر کلیکی که هنوز data-go="cinema" دارد به صفحهٔ تازه هدایت شود */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var go = t.closest('[data-go="cinema"]');
    if (!go) return;
    e.preventDefault();
    e.stopPropagation();
    location.href = TARGET;
  }, true);

  [300, 900, 2000, 4000].forEach(function (ms) {
    setTimeout(function () { addNav(); cleanup(); }, ms);
  });
})();
