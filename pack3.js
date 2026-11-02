/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — PACK 3  |  🏆 دستاورد و ماموریت روزانه
                            + 🎖 عنوان و رنگ نام پروفایل (پرمیوم)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

/* ── استایل ─────────────────────────────────────────────────── */
if (!document.getElementById("pack3-css")) {
  var st = document.createElement("style");
  st.id = "pack3-css";
  st.textContent =
    ".ibx{display:flex;align-items:center;gap:11px;padding:11px;border-radius:16px;" +
      "background:rgba(11,13,35,.68);border:1px solid rgba(132,124,255,.22);" +
      "margin-bottom:9px;transition:.2s}" +
    ".ibx .ib{font-size:19px;width:42px;height:42px;flex:0 0 42px;display:grid;" +
      "place-items:center;border-radius:13px;" +
      "background:linear-gradient(135deg,rgba(124,92,255,.35),rgba(34,211,238,.22))}" +
    ".ibx .it{font-size:13px;font-weight:700}" +
    ".ibx .is{font-size:11px;color:#a8a7c3}" +
    ".ibx .ic2{font-size:14px;flex:0 0 auto}" +
    ".ach{display:flex;flex-direction:column;align-items:center;gap:5px;padding:11px 8px;" +
      "border-radius:16px;background:rgba(11,13,35,.68);" +
      "border:1px solid rgba(132,124,255,.2);text-align:center}" +
    ".ach.on{border-color:rgba(255,214,107,.55);box-shadow:0 0 14px rgba(255,214,107,.22)}" +
    ".ach.off{opacity:.45}" +
    ".ach .ai{font-size:22px}" +
    ".ach .an{font-size:11px;font-weight:800}" +
    ".ach .ad{font-size:9px;color:#a8a7c3;line-height:1.5}" +
    ".ptedit{order:-1}";
  document.head.appendChild(st);
}

/* ── ماموریت‌های روزانه ────────────────────────────────────── */
var QL = {
  post:  { n: "یک پست در انجمن بگذار",      xp: 20, ic: "📝" },
  cmt:   { n: "روی یک پست کامنت بنویس",     xp: 10, ic: "💬" },
  chat:  { n: "در چت عمومی یک پیام بفرست",  xp: 10, ic: "🗨" },
  like:  { n: "یک پست را لایک کن",          xp: 5,  ic: "❤️" }
};

function txt(id, v) { var e = R.$(id); if (e) e.textContent = v; }

R.paintQuests = function () {
  var w = R.$("qList"); if (!w) return;
  if (!R.ME) {
    w.innerHTML = '<div class="empty">برای دیدن ماموریت‌ها وارد شو 🎯</div>';
    txt("qDone", ""); return;
  }
  var d = R.day();
  if (!R.QS || R.QS.day !== d) R.QS = { day: d, done: {} };
  var done = R.QS.done || {}, ks = Object.keys(QL);
  w.innerHTML = ks.map(function (k) {
    var q = QL[k], on = !!done[k];
    return '<div class="ibx" style="cursor:default;opacity:' + (on ? ".6" : "1") + '">' +
      '<div class="ib">' + q.ic + '</div>' +
      '<div class="grow" style="min-width:0"><div class="it">' + q.n + '</div>' +
      '<div class="is">+' + R.fa(q.xp) + ' XP</div></div>' +
      '<div class="ic2">' + (on ? "✅" : "▫️") + '</div></div>';
  }).join("");
  txt("qDone", R.fa(Object.keys(done).length) + "/" + R.fa(ks.length));
};

R.quest = function (id) {
  if (!R.ME || !QL[id]) return;
  var d = R.day();
  if (!R.QS || R.QS.day !== d) R.QS = { day: d, done: {} };
  R.QS.done = R.QS.done || {};
  if (R.QS.done[id]) return;
  R.QS.done[id] = 1;
  R.upd("users/" + R.ME, { qs: R.QS }).catch(function () {});
  if (R.xp) R.xp(QL[id].xp);
  R.paintQuests(); R.paintAch();
};

