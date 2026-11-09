/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»               js/7-extra.js
   انیمه • اخبار • کاوش • رتبه‌بندی • رویداد • پروفایل • اعلان • پرمیوم
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

R.ANIME = {}; R.NEWS = {}; R.EVENTS = {};
R.MYNOTIF = {}; R.VIEW = null; R.bellOn = false;

/* ══════════ ۱. اعلان‌ها ══════════ */
R.watchNotifs = function () {
  if (!R.db || !R.ME) return;
  R.db.ref("notifs/" + R.ME).limitToLast(50).on("value", function (s) {
    var v = s.val() || {}, out = {};
    Object.keys(v).forEach(function (k) { var n = v[k]; n.id = k; out[k] = n; });
    R.MYNOTIF = out; R.paintBell(); if (R.paintOwner) R.paintOwner();
  }, function (e) { console.warn("[Ronin] notifs:", e.message); });
};
R.paintBell = function () {
  var arr = Object.keys(R.MYNOTIF || {}).map(function (k) { return R.MYNOTIF[k]; });
  var unread = arr.filter(function (n) { return !n.read; }).length;
  var dot = R.$("bellDot");
  if (dot) { dot.textContent = R.fa(unread); dot.style.display = unread ? "" : "none"; }
  var box = R.$("notifBox");
  if (!box) return;
  var sorted = arr.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  if (!sorted.length) { box.innerHTML = '<div class="empty">اعلانی نداری 🔔</div>'; return; }
  box.innerHTML = sorted.map(function (n) {
    var ic = n.kind === "mod" ? "🛡" : n.kind === "order" ? "🛒" : n.kind === "info" ? "ℹ️" : "🔔";
    return '<div class="notif' + (n.read ? "" : " unread") + '" data-nread="' + n.id + '">' +
      '<div style="font-size:19px">' + ic + "</div>" +
      '<div class="grow" style="min-width:0"><div class="sm">' + R.esc(n.text) + "</div>" +
      '<div class="xs mut">' + R.time(n.t) + "</div></div></div>";
  }).join("");
};
R.readNotif = function (id) {
  if (!R.ME || !id) return;
  R.db.ref("notifs/" + R.ME + "/" + id + "/read").set(true).catch(function () {});
  if (R.MYNOTIF[id]) { R.MYNOTIF[id].read = true; R.paintBell(); }
};
R.readAll = function () {
  if (!R.ME) return;
  Object.keys(R.MYNOTIF || {}).forEach(function (k) {
    if (!R.MYNOTIF[k].read) R.db.ref("notifs/" + R.ME + "/" + k + "/read").set(true);
  });
  R.toast("همه خوانده شد ✅", "ok");
};

