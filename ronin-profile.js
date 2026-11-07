/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — PROFILE ULTRA · ronin-profile.js · v1
   فایل یکپارچهٔ پروفایل و شخصی‌سازی اکانت
   (جایگزین profile.js + profile-plus.js + ronin-profile-ultra.js)
   ───────────────────────────────────────────────────────────────
   بخش ۱ ▸ آواتار، آواتارهای آماده، قاب، آپلود عکس
   بخش ۲ ▸ نشان‌ها، آمار عمیق، تکمیل پروفایل، اشتراک، گزارش
   بخش ۳ ▸ هدر سینمایی، حلقهٔ سطح، وضعیت، تم/کاور، کارت PNG
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — PROFILE+ | عکس پروفایل • آواتار آماده • قاب
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

/* ۱ ▸ استایل */
if (!document.getElementById("profx-css")) {
  var st = document.createElement("style");
  st.id = "profx-css";
  st.textContent =
    ".av.fr-basic{box-shadow:0 0 0 2px rgba(170,170,210,.4)}" +
    ".av.fr-pink{box-shadow:0 0 0 2px #ff4fcf,0 0 14px rgba(255,79,207,.6)}" +
    ".av.fr-cyan{box-shadow:0 0 0 2px #22d3ee,0 0 14px rgba(34,211,238,.6)}" +
    ".av.fr-violet{box-shadow:0 0 0 2px #a78bfa,0 0 15px rgba(167,139,250,.65)}" +
    ".av.fr-gold{box-shadow:0 0 0 2px #ffd66b,0 0 16px rgba(255,214,107,.7)}" +
    ".pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:8px}" +
    ".pick button{background:0;border:2px solid transparent;border-radius:50%;padding:1px;line-height:0}" +
    ".pick button.on{border-color:#8fdcff}" +
    ".pick img,.pick svg{width:42px;height:42px;border-radius:50%;display:block}" +
    ".frpick button{border-radius:11px;padding:6px 9px;line-height:1.7;border:1px solid rgba(140,140,220,.25)}" +
    ".upl{display:inline-block;margin:12px 0;cursor:pointer}";
  document.head.appendChild(st);
}

