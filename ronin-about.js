/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — ABOUT  ·  ronin-about.js
   کارت معرفی سایت در صفحه‌ی خانه (برای همه، بدون کلیک)
   + تقویت meta/og برای گوگل و اشتراک‌گذاری لینک
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  function el(i) { return document.getElementById(i); }

  var DESC = "رونین استور | انیمه، تریلر و خبر، انجمن و چت، فروشگاه آگهی و دنیای پرمیوم — پلتفرم انیمه‌ای فارسی";

  /* ── متن معرفی ────────────────────────────────────────── */
  function block() {
    return '' +
      '<div class="card mb" id="rnAbout">' +
        '<div class="between">' +
          '<span class="h3">🛰 رونین استور چیست؟</span>' +
          '<span class="chip cy">دنیای انیمه</span>' +
        '</div>' +
        '<p class="sm mt" style="line-height:2;opacity:.9">' +
          'رونین استور یک <b>دنیای دیجیتال انیمه‌ای</b> است: ' +
          'انیمه‌ها را کشف می‌کنی، خبر و تریلر و اعلان پخش را می‌بینی، ' +
          'در انجمن پست می‌گذاری و کامنت می‌نویسی، در چت با بقیه حرف می‌زنی، ' +
          'آگهی و کالا می‌بینی، و با پرمیوم چیزهای ویژه باز می‌کنی.' +
        '</p>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin:12px 0 4px">' +
          '<span class="chip">🎬 انیمه</span>' +
          '<span class="chip">📰 خبر و تریلر</span>' +
          '<span class="chip">👥 انجمن</span>' +
          '<span class="chip">💬 چت</span>' +
          '<span class="chip">🛒 فروشگاه</span>' +
          '<span class="chip gd">💎 پرمیوم</span>' +
        '</div>' +
        '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px">' +
          '<button class="btn p mini" type="button" data-rnabout="1">📖 بیشتر بدان</button>' +
          '<button class="btn mini" type="button" data-rngo="community">🚀 شروع کن</button>' +
        '</div>' +
      '</div>';
  }

  /* ── متای گوگل ────────────────────────────────────────── */
  function meta() {
    var m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", DESC);
    var o = document.querySelector('meta[property="og:description"]');
    if (o) o.setAttribute("content", DESC);
    var t = document.querySelector('meta[name="twitter:description"]');
    if (!t) {
      t = document.createElement("meta");
      t.setAttribute("name", "twitter:description");
      document.head.appendChild(t);
    }
    t.setAttribute("content", DESC);
    var og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", "RONIN STORE — دنیای انیمه، انجمن، فروشگاه و پرمیوم");
  }

  /* ── قرار دادن کارت بالای خانه ────────────────────────── */
  function build() {
    if (!window.R || !el("sec-home") || el("rnAbout")) return;
    if (!el("rnAboutBox")) {
      var w = document.createElement("div");
      w.id = "rnAboutBox";
      w.innerHTML = block();
      var sec = el("sec-home");
      var hero = sec.querySelector(".hero");
      if (hero && hero.parentNode) hero.parentNode.insertBefore(w, hero.nextSibling);
      else sec.insertBefore(w, sec.firstChild);
    }
    meta();
  }

  /* ── کلیک‌ها ───────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("[data-rnabout]")) {
      e.preventDefault();
      var h =
        "<p><b>رونین استور</b> یک پلتفرم فارسی برای دنیای انیمه است — نه فقط یک سایت تماشا.</p>" +
        "<p>🎬 <b>انیمه:</b> کشف، دسته‌بندی، امتیاز و جزئیات انیمه‌ها.</p>" +
        "<p>📰 <b>خبر و تریلر:</b> خبر صنعت انیمه، تریلر، اعلان پخش فصل جدید و میم.</p>" +
        "<p>👥 <b>انجمن:</b> پست، لایک، کامنت، نظرسنجی و دنبال‌کردن کاربران.</p>" +
        "<p>💬 <b>چت:</b> چت عمومی، گروه‌های چت و پیام خصوصی.</p>" +
        "<p>🛒 <b>فروشگاه:</b> آگهی کالا و محصول؛ خریدار مستقیم با فروشنده در تماس می‌شود.</p>" +
        "<p>💎 <b>پرمیوم:</b> نشان ویژه، رنگ و آیکن‌های بیشتر، شخصیت‌های همراه و قابلیت‌های ویژه.</p>" +
        "<p>🎖 <b>دنبال‌کردن پیشرفت:</b> تجربه (XP)، سطح، دستاورد و ماموریت روزانه.</p>";
      if (window.R && R.openInfo) R.openInfo("🏯 درباره رونین استور", h);
      return;
    }
    var g = t.closest("[data-rngo]");
    if (g) { e.preventDefault(); var gg = g.getAttribute("data-rngo"); if (window.R && R.go) R.go(gg); }
  }, true);

  function boot() { build(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1800, 3200].forEach(function (ms) { setTimeout(boot, ms); });
})();
