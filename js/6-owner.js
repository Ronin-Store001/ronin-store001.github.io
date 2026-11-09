/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                js/6-owner.js
   پنل مالک: آمار زنده • کاربران • دسترسی‌ها • تایید محتوا • سفارش‌ها
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

R.USERS = {}; R.PENDING = {}; R.ORDERS = {}; R.REPORTS = {};
R.ownerTab = "overview"; R.uq = "";

/* ── ۱. خواندن داده‌های مالک ─────────────────────────────── */
R.watchOwner = function () {
  if (!R.db || !R.isOwner() || R._ow) return;
  R._ow = true;
  R.db.ref("users").limitToLast(300).on("value", function (s) {
    R.USERS = s.val() || {}; R.paintOwner();
  }, function (e) { console.warn("[Ronin] users:", e.message); });
  R.db.ref("pending").on("value", function (s) { R.PENDING = s.val() || {}; R.paintOwner(); });
  R.db.ref("orders").limitToLast(200).on("value", function (s) { R.ORDERS = s.val() || {}; R.paintOwner(); });
  R.db.ref("reports").limitToLast(200).on("value", function (s) { R.REPORTS = s.val() || {}; R.paintOwner(); });
};

/* ── ۲. آمار زنده ─────────────────────────────────────────── */
R.stats = function () {
  var posts = R.POSTS || {}, likes = 0, cmts = 0;
  Object.keys(posts).forEach(function (k) {
    var p = posts[k];
    likes += p.lk ? Object.keys(p.lk).length : 0;
    cmts += p.cm ? Object.keys(p.cm).length : 0;
  });
  var U = R.USERS || {}, users = Object.keys(U).length, prem = 0, banned = 0;
  Object.keys(U).forEach(function (k) {
    if (U[k].prem) prem++;
    if (U[k].banned) banned++;
  });
  var prods = R.PRODS || {}, live = 0, pendA = 0;
  Object.keys(prods).forEach(function (k) {
    if (R.isLive(prods[k])) live++; else if (prods[k].st === "pending") pendA++;
  });
  var ord = R.ORDERS || {}, newOrd = 0;
  Object.keys(ord).forEach(function (k) { if (ord[k].st === "new") newOrd++; });
  var rep = R.REPORTS || {}, newRep = 0;
  Object.keys(rep).forEach(function (k) { if (rep[k].st !== "done") newRep++; });
  return {
    users: users, prem: prem, banned: banned, online: Object.keys(R.ONLINE || {}).length,
    posts: Object.keys(posts).length, likes: likes, cmts: cmts,
    prods: live, pendA: pendA, orders: Object.keys(ord).length, newOrd: newOrd,
    reps: Object.keys(rep).length, newRep: newRep,
    pend: Object.keys(R.PENDING || {}).length
  };
};

/* ── ۳. رنگ‌آمیزی پنل ─────────────────────────────────────── */
R.paintOwner = function () {
  if (!R.isOwner()) return;
  var s = R.stats();
  R.setT("kUsers", R.fa(s.users));
  R.setT("kOnline", R.fa(s.online));
  R.setT("kPrem", R.fa(s.prem));
  R.setT("kPosts", R.fa(s.posts));
  R.setT("kLikes", R.fa(s.likes));
  R.setT("kCmts", R.fa(s.cmts));
  R.setT("kProds", R.fa(s.prods));
  R.setT("kOrders", R.fa(s.orders));
  R.setT("kPend", R.fa(s.pend));
  R.setT("kReps", R.fa(s.newRep));
  var badge = s.pend + s.pendA + s.newOrd + s.newRep;
  var el = R.$("ownCount");
  if (el) { el.textContent = R.fa(badge); el.style.display = badge ? "" : "none"; }
  R.renderOwner();
};

