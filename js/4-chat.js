/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                  js/4-chat.js
   چت عمومی • چت مخفی تیم (مالک/مدیر/کارمند) • پیام خصوصی • حضور
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

R.CHAT = {};       /* پیام‌های عمومی */
R.TEAM = {};       /* پیام‌های تیم */
R.DM = {};         /* پیام خصوصی فعال */
R.ONLINE = {};     /* کاربران آنلاین */
R.teamCh = "";     /* کانال تیم فعال */
R.dmWith = null;   /* کاربر چت خصوصی */

/* ── ۱. مرتب‌سازی پیام‌ها ─────────────────────────────────── */
R.msgList = function (obj) {
  return Object.keys(obj || {}).map(function (k) {
    var m = obj[k]; m.id = k; return m;
  }).sort(function (a, b) { return (a.t || 0) - (b.t || 0); });
};

/* ── ۲. ردیف پیام ─────────────────────────────────────────── */
R.chatRow = function (m, path) {
  var mine = m.uid === R.ME;
  return '<div class="msg' + (mine ? " me" : "") + '">' +
    R.avHTML({ name: m.n, av: m.av }, "sm") +
    '<div style="min-width:0"><div class="bub">' +
    (mine ? "" : '<b class="xs cy">' + R.esc(m.n || "کاربر") + "</b><br>") +
    R.esc(m.text) + "</div>" +
    '<div class="xs mut row" style="gap:8px;margin-top:3px">' + R.time(m.t) +
    (mine ? '<a data-dm="' + path + '" style="cursor:pointer">✕ حذف</a>' :
            '<a data-rpm="' + path + '" style="cursor:pointer">🚩</a>') +
    "</div></div></div>";
};
R.afterRender = function (el) {
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

/* ── ۳. چت عمومی ──────────────────────────────────────────── */
R.watchChat = function () {
  if (!R.db) return;
  R.db.ref("chat").orderByChild("t").limitToLast(80)
    .on("value", function (s) { R.CHAT = s.val() || {}; R.renderChat(); },
        function (e) { console.warn("[Ronin] chat:", e.message); });
};
R.renderChat = function () {
  var b = R.$("chatBox"); if (!b) return;
  var arr = R.msgList(R.CHAT);
  if (!arr.length) {
    b.innerHTML = '<div class="empty">چت خالیه — اولین پیام را تو بفرست 💬</div>';
    return;
  }
  b.innerHTML = arr.map(function (m) { return R.chatRow(m, "chat/" + m.id); }).join("");
  R.afterRender(b);
};
R.sendChat = function () {
  if (!R.ME) return R.needLogin("فرستادن پیام");
  var i = R.$("chatIn"); if (!i) return;
  var txt = R.clean(i.value, 500);
  if (!txt) return;
  if (Date.now() - (R._cAt || 0) < 1500) return R.toast("یه کم آرام‌تر ⏳", "err");
  R._cAt = Date.now();
  i.value = "";
  R.add("chat", {
    uid: R.ME, n: (R.USER && R.USER.name) || "کاربر",
    av: (R.USER && R.USER.av) || "", text: txt
  }).catch(function (e) { R.toast("پیام نرفت: " + e.message, "err"); });
};

/* ── ۴. حضور (آنلاین واقعی، بدون ربات) ───────────────────── */
R.presence = function () {
  if (!R.db || !R.ME) return;
  var me = R.db.ref("online/" + R.ME);
  R.db.ref(".info/connected").on("value", function (s) {
    if (s.val() !== true) return;
    me.onDisconnect().remove();
    me.set({ n: (R.USER && R.USER.name) || "کاربر", t: Date.now() });
  });
};
R.watchOnline = function () {
  if (!R.db) return;
  R.db.ref("online").on("value", function (s) {
    R.ONLINE = s.val() || {};
    var txt = "🟢 " + R.fa(Object.keys(R.ONLINE).length) + " نفر آنلاین";
    R.qa("[data-online]").forEach(function (e) { e.textContent = txt; });
  });
};

/* ── ۵. کانال‌های مخفی تیم ────────────────────────────────── */
R.channels = function () {
  if (R.isOwner()) return [["owner", "👑 شورای مالک"], ["admin", "🛡 مدیریت"], ["staff", "🧰 کارکنان"]];
  if (R.role === "admin") return [["admin", "🛡 مدیریت"], ["staff", "🧰 کارکنان"]];
  if (R.role === "staff") return [["staff", "🧰 کارکنان"]];
  return [];
};
R.bootTeam = function () {
  var tabs = R.$("teamTabs");
  if (!tabs || !R.team) return;
  var chs = R.channels();
  tabs.innerHTML = "";
  if (!chs.length) return;
  chs.forEach(function (c, i) {
    var b = R.el("div", "tab" + (i === 0 ? " on" : ""), c[1]);
    b.addEventListener("click", function () {
      R.qa("#teamTabs .tab").forEach(function (x) { x.classList.toggle("on", x === b); });
      R.teamOn(c[0]);
    });
    tabs.appendChild(b);
  });
  R.teamOn(chs[0][0]);
};
R.teamOn = function (ch) {
  if (!R.team || !R.db) return;
  R.teamCh = ch;
  if (R._tRef) { R._tRef.off(); R._tRef = null; }
  R._tRef = R.db.ref("team/" + ch).orderByChild("t").limitToLast(80);
  R._tRef.on("value", function (s) { R.TEAM = s.val() || {}; R.renderTeam(); },
    function (e) { console.warn("[Ronin] team:", e.message); });
};
R.renderTeam = function () {
  var b = R.$("teamBox"); if (!b) return;
  var arr = R.msgList(R.TEAM);
  if (!arr.length) {
    b.innerHTML = '<div class="empty">این کانال خالی است — پیام تیم را بنویس 🛡</div>';
    return;
  }
  b.innerHTML = arr.map(function (m) {
    return R.chatRow(m, "team/" + R.teamCh + "/" + m.id);
  }).join("");
  R.afterRender(b);
};
R.sendTeam = function () {
  if (!R.team) return R.toast("دسترسی نداری", "err");
  if (!R.ME) return R.needLogin("پیام تیم");
  var i = R.$("teamIn"); if (!i) return;
  var txt = R.clean(i.value, 800);
  if (!txt) return;
  if (Date.now() - (R._tAt || 0) < 1200) return R.toast("یه کم آرام‌تر ⏳", "err");
  R._tAt = Date.now();
  i.value = "";
  R.add("team/" + R.teamCh, {
    uid: R.ME, n: (R.USER && R.USER.name) || "کاربر",
    av: (R.USER && R.USER.av) || "", text: txt, ch: R.teamCh
  }).catch(function (e) { R.toast("پیام نرفت: " + e.message, "err"); });
};

/* ── ۶. پیام خصوصی ────────────────────────────────────────── */
R.dmKey = function (a, b) { return [a, b].sort().join("--"); };
R.dmOpen = function (uid) {
  if (!R.ME) return R.needLogin("پیام خصوصی");
  if (uid === R.ME) return R.toast("به خودت که پیام نمی‌دهی 😄", "err");
  R.dmWith = uid;
  R.go("dm");
  if (R._dmRef) { R._dmRef.off(); R._dmRef = null; }
  R._dmRef = R.db.ref("dm/" + R.dmKey(R.ME, uid)).orderByChild("t").limitToLast(80);
  R._dmRef.on("value", function (s) { R.DM = s.val() || {}; R.renderDM(); },
    function (e) { console.warn("[Ronin] dm:", e.message); });
  R.get("users/" + uid).then(function (u) {
    R.setT("dmTitle", "پیام با " + ((u && u.name) || "کاربر"));
  });
};
R.renderDM = function () {
  var b = R.$("dmBox"); if (!b) return;
  var arr = R.msgList(R.DM);
  if (!arr.length) {
    b.innerHTML = '<div class="empty">شروع گفتگو — سلام کن 👋</div>';
    return;
  }
  var key = R.dmKey(R.ME, R.dmWith);
  b.innerHTML = arr.map(function (m) { return R.chatRow(m, "dm/" + key + "/" + m.id); }).join("");
  R.afterRender(b);
};
R.sendDM = function () {
  if (!R.ME || !R.dmWith) return R.needLogin("پیام خصوصی");
  var i = R.$("dmIn"); if (!i) return;
  var txt = R.clean(i.value, 800);
  if (!txt) return;
  i.value = "";
  var key = R.dmKey(R.ME, R.dmWith);
  R.add("dm/" + key, {
    uid: R.ME, n: (R.USER && R.USER.name) || "کاربر",
    av: (R.USER && R.USER.av) || "", text: txt, to: R.dmWith
  }).catch(function (e) { R.toast("پیام نرفت: " + e.message, "err"); });
};

/* ── ۷. حذف و گزارش پیام ─────────────────────────────────── */
R.delMsg = function (path) {
  if (!window.confirm("این پیام حذف شود؟")) return;
  R.db.ref(path).remove().then(function () { R.toast("حذف شد", "ok"); });
};
R.reportMsg = function (path) {
  if (!R.ME) return R.needLogin("گزارش کردن");
  var why = window.prompt("دلیل گزارش:");
  if (why == null) return;
  R.add("reports", {
    uid: R.ME, by: (R.USER && R.USER.name) || "کاربر",
    type: "msg", target: path, text: R.clean(why, 140) || "—", st: "new"
  }).then(function () {
    R.toast("گزارش ثبت شد — ممنون 🙏", "ok");
    R.notify(R.OWNER_UID, "🚩 گزارش پیام", "mod", "owner");
  });
};

/* ── ۸. اتصال رویدادها ───────────────────────────────────── */
R.bindChat = function () {
  if (R.$("chatSend")) R.$("chatSend").addEventListener("click", R.sendChat);
  if (R.$("chatIn")) R.$("chatIn").addEventListener("keydown", function (e) {
    if (e.key === "Enter") R.sendChat();
  });
  if (R.$("teamSend")) R.$("teamSend").addEventListener("click", R.sendTeam);
  if (R.$("teamIn")) R.$("teamIn").addEventListener("keydown", function (e) {
    if (e.key === "Enter") R.sendTeam();
  });
  if (R.$("dmSend")) R.$("dmSend").addEventListener("click", R.sendDM);
  if (R.$("dmIn")) R.$("dmIn").addEventListener("keydown", function (e) {
    if (e.key === "Enter") R.sendDM();
  });
  document.addEventListener("click", function (e) {
    var d = e.target.closest ? e.target.closest("[data-dm]") : null;
    if (d) return R.delMsg(d.getAttribute("data-dm"));
    var r = e.target.closest ? e.target.closest("[data-rpm]") : null;
    if (r) return R.reportMsg(r.getAttribute("data-rpm"));
  });
};

/* ── ۹. آماده‌سازی ───────────────────────────────────────── */
R.bootChat = function () {
  R.bindChat();
  R.watchChat();
  R.watchOnline();
  if (R.ME) { R.presence(); if (R.team) R.bootTeam(); }
};

/* ── ۱۰. قلاب ورود/خروج ─────────────────────────────────── */
R.onLogin = function () {
  if (R.watchMe) R.watchMe();
  R.presence();
  R.bootTeam();
  if (R.renderFeed) R.renderFeed();
  if (R.paintOwner) R.paintOwner();
};
var prevOut = R.onLogout;
R.onLogout = function () {
  R.TEAM = {}; R.DM = {}; R.dmWith = null; R.teamCh = "";
  if (R._tRef) { R._tRef.off(); R._tRef = null; }
  if (R._dmRef) { R._dmRef.off(); R._dmRef = null; }
  if (R.$("teamTabs")) R.$("teamTabs").innerHTML = "";
  if (prevOut) prevOut();
};

})();