/* ۲ ▸ آواتارهای آماده */
R.AVP = {
  ronin: { n: "رونین", p: false, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#2a1c12"/><path d="M18 18h28l-3-9H21z" fill="#ffb03a"/><circle cx="32" cy="38" r="17" fill="#ffd9b3"/><rect x="13" y="27" width="38" height="9" fill="#e63946"/><rect x="26" y="24" width="12" height="10" rx="2" fill="#cfd3e6"/><circle cx="25" cy="42" r="3" fill="#1b1e33"/><circle cx="39" cy="42" r="3" fill="#1b1e33"/></svg>' },
  kitsune: { n: "کیتسونه", p: false, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#1a1030"/><path d="M12 22 17 7l11 8h8l11-8 5 15z" fill="#f6f6ff"/><path d="M14 22h36a18 18 0 0 1-36 0z" fill="#f6f6ff"/><circle cx="25" cy="32" r="3.5" fill="#e63946"/><circle cx="39" cy="32" r="3.5" fill="#e63946"/><path d="M32 40l-4 5h8z" fill="#e63946"/></svg>' },
  sakura: { n: "ساکورا", p: false, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#2b1030"/><g fill="#ff9ecb"><circle cx="32" cy="20" r="11"/><circle cx="32" cy="44" r="11"/><circle cx="20" cy="32" r="11"/><circle cx="44" cy="32" r="11"/></g><circle cx="32" cy="32" r="8" fill="#ffd66b"/></svg>' },
  neko: { n: "نکو", p: false, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#12142a"/><path d="M14 24 18 9l10 7h8l10-7 4 15z" fill="#8b93b8"/><circle cx="32" cy="38" r="17" fill="#b9c0de"/><circle cx="25" cy="36" r="3.4" fill="#1b1e33"/><circle cx="39" cy="36" r="3.4" fill="#1b1e33"/><path d="M32 44l-4 3h8z" fill="#ff6fa5"/></svg>' },
  cyber: { n: "سایبر", p: true, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#04121c"/><circle cx="32" cy="36" r="17" fill="#0d3346"/><rect x="13" y="27" width="38" height="11" rx="3" fill="#22d3ee"/><rect x="18" y="30" width="28" height="5" rx="2" fill="#04202c"/><path d="M32 50v9M22 55h20" stroke="#22d3ee" stroke-width="3"/></svg>' },
  oni: { n: "اونی", p: true, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#1b0a12"/><path d="M18 16l4-10 8 7M46 16l-4-10-8 7" stroke="#ffd66b" stroke-width="4" fill="none"/><circle cx="32" cy="37" r="17" fill="#e63946"/><circle cx="25" cy="34" r="3.4" fill="#ffd66b"/><circle cx="39" cy="34" r="3.4" fill="#ffd66b"/><path d="M24 45h16" stroke="#25060d" stroke-width="4"/></svg>' },
  moon: { n: "روح ماه", p: true, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#0a0620"/><circle cx="32" cy="32" r="20" fill="#f3efff"/><circle cx="40" cy="26" r="16" fill="#0a0620"/><circle cx="24" cy="34" r="2" fill="#a78bfa"/><circle cx="30" cy="42" r="1.6" fill="#a78bfa"/></svg>' },
  samurai: { n: "سامورایی", p: true, s: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#1a1608"/><path d="M10 30 32 8l22 22-6 6H16z" fill="#ffd66b"/><path d="M32 8l-6 6 6 24 6-24z" fill="#d99e0b"/><circle cx="32" cy="44" r="12" fill="#2a2d47"/><rect x="20" y="41" width="24" height="5" rx="2" fill="#e63946"/></svg>' }
};

/* ۳ ▸ قاب‌ها */
R.AVF = [
  { id: "basic", n: "ساده", p: false },
  { id: "pink", n: "صورتی", p: true },
  { id: "cyan", n: "فیروزه‌ای", p: true },
  { id: "violet", n: "بنفش", p: true },
  { id: "gold", n: "طلایی", p: true }
];

/* ۴ ▸ نمایش آواتار با قاب */
R.avHTML = function (u, cls) {
  u = u || {};
  var ini = R.esc(R.initials(u.name));
  var inner = u.av ? '<img src="' + R.esc(u.av) + '" alt="">' : ini;
  var fr = u.avFrame ? " fr-" + u.avFrame : "";
  return '<div class="av ' + (cls || "") + fr + '">' + inner + "</div>";
};

/* ۵ ▸ ذخیره */
R.saveAv = function (o) {
  if (!R.ME) return R.needLogin("پروفایل");
  if (!R.db) return R.toast("اتصال برقرار نشد ❌", "err");
  R.db.ref("users/" + R.ME).update(o).then(function () {
    if (R.USER) { for (var k in o) R.USER[k] = o[k]; }
    R.toast("ذخیره شد ✅", "ok");
    if (R.renderProfile) R.renderProfile(R.ME);
  }).catch(function (e) { R.toast("ذخیره نشد: " + e.message, "err"); });
};

/* ۶ ▸ فشرده‌سازی عکس گالری */
R.pickPhoto = function (file) {
  if (!file) return;
  if (!file.type || file.type.indexOf("image/") !== 0) return R.toast("فقط عکس انتخاب کن 🖼", "err");
  if (file.size > 8 * 1024 * 1024) return R.toast("عکس بزرگ‌تر از ۸ مگه ❌", "err");
  R.toast("دارم عکس رو آماده می‌کنم… ⏳", "ok");
  var fr = new FileReader();
  fr.onload = function () {
    var im = new Image();
    im.onload = function () {
      try {
        var S = 256, c = document.createElement("canvas");
        c.width = c.height = S;
        var x = c.getContext("2d");
        var m = Math.min(im.width, im.height);
        x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, S, S);
        var out = c.toDataURL("image/webp", 0.72);
        if (out.indexOf("webp") === -1) out = c.toDataURL("image/jpeg", 0.82);
        if (out.length > 160000) out = c.toDataURL("image/jpeg", 0.55);
        R.saveAv({ av: out, avKind: "photo", avPre: "", avAt: Date.now() });
      } catch (e) { R.toast("پردازش عکس نشد ❌", "err"); }
    };
    im.onerror = function () { R.toast("این عکس خوانده نشد ❌", "err"); };
    im.src = fr.result;
  };
  fr.onerror = function () { R.toast("خواندن فایل نشد ❌", "err"); };
  fr.readAsDataURL(file);
};

/* ۷ ▸ کارت آواتار در پروفایل */
R.avCard = function () {
  var u = R.USER || {};
  var h = '<div class="card mb" id="avCard">';
  h += '<div class="between"><span class="sm b">🎨 آواتار و قاب</span>' +
       '<span class="xs mut">' + (R.prem ? "💎 پرمیوم" : "پایه") + "</span></div>";
  h += '<div class="xs mut mt mb">از گالری عکس بذار، یا یکی از آواتارهای آماده رو بزن</div>';
  h += '<div class="pick">';
  Object.keys(R.AVP).forEach(function (k) {
    var a = R.AVP[k];
    h += '<button class="' + (u.avPre === k ? "on" : "") + '" data-avp="' + k +
         '" title="' + a.n + (a.p && !R.prem ? " (پرمیوم)" : "") + '">' + a.s + "</button>";
  });
  h += "</div>";
  h += '<label class="btn mini upl">🖼 انتخاب عکس از گالری' +
       '<input id="avFile" type="file" accept="image/*" hidden></label>';
  h += '<div class="xs mut mb">قاب پروفایل:</div><div class="pick frpick">';
  R.AVF.forEach(function (f) {
    h += '<button class="xs ' + ((u.avFrame || "basic") === f.id ? "on" : "") + '" data-avf="' +
         f.id + '">' + f.n + (f.p && !R.prem ? " 💎" : "") + "</button>";
  });
  h += "</div></div>";
  return h;
};

/* ۸ ▸ تزریق کارت */
R.avHook = function () {
  var box = R.$("profBox");
  if (!box || !R.ME) return;
  if (box.querySelector("#avCard")) return;
  var d = document.createElement("div");
  d.innerHTML = R.avCard();
  box.insertBefore(d.firstChild, box.firstChild);
  var f = R.$("avFile");
  if (f) f.addEventListener("change", function (e) {
    R.pickPhoto(e.target.files && e.target.files[0]);
    e.target.value = "";
  });
};

/* ۹ ▸ کلیک روی آواتار و قاب */
document.addEventListener("click", function (e) {
  var t = e.target && e.target.closest ? e.target.closest("[data-avp],[data-avf]") : null;
  if (!t) return;
  e.preventDefault();
  var p = t.getAttribute("data-avp"), f = t.getAttribute("data-avf");
  if (p) {
    var a = R.AVP[p];
    if (!a) return;
    if (a.p && !R.prem) return R.toast("این آواتار مخصوص پرمیوم است 💎", "err");
    R.saveAv({ av: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(a.s),
               avKind: "preset", avPre: p, avAt: Date.now() });
  } else if (f) {
    var fr = R.AVF.filter(function (x) { return x.id === f; })[0];
    if (fr && fr.p && !R.prem) return R.toast("این قاب مخصوص پرمیوم است 💎", "err");
    R.saveAv({ avFrame: f, avAt: Date.now() });
  }
});

/* ۱۰ ▸ زیر نظر گرفتن پروفایل */
(function start() {
  var b = R.$ && R.$("profBox");
  if (!b) { setTimeout(start, 400); return; }
  if (!window.MutationObserver) return;
  new MutationObserver(function () { setTimeout(R.avHook, 0); })
    .observe(b, { childList: true });
})();

})();

/* ───────── بخش ۲: نشان‌ها و آمار ───────── */
/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — PROFILE PLUS v1  ·  ارتقای بخش پروفایل
   🏅 نشان‌ها  •  📊 آمار عمیق  •  🧩 تکمیل پروفایل
   🔗 اشتراک‌گذاری  •  🚩 گزارش پروفایل
   ───────────────────────────────────────────────────────────────
   افزودنی است: R.renderProfile دست‌نخورده می‌ماند. بعد از هر رندر،
   یک کارت به انتهای #profBox اضافه می‌شود (با MutationObserver).
   تنها نوشتنِ این فایل، ثبت «گزارش پروفایل» در reports است.
   هیچ پست یا کاربری حذف نمی‌شود.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__ppPlus) return;
  R.__ppPlus = true;

  var WEEK = 7 * 86400000;
  var PP = { uid: null, run: 0 };

  function el(i) { return document.getElementById(i); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(n) { return R.num ? R.num(n) : n; }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function when(t) { return t && R.time ? R.time(t) : "—"; }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("ppPlusCss")) return;
    var s = document.createElement("style");
    s.id = "ppPlusCss";
    s.textContent =
      "#ppPlus .ppBs{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:7px}" +
      "#ppPlus .ppB{display:flex;align-items:center;gap:6px;padding:7px 9px;border-radius:12px;" +
      "background:rgba(124,92,255,.1);border:1px solid rgba(124,92,255,.22);font-size:11.5px}" +
      "#ppPlus .ppB i{font-style:normal;font-size:14px}" +
      "#ppPlus .ppIns{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:8px}" +
      "#ppPlus .ppIn{border:1px solid rgba(150,150,200,.2);border-radius:12px;padding:9px 10px;" +
      "background:rgba(255,255,255,.03)}" +
      "#ppPlus .ppIn b{display:block;font-size:14px;line-height:1.5}" +
      "#ppPlus .ppIn span{font-size:10.5px;opacity:.72}" +
      "#ppPlus .ppMeter{height:8px;border-radius:99px;background:rgba(255,255,255,.13);" +
      "overflow:hidden;margin:9px 0}" +
      "#ppPlus .ppMeter>i{display:block;height:100%;border-radius:99px;" +
      "background:linear-gradient(90deg,#7c5cff,#22d3ee)}" +
      "#ppPlus .ppChk{display:flex;align-items:center;gap:8px;font-size:12px;padding:4px 0}" +
      "#ppPlus .ppChk.no{opacity:.45}";
    document.head.appendChild(s);
  }

  /* ── ۲. داده ─────────────────────────────────────────────── */
  function postsOf(uid) {
    var P = R.POSTS || {};
    return Object.keys(P).map(function (k) {
      var p = P[k] || {}; p.id = k; return p;
    }).filter(function (p) { return p.uid === uid && p.status !== "pending"; });
  }

  function load(uid) {
    var u = {}, fo = 0, fw = 0;
    function one(path, put) {
      if (!R.get) return Promise.resolve();
      return R.get(path).then(function (v) { put(v); }, function () {});
    }
    return Promise.all([
      one("users/" + uid, function (v) { u = v || {}; }),
      one("followers/" + uid, function (v) { fo = Object.keys(v || {}).length; }),
      one("follows/" + uid, function (v) { fw = Object.keys(v || {}).length; })
    ]).then(function () {
      var posts = postsOf(uid), likes = 0, best = 0, last = 0, week = 0;
      posts.forEach(function (p) {
        var l = p.lk ? Object.keys(p.lk).length : 0;
        likes += l;
        if (l > best) best = l;
        if ((p.t || 0) > last) last = p.t || 0;
        if ((p.t || 0) >= Date.now() - WEEK) week++;
      });
      return {
        u: u, posts: posts.length, likes: likes, best: best,
        last: last, week: week, fo: fo, fw: fw, xp: u.xp || 0
      };
    });
  }

  /* ── ۳. نشان‌ها ──────────────────────────────────────────── */
  function isStaff(u) {
    if (!u) return false;
    if (u.role === "owner" || u.role === "admin" || u.role === "mod" || u.role === "staff") return true;
    var p = u.perms || {};
    return !!(p.mod || p.news || p.anime || p.market || p.team);
  }

  function badges(u, s) {
    var b = [], days = u.joined ? Math.floor((Date.now() - u.joined) / 86400000) : 0;
    if (s.posts >= 1) b.push(["✍️", "نویسنده"]);
    if (s.posts >= 10) b.push(["📚", "پرکار"]);
    if (s.likes >= 25) b.push(["❤️", "محبوب"]);
    if (s.likes >= 100) b.push(["🔥", "ستاره"]);
    if (s.best >= 10) b.push(["🏆", "پست داغ"]);
    if (s.fo >= 10) b.push(["👥", "تأثیرگذار"]);
    if (s.week >= 3) b.push(["⚡", "فعال این هفته"]);
    if (R.level && R.level(s.xp) >= 5) b.push(["🎖", "سطح بالا"]);
    if (days >= 30) b.push(["🏅", "عضو قدیمی"]);
    else if (u.joined && days < 3) b.push(["🌱", "تازه‌وارد"]);
    if (u.prem) b.push(["💎", "پرمیوم"]);
    if (isStaff(u)) b.push(["🛡", "تیم"]);
    return b.slice(0, 8);
  }

  function badgesHTML(u, s) {
    var b = badges(u, s);
    if (!b.length) {
      return '<div class="empty">هنوز نشانی نیست — با اولین پست شروع کن ✍️</div>';
    }
    return '<div class="ppBs">' + b.map(function (x) {
      return '<div class="ppB"><i>' + x[0] + "</i><span>" + esc(x[1]) + "</span></div>";
    }).join("") + "</div>";
  }

  /* ── ۴. آمار و تکمیل ────────────────────────────────────── */
  function insightsHTML(u, s) {
    var avg = s.posts ? Math.round(s.likes / s.posts) : 0;
    var days = u.joined ? Math.floor((Date.now() - u.joined) / 86400000) : 0;
    function box(v, l) {
      return '<div class="ppIn"><b>' + v + "</b><span>" + l + "</span></div>";
    }
    return '<div class="ppIns">' +
      box(fa(avg), "میانگین لایک هر پست") +
      box(fa(s.best), "بیشترین لایک یک پست") +
      box(s.week ? fa(s.week) : "—", "پست این هفته") +
      box(days ? fa(days) + " روز" : "—", "عضویت") +
      box(s.last ? when(s.last) : "—", "آخرین پست") +
      box(fa(s.fo) + " / " + fa(s.fw), "دنبال‌کننده / دنبال‌شده") +
      "</div>";
  }

  function completeHTML(u, s) {
    var items = [
      { t: "نام نمایشی (۲ حرف یا بیشتر)", ok: String(u.name || "").trim().length >= 2 },
      { t: "بیو (۱۰ حرف یا بیشتر)", ok: String(u.bio || "").trim().length >= 10 },
      { t: "آواتار", ok: !!u.av },
      { t: "اولین پست", ok: s.posts >= 1 },
      { t: "دنبال‌کردن حداقل یک نفر", ok: s.fw >= 1 }
    ];
    var done = items.filter(function (x) { return x.ok; }).length;
    var pc = Math.round(done * 100 / items.length);
    var h = '<div class="between"><span class="sm b">🧩 تکمیل پروفایل</span>' +
      '<span class="sm ' + (pc === 100 ? "ok" : "cy") + '">' + fa(pc) + "٪</span></div>" +
      '<div class="ppMeter"><i style="width:' + pc + '%"></i></div>';
    h += items.map(function (x) {
      return '<div class="ppChk' + (x.ok ? "" : " no") + '"><span>' + (x.ok ? "✅" : "⬜") +
        "</span><span>" + esc(x.t) + "</span></div>";
    }).join("");
    if (pc < 100) {
      h += '<button class="btn mini mt" data-pp-act="edit">✏️ کامل کردن پروفایل</button>';
    }
    return h;
  }

  /* ── ۵. کارت ─────────────────────────────────────────────── */
  function inner(uid, s) {
    var u = s.u || {};
    var isMe = uid === R.ME;
    var h = '<div class="card mb" id="ppPlusCard">' +
      '<div class="between"><div><div class="sm b">🏅 نشان‌ها و آمار پروفایل</div>' +
      '<div class="xs mut">' + (isMe ? "وضعیت خودت" : "نگاهی عمیق‌تر به این پروفایل") + "</div></div>" +
      '<span class="chip cy">سطح ' + fa(R.level ? R.level(s.xp) : 1) + "</span></div>";

    h += '<div class="mt">' + badgesHTML(u, s) + "</div>";
    h += '<div class="xs mut mt mb">📊 آمار</div>' + insightsHTML(u, s);

    if (isMe) h += '<div class="mt">' + completeHTML(u, s) + "</div>";

    h += '<div class="row mt" style="gap:7px;flex-wrap:wrap">' +
      '<button class="btn mini" data-pp-act="share">🔗 اشتراک پروفایل</button>' +
      (!isMe && R.ME ? '<button class="btn d mini" data-pp-act="report">🚩 گزارش پروفایل</button>' : "") +
      "</div></div>";
    return h;
  }

  /* ── ۶. نشاندن کارت ─────────────────────────────────────── */
  function paint() {
    var box = el("profBox");
    if (!box) return;
    var uid = R.VIEW || R.ME;
    if (!uid) return;
    var old = el("ppPlus");
    if (old && old.getAttribute("data-uid") === uid && old.getAttribute("data-html") === "1") return;

    var token = ++PP.run;
    load(uid).then(function (s) {
      if (token !== PP.run) return;               /* رندر تازه‌تری آمده */
      var box2 = el("profBox");
      if (!box2) return;
      var c = el("ppPlus");
      if (!c) {
        c = document.createElement("div");
        c.id = "ppPlus";
        box2.appendChild(c);
      }
      c.setAttribute("data-uid", uid);
      c.setAttribute("data-html", "1");
      c.innerHTML = inner(uid, s);
      PP.uid = uid;
    }, function () {});
  }

  /* ── ۷. کلیک‌ها ──────────────────────────────────────────── */
  function share(uid, name) {
    var url = location.origin + location.pathname;
    var txt = "پروفایل " + (name || "کاربر") + " در رونین استور — " + url;
    if (navigator.share) {
      try {
        var p = navigator.share({ title: "رونین استور", text: txt, url: url });
        if (p && p.catch) p.catch(function () {});
        return;
      } catch (e) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () {
        toast("🔗 لینک پروفایل کپی شد", "ok");
      }, function () { fallbackCopy(txt); });
      return;
    }
    fallbackCopy(txt);
  }

  function fallbackCopy(txt) {
    try {
      var a = document.createElement("textarea");
      a.value = txt;
      a.style.position = "fixed";
      a.style.opacity = "0";
      document.body.appendChild(a);
      a.select();
      var ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(a);
      toast(ok ? "🔗 لینک کپی شد" : txt, ok ? "ok" : "info");
    } catch (e) {
      toast(txt, "info");
    }
  }

  function report(uid) {
    if (!R.ME) return toast("برای گزارش باید وارد شوی", "err");
    if (uid === R.ME) return toast("گزارش خودت لازم نیست 🙂", "err");
    var why = window.prompt("دلیل گزارش این پروفایل را کوتاه بنویس:");
    if (why == null) return;
    var txt = String(why).trim().slice(0, 140) || "—";
    if (!R.add) return toast("اتصال آماده نیست", "err");
    R.add("reports", {
      uid: R.ME, by: (R.USER && R.USER.name) || "کاربر",
      type: "user", target: uid, text: txt, st: "new"
    }).then(function () {
      toast("گزارش ثبت شد — ممنون 🙏", "ok");
      if (R.notify && R.OWNER_UID) {
        try { R.notify(R.OWNER_UID, "🚩 گزارش پروفایل", "mod", "owner"); } catch (e) {}
      }
    }).catch(function (e) { toast("خطا: " + (e && e.message ? e.message : ""), "err"); });
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest("[data-pp-act]");
    if (!b || !el("ppPlus")) return;
    e.preventDefault();
    var a = b.getAttribute("data-pp-act");
    var uid = el("ppPlus").getAttribute("data-uid") || R.VIEW || R.ME;
    if (a === "share") {
      var u = (uid === R.ME && R.USER) ? R.USER : (R.VIEWU || {});
      share(uid, u && u.name);
    } else if (a === "report") {
      report(uid);
    } else if (a === "edit") {
      var box = el("profBox");
      var edit = box && box.querySelector("[data-editprof]");
      if (edit) edit.click();
      else if (R.go) R.go("profile");
    }
  });

  /* ── ۸. راه‌اندازی ───────────────────────────────────────── */
  function boot() {
    var box = el("profBox");
    if (!box) { setTimeout(boot, 500); return; }
    css();
    if (window.MutationObserver) {
      new MutationObserver(function () { setTimeout(paint, 0); })
        .observe(box, { childList: true });
    }
    paint();
  }

  var go0 = R.go;
  if (typeof go0 === "function") {
    R.go = function (name) {
      var out = go0.apply(R, arguments);
      if (String(name) === "profile") setTimeout(paint, 120);
      return out;
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();
  [900, 2500].forEach(function (ms) { setTimeout(boot, ms); });

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(paint, 800);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    PP.run++;
    var c = el("ppPlus");
    if (c) c.innerHTML = "";
  };

  /* برای تست و استفادهٔ بیرونی */
  R.ppPlus = { badges: badges, load: load, paint: paint };
})();