/* ── ۴. نمودار ۷ روزه ────────────────────────────────────── */
R.chartHTML = function () {
  var days = [], now = Date.now();
  for (var i = 6; i >= 0; i--) {
    days.push({ k: new Date(now - i * 86400000).toISOString().slice(0, 10), n: 0 });
  }
  Object.keys(R.USERS || {}).forEach(function (k) {
    var j = R.USERS[k].joined;
    if (!j) return;
    var d = new Date(j).toISOString().slice(0, 10);
    for (var i = 0; i < days.length; i++) if (days[i].k === d) days[i].n++;
  });
  var mx = 1;
  days.forEach(function (d) { if (d.n > mx) mx = d.n; });
  var h = '<div class="chart">';
  days.forEach(function (d) {
    h += '<i style="height:' + Math.max(6, Math.round(d.n * 100 / mx)) + '%" title="' +
      d.n + '"></i>';
  });
  return h + '</div><div class="xs mut center">کاربران جدید در ۷ روز گذشته</div>';
};

/* ── ۵. نمای کلی ─────────────────────────────────────────── */
R.ovHTML = function () {
  var s = R.stats();
  var K = [["kUsers", s.users, "کاربر کل"], ["kOnline", s.online, "آنلاین"],
           ["kPrem", s.prem, "پرمیوم"], ["kPosts", s.posts, "پست"],
           ["kLikes", s.likes, "لایک"], ["kCmts", s.cmts, "کامنت"],
           ["kProds", s.prods, "آگهی فعال"], ["kOrders", s.orders, "سفارش"],
           ["kPend", s.pend, "در انتظار تایید"], ["kReps", s.newRep, "گزارش باز"]];
  var h = '<div class="grid auto">';
  var seen = {};
  K.forEach(function (r) {
    if (seen[r[0]]) return; seen[r[0]] = 1;
    h += '<div class="kpi"><div class="n" id="' + r[0] + '">' + R.fa(r[1]) + '</div><div class="l">' +
      r[2] + "</div></div>";
  });
  h += "</div>";
  h += '<div class="head"><h3 class="h3">رشد کاربران</h3></div><div class="card">' + R.chartHTML() + "</div>";

  var U = Object.keys(R.USERS || {}).map(function (k) { var u = R.USERS[k]; u.uid = k; return u; })
    .sort(function (a, b) { return (b.joined || 0) - (a.joined || 0); }).slice(0, 6);
  h += '<div class="head"><h3 class="h3">تازه‌واردها</h3></div>';
  h += U.length ? U.map(function (u) {
    return '<div class="lrow mb">' + R.avHTML(u, "sm") + '<div class="grow" style="min-width:0">' +
      '<div class="sm b ellip">' + R.esc(u.name || "کاربر") + '</div>' +
      '<div class="xs mut">' + R.roleFa(u.role) + " • " + R.time(u.joined) + "</div></div>" +
      '<button class="btn mini" data-dmto="' + u.uid + '">💬</button></div>';
  }).join("") : '<div class="empty">هنوز کسی ثبت‌نام نکرده</div>';
  return h;
};