/* ── دستاوردها ─────────────────────────────────────────────── */
R.achList = function () {
  var uid = R.ME, posts = 0, likes = 0, cmts = 0;
  if (uid) Object.keys(R.POSTS || {}).forEach(function (k) {
    var p = R.POSTS[k]; if (!p || p.uid !== uid) return;
    posts++;
    likes += p.lk ? Object.keys(p.lk).length : 0;
    cmts += p.cm ? Object.keys(p.cm).length : 0;
  });
  var fw = Object.keys(R.FOLLOW || {}).length;
  var xp = (R.USER && R.USER.xp) || 0;
  var lv = R.level ? R.level(xp) : 1;
  var qd = (R.QS && R.QS.done) ? Object.keys(R.QS.done).length : 0;
  return [
    { n: "اولین قدم",    d: "اولین پستت را بگذار",     ic: "📝", on: posts >= 1 },
    { n: "پست‌ساز فعال", d: "۵ پست منتشر کن",          ic: "🗂", on: posts >= 5 },
    { n: "محبوب",        d: "۲۵ لایک بگیر",            ic: "❤️", on: likes >= 25 },
    { n: "گفتگوگر",      d: "۵ کامنت بنویس",           ic: "💬", on: cmts >= 5 },
    { n: "اجتماعی",      d: "۳ نفر را دنبال کن",       ic: "🤝", on: fw >= 3 },
    { n: "سطح ۵",        d: "به سطح ۵ برس",            ic: "⭐", on: lv >= 5 },
    { n: "سطح ۱۰",       d: "به سطح ۱۰ برس",           ic: "🌟", on: lv >= 10 },
    { n: "عضو الیت",     d: "پرمیوم شو",               ic: "💎", on: !!R.prem },
    { n: "عضو تیم",      d: "مدیر یا کارمند شو",       ic: "🛡", on: !!R.team },
    { n: "همراه ویژه",   d: "یک همراه پرمیوم انتخاب کن", ic: "🥷",
      on: !!(R.USER && R.USER.npcChar && R.USER.npcChar !== "ninja") },
    { n: "روز پرکار",    d: "همه ماموریت‌های امروز",   ic: "🎯", on: qd >= 4 },
    { n: "مالک رونین",   d: "مالک سایت باش",           ic: "👑", on: !!R.isOwner() }
  ];
};

R.paintAch = function () {
  var w = R.$("aList"); if (!w) return;
  var arr = R.achList();
  w.innerHTML = arr.map(function (a) {
    return '<div class="ach ' + (a.on ? "on" : "off") + '">' +
      '<div class="ai">' + a.ic + '</div>' +
      '<div class="an">' + a.n + '</div>' +
      '<div class="ad">' + a.d + '</div></div>';
  }).join("");
  txt("aDone", R.fa(arr.filter(function (a) { return a.on; }).length) +
    "/" + R.fa(arr.length));
};

/* ── 🎖 عنوان و رنگ نام (پرمیوم) ───────────────────────────── */
var TINT = [
  { n: "فیروزه‌ای", c: "#22d3ee" }, { n: "بنفش", c: "#a78bfa" },
  { n: "صورتی", c: "#ff4fcf" },     { n: "طلایی", c: "#ffd66b" },
  { n: "سبز", c: "#53e5b1" },      { n: "سرخ", c: "#ff547d" }
];

function myCard(box) {
  if (!R.ME || R.VIEW !== R.ME) return;
  if (box.querySelector(".ptedit")) return;
  var card = R.el("div", "card mb ptedit", "");
  card.innerHTML =
    '<div class="between mb"><span class="sm b">🎖 عنوان و رنگ نام ' +
      (R.prem ? '<span class="chip gd">💎</span>' : '<span class="chip">💎 پرمیوم</span>') +
      '</span></div>' +
    '<div class="field"><label class="lbl">عنوان اختصاصی (۱۸ حرف)</label>' +
    '<input class="inp" id="ptTitle" maxlength="18" placeholder="مثلاً RONIN ELITE" value="' +
      R.esc((R.USER && R.USER.title) || "") + '"></div>' +
    '<div class="field"><label class="lbl">رنگ نام</label></div>' +
    '<div class="row w" id="ptColors" style="gap:6px"></div>' +
    '<button class="btn p mt" data-savetitle="1">ذخیره هویت</button>';
  var head = box.querySelector(".head");
  if (head && head.parentNode) head.parentNode.insertBefore(card, head);
  else box.appendChild(card);
  var w = card.querySelector("#ptColors");
  TINT.forEach(function (t) {
    var b = R.el("button", "btn mini", "");
    b.style.cssText = "background:" + t.c + ";width:34px;height:26px;padding:0";
    b.title = t.n;
    if ((R.USER && R.USER.tint) === t.c) b.className = "btn p mini";
    b.setAttribute("data-tint", t.c);
    w.appendChild(b);
  });
}

function patch(box) {
  var pinfo = box.querySelector(".pinfo");
  if (!pinfo) return;
  var uid = R.VIEW || R.ME;
  var paint = function (u) {
    if (!u) return;
    var nm = pinfo.querySelector("b.h2");
    if (nm && u.tint) nm.style.color = u.tint;
    if (u.title && !pinfo.querySelector(".ptt")) {
      var c = R.el("span", "chip cy ptt", R.esc(u.title));
      if (nm && nm.parentNode) nm.parentNode.appendChild(c);
    }
  };
  if (uid === R.ME && R.USER) paint(R.USER);
  else R.get("users/" + uid).then(function (u) { if (u) paint(u); })
    .catch(function () {});
  myCard(box);
}

