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
