/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — CHAT SUITE v1 · ronin-chat-suite.js
   یک فایل واحد برای سه لایهٔ چت: Chat+ ← Chat Pro ← Chat Ultra
   ترتیب اجرا دقیقاً مثل قبل حفظ شده است.
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ── لایهٔ ۱: Chat+ (واکنش، ریپلای، تایپینگ، آنلاین، ایموجی) ── */
/* ═══ RONIN CHAT+ v1 — ارتقای چت (افزودنی؛ به فایل‌های اصلی دست نمی‌زند) ═══
   واکنش 👍 · ریپلای ↩ · «در حال نوشتن» · آنلاین 🟢 · 💎 پرمیوم · نخوانده 🔴 · ایموجی 😊 */
(function () {
  if (!window.R || !R.chatRow) return;
  var RX = ["👍","🔥","😂","💜"];
  var EMO = ["😀","😂","🥰","😎","🤔","😭","😡","🤯","👍","👎","🔥","💜","✨","🎉","💎","🍥","⚔️","🌸","🌙","⚡","😅","🙏","👀","🥷"];
  var premCache = {}, ON = {}, typing = {}, reply = null;
  var presOn = false, typRef = null, typLast = 0, TOUCH = false;
  try { TOUCH = matchMedia("(hover:none)").matches; } catch (e) {}
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  R.cpIndex = R.cpIndex || {};

  (function () { /* استایل اضافه */
    if (document.getElementById("cpCss")) return;
    var s = document.createElement("style"); s.id = "cpCss";
    s.textContent = ".cbar{position:relative}.cpreplying{position:absolute;bottom:calc(100% + 8px);inset-inline:0;z-index:9;margin:0}.rxchips:empty{display:none}.rxb.mine{border-color:#2fe6ff;box-shadow:0 0 10px rgba(47,230,255,.45)}html[data-theme='light'] .cpreplying{background:rgba(255,255,255,.95);color:#2a3566}";
    document.head.appendChild(s);
  })();

  /* ۱) حضور آنلاین */
  function presence() {
    if (presOn || !R.db || !R.ME) return;
    presOn = true;
    var ref = R.db.ref("chatPlus/on/" + R.ME);
    try { ref.onDisconnect().remove(); } catch (e) {}
    ref.set(Date.now());
    setInterval(function () { try { ref.set(Date.now()); } catch (e) {} }, 60000);
    R.db.ref("chatPlus/on").on("value", function (s) {
      var v = s.val() || {}, now = Date.now(), o = {};
      for (var k in v) if (now - v[k] < 180000) o[k] = 1;
      ON = o; paintOnline();
    }, function () {});
  }
  function paintOnline() {
    R.qa("[data-cpu]").forEach(function (el) {
      var d = el.querySelector(".ondot");
      if (d) d.style.display = ON[el.getAttribute("data-cpu")] ? "block" : "none";
    });
  }

  /* ۲) 💎 پرمیوم (با کش) */
  function prem(uid, cb) {
    if (R.ME && uid === R.ME) return cb(!!R.prem);
    if (premCache[uid] !== undefined) return cb(premCache[uid]);
    if (!R.ME || !uid) return cb(false);
    premCache[uid] = false;
    R.get("users/" + uid).then(function (u) {
      premCache[uid] = !!(u && u.prem === true); cb(premCache[uid]);
    }).catch(function () { cb(false); });
  }
  function paintBadges() {
    R.qa("[data-cpu]").forEach(function (el) {
      prem(el.getAttribute("data-cpu"), function (p) {
        if (!p) return;
        var nm = el.querySelector(".cpname");
        if (nm && !nm.querySelector(".cpbadge")) {
          var b = document.createElement("span");
          b.className = "cpbadge"; b.textContent = "💎"; nm.appendChild(b);
        }
      });
    });
  }

  /* ۳) ردیف پیام (جایگزین chatRow — کلاس‌ها و data-dm/data-rpm حفظ شده) */
  R.chatRow = function (m, path) {
    R.cpIndex[path] = m;
    var mine = m.uid === R.ME, uid = m.uid || "";
    var h = '<div class="msg cpmsg' + (mine ? " me" : "") + '" data-cpu="' + esc(uid) + '">';
    h += '<span class="avw">' + R.avHTML({ name: m.n, av: m.av }, "sm");
    h += '<i class="ondot"' + (ON[uid] ? "" : ' style="display:none"') + '></i></span><div class="cpmain">';
    if (!mine) h += '<div class="cpname">' + esc(m.n || "کاربر") + "</div>";
    if (m.rp && m.rp.n) h += '<div class="cprp"><b>↩ ' + esc(m.rp.n) + "</b>" + esc(m.rp.x || "") + "</div>";
    h += '<div class="bub">' + esc(m.text) + "</div>";
    var r = m.react || {}, cnt = {}, mineRx = "", u, e;
    for (u in r) { cnt[r[u]] = (cnt[r[u]] || 0) + 1; if (u === R.ME) mineRx = r[u]; }
    var chips = "", bar = "";
    for (e in cnt) chips += '<span class="rxchip' + (e === mineRx ? " mine" : "") + '" data-rx="' + e + '" data-rxp="' + esc(path) + '">' + e + " " + cnt[e] + "</span>";
    for (var i = 0; i < RX.length; i++) bar += '<button type="button" class="rxb' + (RX[i] === mineRx ? " mine" : "") + '" data-rx="' + RX[i] + '" data-rxp="' + esc(path) + '">' + RX[i] + "</button>";
    bar += '<button type="button" class="rxb" data-cpreply="' + esc(path) + '" data-cpn="' + esc(m.n || "کاربر") + '" data-cpx="' + esc(String(m.text || "").slice(0, 70)) + '">↩</button>';
    h += '<div class="rxchips">' + chips + '</div><div class="rxbar">' + bar + "</div>";
    h += '<div class="xs mut row" style="gap:8px;margin-top:3px">' + R.time(m.t);
    h += mine ? '<a data-dm="' + esc(path) + '" style="cursor:pointer">✕ حذف</a>' : '<a data-rpm="' + esc(path) + '" style="cursor:pointer">🚩</a>';
    return h + "</div></div></div>";
  };

  /* ۴) بعد از رندر */
  function afterPaint() { paintBadges(); paintOnline(); paintReplyBars(); emojiBtns(); typingWire(); paintUnread(); }
  R.cpAfter = afterPaint;
  ["renderChat", "renderTeam", "renderDM"].forEach(function (fn) {
    var o = R[fn]; if (typeof o !== "function") return;
    R[fn] = function () { var x = o.apply(this, arguments); try { afterPaint(); } catch (e) {} return x; };
  });

  /* ۵) کلیک‌ها */
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var rx = t.closest("[data-rx]");
    if (rx) {
      e.preventDefault();
      if (!R.ME) return R.needLogin("واکنش");
      var p = rx.getAttribute("data-rxp"), em = rx.getAttribute("data-rx");
      var m = R.cpIndex[p] || {}, my = (m.react && m.react[R.ME]) || null;
      var ref = R.db.ref(p + "/react/" + R.ME);
      if (my === em) ref.remove(); else ref.set(em);
      return;
    }
    var rp = t.closest("[data-cpreply]");
    if (rp) {
      e.preventDefault();
      if (!R.ME) return R.needLogin("پاسخ");
      reply = { n: rp.getAttribute("data-cpn") || "کاربر", x: rp.getAttribute("data-cpx") || "" };
      paintReplyBars();
      var inp = document.querySelector(".sec.on .cbar input");
      if (inp) { try { inp.focus(); } catch (er) {} }
      return;
    }
    var c = t.closest("[data-cprpc]");
    if (c) { e.preventDefault(); reply = null; paintReplyBars(); return; }
    if (!t.closest(".cpmsg")) R.qa(".cpmsg.rxopen").forEach(function (x) { x.classList.remove("rxopen"); });
    else if (TOUCH && t.closest(".bub")) { var g = t.closest(".cpmsg"); if (g) g.classList.toggle("rxopen"); }
    if (!t.closest(".cpemoji")) R.qa(".cpemojiPanel.on").forEach(function (x) { x.classList.remove("on"); });
  });

  /* ۶) تزریق ریپلای در ارسال */
  var _add = R.add;
  R.add = function (path, obj) {
    try {
      if (obj && typeof obj.text === "string") {
        var ok = path === "chat" || path.indexOf("chat/") === 0 || path.indexOf("team/") === 0 ||
                 path.indexOf("dm/") === 0 || path.indexOf("groupMsgs/") === 0;
        if (ok && reply) { obj.rp = reply; reply = null; setTimeout(paintReplyBars, 0); }
        if (path === "chat" && R.ME) R.db.ref("chatPlus/typing/chat/" + R.ME).remove().catch(function () {});
      }
    } catch (e) {}
    return _add(path, obj);
  };

  /* ۷) نوار «در حال پاسخ» */
  function bars() {
    R.qa(".cbar").forEach(function (bar) {
      if (bar.querySelector(".cpreplying")) return;
      var d = document.createElement("div");
      d.className = "cpreplying";
      d.innerHTML = '<b></b><span class="mut"></span><button type="button" data-cprpc>✕</button>';
      bar.appendChild(d);
    });
  }
  function paintReplyBars() {
    bars();
    R.qa(".cpreplying").forEach(function (d) {
      d.classList.toggle("on", !!reply);
      if (reply) {
        var b = d.querySelector("b"), s = d.querySelector("span");
        if (b) b.textContent = "↩ " + reply.n;
        if (s) s.textContent = reply.x || "";
      }
    });
  }

  /* ۸) ایموجی */
  function emojiBtns() {
    R.qa(".cbar").forEach(function (bar) {
      if (bar.querySelector(".cpemoji")) return;
      var inp = bar.querySelector("input"); if (!inp) return;
      var w = document.createElement("span"); w.className = "cpemoji";
      w.innerHTML = '<button type="button" class="cpemjBtn" title="ایموجی">😊</button><div class="cpemojiPanel">' +
        EMO.map(function (e) { return '<button type="button" class="cpemj">' + e + "</button>"; }).join("") + "</div>";
      bar.appendChild(w);
      w.querySelector(".cpemjBtn").addEventListener("click", function (ev) {
        ev.stopPropagation();
        var p = w.querySelector(".cpemojiPanel");
        R.qa(".cpemojiPanel.on").forEach(function (x) { if (x !== p) x.classList.remove("on"); });
        p.classList.toggle("on");
      });
      w.querySelector(".cpemojiPanel").addEventListener("click", function (ev) {
        var b = ev.target.closest(".cpemj"); if (!b) return;
        inp.value += b.textContent;
        try { inp.focus(); } catch (e) {}
      });
    });
  }

  /* ۹) «در حال نوشتن» */
  function typingWire() {
    var inp = R.$("chatIn");
    if (!inp || !R.ME || inp._cpTyp) return;
    inp._cpTyp = 1;
    inp.addEventListener("input", function () {
      if (!R.ME) return;
      var now = Date.now();
      if (now - typLast < 2500) return;
      typLast = now;
      var ref = R.db.ref("chatPlus/typing/chat/" + R.ME);
      try { ref.onDisconnect().remove(); } catch (e) {}
      ref.set({ n: (R.USER && R.USER.name) || "کاربر", t: now });
    });
  }
  function typingListen() {
    if (typRef || !R.db) return;
    typRef = R.db.ref("chatPlus/typing/chat");
    typRef.on("value", function (s) { typing = s.val() || {}; paintTyping(); }, function () {});
  }
  function paintTyping() {
    var box = R.$("chatBox"); if (!box) return;
    var chat = box.closest(".chat") || box.parentNode; if (!chat) return;
    var d = chat.querySelector(".cpTyping");
    if (!d) {
      d = document.createElement("div"); d.className = "cpTyping";
      d.innerHTML = "<i></i><i></i><i></i><span></span>";
      chat.appendChild(d);
    }
    var now = Date.now(), names = [];
    for (var u in typing) {
      var e = typing[u];
      if (u === R.ME || !e) continue;
      if (now - (e.t || 0) < 5000) names.push(e.n || "کاربر");
    }
    d.classList.toggle("on", names.length > 0);
    var sp = d.querySelector("span");
    if (sp && names.length) sp.textContent = names.slice(0, 2).join("، ") + " در حال نوشتن…";
  }
  setInterval(function () { if (R.cur === "chat") paintTyping(); }, 2500);

  /* ۱۰) شمارنده نخوانده */
  function seenK() { return "cp_seen_" + (R.ME || "guest"); }
  function lastSeen() { try { return +(localStorage.getItem(seenK()) || 0); } catch (e) { return 0; } }
  function markSeen() { try { localStorage.setItem(seenK(), String(Date.now())); } catch (e) {} paintUnread(); }
  function paintUnread() {
    if (R.cur === "chat") { try { localStorage.setItem(seenK(), String(Date.now())); } catch (e) {} }
    var last = lastSeen(), n = 0, c = R.CHAT || {};
    if (R.cur !== "chat") for (var k in c) if ((c[k].t || 0) > last && c[k].uid !== R.ME) n++;
    R.qa('[data-go="chat"]').forEach(function (el) {
      var b = el.querySelector(".cpunread");
      if (!n) { if (b) b.remove(); return; }
      if (!b) { b = document.createElement("i"); b.className = "cpunread"; el.appendChild(b); }
      b.textContent = n > 99 ? "99+" : String(n);
    });
  }

  /* ۱۱) راه‌اندازی */
  if (!R.hooks) R.hooks = {};
  var _hc = R.hooks.chat;
  R.hooks.chat = function () {
    if (typeof _hc === "function") { try { _hc(); } catch (e) {} }
    setTimeout(function () { markSeen(); afterPaint(); }, 250);
  };
  function sync() {
    presence(); typingWire(); emojiBtns(); bars();
    if (R.cur === "chat") markSeen(); else paintUnread();
  }
  if (R.auth && R.auth.onAuthStateChanged) R.auth.onAuthStateChanged(function () { setTimeout(sync, 900); });
  setTimeout(function () { sync(); typingListen(); }, 1400);
})();


