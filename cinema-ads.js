/* ═══════════════════════════════════════════════════════════════
   RONIN CINEMA — cinema-ads.js
   تبلیغ ویدیویی واقعی در صفحهٔ فیلم/انیمه
   • کمپین‌ها از Firebase (ads/campaigns) خوانده می‌شوند
   • اگر دیتابیس خالی/در دسترس نبود، کمپین‌های داخلی پخش می‌شوند
   • شمارش واقعی نمایش/کلیک/تماشای کامل در ads/stats
   • برای کاربر پرمیوم تبلیغ پخش نمی‌شود
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__rnCinemaAds) return;
  window.__rnCinemaAds = true;

  var FB = {
    apiKey: "AIzaSyCoGypb6NCmmHr2sK4FLreF4He48QPcLL8",
    authDomain: "ronin-store-3d738.firebaseapp.com",
    databaseURL: "https://ronin-store-3d738-default-rtdb.firebaseio.com",
    projectId: "ronin-store-3d738",
    storageBucket: "ronin-store-3d738.firebasestorage.app",
    messagingSenderId: "7231014477",
    appId: "1:7231014477:web:1607de8a1f602d4ff9be04"
  };

  var FALLBACK = [
    {
      id: "elite-drop",
      brand: "RONIN STORE",
      title: "ELITE DROP",
      copy: "کالکشن محدود فیگور و گجت‌های رونین — تا ۳۰٪ تخفیف.",
      cta: "مشاهدهٔ کالکشن",
      video: "media/ronin-ad-elite.mp4",
      poster: "media/ronin-ad-elite.jpg",
      url: ""
    },
    {
      id: "seller-spotlight",
      brand: "RONIN MARKET",
      title: "YOUR STORE",
      copy: "محصولت را در بازار رونین ثبت کن و مستقیم به خریدارها برس.",
      cta: "ثبت آگهی",
      video: "media/ronin-ad-seller.mp4",
      poster: "media/ronin-ad-seller.jpg",
      url: ""
    }
  ];

  var list = FALLBACK.slice();
  var idx = 0, timer = null, seen = {}, db = null, hidden = false, current = null;

  function box() { return document.querySelector('[data-ad="cinema-top"]'); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(v) { v = String(v || "").trim(); return /^https?:\/\//i.test(v) ? v : ""; }

  function firebaseApp() {
    if (!window.firebase) return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FB);
      return firebase;
    } catch (e) { return null; }
  }

  function track(type) {
    if (!current) return;
    if (type === "impressions") {
      if (seen[current.id]) return;
      seen[current.id] = 1;
    }
    if (!db) return;
    try {
      db.ref("ads/stats/" + current.id + "/" + type)
        .transaction(function (v) { return (+v || 0) + 1; }).catch(function () {});
    } catch (e) {}
  }

  function normalize(k, v) {
    if (!v || typeof v !== "object") return null;
    var video = safeUrl(v.video || v.src);
    if (!video) return null;
    if (v.live === false || v.active === false) return null;
    return {
      id: k || ("ad-" + Math.random().toString(36).slice(2, 8)),
      brand: v.brand || "RONIN ADS",
      title: v.title || "RONIN AD",
      copy: v.copy || v.desc || "",
      cta: v.cta || "بیشتر بدانید",
      video: video,
      poster: safeUrl(v.poster),
      url: safeUrl(v.url) || safeUrl(v.link)
    };
  }

  function paint() {
    var b = box();
    if (!b || hidden) return;
    if (!list.length) return;
    current = list[idx % list.length];
    var c = current;
    b.className = "cx-ad cxad";
    b.setAttribute("aria-label", "تبلیغ ویدیویی");
    b.innerHTML =
      '<div class="cxad-vid">' +
        '<video muted playsinline loop preload="metadata"' + (c.poster ? ' poster="' + esc(c.poster) + '"' : "") +
          ' aria-label="' + esc(c.title) + '"></video>' +
        '<button class="cxad-mute" type="button" aria-label="صدا">🔇</button>' +
      "</div>" +
      '<div class="cxad-main">' +
        '<div class="cxad-top"><span class="cxad-badge">AD</span><span class="cxad-brand">' + esc(c.brand) + "</span></div>" +
        '<b class="cxad-title">' + esc(c.title) + "</b>" +
        '<span class="cxad-copy">' + esc(c.copy) + "</span>" +
        '<div class="cxad-foot">' +
          '<a class="cx-btn sm cxad-cta" href="' + (c.url || "index.html") + '"' +
            (c.url ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + esc(c.cta) + "</a>" +
          '<button class="cxad-next" type="button">کمپین بعدی ›</button>' +
        "</div>" +
      "</div>";

    var v = b.querySelector("video");
    if (v) {
      v.src = c.video;
      var p = v.play();
      if (p && p.catch) p.catch(function () {
        /* پخش خودکار مسدود شد: تصویر/متن تبلیغ همچنان کار می‌کند */
      });
      v.addEventListener("play", function () { track("impressions"); });
      v.addEventListener("ended", function () { track("completes"); });
    }
    var mute = b.querySelector(".cxad-mute");
    if (mute && v) mute.addEventListener("click", function () {
      v.muted = !v.muted;
      mute.textContent = v.muted ? "🔇" : "🔊";
      mute.setAttribute("aria-label", v.muted ? "با صدا" : "بی‌صدا");
    });
    var cta = b.querySelector(".cxad-cta");
    if (cta) cta.addEventListener("click", function () { track("clicks"); });
    var next = b.querySelector(".cxad-next");
    if (next) next.addEventListener("click", function () { idx = (idx + 1) % list.length; paint(); });
  }

  function rotate() {
    clearInterval(timer);
    if (list.length < 2) return;
    timer = setInterval(function () {
      if (document.hidden) return;
      idx = (idx + 1) % list.length;
      paint();
    }, 16000);
  }

  function hide() {
    hidden = true;
    var b = box();
    if (b) { b.hidden = true; b.innerHTML = ""; }
    clearInterval(timer);
  }

  function boot() {
    var fb = firebaseApp();
    if (fb) { try { db = fb.database(); } catch (e) { db = null; } }

    /* پرمیوم = بدون تبلیغ */
    if (fb) {
      try {
        fb.auth().onAuthStateChanged(function (u) {
          if (!u || !db) { if (!u) { hidden = false; paint(); rotate(); } return; }
          db.ref("users/" + u.uid).once("value").then(function (snap) {
            var v = snap.val() || {};
            var prem = v.role === "owner" || v.prem === true;
            if (v.premExp && v.premExp < Date.now()) prem = false;
            if (prem) hide(); else { hidden = false; paint(); rotate(); }
          }).catch(function () {});
        });
      } catch (e) {}
    }

    paint();
    rotate();

    if (db) {
      try {
        db.ref("ads/campaigns").on("value", function (snap) {
          var val = snap.val();
          if (!val) return;
          var live = Object.keys(val).map(function (k) { return normalize(k, val[k]); }).filter(Boolean);
          if (!live.length) return;
          list = live;
          idx = 0;
          if (!hidden) { paint(); rotate(); }
        }, function () {});
      } catch (e) {}
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
