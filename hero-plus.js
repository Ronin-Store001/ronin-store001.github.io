/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — HERO PLUS v1  ·  hero-plus.js
   چیدمان تازهٔ هیرو: دو ستونه، شیشهٔ تیره، نورهای شنارو، حلقه‌های
   چرخان، آمار زنده و کاشی‌های دسترسی سریع — سه‌زبانه.
   ───────────────────────────────────────────────────────────────
   افزودنی است: محتوای .hero داخل #sec-home را بازنویسی می‌کند،
   بقیهٔ صفحه دست نمی‌خورد. با تغییر زبان سایت (R.i18n) هم‌گام است.
   اگر این فایل نباشد، هیرو قبلی سر جایش کار می‌کند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__hp) return;
  R.__hp = true;

  var LANGS = ["fa", "en", "tr"];
  var lastLang = null, timer = null;
  var ROOT = "#sec-home .hero";

  function el(i) { return document.getElementById(i); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function langq() {
    try {
      if (R.i18n && R.i18n.get) {
        var l = R.i18n.get();
        return LANGS.indexOf(l) >= 0 ? l : "fa";
      }
    } catch (e) {}
    return "fa";
  }
  function isFa() { return langq() === "fa"; }
  function t(k) { var x = T[k]; return x ? (x[langq()] || x.fa) : k; }
  function num(n) { var s = String(n); return (isFa() && R.fa) ? R.fa(s) : s; }
  function count(o) { return o ? Object.keys(o).length : 0; }

  /* ── ۱. دیکشنری ─────────────────────────────────────────── */
  var T = {
    eyebrow: { fa: "نسخهٔ نئو رین سیتی", en: "Neo Rain City edition", tr: "Neo Rain City sürümü" },
    h1a: { fa: "به دنیای", en: "Welcome to the", tr: "Hoş geldin:" },
    h1b: { fa: "خوش آمدی", en: "universe", tr: "dünyasına" },
    rot1: { fa: "انیمه", en: "anime", tr: "anime" },
    rot2: { fa: "اخبار", en: "news", tr: "haber" },
    rot3: { fa: "فروشگاه", en: "store", tr: "mağaza" },
    rot4: { fa: "انجمن", en: "community", tr: "topluluk" },
    lead: {
      fa: "جامعه، فروشگاه و دنیایی که خودت می‌سازی — چت زنده، آگهی، خبر و پرمیوم، همه در یک‌جا.",
      en: "Community, store and a world you build yourself — live chat, listings, news and premium, all in one place.",
      tr: "Topluluk, mağaza ve kendi kurduğun dünya — canlı sohbet, ilanlar, haber ve premium, hepsi bir arada."
    },
    cta1: { fa: "شروع ماجراجویی", en: "Start the journey", tr: "Yolculuğa başla" },
    cta2: { fa: "اطلاعیه و تریلر", en: "Announcements & trailers", tr: "Duyurular ve fragman" },
    cta3: { fa: "فروشگاه", en: "Store", tr: "Mağaza" },
    online: { fa: "آنلاین", en: "online", tr: "çevrimiçi" },
    users: { fa: "کاربر", en: "users", tr: "kullanıcı" },
    posts: { fa: "پست", en: "posts", tr: "gönderi" },
    prem: { fa: "پرمیوم", en: "premium", tr: "premium" },
    qMarket: { fa: "فروشگاه", en: "Store", tr: "Mağaza" },
    qMarketD: { fa: "خرید و آگهی", en: "Buy & list", tr: "Al & ilan ver" },
    qComm: { fa: "انجمن", en: "Community", tr: "Topluluk" },
    qCommD: { fa: "پست و گفتگو", en: "Posts & talk", tr: "Gönderi & sohbet" },
    qChat: { fa: "چت زنده", en: "Live chat", tr: "Canlı sohbet" },
    qChatD: { fa: "با همه، همین حالا", en: "With everyone, now", tr: "Herkesle, şimdi" },
    qPrem: { fa: "پرمیوم", en: "Premium", tr: "Premium" },
    qPremD: { fa: "ویژگی‌های ویژه", en: "Extra features", tr: "Özel özellikler" },
    tagAnime: { fa: "انیمه", en: "anime", tr: "anime" },
    tagNews: { fa: "خبر", en: "news", tr: "haber" },
    tagAds: { fa: "آگهی", en: "listings", tr: "ilan" },
    ticker: {
      fa: "پست بگذار · آگهی بده · دوست پیدا کن · پرمیوم بگیر",
      en: "Post · List · Make friends · Go premium",
      tr: "Paylaş · İlan ver · Arkadaş bul · Premium al"
    },
    scroll: { fa: "کمی پایین‌تر", en: "Scroll a bit", tr: "Biraz kaydır" }
  };

  /* ── ۲. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("hpCss")) return;
    var s = document.createElement("style");
    s.id = "hpCss";
    s.textContent =
      /* پوسته */
      "html body " + ROOT + "{padding:0!important;min-height:auto!important;display:block!important;" +
        "background:linear-gradient(150deg,#0a0f26 0%,#0b1030 45%,#080b1d 100%)!important}" +
      "html body " + ROOT + "::after{display:none!important}" +
      "html body " + ROOT + " .halo{display:none!important}" +
      "html body " + ROOT + " h1,html body " + ROOT + " h2{color:inherit}" +
      ".hp{position:relative;overflow:hidden;border-radius:26px;isolation:isolate}" +
      ".hpAur{position:absolute;inset:-30% -10% auto;height:150%;pointer-events:none;z-index:0;" +
        "background:radial-gradient(38% 46% at 22% 18%,rgba(124,92,255,.55),transparent 70%)," +
        "radial-gradient(34% 40% at 82% 26%,rgba(34,211,238,.38),transparent 72%)," +
        "radial-gradient(36% 44% at 62% 96%,rgba(255,79,216,.3),transparent 72%);" +
        "filter:blur(14px);animation:hpAur 16s ease-in-out infinite alternate}" +
      "@keyframes hpAur{0%{transform:translate3d(-2%,0,0) scale(1)}100%{transform:translate3d(3%,2%,0) scale(1.08)}}" +
      ".hpGrid{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;" +
        "background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1px);" +
        "background-size:44px 44px;mask-image:radial-gradient(70% 70% at 60% 40%,#000 25%,transparent 78%);" +
        "-webkit-mask-image:radial-gradient(70% 70% at 60% 40%,#000 25%,transparent 78%)}" +
      ".hpIn{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);" +
        "gap:26px;align-items:center;padding:38px 32px 30px}" +
      "@media (max-width:860px){.hpIn{grid-template-columns:1fr;padding:26px 20px 22px;gap:16px}" +
        ".hpArt{display:none!important}}" +

      /* متن */
      ".hpEye{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:99px;" +
        "font-size:11px;letter-spacing:.3px;color:#dbe3ff;background:rgba(124,92,255,.16);" +
        "border:1px solid rgba(124,92,255,.4)}" +
      ".hpDot{width:7px;height:7px;border-radius:50%;background:#5df0b0;" +
        "box-shadow:0 0 9px #5df0b0;animation:hpPulse 2s infinite}" +
      "@keyframes hpPulse{50%{opacity:.35;transform:scale(.8)}}" +
      ".hpH1{position:relative;margin:13px 0 0;font-size:clamp(27px,4.6vw,50px);line-height:1.2;" +
        "font-weight:900;letter-spacing:-1px;color:#f4f6ff;text-shadow:0 10px 40px rgba(0,0,0,.5)}" +
      ".hpGrad{background:linear-gradient(100deg,#8f7bff,#22d3ee 55%,#ff6fd8);" +
        "-webkit-background-clip:text;background-clip:text;color:transparent}" +
      ".hpRot{position:relative;display:inline-block;min-width:5.6em;height:1.2em;" +
        "vertical-align:bottom;text-align:start}" +
      ".hpRot span{position:absolute;inset-inline-start:0;top:0;white-space:nowrap;opacity:0;" +
        "animation:hpRot 12s infinite}" +
      ".hpRot span:nth-child(2){animation-delay:3s}" +
      ".hpRot span:nth-child(3){animation-delay:6s}" +
      ".hpRot span:nth-child(4){animation-delay:9s}" +
      "@keyframes hpRot{0%,3%{opacity:0;transform:translateY(10px)}6%,22%{opacity:1;transform:none}" +
        "26%,100%{opacity:0;transform:translateY(-10px)}}" +
      ".hpLead{position:relative;margin:12px 0 0;max-width:520px;font-size:14px;line-height:2;" +
        "color:#c3caef}" +
      ".hpCta{position:relative;display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}" +
      ".hpCta .btn{min-width:auto}" +
      ".hpGhost{border:1px solid rgba(140,160,255,.28)!important;background:rgba(255,255,255,.04)!important}" +

      /* آمار */
      ".hpStats{position:relative;display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}" +
      ".hpStat{display:flex;align-items:center;gap:7px;padding:6px 11px;border-radius:12px;" +
        "background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.2);font-size:11.5px;color:#d8ddff}" +
      ".hpStat b{font-size:13px;color:#fff}" +
      ".hpStat i{font-style:normal;font-size:13px}" +

      /* کاشی‌ها */
      ".hpTiles{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:18px}" +
      "@media (max-width:620px){.hpTiles{grid-template-columns:repeat(2,1fr)}}" +
      ".hpTile{display:flex;align-items:center;gap:9px;padding:10px 11px;border-radius:14px;cursor:pointer;" +
        "border:1px solid rgba(140,160,255,.18);background:rgba(255,255,255,.045);" +
        "transition:transform .18s,border-color .18s,background .18s;min-width:0}" +
      ".hpTile:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.6);" +
        "background:rgba(124,92,255,.12)}" +
      ".hpTile i{font-style:normal;font-size:17px;filter:drop-shadow(0 0 10px rgba(124,92,255,.7))}" +
      ".hpTile .tx{min-width:0}" +
      ".hpTile b{display:block;font-size:12px;color:#eef1ff}" +
      ".hpTile span{display:block;font-size:10px;opacity:.62;white-space:nowrap;overflow:hidden;" +
        "text-overflow:ellipsis}" +

      /* هنر سمت راست */
      ".hpArt{position:relative;height:320px;display:grid;place-items:center}" +
      "@media (max-width:980px){.hpArt{height:280px}}" +
      ".hpRing{position:absolute;border-radius:50%;border:1px solid rgba(140,160,255,.28)}" +
      ".hpR1{width:260px;height:260px;animation:hpSpin 26s linear infinite;" +
        "border-style:dashed;border-color:rgba(124,92,255,.45)}" +
      ".hpR2{width:196px;height:196px;animation:hpSpin 18s linear infinite reverse;" +
        "border-color:rgba(34,211,238,.4)}" +
      ".hpR3{width:132px;height:132px;border-color:rgba(255,111,216,.4);" +
        "box-shadow:0 0 40px rgba(124,92,255,.35) inset}" +
      "@keyframes hpSpin{to{transform:rotate(360deg)}}" +
      ".hpOrb{position:absolute;width:104px;height:104px;border-radius:32px;display:grid;place-items:center;" +
        "font-size:44px;font-weight:900;color:#fff;background:linear-gradient(140deg,#7c5cff,#22d3ee);" +
        "box-shadow:0 20px 60px rgba(124,92,255,.55);transform:rotate(-8deg);animation:hpFloat 6s ease-in-out infinite}" +
      "@keyframes hpFloat{50%{transform:rotate(-3deg) translateY(-9px)}}" +
      ".hpOrbDot{position:absolute;width:9px;height:9px;border-radius:50%;background:#8ef2ff;" +
        "box-shadow:0 0 14px #8ef2ff;animation:hpOrbit 9s linear infinite}" +
      ".hpOrbDot.b{background:#ff9ee8;box-shadow:0 0 14px #ff9ee8;animation-duration:13s;animation-direction:reverse}" +
      "@keyframes hpOrbit{0%{transform:rotate(0) translateX(128px) rotate(0)}" +
        "100%{transform:rotate(360deg) translateX(128px) rotate(-360deg)}}" +
      ".hpTag{position:absolute;padding:5px 10px;border-radius:99px;font-size:10.5px;color:#eaf0ff;" +
        "background:rgba(10,14,32,.72);border:1px solid rgba(140,160,255,.3);" +
        "box-shadow:0 8px 24px rgba(0,0,0,.45);animation:hpFloat 7s ease-in-out infinite}" +
      ".hpTag.a{top:16px;inset-inline-start:4%}" +
      ".hpTag.b{bottom:34px;inset-inline-end:2%;animation-delay:1.4s}" +
      ".hpTag.c{top:44%;inset-inline-start:-2%;animation-delay:2.6s}" +

      /* تیکر و فلش */
      ".hpTicker{position:relative;z-index:2;border-top:1px solid rgba(140,160,255,.16);" +
        "padding:9px 18px;font-size:11px;letter-spacing:.4px;color:#aab3e0;" +
        "display:flex;align-items:center;gap:10px;overflow:hidden;background:rgba(6,9,22,.5)}" +
      ".hpTicker .run{display:inline-block;white-space:nowrap;animation:hpRun 18s linear infinite}" +
      "@keyframes hpRun{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
      ".hpCue{position:absolute;inset-inline-end:18px;bottom:44px;z-index:3;font-size:10.5px;" +
        "color:#aeb7e2;display:flex;align-items:center;gap:5px;opacity:.8}" +
      ".hpCue b{display:inline-block;width:14px;height:14px;border-inline-end:2px solid #8ef2ff;" +
        "border-bottom:2px solid #8ef2ff;transform:rotate(45deg);animation:hpCue 1.8s infinite}" +
      "@keyframes hpCue{50%{transform:rotate(45deg) translate(3px,3px);opacity:.5}}" +

      /* کم‌مصرف و کاهش حرکت */
      "html.lite .hp *,html.lite .hp *::before,html.lite .hp *::after{animation:none!important}" +
      "@media (prefers-reduced-motion:reduce){.hp *,.hp *::before,.hp *::after{animation:none!important}" +
        ".hpRot span{position:relative;opacity:1;display:none}.hpRot span:first-child{display:inline}}";
    document.head.appendChild(s);
  }

  /* ── ۳. قطعه‌ها ─────────────────────────────────────────── */
  function tileHTML(go, ic, label, desc) {
    return '<div class="hpTile" role="button" tabindex="0" data-hp-go="' + go + '">' +
      "<i>" + ic + "</i>" +
      '<div class="tx"><b>' + esc(label) + "</b><span>" + esc(desc) + "</span></div></div>";
  }

  function statsHTML() {
    var on = count(R.ONLINE), us = count(R.USERS), ps = count(R.POSTS);
    var pr = 0;
    try {
      var U = R.USERS || {};
      Object.keys(U).forEach(function (k) { if (U[k] && U[k].prem) pr++; });
    } catch (e) {}
    return '<div class="hpStats">' +
      '<div class="hpStat"><i>🟢</i><b data-hp-online>' + num(on) + "</b><span>" + esc(t("online")) + "</span></div>" +
      '<div class="hpStat"><i>👥</i><b data-hp-users>' + num(us) + "</b><span>" + esc(t("users")) + "</span></div>" +
      '<div class="hpStat"><i>📝</i><b data-hp-posts>' + num(ps) + "</b><span>" + esc(t("posts")) + "</span></div>" +
      '<div class="hpStat"><i>💎</i><b data-hp-prem>' + num(pr) + "</b><span>" + esc(t("prem")) + "</span></div>" +
      "</div>";
  }

  function inner() {
    return '<div class="hp">' +
      '<div class="hpAur"></div><div class="hpGrid"></div>' +
      '<div class="hpIn">' +
        '<div class="hpCopy">' +
          '<span class="hpEye"><span class="hpDot"></span>' + esc(t("eyebrow")) +
            " · <span data-ver>" + esc((R.SITE && R.SITE.ver) || "V19") + "</span></span>" +
          '<h1 class="hpH1">' + esc(t("h1a")) + " " +
            '<span class="hpGrad hpRot">' +
              "<span>" + esc(t("rot1")) + "</span>" +
              "<span>" + esc(t("rot2")) + "</span>" +
              "<span>" + esc(t("rot3")) + "</span>" +
              "<span>" + esc(t("rot4")) + "</span>" +
            "</span> " + esc(t("h1b")) + "</h1>" +
          '<p class="hpLead">' + esc(t("lead")) + "</p>" +
          '<div class="hpCta">' +
            '<button class="btn p" type="button" data-hp-go="community">🚀 ' + esc(t("cta1")) + "</button>" +
            '<button class="btn" type="button" data-hp-go="bulletin">🎬 ' + esc(t("cta2")) + "</button>" +
            '<button class="btn hpGhost" type="button" data-hp-go="market">🛒 ' + esc(t("cta3")) + "</button>" +
          "</div>" +
          statsHTML() +
          '<div class="hpTiles">' +
            tileHTML("market", "🛒", t("qMarket"), t("qMarketD")) +
            tileHTML("community", "👥", t("qComm"), t("qCommD")) +
            tileHTML("chat", "💬", t("qChat"), t("qChatD")) +
            tileHTML("premium", "💎", t("qPrem"), t("qPremD")) +
          "</div>" +
        "</div>" +
        '<div class="hpArt" aria-hidden="true">' +
          '<div class="hpRing hpR1"></div><div class="hpRing hpR2"></div><div class="hpRing hpR3"></div>' +
          '<span class="hpOrbDot"></span><span class="hpOrbDot b"></span>' +
          '<div class="hpOrb">忍</div>' +
          '<span class="hpTag a">' + esc(t("tagAnime")) + "</span>" +
          '<span class="hpTag b">' + esc(t("tagNews")) + "</span>" +
          '<span class="hpTag c">' + esc(t("tagAds")) + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="hpCue"><b></b>' + esc(t("scroll")) + "</div>" +
      '<div class="hpTicker"><span class="run">' +
        esc(t("ticker")) + " &nbsp;·&nbsp; " + esc(t("ticker")) +
      "</span></div>" +
    "</div>";
  }

  /* ── ۴. رندر ────────────────────────────────────────────── */
  function hero() { return document.querySelector(ROOT); }

  function render() {
    var h = hero();
    if (!h) return false;
    css();
    h.classList.add("hp");
    h.setAttribute("data-noi18n", "");
    var old = h.querySelector(".hp");
    if (old) { sync(); return true; }        /* از قبل ساخته شده */
    h.innerHTML = inner();
    lastLang = langq();
    updateStats();
    return true;
  }

  function sync() {
    var h = hero();
    if (!h) return;
    if (!h.querySelector(".hp")) { render(); return; }
    if (langq() !== lastLang) { h.innerHTML = inner(); lastLang = langq(); }
    else updateStats();
  }

  function updateStats() {
    var h = hero();
    if (!h) return;
    var on = h.querySelector("[data-hp-online]");
    var us = h.querySelector("[data-hp-users]");
    var ps = h.querySelector("[data-hp-posts]");
    var pr = h.querySelector("[data-hp-prem]");
    if (on) on.textContent = num(count(R.ONLINE));
    if (us) us.textContent = num(count(R.USERS));
    if (ps) ps.textContent = num(count(R.POSTS));
    if (pr) {
      var n = 0, U = R.USERS || {};
      Object.keys(U).forEach(function (k) { if (U[k] && U[k].prem) n++; });
      pr.textContent = num(n);
    }
    var v = h.querySelector("[data-ver]");
    if (v && R.SITE && R.SITE.ver && v.textContent !== String(R.SITE.ver)) v.textContent = R.SITE.ver;
  }

  /* ── ۵. کلیک و کیبورد ───────────────────────────────────── */
  function goTo(name) {
    if (!name) return;
    if (R.go) R.go(name);
    else toast(name, "info");
  }

  document.addEventListener("click", function (e) {
    var t0 = e.target;
    if (!t0 || !t0.closest || !t0.closest(ROOT)) return;
    var b = t0.closest("[data-hp-go]");
    if (!b) return;
    e.preventDefault();
    goTo(b.getAttribute("data-hp-go"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var t0 = e.target;
    if (!t0 || !t0.closest || !t0.classList || !t0.classList.contains("hpTile")) return;
    e.preventDefault();
    goTo(t0.getAttribute("data-hp-go"));
  });

  /* ── ۶. هم‌گام با زبان و داده ───────────────────────────── */
  function hookI18n() {
    if (!R.i18n || !R.i18n.set || R.i18n.set.__hp) return;
    var orig = R.i18n.set;
    var wrapped = function () {
      var out = orig.apply(R.i18n, arguments);
      try { render(); } catch (e) {}
      return out;
    };
    wrapped.__hp = true;
    R.i18n.set = wrapped;
  }

  function boot() {
    render();
    hookI18n();
    if (!timer) {
      timer = setInterval(function () {
        try { sync(); } catch (e) {}
      }, 1800);
    }
  }

  /* راه‌اندازی + پشتیبانی از رندر دوبارهٔ صفحه */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1600, 3000, 5200].forEach(function (ms) { setTimeout(boot, ms); });

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(boot, 600);
  };

  /* API برای تست */
  R.heroPlus = { render: render, sync: sync, inner: inner, t: t };
})();