/* ── لایهٔ ۲: Chat Pro (روز، گروه‌بندی، جستجو، سنجاق، پیش‌نویس) ── */
/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — CHAT PRO v1                        chat-pro.js
   ارتقای چت عمومی (فایل افزودنی — به فایل‌های قبلی دست نمی‌زند)
   ───────────────────────────────────────────────────────────────
   • جداکنندهٔ روز (امروز / دیروز / تاریخ) برای هر سه اتاق
   • گروه‌بندی پیام‌های پشت‌سرهم یک نفر (آواتار و نام تکرار نمی‌شود)
   • لینک خودکار + هایلایت @منشن
   • سنجاق اعلان توسط مالک (نوار بالای چت)
   • ویرایش پیام خودت + برچسب «ویرایش‌شده»
   • جستجو در پیام‌های چت عمومی
   • حفظ جای اسکرول + دکمهٔ «پیام تازه ↓»
   • پیش‌نویس خودکار + ارسال دوباره در صورت خطا
   • شمارندهٔ کاراکتر + صدای نرم اعلان (پیش‌فرض خاموش)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__cp2) return;
  R.__cp2 = true;

  var LIMIT = 500;
  var S = { pin: null, q: "", sound: false, seen: false, count: 0 };
  try { S.sound = localStorage.getItem("cp2_sound") === "1"; } catch (e) {}

  /* ── ۰. کمک‌ها ─────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function isOwner() { try { return !!R.isOwner(); } catch (e) { return false; } }
  function boxOf(which) { return which === "chat" ? $("chatBox") : which === "team" ? $("teamBox") : $("dmBox"); }
  function msgOf(path) { return (R.cpIndex && R.cpIndex[path]) || null; }
  function toast(m, k) { try { if (R.toast) R.toast(m, k || "ok"); } catch (e) {} }

  function pathOf(row) {
    var a = row.querySelector("[data-dm],[data-rpm]");
    if (!a) return null;
    return a.getAttribute("data-dm") || a.getAttribute("data-rpm");
  }

  function dayKey(t) {
    if (!t) return "";
    var d = new Date(t);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function dayLabel(t) {
    var k = dayKey(t), now = new Date();
    if (!k) return "";
    if (k === dayKey(now.getTime())) return "امروز";
    if (k === dayKey(now.getTime() - 86400000)) return "دیروز";
    try {
      return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" })
        .format(new Date(t));
    } catch (e) { return new Date(t).toLocaleDateString("fa-IR"); }
  }

  /* ── ۱. استایل ─────────────────────────────────────────── */
  function css() {
    if ($("cp2Css")) return;
    var s = document.createElement("style");
    s.id = "cp2Css";
    s.textContent =
      /* جداکنندهٔ روز */
      ".cp2sep{display:flex;align-items:center;gap:8px;margin:12px 2px 6px;font-size:10px;" +
      "color:#8f9ac9;font-weight:700;letter-spacing:.2px}" +
      ".cp2sep::before,.cp2sep::after{content:'';flex:1;height:1px;" +
      "background:linear-gradient(90deg,transparent,rgba(140,160,255,.35),transparent)}" +
      ".cp2sep b{padding:2px 9px;border-radius:99px;background:rgba(255,255,255,.05);" +
      "border:1px solid rgba(140,160,255,.18);font-weight:800}" +

      /* گروه‌بندی */
      ".cpmsg.cpg{margin-top:-4px}" +
      ".cpmsg.cpg .avw{visibility:hidden;height:0;margin:0}" +
      ".cpmsg.cpg .cpname{display:none}" +
      ".cpmsg.cpg .bub{border-top-inline-start-radius:8px}" +

      /* لینک و منشن */
      ".cp2a{color:#8fdcff;text-decoration:underline;text-underline-offset:2px;word-break:break-all}" +
      ".cp2a:hover{color:#c8f0ff}" +
      ".cp2m{color:#0a0d22;background:linear-gradient(135deg,#7c5cff,#22d3ee);" +
      "padding:0 5px;border-radius:6px;font-weight:800;font-size:.92em}" +
      ".cp2ed{color:#9aa4cf;font-size:9.5px;font-style:normal;opacity:.85}" +

      /* ابزار ردیف */
      ".cp2tools{display:inline-flex;gap:5px;align-items:center}" +
      ".cp2tb{cursor:pointer;font-size:11px;line-height:1;opacity:.55;transition:.15s;" +
      "padding:1px 3px;border-radius:6px}" +
      ".cp2tb:hover{opacity:1;background:rgba(124,92,255,.22)}" +

      /* ویرایش درجا */
      ".bub.cp2editing{padding:8px}" +
      ".cp2ta{width:100%;min-height:52px;resize:vertical;padding:7px 9px;border-radius:10px;" +
      "font-family:inherit;font-size:12.5px;line-height:1.7;color:inherit;" +
      "background:rgba(6,9,22,.5);border:1px solid rgba(47,230,255,.4);box-sizing:border-box}" +
      ".cp2row{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}" +
      ".cp2ok,.cp2no{font-family:inherit;font-size:10.5px;font-weight:800;cursor:pointer;" +
      "padding:4px 10px;border-radius:9px;border:1px solid transparent}" +
      ".cp2ok{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff;border:0}" +
      ".cp2no{background:transparent;color:#ff9a9a;border-color:rgba(255,154,154,.4)}" +
      ".cp2err{font-size:10px;color:#ff9a9a}" +

      /* نوار سنجاق */
      ".cp2pin{display:none;align-items:center;gap:8px;padding:8px 11px;margin-bottom:8px;" +
      "border-radius:12px;font-size:11px;color:#dfe6ff;" +
      "background:linear-gradient(135deg,rgba(124,92,255,.24),rgba(34,211,238,.14));" +
      "border:1px solid rgba(124,92,255,.45)}" +
      ".cp2pin.on{display:flex}" +
      ".cp2pi{font-size:14px;flex:0 0 auto}" +
      ".cp2pt{min-width:0;display:flex;flex-direction:column;gap:1px}" +
      ".cp2pt b{font-size:10px;color:#9fe8ff;font-weight:800}" +
      ".cp2pt small{font-size:11px;color:#e6eaff;overflow:hidden;text-overflow:ellipsis;" +
      "white-space:nowrap;max-width:100%}" +
      ".cp2pn{margin-inline-start:auto;border:0;background:transparent;cursor:pointer;" +
      "color:#ff9a9a;font-size:14px;padding:0 2px}" +

      /* دکمهٔ پیام تازه */
      ".cp2jump{position:absolute;bottom:64px;inset-inline-end:12px;z-index:8;display:none;" +
      "align-items:center;gap:5px;padding:6px 11px;border-radius:99px;cursor:pointer;" +
      "font-family:inherit;font-size:10.5px;font-weight:800;color:#fff;border:0;" +
      "background:linear-gradient(135deg,#7c5cff,#22d3ee);box-shadow:0 10px 24px -10px rgba(124,92,255,.9)}" +
      ".cp2jump.show{display:inline-flex}" +

      /* جستجو */
      ".cp2sw{display:inline-flex;align-items:center;gap:6px;margin-inline-start:auto}" +
      ".cp2srch{width:118px;padding:4px 9px;border-radius:99px;font-family:inherit;font-size:10.5px;" +
      "color:#e8ecff;background:rgba(6,9,22,.5);border:1px solid rgba(140,160,255,.25)}" +
      ".cp2srch:focus{outline:none;border-color:rgba(34,211,238,.6);width:150px}" +
      ".cp2shits{font-size:9.5px;color:#8f9ac9;white-space:nowrap}" +
      ".cpmsg.cp2dim{opacity:.26}" +

      /* شمارنده و صدا */
      ".cp2cc{font-size:9.5px;color:#8f9ac9;align-self:center;margin-inline-start:2px}" +
      ".cp2cc.warn{color:#ffd479}" +
      ".cp2snd{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;" +
      "cursor:pointer;font-size:15px;padding:0;border:1px solid rgba(140,160,255,.22);" +
      "background:rgba(10,12,32,.45)}" +

      /* روشن */
      "html[data-theme='light'] .cp2sep b{background:rgba(255,255,255,.9);color:#3b4a80}" +
      "html[data-theme='light'] .cp2ta{background:#fff;color:#151a3a}" +
      "html[data-theme='light'] .cp2pin{color:#1b2350}" +
      "html[data-theme='light'] .cp2pt small{color:#1b2350}" +
      "html[data-theme='light'] .cp2srch{background:#fff;color:#151a3a}" +

      "@media(max-width:520px){" +
      ".cp2srch{width:92px}.cp2srch:focus{width:118px}" +
      ".cp2jump{bottom:58px;inset-inline-end:8px}" +
      "}";
    document.head.appendChild(s);
  }

  try { css(); } catch (e) {}

  /* ── ۲. لینک و منشن ───────────────────────────────────── */
  var RX = /(https?:\/\/[^\s<>"']+)|(@[\w\u0600-\u06FF]{2,24})/g;

  function linkifyBub(bub) {
    if (!bub || bub.querySelector(".cp2a,.cp2m")) return;
    var text = bub.textContent || "";
    if (!/https?:\/\/|@/.test(text)) return;
    var frag = document.createDocumentFragment(), last = 0, m;
    RX.lastIndex = 0;
    while ((m = RX.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      if (m[1]) {
        var a = document.createElement("a");
        a.className = "cp2a";
        a.href = m[1];
        a.target = "_blank";
        a.rel = "noopener noreferrer nofollow";
        a.textContent = m[1];
        frag.appendChild(a);
      } else {
        var sp = document.createElement("span");
        sp.className = "cp2m";
        sp.textContent = m[2];
        frag.appendChild(sp);
      }
      last = m.index + m[0].length;
    }
    if (!frag.childNodes.length) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    bub.textContent = "";
    bub.appendChild(frag);
  }

  /* ── ۳. ابزار روی ردیف ────────────────────────────────── */
  function addTools(row, path, m) {
    if (!path) return;
    var meta = row.querySelector(".xs.mut.row") || row.lastElementChild;
    if (!meta || meta.querySelector(".cp2tools")) return;
    var w = document.createElement("span");
    w.className = "cp2tools";
    var html = "";
    if (m && m.uid && m.uid === R.ME) {
      html += '<a class="cp2tb" data-cp2edit="' + esc(path) + '" title="ویرایش">✏️</a>';
    }
    if (isOwner() && path.indexOf("chat/") === 0) {
      html += '<a class="cp2tb" data-cp2pin="' + esc(path) + '" title="سنجاق اعلان">📌</a>';
    }
    if (!html) return;
    w.innerHTML = html;
    meta.insertBefore(w, meta.firstChild);
  }

  function markEdited(row) {
    var meta = row.querySelector(".xs.mut.row") || row.lastElementChild;
    if (!meta || meta.querySelector(".cp2ed")) return;
    var i = document.createElement("i");
    i.className = "cp2ed";
    i.textContent = "ویرایش‌شده";
    meta.appendChild(i);
  }

  /* ── ۴. آرایش اتاق ────────────────────────────────────── */
  function decorate(box) {
    if (!box) return;
    qa(".cp2sep", box).forEach(function (n) { n.remove(); });
    var rows = qa(".cpmsg", box);
    var lastDay = "", prev = null;
    rows.forEach(function (row) {
      var path = pathOf(row);
      var m = msgOf(path);
      var t = (m && m.t) || 0;
      var dk = dayKey(t);
      if (dk && dk !== lastDay) {
        var sep = document.createElement("div");
        sep.className = "cp2sep";
        sep.innerHTML = "<b>" + esc(dayLabel(t)) + "</b>";
        box.insertBefore(sep, row);
        lastDay = dk;
        prev = null;
      }
      var grouped = !!(prev && m && prev.uid && prev.uid === m.uid &&
        t - (prev.t || 0) < 300000 && !row.querySelector(".cprp"));
      row.classList.toggle("cpg", grouped);
      prev = m || prev;

      if (!row.__cp2) {
        row.__cp2 = 1;
        qa(".bub", row).forEach(linkifyBub);
        addTools(row, path, m);
        if (m && m.ed) markEdited(row);
      }
    });
    if (box.id === "chatBox") filter();
    ensureJump(box);
  }
  R.afterRender = (function (prev) {
    return function (el) {
      if (typeof prev === "function") prev.call(R, el);
      try { decorate(el); } catch (e) {}
      try {
        var n = Object.keys(R.CHAT || {}).length;
        if (S.seen && n > S.count && R.cur !== "chat") beep();
        S.count = n;
        S.seen = true;
      } catch (e) {}
    };
  })(R.afterRender);

  /* ── ۵. اسکرول ────────────────────────────────────────── */
  function nearBottom(box) {
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  }
  function ensureJump(box) {
    if (!box) return;
    var chat = box.closest ? box.closest(".chat") : null;
    if (!chat) return;
    var b = chat.querySelector(".cp2jump");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "cp2jump";
      b.textContent = "پیام تازه ↓";
      b.addEventListener("click", function () {
        try { box.scrollTo({ top: box.scrollHeight, behavior: "smooth" }); }
        catch (e) { box.scrollTop = box.scrollHeight; }
        b.classList.remove("show");
      });
      chat.appendChild(b);
    }
    b.classList.toggle("show", !nearBottom(box));
  }
  ["chat", "team", "dm"].forEach(function (which) {
    var box = boxOf(which);
    if (!box) return;
    box.addEventListener("scroll", function () { ensureJump(box); }, { passive: true });
  });

  /* ── ۶. حفظ جای اسکرول در رندرهای تازه ────────────────── */
  [["renderChat", "chat"], ["renderTeam", "team"], ["renderDM", "dm"]].forEach(function (p) {
    var fn = p[0], which = p[1], orig = R[fn];
    if (typeof orig !== "function") return;
    R[fn] = function () {
      var box = boxOf(which);
      var keep = box && !nearBottom(box) ? box.scrollTop : null;
      var r = orig.apply(this, arguments);
      try {
        if (box && keep != null) box.scrollTop = keep;
        ensureJump(box);
      } catch (e) {}
      return r;
    };
  });

  /* ── ۷. سنجاق / اعلان ────────────────────────────────── */
  function ensurePinBar() {
    var chat = document.querySelector("#sec-chat .chat");
    if (!chat) return null;
    var b = chat.querySelector(".cp2pin");
    if (!b) {
      b = document.createElement("div");
      b.className = "cp2pin";
      var body = chat.querySelector(".cbody");
      chat.insertBefore(b, body || null);
    }
    return b;
  }
  function paintPin() {
    var b = ensurePinBar();
    if (!b) return;
    var p = S.pin;
    if (!p || !p.text) { b.classList.remove("on"); b.textContent = ""; return; }
    b.classList.add("on");
    b.innerHTML = '<span class="cp2pi">📌</span><div class="cp2pt"><b></b><small></small></div>' +
      (isOwner() ? '<button type="button" class="cp2pn" title="برداشتن سنجاق">✕</button>' : "");
    b.querySelector(".cp2pt b").textContent = p.n || "اعلان";
    b.querySelector(".cp2pt small").textContent = p.text;
    var x = b.querySelector(".cp2pn");
    if (x) x.addEventListener("click", function () {
      if (R.db) R.db.ref("settings/chat/pin").remove();
    });
  }
  function watchPin() {
    if (!R.db || S.pinW) return;
    S.pinW = 1;
    try {
      R.db.ref("settings/chat/pin").on("value", function (s) {
        S.pin = s.val() || null;
        paintPin();
      }, function () {});
    } catch (e) {}
  }

  /* ── ۸. ویرایش درجا ─────────────────────────────────── */
  function startEdit(row, path) {
    if (!row || !R.db) return;
    var bub = row.querySelector(".bub");
    if (!bub || bub.querySelector(".cp2ta")) return;
    var m = msgOf(path) || {};
    var old = m.text || bub.textContent || "";
    var lim = path.indexOf("chat/") === 0 ? LIMIT : 800;
    bub.classList.add("cp2editing");
    bub.textContent = "";
    var ta = document.createElement("textarea");
    ta.className = "cp2ta";
    ta.maxLength = lim;
    ta.value = old;
    var row2 = document.createElement("div");
    row2.className = "cp2row";
    var ok = document.createElement("button");
    ok.type = "button"; ok.className = "cp2ok"; ok.textContent = "ذخیره";
    var no = document.createElement("button");
    no.type = "button"; no.className = "cp2no"; no.textContent = "لغو";
    var er = document.createElement("span");
    er.className = "cp2err";
    row2.appendChild(ok); row2.appendChild(no); row2.appendChild(er);
    bub.appendChild(ta); bub.appendChild(row2);
    try { ta.focus(); ta.setSelectionRange(old.length, old.length); } catch (e) {}

    no.addEventListener("click", function () { if (R.renderChat) R.renderChat(); });
    ok.addEventListener("click", function () {
      var v = (R.clean ? R.clean(ta.value, lim) : ta.value.slice(0, lim)).trim();
      if (!v) { er.textContent = "متن خالی است"; return; }
      if (v === old) { if (R.renderChat) R.renderChat(); return; }
      ok.disabled = true;
      R.db.ref(path).update({ text: v, ed: Date.now() }).then(function () {
        toast("ویرایش شد ✅", "ok");
      }).catch(function (e) {
        ok.disabled = false;
        er.textContent = e.message || "ذخیره نشد";
      });
    });
  }

  /* ── ۹. جستجو در چت عمومی ─────────────────────────────── */
  function filter() {
    var box = $("chatBox");
    if (!box) return;
    var rows = qa(".cpmsg", box), hits = 0;
    rows.forEach(function (row) {
      var m = msgOf(pathOf(row));
      var txt = ((m && m.text) || row.textContent || "").toLowerCase();
      var hit = !S.q || txt.indexOf(S.q) > -1;
      row.classList.toggle("cp2dim", !hit);
      if (S.q && hit) hits++;
    });
    var c = document.querySelector("#sec-chat .cp2shits");
    if (c) c.textContent = S.q ? fa(hits) + " نتیجه" : "";
  }
  function ensureSearch() {
    var head = document.querySelector("#sec-chat .chead");
    if (!head || head.querySelector(".cp2sw")) return;
    var w = document.createElement("span");
    w.className = "cp2sw";
    var inp = document.createElement("input");
    inp.className = "cp2srch";
    inp.placeholder = "جستجو در پیام‌ها…";
    inp.maxLength = 40;
    inp.addEventListener("input", function () {
      S.q = inp.value.trim().toLowerCase();
      filter();
    });
    var b = document.createElement("b");
    b.className = "cp2shits";
    w.appendChild(inp); w.appendChild(b);
    head.appendChild(w);
  }

  /* ── ۱۰. پیش‌نویس، شمارنده، صدا ───────────────────────── */
  function dkey() { return "cp2_draft_" + (R.ME || "guest"); }
  function saveDraft(v) {
    try { if (v) localStorage.setItem(dkey(), v); else localStorage.removeItem(dkey()); } catch (e) {}
  }
  function restoreDraft() {
    var i = $("chatIn");
    if (!i || i.value) return;
    try { var v = localStorage.getItem(dkey()); if (v) i.value = v; } catch (e) {}
  }
  function paintCount() {
    var i = $("chatIn"), c = document.querySelector("#sec-chat .cp2cc");
    if (!i || !c) return;
    var n = i.value.length;
    c.textContent = fa(n) + "/" + fa(LIMIT);
    c.classList.toggle("warn", n > LIMIT - 60);
  }
  var AC = null;
  function beep() {
    if (!S.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = 660;
      g.gain.value = 0.035;
      o.connect(g); g.connect(AC.destination);
      o.start(); o.stop(AC.currentTime + 0.11);
    } catch (e) {}
  }
  function paintSoundBtn() {
    var b = document.querySelector("#sec-chat .cp2snd");
    if (b) b.textContent = S.sound ? "🔔" : "🔕";
  }

  /* ── ۱۱. ارسال مطمئن چت عمومی ─────────────────────────── */
  R.sendChat = function () {
    if (!R.ME) return R.needLogin ? R.needLogin("فرستادن پیام") : null;
    var i = $("chatIn");
    if (!i) return;
    var txt = (R.clean ? R.clean(i.value, LIMIT) : String(i.value).slice(0, LIMIT)).trim();
    if (!txt) return;
    if (Date.now() - (R._cp2At || 0) < 1500) return toast("یه کم آرام‌تر ⏳", "err");
    R._cp2At = Date.now();
    i.value = "";
    saveDraft("");
    paintCount();
    var p = R.add("chat", {
      uid: R.ME,
      n: (R.USER && R.USER.name) || "کاربر",
      av: (R.USER && R.USER.av) || "",
      text: txt
    });
    if (p && p.catch) {
      p.catch(function (e) {
        i.value = txt;
        saveDraft(txt);
        paintCount();
        toast("پیام نرفت — دوباره بفرست: " + (e.message || ""), "err");
      });
    }
  };

  /* ── ۱۲. رویدادها ─────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var pin = t.closest("[data-cp2pin]");
    if (pin) {
      e.preventDefault();
      if (!isOwner() || !R.db) return;
      var path = pin.getAttribute("data-cp2pin");
      var m = msgOf(path) || {};
      R.db.ref("settings/chat/pin").set({
        id: (m.id || path),
        n: m.n || "اعلان",
        text: String(m.text || "").slice(0, 140),
        t: Date.now()
      }).then(function () { toast("سنجاق شد 📌", "ok"); })
        .catch(function (er) { toast("نشد: " + er.message, "err"); });
      return;
    }

    var ed = t.closest("[data-cp2edit]");
    if (ed) {
      e.preventDefault();
      var row = ed.closest(".cpmsg");
      startEdit(row, ed.getAttribute("data-cp2edit"));
      return;
    }

    var snd = t.closest(".cp2snd");
    if (snd) {
      S.sound = !S.sound;
      try { localStorage.setItem("cp2_sound", S.sound ? "1" : "0"); } catch (er) {}
      paintSoundBtn();
      if (S.sound) beep();
      toast(S.sound ? "صدای اعلان روشن شد 🔔" : "صدای اعلان خاموش شد 🔕", "ok");
    }
  });

  /* ── ۱۳. راه‌اندازی ───────────────────────────────────── */
  function boot() {
    css();
    ensureSearch();
    ensurePinBar();
    watchPin();
    paintPin();

    var chat = document.querySelector("#sec-chat .chead");
    if (chat && !chat.querySelector(".cp2snd")) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cp2snd";
      b.title = "صدای اعلان";
      b.addEventListener("click", function () {
        S.sound = !S.sound;
        try { localStorage.setItem("cp2_sound", S.sound ? "1" : "0"); } catch (e) {}
        paintSoundBtn();
        if (S.sound) beep();
      });
      chat.insertBefore(b, chat.firstChild ? chat.firstChild.nextSibling : null);
      paintSoundBtn();
    }

    var bar = document.querySelector("#sec-chat .cbar");
    if (bar && !bar.querySelector(".cp2cc")) {
      var c = document.createElement("b");
      c.className = "cp2cc";
      bar.appendChild(c);
      paintCount();
    }

    var inp = $("chatIn");
    if (inp && !inp.__cp2) {
      inp.__cp2 = 1;
      inp.addEventListener("input", function () { saveDraft(inp.value); paintCount(); });
      restoreDraft();
      paintCount();
    }

    ["chat", "team", "dm"].forEach(function (w) {
      var box = boxOf(w);
      if (box) { decorate(box); ensureJump(box); }
    });
  }

  /* قلاب ورود/خروج و شروع */
  var onIn = R.onLogin;
  R.onLogin = function () {
    if (typeof onIn === "function") { try { onIn(); } catch (e) {} }
    setTimeout(function () { boot(); restoreDraft(); }, 800);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [400, 1200, 2600].forEach(function (ms) { setTimeout(boot, ms); });
  if (R.cur === "chat" || !R.cur) setTimeout(boot, 3200);

  /* API برای تست */
  R.chatPro = {
    decorate: decorate, paintPin: paintPin, setPin: function (p) { S.pin = p; paintPin(); },
    filter: filter, dayKey: dayKey, dayLabel: dayLabel, linkifyBub: linkifyBub,
    saveDraft: saveDraft, restoreDraft: restoreDraft, nearBottom: nearBottom,
    state: S
  };
})();