/* ── ۶. کاربران و دسترسی‌ها ──────────────────────────────── */
R.usersHTML = function () {
  var q = (R.uq || "").toLowerCase();
  var arr = Object.keys(R.USERS || {}).map(function (k) { var u = R.USERS[k]; u.uid = k; return u; })
    .filter(function (u) {
      if (!q) return true;
      return (u.name || "").toLowerCase().indexOf(q) > -1 ||
             (u.email || "").toLowerCase().indexOf(q) > -1;
    })
    .sort(function (a, b) { return (b.joined || 0) - (a.joined || 0); });

  var h = '<input class="inp mb" id="uqIn" placeholder="جستجوی نام یا ایمیل…" value="' + R.esc(R.uq) + '">';
  if (!arr.length) return h + '<div class="empty">کاربری پیدا نشد</div>';

  arr.forEach(function (u) {
    var me = u.uid === R.ME;
    h += '<div class="card mb"><div class="row">' + R.avHTML(u) +
      '<div class="grow" style="min-width:0">' +
      '<div class="row w" style="gap:5px"><b class="sm">' + R.esc(u.name || "کاربر") + "</b>" +
      '<span class="chip" style="padding:1px 7px;font-size:9.5px">' + R.roleFa(u.role) + "</span>" +
      (u.prem ? '<span class="chip gd" style="padding:1px 7px;font-size:9.5px">💎 پرمیوم</span>' : "") +
      (u.banned ? '<span class="chip bad" style="padding:1px 7px;font-size:9.5px">مسدود</span>' : "") +
      (me ? '<span class="chip cy" style="padding:1px 7px;font-size:9.5px">👑 خودت</span>' : "") +
      "</div>" +
      '<div class="xs mut ellip" dir="ltr">' + R.esc(u.email || "—") + "</div>" +
      '<div class="xs mut">سطح ' + R.fa(R.level(u.xp || 0)) + " • " + R.fa(u.xp || 0) +
      " XP • عضو از " + R.time(u.joined) + "</div>" +
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
      R.PERMS.map(function (p) {
        var on = u.perms && u.perms[p] === true;
        return '<button class="btn mini' + (on ? " p" : "") + '" data-perm="' + u.uid + ":" + p + '">' + p + "</button>";
      }).join("") + "</div></details></div>";
  });
  return h;
};