/* ══════════ ۲. انیمه ══════════ */
R.watchAnime = function () {
  if (!R.db) return;
  R.db.ref("anime").limitToLast(120).on("value", function (s) { R.ANIME = s.val() || {}; R.renderAnime(); });
};
R.animeCard = function (a) {
  return '<div class="anime" data-anime="' + a.id + '">' +
    '<div class="cover">' + (a.icon || "🎬") + "</div>" +
    '<div class="info"><div class="sm b ellip">' + R.esc(a.title) + "</div>" +
    '<div class="xs mut ellip">' + R.esc(a.gen || "—") + (a.st ? " • " + R.esc(a.st) : "") + "</div>" +
    (a.rate ? '<span class="chip gd" style="position:absolute;top:9px;inset-inline-end:9px">⭐ ' +
      R.esc(a.rate) + "</span>" : "") + "</div></div>";
};
R.renderAnime = function () {
  var w = R.$("animeWall"); if (!w) return;
  var arr = Object.keys(R.ANIME || {}).map(function (k) { var a = R.ANIME[k]; a.id = k; return a; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  w.innerHTML = arr.length ? arr.map(R.animeCard).join("")
    : '<div class="empty">هنوز انیمه‌ای اضافه نشده 🎬<br>مالک می‌تواند از فرم بالا اضافه کند</div>';
  var f = R.$("animeForm");
  if (f) f.style.display = (R.isOwner() || R.can("anime")) ? "" : "none";
};
R.addAnime = function () {
  if (!(R.isOwner() || R.can("anime"))) return R.toast("دسترسی نداری", "err");
  var v = function (id) { return R.clean(R.$(id) ? R.$(id).value : "", 400); };
  var title = v("anTitle");
  if (title.length < 2) return R.toast("نام انیمه را بنویس", "err");
  R.add("anime", {
    title: title, jp: v("anJp"), icon: R.clean(v("anIcon"), 4) || "🎬",
    gen: v("anGen"), st: v("anStatus") || "در حال پخش",
    rate: v("anRate"), desc: v("anDesc"), by: R.ME
  }).then(function () {
    R.toast("انیمه اضافه شد ✅", "ok");
    ["anTitle", "anJp", "anGen", "anDesc", "anRate"].forEach(function (id) {
      var e = R.$(id); if (e) e.value = "";
    });
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.openAnime = function (id) {
  var a = (R.ANIME || {})[id]; if (!a) return;
  var h = '<div class="row" style="align-items:flex-start"><div style="font-size:44px">' +
    (a.icon || "🎬") + '</div><div class="grow" style="min-width:0"><div class="h2">' +
    R.esc(a.title) + "</div>" + (a.jp ? '<div class="xs mut" dir="ltr">' + R.esc(a.jp) + "</div>" : "") +
    '<div class="row w mt" style="gap:6px">' +
    (a.gen ? '<span class="chip cy">' + R.esc(a.gen) + "</span>" : "") +
    (a.st ? '<span class="chip">' + R.esc(a.st) + "</span>" : "") +
    (a.rate ? '<span class="chip gd">⭐ ' + R.esc(a.rate) + "</span>" : "") + "</div></div>" +
    '<button class="icobtn" data-close="infoMod">✕</button></div>' +
    '<div class="sm mt" style="line-height:1.9">' + R.esc(a.desc || "بدون توضیح").replace(/\n/g, "<br>") + "</div>" +
    (R.isOwner() ? '<button class="btn d mini mt" data-delanime="' + id + '">🗑 حذف</button>' : "");
  R.openInfo("🎬 " + a.title, h);
};

/* ══════════ ۳. اخبار ══════════ */
R.watchNews = function () {
  if (!R.db) return;
  R.db.ref("news").limitToLast(80).on("value", function (s) { R.NEWS = s.val() || {}; R.renderNews(); });
};
R.renderNews = function () {
  var w = R.$("newsWall"); if (!w) return;
  var arr = Object.keys(R.NEWS || {}).map(function (k) { var n = R.NEWS[k]; n.id = k; return n; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  w.innerHTML = arr.length ? arr.map(function (n) {
    return '<div class="news mb" data-news="' + n.id + '">' +
      '<div class="thumb">' + (n.icon || "📰") + "</div>" +
      '<div class="grow" style="min-width:0"><div class="sm b">' + R.esc(n.title) + "</div>" +
      '<div class="xs mut">' + R.esc(n.cat || "خبر") + " • " + R.time(n.t) +
      (n.views ? " • 👁 " + R.fa(n.views) : "") + "</div></div></div>";
  }).join("") : '<div class="empty">هنوز خبری منتشر نشده 📰</div>';
  var f = R.$("newsForm");
  if (f) f.style.display = (R.isOwner() || R.can("news")) ? "" : "none";
};
R.addNews = function () {
  if (!(R.isOwner() || R.can("news"))) return R.toast("دسترسی نداری", "err");
  var t = R.clean(R.$("nwTitle") ? R.$("nwTitle").value : "", 120);
  var b = R.clean(R.$("nwBody") ? R.$("nwBody").value : "", 3000);
  if (t.length < 3) return R.toast("تیتر خبر را بنویس", "err");
  R.add("news", {
    title: t, body: b, cat: R.clean(R.$("nwCat") ? R.$("nwCat").value : "", 30) || "عمومی",
    icon: R.clean(R.$("nwIcon") ? R.$("nwIcon").value : "", 4) || "📰",
    by: R.ME, views: 0
  }).then(function () {
    R.toast("خبر منتشر شد ✅", "ok");
    if (R.$("nwTitle")) R.$("nwTitle").value = "";
    if (R.$("nwBody")) R.$("nwBody").value = "";
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.openNews = function (id) {
  var n = (R.NEWS || {})[id]; if (!n) return;
  n.views = (n.views || 0) + 1;
  R.db.ref("news/" + id + "/views").set(n.views).catch(function () {});
  var h = '<div class="row" style="align-items:flex-start"><div style="font-size:38px">' +
    (n.icon || "📰") + '</div><div class="grow"><div class="h2">' + R.esc(n.title) + "</div>" +
    '<div class="xs mut">' + R.esc(n.cat || "خبر") + " • " + R.time(n.t) + " • 👁 " +
    R.fa(n.views) + "</div></div>" +
    '<button class="icobtn" data-close="infoMod">✕</button></div>' +
    '<div class="sm mt" style="line-height:2">' + R.esc(n.body || "").replace(/\n/g, "<br>") + "</div>" +
    (R.isOwner() ? '<button class="btn d mini mt" data-delnews="' + id + '">🗑 حذف</button>' : "");
  R.openInfo("📰 خبر", h);
};

/* ══════════ ۴. رویدادها ══════════ */
R.watchEvents = function () {
  if (!R.db) return;
  R.db.ref("events").limitToLast(60).on("value", function (s) { R.EVENTS = s.val() || {}; R.renderEvents(); });
};
R.renderEvents = function () {
  var w = R.$("evWall"); if (!w) return;
  var arr = Object.keys(R.EVENTS || {}).map(function (k) { var e = R.EVENTS[k]; e.id = k; return e; })
    .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  w.innerHTML = arr.length ? arr.map(function (e) {
    return '<div class="card hov mb"><div class="row between"><b class="sm">' + R.esc(e.title) +
      '</b><span class="chip cy">' + R.esc(e.when || "به‌زودی") + "</span></div>" +
      '<div class="sm mut mt">' + R.esc(e.body || "") + "</div></div>";
  }).join("") : '<div class="empty">فعلاً رویدادی نیست 📅</div>';
  var f = R.$("evForm");
  if (f) f.style.display = R.isOwner() ? "" : "none";
};
R.addEvent = function () {
  if (!R.isOwner()) return R.toast("فقط مالک", "err");
  var t = R.clean(R.$("evTitle") ? R.$("evTitle").value : "", 90);
  if (t.length < 3) return R.toast("عنوان رویداد را بنویس", "err");
  R.add("events", {
    title: t, when: R.clean(R.$("evWhen") ? R.$("evWhen").value : "", 30),
    body: R.clean(R.$("evBody") ? R.$("evBody").value : "", 600), by: R.ME
  }).then(function () {
    R.toast("رویداد ساخته شد ✅", "ok");
    if (R.$("evTitle")) R.$("evTitle").value = "";
    if (R.$("evBody")) R.$("evBody").value = "";
  });
};

/* ══════════ ۵. کاوش و رتبه‌بندی ══════════ */
R.renderDiscover = function () {
  var w = R.$("discBox"); if (!w) return;
  var posts = R.feedList ? Object.keys(R.POSTS || {}).map(function (k) {
    var p = R.POSTS[k]; p.id = k; return p;
  }).filter(function (p) { return p.status !== "pending"; }) : [];
  var hot = posts.slice().sort(function (a, b) { return R.score(b) - R.score(a); }).slice(0, 5);
  var prods = R.prodList ? R.prodList().filter(R.isLive).slice(0, 4) : [];
  var users = Object.keys(R.USERS || {}).map(function (k) { var u = R.USERS[k]; u.uid = k; return u; })
    .sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });

  var h = '<div class="head"><h3 class="h3">🔥 داغ‌ترین گفتگوها</h3></div>';
  h += hot.length ? hot.map(function (p) {
    return '<div class="lrow mb"><div style="font-size:17px">🔥</div><div class="grow" style="min-width:0">' +
      '<div class="sm ellip">' + R.esc((p.text || "").slice(0, 70)) + "</div>" +
      '<div class="xs mut">' + R.esc(p.n || "کاربر") + " • ❤️ " +
      R.fa(p.lk ? Object.keys(p.lk).length : 0) + "</div></div></div>";
  }).join("") : '<div class="empty">بعد از چند پست، داغ‌ترین‌ها اینجا می‌آیند</div>';

  if (prods.length) {
    h += '<div class="head"><h3 class="h3">🛒 تازه‌های فروشگاه</h3></div><div class="grid auto">' +
      prods.map(R.prodCard).join("") + "</div>";
  }
  if (users.length) {
    h += '<div class="head"><h3 class="h3">🏆 پرتجربه‌ها</h3></div>';
    h += users.slice(0, 5).map(function (u, i) {
      return '<div class="lrow mb"><div class="rk">' + R.fa(i + 1) + "</div>" +
        R.avHTML(u, "sm") + '<div class="grow" style="min-width:0"><div class="sm b ellip">' +
        R.esc(u.name || "کاربر") + '</div><div class="xs mut">سطح ' + R.fa(R.level(u.xp || 0)) +
        "</div></div></div>";
    }).join("");
  }
  w.innerHTML = h;
};
R.renderRank = function () {
  var w = R.$("rankBox"); if (!w) return;
  var users = Object.keys(R.USERS || {}).map(function (k) { var u = R.USERS[k]; u.uid = k; return u; })
    .sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });
  if (!users.length) { w.innerHTML = '<div class="empty">جدول رتبه‌بندی بعد از ثبت‌نام چند نفر پر می‌شود 🏆</div>'; return; }
  w.innerHTML = users.slice(0, 30).map(function (u, i) {
    var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : R.fa(i + 1);
    return '<div class="lrow mb"><div class="rk">' + medal + "</div>" + R.avHTML(u, "sm") +
      '<div class="grow" style="min-width:0"><div class="row" style="gap:6px"><b class="sm ellip">' +
      R.esc(u.name || "کاربر") + "</b>" + (u.prem ? '<span class="chip gd" style="padding:1px 7px;font-size:9px">💎</span>' : "") +
      '</div><div class="xs mut">سطح ' + R.fa(R.level(u.xp || 0)) + "</div></div>" +
      '<div class="sm b cy">' + R.fa(u.xp || 0) + " XP</div></div>";
  }).join("");
};

/* ══════════ ۶. پروفایل ══════════ */
R.renderProfile = function (uid) {
  uid = uid || R.ME;
  R.VIEW = uid;
  var box = R.$("profBox"); if (!box) return;
  if (!uid) {
    box.innerHTML = '<div class="empty">برای دیدن پروفایل وارد شو 👤</div>';
    return;
  }
  var isMe = uid === R.ME;
  R.get("users/" + uid).then(function (u) {
    u = u || {};
    return R.get("followers/" + uid).then(function (fo) {
      return R.get("follows/" + uid).then(function (fw) { return { u: u, fo: fo || {}, fw: fw || {} }; });
    });
  }).then(function (r) {
    var u = r.u, mine = (R.USER && isMe) ? R.USER : u;
    var posts = Object.keys(R.POSTS || {}).map(function (k) {
      var p = R.POSTS[k]; p.id = k; return p;
    }).filter(function (p) { return p.uid === uid && p.status !== "pending"; });
    var likes = 0;
    posts.forEach(function (p) { likes += p.lk ? Object.keys(p.lk).length : 0; });
    var xp = u.xp || 0, lv = R.level(xp);
    var cur = xp - R.xpFor(lv), need = R.xpFor(lv + 1) - R.xpFor(lv);

    var h = '<div class="prof"><div class="banner"></div><div class="pinfo">' +
      R.avHTML(u, "lg") +
      '<div class="grow" style="min-width:0"><div class="row w" style="gap:6px">' +
      '<b class="h2">' + R.esc(u.name || "کاربر") + "</b>" +
      '<span class="chip">' + R.roleFa(u.role || "user") + "</span>" +
      (u.prem ? '<span class="chip gd">💎 پرمیوم</span>' : "") + "</div>" +
      '<div class="xs mut">' + (u.bio ? R.esc(u.bio) : "بدون بیو") + "</div>" +
      '<div class="xs mut">عضو از ' + R.time(u.joined) + "</div></div>";
    if (!isMe) {
      var f = R.FOLLOW[uid] ? "لغو دنبال" : "دنبال کن";
      h += '<div class="row" style="gap:6px"><button class="btn ' + (R.FOLLOW[uid] ? "" : "p") +
        ' mini" data-follow="' + uid + '">' + f + '</button>' +
        '<button class="btn mini" data-dmto="' + uid + '">💬 پیام</button></div>';
    } else {
      h += '<button class="btn mini" data-editprof="1">✏️ ویرایش پروفایل</button>';
    }
    h += "</div></div>";

    h += '<div class="stats mt mb">' +
      '<div><b>' + R.fa(posts.length) + "</b>پست</div>" +
      '<div><b>' + R.fa(Object.keys(r.fo).length) + "</b>دنبال‌کننده</div>" +
      '<div><b>' + R.fa(Object.keys(r.fw).length) + "</b>دنبال‌شده</div>" +
      '<div><b>' + R.fa(likes) + "</b>لایک</div>" +
      '<div><b>' + R.fa(lv) + "</b>سطح</div></div>";

    h += '<div class="card mb"><div class="between"><span class="sm b">تجربه (XP)</span>' +
      '<span class="sm cy">' + R.fa(xp) + " / " + R.fa(R.xpFor(lv + 1)) + "</span></div>" +
      '<div class="xpbar"><i style="width:' + Math.min(100, Math.round(cur * 100 / Math.max(1, need))) +
      '%"></i></div></div>';

    if (isMe) {
      h += '<div id="profEdit" class="card mb hide"><div class="sm b mb">ویرایش پروفایل</div>' +
        '<div class="col"><div class="field"><label class="lbl">نام نمایشی</label>' +
        '<input class="inp" id="peName" maxlength="24" value="' + R.esc(u.name || "") + '"></div>' +
        '<div class="field"><label class="lbl">بیو</label>' +
        '<textarea class="area" id="peBio" maxlength="200">' + R.esc(u.bio || "") + "</textarea></div>" +
        '<div class="field"><label class="lbl">آدرس آواتار (اختیاری)</label>' +
        '<input class="inp" id="peAv" dir="ltr" maxlength="300" value="' + R.esc(u.av || "") + '"></div>' +
        '<button class="btn p" data-saveprof="1">ذخیره</button></div></div>';
    }

    h += '<div class="head"><h3 class="h3">پست‌ها</h3></div>';
    h += posts.length ? posts.sort(function (a, b) { return (b.t || 0) - (a.t || 0); })
      .slice(0, 12).map(function (p) { return R.postCard(p).outerHTML; }).join("")
      : '<div class="empty">هنوز پستی نداری</div>';
    box.innerHTML = h;
  }).catch(function (e) { console.warn("[Ronin] profile:", e.message); });
};
R.saveProfile = function () {
  if (!R.ME) return R.needLogin("ویرایش پروفایل");
  var n = R.clean(R.$("peName") ? R.$("peName").value : "", 24);
  var b = R.clean(R.$("peBio") ? R.$("peBio").value : "", 200);
  var a = R.clean(R.$("peAv") ? R.$("peAv").value : "", 300);
  if (n.length < 2) return R.toast("نام خیلی کوتاهه", "err");
  if (a && a.indexOf("http") !== 0) return R.toast("آدرس آواتار باید با http شروع شود", "err");
  R.upd("users/" + R.ME, { name: n, bio: b, av: a }).then(function () {
    R.USER.name = n; R.USER.bio = b; R.USER.av = a;
    R.paintUser(); R.renderProfile(R.ME);
    R.toast("پروفایل ذخیره شد ✅", "ok");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};

/* ══════════ ۷. پرمیوم ══════════ */
R.premReq = function () {
  if (!R.ME) return R.needLogin("پرمیوم");
  if (R.prem) return R.toast("تو همین حالا پرمیومی 💎", "ok");
  R.add("premreq", { uid: R.ME, name: (R.USER && R.USER.name) || "", st: "new" }).then(function () {
    R.toast("درخواست پرمیوم ثبت شد — مالک بررسی می‌کند 💎", "ok");
    R.notify(R.OWNER_UID, "💎 درخواست پرمیوم: " + ((R.USER && R.USER.name) || ""), "info", "owner");
  }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
};
R.paintPrem = function () {
  var on = R.prem;
  R.qa("[data-premstate]").forEach(function (e) {
    e.textContent = on ? "💎 پرمیوم فعال است" : "هنوز پرمیوم نیستی";
  });
  var b = R.$("premBtn");
  if (b) { b.textContent = on ? "پرمیوم فعال ✅" : "درخواست پرمیوم 💎"; b.disabled = on; }
};

/* ══════════ ۸. جستجو ══════════ */
R.search = function (q) {
  q = R.clean(q, 40).toLowerCase();
  var out = R.$("sqOut"); if (!out) return;
  if (q.length < 2) { out.innerHTML = '<div class="empty">حداقل ۲ حرف بنویس 🔍</div>'; return; }
  var hit = function (s) { return (s || "").toLowerCase().indexOf(q) > -1; };
  var h = "";

  var posts = Object.keys(R.POSTS || {}).map(function (k) { var p = R.POSTS[k]; p.id = k; return p; })
    .filter(function (p) { return p.status !== "pending" && hit(p.text); }).slice(0, 6);
  if (posts.length) {
    h += '<div class="h3 mb mt">💬 پست‌ها</div>';
    posts.forEach(function (p) {
      h += '<div class="lrow mb" data-gosearch="community"><div style="font-size:16px">💬</div>' +
        '<div class="grow" style="min-width:0"><div class="sm ellip">' +
        R.esc((p.text || "").slice(0, 80)) + "</div><div class=\"xs mut\">" +
        R.esc(p.n || "کاربر") + "</div></div></div>";
    });
  }
  var prods = R.prodList ? R.prodList().filter(function (p) {
    return R.isLive(p) && (hit(p.name) || hit(p.desc) || hit(p.company));
  }).slice(0, 6) : [];
  if (prods.length) {
    h += '<div class="h3 mb mt">🛒 محصولات</div>';
    prods.forEach(function (p) {
      h += '<div class="lrow mb" data-prod="' + p.id + '"><div style="font-size:18px">' +
        (p.icon || "🎁") + '</div><div class="grow" style="min-width:0"><div class="sm b ellip">' +
        R.esc(p.name) + '</div><div class="xs mut">' + R.money(p.price) + "</div></div></div>";
    });
  }
  var an = Object.keys(R.ANIME || {}).map(function (k) { var a = R.ANIME[k]; a.id = k; return a; })
    .filter(function (a) { return hit(a.title) || hit(a.gen); }).slice(0, 6);
  if (an.length) {
    h += '<div class="h3 mb mt">🎬 انیمه</div>';
    an.forEach(function (a) {
      h += '<div class="lrow mb" data-anime="' + a.id + '"><div style="font-size:18px">' +
        (a.icon || "🎬") + '</div><div class="grow" style="min-width:0"><div class="sm b ellip">' +
        R.esc(a.title) + '</div><div class="xs mut">' + R.esc(a.gen || "") + "</div></div></div>";
    });
  }
  var nw = Object.keys(R.NEWS || {}).map(function (k) { var n = R.NEWS[k]; n.id = k; return n; })
    .filter(function (n) { return hit(n.title) || hit(n.body); }).slice(0, 6);
  if (nw.length) {
    h += '<div class="h3 mb mt">📰 اخبار</div>';
    nw.forEach(function (n) {
      h += '<div class="lrow mb" data-news="' + n.id + '"><div style="font-size:18px">📰</div>' +
        '<div class="grow" style="min-width:0"><div class="sm b ellip">' + R.esc(n.title) +
        '</div><div class="xs mut">' + R.esc(n.cat || "") + "</div></div></div>";
    });
  }
  out.innerHTML = h || '<div class="empty">چیزی پیدا نشد 😕</div>';
};

/* ══════════ ۹. مودال اطلاعات ══════════ */
R.openInfo = function (title, html) {
  R.setT("infoTitle", title);
  R.setH("infoBody", html);
  R.mod("infoMod", true);
};

/* ══════════ ۱۰. اتصال رویدادها ══════════ */
R.bindExtra = function () {
  if (R.$("anBtn")) R.$("anBtn").addEventListener("click", R.addAnime);
  if (R.$("nwBtn")) R.$("nwBtn").addEventListener("click", R.addNews);
  if (R.$("evBtn")) R.$("evBtn").addEventListener("click", R.addEvent);
  if (R.$("premBtn")) R.$("premBtn").addEventListener("click", R.premReq);
  if (R.$("bellBtn")) R.$("bellBtn").addEventListener("click", function () { R.mod("notifMod", true); });
  if (R.$("readAll")) R.$("readAll").addEventListener("click", R.readAll);
  if (R.$("sqIn")) R.$("sqIn").addEventListener("input",
    R.debounce(function (e) { R.search(e.target.value); }, 260));
  var prof = R.$("profBox");
  if (prof) prof.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(
      "[data-follow],[data-editprof],[data-saveprof],[data-lk],[data-cm],[data-bm],[data-rp],[data-del]") : null;
    if (!t) return;
    if (t.hasAttribute("data-follow")) R.follow(t.getAttribute("data-follow"));
    else if (t.hasAttribute("data-editprof")) {
      var f = R.$("profEdit"); if (f) f.classList.toggle("hide");
    }
    else if (t.hasAttribute("data-saveprof")) R.saveProfile();
    else if (t.hasAttribute("data-lk")) R.like(t.getAttribute("data-lk"));
    else if (t.hasAttribute("data-cm")) {
      var a = t.getAttribute("data-cm"); R.OPEN_CMT[a] = !R.OPEN_CMT[a]; R.renderProfile(R.VIEW);
    }
    else if (t.hasAttribute("data-bm")) R.bookmark(t.getAttribute("data-bm"));
    else if (t.hasAttribute("data-rp")) R.report(t.getAttribute("data-rp"));
    else if (t.hasAttribute("data-del")) R.delPost(t.getAttribute("data-del"));
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(
      "[data-anime],[data-news],[data-nread],[data-delanime],[data-delnews],[data-gosearch]") : null;
    if (!t) return;
    if (t.hasAttribute("data-anime")) R.openAnime(t.getAttribute("data-anime"));
    else if (t.hasAttribute("data-news")) R.openNews(t.getAttribute("data-news"));
    else if (t.hasAttribute("data-nread")) R.readNotif(t.getAttribute("data-nread"));
    else if (t.hasAttribute("data-delanime")) {
      if (R.isOwner() && window.confirm("حذف شود؟")) {
        R.db.ref("anime/" + t.getAttribute("data-delanime")).remove(); R.closeMod("infoMod");
      }
    }
    else if (t.hasAttribute("data-delnews")) {
      if (R.isOwner() && window.confirm("حذف شود؟")) {
        R.db.ref("news/" + t.getAttribute("data-delnews")).remove(); R.closeMod("infoMod");
      }
    }
    else if (t.hasAttribute("data-gosearch")) R.closeMod("searchMod");
  });
};

/* ══════════ ۱۱. آماده‌سازی ══════════ */
R.bootExtra = function () {
  R.bindExtra();
  R.watchAnime(); R.watchNews(); R.watchEvents();
  R.hooks.anime = R.renderAnime;
  R.hooks.news = R.renderNews;
  R.hooks.events = R.renderEvents;
  R.hooks.rank = R.renderRank;
  R.hooks.discover = R.renderDiscover;
  R.hooks.profile = function () { R.renderProfile(R.ME || R.VIEW); };
  R.hooks.premium = R.paintPrem;
  if (R.ME) { R.watchNotifs(); R.paintPrem(); }
};

})();
