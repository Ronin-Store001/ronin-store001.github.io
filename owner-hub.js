/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OWNER HUB v1  ·  owner-hub.js
   چیدمان تازهٔ پنل مالک + دسترسی به همهٔ بخش‌های سایت از یک‌جا
   ───────────────────────────────────────────────────────────────
   افزودنی است: منطق تَب‌ها و دکمه‌های قبلی (6-owner.js و owner-plus.js)
   دست‌نخورده می‌ماند؛ فقط سرصفحه، آمار، نوار تَب و شبکهٔ دسترسی
   بازسازی می‌شود. همهٔ دکمه‌ها به همان توابع واقعی سایت وصل‌اند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__oh) return;
  R.__oh = true;

  /* ── ۱. فهرست بخش‌ها و نامشان ───────────────────────────── */
  var LABEL = {
    home: ["🏠", "خانه"],
    bulletin: ["📣", "اطلاعیه و تریلر"],
    discover: ["🧭", "کشف تازه‌ها"],
    rank: ["🏆", "رتبه‌بندی"],
    events: ["📅", "رویدادها"],
    community: ["👥", "انجمن"],
    chat: ["💬", "چت عمومی"],
    groups: ["🏯", "گروه‌های چت"],
    dm: ["📥", "پیام‌ها"],
    users: ["👤", "کاربران"],
    team: ["🛡", "شبکه فرماندهی"],
    market: ["🛒", "فروشگاه"],
    ads: ["📢", "تبلیغات و آگهی"],
    premium: ["💎", "پرمیوم"],
    profile: ["👤", "پروفایل"],
    myworld: ["🧭", "دنیای من"],
    archive: ["🥷", "آرشیو همراه"],
    settings: ["⚙", "تنظیمات"],
    owner: ["👑", "پنل مالک"]
  };
  var GROUPS = [
    { t: "🏠 خانه و کشف", k: ["home", "bulletin", "discover", "rank", "events"] },
    { t: "👥 جامعه", k: ["community", "chat", "groups", "dm", "users", "team"] },
    { t: "🛒 بازار", k: ["market", "ads", "premium"] },
    { t: "👤 حساب و مدیریت", k: ["profile", "myworld", "archive", "settings", "owner"] }
  ];
  var TOOLS = [
    { k: "overview", ic: "📊", n: "نمای کلی" },
    { k: "users", ic: "👥", n: "کاربران" },
    { k: "mod", ic: "✅", n: "تایید محتوا" },
    { k: "ads", ic: "📢", n: "آگهی‌ها" },
    { k: "orders", ic: "📦", n: "سفارش‌ها" },
    { k: "reports", ic: "🚩", n: "گزارش‌ها" },
    { k: "settings", ic: "⚙", n: "تنظیمات" },
    { k: "maint", ic: "🛠", n: "نگهداری" }
  ];

  function el(i) { return document.getElementById(i); }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function sec(name) { return document.getElementById("sec-" + name); }
  function isOwner() { try { return !!R.isOwner(); } catch (e) { return false; } }

  /* ── ۲. استایل — فقط داخل #sec-owner ────────────────────── */
  function css() {
    if (el("ohCss")) return;
    var s = document.createElement("style");
    s.id = "ohCss";
    s.textContent =
      "#sec-owner>.head{display:none!important}" +
      "#ohTop{margin-bottom:14px}" +
      "#ohTop *{box-sizing:border-box}" +

      /* کارت هویت */
      ".ohHero{position:relative;overflow:hidden;border-radius:22px;padding:18px 18px 16px;color:#f2f5ff;" +
      "border:1px solid rgba(140,160,255,.18);" +
      "background:linear-gradient(135deg,rgba(124,92,255,.26),rgba(34,211,238,.14) 58%,rgba(255,79,216,.18))}" +
      ".ohHero::after{content:\"\";position:absolute;width:230px;height:230px;border-radius:50%;" +
      "inset-inline-end:-80px;top:-110px;pointer-events:none;" +
      "background:radial-gradient(circle,rgba(255,111,216,.4),transparent 70%);filter:blur(8px)}" +
      ".ohHrow{position:relative;z-index:2;display:flex;align-items:center;gap:12px;flex-wrap:wrap}" +
      ".ohCrown{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;font-size:22px;" +
      "background:linear-gradient(140deg,#7c5cff,#22d3ee);box-shadow:0 12px 30px rgba(124,92,255,.45)}" +
      ".ohHt{font-size:17px;font-weight:900;line-height:1.5;margin:0}" +
      ".ohHs{font-size:11px;color:#c9d2ff;margin-top:2px}" +
      ".ohPill{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:99px;" +
      "font-size:10.5px;color:#dbe3ff;background:rgba(10,14,32,.42);border:1px solid rgba(140,160,255,.3)}" +
      ".ohPill .d{width:6px;height:6px;border-radius:50%;background:#5df0b0;box-shadow:0 0 8px #5df0b0}" +
      ".ohPill b{color:#fff}" +

      /* آمار */
      ".ohKpis{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));" +
      "gap:8px;margin-top:14px}" +
      ".ohK{border-radius:14px;padding:9px 10px;background:rgba(8,12,28,.42);" +
      "border:1px solid rgba(140,160,255,.16)}" +
      ".ohK .n{font-weight:900;font-size:17px;color:#fff;line-height:1.2}" +
      ".ohK .l{font-size:10px;color:#a7b1dc;margin-top:2px}" +
      ".ohK.warn .n{color:#ffd479}.ohK.bad .n{color:#ff9a9a}.ohK.ok .n{color:#8ef2cc}" +

      /* شبکهٔ دسترسی */
      ".ohBox{margin-top:12px;border-radius:18px;padding:12px 12px 10px;" +
      "background:rgba(255,255,255,.04);border:1px solid rgba(140,160,255,.14)}" +
      ".ohBH{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}" +
      ".ohBH h3{margin:0;font-size:12.5px;font-weight:900;color:#eef1ff;letter-spacing:.2px}" +
      ".ohBH .sm{font-size:10px;color:#8f9ac9}" +
      ".ohGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:7px}" +
      ".ohT{display:flex;align-items:center;gap:7px;min-width:0;padding:9px 10px;border-radius:12px;" +
      "cursor:pointer;color:#e6eaff;font-family:inherit;font-size:11.5px;font-weight:700;text-align:start;" +
      "background:rgba(255,255,255,.045);border:1px solid rgba(140,160,255,.16);" +
      "transition:transform .16s,border-color .16s,background .16s}" +
      ".ohT:hover,.ohT:focus-visible{transform:translateY(-2px);outline:none;color:#fff;" +
      "background:rgba(124,92,255,.16);border-color:rgba(124,92,255,.55)}" +
      ".ohT i{font-style:normal;font-size:15px;line-height:1}" +
      ".ohT span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".ohT.on{border-color:rgba(34,211,238,.6);background:rgba(34,211,238,.14)}" +
      ".ohT.own{border-color:rgba(255,111,216,.5)}" +
      "@media (max-width:520px){.ohGrid{grid-template-columns:repeat(2,minmax(0,1fr))}" +
      ".ohHt{font-size:15px}}"

      /* نوار تَب — چسبان و قرصی */
      + "#sec-owner .tabs{position:sticky;top:0;z-index:9;display:flex;gap:6px;overflow-x:auto;" +
      "padding:8px;margin-bottom:12px;border-radius:16px;-webkit-overflow-scrolling:touch;" +
      "background:rgba(9,13,30,.92);backdrop-filter:blur(10px);" +
      "border:1px solid rgba(140,160,255,.16);scrollbar-width:none}" +
      "#sec-owner .tabs::-webkit-scrollbar{display:none}" +
      "#sec-owner .tabs .tab{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;cursor:pointer;" +
      "padding:7px 13px;border-radius:99px;font-size:11.5px;font-weight:800;color:#b9c1ea;" +
      "border:1px solid rgba(140,160,255,.18);background:rgba(255,255,255,.04);transition:.18s}" +
      "#sec-owner .tabs .tab:hover{color:#fff;background:rgba(124,92,255,.16)}" +
      "#sec-owner .tabs .tab.on{color:#fff;border-color:transparent;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);box-shadow:0 8px 20px rgba(124,92,255,.35)}" +
      "#sec-owner .tabs .ohBd{font-size:9px;font-weight:900;padding:0 5px;border-radius:99px;" +
      "background:rgba(10,14,32,.35);color:#fff}" +
      "#sec-owner .tabs .tab.on .ohBd{background:rgba(0,0,0,.25)}" +

      /* بدنهٔ پنل */
      "#ownerBody{display:grid;gap:12px}" +
      "#ownerBody>.card{margin-bottom:0}" +
      "#ownerBody .grid.auto{gap:8px}" +
      "#ownerBody .kpi{border-radius:14px!important;padding:10px 12px!important;" +
      "background:linear-gradient(135deg,rgba(124,92,255,.18),rgba(34,211,238,.1))!important;" +
      "border:1px solid rgba(140,160,255,.2)!important}" +
      "#ownerBody .kpi .n{font-size:19px!important;font-weight:900}" +
      "#ownerBody .card{border-radius:16px}" +
      "#ownerBody .card>.row:first-child{margin-bottom:2px}" +
      "#ownerBody .btn.mini{border-radius:10px}" +
      "#ownerBody .empty{padding:18px 10px}" +
      "#ownerBody .chart{display:flex;align-items:flex-end;gap:6px;height:96px;padding:6px 2px}" +
      "#ownerBody .chart i{flex:1 1 0;border-radius:7px 7px 3px 3px;min-height:6px;" +
      "background:linear-gradient(180deg,#22d3ee,#7c5cff)}";
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

  /* ── ۴. چه بخش‌هایی واقعاً هست؟ ─────────────────────────── */
  function live() {
    var out = {};
    Object.keys(LABEL).forEach(function (k) { if (sec(k)) out[k] = 1; });
    return out;
  }

  /* ── ۵. HTML سرصفحه ─────────────────────────────────────── */
  function topHTML(have) {
    var n = nums();
    function kpi(v, l, cls) {
      return '<div class="ohK' + (cls ? " " + cls : "") + '"><div class="n">' + fa(v) +
        '</div><div class="l">' + esc(l) + "</div></div>";
    }
    var h = '<div class="ohHero"><div class="ohHrow">' +
      '<div class="ohCrown">👑</div>' +
      '<div class="grow" style="min-width:0"><h2 class="ohHt">مرکز فرماندهی رونین</h2>' +
        '<div class="ohHs">' + esc(who()) + ' · دسترسی کامل به همهٔ بخش‌ها</div></div>' +
      '<span class="ohPill"><span class="d"></span>آنلاین · <b>' + fa(n.online) + "</b></span>" +
      (R.ME ? '<span class="ohPill">🆔 <b dir="ltr">' + esc(String(R.ME).slice(0, 8)) + "</b></span>" : "") +
      "</div>" +
      '<div class="ohKpis">' +
        kpi(n.users, "کاربر") + kpi(n.online, "آنلاین", "ok") + kpi(n.prem, "پرمیوم") +
        kpi(n.posts, "پست") + kpi(n.prods, "آگهی فعال") +
        kpi(n.pend + n.pendA, "در انتظار تایید", (n.pend + n.pendA) ? "warn" : "") +
        kpi(n.newOrd, "سفارش جدید", n.newOrd ? "warn" : "") +
        kpi(n.newRep, "گزارش باز", n.newRep ? "bad" : "ok") +
      "</div></div>";

    /* ابزارهای مالک (سوییچ تَب) */
    h += '<div class="ohBox"><div class="ohBH"><h3>🛠 ابزارهای مالک</h3>' +
      '<span class="sm">بدون خروج از پنل</span></div><div class="ohGrid">' +
      TOOLS.map(function (t) {
        var b = t.k === "maint" ? 0 : badge(t.k, n);
        return '<button class="ohT' + (R.ownerTab === t.k ? " on" : "") + '" type="button" ' +
          'data-oh-tab="' + t.k + '"><i>' + t.ic + "</i><span>" + esc(t.n) + "</span>" +
          (b ? '<b class="ohBd" style="font-size:9px;background:rgba(255,255,255,.16);' +
            'border-radius:99px;padding:0 5px">' + fa(b) + "</b>" : "") + "</button>";
      }).join("") + "</div></div>";

    /* دسترسی به همه‌جا */
    h += '<div class="ohBox"><div class="ohBH"><h3>🧭 دسترسی به همهٔ بخش‌ها</h3>' +
      '<span class="sm">' + fa(Object.keys(have).length) + " مقصد فعال</span></div>";
    GROUPS.forEach(function (g) {
      var ks = g.k.filter(function (k) { return have[k]; });
      if (!ks.length) return;
      h += '<div class="sm" style="font-size:10px;color:#8f9ac9;margin:9px 2px 6px">' +
        esc(g.t) + "</div><div class=\"ohGrid\">" +
        ks.map(function (k) {
          return '<button class="ohT' + (k === "owner" ? " own" : "") + '" type="button" ' +
            'data-oh-go="' + k + '"><i>' + LABEL[k][0] + "</i><span>" + esc(LABEL[k][1]) +
            "</span></button>";
        }).join("") + "</div>";
    });
    h += "</div>";
    return h;
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

  /* ── ۶. سوارکردن سرصفحه ─────────────────────────────────── */
  var lastSig = "";
  function mount() {
    var s = sec("owner");
    if (!s) return false;
    css();
    var head = s.querySelector(":scope > .head");
    if (head) head.style.display = "none";
    var have = live();
    var sig = Object.keys(have).sort().join(",") + "|" + R.ownerTab;
    var top = el("ohTop");
    if (!top) {
      top = document.createElement("div");
      top.id = "ohTop";
      top.setAttribute("data-noi18n", "");
      var tabs = s.querySelector(":scope > .tabs");
      if (tabs && tabs.parentNode === s) s.insertBefore(top, tabs);
      else s.insertBefore(top, s.firstChild);
      lastSig = "";
    }
    var wanth = topHTML(have);
    if (lastSig !== sig || top.getAttribute("data-h") !== "1") {
      var d = document.createElement("div");
      d.innerHTML = wanth;
      /* فقط اجزای خودمان را عوض کن (هیچ‌چیز بیرونی دست نمی‌خورد) */
      top.innerHTML = "";
      while (d.firstChild) top.appendChild(d.firstChild);
      top.setAttribute("data-h", "1");
      lastSig = sig;
    }
    paintKpis();
    return true;
  }

  /* به‌روزرسانی اعداد بدون بازسازی شبکه (سبک) */
  function paintKpis() {
    var top = el("ohTop");
    if (!top) return;
    var boxes = top.querySelectorAll(".ohKpis .ohK");
    if (!boxes.length) return;
    var n = nums();
    var vals = [n.users, n.online, n.prem, n.posts, n.prods, n.pend + n.pendA, n.newOrd, n.newRep];
    for (var i = 0; i < boxes.length && i < vals.length; i++) {
      var e = boxes[i].querySelector(".n");
      var v = fa(vals[i]);
      if (e && e.textContent !== v) e.textContent = v;
    }
  }

  /* ── ۷. نشان روی تَب‌های قبلی ───────────────────────────── */
  function tabBadges() {
    var s = sec("owner");
    if (!s) return;
    var n = nums();
    s.querySelectorAll(".tabs .tab").forEach(function (t) {
      var k = t.getAttribute("data-otab");
      var v = badge(k, n);
      var b = t.querySelector(".ohBd");
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

  /* ── ۸. رسم کامل ────────────────────────────────────────── */
  function decorate() {
    if (!isOwner()) return;
    try { mount(); paintKpis(); tabBadges(); } catch (e) {}
  }

  /* ── ۹. کلیک‌ها ─────────────────────────────────────────── */
  function goTo(name) {
    if (!name || !sec(name)) {
      if (R.toast) R.toast("این بخش هنوز ساخته نشده", "info");
      return;
    }
    if (name === "owner") { if (R.renderOwner) R.renderOwner(); return; }
    if (R.go) R.go(name);
    else if (R.toast) R.toast(name, "info");
  }

  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest || !x.closest("#ohTop") || !isOwner()) return;

    var g = x.closest("[data-oh-go]");
    if (g) {
      e.preventDefault();
      return goTo(g.getAttribute("data-oh-go"));
    }

    var t = x.closest("[data-oh-tab]");
    if (t) {
      e.preventDefault();
      var k = t.getAttribute("data-oh-tab");
      var tab = document.querySelector('#sec-owner .tabs .tab[data-otab="' + k + '"]');
      if (tab) { tab.click(); return; }
      /* اگر تَب ساخته نشده بود، مستقیم همان تابع قبلی را صدا بزن */
      R.ownerTab = k;
      if (R.renderOwner) R.renderOwner();
      decorate();
    }
  });

  /* ── ۱۰. اتصال به رندر قبلی ─────────────────────────────── */
  var prev = R.renderOwner;
  R.renderOwner = function () {
    var out = prev ? prev.apply(this, arguments) : undefined;
    decorate();
    return out;
  };

  function boot() {
    if (!isOwner()) return;
    if (!sec("owner")) return;
    decorate();
    if (!R.__ohTimer) {
      R.__ohTimer = setInterval(function () {
        try { if (sec("owner")) decorate(); } catch (e) {}
      }, 4000);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [300, 900, 1800, 3200].forEach(function (ms) { setTimeout(boot, ms); });

  /* هر بار پنل مالک باز شد، تازه شود */
  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest || !x.closest('[data-go="owner"]')) return;
    setTimeout(decorate, 60);
  });

  var onIn = R.onLogin;
  R.onLogin = function () {
    if (onIn) { try { onIn(); } catch (e) {} }
    setTimeout(boot, 700);
  };

  /* API برای تست و استفادهٔ خودت */
  R.ownerHub = {
    decorate: decorate, mount: mount, css: css, nums: nums, who: who,
    goTo: goTo, live: live, tools: TOOLS, groups: GROUPS
  };
})();