/* ───────── بخش ۳: هدر سینمایی و شخصی‌سازی ───────── */
/* ═══ RONIN STORE — PROFILE ULTRA · ronin-profile-ultra.js · v1
   ارتقای پروفایل و شخصی‌سازی اکانت (فایل افزودنی — هیچ فایل قبلی را عوض نمی‌کند)
   ───────────────────────────────────────────────────────────────
   • هدر سینمایی: کاور نئونی، هالهٔ نرم، حلقهٔ سطح دور آواتار
   • بج سطح، وضعیت (status) با ایموجی، دکمه‌های سریع (اشتراک/کارت پروفایل)
   • آمار شیشه‌ای، نوار XP با رنگ تمِ خودِ کاربر
   • کارت «🎛 شخصی‌سازی»: تم رنگی، کاور، وضعیت — ذخیره در users/<uid>/ui
   • کارت پروفایل PNG (canvas) برای اشتراک‌گذاری بیرون از سایت
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__pxu) return;
  R.__pxu = true;

  var VER = "v1";
  var PX = { u: null, uid: null, busy: false };

  function el(i) { return document.getElementById(i); }
  function bx() { return el("profBox"); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }

  /* ── ۱. تم‌ها و کاورها ──────────────────────────────────── */
  var PAL = [
    { id: "violet", n: "بنفش نئون", a: "#7c5cff", b: "#22d3ee" },
    { id: "sakura", n: "ساکورا",    a: "#ff4fcf", b: "#ffb03a" },
    { id: "cyber",  n: "سایبر",     a: "#22d3ee", b: "#3ddf9b" },
    { id: "ember",  n: "اخگر",      a: "#ff547d", b: "#ffb03a" },
    { id: "gold",   n: "طلایی",     a: "#ffd66b", b: "#e63946" },
    { id: "mint",   n: "نعنایی",    a: "#3ddf9b", b: "#22d3ee" },
    { id: "ice",    n: "یخی",       a: "#8fe9ff", b: "#b9a8ff" },
    { id: "onyx",   n: "اُبسیدین",   a: "#8b93b8", b: "#2a2d47" }
  ];
  var COV = [
    { id: "aurora", n: "شفق" },
    { id: "tokyo",  n: "توکیو" },
    { id: "sakura", n: "ساکورا" },
    { id: "onyx",   n: "شب" },
    { id: "gold",   n: "طلوع" }
  ];
  var EMO = ["🎧", "📚", "🎮", "☕", "🌙", "🔥", "💎", "🥷", "🚀", "🕯"];

  function palOf(id) {
    for (var i = 0; i < PAL.length; i++) if (PAL[i].id === id) return PAL[i];
    return PAL[0];
  }
  function uiOf(u) { return (u && u.ui) || {}; }

  /* ── ۲. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("pxuCss")) return;
    var accentRules = PAL.map(function (p) {
      return "#profBox[data-px='" + p.id + "']{--px1:" + p.a + ";--px2:" + p.b + "}";
    }).join("\n");

    var coverRules =
      "#sec-profile #profBox[data-cover='aurora'] .banner{background:" +
        "radial-gradient(60% 130% at 15% 0%,rgba(124,92,255,.75),transparent 60%)," +
        "radial-gradient(70% 120% at 85% 10%,rgba(34,211,238,.6),transparent 60%)," +
        "radial-gradient(60% 100% at 55% 120%,rgba(255,79,207,.45),transparent 60%)," +
        "linear-gradient(180deg,#141a44,#080b1e)!important}\n" +
      "#sec-profile #profBox[data-cover='tokyo'] .banner{background:" +
        "radial-gradient(70% 120% at 90% 0%,rgba(255,79,207,.7),transparent 60%)," +
        "radial-gradient(60% 110% at 10% 20%,rgba(124,92,255,.6),transparent 60%)," +
        "repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 26px)," +
        "linear-gradient(180deg,#1d0f36,#08061a)!important}\n" +
      "#sec-profile #profBox[data-cover='sakura'] .banner{background:" +
        "radial-gradient(65% 120% at 20% 0%,rgba(255,140,190,.72),transparent 62%)," +
        "radial-gradient(60% 110% at 85% 5%,rgba(255,214,107,.5),transparent 60%)," +
        "linear-gradient(180deg,#2c1030,#150920)!important}\n" +
      "#sec-profile #profBox[data-cover='onyx'] .banner{background:" +
        "radial-gradient(60% 120% at 80% 0%,rgba(139,147,184,.42),transparent 60%)," +
        "radial-gradient(55% 110% at 15% 10%,rgba(60,70,120,.55),transparent 60%)," +
        "linear-gradient(180deg,#12141f,#06070d)!important}\n" +
      "#sec-profile #profBox[data-cover='gold'] .banner{background:" +
        "radial-gradient(65% 120% at 25% 0%,rgba(255,214,107,.68),transparent 62%)," +
        "radial-gradient(60% 110% at 90% 10%,rgba(230,57,70,.45),transparent 60%)," +
        "linear-gradient(180deg,#2a1c08,#100a04)!important}";

    var s = document.createElement("style");
    s.id = "pxuCss";
    s.textContent = [
      "#profBox{--px1:#7c5cff;--px2:#22d3ee}",
      accentRules,

      /* ── هدر سینمایی ── */
      "#sec-profile .prof{border-radius:26px!important;overflow:hidden;position:relative;" +
        "border:1px solid rgba(140,140,255,.22)!important;" +
        "background:linear-gradient(180deg,rgba(14,18,44,.97),rgba(7,10,26,.99))!important;" +
        "box-shadow:0 34px 80px -44px rgba(96,64,240,.95),0 0 0 1px rgba(255,255,255,.03) inset!important}",
      "#sec-profile .prof .banner{height:168px!important;position:relative;overflow:hidden;" +
        "background:radial-gradient(60% 130% at 15% 0%,rgba(124,92,255,.7),transparent 60%)," +
        "radial-gradient(70% 120% at 85% 10%,rgba(34,211,238,.55),transparent 60%)," +
        "linear-gradient(180deg,#141a44,#080b1e);transition:background .4s}",
      "#sec-profile .prof .banner::after{content:\"\";position:absolute;inset:0;pointer-events:none;" +
        "background:linear-gradient(180deg,transparent 45%,rgba(7,10,26,.85));" +
        "box-shadow:inset 0 0 60px rgba(0,0,0,.55)}",
      coverRules,

      ".pxAura{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}",
      ".pxAura i{position:absolute;display:block;border-radius:50%;filter:blur(38px);opacity:.6}",
      ".pxAura i:nth-child(1){width:210px;height:210px;top:-110px;inset-inline-end:-40px;" +
        "background:radial-gradient(circle,var(--px1),transparent 70%);animation:pxFloat 12s ease-in-out infinite}",
      ".pxAura i:nth-child(2){width:190px;height:190px;bottom:-90px;inset-inline-start:-50px;" +
        "background:radial-gradient(circle,var(--px2),transparent 70%);animation:pxFloat 16s ease-in-out infinite reverse}",
      ".pxAura b{position:absolute;inset:0;opacity:.14;" +
        "background-image:linear-gradient(rgba(180,200,255,.6) 1px,transparent 1px)," +
        "linear-gradient(90deg,rgba(180,200,255,.6) 1px,transparent 1px);background-size:30px 30px;" +
        "mask-image:radial-gradient(120% 100% at 50% 0%,#000,transparent 80%);" +
        "-webkit-mask-image:radial-gradient(120% 100% at 50% 0%,#000,transparent 80%)}",
      "@keyframes pxFloat{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(0,-22px,0) scale(1.14)}}",

      "#sec-profile .prof .pinfo{position:relative;z-index:2;display:grid!important;" +
        "grid-template-columns:96px minmax(0,1fr);align-items:end;gap:6px 11px;" +
        "margin-top:-56px!important;padding:0 18px 18px!important}",
      ".pxAvW{grid-column:1;grid-row:1 / span 2}",
      "#sec-profile .prof .pinfo .grow{grid-column:2;grid-row:1}",
      ".pxBar{grid-column:2;grid-row:2;display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:5px}",

      /* آواتار + حلقهٔ سطح */
      ".pxAvW{position:relative;width:96px;height:96px;flex:0 0 96px;display:grid;place-items:center}",
      ".pxAvW .av{width:78px!important;height:78px!important;font-size:27px!important;border-radius:26px!important;" +
        "position:relative;z-index:2;margin:0!important;" +
        "box-shadow:0 0 0 3px rgba(6,9,22,.92),0 16px 34px -16px rgba(0,0,0,.95),0 0 26px -6px var(--px1)!important}",
      ".pxRing{position:absolute;inset:0;width:96px;height:96px;transform:rotate(-90deg);z-index:1}",
      ".pxRing .tr{fill:none;stroke:rgba(255,255,255,.12);stroke-width:3.5}",
      ".pxRing .pr{fill:none;stroke:var(--px2);stroke-width:3.5;stroke-linecap:round;" +
        "transition:stroke-dashoffset .8s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 0 6px " + "var(--px2))}",
      ".pxLvl{position:absolute;bottom:0;inset-inline-end:0;z-index:3;min-width:26px;height:26px;padding:0 6px;" +
        "display:grid;place-items:center;border-radius:10px;font-size:10.5px;font-weight:900;color:#06101f;" +
        "background:linear-gradient(135deg,var(--px2),var(--px1));" +
        "box-shadow:0 8px 18px -8px rgba(0,0,0,.95),0 0 0 2px rgba(6,9,22,.9)}",

      /* نام، چیپ‌ها، وضعیت */
      "#sec-profile .prof .pinfo b.h2{font-size:23px!important;line-height:1.3;letter-spacing:-.2px;" +
        "background:linear-gradient(90deg,#fff,var(--px2));-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#sec-profile .prof .pinfo .row.w{flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:6px}",
      "#sec-profile .prof .pinfo .row.w>b.h2,#sec-profile .prof .pinfo .row.w>.chip{flex:0 0 auto!important}",
      "#sec-profile .prof .pinfo .row.w .chip{background:rgba(255,255,255,.08)!important;" +
        "border:1px solid rgba(160,180,255,.3)!important;backdrop-filter:blur(6px);" +
        "font-size:9.5px!important;padding:2px 7px!important;line-height:1.7}",
      "#sec-profile .prof .pinfo .xs.mut{font-size:11.5px;line-height:1.7}",
      ".pxSt{display:inline-flex;align-items:center;gap:6px;margin-top:7px;padding:4px 11px;border-radius:99px;" +
        "font-size:11px;font-weight:700;color:#dfe7ff;max-width:100%;" +
        "background:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.04));" +
        "border:1px solid rgba(150,170,255,.26);box-shadow:0 8px 20px -14px rgba(0,0,0,.9)}",
      ".pxSt i{font-style:normal;font-size:10px;opacity:.85}",

      /* دکمه‌های سریع */
      ".pxActs{display:flex;gap:7px;margin-inline-start:auto}",
      ".pxA{width:38px;height:38px;border-radius:13px;display:grid;place-items:center;cursor:pointer;" +
        "font-size:15px;padding:0;color:#e6ecff;" +
        "border:1px solid rgba(160,180,255,.28);background:rgba(255,255,255,.07);" +
        "backdrop-filter:blur(8px);transition:transform .18s,border-color .2s,box-shadow .2s}",
      ".pxA:hover{transform:translateY(-2px);border-color:var(--px2);box-shadow:0 10px 24px -12px var(--px2)}",
      ".pxA:active{transform:scale(.94)}",

      /* آمار */
      "#sec-profile .stats{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;" +
        "margin-top:14px!important}",
      "#sec-profile .stats>div{text-align:center;padding:11px 3px;border-radius:16px;font-size:9.5px!important;" +
        "color:#a9b3d6;line-height:1.6;" +
        "background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02));" +
        "border:1px solid rgba(150,160,255,.16)}",
      "#sec-profile .stats b{font-size:18px!important;margin-bottom:2px;" +
        "background:linear-gradient(135deg,#fff,var(--px2));-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#sec-profile .xpbar i{background:linear-gradient(90deg,var(--px1),var(--px2))!important}",
      "#sec-profile #profEdit{border-radius:20px!important}",

      /* ── کارت شخصی‌سازی ── */
      ".pxCust{border-radius:22px!important;position:relative;overflow:hidden;" +
        "border:1px solid rgba(140,140,255,.24)!important;" +
        "background:radial-gradient(110% 80% at 100% 0%,rgba(124,92,255,.16),transparent 60%)," +
        "linear-gradient(180deg,rgba(14,18,44,.95),rgba(8,11,28,.97))!important}",
      ".pxLbl{font-size:11px;font-weight:800;color:#b9c4ea;margin:14px 0 7px;display:flex;" +
        "align-items:center;justify-content:space-between}",
      ".pxLbl span{font-size:9.5px;font-weight:700;opacity:.6}",
      ".pxSw{display:grid;grid-template-columns:repeat(8,1fr);gap:7px}",
      ".pxS{border:0;border-radius:12px;height:38px;padding:3px;cursor:pointer;background:transparent;" +
        "position:relative;transition:transform .16s}",
      ".pxS i{display:block;width:100%;height:100%;border-radius:9px;background:linear-gradient(135deg,var(--a),var(--b))}",
      ".pxS.on{box-shadow:0 0 0 2px #fff inset,0 8px 20px -10px var(--a);transform:translateY(-1px)}",
      ".pxS:active{transform:scale(.94)}",
      ".pxCv{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}",
      ".pxCvB{height:46px;border-radius:12px;border:1px solid rgba(150,170,255,.24);cursor:pointer;" +
        "font-size:9.5px;font-weight:800;color:#fff;display:grid;place-items:end center;padding:5px;" +
        "text-shadow:0 1px 4px rgba(0,0,0,.8);transition:transform .16s}",
      ".pxCvB.on{box-shadow:0 0 0 2px var(--px2) inset}",
      ".pxCvB[data-px-cover='aurora']{background:linear-gradient(160deg,#5b3cff,#22d3ee)}",
      ".pxCvB[data-px-cover='tokyo']{background:linear-gradient(160deg,#ff4fcf,#2a0f4a)}",
      ".pxCvB[data-px-cover='sakura']{background:linear-gradient(160deg,#ff8cbe,#ffd66b)}",
      ".pxCvB[data-px-cover='onyx']{background:linear-gradient(160deg,#8b93b8,#12141f)}",
      ".pxCvB[data-px-cover='gold']{background:linear-gradient(160deg,#ffd66b,#e63946)}",
      ".pxEmo{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 2px}",
      ".pxEmo b{font-style:normal;font-weight:400;font-size:15px;line-height:1;padding:6px 8px;border-radius:10px;" +
        "cursor:pointer;background:rgba(255,255,255,.06);border:1px solid rgba(150,170,255,.2);transition:.16s}",
      ".pxEmo b:hover{transform:translateY(-2px);border-color:var(--px2)}",
      ".pxCust .inp{height:42px;border-radius:13px!important;background:rgba(6,9,22,.55)!important}",
      ".pxCust .btn.p{background:linear-gradient(135deg,var(--px2),var(--px1))!important;color:#06101f!important;" +
        "border:0!important;box-shadow:0 12px 26px -14px var(--px1)!important}",

      /* ── روشن ── */
      "html[data-theme='light'] #sec-profile .prof{background:linear-gradient(180deg,#fff,#f2f5ff)!important;" +
        "border-color:rgba(90,110,200,.28)!important}",
      "html[data-theme='light'] #sec-profile .prof .pinfo b.h2{background:linear-gradient(90deg,#101532,var(--px1));" +
        "-webkit-background-clip:text;background-clip:text}",
      "html[data-theme='light'] .pxCust{background:linear-gradient(180deg,#fff,#f4f7ff)!important}",
      "html[data-theme='light'] .pxLbl{color:#3b4a80}",
      "html[data-theme='light'] #sec-profile .stats>div{background:#fff;color:#5a6796;" +
        "border-color:rgba(90,110,200,.2)}",
      "html[data-theme='light'] #sec-profile .stats b{background:linear-gradient(135deg,#101532,var(--px1));" +
        "-webkit-background-clip:text;background-clip:text}",
      "html[data-theme='light'] .pxSt{color:#1b2450;background:rgba(255,255,255,.8);" +
        "border-color:rgba(90,110,200,.3)}",
      "html[data-theme='light'] .pxA{color:#1b2450;background:rgba(255,255,255,.85);" +
        "border-color:rgba(90,110,200,.3)}",

      /* ── موبایل ── */
      "@media(max-width:560px){" +
        "#sec-profile .prof{border-radius:22px!important}" +
        "#sec-profile .prof .banner{height:140px!important}" +
        "#sec-profile .prof .pinfo{margin-top:-48px!important;padding:0 13px 15px!important;" +
        "grid-template-columns:86px minmax(0,1fr);gap:6px 9px}" +
        ".pxAvW{width:86px;height:86px;flex:0 0 86px}" +
        ".pxAvW .av{width:70px!important;height:70px!important;border-radius:23px!important}" +
        ".pxRing{width:86px;height:86px}" +
        "#sec-profile .prof .pinfo b.h2{font-size:20px!important}" +
        ".pxSw{grid-template-columns:repeat(8,1fr);gap:5px}.pxS{height:32px}" +
        ".pxCv{border-radius:10px}.pxCvB{height:42px;font-size:8.5px}" +
        "}",

      "@media(prefers-reduced-motion:reduce){" +
        ".pxAura i{animation:none!important}.pxRing .pr{transition:none!important}" +
        "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── ۳. ابزار ───────────────────────────────────────────── */
  function levelOf(u) {
    var xp = Number((u && u.xp) || 0);
    var lv = R.level ? R.level(xp) : 1;
    var next = R.xpFor ? R.xpFor(lv + 1) : 120;
    var base = R.xpFor ? R.xpFor(lv) : 0;
    var need = Math.max(1, next - base);
    var cur = Math.max(0, xp - base);
    return { xp: xp, lv: lv, pct: Math.max(0, Math.min(100, Math.round(cur * 100 / need))) };
  }
  function userOf(uid) {
    if (uid && uid === R.ME && R.USER) return Promise.resolve(R.USER);
    if (!R.get) return Promise.resolve({});
    try {
      return R.get("users/" + uid).then(function (u) { return u || {}; }, function () { return {}; });
    } catch (e) { return Promise.resolve({}); }
  }

  /* ── ۴. هدر ─────────────────────────────────────────────── */
  function hero(prof, uid, u) {
    if (!prof.querySelector(".pxAura")) {
      var a = document.createElement("div");
      a.className = "pxAura";
      a.innerHTML = "<i></i><i></i><b></b>";
      prof.insertBefore(a, prof.firstChild);
    }
    var pinfo = prof.querySelector(".pinfo");
    if (!pinfo) return;
    var info = levelOf(u);
    var off = (276.5 * (1 - info.pct / 100)).toFixed(1);

    var av = pinfo.querySelector(".av");
    if (av && !av.parentNode.classList.contains("pxAvW")) {
      var w = document.createElement("div");
      w.className = "pxAvW";
      w.innerHTML = '<svg class="pxRing" viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle class="tr" cx="50" cy="50" r="44"></circle>' +
        '<circle class="pr" cx="50" cy="50" r="44" style="stroke-dasharray:276.5;stroke-dashoffset:' + off + '"></circle>' +
        "</svg>";
      av.parentNode.insertBefore(w, av);
      w.appendChild(av);
      var lb = document.createElement("span");
      lb.className = "pxLvl";
      w.appendChild(lb);
    }
    var wrap = pinfo.querySelector(".pxAvW");
    if (wrap) {
      var ring = wrap.querySelector(".pxRing .pr");
      if (ring) ring.style.strokeDashoffset = off;
      var lvl = wrap.querySelector(".pxLvl");
      if (lvl) {
        lvl.textContent = fa(info.lv);
        lvl.title = "سطح " + fa(info.lv) + " — " + fa(info.pct) + "٪ تا سطح بعد";
      }
    }

    /* وضعیت */
    var grow = pinfo.querySelector(".grow");
    var nmRow = grow && grow.querySelector(".row.w");
    var stTxt = String(u.status || "").trim();
    var st = grow && grow.querySelector(".pxSt");
    if (stTxt && grow && nmRow) {
      if (!st) {
        st = document.createElement("div");
        st.className = "pxSt";
        nmRow.parentNode.insertBefore(st, nmRow.nextSibling);
      }
      if (st.getAttribute("data-v") !== stTxt) {
        st.setAttribute("data-v", stTxt);
        st.innerHTML = "<i>◉</i><span>" + esc(stTxt.slice(0, 40)) + "</span>";
      }
    } else if (st) st.remove();

    /* نوار دکمه‌ها: دکمه‌های موجود را کنار دکمه‌های تازه می‌برد */
    var bar = pinfo.querySelector(".pxBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "pxBar";
    }
    if (bar.parentNode !== pinfo) pinfo.appendChild(bar);
    Array.prototype.slice.call(pinfo.children).forEach(function (n) {
      if (n === bar || n === grow || n === wrap || n.classList.contains("pxAvW")) return;
      if (n.classList.contains("pxActs")) { bar.appendChild(n); return; }
      if (n.tagName === "BUTTON" || n.classList.contains("row")) bar.appendChild(n);
    });
    if (!bar.querySelector(".pxActs")) {
      var acts = document.createElement("div");
      acts.className = "pxActs";
      acts.innerHTML =
        '<button class="pxA" type="button" data-px-share="' + esc(uid) + '" title="اشتراک پروفایل">🔗</button>' +
        '<button class="pxA" type="button" data-px-card="' + esc(uid) + '" title="کارت پروفایل PNG">🎴</button>';
      bar.appendChild(acts);
    }
  }

  /* ── ۵. کارت شخصی‌سازی ──────────────────────────────────── */
  function custCard(box, uid, u) {
    var box2 = box;
    var old = el("pxCust");
    if (!(uid && uid === R.ME)) { if (old) old.remove(); return; }
    var ui = uiOf(u);
    var accent = ui.accent || "violet";
    var cover = ui.cover || "aurora";
    var status = String(u.status || "");
    var sig = accent + "|" + cover + "|" + status;

    var c = old;
    if (!c) {
      c = document.createElement("div");
      c.id = "pxCust";
      c.className = "card mb pxCust";
      var head = box2.querySelector(".head");
      if (head && head.parentNode) head.parentNode.insertBefore(c, head);
      else box2.appendChild(c);
    }
    if (c.getAttribute("data-sig") === sig) return;
    c.setAttribute("data-sig", sig);

    c.innerHTML =
      '<div class="between"><span class="sm b">🎛 شخصی‌سازی پروفایل</span>' +
        '<span class="chip cy">' + fa(PAL.length) + " تم</span></div>" +
      '<div class="xs mut">تغییرها همان لحظه روی پروفایل خودت ذخیره می‌شود</div>' +

      '<div class="pxLbl">🎨 تم و رنگ نام<span>' + esc(palOf(accent).n) + "</span></div>" +
      '<div class="pxSw">' + PAL.map(function (p) {
        return '<button class="pxS' + (p.id === accent ? " on" : "") + '" type="button" ' +
          'data-px-accent="' + p.id + '" title="' + esc(p.n) + '" ' +
          'style="--a:' + p.a + ";--b:" + p.b + '"><i></i></button>';
      }).join("") + "</div>" +

      '<div class="pxLbl">🖼 کاور پروفایل<span>' + esc((COV.filter(function (x) { return x.id === cover; })[0] || COV[0]).n) + "</span></div>" +
      '<div class="pxCv">' + COV.map(function (x) {
        return '<button class="pxCvB' + (x.id === cover ? " on" : "") + '" type="button" ' +
          'data-px-cover="' + x.id + '">' + esc(x.n) + "</button>";
      }).join("") + "</div>" +

      '<div class="pxLbl">💬 وضعیت<span>تا ۴۰ حرف</span></div>' +
      '<input class="inp" id="pxStatus" maxlength="40" placeholder="مثلاً: 🎧 در حال ساخت سایت" value="' + esc(status) + '">' +
      '<div class="pxEmo">' + EMO.map(function (e) {
        return '<b data-px-emo="' + e + '">' + e + "</b>";
      }).join("") + "</div>" +

      '<div class="row w" style="gap:7px;flex-wrap:wrap;margin-top:12px">' +
        '<button class="btn p mini" type="button" data-px-save="1">💾 ذخیره وضعیت</button>' +
        '<button class="btn mini" type="button" data-px-card="' + esc(uid) + '">🎴 کارت پروفایل</button>' +
      "</div>";
  }

  /* ── ۶. نشاندن همه‌چیز ──────────────────────────────────── */
  function decorate(force) {
    if (PX.busy) return;
    var box = bx();
    if (!box) return;
    var prof = box.querySelector(".prof");
    if (!prof) return;
    var uid = R.VIEW || R.ME;
    if (!uid) return;
    if (!force && prof.getAttribute("data-px-uid") === uid) return;
    prof.setAttribute("data-px-uid", uid);

    PX.busy = true;
    userOf(uid).then(function (u) {
      PX.busy = false;
      PX.u = u;
      PX.uid = uid;
      var box2 = bx();
      var prof2 = box2 && box2.querySelector(".prof");
      if (!prof2) return;
      var ui = uiOf(u);
      box2.setAttribute("data-px", ui.accent || "violet");
      box2.setAttribute("data-cover", ui.cover || "aurora");
      css();
      try { hero(prof2, uid, u); } catch (e) {}
      try { custCard(box2, uid, u); } catch (e) {}
    }, function () { PX.busy = false; });
  }

  /* ── ۷. ذخیره ───────────────────────────────────────────── */
  function needMe() {
    if (!R.ME) { toast("برای شخصی‌سازی وارد شو", "err"); return false; }
    if (!R.upd) { toast("اتصال آماده نیست", "err"); return false; }
    return true;
  }
  function saveUI(o) {
    if (!needMe()) return;
    var local = function () {
      R.USER.ui = R.USER.ui || {};
      for (var k in o) R.USER.ui[k] = o[k];
      var b = bx();
      if (b) {
        if (o.accent) b.setAttribute("data-px", o.accent);
        if (o.cover) b.setAttribute("data-cover", o.cover);
      }
      PX.u = R.USER;
      try { custCard(b, R.ME, R.USER); } catch (e) {}
    };
    local();
    R.upd("users/" + R.ME + "/ui", o).then(function () {
      toast("🎨 ذخیره شد", "ok");
    }).catch(function (e) {
      toast("نشد: " + (e && e.message ? e.message : ""), "err");
    });
  }
  function saveStatus() {
    if (!needMe()) return;
    var i = el("pxStatus");
    var v = String((i && i.value) || "").replace(/\s+/g, " ").trim().slice(0, 40);
    R.upd("users/" + R.ME, { status: v }).then(function () {
      R.USER.status = v;
      PX.u = R.USER;
      var c = el("pxCust");
      if (c) c.removeAttribute("data-sig");
      toast(v ? "💬 وضعیت ذخیره شد" : "وضعیت برداشته شد", "ok");
      decorate(true);
    }).catch(function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
  }

  /* ── ۸. اشتراک‌گذاری ────────────────────────────────────── */
  function shareProfile(uid) {
    var u = (uid === R.ME && R.USER) ? R.USER : (PX.u || {});
    var url = location.origin + location.pathname + "#profile";
    var txt = "پروفایل " + (u.name || "کاربر") + " در رونین استور";
    if (navigator.share) {
      try {
        var p = navigator.share({ title: "رونین استور", text: txt, url: url });
        if (p && p.catch) p.catch(function () {});
        return;
      } catch (e) {}
    }
    copy(txt + " — " + url, "🔗 لینک کپی شد");
  }
  function copy(txt, msg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast(msg, "ok"); }, function () { fallback(txt, msg); });
    } else fallback(txt, msg);
  }
  function fallback(txt, msg) {
    try {
      var a = document.createElement("textarea");
      a.value = txt;
      a.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(a);
      a.select();
      document.execCommand("copy");
      document.body.removeChild(a);
      toast(msg, "ok");
    } catch (e) { toast(txt, "info"); }
  }

  /* ── ۹. کارت PNG ────────────────────────────────────────── */
  function roundRect(x, X, Y, W, H, r) {
    x.beginPath();
    x.moveTo(X + r, Y);
    x.arcTo(X + W, Y, X + W, Y + H, r);
    x.arcTo(X + W, Y + H, X, Y + H, r);
    x.arcTo(X, Y + H, X, Y, r);
    x.arcTo(X, Y, X + W, Y, r);
    x.closePath();
  }
  function rgba(hex, a) {
    var h = String(hex || "#7c5cff").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function initials(name) {
    var s = String(name || "?").trim();
    var parts = s.split(/\s+/);
    return (parts[0] ? parts[0][0] : "?") + (parts[1] ? parts[1][0] : "");
  }
  function followersOf(uid) {
    if (!R.get || !uid) return Promise.resolve(0);
    try {
      return R.get("followers/" + uid).then(function (v) {
        return Object.keys(v || {}).length;
      }, function () { return 0; });
    } catch (e) { return Promise.resolve(0); }
  }

  function exportCard(uid) {
    uid = uid || R.VIEW || R.ME;
    if (!uid) return toast("اول وارد شو", "err");
    var start = function (u) {
      followersOf(uid).then(function (fo) { drawCard(u || {}, fo); });
    };
    if (uid === R.ME && R.USER) start(R.USER);
    else userOf(uid).then(start);
  }

  function drawCard(u, followers) {
    var W = 1000, H = 600;
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var x = cv.getContext("2d");
    var p = palOf(uiOf(u).accent || "violet");
    var FF = (function () {
      try { return getComputedStyle(document.body).fontFamily || "sans-serif"; }
      catch (e) { return "sans-serif"; }
    })();

    /* پس‌زمینه */
    x.fillStyle = "#06091a";
    x.fillRect(0, 0, W, H);
    var g1 = x.createRadialGradient(W * 0.86, H * 0.05, 0, W * 0.86, H * 0.05, W * 0.75);
    g1.addColorStop(0, rgba(p.a, 0.62));
    g1.addColorStop(1, "rgba(6,9,26,0)");
    x.fillStyle = g1; x.fillRect(0, 0, W, H);
    var g2 = x.createRadialGradient(W * 0.08, H * 1.02, 0, W * 0.08, H * 1.02, W * 0.62);
    g2.addColorStop(0, rgba(p.b, 0.5));
    g2.addColorStop(1, "rgba(6,9,26,0)");
    x.fillStyle = g2; x.fillRect(0, 0, W, H);

    x.strokeStyle = "rgba(170,190,255,.07)";
    x.lineWidth = 1;
    for (var i = 50; i < W; i += 50) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (var j = 50; j < H; j += 50) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }

    x.strokeStyle = rgba(p.a, 0.5); x.lineWidth = 3;
    roundRect(x, 16, 16, W - 32, H - 32, 34); x.stroke();
    x.strokeStyle = "rgba(255,255,255,.08)";
    roundRect(x, 26, 26, W - 52, H - 52, 28); x.stroke();

    /* آواتار */
    var cx = W - 168, cy = 232, r = 84;
    var av = u.av;
    var done = function () {
      if (av && /^data:|^https?:/.test(av)) {
        var im = new Image();
        if (/^https?:/.test(av)) im.crossOrigin = "anonymous";
        im.onload = function () { paintAvatar(im); };
        im.onerror = function () { paintAvatar(null); render(); };
        try { im.src = av; } catch (e) { paintAvatar(null); render(); }
      } else { paintAvatar(null); render(); }
    };
    var painted = false;
    function paintAvatar(img) {
      if (painted) return; painted = true;
      x.save();
      x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.closePath(); x.clip();
      if (img) { x.drawImage(img, cx - r, cy - r, r * 2, r * 2); }
      else {
        var gg = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        gg.addColorStop(0, p.a); gg.addColorStop(1, p.b);
        x.fillStyle = gg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
        x.fillStyle = "rgba(6,9,26,.85)";
        x.font = "900 62px " + FF;
        x.textAlign = "center"; x.textBaseline = "middle";
        x.fillText(initials(u.name).toUpperCase(), cx, cy + 4);
      }
      x.restore();
      x.beginPath(); x.arc(cx, cy, r + 9, 0, Math.PI * 2);
      x.strokeStyle = rgba(p.b, 0.9); x.lineWidth = 5; x.stroke();
      x.beginPath(); x.arc(cx, cy, r + 18, 0, Math.PI * 2);
      x.strokeStyle = "rgba(255,255,255,.1)"; x.lineWidth = 1; x.stroke();
      var info = levelOf(u);
      x.beginPath(); x.arc(cx, cy, r + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (info.pct / 100));
      x.strokeStyle = rgba(p.a, 0.95); x.lineWidth = 5; x.stroke();
      render();
    }

    function render() {
      var info = levelOf(u);
      x.textBaseline = "alphabetic";
      x.textAlign = "right";
      x.fillStyle = "rgba(160,175,220,.9)";
      x.font = "800 20px " + FF;
      x.fillText("RONIN STORE", W - 60, 78);

      x.fillStyle = "#fff";
      x.font = "900 52px " + FF;
      x.fillText(String(u.name || "کاربر").slice(0, 22), W - 300, 208);

      x.fillStyle = rgba(p.b, 0.98);
      x.font = "800 24px " + FF;
      x.fillText("سطح " + fa(info.lv) + "  •  " + fa(info.xp) + " XP", W - 300, 248);

      var st = String(u.status || "").trim();
      if (st) {
        x.fillStyle = "rgba(220,230,255,.86)";
        x.font = "600 22px " + FF;
        x.fillText(st.slice(0, 40), W - 300, 330);
      }
      if (u.title) {
        x.fillStyle = "rgba(255,214,107,.95)";
        x.font = "800 20px " + FF;
        x.fillText(u.title, W - 300, 292);
      }

      /* آمار */
      var posts = 0, likes = 0;
      Object.keys(R.POSTS || {}).forEach(function (k) {
        var q = R.POSTS[k];
        if (!q || q.uid !== (PX.uid || R.VIEW || R.ME)) return;
        posts++;
        likes += q.lk ? Object.keys(q.lk).length : 0;
      });
      var cells = [
        [fa(posts), "پست"],
        [fa(likes), "لایک"],
        [fa(followers || 0), "دنبال‌کننده"],
        [fa(info.lv), "سطح"]
      ];
      var bw = 190, gap = 18, total = cells.length * bw + (cells.length - 1) * gap;
      var sx = W - 60 - total, sy = 430;
      cells.forEach(function (c, i) {
        var bx0 = sx + i * (bw + gap);
        x.fillStyle = "rgba(255,255,255,.06)";
        roundRect(x, bx0, sy, bw, 96, 22); x.fill();
        x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1; x.stroke();
        x.textAlign = "center";
        x.fillStyle = "#fff"; x.font = "900 34px " + FF;
        x.fillText(c[0], bx0 + bw / 2, sy + 50);
        x.fillStyle = "rgba(180,195,235,.85)"; x.font = "700 18px " + FF;
        x.fillText(c[1], bx0 + bw / 2, sy + 78);
      });

      x.textAlign = "right";
      x.fillStyle = "rgba(140,155,200,.7)";
      x.font = "600 16px " + FF;
      x.fillText(location.host || "ronin", W - 60, H - 44);

      try {
        var url = cv.toDataURL("image/png");
        var a = document.createElement("a");
        a.href = url;
        a.download = "ronin-" + String(u.name || "profile").replace(/[^\w\u0600-\u06FF-]+/g, "-") + ".png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast("🎴 کارت پروفایل ساخته شد", "ok");
      } catch (e) {
        toast("ساخت کارت نشد — عکس آواتار از دامنهٔ دیگر است", "err");
      }
    }
    done();
  }

  /* ── ۱۰. کلیک‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest(
      "[data-px-accent],[data-px-cover],[data-px-emo],[data-px-save],[data-px-share],[data-px-card]") : null;
    if (!t) return;
    if (!bx() || !bx().contains(t)) return;

    if (t.hasAttribute("data-px-accent")) {
      e.preventDefault();
      saveUI({ accent: t.getAttribute("data-px-accent") });
    } else if (t.hasAttribute("data-px-cover")) {
      e.preventDefault();
      saveUI({ cover: t.getAttribute("data-px-cover") });
    } else if (t.hasAttribute("data-px-emo")) {
      e.preventDefault();
      var i = el("pxStatus");
      if (i) {
        var em = t.getAttribute("data-px-emo");
        i.value = (em + " " + i.value.replace(/^[^\w\u0600-\u06FF]+\s*/, "")).trim().slice(0, 40);
        try { i.focus(); } catch (er) {}
      }
    } else if (t.hasAttribute("data-px-save")) {
      e.preventDefault();
      saveStatus();
    } else if (t.hasAttribute("data-px-share")) {
      e.preventDefault();
      shareProfile(t.getAttribute("data-px-share"));
    } else if (t.hasAttribute("data-px-card")) {
      e.preventDefault();
      exportCard(t.getAttribute("data-px-card"));
    }
  });

  /* ── ۱۱. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    var box = bx();
    if (!box) { setTimeout(boot, 600); return; }
    css();
    if (window.MutationObserver && !box.__pxObs) {
      box.__pxObs = 1;
      new MutationObserver(function () { setTimeout(function () { decorate(false); }, 0); })
        .observe(box, { childList: true, subtree: true });
    }
    decorate(true);
  }

  var go0 = R.go;
  if (typeof go0 === "function") {
    R.go = function (name) {
      var out = go0.apply(R, arguments);
      if (String(name) === "profile") setTimeout(function () { decorate(true); }, 150);
      return out;
    };
  }
  R.hooks = R.hooks || {};
  var hp0 = R.hooks.profile;
  R.hooks.profile = function () {
    if (hp0) { try { hp0(); } catch (e) {} }
    setTimeout(function () { decorate(true); }, 120);
  };
  var lgn0 = R.onLogin;
  R.onLogin = function () {
    if (lgn0) { try { lgn0(); } catch (e) {} }
    setTimeout(function () { decorate(true); }, 900);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    var c = el("pxCust");
    if (c) c.remove();
    PX.u = null; PX.uid = null;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else boot();
  [800, 2000, 3800].forEach(function (ms) { setTimeout(boot, ms); });
  setTimeout(function () { decorate(true); }, 6000);

  /* API */
  R.profUltra = {
    ver: VER,
    decorate: decorate,
    export: exportCard,
    palettes: PAL,
    covers: COV,
    ui: function () { return uiOf(PX.u); }
  };
  try { console.log("[Ronin] profile-ultra " + VER + " ✓"); } catch (e) {}
})();