/* ── ۷. تایید پست‌های کارکنان ────────────────────────────── */
R.modHTML = function () {
  var arr = Object.keys(R.PENDING || {}).map(function (k) { var p = R.PENDING[k]; p.id = k; return p; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  if (!arr.length) return '<div class="empty">هیچ پستی در انتظار تایید نیست ✅</div>';
  return arr.map(function (p) {
    return '<div class="card mb"><div class="row">' + R.avHTML({ name: p.n, av: p.av }, "sm") +
      '<div class="grow"><b class="sm">' + R.esc(p.n || "کاربر") + "</b>" +
      '<div class="xs mut">' + R.roleFa(p.urole) + " • " + R.time(p.t) + "</div></div></div>" +
      '<div class="pbody" style="margin:10px 0">' + R.esc(p.text || "") + "</div>" +
      '<div class="row w" style="gap:6px">' +
      '<button class="btn ok mini" data-apost="' + p.id + '">✅ تایید و انتشار</button>' +
      '<button class="btn d mini" data-rpost="' + p.id + '">❌ رد</button>' +
      '<button class="btn mini" data-dpost="' + p.id + '">🗑 حذف</button></div></div>';
  }).join("");
};

/* ── ۸. تایید آگهی‌ها ────────────────────────────────────── */
R.pendAdsHTML = function () {
  var arr = R.prodList().filter(function (p) { return p.st === "pending"; });
  if (!arr.length) return '<div class="empty">هیچ آگهی در انتظاری نیست ✅</div>';
  return arr.map(function (p) {
    return '<div class="card mb"><div class="row"><div style="font-size:30px">' + (p.icon || "🎁") +
      '</div><div class="grow" style="min-width:0"><div class="sm b ellip">' + R.esc(p.name) + "</div>" +
      '<div class="xs mut">' + R.esc(p.sellerName || "فروشنده") + " • " + R.money(p.price) + " " +
      R.esc(p.cur || "تومان") + "</div></div></div>" +
      (p.desc ? '<div class="sm mut mt">' + R.esc(p.desc) + "</div>" : "") +
      '<div class="row w" style="gap:6px;margin-top:10px">' +
      '<button class="btn ok mini" data-aad="' + p.id + '">✅ تایید</button>' +
      '<button class="btn d mini" data-rad="' + p.id + '">❌ رد</button>' +
      '<button class="btn mini" data-prod="' + p.id + '">نمایش</button></div></div>';
  }).join("");
};

/* ── ۹. سفارش‌ها ─────────────────────────────────────────── */
R.ordersHTML = function () {
  var arr = Object.keys(R.ORDERS || {}).map(function (k) { var o = R.ORDERS[k]; o.id = k; return o; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  if (!arr.length) return '<div class="empty">هنوز سفارشی ثبت نشده</div>';
  return arr.map(function (o) {
    return '<div class="card mb"><div class="row between"><b class="sm">' + R.esc(o.pname || "محصول") +
      '</b><span class="chip ' + (o.st === "new" ? "gd" : "ok") + '">' +
      (o.st === "new" ? "جدید" : "بررسی‌شده") + "</span></div>" +
      '<div class="xs mut mt">' + R.money(o.price) + " " + R.esc(o.cur || "تومان") + " × " +
      R.fa(o.qty || 1) + " • " + R.time(o.t) + "</div>" +
      '<div class="sm mt">👤 ' + R.esc(o.buyerName || "خریدار") + "</div>" +
      '<div class="sm cy" dir="auto">📞 ' + R.esc(o.contact || "—") + "</div>" +
      (o.msg ? '<div class="sm mut mt">' + R.esc(o.msg) + "</div>" : "") +
      '<div class="row w" style="gap:6px;margin-top:10px">' +
      '<button class="btn ok mini" data-odone="' + o.id + '">✅ بررسی شد</button>' +
      '<button class="btn d mini" data-odel="' + o.id + '">🗑 حذف</button>' +
      (o.buyerUid ? '<button class="btn mini" data-dmto="' + o.buyerUid + '">💬 خریدار</button>' : "") +
      "</div></div>";
  }).join("");
};

/* ── ۱۰. گزارش‌ها ────────────────────────────────────────── */
R.reportsHTML = function () {
  var arr = Object.keys(R.REPORTS || {}).map(function (k) { var r = R.REPORTS[k]; r.id = k; return r; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  if (!arr.length) return '<div class="empty">هیچ گزارشی ثبت نشده ✅</div>';
  return arr.map(function (r) {
    return '<div class="card mb"><div class="row between"><b class="sm">' +
      (r.type === "msg" ? "🚩 پیام" : "🚩 پست") + '</b><span class="chip ' +
      (r.st === "done" ? "ok" : "bad") + '">' + (r.st === "done" ? "رسیدگی شد" : "باز") + "</span></div>" +
      '<div class="xs mut mt">گزارش‌دهنده: ' + R.esc(r.by || "کاربر") + " • " + R.time(r.t) + "</div>" +
      '<div class="sm mt">دلیل: ' + R.esc(r.text || "—") + "</div>" +
      '<div class="row w" style="gap:6px;margin-top:10px">' +
      '<button class="btn ok mini" data-rdone="' + r.id + '">✅ رسیدگی شد</button>' +
      '<button class="btn d mini" data-rdel="' + r.id + '">🗑 حذف</button>' +
      '<button class="btn mini" data-goto="' + R.esc(r.target || "") + '">مشاهده</button></div></div>';
  }).join("");
};

/* ── ۱۱. تنظیمات ─────────────────────────────────────────── */
R.settingsHTML = function () {
  return '<div class="card mb"><div class="sm b mb">👑 هویت مالک</div>' +
    '<div class="xs mut">UID قفل‌شده در قوانین دیتابیس:</div>' +
    '<div class="sm cy" dir="ltr">' + R.esc(R.OWNER_UID || "— هنوز تنظیم نشده —") + "</div>" +
    '<div class="xs mut mt">UID فعلی تو:</div><div class="sm" dir="ltr">' + R.esc(R.ME || "") + "</div></div>" +
    '<div class="card mb"><div class="sm b mb">📢 اعلان سراسری</div>' +
    '<input class="inp" id="setAnn" maxlength="120" placeholder="متن اعلان…" value="' +
      R.esc((R.SITE && R.SITE.ann) || "") + '">' +
    '<button class="btn p mini mt" data-saveann="1">ذخیره اعلان</button></div>' +
    '<div class="card mb"><div class="sm b mb">🔐 یادآوری امنیت</div>' +
    '<div class="xs mut">قوانین Firebase باید Publish شده باشند؛ وگرنه هیچ‌کس نمی‌تواند بنویسد. ' +
    'قوانین در کنسول → Realtime Database → Rules قرار می‌گیرند.</div></div>';
};

/* ── ۱۲. رسم پنل ─────────────────────────────────────────── */
R.renderOwner = function () {
  var b = R.$("ownerBody");
  if (!b || !R.isOwner()) return;
  var t = R.ownerTab;
  if (t === "users") b.innerHTML = R.usersHTML();
  else if (t === "mod") b.innerHTML = R.modHTML();
  else if (t === "ads") b.innerHTML = R.pendAdsHTML();
  else if (t === "orders") b.innerHTML = R.ordersHTML();
  else if (t === "reports") b.innerHTML = R.reportsHTML();
  else if (t === "settings") b.innerHTML = R.settingsHTML();
  else b.innerHTML = R.ovHTML();
};

/* ── ۱۳. کنش‌های مالک ───────────────────────────────────── */
R.setRole = function (uid, role) {
  if (!R.isOwner()) return R.toast("فقط مالک", "err");
  if (uid === R.ME) return R.toast("نقش خودت تغییر نمی‌کند 👑", "err");
  if (role === "owner") return R.toast("مالک دوم وجود ندارد", "err");
  R.upd("users/" + uid, { role: role }).then(function () {
    R.toast("نقش تغییر کرد ✅", "ok");
    R.notify(uid, "🎖 نقش تو به «" + R.roleFa(role) + "» تغییر کرد");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.togglePrem = function (uid) {
  if (!R.isOwner()) return;
  var on = !((R.USERS || {})[uid] || {}).prem;
  R.upd("users/" + uid, { prem: on }).then(function () {
    R.toast(on ? "💎 پرمیوم فعال شد" : "پرمیوم حذف شد", "ok");
    R.notify(uid, on ? "💎 پرمیوم فعال شد!" : "پرمیوم غیرفعال شد");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.toggleBan = function (uid) {
  if (!R.isOwner()) return;
  var on = !((R.USERS || {})[uid] || {}).banned;
  R.upd("users/" + uid, { banned: on }).then(function () {
    R.toast(on ? "مسدود شد" : "رفع شد", "ok");
  });
};
R.togglePerm = function (uid, perm) {
  if (!R.isOwner()) return;
  var u = (R.USERS || {})[uid] || {};
  var on = !!(u.perms && u.perms[perm]);
  R.db.ref("users/" + uid + "/perms/" + perm).set(on ? null : true)
    .then(function () {
      u.perms = u.perms || {};
      if (on) delete u.perms[perm]; else u.perms[perm] = true;
      R.toast(on ? "دسترسی برداشته شد" : "دسترسی داده شد", "ok");
      R.renderOwner();
    }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.approvePost = function (pid) {
  if (!R.isOwner()) return;
  var p = (R.PENDING || {})[pid]; if (!p) return;
  p.status = "published"; p.ap = Date.now();
  R.db.ref("posts/" + pid).set(p).then(function () {
    return R.db.ref("pending/" + pid).remove();
  }).then(function () {
    R.notify(p.uid, "✅ پستت تایید و منتشر شد");
    R.toast("منتشر شد ✅", "ok");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.rejectPost = function (pid) {
  if (!R.isOwner()) return;
  var p = (R.PENDING || {})[pid] || {};
  R.db.ref("pending/" + pid).remove().then(function () {
    R.notify(p.uid, "❌ پستت تایید نشد");
    R.toast("رد شد", "ok");
  });
};
R.approveAd = function (id) {
  if (!R.isOwner()) return;
  var p = (R.PRODS || {})[id] || {};
  R.upd("products/" + id, { st: "live" }).then(function () {
    R.notify(p.sellerUid, "✅ آگهی «" + (p.name || "") + "» تایید شد");
    R.toast("آگهی منتشر شد ✅", "ok");
  });
};
R.rejectAd = function (id) {
  if (!R.isOwner()) return;
  var p = (R.PRODS || {})[id] || {};
  R.upd("products/" + id, { st: "rejected" }).then(function () {
    R.notify(p.sellerUid, "❌ آگهی «" + (p.name || "") + "» تایید نشد");
    R.toast("رد شد", "ok");
  });
};
R.orderDone = function (id) { R.upd("orders/" + id, { st: "done" }); R.toast("علامت‌گذاری شد", "ok"); };
R.orderDel = function (id) { R.db.ref("orders/" + id).remove(); };
R.repDone = function (id) { R.upd("reports/" + id, { st: "done" }); R.toast("رسیدگی شد", "ok"); };
R.repDel = function (id) { R.db.ref("reports/" + id).remove(); };
R.saveAnn = function () {
  if (!R.isOwner()) return;
  var v = R.clean(R.$("setAnn") ? R.$("setAnn").value : "", 120);
  R.set("settings/site", { ann: v }).then(function () { R.toast("ذخیره شد ✅", "ok"); });
};

/* ── ۱۴. اتصال رویدادها ─────────────────────────────────── */
R.bindOwner = function () {
  R.qa("[data-otab]").forEach(function (b) {
    b.addEventListener("click", function () {
      R.ownerTab = b.getAttribute("data-otab");
      R.qa("[data-otab]").forEach(function (x) { x.classList.toggle("on", x === b); });
      R.renderOwner();
    });
  });
  var body = R.$("ownerBody");
  if (body) {
    body.addEventListener("input", function (e) {
      if (e.target.id === "uqIn") { R.uq = e.target.value; R.renderOwner(); }
    });
    body.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest(
        "[data-role],[data-pm],[data-ban],[data-perm],[data-apost],[data-rpost],[data-dpost]," +
        "[data-aad],[data-rad],[data-odone],[data-odel],[data-rdone],[data-rdel],[data-saveann],[data-goto]"
      ) : null;
      if (!t) return;
      if (t.hasAttribute("data-role")) {
        var a = t.getAttribute("data-role").split(":");
        R.setRole(a[0], a[1]);
      }
      else if (t.hasAttribute("data-pm")) R.togglePrem(t.getAttribute("data-pm"));
      else if (t.hasAttribute("data-ban")) R.toggleBan(t.getAttribute("data-ban"));
      else if (t.hasAttribute("data-perm")) {
        var b = t.getAttribute("data-perm").split(":");
        R.togglePerm(b[0], b[1]);
      }
      else if (t.hasAttribute("data-apost")) R.approvePost(t.getAttribute("data-apost"));
      else if (t.hasAttribute("data-rpost")) R.rejectPost(t.getAttribute("data-rpost"));
      else if (t.hasAttribute("data-dpost")) R.db.ref("pending/" + t.getAttribute("data-dpost")).remove();
      else if (t.hasAttribute("data-aad")) R.approveAd(t.getAttribute("data-aad"));
      else if (t.hasAttribute("data-rad")) R.rejectAd(t.getAttribute("data-rad"));
      else if (t.hasAttribute("data-odone")) R.orderDone(t.getAttribute("data-odone"));
      else if (t.hasAttribute("data-odel")) R.orderDel(t.getAttribute("data-odel"));
      else if (t.hasAttribute("data-rdone")) R.repDone(t.getAttribute("data-rdone"));
      else if (t.hasAttribute("data-rdel")) R.repDel(t.getAttribute("data-rdel"));
      else if (t.hasAttribute("data-saveann")) R.saveAnn();
      else if (t.hasAttribute("data-goto")) {
        var g = t.getAttribute("data-goto").split("/")[0];
        if (g === "chat") R.go("chat"); else if (g === "posts") R.go("community");
      }
    });
  }
};

/* ── ۱۵. آماده‌سازی ─────────────────────────────────────── */
R.bootOwner = function () {
  R.bindOwner();
  R.watchOwner();
};

})();
