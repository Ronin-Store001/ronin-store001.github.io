/* ═══ RONIN NAV-DRAWER v1 — منوی کنارِ مرتب + هدر خلوت ═══
   فایل افزودنی: هیچ فایل قبلی عوض نمی‌شود.
   - همبرگر از هدر بیرون می‌رود و دکمهٔ شناور لبهٔ صفحه می‌شود (منو از کنار باز می‌شود)
   - منوی کنار دسته‌بندی شده: کاوش / جامعه / بازار / حساب من / مدیریت / ابزارها
   - آیکون‌های شلوغ هدر (جستجو، سبد، تم، زبان، چت، خروج) داخل منو می‌آیند
*/
"use strict";
(function () {
  if (!window.R || R.__navDrawer) return;
  R.__navDrawer = true;

  var LABELS = {
    home: ["🏠", "خانه"],
    anime: ["🎬", "انیمه"],
    news: ["📰", "اخبار انیمه"],
    bulletin: ["📣", "اطلاعیه و تریلر"],
    discover: ["🧭", "کشف تازه‌ها"],
    rank: ["🏆", "رتبه‌بندی"],
    events: ["📅", "رویدادها"],
    community: ["👥", "انجمن"],
    chat: ["💬", "چت عمومی"],
    groups: ["🏯", "گروه‌های چت"],
    dm: ["📥", "پیام‌ها"],
    users: ["👤", "کاربران"],
    market: ["🛒", "فروشگاه"],
    ads: ["📢", "تبلیغات و آگهی"],
    profile: ["👤", "پروفایل"],
    myworld: ["🧭", "دنیای من"],
    premium: ["💎", "پرمیوم"],
    settings: ["⚙", "تنظیمات"],
    team: ["🛡", "شبکه فرماندهی"],
    owner: ["👑", "پنل مالک"]
  };

  function el(id) { return document.getElementById(id); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("nvCss")) return;
    var s = document.createElement("style");
    s.id = "nvCss";
    s.textContent =
      /* هدر خلوت: این‌ها به منو منتقل شدند */
      "#top .tools>#searchBtn,#top .tools>#cartBtn,#top .tools>#themeToggle," +
      "#top .tools>#rnLang,#top .tools>#railBtn,#top .tools>[data-go=\"chat\"]," +
      "#top .tools>[data-authopen=\"reg\"],#top .tools>[data-logout]{display:none!important}" +

      /* دکمهٔ شناور لبه — بیرون از هدر */
      "#railBtn{position:fixed!important;z-index:58;top:50%;inset-inline-start:0!important;" +
        "transform:translateY(-50%);width:34px;height:62px;border-radius:0 14px 14px 0;" +
        "display:grid;place-items:center;font-size:17px;color:#eef1ff;cursor:pointer;" +
        "border:1px solid var(--ln2);border-inline-start:0;" +
        "background:linear-gradient(135deg,rgba(124,92,255,.9),rgba(34,211,238,.85));" +
        "box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 18px rgba(124,92,255,.45);transition:.2s}" +
      "html[dir=\"rtl\"] #railBtn{border-radius:14px 0 0 14px;border-inline-end:0;border-inline-start:1px solid var(--ln2)}" +
      "#railBtn:hover{width:40px}" +
      "body.menuopen #railBtn{background:linear-gradient(135deg,#ff5f7d,#ff9d4d)}" +

      /* پنل منو */
      "#rail{width:min(304px,86vw)!important;padding:14px 11px 16px!important;" +
        "border-radius:22px!important;inset-inline-end:10px!important;" +
        "top:calc(var(--top) + 14px)!important;bottom:12px!important;" +
        "box-shadow:0 26px 60px rgba(0,0,0,.62),0 0 0 1px rgba(124,92,255,.14)!important}" +
      "#rail .nvd-head{display:flex;align-items:center;justify-content:space-between;" +
        "gap:8px;padding:2px 6px 10px;margin-bottom:4px;border-bottom:1px solid rgba(150,120,255,.16)}" +
      "#rail .nvd-head b{font-size:13px;letter-spacing:.4px}" +
      "#rail .nvd-x{width:30px;height:30px;border-radius:10px;border:1px solid var(--ln2);" +
        "background:rgba(255,255,255,.05);color:#fff;font:inherit;font-size:14px;cursor:pointer}" +
      "#rail .rnav{gap:2px}" +
      "#rail .rgroup{border-radius:14px}" +
      "#rail .rgroup+.rgroup{margin-top:2px}" +
      "#rail .rghead{padding:12px 11px!important;border-radius:12px;font-size:12.5px!important;" +
        "letter-spacing:.2px;color:#cfd6ff!important}" +
      "#rail .rghead i{font-size:15px}" +
      "#rail .rgbody{padding:1px 3px 8px!important;gap:1px}" +
      "#rail .ditem{padding:10px 11px!important;margin:2px 0;border-radius:11px;" +
        "font-size:12.8px!important;gap:9px}" +
      "#rail .ditem i{font-size:14.5px;width:18px}" +
      "#rail .ditem .cnt{margin-inline-start:auto;min-width:19px;height:19px;padding:0 6px;" +
        "border-radius:10px;display:grid;place-items:center;font-size:10px;font-weight:800;" +
        "color:#04060f;background:linear-gradient(135deg,#2fe6ff,#8b5cff)}" +
      "#rail .ditem .cnt.hide{display:none}" +
      "#rail .railuser{margin-top:6px}" +
      "@media (max-width:420px){#rail{width:min(290px,90vw)!important}}";
    document.head.appendChild(s);
  }

  /* ── ۲. دکمهٔ لبه (بیرون از هدر) ─────────────────────────── */
  function ensureButton() {
    var b = el("railBtn");
    if (b) {
      /* از هدر بیرونش کن و شنونده‌های قبلی را بردار تا دوباره‌کاری نشود */
      var fresh = b.cloneNode(true);
      if (b.parentNode) b.parentNode.removeChild(b);
      b = fresh;
      document.body.appendChild(b);
      b.setAttribute("aria-label", "منو");
      b.addEventListener("click", onBtn);
      return b;
    }
    b = document.createElement("button");
    b.id = "railBtn";
    b.type = "button";
    b.title = "منو";
    b.textContent = "☰";
    b.addEventListener("click", onBtn);
    document.body.appendChild(b);
    return b;
  }

  function onBtn() {
    document.body.classList.toggle("menuopen");
    var open = document.body.classList.contains("menuopen");
    var btn = el("railBtn");
    if (btn) btn.textContent = open ? "✕" : "☰";
    if (open) buildNav();
  }

  /* ── ۳. آیتم‌های منو ───────────────────────────────────── */
  function railItem(key) {
    return document.querySelector('#rail .ditem[data-go="' + key + '"]');
  }

  function makeItem(key) {
    var L = LABELS[key] || ["•", key];
    var d = document.createElement("div");
    d.className = "ditem";
    d.setAttribute("data-go", key);
    d.innerHTML = "<i>" + L[0] + "</i>" + L[1];
    return d;
  }

  function takeItem(key) {
    var it = railItem(key);
    return it || makeItem(key);
  }

  function makeRow(icon, label, onClick) {
    var d = document.createElement("div");
    d.className = "ditem";
    d.innerHTML = "<i>" + icon + "</i>" + label;
    d.addEventListener("click", function (e) { e.preventDefault(); onClick(d); });
    return d;
  }

  function group(icon, title, open) {
    var g = document.createElement("div");
    g.className = "rgroup" + (open ? " open" : "");
    var h = document.createElement("button");
    h.className = "rghead";
    h.type = "button";
    h.innerHTML = "<i>" + icon + "</i><span>" + title + "</span><b class=\"rgchev\">›</b>";
    h.addEventListener("click", function () { g.classList.toggle("open"); });
    var body = document.createElement("div");
    body.className = "rgbody";
    g.appendChild(h);
    g.appendChild(body);
    return { root: g, body: body };
  }

  function isStaff() {
    try { return !!(R.isOwner && R.isOwner()) || !!(R.isStaff && R.isStaff()) || !!R.team; }
    catch (e) { return false; }
  }

  /* ── ۴. ساخت منوی دسته‌بندی‌شده ─────────────────────────── */
  function buildNav() {
    var rail = el("rail");
    if (!rail) return;

    var nav = document.createElement("div");
    nav.className = "rnav";

    /* سرِ منو */
    var head = document.createElement("div");
    head.className = "nvd-head";
    head.innerHTML = "<b>🏯 منوی رونین</b>";
    var x = document.createElement("button");
    x.className = "nvd-x";
    x.type = "button";
    x.title = "بستن";
    x.textContent = "✕";
    x.addEventListener("click", function () {
      document.body.classList.remove("menuopen");
      var b = el("railBtn"); if (b) b.textContent = "☰";
    });
    head.appendChild(x);
    nav.appendChild(head);

    /* خانه */
    nav.appendChild(takeItem("home"));

    var g1 = group("🧭", "کاوش", true);
    ["anime", "news", "bulletin", "discover", "rank", "events"].forEach(function (k) {
      g1.body.appendChild(takeItem(k));
    });
    nav.appendChild(g1.root);

    var g2 = group("👥", "جامعه", true);
    ["community", "chat", "groups", "dm", "users"].forEach(function (k) {
      g2.body.appendChild(takeItem(k));
    });
    nav.appendChild(g2.root);

    var g3 = group("🛒", "بازار", true);
    ["market", "ads"].forEach(function (k) { g3.body.appendChild(takeItem(k)); });
    /* سبد خرید */
    var cartRow = makeRow("🛍", "سبد خرید", function () {
      var c = el("cartBtn");
      if (c) c.click();
      else if (R.cart && R.cart.open) R.cart.open();
    });
    var cartBadge = document.createElement("span");
    cartBadge.className = "cnt hide";
    cartBadge.id = "nvdCartCount";
    cartRow.appendChild(cartBadge);
    g3.body.appendChild(cartRow);
    nav.appendChild(g3.root);

    var g4 = group("👤", "حساب من", true);
    ["profile", "myworld", "premium", "settings"].forEach(function (k) {
      var it = takeItem(k);
      if (k === "myworld" && !railItem("myworld") && !it) return;
      g4.body.appendChild(it);
    });

    /* ورود / ثبت‌نام / خروج */
    if (R.ME) {
      var out = makeRow("🚪", "خروج از حساب", function () {
        var b = document.querySelector("#top [data-logout]") || document.querySelector("[data-logout]");
        if (b) b.click();
      });
      g4.body.appendChild(out);
    } else {
      g4.body.appendChild(makeRow("🔑", "ورود", function () {
        var b = document.querySelector("#top [data-authopen=\"login\"]") || document.querySelector("[data-authopen=\"login\"]");
        if (b) b.click();
      }));
      g4.body.appendChild(makeRow("✨", "ثبت‌نام", function () {
        var b = document.querySelector("#top [data-authopen=\"reg\"]") || document.querySelector("[data-authopen=\"reg\"]");
        if (b) b.click();
      }));
    }
    nav.appendChild(g4.root);

    if (isStaff()) {
      var g5 = group("🛡", "مدیریت", false);
      ["team", "owner"].forEach(function (k) { g5.body.appendChild(takeItem(k)); });
      nav.appendChild(g5.root);
    }

    /* ابزارها */
    var g6 = group("🧰", "ابزارها", false);
    g6.body.appendChild(makeRow("🔍", "جستجو", function () {
      var b = el("searchBtn"); if (b) b.click();
    }));
    var bellRow = makeRow("🔔", "اعلان‌ها", function () {
      var b = el("bellBtn"); if (b) b.click();
    });
    var bellBadge = document.createElement("span");
    bellBadge.className = "cnt hide";
    bellBadge.id = "nvdBellCount";
    bellRow.appendChild(bellBadge);
    g6.body.appendChild(bellRow);

    var themeRow = makeRow("🌙", "تم: تیره", function (row) {
      var b = el("themeToggle");
      if (b) b.click();
      setTimeout(function () { syncTools(); }, 80);
    });
    themeRow.id = "nvdTheme";
    g6.body.appendChild(themeRow);

    var langRow = makeRow("🌐", "زبان: فارسی", function (row) {
      if (!R.i18n || !R.i18n.set) return;
      var langs = R.i18n.langs || ["fa"];
      var cur = R.i18n.get ? R.i18n.get() : "fa";
      var next = langs[(langs.indexOf(cur) + 1) % langs.length];
      R.i18n.set(next);
      setTimeout(syncTools, 80);
    });
    langRow.id = "nvdLang";
    g6.body.appendChild(langRow);

    nav.appendChild(g6.root);

    /* جایگزینی محتوای منوی کنار (بقیهٔ rail: کاربر و کارت پرمیوم می‌مانند) */
    var old = rail.querySelector(".rnav");
    if (old) rail.replaceChild(nav, old);
    else rail.insertBefore(nav, rail.firstChild);

    syncTools();
  }

  /* ── ۵. همگام‌سازی شمارنده‌ها و متن ابزارها ─────────────── */
  function syncTools() {
    /* اعلان‌ها */
    var dot = el("bellDot");
    var b1 = el("nvdBellCount");
    if (b1 && dot) {
      var t = String(dot.textContent || "").trim();
      var n = parseInt(t.replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); }), 10) || 0;
      b1.textContent = n ? (n > 99 ? "99+" : fa(n)) : "";
      b1.classList.toggle("hide", !n);
    }
    /* سبد */
    var cb = el("cartBadge");
    var b2 = el("nvdCartCount");
    if (b2 && cb) {
      var n2 = String(cb.textContent || "").trim();
      b2.textContent = n2 && n2 !== "0" ? n2 : "";
      b2.classList.toggle("hide", !n2 || n2 === "0");
    }
    /* تم */
    var tr = el("nvdTheme");
    if (tr) {
      var dark = (document.documentElement.dataset.theme || "dark") === "dark";
      tr.innerHTML = "<i>" + (dark ? "🌙" : "☀️") + "</i>تم: " + (dark ? "تیره" : "روشن");
    }
    /* زبان */
    var lr = el("nvdLang");
    if (lr && R.i18n && R.i18n.get) {
      var names = { fa: "فارسی", en: "English", tr: "Türkçe" };
      var cur = R.i18n.get();
      lr.innerHTML = "<i>🌐</i>زبان: " + (names[cur] || cur);
    }
  }

  /* ── ۶. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    css();
    var b = ensureButton();
    if (b && document.body.classList.contains("menuopen")) b.textContent = "✕";
    buildNav();
    /* شمارنده‌ها با تأخیر آماده می‌شوند */
    [600, 1600, 3200].forEach(function (ms) { setTimeout(syncTools, ms); });
  }

  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    setTimeout(function () { buildNav(); }, 200);
  };
  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    setTimeout(function () { buildNav(); }, 200);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [1200, 2400, 4200, 5600, 7200].forEach(function (ms) { setTimeout(boot, ms); });
})();