R.saveTitle = function () {
  if (!R.ME) return R.needLogin("هویت پروفایل");
  if (!R.prem) return R.toast("عنوان و رنگ نام مخصوص پرمیوم است 💎", "err");
  var t = R.clean(R.$("ptTitle") ? R.$("ptTitle").value : "", 18);
  var tint = R._tint || (R.USER && R.USER.tint) || "";
  R.upd("users/" + R.ME, { title: t, tint: tint }).then(function () {
    R.USER.title = t; R.USER.tint = tint;
    if (R.renderProfile) R.renderProfile(R.ME);
    R.toast("هویت پروفایل ذخیره شد ✅", "ok");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};

/* ── بخش «پیشرفت من» ───────────────────────────────────────── */
function build() {
  var ref = R.$("sec-archive") || R.$("sec-settings");
  if (ref && !R.$("sec-progress")) {
    var s = document.createElement("section");
    s.className = "sec"; s.id = "sec-progress";
    s.innerHTML =
      '<div class="head"><h2 class="h2">🏆 پیشرفت من</h2>' +
      '<span class="xs mut">ماموریت روزانه • دستاوردها</span></div>' +
      '<div class="card mb"><div class="between mb">' +
      '<span class="sm b">🎯 ماموریت‌های امروز</span>' +
      '<span class="sm cy" id="qDone"></span></div><div id="qList"></div>' +
      '<div class="xs mut">هر روز نیمه‌شب از نو شروع می‌شود</div></div>' +
      '<div class="card mb"><div class="between mb">' +
      '<span class="sm b">🏆 دستاوردها</span>' +
      '<span class="sm cy" id="aDone"></span></div>' +
      '<div class="grid auto" id="aList"></div></div>';
    ref.parentNode.insertBefore(s, ref.nextSibling);
  }
  var rail = R.$("rail");
  if (rail && !R.$("prgItem")) {
    var it = document.createElement("div");
    it.className = "ditem"; it.id = "prgItem";
    it.setAttribute("data-go", "progress");
    it.innerHTML = "<i>🏆</i>پیشرفت من";
    var base = R.$("archItem") || R.$("dmItem");
    if (base && base.parentNode) base.parentNode.insertBefore(it, base.nextSibling);
    else rail.appendChild(it);
  }
  R.paintQuests(); R.paintAch();
}

/* ── رویدادها ─────────────────────────────────────────────── */
document.addEventListener("click", function (e) {
  if (!e.target.closest) return;
  var c = e.target.closest("[data-tint]");
  if (c) {
    if (!R.prem) return R.toast("رنگ نام مخصوص پرمیوم است 💎", "err");
    R._tint = c.getAttribute("data-tint");
    var nm = document.querySelector("#profBox b.h2");
    if (nm) nm.style.color = R._tint;
    R.qa("[data-tint]").forEach(function (b) {
      b.classList.toggle("p", b === c);
    });
    return;
  }
  if (e.target.closest("[data-savetitle]")) R.saveTitle();
});

/* ── تشخیص خودکار فعالیت برای ماموریت‌ها ──────────────────── */
var MAP = { createPost: "post", addCmt: "cmt", sendChat: "chat",
            like: "like" };
Object.keys(MAP).forEach(function (fn) {
  var o = R[fn];
  if (typeof o !== "function") return;
  R[fn] = function () {
    var r = o.apply(this, arguments);
    try { R.quest(MAP[fn]); } catch (e) {}
    return r;
  };
});

/* ── چسبیدن به پروفایل ────────────────────────────────────── */
var box0 = R.$("profBox");
if (box0 && window.MutationObserver) {
  new MutationObserver(function () {
    try { patch(R.$("profBox")); } catch (e) {}
  }).observe(box0, { childList: true, subtree: true });
}

R.hooks.progress = function () { R.paintQuests(); R.paintAch(); };
if (!R.hooks.profile) R.hooks.profile = function () {
  setTimeout(function () { try { patch(R.$("profBox")); } catch (e) {} }, 500);
};

var prevLogin = R.onLogin;
R.onLogin = function () {
  if (prevLogin) { try { prevLogin(); } catch (e) {} }
  try { build(); } catch (e) { console.error(e); }
  if (R.ME) R.get("users/" + R.ME + "/qs").then(function (q) {
    if (q) R.QS = q;
    R.paintQuests(); R.paintAch();
  }).catch(function () {});
};

function start() {
  try { build(); patch(R.$("profBox")); } catch (e) { console.error(e); }
  [700, 2000, 3600].forEach(function (ms) {
    setTimeout(function () {
      try { build(); patch(R.$("profBox")); } catch (e) {}
    }, ms);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else { start(); }

console.log("%c🏆 RONIN PACK 3 ready", "color:#53e5b1;font-weight:900");
})();
