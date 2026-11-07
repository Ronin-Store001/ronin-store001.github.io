/* ═══ RONIN STORE — BURGER PRO · ronin-burger-pro.js · v6
   فایل افزودنی (هیچ فایل قبلی عوض نمی‌شود).
   • دکمهٔ ☰ شناور، جدا از هدر، بالا-چپ صفحه.
   • پنل تمام‌قد از لبهٔ چپ صفحه با انیمیشن فنری + چرخش سه‌بعدی + موج ضربه.
   • دسته‌بندی‌های موجود (کاوش/جامعه/بازار/حساب من/مدیریت/ابزارها) همان‌جا می‌مانند. */
"use strict";
(function () {
  if (window.__nbp) return;
  window.__nbp = true;

  var VER = "v6", CSS_ID = "nbpCss";

  function el(i) { return document.getElementById(i); }
  function btn() { return el("railBtn"); }
  function rail() { return el("rail"); }
  function isOpen() { return document.body.classList.contains("menuopen"); }

  /* ── ۱. استایل ─────────────────────────────────────────── */
  function css() {
    if (el(CSS_ID)) return;
    var s = document.createElement("style");
    s.id = CSS_ID;
    s.textContent = [
      /* ── دکمهٔ شناور: جدا از هدر، بالا-چپ صفحه ── */
      "html body #railBtn{position:fixed!important;z-index:130!important;" +
        "top:calc(var(--top) + 22px)!important;left:14px!important;right:auto!important;" +
        "bottom:auto!important;transform:none!important;margin:0!important;" +
        "width:46px!important;height:46px!important;min-width:46px;flex:0 0 46px;border-radius:15px!important;" +
        "display:grid!important;place-items:center;font-size:0!important;line-height:0;" +
        "padding:0!important;cursor:pointer;color:#eef1ff;overflow:visible;" +
        "border:1px solid rgba(150,120,255,.45)!important;" +
        "background:linear-gradient(135deg,rgba(20,24,52,.92),rgba(12,16,38,.86))!important;" +
        "backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%);" +
        "box-shadow:0 10px 26px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.05);" +
        "transition:background .3s,box-shadow .3s,filter .2s,top .3s}",
      "html body #railBtn:hover{filter:brightness(1.2);" +
        "box-shadow:0 12px 30px rgba(0,0,0,.52),0 0 20px rgba(124,92,255,.5)}",
      "html body #railBtn:active{filter:brightness(.9)}",
      /* سه خط */
      "html body #railBtn::before{content:\"\";width:20px;height:2px;border-radius:2px;" +
        "background:currentColor;box-shadow:0 -6px 0 currentColor,0 6px 0 currentColor;" +
        "transition:transform .32s cubic-bezier(.2,.9,.2,1),opacity .2s}",
      /* ✕ */
      "html body #railBtn::after{content:\"\";position:absolute;left:50%;top:50%;width:18px;height:18px;" +
        "margin:-9px 0 0 -9px;border-radius:3px;opacity:0;transform:scale(.35) rotate(-45deg);" +
        "background:linear-gradient(45deg,transparent 43%,currentColor 43%,currentColor 57%,transparent 57%)," +
        "linear-gradient(-45deg,transparent 43%,currentColor 43%,currentColor 57%,transparent 57%);" +
        "transition:opacity .2s,transform .34s cubic-bezier(.2,1.5,.4,1)}",
      "html body.menuopen #railBtn::before{opacity:0;transform:rotate(90deg) scaleX(.3)}",
      "html body.menuopen #railBtn::after{opacity:1;transform:scale(1) rotate(0)}",
      /* حلقهٔ نور آرام وقتی بسته است */
      "@keyframes nbpGlow{0%,100%{box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 0 0 rgba(124,92,255,.45)}" +
        "55%{box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 0 9px rgba(124,92,255,0)}}",
      "html body:not(.menuopen) #railBtn{animation:nbpGlow 3.4s ease-in-out infinite}",
      "html body.menuopen #railBtn{background:linear-gradient(135deg,#ff5f7d,#ff9d4d)!important;" +
        "border-color:rgba(255,255,255,.35)!important}",

      /* ── موج ضربه ── */
      ".nbpWave{position:fixed;width:46px;height:46px;border-radius:50%;pointer-events:none;z-index:129;" +
        "border:2px solid rgba(150,120,255,.85);transform:translate(-50%,-50%) scale(.3);opacity:.95;" +
        "animation:nbpWave .8s cubic-bezier(.2,.85,.3,1) forwards}",
      "@keyframes nbpWave{to{transform:translate(-50%,-50%) scale(11);opacity:0}}",

      /* ── پنل: تمام‌قد، از لبهٔ چپ صفحه ── */
      "html body #rail{position:fixed!important;z-index:120!important;" +
        "left:0!important;right:auto!important;" +
        "top:0!important;bottom:0!important;height:100%!important;max-height:100%!important;" +
        "width:min(330px,86vw)!important;border-radius:0 24px 24px 0!important;" +
        "transform-origin:left center;transform:perspective(1100px) translateX(-104%) rotateY(16deg) scale(.96);" +
        "opacity:0;visibility:hidden;" +
        "transition:transform .58s cubic-bezier(.16,1,.3,1),opacity .3s ease,visibility .58s;" +
        "will-change:transform,opacity;" +
        "padding-top:calc(76px + env(safe-area-inset-top))!important;" +
        "padding-bottom:calc(14px + env(safe-area-inset-bottom))!important}",
      "html body.menuopen #rail{transform:none;opacity:1;visibility:visible;" +
        "box-shadow:26px 0 70px rgba(0,0,0,.7),0 0 0 1px rgba(124,92,255,.22),0 0 60px rgba(124,92,255,.2)!important}",
      /* ورود پله‌پلهٔ ردیف‌ها */
      "html body #rail .rnav>*,html body #rail .railuser,html body #rail .premcard," +
        "html body #rail .nvd-head{transition:transform .40s cubic-bezier(.2,.9,.2,1),opacity .34s}",
      "html body:not(.menuopen) #rail .rnav>*,html body:not(.menuopen) #rail .railuser," +
        "html body:not(.menuopen) #rail .premcard,html body:not(.menuopen) #rail .nvd-head" +
        "{opacity:0;transform:translateX(-26px)}",
      "html body.menuopen #rail .rnav>*,html body.menuopen #rail .railuser," +
        "html body.menuopen #rail .premcard,html body.menuopen #rail .nvd-head{opacity:1;transform:none}",
      "html body.menuopen #rail .nvd-head{transition-delay:.04s}",
      "html body.menuopen #rail .rnav>:nth-child(1){transition-delay:.08s}",
      "html body.menuopen #rail .rnav>:nth-child(2){transition-delay:.12s}",
      "html body.menuopen #rail .rnav>:nth-child(3){transition-delay:.16s}",
      "html body.menuopen #rail .rnav>:nth-child(4){transition-delay:.20s}",
      "html body.menuopen #rail .rnav>:nth-child(5){transition-delay:.24s}",
      "html body.menuopen #rail .rnav>:nth-child(6){transition-delay:.28s}",
      "html body.menuopen #rail .rnav>:nth-child(7){transition-delay:.32s}",
      "html body.menuopen #rail .rnav>:nth-child(8){transition-delay:.36s}",
      "html body.menuopen #rail .railuser{transition-delay:.40s}",
      "html body.menuopen #rail .premcard{transition-delay:.44s}",

      /* پردهٔ پشت منو: هاله از سمت چپ */
      "#menuScrim{z-index:115!important;" +
        "background:radial-gradient(135% 100% at 0% 0%,rgba(124,92,255,.38),rgba(4,6,18,.74) 58%)!important;" +
        "backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important}",

      /* ✕ داخلی پنل لازم نیست؛ خود دکمه می‌بندد */
      "html body #rail .nvd-x{display:none!important}",
      "html body #rail .nvd-head{padding-inline:6px 0!important}",

      /* موبایل: کمی جمع‌تر، بالای داک */
      "@media(max-width:560px){html body #railBtn{width:42px!important;height:42px!important;" +
        "min-width:42px;flex-basis:42px;border-radius:13px!important;top:calc(var(--top) + 18px)!important;" +
        "left:10px!important}" +
        "html body #rail{width:min(300px,88vw)!important}}",

      "@media(prefers-reduced-motion:reduce){html body #railBtn,html body #rail," +
        "html body #rail .rnav>*,html body #rail .railuser,html body #rail .premcard,html body #rail .nvd-head" +
        "{animation:none!important;transition:none!important}}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── ۲. دکمه: بیرون از هدر، چسبیده به body ─────────────── */
  function place() {
    var b = btn();
    if (!b) return false;
    b.type = "button";
    b.title = "منو";
    b.setAttribute("aria-label", "منو");
    if (b.parentNode !== document.body) document.body.appendChild(b);
    b.classList.add("nbp-float");
    syncAria();
    return true;
  }

  function syncAria() {
    var b = btn();
    if (b) b.setAttribute("aria-expanded", isOpen() ? "true" : "false");
    var r = rail();
    if (r) r.setAttribute("aria-hidden", isOpen() ? "false" : "true");
  }

  /* ── ۳. موج ضربه ──────────────────────────────────────── */
  function wave() {
    var b = btn();
    if (!b) return;
    var r = b.getBoundingClientRect();
    if (!r.width) return;
    var w = document.createElement("div");
    w.className = "nbpWave";
    w.style.left = (r.left + r.width / 2) + "px";
    w.style.top = (r.top + r.height / 2) + "px";
    document.body.appendChild(w);
    setTimeout(function () { if (w.parentNode) w.remove(); }, 950);
  }

  /* ── ۴. رصد باز/بسته شدن ──────────────────────────────── */
  var wasOpen = false;
  function watchOpen() {
    try {
      var mo = new MutationObserver(function () {
        var now = isOpen();
        syncAria();
        if (now && !wasOpen) {
          wave();
          var rr = rail();
          if (rr) { try { rr.scrollTop = 0; } catch (e) {} }
          setTimeout(function () {
            var r = rail();
            var first = r && r.querySelector(".ditem");
            if (first && r && !r.contains(document.activeElement)) {
              try { first.focus({ preventScroll: true }); } catch (e) {}
            }
          }, 340);
        }
        wasOpen = now;
      });
      mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    } catch (e) {}
    wasOpen = isOpen();
  }

  /* ── ۵. اگر فایلی دکمه را جابه‌جا کرد، برگردانش ─────────── */
  function watchMove() {
    try {
      var mo = new MutationObserver(function () { place(); });
      mo.observe(document.body, { childList: true });
    } catch (e) {}
  }

  /* ── ۶. راه‌اندازی ────────────────────────────────────── */
  function boot() {
    css();
    place();
    watchMove();
  }

  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("#railBtn") : null;
    if (!t) return;
    place();
    syncAria();
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  watchOpen();
  [500, 1500, 3000, 6000].forEach(function (ms) { setTimeout(boot, ms); });
  window.addEventListener("load", function () { boot(); }, { once: true });

  /* ── ۷. API ───────────────────────────────────────────── */
  window.R = window.R || {};
  R.burger = {
    ver: VER,
    btn: btn,
    rail: rail,
    isOpen: isOpen,
    open: function () {
      document.body.classList.add("menuopen");
      var r = rail(); if (r) { try { r.scrollTop = 0; } catch (e) {} }
      syncAria();
    },
    close: function () { document.body.classList.remove("menuopen"); syncAria(); },
    toggle: function () { document.body.classList.toggle("menuopen"); syncAria(); },
    wave: wave,
    place: place
  };
  try { console.log("[Ronin] burger-pro " + VER + " ✓"); } catch (e) {}
})();
