/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — notify-fix.js v1 | اصلاح اعلان‌ها
   ───────────────────────────────────────────────────────────────
   ۱) «پست تازه»: وقتی پستی منتشر می‌شود، همهٔ دنبال‌کننده‌ها اعلان
      می‌گیرند (قبلاً هیچ اعلانی ساخته نمی‌شد).
   ۲) نشانگر زنگ: کلاس hide با display:none!important برنده می‌شد و
      شمار اعلان خوانده‌نشده هیچ‌وقت دیده نمی‌شد.
   ۳) اعلان‌ها فقط در بوت اول وصل می‌شدند؛ حالا بعد از هر ورود هم
      دوباره وصل می‌شوند (و با خروج پاک می‌شوند).
   فایل افزودنی است؛ به فایل‌های اصلی دست نمی‌زند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__notifyFix) return;
  R.__notifyFix = true;

  function el(id) { return document.getElementById(id); }

  /* ── ۱. نشانگر اعلان خوانده‌نشده ────────────────────────── */
  function paintDot() {
    var dot = el("bellDot");
    if (!dot) return;
    var raw = String(dot.textContent || "").trim();
    var n = parseInt(raw.replace(/[۰-۹]/g, function (d) {
      return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    }), 10) || 0;
    /* .hide{display:none!important} با style.display شکسته نمی‌شد */
    dot.classList.toggle("hide", !n);
    dot.style.display = "";
    var b = el("bellBtn");
    if (b) b.classList.toggle("has-unread", !!n);
  }

  var paint0 = R.paintBell;
  R.paintBell = function () {
    var out = paint0 ? paint0.apply(R, arguments) : undefined;
    try { paintDot(); } catch (e) {}
    return out;
  };

  /* ── ۲. اعلان پست تازه برای دنبال‌کننده‌ها ───────────────── */
  var sent = {};                      /* ضد تکرار: هر پست فقط یک‌بار */
  var MAX = 200;                      /* سقف نوشتن برای هر پست */

  function notifyFollowers(post, ref) {
    if (!R.db || !post || !post.uid) return;
    var sig = post.uid + "|" + (post.t || 0) + "|" + String(post.text || "").slice(0, 30);
    if (sent[sig]) return;
    sent[sig] = 1;

    function send(pid) {
      R.get("followers/" + post.uid).then(function (people) {
        if (!people) return;
        var text = "📝 " + (post.n || "کاربر") + " پست تازه گذاشت";
        var link = pid ? "post:" + pid : "community";
        Object.keys(people).slice(0, MAX).forEach(function (uid) {
          if (!uid || uid === post.uid) return;
          try { R.notify(uid, text, "info", link, "post"); } catch (e) {}
        });
      }).catch(function () {});
    }

    if (ref && typeof ref.then === "function") {
      ref.then(function (r) { send((r && r.key) || ""); }, function () {});
    } else {
      send("");
    }
  }

  var add0 = R.add;
  if (typeof add0 === "function") {
    R.add = function (path, obj) {
      var out = add0.apply(R, arguments);
      try {
        if (String(path) === "posts" && obj && obj.uid && obj.status !== "pending") {
          notifyFollowers(obj, out);
        }
      } catch (e) {}
      return out;
    };
  }

  /* ── ۳. وصل‌شدن اعلان‌ها بعد از ورود ─────────────────────── */
  var watching = null;
  function watch() {
    if (!R.ME || !R.db) return;
    if (watching === R.ME) {
      try { if (R.paintBell) R.paintBell(); } catch (e) {}
      return;
    }
    watching = R.ME;
    try { if (typeof R.watchNotifs === "function") R.watchNotifs(); } catch (e) {}
    try { if (R.paintBell) R.paintBell(); } catch (e) {}
  }

  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    setTimeout(watch, 500);
  };

  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    watching = null;
    try { if (R.paintBell) R.paintBell(); } catch (e) {}
  };

  /* ── ۴. راه‌اندازی ───────────────────────────────────────── */
  function boot() {
    try { paintDot(); } catch (e) {}
    watch();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);
})();
