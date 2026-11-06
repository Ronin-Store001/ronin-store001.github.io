/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OWNER HUB v3 «NEO COMMAND»  ·  owner-hub.js
   پنل مالک یکپارچه: چیدمان تازه + همهٔ تَب‌ها + همهٔ بخش‌های سایت
   ───────────────────────────────────────────────────────────────
   جای ۶-owner.js را می‌گیرد (آن فایل از index.html حذف شد).
   آمار، کاربران و دسترسی‌ها، تایید محتوا، آگهی‌ها، سفارش‌ها،
   گزارش‌ها، تنظیمات و نگهداری — همه یک‌جا و همه کار می‌کنند.
   تَب «نگهداری» اگر owner-plus.js باشد به همان سپرده می‌شود.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__oh) return;
  R.__oh = true;

  var BASE = R.renderOwner;            /* رندر قبلی (owner-plus → تَب نگهداری) */

  /* ── ۱. فهرست بخش‌ها: [آیکون، نام، توضیح کوتاه] ────────── */
  var LABEL = {
    home: ["🏠", "خانه", "بنر، پیشنهاد ویژه و تازه‌ها"],
    bulletin: ["📣", "اطلاعیه", "خبر، تریلر، اعلان پخش"],
    discover: ["🧭", "کشف", "محتوای تازه و پیشنهادی"],
    rank: ["🏆", "رتبه‌بندی", "جدول برترین اعضا"],
    events: ["📅", "رویدادها", "مسابقه و برنامه‌ها"],
    community: ["👥", "انجمن", "پست، لایک، کامنت"],
    chat: ["💬", "چت عمومی", "گفتگوی زندهٔ همه"],
    groups: ["🏯", "گروه‌ها", "چت خصوصی دسته‌جمعی"],
    dm: ["📥", "پیام‌ها", "پیام مستقیم بین اعضا"],
    users: ["👤", "اعضا", "فهرست کاربران سایت"],
    team: ["🛡", "شبکه فرماندهی", "مدیران و دسترسی‌ها"],
    market: ["🛒", "فروشگاه", "خرید و آگهی کالا"],
    ads: ["📢", "تبلیغات", "ساخت و مدیریت آگهی"],
    premium: ["💎", "پرمیوم", "اشتراک و ویژگی ویژه"],
    profile: ["👤", "پروفایل", "صفحه و تنظیمات من"],
    myworld: ["🧭", "دنیای من", "مجموعهٔ شخصی من"],
    archive: ["🥷", "آرشیو", "همراه و آرشیو محتوا"],
    settings: ["⚙", "تنظیمات", "حساب، تم و زبان"],
    owner: ["👑", "پنل مالک", "همین پنل — بازخوانی"]
  };
  var GROUPS = [
    { t: "🏠 خانه و کشف", k: ["home", "bulletin", "discover", "rank", "events"] },
    { t: "👥 جامعه", k: ["community", "chat", "groups", "dm", "users", "team"] },
    { t: "🛒 بازار", k: ["market", "ads", "premium"] },
    { t: "👤 حساب و مدیریت", k: ["profile", "myworld", "archive", "settings", "owner"] }
  ];
  var TOOLS = [
    { k: "overview", ic: "📊", n: "نمای کلی", d: "کارهای مانده، رشد، تازه‌واردها" },
    { k: "users", ic: "👥", n: "کاربران", d: "نقش، دسترسی، پرمیوم، مسدودی" },
    { k: "mod", ic: "✅", n: "تایید محتوا", d: "پست‌های در انتظار انتشار" },
    { k: "ads", ic: "📢", n: "آگهی‌ها", d: "تایید یا رد آگهی‌ها" },
    { k: "orders", ic: "📦", n: "سفارش‌ها", d: "سفارش جدید و تحویل‌شده" },
    { k: "reports", ic: "🚩", n: "گزارش‌ها", d: "گزارش پست و پیام" },
    { k: "settings", ic: "⚙", n: "تنظیمات", d: "اعلان سراسری و هویت مالک" },
    { k: "maint", ic: "🛠", n: "نگهداری", d: "پاک‌سازی، اعلان گروهی، بنر" }
  ];
  var TABIC = { overview: "📊", users: "👥", mod: "✅", ads: "📢", orders: "📦", reports: "🚩", settings: "⚙", maint: "🛠" };

  function el(i) { return document.getElementById(i); }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function sec(name) { return document.getElementById("sec-" + name); }
  function isOwner() { try { return !!R.isOwner(); } catch (e) { return false; } }
  function q(s, root) { return (root || document).querySelector(s); }
  function qa(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }

  /* ── ۲. استایل — فقط داخل #sec-owner ────────────────────── */
  function css() {
    if (el("ohCss")) return;
    var s = document.createElement("style");
    s.id = "ohCss";
    s.textContent =
      "#sec-owner>.head{display:none!important}" +
      "#ohTop{margin-bottom:16px}" +
      "#ohTop *{box-sizing:border-box}" +

      /* ── هیرو ── */
      ".ohHero{position:relative;overflow:hidden;isolation:isolate;border-radius:26px;padding:20px 18px 16px;" +
      "color:#eef1ff;border:1px solid rgba(140,160,255,.22);" +
      "background:radial-gradient(120% 90% at 100% 0%,rgba(255,92,210,.26),transparent 62%)," +
      "radial-gradient(110% 80% at 0% 0%,rgba(34,211,238,.2),transparent 58%)," +
      "linear-gradient(145deg,#171b3d,#0c0f24 58%,#141a38);" +
      "box-shadow:0 26px 60px -34px rgba(124,92,255,.85),inset 0 1px 0 rgba(255,255,255,.07)}" +
      ".ohHero::before{content:'';position:absolute;inset:-45%;z-index:-1;opacity:.5;" +
      "background:conic-gradient(from 0deg,rgba(124,92,255,.55),rgba(34,211,238,.35)," +
      "rgba(255,92,210,.5),rgba(124,92,255,.55));filter:blur(60px);animation:ohAura 22s linear infinite}" +
      "@keyframes ohAura{to{transform:rotate(1turn)}}" +
      "@media (prefers-reduced-motion:reduce){.ohHero::before{animation:none}}" +
      ".ohHero .glow{position:absolute;inset:0;pointer-events:none;opacity:.55;" +
      "background-image:linear-gradient(rgba(140,160,255,.08) 1px,transparent 1px)," +
      "linear-gradient(90deg,rgba(140,160,255,.08) 1px,transparent 1px);background-size:28px 28px;" +
      "-webkit-mask-image:radial-gradient(120% 100% at 50% 0%,#000 15%,transparent 78%);" +
      "mask-image:radial-gradient(120% 100% at 50% 0%,#000 15%,transparent 78%)}" +
      ".ohHrow{position:relative;z-index:2;display:flex;align-items:center;gap:13px;flex-wrap:wrap}" +
      ".ohCrown{position:relative;flex:0 0 auto;width:52px;height:52px;border-radius:18px;display:grid;" +
      "place-items:center;font-size:24px;background:linear-gradient(140deg,#8b6bff,#22d3ee);" +
      "box-shadow:0 16px 34px -10px rgba(124,92,255,.95)}" +
      ".ohCrown::after{content:'';position:absolute;inset:0;border-radius:inherit;" +
      "border:2px solid rgba(34,211,238,.55);animation:ohRing 2.8s ease-out infinite}" +
      "@keyframes ohRing{0%{transform:scale(1);opacity:.75}70%,100%{transform:scale(1.55);opacity:0}}" +
      ".ohHt{margin:0;font-size:19px;font-weight:900;line-height:1.5;letter-spacing:-.2px;" +
      "background:linear-gradient(100deg,#ffffff,#d3dbff 48%,#9fe8ff);" +
      "-webkit-background-clip:text;background-clip:text;color:transparent}" +
      ".ohHs{font-size:11px;color:#c3ccf7;margin-top:3px}" +
      ".ohPill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:99px;" +
      "font-size:10.5px;font-weight:700;color:#dbe3ff;background:rgba(9,13,30,.5);" +
      "border:1px solid rgba(140,160,255,.3);backdrop-filter:blur(6px)}" +
      ".ohPill .d{width:6px;height:6px;border-radius:50%;background:#5df0b0;" +
      "box-shadow:0 0 9px #5df0b0;animation:ohBeat 2s ease-in-out infinite}" +
      "@keyframes ohBeat{50%{opacity:.35;transform:scale(.8)}}" +
      ".ohPill b{color:#fff;font-weight:900}" +

      /* ── KPI ── */
      ".ohKpis{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));" +
      "gap:8px;margin-top:16px}" +
      ".ohK{display:flex;align-items:center;gap:9px;min-width:0;border-radius:15px;padding:9px 10px;" +
      "background:rgba(6,9,22,.5);border:1px solid rgba(140,160,255,.18);" +
      "transition:transform .18s,border-color .18s}" +
      ".ohK:hover{transform:translateY(-2px);border-color:rgba(124,92,255,.5)}" +
      ".ohK i{flex:0 0 auto;width:27px;height:27px;border-radius:9px;display:grid;place-items:center;" +
      "font-style:normal;font-size:13px;background:rgba(255,255,255,.07);border:1px solid rgba(140,160,255,.18)}" +
      ".ohK .kb{min-width:0}" +
      ".ohK .n{font-weight:900;font-size:17px;line-height:1.15;color:#fff}" +
      ".ohK .l{font-size:10px;color:#a7b1dc;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".ohK.warn .n{color:#ffd479}.ohK.bad .n{color:#ff9a9a}.ohK.ok .n{color:#8ef2cc}" +
      ".ohK.warn i{background:rgba(255,212,121,.14);border-color:rgba(255,212,121,.4)}" +
      ".ohK.bad i{background:rgba(255,154,154,.14);border-color:rgba(255,154,154,.4)}" +

      /* ── جعبه‌ها ── */
      ".ohBox{margin-top:12px;border-radius:20px;padding:13px 12px 11px;background:rgba(255,255,255,.035);" +
      "border:1px solid rgba(140,160,255,.14)}" +
      ".ohBH{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}" +
      ".ohBH h3{margin:0;font-size:12.5px;font-weight:900;color:#eef1ff;letter-spacing:.2px}" +
      ".ohBH .sm{font-size:10px;color:#8f9ac9}" +
      ".ohGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(162px,1fr));gap:8px}" +
      ".ohT{position:relative;display:flex;align-items:flex-start;gap:9px;min-width:0;padding:9px 10px;" +
      "border-radius:14px;cursor:pointer;color:#e6eaff;font-family:inherit;font-size:11.5px;font-weight:700;" +
      "text-align:start;background:rgba(255,255,255,.045);border:1px solid rgba(140,160,255,.16);" +
      "transition:transform .18s,border-color .18s,background .18s,box-shadow .18s}" +
      ".ohT:hover,.ohT:focus-visible{transform:translateY(-3px);outline:none;color:#fff;" +
      "background:rgba(124,92,255,.18);border-color:rgba(124,92,255,.6);" +
      "box-shadow:0 18px 32px -22px rgba(124,92,255,1)}" +
      ".ohT>i{flex:0 0 auto;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;" +
      "font-style:normal;font-size:15px;background:linear-gradient(140deg,rgba(124,92,255,.38),rgba(34,211,238,.24));" +
      "border:1px solid rgba(140,160,255,.28)}" +
      ".ohT .tx{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto}" +
      ".ohT .tx b{font-size:11.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".ohT .tx small{font-size:9.5px;font-weight:600;line-height:1.55;color:#8f9ac9;" +
      "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".ohT:hover .tx small,.ohT:focus-visible .tx small{color:#b9c2ec}" +
      ".ohT .ohBd{flex:0 0 auto;align-self:center;font-size:9px;font-weight:900;padding:1px 6px;" +
      "border-radius:99px;background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}" +
      ".ohT.on{border-color:rgba(34,211,238,.7);background:rgba(34,211,238,.16);" +
      "box-shadow:0 0 0 1px rgba(34,211,238,.25) inset,0 16px 30px -24px #22d3ee}" +
      ".ohT.own{border-color:rgba(255,111,216,.55);background:rgba(255,111,216,.1)}" +
      ".ohGH{display:flex;align-items:center;gap:8px;margin:12px 2px 7px;font-size:10.5px;" +
      "font-weight:800;color:#a9b3e0}" +
      ".ohGH::after{content:'';flex:1;height:1px;" +
      "background:linear-gradient(90deg,rgba(140,160,255,.4),transparent)}" +
      "@media (max-width:520px){.ohGrid{grid-template-columns:repeat(2,minmax(0,1fr))}" +
      ".ohHt{font-size:16px}.ohCrown{width:46px;height:46px;font-size:21px}" +
      ".ohKpis{grid-template-columns:repeat(2,minmax(0,1fr))}}" +

      /* ── تَب‌ها ── */
      "#sec-owner .tabs{position:sticky;top:0;z-index:9;display:flex;gap:6px;overflow-x:auto;" +
      "padding:8px;margin-bottom:14px;border-radius:18px;-webkit-overflow-scrolling:touch;" +
      "background:rgba(8,11,26,.9);backdrop-filter:blur(12px);" +
      "border:1px solid rgba(140,160,255,.16);scrollbar-width:none;" +
      "box-shadow:0 14px 30px -28px #000}" +
      "#sec-owner .tabs::-webkit-scrollbar{display:none}" +
      "#sec-owner .tabs .tab{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;cursor:pointer;" +
      "padding:7px 13px;border-radius:99px;font-size:11.5px;font-weight:800;color:#b9c1ea;" +
      "border:1px solid rgba(140,160,255,.18);background:rgba(255,255,255,.04);transition:.18s}" +
      "#sec-owner .tabs .tab .ti{font-style:normal;font-size:13px;line-height:1}" +
      "#sec-owner .tabs .tab:hover{color:#fff;background:rgba(124,92,255,.18);" +
      "border-color:rgba(124,92,255,.45);transform:translateY(-1px)}" +
      "#sec-owner .tabs .tab.on{color:#fff;border-color:transparent;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);" +
      "box-shadow:0 10px 24px -12px rgba(124,92,255,.95)}" +
      "#sec-owner .tabs .ohBd{font-size:9px;font-weight:900;padding:0 5px;border-radius:99px;" +
      "background:rgba(6,9,22,.45);color:#fff}" +
      "#sec-owner .tabs .tab.on .ohBd{background:rgba(0,0,0,.3)}" +

      /* ── بدنه ── */
      "#ownerBody{display:grid;gap:12px}" +
      "#ownerBody>.card{margin-bottom:0;border-radius:18px!important;" +
      "background:rgba(255,255,255,.04)!important;border:1px solid rgba(140,160,255,.16)!important;" +
      "box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}" +
      "#ownerBody>.card:hover{border-color:rgba(124,92,255,.32)!important}" +
      "#ownerBody .grid.auto{gap:8px}" +
      "#ownerBody .kpi{border-radius:14px!important;padding:10px 12px!important;" +
      "background:linear-gradient(135deg,rgba(124,92,255,.2),rgba(34,211,238,.1))!important;" +
      "border:1px solid rgba(140,160,255,.22)!important}" +
      "#ownerBody .kpi .n{font-size:19px!important;font-weight:900}" +
      "#ownerBody .btn.mini{border-radius:11px;font-weight:700}" +
      "#ownerBody .inp{border-radius:12px}" +
      "#ownerBody .empty{padding:20px 10px}" +
      "#ownerBody .pbody{background:rgba(6,9,22,.35);border-radius:12px;padding:10px 12px;" +
      "border:1px solid rgba(140,160,255,.12)}" +
      "#ownerBody .chart{display:flex;align-items:flex-end;gap:7px;height:104px;padding:6px 2px}" +
      "#ownerBody .chart i{flex:1 1 0;border-radius:8px 8px 4px 4px;min-height:7px;" +
      "background:linear-gradient(180deg,#22d3ee,#7c5cff);" +
      "box-shadow:0 0 14px -4px rgba(34,211,238,.85)}" +
      "#ownerBody .ohGo{display:grid;grid-template-columns:repeat(auto-fit,minmax(134px,1fr));gap:8px}" +
      "#ownerBody .ohGoB{display:flex;align-items:center;gap:8px;padding:10px 11px;border-radius:14px;" +
      "cursor:pointer;font-family:inherit;font-size:11.5px;font-weight:800;color:#e9edff;" +
      "background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.2);transition:.18s}" +
      "#ownerBody .ohGoB:hover{background:rgba(124,92,255,.18);border-color:rgba(124,92,255,.55);" +
      "transform:translateY(-2px)}" +
      "#ownerBody .ohGoB i{font-style:normal;font-size:14px}" +
      "#ownerBody .ohGoB b{margin-inline-start:auto;font-size:10px;font-weight:900;padding:1px 7px;" +
      "border-radius:99px;background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}";
    document.head.appendChild(s);
  }

  /* ── ۳. عددها ───────────────────────────────────────────── */
  function nums() {
    var s = {};
    try { s = R.stats ? (R.stats() || {}) : {}; } catch (e) { s = {}; }
    return {
      users: s.users || 0, online: s.online || 0, prem: s.prem || 0,
      posts: s.posts || 0, prods: s.prods || 0, pendA: s.pendA || 0,
      orders: s.orders || 0, newOrd: s.newOrd || 0,
      reps: s.reps || 0, newRep: s.newRep || 0, pend: s.pend || 0
    };
  }
  function who() {
    try {
      var U = (R.USERS || {})[R.ME] || {};
      return U.name || (R.USER && R.USER.name) || "مالک رونین";
    } catch (e) { return "مالک رونین"; }
  }
  function live() {
    var out = {};
    Object.keys(LABEL).forEach(function (k) { if (sec(k)) out[k] = 1; });
    return out;
  }
  function badge(k, n) {
    if (!n) return 0;
    if (k === "users") return n.users;
    if (k === "mod") return n.pend;
    if (k === "ads") return n.pendA;
    if (k === "orders") return n.newOrd;
    if (k === "reports") return n.newRep;
    return 0;
  }

  /* ── ۴. سرصفحه ──────────────────────────────────────────── */
  function topHTML(have) {
    var n = nums();
    function kpi(ic, v, l, cls) {
      return '<div class="ohK' + (cls ? " " + cls : "") + '"><i>' + ic + '</i><div class="kb">' +
        '<div class="n">' + fa(v) + '</div><div class="l">' + esc(l) + "</div></div></div>";
    }
    var h = '<div class="ohHero"><span class="glow"></span><div class="ohHrow">' +
      '<div class="ohCrown">👑</div>' +
      '<div class="grow" style="min-width:0"><h2 class="ohHt">مرکز فرماندهی رونین</h2>' +
        '<div class="ohHs">' + esc(who()) + ' · دسترسی کامل به همهٔ بخش‌ها</div></div>' +
      '<span class="ohPill"><span class="d"></span>آنلاین · <b>' + fa(n.online) + "</b></span>" +
      '<span class="ohPill">🛡 نقش <b>مالک</b></span>' +
      (R.ME ? '<span class="ohPill">🆔 <b dir="ltr">' + esc(String(R.ME).slice(0, 8)) + "</b></span>" : "") +
      "</div>" +
      '<div class="ohKpis">' +
        kpi("👥", n.users, "کاربر") +
        kpi("🟢", n.online, "آنلاین", "ok") +
        kpi("💎", n.prem, "پرمیوم") +
        kpi("📝", n.posts, "پست") +
        kpi("🏷", n.prods, "آگهی فعال") +
        kpi("⏳", n.pend + n.pendA, "در انتظار تایید", (n.pend + n.pendA) ? "warn" : "") +
        kpi("📦", n.newOrd, "سفارش جدید", n.newOrd ? "warn" : "") +
        kpi("🚩", n.newRep, "گزارش باز", n.newRep ? "bad" : "ok") +
      "</div></div>";

    h += '<div class="ohBox"><div class="ohBH"><h3>🛠 ابزارهای مالک</h3>' +
      '<span class="sm">بدون خروج از پنل</span></div><div class="ohGrid">' +
      TOOLS.map(function (t) {
        var b = badge(t.k, n);
        return '<button class="ohT' + (R.ownerTab === t.k ? " on" : "") + '" type="button" ' +
          'data-oh-tab="' + t.k + '" title="' + esc(t.n) + " — " + esc(t.d) + '">' +
          "<i>" + t.ic + '</i><span class="tx"><b>' + esc(t.n) + "</b><small>" + esc(t.d) +
          "</small></span>" + (b ? '<b class="ohBd">' + fa(b) + "</b>" : "") + "</button>";
      }).join("") + "</div></div>";

    h += '<div class="ohBox"><div class="ohBH"><h3>🧭 دسترسی به همهٔ بخش‌ها</h3>' +
      '<span class="sm">' + fa(Object.keys(have).length) + " مقصد فعال</span></div>";
    GROUPS.forEach(function (g) {
      var ks = g.k.filter(function (k) { return have[k]; });
      if (!ks.length) return;
      h += '<div class="ohGH">' + esc(g.t) + "</div><div class=\"ohGrid\">" +
        ks.map(function (k) {
          var L = LABEL[k];
          return '<button class="ohT' + (k === "owner" ? " own" : "") + '" type="button" ' +
            'data-oh-go="' + k + '" title="' + esc(L[1]) + " — " + esc(L[2]) + '">' +
            "<i>" + L[0] + '</i><span class="tx"><b>' + esc(L[1]) + "</b><small>" +
            esc(L[2]) + "</small></span></button>";
        }).join("") + "</div>";
    });
    h += "</div>";
    return h;
  }

  var lastSig = "";
  function mount() {
    var s = sec("owner");
    if (!s) return false;
    css();
    var head = q(":scope > .head", s);
    if (head) head.style.display = "none";
    var have = live();
    var sig = Object.keys(have).sort().join(",") + "|" + R.ownerTab;
    var top = el("ohTop");
    if (!top) {
      top = document.createElement("div");
      top.id = "ohTop";
      top.setAttribute("data-noi18n", "");
      var tabs = q(":scope > .tabs", s);
      if (tabs && tabs.parentNode === s) s.insertBefore(top, tabs);
      else s.insertBefore(top, s.firstChild);
      lastSig = "";
    }
    if (lastSig !== sig || top.getAttribute("data-h") !== "1") {
      top.innerHTML = topHTML(have);
      top.setAttribute("data-h", "1");
      lastSig = sig;
    }
    paintKpis();
    tabIcons();
    return true;
  }

  function paintKpis() {
    var top = el("ohTop");
    if (!top) return;
    var boxes = qa(".ohKpis .ohK", top);
    if (!boxes.length) return;
    var n = nums();
    var vals = [n.users, n.online, n.prem, n.posts, n.prods, n.pend + n.pendA, n.newOrd, n.newRep];
    for (var i = 0; i < boxes.length && i < vals.length; i++) {
      var e = q(".n", boxes[i]);
      var v = fa(vals[i]);
      if (e && e.textContent !== v) e.textContent = v;
    }
  }

  function tabIcons() {
    var s = sec("owner");
    if (!s) return;
    qa(".tabs .tab", s).forEach(function (t) {
      if (q(".ti", t)) return;
      var ic = TABIC[t.getAttribute("data-otab")];
      if (!ic) return;
      var i = document.createElement("i");
      i.className = "ti";
      i.textContent = ic;
      t.insertBefore(i, t.firstChild);
    });
  }

  function tabBadges() {
    var s = sec("owner");
    if (!s) return;
    var n = nums();
    qa(".tabs .tab", s).forEach(function (t) {
      var k = t.getAttribute("data-otab");
      var v = badge(k, n);
      var b = q(".ohBd", t);
      if (!v) { if (b) b.remove(); return; }
      if (!b) {
        b = document.createElement("b");
        b.className = "ohBd";
        t.appendChild(b);
      }
      var txt = fa(v);
      if (b.textContent !== txt) b.textContent = txt;
    });
  }

  function syncTools() {
    var top = el("ohTop");
    if (!top) return;
    qa("[data-oh-tab]", top).forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-oh-tab") === R.ownerTab);
    });
  }

  function decorate() {
    if (!isOwner()) return;
    try { mount(); paintKpis(); tabIcons(); tabBadges(); syncTools(); } catch (e) {}
  }

  /* ── ۵. رفتن به بخش‌ها ─────────────────────────────────── */
  function goTo(name) {
    if (!name || !sec(name)) {
      if (R.toast) R.toast("این بخش هنوز ساخته نشده", "info");
      return;
    }
    if (R.go) R.go(name);
    else if (R.toast) R.toast(name, "info");
  }

  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest) return;

    if (x.closest("#ohTop") && isOwner()) {
      var g = x.closest("[data-oh-go]");
      if (g) { e.preventDefault(); return goTo(g.getAttribute("data-oh-go")); }
      var t = x.closest("[data-oh-tab]");
      if (t) {
        e.preventDefault();
        var k = t.getAttribute("data-oh-tab");
        var tab = q('#sec-owner .tabs .tab[data-otab="' + k + '"]');
        if (tab) { tab.click(); return; }
        R.ownerTab = k;
        R.renderOwner();
        return;
      }
    }
    /* کاشی‌های میان‌بر داخل بدنه */
    if (x.closest("#ownerBody") && isOwner()) {
      var j = x.closest("[data-oh-jump]");
      if (j) { e.preventDefault(); return goTo(j.getAttribute("data-oh-jump")); }
    }
    if (x.closest('[data-go="owner"]')) setTimeout(decorate, 60);
  });

  /* ═══════════════════ ۶. داده‌ها و تَب‌ها ═══════════════════ */
  R.USERS = R.USERS || {}; R.PENDING = R.PENDING || {};
  R.ORDERS = R.ORDERS || {}; R.REPORTS = R.REPORTS || {};
  if (!R.ownerTab) R.ownerTab = "overview";
  R.uq = R.uq || "";

  R.stats = function () {
    var posts = R.POSTS || {}, likes = 0, cmts = 0;
    Object.keys(posts).forEach(function (k) {
      var p = posts[k] || {};
      likes += p.lk ? Object.keys(p.lk).length : 0;
      cmts += p.cm ? Object.keys(p.cm).length : 0;
    });
    var U = R.USERS || {}, users = Object.keys(U).length, prem = 0, banned = 0;
    Object.keys(U).forEach(function (k) {
      var u = U[k] || {};
      if (u.prem) prem++;
      if (u.banned) banned++;
    });
    var prods = R.PRODS || {}, liveN = 0, pendA = 0;
    Object.keys(prods).forEach(function (k) {
      var p = prods[k] || {};
      if (R.isLive && R.isLive(p)) liveN++;
      else if (p.st === "pending") pendA++;
    });
    var ord = R.ORDERS || {}, newOrd = 0;
    Object.keys(ord).forEach(function (k) { if ((ord[k] || {}).st === "new") newOrd++; });
    var rep = R.REPORTS || {}, newRep = 0;
    Object.keys(rep).forEach(function (k) { if ((rep[k] || {}).st !== "done") newRep++; });
    return {
      users: users, prem: prem, banned: banned, online: Object.keys(R.ONLINE || {}).length,
      posts: Object.keys(posts).length, likes: likes, cmts: cmts,
      prods: liveN, pendA: pendA, orders: Object.keys(ord).length, newOrd: newOrd,
      reps: Object.keys(rep).length, newRep: newRep,
      pend: Object.keys(R.PENDING || {}).length
    };
  };

  /* ── ۷. نمودار ۷ روزه ──────────────────────────────────── */
  function chartHTML() {
    var days = [], now = Date.now(), i;
    for (i = 6; i >= 0; i--) days.push({ k: new Date(now - i * 86400000).toISOString().slice(0, 10), n: 0 });
    Object.keys(R.USERS || {}).forEach(function (k) {
      var j = (R.USERS[k] || {}).joined;
      if (!j) return;
      var d = new Date(j).toISOString().slice(0, 10);
      for (var x = 0; x < days.length; x++) if (days[x].k === d) days[x].n++;
    });
    var mx = 1;
    days.forEach(function (d) { if (d.n > mx) mx = d.n; });
    var h = '<div class="chart">';
    days.forEach(function (d) {
      h += '<i style="height:' + Math.max(6, Math.round(d.n * 100 / mx)) + '" title="' + d.n + '"></i>';
    });
    return h + '</div><div class="xs mut center">کاربران جدید در ۷ روز گذشته</div>';
  }

  /* ── ۸. HTML تَب‌ها ────────────────────────────────────── */
  function ovHTML() {
    var s = R.stats();
    var todo = [];
    if (s.pend) todo.push(["mod", "✅", "پست در انتظار تایید", s.pend]);
    if (s.pendA) todo.push(["ads", "📢", "آگهی در انتظار", s.pendA]);
    if (s.newOrd) todo.push(["orders", "📦", "سفارش جدید", s.newOrd]);
    if (s.newRep) todo.push(["reports", "🚩", "گزارش باز", s.newRep]);

    var h = "";
    if (todo.length) {
      h += '<div class="card"><div class="sm b mb">⏳ کارهای مانده</div><div class="ohGo">' +
        todo.map(function (x) {
          return '<button class="ohGoB" type="button" data-oh-jump="' + x[0] + '"><i>' + x[1] +
            "</i><span>" + esc(x[2]) + "</span><b>" + fa(x[3]) + "</b></button>";
        }).join("") + "</div></div>";
    } else {
      h += '<div class="card"><div class="sm b">✅ هیچ کار عقب‌افتاده‌ای نیست</div>' +
        '<div class="xs mut mt">تاییدها، سفارش‌ها و گزارش‌ها همه رسیدگی شده‌اند.</div></div>';
    }

    h += '<div class="card"><div class="sm b mb">📈 رشد کاربران</div>' + chartHTML() + "</div>";

    var U = Object.keys(R.USERS || {}).map(function (k) {
      var u = R.USERS[k] || {}; u.uid = k; return u;
    }).sort(function (a, b) { return (b.joined || 0) - (a.joined || 0); }).slice(0, 6);

    h += '<div class="card"><div class="sm b mb">🆕 تازه‌واردها</div>';
    h += U.length ? U.map(function (u) {
      return '<div class="lrow mb">' + avHTML(u, "sm") + '<div class="grow" style="min-width:0">' +
        '<div class="sm b ellip">' + esc(u.name || "کاربر") + "</div>" +
        '<div class="xs mut">' + roleFa(u.role) + " • " + time(u.joined) + "</div></div>" +
        '<button class="btn mini" data-dmto="' + u.uid + '">💬</button></div>';
    }).join("") : '<div class="empty">هنوز کسی ثبت‌نام نکرده</div>';
    h += "</div>";

    h += '<div class="card"><div class="sm b mb">🧭 میان‌بر</div><div class="ohGo">' +
      '<button class="ohGoB" type="button" data-oh-jump="owner">👑 پنل</button>' +
      '<button class="ohGoB" type="button" data-oh-jump="community">👥 انجمن</button>' +
      '<button class="ohGoB" type="button" data-oh-jump="market">🛒 فروشگاه</button>' +
      '<button class="ohGoB" type="button" data-oh-jump="settings">⚙ تنظیمات</button></div></div>';
    return h;
  }

  function usersHTML() {
    var qq = (R.uq || "").toLowerCase();
    var arr = Object.keys(R.USERS || {}).map(function (k) {
      var u = R.USERS[k] || {}; u.uid = k; return u;
    }).filter(function (u) {
      if (!qq) return true;
      return (u.name || "").toLowerCase().indexOf(qq) > -1 ||
        (u.email || "").toLowerCase().indexOf(qq) > -1;
    }).sort(function (a, b) { return (b.joined || 0) - (a.joined || 0); });

    var h = '<div class="card"><input class="inp" id="uqIn" placeholder="جستجوی نام یا ایمیل…" value="' +
      esc(R.uq) + '"><div class="xs mut mt">' + fa(arr.length) + " کاربر</div></div>";
    if (!arr.length) return h + '<div class="empty">کاربری پیدا نشد</div>';

    var PERMS = R.PERMS || ["users", "posts", "news", "anime", "market", "ads", "orders"];
    arr.forEach(function (u) {
      var me = u.uid === R.ME;
      h += '<div class="card"><div class="row">' + avHTML(u) +
        '<div class="grow" style="min-width:0">' +
        '<div class="row w" style="gap:5px"><b class="sm">' + esc(u.name || "کاربر") + "</b>" +
        '<span class="chip" style="padding:1px 7px;font-size:9.5px">' + roleFa(u.role) + "</span>" +
        (u.prem ? '<span class="chip gd" style="padding:1px 7px;font-size:9.5px">💎 پرمیوم</span>' : "") +
        (u.banned ? '<span class="chip bad" style="padding:1px 7px;font-size:9.5px">مسدود</span>' : "") +
        (me ? '<span class="chip cy" style="padding:1px 7px;font-size:9.5px">👑 خودت</span>' : "") +
        "</div>" +
        '<div class="xs mut ellip" dir="ltr">' + esc(u.email || "—") + "</div>" +
        '<div class="xs mut">سطح ' + fa(level(u.xp || 0)) + " • " + fa(u.xp || 0) +
        " XP • عضو از " + time(u.joined) + "</div>" +
        '<div class="row w" style="gap:6px;margin-top:7px">' +
        '<button class="btn mini" data-dmto="' + u.uid + '">💬 پیام</button>' +
        '<button class="btn mini" data-pm="' + u.uid + '">' + (u.prem ? "حذف پرمیوم" : "💎 پرمیوم دادن") + "</button>" +
        '<button class="btn mini' + (u.banned ? " ok" : " d") + '" data-ban="' + u.uid + '">' +
          (u.banned ? "رفع مسدودی" : "مسدود کردن") + "</button>" +
        (me ? "" :
          '<button class="btn mini" data-role="' + u.uid + ':admin">مدیر</button>' +
          '<button class="btn mini" data-role="' + u.uid + ':staff">کارمند</button>' +
          '<button class="btn mini" data-role="' + u.uid + ':user">کاربر عادی</button>') +
        "</div></div></div>" +
        '<details class="mt"><summary class="sm cy" style="cursor:pointer">دسترسی‌ها</summary>' +
        '<div class="row w" style="gap:5px;margin-top:8px">' +
        PERMS.map(function (p) {
          var on = u.perms && u.perms[p] === true;
          return '<button class="btn mini' + (on ? " p" : "") + '" data-perm="' + u.uid + ":" + p + '">' + p + "</button>";
        }).join("") + "</div></details></div>";
    });
    return h;
  }

  function modHTML() {
    var arr = Object.keys(R.PENDING || {}).map(function (k) {
      var p = R.PENDING[k] || {}; p.id = k; return p;
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    if (!arr.length) return '<div class="empty">هیچ پستی در انتظار تایید نیست ✅</div>';
    return arr.map(function (p) {
      return '<div class="card"><div class="row">' + avHTML({ name: p.n, av: p.av }, "sm") +
        '<div class="grow"><b class="sm">' + esc(p.n || "کاربر") + "</b>" +
        '<div class="xs mut">' + roleFa(p.urole) + " • " + time(p.t) + "</div></div></div>" +
        '<div class="pbody" style="margin:10px 0">' + esc(p.text || "") + "</div>" +
        '<div class="row w" style="gap:6px">' +
        '<button class="btn ok mini" data-apost="' + p.id + '">✅ تایید و انتشار</button>' +
        '<button class="btn d mini" data-rpost="' + p.id + '">❌ رد</button>' +
        '<button class="btn mini" data-dpost="' + p.id + '">🗑 حذف</button></div></div>';
    }).join("");
  }

  function prodList() {
    if (R.prodList) { try { return R.prodList(); } catch (e) {} }
    return Object.keys(R.PRODS || {}).map(function (k) {
      var p = R.PRODS[k] || {}; p.id = k; return p;
    });
  }

  function adsHTML() {
    var arr = prodList().filter(function (p) { return p.st === "pending"; });
    if (!arr.length) return '<div class="empty">هیچ آگهی در انتظاری نیست ✅</div>';
    return arr.map(function (p) {
      return '<div class="card"><div class="row"><div style="font-size:30px">' + (p.icon || "🎁") +
        '</div><div class="grow" style="min-width:0"><div class="sm b ellip">' + esc(p.name) + "</div>" +
        '<div class="xs mut">' + esc(p.sellerName || "فروشنده") + " • " + money(p.price) + " " +
        esc(p.cur || "افغانی") + "</div></div></div>" +
        (p.desc ? '<div class="sm mut mt">' + esc(p.desc) + "</div>" : "") +
        '<div class="row w" style="gap:6px;margin-top:10px">' +
        '<button class="btn ok mini" data-aad="' + p.id + '">✅ تایید</button>' +
        '<button class="btn d mini" data-rad="' + p.id + '">❌ رد</button>' +
        '<button class="btn mini" data-prod="' + p.id + '">نمایش</button></div></div>';
    }).join("");
  }

  function ordersHTML() {
    var arr = Object.keys(R.ORDERS || {}).map(function (k) {
      var o = R.ORDERS[k] || {}; o.id = k; return o;
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    if (!arr.length) return '<div class="empty">هنوز سفارشی ثبت نشده</div>';
    return arr.map(function (o) {
      return '<div class="card"><div class="row between"><b class="sm">' + esc(o.pname || "محصول") +
        '</b><span class="chip ' + (o.st === "new" ? "gd" : "ok") + '">' +
        (o.st === "new" ? "جدید" : "بررسی‌شده") + "</span></div>" +
        '<div class="xs mut mt">' + money(o.price) + " " + esc(o.cur || "تومان") + " × " +
        fa(o.qty || 1) + " • " + time(o.t) + "</div>" +
        '<div class="sm mt">👤 ' + esc(o.buyerName || "خریدار") + "</div>" +
        '<div class="sm cy" dir="auto">📞 ' + esc(o.contact || "—") + "</div>" +
        (o.msg ? '<div class="sm mut mt">' + esc(o.msg) + "</div>" : "") +
        '<div class="row w" style="gap:6px;margin-top:10px">' +
        '<button class="btn ok mini" data-odone="' + o.id + '">✅ بررسی شد</button>' +
        '<button class="btn d mini" data-odel="' + o.id + '">🗑 حذف</button>' +
        (o.buyerUid ? '<button class="btn mini" data-dmto="' + o.buyerUid + '">💬 خریدار</button>' : "") +
        "</div></div>";
    }).join("");
  }

  function reportsHTML() {
    var arr = Object.keys(R.REPORTS || {}).map(function (k) {
      var r = R.REPORTS[k] || {}; r.id = k; return r;
    }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    if (!arr.length) return '<div class="empty">هیچ گزارشی ثبت نشده ✅</div>';
    return arr.map(function (r) {
      return '<div class="card"><div class="row between"><b class="sm">' +
        (r.type === "msg" ? "🚩 پیام" : "🚩 پست") + '</b><span class="chip ' +
        (r.st === "done" ? "ok" : "bad") + '">' + (r.st === "done" ? "رسیدگی شد" : "باز") + "</span></div>" +
        '<div class="xs mut mt">گزارش‌دهنده: ' + esc(r.by || "کاربر") + " • " + time(r.t) + "</div>" +
        '<div class="sm mt">دلیل: ' + esc(r.text || "—") + "</div>" +
        '<div class="row w" style="gap:6px;margin-top:10px">' +
        '<button class="btn ok mini" data-rdone="' + r.id + '">✅ رسیدگی شد</button>' +
        '<button class="btn d mini" data-rdel="' + r.id + '">🗑 حذف</button>' +
        "</div></div>";
    }).join("");
  }

  function settingsHTML() {
    return '<div class="card"><div class="sm b mb">👑 هویت مالک</div>' +
      '<div class="xs mut">UID قفل‌شده در قوانین دیتابیس:</div>' +
      '<div class="sm cy" dir="ltr">' + esc(R.OWNER_UID || "— هنوز تنظیم نشده —") + "</div>" +
      '<div class="xs mut mt">UID فعلی تو:</div><div class="sm" dir="ltr">' + esc(R.ME || "") + "</div></div>" +
      '<div class="card"><div class="sm b mb">📢 اعلان سراسری</div>' +
      '<input class="inp" id="setAnn" maxlength="120" placeholder="متن اعلان…" value="' +
      esc((R.SITE && R.SITE.ann) || "") + '">' +
      '<button class="btn p mini mt" data-saveann="1">ذخیره اعلان</button></div>' +
      '<div class="card"><div class="sm b mb">🔐 یادآوری امنیت</div>' +
       '<div id="apicoHost" class="mb"></div>' +
      '<div class="xs mut">قوانین Firebase باید Publish شده باشند؛ وگرنه هیچ‌کس نمی‌تواند بنویسد.</div></div>';
  }

  function tabHTML(t) {
    if (t === "users") return usersHTML();
    if (t === "mod") return modHTML();
    if (t === "ads") return adsHTML();
    if (t === "orders") return ordersHTML();
    if (t === "reports") return reportsHTML();
    if (t === "settings") return settingsHTML();
    return ovHTML();
  }

  /* ── ۹. کوتاه‌نویس‌های سایت (با احتیاط) ─────────────────── */
  function avHTML(u, sz) {
    if (R.avHTML) { try { return R.avHTML(u, sz); } catch (e) {} }
    return '<div class="av ' + (sz || "") + '"><span>' + esc((u && (u.av || u.name)) || "؟") + "</span></div>";
  }
  function roleFa(r) { try { return R.roleFa ? R.roleFa(r) : (r || "کاربر"); } catch (e) { return r || "کاربر"; } }
  function level(x) { try { return R.level ? R.level(x) : 1; } catch (e) { return 1; } }
  function time(t) { try { return R.time ? R.time(t) : ""; } catch (e) { return ""; } }
  function money(n) { try { return R.money ? R.money(n) : fa(n || 0); } catch (e) { return fa(n || 0); } }

  /* ── ۱۰. رسم پنل (تک‌منبع) ─────────────────────────────── */
  R.renderOwner = function () {
    if (!isOwner()) return;
    var b = el("ownerBody");
    if (!b) return;
    if (R.ownerTab === "maint" && BASE) {
      BASE.apply(this, arguments);
      decorate();
      return;
    }
    b.innerHTML = tabHTML(R.ownerTab);
    qa("#sec-owner .tabs .tab").forEach(function (t) {
      t.classList.toggle("on", t.getAttribute("data-otab") === R.ownerTab);
    });
    decorate();
    if (R.ownerTab === "users") {
      var i = el("uqIn");
      if (i && R.uq) { try { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} }
    }
  };

  /* ── ۱۱. اشتراک داده و نشان ────────────────────────────── */
  R.watchOwner = function () {
    if (!R.db || !isOwner() || R._ow) return;
    R._ow = true;
    try {
      R.db.ref("users").limitToLast(300).on("value", function (s) {
        R.USERS = s.val() || {}; R.paintOwner();
      }, function () {});
      R.db.ref("pending").on("value", function (s) { R.PENDING = s.val() || {}; R.paintOwner(); });
      R.db.ref("orders").limitToLast(200).on("value", function (s) { R.ORDERS = s.val() || {}; R.paintOwner(); });
      R.db.ref("reports").limitToLast(200).on("value", function (s) { R.REPORTS = s.val() || {}; R.paintOwner(); });
    } catch (e) {}
  };

  R.paintOwner = function () {
    if (!isOwner()) return;
    var s = R.stats();
    var n = s.pend + s.pendA + s.newOrd + s.newRep;
    var c = el("ownCount");
    if (c) { c.textContent = fa(n); c.style.display = n ? "" : "none"; }
    var own = sec("owner");
    if (own && own.classList.contains("on")) R.renderOwner();
    else decorate();
  };

  /* ── ۱۲. کنش‌ها ────────────────────────────────────────── */
  R.setRole = function (uid, role) {
    if (!isOwner()) return tost("فقط مالک", "err");
    if (uid === R.ME) return tost("نقش خودت تغییر نمی‌کند 👑", "err");
    if (role === "owner") return tost("مالک دوم وجود ندارد", "err");
    upd("users/" + uid, { role: role }).then(function () {
      tost("نقش تغییر کرد ✅", "ok");
      note(uid, "🎖 نقش تو به «" + roleFa(role) + "» تغییر کرد");
    }).catch(function (e) { tost("نشد: " + e.message, "err"); });
  };
  R.togglePrem = function (uid) {
    if (!isOwner()) return;
    var on = !((R.USERS || {})[uid] || {}).prem;
    upd("users/" + uid, { prem: on }).then(function () {
      tost(on ? "💎 پرمیوم فعال شد" : "پرمیوم حذف شد", "ok");
      note(uid, on ? "💎 پرمیوم فعال شد!" : "پرمیوم غیرفعال شد");
    }).catch(function (e) { tost("نشد: " + e.message, "err"); });
  };
  R.toggleBan = function (uid) {
    if (!isOwner()) return;
    var on = !((R.USERS || {})[uid] || {}).banned;
    upd("users/" + uid, { banned: on }).then(function () {
      tost(on ? "مسدود شد" : "رفع شد", "ok");
    });
  };
  R.togglePerm = function (uid, perm) {
    if (!isOwner() || !R.db) return;
    var u = (R.USERS || {})[uid] || {};
    var on = !!(u.perms && u.perms[perm]);
    R.db.ref("users/" + uid + "/perms/" + perm).set(on ? null : true).then(function () {
      u.perms = u.perms || {};
      if (on) delete u.perms[perm]; else u.perms[perm] = true;
      tost(on ? "دسترسی برداشته شد" : "دسترسی داده شد", "ok");
      R.renderOwner();
    }).catch(function (e) { tost("نشد: " + e.message, "err"); });
  };
  R.approvePost = function (pid) {
    if (!isOwner() || !R.db) return;
    var p = (R.PENDING || {})[pid]; if (!p) return;
    p.status = "published"; p.ap = Date.now();
    R.db.ref("posts/" + pid).set(p).then(function () {
      return R.db.ref("pending/" + pid).remove();
    }).then(function () {
      note(p.uid, "✅ پستت تایید و منتشر شد");
      tost("منتشر شد ✅", "ok");
    }).catch(function (e) { tost("نشد: " + e.message, "err"); });
  };
  R.rejectPost = function (pid) {
    if (!isOwner() || !R.db) return;
    var p = (R.PENDING || {})[pid] || {};
    R.db.ref("pending/" + pid).remove().then(function () {
      note(p.uid, "❌ پستت تایید نشد");
      tost("رد شد", "ok");
    });
  };
  R.approveAd = function (id) {
    if (!isOwner()) return;
    var p = (R.PRODS || {})[id] || {};
    upd("products/" + id, { st: "live" }).then(function () {
      note(p.sellerUid, "✅ آگهی «" + (p.name || "") + "» تایید شد");
      tost("آگهی منتشر شد ✅", "ok");
    }).catch(function (e) { tost("نشد: " + e.message, "err"); });
  };
  R.rejectAd = function (id) {
    if (!isOwner()) return;
    var p = (R.PRODS || {})[id] || {};
    upd("products/" + id, { st: "rejected" }).then(function () {
      note(p.sellerUid, "❌ آگهی «" + (p.name || "") + "» تایید نشد");
      tost("رد شد", "ok");
    });
  };
  R.orderDone = function (id) { upd("orders/" + id, { st: "done" }); tost("علامت‌گذاری شد", "ok"); };
  R.orderDel = function (id) { if (R.db) R.db.ref("orders/" + id).remove(); };
  R.repDone = function (id) { upd("reports/" + id, { st: "done" }); tost("رسیدگی شد", "ok"); };
  R.repDel = function (id) { if (R.db) R.db.ref("reports/" + id).remove(); };
  R.saveAnn = function () {
    if (!isOwner()) return;
    var i = el("setAnn");
    var v = R.clean ? R.clean(i ? i.value : "", 120) : String(i ? i.value : "").slice(0, 120);
    var p = R.set ? R.set("settings/site", { ann: v }) : (R.db ? R.db.ref("settings/site").update({ ann: v }) : null);
    if (p && p.then) p.then(function () { tost("ذخیره شد ✅", "ok"); });
    else tost("ذخیره شد ✅", "ok");
  };

  function tost(m, k) { try { if (R.toast) R.toast(m, k || "ok"); } catch (e) {} }
  function note(uid, m) { try { if (uid && R.notify) R.notify(uid, m); } catch (e) {} }
  function upd(path, v) {
    if (R.upd) return R.upd(path, v);
    if (R.db) return R.db.ref(path).update(v);
    return { then: function () { return { catch: function () {} }; } };
  }

  /* ── ۱۳. اتصال رویدادها ───────────────────────────────── */
  function bindOwner() {
    if (R.__ohBind) return;
    R.__ohBind = true;

    /* تَب‌ها */
    qa("#sec-owner .tabs .tab").forEach(function (b) {
      if (b.__oh) return;
      b.__oh = true;
      b.addEventListener("click", function () {
        R.ownerTab = b.getAttribute("data-otab");
        qa("#sec-owner .tabs .tab").forEach(function (x) { x.classList.toggle("on", x === b); });
        R.renderOwner();
      });
    });

    var body = el("ownerBody");
    if (body) {
      body.addEventListener("input", function (e) {
        if (e.target.id === "uqIn") { R.uq = e.target.value; R.renderOwner(); }
      });
      body.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest(
          "[data-role],[data-pm],[data-ban],[data-perm],[data-apost],[data-rpost],[data-dpost]," +
          "[data-aad],[data-rad],[data-odone],[data-odel],[data-rdone],[data-rdel],[data-saveann]," +
          "[data-dmto],[data-prod]"
        ) : null;
        if (!t) return;
        if (t.hasAttribute("data-role")) {
          var a = t.getAttribute("data-role").split(":");
          R.setRole(a[0], a[1]);
        } else if (t.hasAttribute("data-pm")) R.togglePrem(t.getAttribute("data-pm"));
        else if (t.hasAttribute("data-ban")) R.toggleBan(t.getAttribute("data-ban"));
        else if (t.hasAttribute("data-perm")) {
          var b = t.getAttribute("data-perm").split(":");
          R.togglePerm(b[0], b[1]);
        } else if (t.hasAttribute("data-apost")) R.approvePost(t.getAttribute("data-apost"));
        else if (t.hasAttribute("data-rpost")) R.rejectPost(t.getAttribute("data-rpost"));
        else if (t.hasAttribute("data-dpost")) { if (R.db) R.db.ref("pending/" + t.getAttribute("data-dpost")).remove(); }
        else if (t.hasAttribute("data-aad")) R.approveAd(t.getAttribute("data-aad"));
        else if (t.hasAttribute("data-rad")) R.rejectAd(t.getAttribute("data-rad"));
        else if (t.hasAttribute("data-odone")) R.orderDone(t.getAttribute("data-odone"));
        else if (t.hasAttribute("data-odel")) R.orderDel(t.getAttribute("data-odel"));
        else if (t.hasAttribute("data-rdone")) R.repDone(t.getAttribute("data-rdone"));
        else if (t.hasAttribute("data-rdel")) R.repDel(t.getAttribute("data-rdel"));
        else if (t.hasAttribute("data-saveann")) R.saveAnn();
        else if (t.hasAttribute("data-dmto")) {
          if (R.dm) { try { R.dm(t.getAttribute("data-dmto")); } catch (x) {} }
        } else if (t.hasAttribute("data-prod")) {
          goTo("market");
        }
      });
    }
  }

  R.bindOwner = bindOwner;
  R.bootOwner = function () {
    bindOwner();
    R.watchOwner();
    decorate();
    if (el("ownerBody") && !el("ownerBody").innerHTML.trim()) R.renderOwner();
  };

  /* ── ۱۴. راه‌اندازی ───────────────────────────────────── */
  function boot() {
    if (!isOwner()) return;
    if (!sec("owner")) return;
    bindOwner();
    decorate();
    if (el("ownerBody") && !el("ownerBody").innerHTML.trim()) R.renderOwner();
    if (!R.__ohTick) {
      R.__ohTick = setInterval(function () {
        try { if (sec("owner")) { decorate(); } } catch (e) {}
      }, 4000);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [300, 900, 1800, 3200].forEach(function (ms) { setTimeout(boot, ms); });

  var onIn = R.onLogin;
  R.onLogin = function () {
    if (onIn) { try { onIn(); } catch (e) {} }
    setTimeout(boot, 700);
  };

  /* API برای تست و استفادهٔ خودت */
  R.ownerHub = {
    decorate: decorate, mount: mount, css: css, nums: nums, who: who,
    goTo: goTo, live: live, tools: TOOLS, groups: GROUPS,
    tabHTML: tabHTML, chartHTML: chartHTML, bindOwner: bindOwner
  };
})();
