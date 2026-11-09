/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — theme.js v4 | موتور تم: تاریک / روشن / خودکار
   ───────────────────────────────────────────────────────────────
   • سه حالت: dark، light، auto (پیش‌فرض auto = همراه با تم سیستم)
   • چهار لهجهٔ رنگی: aurora، sakura، ember، mint (روی هر دو تم کار می‌کنند)
   • قبل از رندر اجرا می‌شود تا پرش رنگ (flash) نداشته باشیم
   • یک منبع حقیقت: R.theme — دکمهٔ هدر، تنظیمات و منوی کناری
     با رویداد «themechange» با هم هم‌گام می‌شوند
   • هم‌گام بین تب‌ها (storage) و با تغییر تم سیستم در حالت خودکار
   • پالت روشن کامل: متغیرهای پایه + سطوح تیرهٔ هاردکدشده
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "ronin-theme";
  var TINT_KEY = "ronin-accent";
  var root = document.documentElement;
  var ORDER = ["dark", "light", "auto"];
  var TINTS = { aurora: "شفق", sakura: "ساکورا", ember: "اخگر", mint: "نعناع" };

  /* ── ۱. خواندن و ذخیره ───────────────────────────────────── */
  function readSaved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function sysTheme() {
    try { return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"; }
    catch (e) { return "dark"; }
  }
  function norm(v) { return ORDER.indexOf(v) >= 0 ? v : "auto"; }

  function readTint() {
    try { return localStorage.getItem(TINT_KEY); } catch (e) { return null; }
  }
  function saveTint(v) { try { localStorage.setItem(TINT_KEY, v); } catch (e) {} }
  function normTint(v) { return TINTS[v] ? v : "aurora"; }

  var mode = norm(readSaved());
  var tint = normTint(readTint());
  function resolved() { return mode === "auto" ? sysTheme() : mode; }

  /* گام اول: قبل از رنگ‌آمیزی صفحه تم را ست کن */
  root.dataset.theme = resolved();
  root.dataset.themeMode = mode;
  root.dataset.accent = tint;

  /* ── ۲. پالت روشن ────────────────────────────────────────── */
  var LIGHT_CSS = [
    'html[data-theme="dark"]{color-scheme:dark}',
    'html[data-theme="light"]{color-scheme:light;',
      '--bg:#eef1f8;--ink:#161c2e;--mut:#5b6480;',
      '--g1:rgba(255,255,255,.70);--g2:rgba(255,255,255,.90);--g3:rgba(253,254,255,.97);',
      '--ln:rgba(28,40,74,.14);--ln2:rgba(110,80,240,.30);',
      '--sh:0 14px 36px rgba(24,34,66,.12)}',

    /* بدنه و لایه‌های پس‌زمینه */
    'html[data-theme="light"] body{background:linear-gradient(180deg,#f7f9ff,#eceff8 55%,#f5f7fd)!important;color:#161c2e}',
    'html[data-theme="light"] #rbCanvas,html[data-theme="light"] #rbVig{display:none!important}',

    /* هدر */
    'html[data-theme="light"] #top{background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(244,246,252,.93))!important;',
      'border-color:rgba(28,40,74,.10)!important;box-shadow:0 12px 30px rgba(24,34,66,.10)!important}',
    'html[data-theme="light"] .brandtx b{background:linear-gradient(90deg,#1b2338,var(--cy));',
      '-webkit-background-clip:text;background-clip:text;color:transparent}',
    'html[data-theme="light"] .nav a:hover{background:rgba(110,80,240,.10);color:#141a2c}',
    'html[data-theme="light"] .icobtn{background:rgba(18,28,60,.05);border-color:rgba(28,40,74,.12)}',
    'html[data-theme="light"] .icobtn:hover{background:rgba(110,80,240,.14);border-color:var(--ln2)}',

    /* منوی کناری */
    'html[data-theme="light"] #rail{background:linear-gradient(180deg,rgba(255,255,255,.97),rgba(248,250,255,.95))!important;',
      'box-shadow:0 14px 34px rgba(24,34,66,.10)!important}',
    'html[data-theme="light"] .ditem{color:#4b5570}',
    'html[data-theme="light"] .ditem i{filter:saturate(.95)}',
    'html[data-theme="light"] .ditem:hover{color:#141a2c;background:rgba(110,80,240,.10)}',
    'html[data-theme="light"] .railtitle{color:#6b7490}',
    'html[data-theme="light"] .railuser{background:rgba(18,28,60,.04);border-color:rgba(28,40,74,.10)}',

    /* نوار پایین گوشی */
    'html[data-theme="light"] #dock{background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,.98))!important;',
      'border-top-color:rgba(28,40,74,.12)!important}',
    'html[data-theme="light"] #dock .dwrap{background:transparent!important;box-shadow:none!important}',

    /* کارت‌ها و مودال */
    'html[data-theme="light"] .card{background:linear-gradient(150deg,#fff,#f2f4fa)!important;',
      'border-color:rgba(28,40,74,.12)!important;box-shadow:0 10px 26px rgba(24,34,66,.10)!important}',
    'html[data-theme="light"] .card::before{background:linear-gradient(90deg,transparent,rgba(110,80,240,.45),transparent)}',
    'html[data-theme="light"] .card.hov:hover{box-shadow:0 18px 40px rgba(24,34,66,.16)!important}',
    'html[data-theme="light"] .modal{background:rgba(226,230,242,.62)!important}',
    'html[data-theme="light"] .modal .box{background:#fff!important;border-color:rgba(110,80,240,.22)!important;',
      'box-shadow:0 24px 60px rgba(24,34,66,.22)!important}',

    /* فرم‌ها و دکمه‌ها */
    'html[data-theme="light"] .inp,html[data-theme="light"] .sel,html[data-theme="light"] .area{',
      'background:#fff!important;border-color:rgba(28,40,74,.18)!important;color:#161c2e}',
    'html[data-theme="light"] .inp::placeholder,html[data-theme="light"] .area::placeholder{color:#8a93ab}',
    'html[data-theme="light"] .btn{background:rgba(18,28,60,.05);border-color:rgba(28,40,74,.14);color:#1b2338}',
    'html[data-theme="light"] .btn:hover{background:rgba(110,80,240,.12)}',
    'html[data-theme="light"] .btn.p,html[data-theme="light"] .btn.d,',
      'html[data-theme="light"] .btn.ok,html[data-theme="light"] .btn.gd{color:#06060f}',
    'html[data-theme="light"] .tabs{background:rgba(255,255,255,.80);border-color:rgba(28,40,74,.14)}',
    'html[data-theme="light"] .tab{color:#5b6480}',
    'html[data-theme="light"] .tab.on{color:#06060f}',
    'html[data-theme="light"] .chip{color:#4b2fb0}',
    'html[data-theme="light"] .empty{background:rgba(255,255,255,.72);border-color:rgba(110,80,240,.25)}',
    'html[data-theme="light"] .toast{background:#fff!important;color:#1b2338!important;',
      'box-shadow:0 14px 34px rgba(24,34,66,.18)!important}',
    'html[data-theme="light"] hr,html[data-theme="light"] .srow{border-color:rgba(28,40,74,.10)}',

    /* همراه، آرشیو، چت، گروه‌ها */
    'html[data-theme="light"] #gninja .nbub{background:#fff!important;color:#1b2338!important;',
      'border-color:rgba(110,80,240,.30)!important;box-shadow:0 12px 30px rgba(24,34,66,.18)!important}',
    'html[data-theme="light"] .carc{background:#fff!important;border-color:rgba(28,40,74,.14)!important}',
    'html[data-theme="light"] .carc .cr{color:#5b6480}',
    'html[data-theme="light"] #grpList .gdesc{color:#5b6480}',
    'html[data-theme="light"] .cpmsg .bub{background:#fff;color:#1b2338;border-color:rgba(28,40,74,.12)}',
    'html[data-theme="light"] .cpname{color:#3b56a8}',

    /* پردهٔ ورود */
    'html[data-theme="light"] #rsplash{background:radial-gradient(circle at 50% 42%,#eef1fb,#f8faff 72%)}',
    'html[data-theme="light"] #rsplash b{color:#1b2338;text-shadow:0 0 22px rgba(124,92,255,.35)}',

    /* اسکرول‌بار */
    'html[data-theme="light"] ::-webkit-scrollbar-track{background:#e9edf7}',
    'html[data-theme="light"] ::-webkit-scrollbar-thumb{border-color:#eef1f8}',

    /* گذار نرم هنگام عوض کردن تم */
    'html.theme-fade body,html.theme-fade #top,html.theme-fade #rail,html.theme-fade #dock,',
      'html.theme-fade .card,html.theme-fade .modal .box,html.theme-fade #gninja .nbub,',
      'html.theme-fade .inp,html.theme-fade .btn{',
      'transition:background-color .28s ease,color .28s ease,border-color .28s ease,box-shadow .28s ease}',
    '@media(prefers-reduced-motion:reduce){html.theme-fade body,html.theme-fade #top,',
      'html.theme-fade #rail,html.theme-fade #dock,html.theme-fade .card,',
      'html.theme-fade .modal .box{transition:none!important}}'
  ].join("");

  function injectCss() {
    var old = document.getElementById("theme-css");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var s = document.createElement("style");
    s.id = "theme-css";
    s.textContent = LIGHT_CSS;
    (document.head || root).appendChild(s);
  }

  /* ── ۳. متا و رنگ سیستم ──────────────────────────────────── */
  function metaSync(t) {
    var a = document.querySelector('meta[name="theme-color"]');
    if (a) a.content = t === "light" ? "#f4f6fb" : "#05070f";
    var b = document.querySelector('meta[name="color-scheme"]');
    if (b) b.content = t;
  }

  /* ── ۴. هم‌گام‌کردن همهٔ سوییچ‌های تم ───────────────────── */
  function modeLabel(m, t) {
    if (m === "auto") return "خودکار";
    return t === "light" ? "روشن" : "تیره";
  }

  function syncUI() {
    var t = root.dataset.theme || "dark";
    var m = mode;

    var b = document.getElementById("themeToggle");
    if (b) {
      b.textContent = t === "dark" ? "🌙" : "☀️";
      b.title = m === "auto"
        ? "تم خودکار (" + (t === "dark" ? "تیره" : "روشن") + ")"
        : "تم " + (t === "dark" ? "تیره" : "روشن");
      b.setAttribute("aria-label", t === "dark" ? "تغییر به تم روشن" : "تغییر به تم تاریک");
      b.setAttribute("aria-pressed", t === "light" ? "true" : "false");
      b.dataset.themeMode = m;
    }

    var all = document.querySelectorAll("[data-theme-set]");
    for (var i = 0; i < all.length; i++) {
      var on = all[i].getAttribute("data-theme-set") === m;
      all[i].classList.toggle("p", on);
      all[i].classList.toggle("on", on);
      all[i].setAttribute("aria-pressed", on ? "true" : "false");
    }

    var accents = document.querySelectorAll("[data-accent-set]");
    for (var j = 0; j < accents.length; j++) {
      var aOn = accents[j].getAttribute("data-accent-set") === tint;
      accents[j].classList.toggle("on", aOn);
      accents[j].setAttribute("aria-pressed", aOn ? "true" : "false");
    }

    var tr = document.getElementById("nvdTheme");
    if (tr) {
      tr.innerHTML = "<i>" + (m === "auto" ? "🌗" : t === "dark" ? "🌙" : "☀️") +
        "</i>تم: " + modeLabel(m, t);
    }
  }

  /* ── ۵. اعمال تم ─────────────────────────────────────────── */
  var fadeT = null;
  function paint(animate) {
    var t = resolved();
    root.dataset.theme = t;
    root.dataset.themeMode = mode;
    metaSync(t);
    if (animate) {
      root.classList.add("theme-fade");
      clearTimeout(fadeT);
      fadeT = setTimeout(function () { root.classList.remove("theme-fade"); }, 380);
    }
    syncUI();
    try { expose(); } catch (e0) {}
    var detail = { mode: mode, theme: t };
    try {
      document.dispatchEvent(new CustomEvent("themechange", { detail: detail }));
    } catch (e) {
      try {
        var ev = document.createEvent("CustomEvent");
        ev.initCustomEvent("themechange", false, false, detail);
        document.dispatchEvent(ev);
      } catch (e2) {}
    }
    if (window.R && typeof R.onTheme === "function") {
      try { R.onTheme(t, mode); } catch (e) {}
    }
  }

  /* ── ۶. API عمومی ────────────────────────────────────────── */
  var api = {
    get: function () { return resolved(); },
    mode: function () { return mode; },
    isDark: function () { return resolved() === "dark"; },
    isLight: function () { return resolved() === "light"; },
    accent: function () { return tint; },
    accentName: function () { return TINTS[tint] || TINTS.aurora; },
    setAccent: function (v, opt) {
      tint = normTint(v);
      saveTint(tint);
      root.dataset.accent = tint;
      syncUI();
      var detail = { accent: tint, theme: resolved(), mode: mode };
      try { document.dispatchEvent(new CustomEvent("themechange", { detail: detail })); } catch (e) {}
      if (!(opt && opt.quiet) && window.R && typeof R.toast === "function") {
        try { R.toast("🎨 لهجهٔ " + TINTS[tint] + " فعال شد", "ok"); } catch (e2) {}
      }
      return tint;
    },
    set: function (m, opt) {
      var before = resolved();
      mode = norm(m);
      save(mode);
      paint(!(opt && opt.silent));
      if (!(opt && opt.quiet) && window.R && typeof R.toast === "function") {
        var t = resolved();
        try {
          if (t !== before || mode === "auto") {
            R.toast(mode === "auto"
              ? "🌗 تم خودکار شد (" + (t === "dark" ? "تیره" : "روشن") + ")"
              : (t === "dark" ? "🌙 تم تیره شد" : "☀️ تم روشن شد"), "ok");
          }
        } catch (e) {}
      }
      return t;
    },
    toggle: function () {
      api.set(resolved() === "dark" ? "light" : "dark");
      return resolved();
    },
    cycle: function () {
      api.set(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
      return mode;
    },
    refresh: function () { paint(false); }
  };

  window.RoninTheme = api;
  function expose() {
    if (!window.R) return false;
    R.theme = api;
    return true;
  }
  expose();
  var tries = 0;
  (function attach() {
    if (expose() || ++tries > 60) return;
    setTimeout(attach, 50);
  })();

  /* ── ۷. دکمهٔ هدر + کلیک روی هر سوییچ ────────────────────── */
  function injectBtn() {
    var tools = document.querySelector("#top .tools");
    if (!tools || document.getElementById("themeToggle")) return;
    var b = document.createElement("button");
    b.id = "themeToggle";
    b.type = "button";
    b.className = "icobtn";
    b.textContent = root.dataset.theme === "dark" ? "🌙" : "☀️";
    b.setAttribute("aria-label", "تغییر تم");
    b.addEventListener("click", function () { api.toggle(); });
    tools.insertBefore(b, tools.firstChild);
  }

  document.addEventListener("click", function (e) {
    var ac = e.target && e.target.closest
      ? e.target.closest("[data-accent-set]") : null;
    if (ac) { api.setAccent(ac.getAttribute("data-accent-set")); return; }
    var el = e.target && e.target.closest
      ? e.target.closest("[data-theme-set],[data-theme-cycle]") : null;
    if (!el) return;
    if (el.hasAttribute("data-theme-cycle")) { api.cycle(); return; }
    api.set(el.getAttribute("data-theme-set"));
  }, false);

  /* ── ۸. هم‌گام با سیستم و تب‌های دیگر ────────────────────── */
  try {
    var mq = matchMedia("(prefers-color-scheme: light)");
    var onSys = function () { if (mode === "auto") paint(true); };
    if (mq.addEventListener) mq.addEventListener("change", onSys);
    else if (mq.addListener) mq.addListener(onSys);
  } catch (e) {}

  window.addEventListener("storage", function (e) {
    if (e.key === KEY) {
      mode = norm(e.newValue);
      paint(true);
      return;
    }
    if (e.key === TINT_KEY) {
      tint = normTint(e.newValue);
      root.dataset.accent = tint;
      syncUI();
    }
  });

  /* ── ۹. راه‌اندازی ───────────────────────────────────────── */
  function ready() {
    injectCss();
    injectBtn();
    metaSync(root.dataset.theme || "dark");
    syncUI();
    expose();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
  /* منو/تنظیمات ممکن است دوباره ساخته شوند؛ برچسب‌ها را تازه نگه دار */
  setInterval(function () { try { syncUI(); } catch (e) {} }, 2000);
})();