/* ── لایهٔ ۳: Chat Ultra (قاب سینمایی، تمام‌صفحه، ظاهر نهایی) ── */
/* ═══ RONIN STORE — CHAT ULTRA · ronin-chat-ultra.js · v1
   ارتقای چت عمومی (فایل افزودنی — به هیچ فایل قبلی دست نمی‌زند)
   ───────────────────────────────────────────────────────────────
   • قاب سینمایی بزرگ با هالهٔ نئونی و شیشهٔ مات (نه جعبهٔ کوچک)
   • حالت تمام‌صفحه (⛶) با خروج سریع و کلید Esc — یادش می‌ماند
   • حباب‌های شیشه‌ای، آواتار حلقه‌دار، نام گرادیانی، ورود پله‌پله
   • ساعت درست به‌جای Invalid Date + تاریخ کامل روی هاور
   • نوار ورودی شیشه‌ای با درخشش فوکوس و دکمهٔ ارسال گرادیانی
   • شمارندهٔ آنلاین زنده در هدر، دکمهٔ «پیام تازه» درخشان
   • انفجار ایموجی هنگام واکنش + تم روشن + احترام به کاهش حرکت
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__chx) return;
  R.__chx = true;

  var VER = "v1";
  var FULL_KEY = "chx_full";

  function $(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function sec() { return $("#sec-chat"); }
  function card() { return $("#sec-chat .chat"); }
  function box() { return $("#chatBox"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fa(s) { try { return R.fa ? R.fa(s) : String(s); } catch (e) { return String(s); } }
  function calm() { try { return matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) { return false; } }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if ($("#chxCss")) return;
    var s = document.createElement("style");
    s.id = "chxCss";
    s.textContent = [
      /* ── قاب کارت ── */
      "#sec-chat>.head{display:none!important}",
      "#sec-chat{padding-top:10px!important;padding-bottom:6px!important}",
      "#sec-chat .chat{position:relative!important;isolation:isolate;overflow:hidden!important;" +
        "height:clamp(420px,calc(100dvh - 234px),820px)!important;margin-top:34px!important;" +
        "border-radius:26px!important;" +
        "border:1px solid rgba(124,92,255,.30)!important;" +
        "background:radial-gradient(120% 85% at 100% 0%,rgba(124,92,255,.22),transparent 58%)," +
        "radial-gradient(95% 70% at 0% 100%,rgba(255,79,216,.15),transparent 62%)," +
        "linear-gradient(180deg,rgba(12,16,42,.95),rgba(5,8,22,.97))!important;" +
        "box-shadow:0 36px 90px -40px rgba(96,64,240,.85),0 0 0 1px rgba(255,255,255,.04) inset!important;" +
        "transition:height .45s cubic-bezier(.16,1,.3,1),border-radius .4s,transform .4s}",

      /* نور جاروب‌شونده روی شیشه */
      "#sec-chat .chat::after{content:\"\";position:absolute;inset:0;z-index:1;pointer-events:none;" +
        "border-radius:inherit;opacity:.55;" +
        "background:linear-gradient(112deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%);" +
        "background-size:280% 100%;animation:chxSweep 8s ease-in-out infinite}",
      "@keyframes chxSweep{0%{background-position:150% 0}55%,100%{background-position:-50% 0}}",

      /* هاله‌ها و شبکه */
      ".chxAmb{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}",
      ".chxAmb i{position:absolute;display:block;border-radius:50%;filter:blur(42px);opacity:.5}",
      ".chxAmb i:nth-child(1){width:230px;height:230px;top:-90px;inset-inline-end:-60px;" +
        "background:radial-gradient(circle,rgba(124,92,255,.9),transparent 70%);animation:chxFloat 11s ease-in-out infinite}",
      ".chxAmb i:nth-child(2){width:210px;height:210px;bottom:-100px;inset-inline-start:-70px;" +
        "background:radial-gradient(circle,rgba(47,230,255,.75),transparent 70%);animation:chxFloat 14s ease-in-out infinite reverse}",
      ".chxAmb i:nth-child(3){width:170px;height:170px;top:38%;inset-inline-start:52%;" +
        "background:radial-gradient(circle,rgba(255,79,216,.6),transparent 70%);animation:chxFloat 17s ease-in-out infinite}",
      "@keyframes chxFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-26px,0) scale(1.12)}}",
      ".chxAmb b{position:absolute;inset:0;opacity:.16;" +
        "background-image:linear-gradient(rgba(160,180,255,.5) 1px,transparent 1px)," +
        "linear-gradient(90deg,rgba(160,180,255,.5) 1px,transparent 1px);background-size:34px 34px;" +
        "mask-image:radial-gradient(120% 90% at 50% 0%,#000 20%,transparent 78%);" +
        "-webkit-mask-image:radial-gradient(120% 90% at 50% 0%,#000 20%,transparent 78%)}",

      /* ── هدر ── */
      "#sec-chat .chead{position:relative;z-index:4;padding:13px 14px!important;gap:9px;" +
        "border-bottom:1px solid rgba(124,92,255,.22)!important;" +
        "background:linear-gradient(180deg,rgba(18,22,54,.92),rgba(10,13,34,.55))!important;" +
        "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}",
      "#sec-chat .chead b.sm{display:inline-flex;align-items:center;gap:8px;font-size:13.5px!important;" +
        "font-weight:900!important;letter-spacing:.2px;color:#fff!important}",
      "#sec-chat .chead b.sm::before{content:\"\";width:8px;height:8px;border-radius:50%;flex:0 0 auto;" +
        "background:#3ddf9b;box-shadow:0 0 10px #3ddf9b,0 0 20px rgba(61,223,155,.6);animation:chxPulse 2.1s ease-in-out infinite}",
      "@keyframes chxPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.72)}}",
      "#sec-chat .chead .xs.mut{display:none!important}",
      ".chxLive{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;" +
        "font-size:10px;font-weight:800;color:#bcffe4;white-space:nowrap;" +
        "background:rgba(61,223,155,.12);border:1px solid rgba(61,223,155,.35);" +
        "box-shadow:0 0 16px rgba(61,223,155,.18) inset}",
      ".chxLive i{width:5px;height:5px;border-radius:50%;background:#3ddf9b;box-shadow:0 0 8px #3ddf9b}",
      ".chxAct{width:34px;height:34px;flex:0 0 34px;border-radius:11px;display:grid;place-items:center;" +
        "cursor:pointer;font-size:15px;padding:0;color:#dfe6ff;" +
        "border:1px solid rgba(140,160,255,.24);background:rgba(10,12,32,.5);transition:.2s}",
      ".chxAct:hover{border-color:rgba(47,230,255,.6);color:#fff;box-shadow:0 0 16px rgba(47,230,255,.35)}",
      "#sec-chat .cp2snd{width:34px!important;height:34px!important;border-radius:11px!important;" +
        "border:1px solid rgba(140,160,255,.24)!important;background:rgba(10,12,32,.5)!important;transition:.2s}",
      "#sec-chat .cp2snd:hover{border-color:rgba(47,230,255,.55)!important}",
      "#sec-chat .cp2sw{margin-inline-start:auto}",
      "#sec-chat .cp2srch{border-radius:99px!important;background:rgba(6,9,22,.6)!important;" +
        "border:1px solid rgba(140,160,255,.25)!important;transition:width .25s,border-color .2s}",
      "#sec-chat .cp2srch:focus{border-color:rgba(47,230,255,.7)!important}" +
        "box-shadow:0 0 18px rgba(47,230,255,.25)",
      "#sec-chat .cp2shits{display:none!important}",

      /* ── نوار سنجاق ── */
      "#sec-chat .cp2pin{border-radius:14px!important;backdrop-filter:blur(8px);" +
        "box-shadow:0 10px 26px -16px rgba(124,92,255,.9)}",

      /* ── بدنهٔ پیام‌ها ── */
      "#sec-chat #chatBox{position:relative;z-index:3;padding:18px 14px 12px!important;gap:12px!important;" +
        "scrollbar-width:thin;scrollbar-color:rgba(124,92,255,.6) transparent}",
      "#sec-chat #chatBox::-webkit-scrollbar{width:6px}",
      "#sec-chat #chatBox::-webkit-scrollbar-thumb{border-radius:99px;" +
        "background:linear-gradient(180deg,rgba(124,92,255,.9),rgba(47,230,255,.8))}",
      "#sec-chat .cpmsg{max-width:88%!important}",
      "#sec-chat .cpmsg.chxIn{animation:chxMsg .5s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes chxMsg{from{opacity:0;transform:translateY(14px) scale(.975)}" +
        "to{opacity:1;transform:none}}",

      /* آواتار */
      "#sec-chat .avw{position:relative}",
      "#sec-chat .avw .av{width:34px!important;height:34px!important;font-size:12px!important;" +
        "font-weight:900!important;border-radius:12px!important;overflow:hidden;" +
        "box-shadow:0 0 0 1px rgba(124,92,255,.45),0 8px 18px -8px rgba(0,0,0,.9)," +
        "0 0 14px rgba(124,92,255,.28)}",
      "#sec-chat .avw .av img{width:100%;height:100%;object-fit:cover}",
      "#sec-chat .cpmsg.me .avw .av{box-shadow:0 0 0 1px rgba(47,230,255,.55),0 0 16px rgba(47,230,255,.35)}",
      "#sec-chat .avw .ondot{width:9px!important;height:9px!important;bottom:-1px!important;" +
        "inset-inline-end:-1px!important;border-width:2px!important;border-color:#080c22!important}",

      /* نام و نشان */
      "#sec-chat .cpname{font-size:11.5px!important;font-weight:900!important;letter-spacing:.2px;" +
        "margin:0 5px 4px!important;background:linear-gradient(90deg,#a9ecff,#cfc2ff 70%);" +
        "-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#sec-chat .cpname .cpbadge{-webkit-text-fill-color:#ffce56!important;color:#ffce56!important;" +
        "font-size:9px!important;padding:1px 5px!important}",
      "#sec-chat .cpmsg.me .cpname{background:linear-gradient(90deg,#c9b6ff,#9ff3ff);" +
        "-webkit-background-clip:text;background-clip:text}",

      /* حباب */
      "#sec-chat .cpmsg .bub{padding:10px 14px!important;font-size:13.5px!important;" +
        "line-height:1.85!important;border-radius:18px 18px 18px 6px!important;word-break:break-word;" +
        "background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.042))!important;" +
        "border:1px solid rgba(150,140,255,.2)!important;" +
        "box-shadow:0 14px 30px -18px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.06)!important;" +
        "transition:border-color .2s,transform .2s}",
      "#sec-chat .cpmsg:hover .bub{border-color:rgba(150,170,255,.4)!important}",
      "#sec-chat .cpmsg.me .bub{border-radius:18px 18px 6px 18px!important;color:#fff!important;" +
        "background:linear-gradient(135deg,rgba(124,92,255,.62),rgba(47,230,255,.34))!important;" +
        "border-color:rgba(120,200,255,.45)!important;" +
        "box-shadow:0 18px 34px -18px rgba(96,70,255,.95),inset 0 1px 0 rgba(255,255,255,.2)!important}",
      "#sec-chat .cpmsg.cpg{margin-top:-4px!important}",
      "#sec-chat .cpmsg.cpg .bub{border-top-inline-start-radius:8px!important}",
      "#sec-chat .cp2a{color:#8fdcff!important}",

      /* متادیتا و ساعت */
      "#sec-chat .chxMeta{display:flex!important;align-items:center;gap:7px;margin-top:5px!important;" +
        "font-size:10px!important;font-weight:700;letter-spacing:.2px;" +
        "color:rgba(180,192,230,.62)!important;opacity:1!important;transition:color .2s}",
      "#sec-chat .cpmsg:hover .chxMeta{color:rgba(210,220,255,.95)!important}",
      "#sec-chat .chxMeta a{font-size:11px!important;opacity:.55;text-decoration:none;transition:.18s}",
      "#sec-chat .chxMeta a:hover{opacity:1;transform:scale(1.1)}",
      "#sec-chat .cp2tools{opacity:0;transition:opacity .2s}",
      "#sec-chat .cpmsg:hover .cp2tools,#sec-chat .cpmsg.rxopen .cp2tools{opacity:1}",
      "#sec-chat .cp2ed{opacity:.6!important;font-size:9px!important}",

      /* واکنش‌ها */
      "#sec-chat .rxchip{border-radius:99px!important;font-size:10.5px!important;padding:3px 9px!important;" +
        "background:rgba(124,92,255,.16)!important;border:1px solid rgba(124,92,255,.32)!important;" +
        "transition:transform .16s,box-shadow .2s}",
      "#sec-chat .rxchip:hover{transform:translateY(-1px)}",
      "#sec-chat .rxchip.mine{border-color:rgba(47,230,255,.6)!important;" +
        "box-shadow:0 0 16px rgba(47,230,255,.3)!important}",
      "#sec-chat .rxb{border-radius:99px!important;background:rgba(10,14,34,.85)!important;" +
        "border:1px solid rgba(140,160,255,.28)!important;transition:.16s}",
      "#sec-chat .rxb:hover{transform:scale(1.16) translateY(-1px)!important;border-color:#2fe6ff!important}",
      ".chxPop{position:fixed;z-index:400;pointer-events:none;font-size:20px;" +
        "animation:chxPop .9s cubic-bezier(.2,.8,.3,1) forwards}",
      "@keyframes chxPop{0%{opacity:1;transform:translate(-50%,-50%) scale(.5)}" +
        "100%{opacity:0;transform:translate(-50%,-260%) scale(1.5)}}",

      /* جداکنندهٔ روز */
      "#sec-chat .cp2sep{margin:18px 2px 8px!important;font-size:10.5px!important}",
      "#sec-chat .cp2sep b{padding:3px 12px!important;border-radius:99px!important;color:#cfd6ff!important;" +
        "background:linear-gradient(135deg,rgba(124,92,255,.22),rgba(47,230,255,.12))!important;" +
        "border:1px solid rgba(124,92,255,.34)!important;font-weight:800;" +
        "box-shadow:0 0 20px rgba(124,92,255,.24)}",

      /* «در حال نوشتن» */
      "#sec-chat .cpTyping{bottom:96px!important;inset-inline-start:16px!important;" +
        "padding:7px 13px!important;border-radius:99px!important;" +
        "background:rgba(10,14,34,.92)!important;border:1px solid rgba(47,230,255,.35)!important;" +
        "box-shadow:0 12px 30px -14px rgba(0,0,0,.9),0 0 20px rgba(47,230,255,.18)!important}",

      /* دکمهٔ پیام تازه */
      "#sec-chat .cp2jump{bottom:92px!important;inset-inline-end:16px!important;padding:9px 15px!important;" +
        "border-radius:99px!important;font-family:inherit;font-size:11.5px!important;font-weight:900!important;" +
        "color:#06101f!important;border:0!important;cursor:pointer;" +
        "background:linear-gradient(135deg,#8fe9ff,#a48bff)!important;" +
        "box-shadow:0 16px 34px -14px rgba(47,230,255,.95),0 0 26px rgba(124,92,255,.45)!important;" +
        "animation:chxBob 2.6s ease-in-out infinite}",
      "@keyframes chxBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}",

      /* ── نوار نوشتن ── */
      "#sec-chat .cbar{position:relative;z-index:4;margin:4px 12px 12px!important;padding:7px!important;" +
        "gap:7px!important;border-radius:20px!important;" +
        "border:1px solid rgba(124,92,255,.3)!important;" +
        "background:linear-gradient(180deg,rgba(16,20,50,.95),rgba(8,11,28,.95))!important;" +
        "box-shadow:0 18px 40px -22px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.06)!important;" +
        "transition:border-color .25s,box-shadow .25s}",
      "#sec-chat .cbar:focus-within{border-color:rgba(47,230,255,.65)!important;" +
        "box-shadow:0 18px 44px -20px rgba(47,230,255,.35),0 0 0 3px rgba(47,230,255,.1)!important}",
      "#sec-chat .cbar input{flex:1;min-width:0;height:44px;background:transparent!important;" +
        "border:0!important;box-shadow:none!important;padding:0 8px!important;font-size:13.5px!important}",
      "#sec-chat .cbar input::placeholder{color:rgba(170,182,220,.65)}",
      "#sec-chat .cbar #chatSend{min-width:74px;height:44px!important;border-radius:15px!important;" +
        "font-weight:900!important;color:#06101f!important;border:0!important;" +
        "background:linear-gradient(135deg,#8fe9ff,#7c5cff)!important;" +
        "box-shadow:0 12px 26px -10px rgba(124,92,255,.95)!important;" +
        "transition:transform .16s,box-shadow .22s,filter .2s}",
      "#sec-chat .cbar .btn.p.blk{height:44px!important;border-radius:15px!important;font-weight:900!important;" +
        "color:#06101f!important;border:0!important;background:linear-gradient(135deg,#8fe9ff,#7c5cff)!important;" +
        "box-shadow:0 12px 26px -10px rgba(124,92,255,.9)!important}",
      "#sec-chat .cbar #chatSend:hover{transform:translateY(-1px) scale(1.03)!important;" +
        "box-shadow:0 16px 32px -10px rgba(47,230,255,.9),0 0 22px rgba(47,230,255,.45)!important}",
      "#sec-chat .cbar #chatSend:active{transform:scale(.95)!important}",
      "#sec-chat .cpemjBtn{width:44px!important;height:44px!important;border-radius:15px!important;" +
        "background:rgba(10,14,34,.75)!important;border:1px solid rgba(140,160,255,.26)!important;transition:.18s}",
      "#sec-chat .cpemjBtn:hover{border-color:rgba(47,230,255,.6)!important;transform:translateY(-1px)}",
      "#sec-chat .cpemojiPanel{border-radius:16px!important;" +
        "box-shadow:0 24px 50px -18px rgba(0,0,0,.95),0 0 24px rgba(124,92,255,.25)!important}",
      "#sec-chat .cp2cc{align-self:center;font-size:9.5px!important;color:rgba(160,175,220,.75)!important;" +
        "min-width:30px;text-align:center;font-variant-numeric:tabular-nums}",
      "#sec-chat .cp2cc.warn{color:#ffd479!important}",
      "#sec-chat .cpreplying{border-radius:12px!important;margin:0 10px 6px!important}",

      /* ── تمام‌صفحه ── */
      "body.chx-full{overflow:hidden!important}",
      "body.chx-full #sec-chat{position:fixed!important;inset:0!important;z-index:165!important;" +
        "margin:0!important;padding:0!important;display:flex!important;flex-direction:column;" +
        "background:radial-gradient(120% 90% at 100% 0%,rgba(124,92,255,.16),transparent 60%),rgba(3,5,16,.985);" +
        "animation:chxIn .4s cubic-bezier(.16,1,.3,1)}",
      "body.chx-full #sec-chat>.head{display:none!important}",
      "body.chx-full #sec-chat .chat{height:100dvh!important;max-height:none!important;margin:0!important;" +
        "flex:1;border-radius:0!important;border:0!important;box-shadow:none!important}",
      "@keyframes chxIn{from{opacity:0;transform:scale(.99)}to{opacity:1;transform:none}}",
      "#sec-chat .chxFull.on{background:linear-gradient(135deg,#ff6d8d,#ff9d4d)!important;" +
        "border-color:rgba(255,255,255,.35)!important;color:#1a0b12!important}",

      /* ── روشن ── */
      "html[data-theme='light'] #sec-chat .chat{background:" +
        "radial-gradient(120% 85% at 100% 0%,rgba(124,92,255,.14),transparent 58%)," +
        "linear-gradient(180deg,rgba(255,255,255,.97),rgba(240,244,255,.97))!important;" +
        "border-color:rgba(90,110,200,.3)!important}",
      "html[data-theme='light'] #sec-chat .chead{background:linear-gradient(180deg,#fff,rgba(244,247,255,.9))!important}",
      "html[data-theme='light'] #sec-chat .chead b.sm{color:#151a3a!important}",
      "html[data-theme='light'] #sec-chat .cpmsg .bub{background:#fff!important;color:#151a3a!important;" +
        "border-color:rgba(90,110,200,.24)!important}",
      "html[data-theme='light'] #sec-chat .cpmsg.me .bub{color:#101532!important}",
      "html[data-theme='light'] #sec-chat .cbar{background:#fff!important;border-color:rgba(90,110,200,.28)!important}",
      "html[data-theme='light'] #sec-chat .cbar input{color:#151a3a!important}",
      "html[data-theme='light'] #sec-chat .chxMeta{color:rgba(60,74,120,.6)!important}",
      "html[data-theme='light'] #sec-chat .cp2sep b{background:#fff!important;color:#3b4a80!important}",

      /* ── موبایل ── */
      "@media(max-width:560px){" +
        "#sec-chat .chat{border-radius:22px!important}" +
        "#sec-chat .chead{padding:11px 12px!important}" +
        "#sec-chat .cp2srch{width:86px!important}#sec-chat .cp2srch:focus{width:112px!important}" +
        "#sec-chat .cpmsg{max-width:92%!important}" +
        "#sec-chat .cp2jump{bottom:88px!important;inset-inline-end:12px!important}" +
        "}",

      "@media(prefers-reduced-motion:reduce){" +
        "#sec-chat .chat::after,.chxAmb i,.chxLive i,#sec-chat .cp2jump,#sec-chat .chead b.sm::before{" +
        "animation:none!important}" +
        "#sec-chat .cpmsg.chxIn{animation:none!important}" +
        "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── ۲. پوسته: هاله‌ها، شمارندهٔ آنلاین، دکمهٔ تمام‌صفحه ── */
  function shell() {
    var c = card();
    if (!c) return false;

    if (!c.querySelector(".chxAmb")) {
      var amb = document.createElement("div");
      amb.className = "chxAmb";
      amb.innerHTML = "<i></i><i></i><i></i><b></b>";
      c.insertBefore(amb, c.firstChild);
    }

    var head = c.querySelector(".chead");
    var title = head && head.querySelector("b.sm");

    if (head && title && !head.querySelector(".chxLive")) {
      var lv = document.createElement("span");
      lv.className = "chxLive";
      lv.innerHTML = "<i></i><em></em>";
      lv.style.fontStyle = "normal";
      title.parentNode.insertBefore(lv, title.nextSibling);
      paintLive();
    }

    if (head && !head.querySelector(".chxFull")) {
      var fb = document.createElement("button");
      fb.type = "button";
      fb.className = "chxAct chxFull" + (isFull() ? " on" : "");
      fb.title = "تمام‌صفحه";
      fb.setAttribute("aria-label", "تمام‌صفحه");
      fb.innerHTML = isFull() ? "✕" : "⛶";
      fb.addEventListener("click", function (e) { e.stopPropagation(); toggleFull(); });
      var anchor = head.querySelector(".chxLive") || title;
      if (anchor && anchor.parentNode === head) head.insertBefore(fb, anchor.nextSibling);
      else head.appendChild(fb);
    }

    labelAll();
    return true;
  }

  /* ── ۳. شمارندهٔ آنلاین ─────────────────────────────────── */
  function paintLive() {
    var src = sec() && sec().querySelector("[data-online]");
    var txt = src ? String(src.textContent || "") : "";
    var digits = txt.replace(/[^0-9۰-۹]/g, "");
    var lv = $(".chxLive em");
    if (lv) lv.textContent = digits ? fa(digits) + " آنلاین" : "آنلاین";
  }
  setInterval(function () { try { paintLive(); } catch (e) {} }, 4000);

  /* ── ۴. ساعت پیام‌ها ────────────────────────────────────── */
  function clockOf(ts) {
    var d = new Date(ts);
    if (!ts || isNaN(d.getTime())) return "";
    return fa(pad(d.getHours()) + ":" + pad(d.getMinutes()));
  }
  function fullOf(ts) {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      }).format(new Date(ts));
    } catch (e) { return ""; }
  }
  function labelRow(row) {
    if (!row || !row.classList || !row.classList.contains("cpmsg")) return;
    var meta = row.querySelector(".xs.mut.row");
    if (!meta) return;
    var a = meta.querySelector("[data-dm],[data-rpm]");
    if (!a) return;
    var p = a.getAttribute("data-dm") || a.getAttribute("data-rpm");
    var m = (R.cpIndex || {})[p];
    var v = m && clockOf(m.t) ? clockOf(m.t) : "—";
    if (!v) return;
    for (var i = 0; i < meta.childNodes.length; i++) {
      var n = meta.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
        if (n.nodeValue.trim() !== v) n.nodeValue = v + " ";
        break;
      }
    }
    if (!meta.classList.contains("chxMeta")) meta.classList.add("chxMeta");
    var full = m && fullOf(m.t);
    if (full && meta.title !== full) meta.title = full;
    else if (!full) meta.removeAttribute("title");
  }
  function labelAll() {
    var b = box();
    if (!b) return;
    qa(".cpmsg", b).forEach(labelRow);
  }

  /* ── ۵. ورود پله‌پله ───────────────────────────────────── */
  function stagger() {
    if (calm()) return;
    var b = box();
    if (!b) return;
    var rows = qa(".cpmsg", b);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.__chx) continue;
      r.__chx = 1;
      r.style.animationDelay = Math.min(i, 9) * 40 + "ms";
      r.classList.add("chxIn");
    }
  }

  /* ── ۶. تمام‌صفحه ──────────────────────────────────────── */
  function isFull() { return document.body.classList.contains("chx-full"); }
  function paintFullBtn() {
    var fb = $(".chxFull");
    if (!fb) return;
    fb.classList.toggle("on", isFull());
    fb.innerHTML = isFull() ? "✕" : "⛶";
    fb.title = isFull() ? "خروج از تمام‌صفحه" : "تمام‌صفحه";
    fb.setAttribute("aria-label", fb.title);
  }
  function toggleFull(force, quiet) {
    var on = typeof force === "boolean" ? force : !isFull();
    document.body.classList.toggle("chx-full", on);
    if (!quiet) {
      try { localStorage.setItem(FULL_KEY, on ? "1" : "0"); } catch (e) {}
      try { sessionStorage.setItem("chx_auto", on ? "1" : "0"); } catch (e) {}
    }
    paintFullBtn();
    setTimeout(function () {
      var b = box();
      if (b) { try { b.scrollTop = b.scrollHeight; } catch (e) {} }
      stagger(); labelAll();
      var i = $("#chatIn");
      if (on && i) { try { i.focus({ preventScroll: true }); } catch (e) {} }
    }, 60);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isFull()) { e.preventDefault(); toggleFull(false); }
  });

  /* ── ۷. انفجار ایموجی روی واکنش ────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var rx = t.closest("[data-rx]");
    if (!rx || !sec() || !sec().contains(rx)) return;
    if (calm()) return;
    var r = rx.getBoundingClientRect();
    var s = document.createElement("span");
    s.className = "chxPop";
    s.textContent = rx.getAttribute("data-rx") || "✨";
    s.style.left = (r.left + r.width / 2) + "px";
    s.style.top = (r.top + r.height / 2) + "px";
    document.body.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.remove(); }, 950);
  });

  /* ── ۸. رصد رندرها ────────────────────────────────────── */
  function watch() {
    var b = box();
    if (!b || b.__chxWatch) return;
    b.__chxWatch = 1;
    try {
      var mo = new MutationObserver(function () {
        labelAll();
        stagger();
      });
      mo.observe(b, { childList: true, subtree: true });
    } catch (e) {}
    b.addEventListener("scroll", function () {
      var j = card() && card().querySelector(".cp2jump");
      if (j) j.classList.toggle("show", b.scrollHeight - b.scrollTop - b.clientHeight > 90);
    }, { passive: true });
  }

  /* ── ۹. راه‌اندازی ────────────────────────────────────── */
  function boot() {
    css();
    shell();
    watch();
    stagger();
    paintLive();
    paintFullBtn();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [300, 900, 1800, 3200, 6000].forEach(function (ms) { setTimeout(boot, ms); });
  window.addEventListener("load", function () { boot(); }, { once: true });

  /* قلاب ورود به بخش چت */
  if (!R.hooks) R.hooks = {};
  var _h = R.hooks.chat;
  R.hooks.chat = function () {
    if (typeof _h === "function") { try { _h(); } catch (e) {} }
    setTimeout(function () {
      boot();
      var keep = false, auto = true;
      try { keep = localStorage.getItem(FULL_KEY) === "1"; } catch (e) {}
      try {
        var a = sessionStorage.getItem("chx_auto");
        if (a === "0") auto = false;
      } catch (e) {}
      if (isFull()) return;
      if (window.innerWidth <= 600) { if (auto) toggleFull(true, true); }
      else if (keep) toggleFull(true, true);
    }, 120);
  };

  /* ── ۱۰. API ──────────────────────────────────────────── */
  R.chatUltra = {
    ver: VER,
    shell: shell,
    full: toggleFull,
    isFull: isFull,
    label: labelAll,
    clock: clockOf
  };
  try { console.log("[Ronin] chat-ultra " + VER + " ✓"); } catch (e) {}
})();
