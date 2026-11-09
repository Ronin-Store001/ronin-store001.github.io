/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                  js/9-boot.js
   راه‌انداز نهایی — همه ماژول‌ها را به هم وصل می‌کند
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

/* ── ۱. قلاب ورود (مسدود + کاراکتر) ──────────────────────── */
var prevLogin = R.onLogin;
R.onLogin = function () {
  if (prevLogin) { try { prevLogin(); } catch (e) { console.error(e); } }
  if (R.paintOwner) R.paintOwner();
  if (R.paintPrem) R.paintPrem();
  if (R.onCompanionLogin) R.onCompanionLogin();
  if (R.paintNpcPalette) R.paintNpcPalette();
  /* کاربر مسدود */
  if (R.USER && R.USER.banned && !R.isOwner()) {
    R.toast("حساب تو مسدود شده است 🚫", "err");
    setTimeout(function () { R.out(); }, 1800);
  }
};

/* ── ۲. قلاب بخش مالک ────────────────────────────────────── */
R.hooks.owner = function () {
  if (!R.isOwner()) {
    R.toast("این بخش مخصوص مالک سایت است 👑", "err");
    R.go("home");
  }
};
R.hooks.settings = function () { if (R.paintNpcPalette) R.paintNpcPalette(); };

/* ── ۳. دکمه جستجو ───────────────────────────────────────── */
R.bindSearch = function () {
  var b = R.$("searchBtn");
  if (b) b.addEventListener("click", function () {
    R.mod("searchMod", true);
    setTimeout(function () {
      var i = R.$("sqIn");
      if (i) { try { i.focus(); } catch (e) {} }
      R.search(i ? i.value : "");
    }, 200);
  });
  if (R.$("sqClear")) R.$("sqClear").addEventListener("click", function () {
    var i = R.$("sqIn"); if (i) i.value = "";
    R.search("");
  });
};

/* ── ۴. چیزهای کوچک ──────────────────────────────────────── */
R.misc = function () {
  R.qa("[data-year]").forEach(function (e) {
    e.textContent = R.fa(new Date().getFullYear());
  });
  /* اسم نسخه روی صفحه */
  R.qa("[data-ver]").forEach(function (e) { e.textContent = "V" + R.V.replace(".0", ""); });
  /* اگر آفلاین شد */
  window.addEventListener("offline", function () {
    R.toast("اتصال اینترنت قطع شد 📴", "err");
  });
  window.addEventListener("online", function () {
    R.toast("اتصال برگشت ✅", "ok");
  });
};

/* ── ۵. مسیر اولیه از آدرس ───────────────────────────────── */
R.routeStart = function () {
  var h = (location.hash || "").replace("#", "");
  if (!h) return;
  if (!R.$("sec-" + h)) return;
  if (h === "owner" && !R.isOwner()) { R.go("home"); return; }
  if (h === "team" && !R.team) { R.go("home"); return; }
  R.go(h);
};

/* ── ۶. راه‌اندازی کل ────────────────────────────────────── */
R.boot = function () {
  try {
    R.bootAuth();      /* ورود، ثبت‌نام، نقش‌ها */
    R.bootFeed();      /* انجمن */
    R.bootChat();      /* چت عمومی + تیم */
    R.bootMarket();    /* فروشگاه */
    R.bootOwner();     /* پنل مالک */
    R.bootExtra();     /* انیمه، اخبار، پروفایل، اعلان */
    R.bootCompanion(); /* کاراکتر راهنما */
    R.bindNav();       /* ناوبری */
    R.bindSearch();    /* جستجو */
    R.misc();
    R.routeStart();
  } catch (e) {
    console.error("[Ronin] boot:", e);
    R.toast("خطا در اجرای سایت: " + e.message, "err");
  }

  if (!R.ok) {
    R.toast("اتصال به فایربیس برقرار نشد — اینترنت را بررسی کن", "err");
    var b = R.$("dbWarn");
    if (b) b.classList.remove("hide");
  }

  console.log("%c🥷 RONIN STORE v" + R.V + " — up and running",
    "color:#22d3ee;font-weight:900;font-size:13px");
};

/* ── ۷. خطاهای پیش‌بینی‌نشده ─────────────────────────────── */
window.addEventListener("error", function (e) {
  if (e && e.message) console.warn("[Ronin]", e.message);
});
window.addEventListener("unhandledrejection", function (e) {
  var m = (e && e.reason && e.reason.message) || "";
  if (m && m.indexOf("permission_denied") > -1) {
    console.warn("[Ronin] دسترسی رد شد:", m);
  }
});

/* ── ۸. اجرا ─────────────────────────────────────────────── */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", R.boot);
} else {
  R.boot();
}

window.R = R;

})();
