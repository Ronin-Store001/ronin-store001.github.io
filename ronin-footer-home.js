/* ═══ RONIN STORE — FOOTER HOME ONLY · ronin-footer-home.js · v1
   فوتر (#rnFoot از ronin-footer.js) فقط در صفحهٔ خانه (sec-home) دیده می‌شود
   و در بقیهٔ منوها کامل پنهان است (display:none → جا اشغال نمی‌کند).
   کار با یک کلاس روی body + MutationObserver روی #stage انجام می‌شود، پس
   مستقل از این است که ناوبری با R.go عوض شود یا هر فایل دیگری سکشن را جابه‌جا کند. */
"use strict";
(function () {
  if (window.__ftHome) return;
  window.__ftHome = true;

  var VER = "v1", HOME = "home", SID = "ftHomeCss", last = null, DIS = false;
  function el(i) { return document.getElementById(i); }

  function css() {                                   /* ۱. استایل: پیش‌فرض پنهان */
    if (el(SID)) return;
    var s = document.createElement("style");
    s.id = SID;
    s.textContent = [
      "#rnFoot{display:none !important}",
      "body.ft-home #rnFoot{display:block !important}",
      "footer#rnFoot{display:none !important}",
      "body.ft-home footer#rnFoot{display:block !important}",
      "@media(max-width:520px){body.ft-home #rnFoot{margin-top:6px}}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  function activeSec() {                             /* ۲. سکشن فعال */
    var st = el("stage");
    return (st && st.querySelector(".sec.on")) || document.querySelector(".sec.on");
  }
  function isHome() {
    var a = activeSec();
    if (a && a.id) return a.id === "sec-" + HOME;
    if (window.R && R.cur) return R.cur === HOME;
    return true;
  }

  function paint(force) {                            /* ۳. روشن/خاموش */
    css();
    var home = DIS ? true : isHome();
    if (force || home !== last) {
      last = home;
      document.body.classList.toggle("ft-home", home);
      var f = el("rnFoot");
      if (!home && f && f.contains(document.activeElement)) {
        try { document.activeElement.blur(); } catch (e) {}
      }
    }
    return home;
  }

  function watch() {                                 /* ۴. رصد تغییر سکشن */
    var st = el("stage");
    if (!st || st.__ftHomeMO) return;
    st.__ftHomeMO = true;
    try {
      var mo = new MutationObserver(function () { paint(false); });
      mo.observe(st, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
      st.__ftHomeMo = mo;
    } catch (e) {}
  }

  function wrapGo() {                                /* ۵. R.go را قالب می‌کند */
    if (!window.R || typeof R.go !== "function" || R.__ftHomeGo) return;
    R.__ftHomeGo = true;
    var prev = R.go;
    R.go = function () {
      var r = prev.apply(this, arguments);
      try { paint(false); } catch (e) {}
      setTimeout(function () { paint(false); }, 0);
      return r;
    };
  }

  function boot() {                                  /* ۶. راه‌اندازی */
    css(); watch(); wrapGo(); paint(true);
    var st = el("stage");
    if (st && !st.__ftHomeEv) {
      st.__ftHomeEv = true;
      st.addEventListener("click", function (e) {    /* پشتیبان: کلیک روی [data-go] */
        var t = e.target && e.target.closest ? e.target.closest("[data-go]") : null;
        if (t) setTimeout(function () { paint(false); }, 0);
      }, true);
    }
    window.addEventListener("hashchange", function () { paint(false); });
  }

  boot();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", function () { boot(); }, { once: true });
  setTimeout(boot, 900);
  setTimeout(function () { paint(false); }, 2000);

  window.R = window.R || {};                         /* ۷. API */
  R.footerHome = {
    ver: VER,
    home: function () { return HOME; },
    isHome: isHome,
    active: function () { var a = activeSec(); return a ? a.id : null; },
    paint: function () { return paint(true); },
    always: function () { DIS = true; paint(true); },      /* فوتر همه‌جا (مثل قبل) */
    homeOnly: function () { DIS = false; paint(true); },   /* فقط خانه (پیش‌فرض) */
    off: function () { DIS = true; paint(true); },
    on: function () { DIS = false; paint(true); },
    disabled: function () { return DIS; }
  };
  try { console.log("[Ronin] footer-home " + VER + " ✓"); } catch (e) {}
})();
