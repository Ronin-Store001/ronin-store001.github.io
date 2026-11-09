/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — V19 «NEO RAIN CITY»                  js/3-feed.js
   انجمن: پست • لایک • کامنت • فالو • بوکمارک • نظرسنجی • گزارش
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {

R.POSTS = {};      /* پست‌ها */
R.VOTES = {};      /* رأی‌های نظرسنجی */
R.FOLLOW = {};     /* کسانی که دنبال می‌کنم */
R.BM = {};         /* ذخیره‌شده‌ها */
R.OPEN_CMT = {};   /* کامنت‌های باز */
R.feedMode = "foryou";

/* ── ۱. امتیاز ترند ───────────────────────────────────────── */
R.score = function (p) {
  var l = p.lk ? Object.keys(p.lk).length : 0;
  var c = p.cm ? Object.keys(p.cm).length : 0;
  var age = (Date.now() - (p.t || 0)) / 3600000;
  return l * 3 + c * 2 - age * 0.5;
};

/* ── ۲. خواندن داده‌ها ────────────────────────────────────── */
R.watchPosts = function () {
  if (!R.db) return;
  var q = R.db.ref("posts").orderByChild("t").limitToLast(80);
  q.on("value", function (s) { R.POSTS = s.val() || {}; R.renderFeed(); },
    function (e) { console.warn("[Ronin] posts:", e.message); });
};
R.watchVotes = function () {
  if (!R.db) return;
  R.db.ref("votes").on("value", function (s) { R.VOTES = s.val() || {}; R.renderFeed(); });
};
R.watchMe = function () {
  if (!R.db || !R.ME) return;
  R.db.ref("follows/" + R.ME).on("value", function (s) { R.FOLLOW = s.val() || {}; R.renderFeed(); });
  R.db.ref("bm/" + R.ME).on("value", function (s) { R.BM = s.val() || {}; R.renderFeed(); });
};

/* ── ۳. فهرست پست‌ها بر اساس تب ──────────────────────────── */
R.feedList = function () {
  var arr = Object.keys(R.POSTS).map(function (k) {
    var p = R.POSTS[k]; p.id = k; return p;
  }).filter(function (p) { return p.status !== "pending"; });
  var m = R.feedMode;
  if (m === "following") arr = arr.filter(function (p) { return R.FOLLOW[p.uid]; });
  if (m === "mine") arr = arr.filter(function (p) { return p.uid === R.ME; });
  if (m === "trending") arr.sort(function (a, b) { return R.score(b) - R.score(a); });
  else arr.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  return arr;
};

/* ── ۴. نظرسنجی ───────────────────────────────────────────── */
R.pollHTML = function (p) {
  if (!p.poll || !p.poll.a || !p.poll.a.length) return "";
  var votes = R.VOTES[p.id] || {};
  var counts = {}, total = 0;
  Object.keys(votes).forEach(function (u) {
    counts[votes[u]] = (counts[votes[u]] || 0) + 1; total++;
  });
  var mine = R.ME ? votes[R.ME] : null;
  var h = '<div class="poll"><div class="sm b">' + R.esc(p.poll.q || "نظرسنجی") + "</div>";
  p.poll.a.forEach(function (o, i) {
    var n = counts[i] || 0;
    var pc = total ? Math.round(n * 100 / total) : 0;
    h += '<div class="pollopt" data-vote="' + p.id + '" data-opt="' + i + '">' +
      '<span style="width:' + pc + '%"></span>' +
      '<div class="row between" style="position:relative">' +
      "<span>" + R.esc(o) + "</span><b>" + R.fa(pc) + "٪</b></div></div>";
  });
  h += '<div class="xs mut">' + R.fa(total) + " رأی" +
    (mine == null ? " • برای رأی‌دادن بزن" : " • رأی تو ثبت شد ✅") + "</div></div>";
  return h;
};

/* ── ۵. کامنت‌ها ──────────────────────────────────────────── */
R.cmtsHTML = function (p) {
  if (!R.OPEN_CMT[p.id]) return "";
  var list = p.cm || {};
  var keys = Object.keys(list).sort(function (a, b) { return (list[a].t || 0) - (list[b].t || 0); });
  var h = '<div class="cmts">';
  if (!keys.length) h += '<div class="xs mut">هنوز کامنتی نیست — اولی باش 💬</div>';
  keys.forEach(function (k) {
    var c = list[k];
    var can = c.uid === R.ME || R.isOwner() || R.can("mod");
    h += '<div class="cmt">' + R.avHTML({ name: c.n, av: c.av }, "sm") +
      '<div class="grow" style="min-width:0"><div class="row" style="gap:6px">' +
      '<b class="xs">' + R.esc(c.n || "کاربر") + '</b>' +
      '<span class="xs mut">' + R.time(c.t) + "</span></div>" +
      '<div class="sm" style="line-height:1.7;word-break:break-word">' + R.esc(c.text) + "</div></div>" +
      (can ? '<button class="icobtn" style="width:28px;height:28px;font-size:12px" data-delc="' +
        p.id + "/" + k + '">✕</button>' : "") + "</div>";
  });
  if (R.ME) {
    h += '<div class="row"><input class="inp" maxlength="300" placeholder="کامنت بنویس…" id="ci-' +
      p.id + '"><button class="btn p mini" data-sendc="' + p.id + '">ارسال</button></div>';
  } else {
    h += '<button class="btn mini" data-authopen="login">برای کامنت وارد شو</button>';
  }
  return h + "</div>";
};

/* ── ۶. ساخت کارت پست ─────────────────────────────────────── */
R.postCard = function (p) {
  var liked = !!(p.lk && R.ME && p.lk[R.ME]);
  var lc = p.lk ? Object.keys(p.lk).length : 0;
  var cc = p.cm ? Object.keys(p.cm).length : 0;
  var saved = !!R.BM[p.id];
  var mine = p.uid === R.ME;
  var canMod = R.isOwner() || R.can("mod");
  var staff = p.urole && p.urole !== "user";

  var h = '<div class="post"><div class="row">' +
    R.avHTML({ name: p.n, av: p.av }, "sm") +
    '<div class="grow" style="min-width:0"><div class="row" style="gap:6px">' +
    '<b class="sm ellip">' + R.esc(p.n || "کاربر") + "</b>" +
    (staff ? '<span class="chip" style="padding:1px 7px;font-size:9.5px">' + R.roleFa(p.urole) + "</span>"
           : "") + "</div>" +
    '<div class="xs mut">' + R.time(p.t) + "</div></div>" +
    (mine || canMod ? '<button class="icobtn" title="حذف" data-del="' + p.id + '">🗑</button>' : "") +
    '<button class="icobtn" title="گزارش" data-rp="' + p.id + '">🚩</button></div>';

  if (p.text) h += '<div class="pbody">' + R.esc(p.text).replace(/\n/g, "<br>") + "</div>";
  if (p.img) h += '<div class="pimg"><img src="' + R.esc(p.img) + '" loading="lazy" alt=""></div>';
  h += R.pollHTML(p);

  h += '<div class="pfoot">' +
    '<button class="act' + (liked ? " on" : "") + '" data-lk="' + p.id + '">' +
      (liked ? "❤️" : "🤍") + " " + R.fa(R.num(lc)) + "</button>" +
    '<button class="act" data-cm="' + p.id + '">💬 ' + R.fa(R.num(cc)) + "</button>" +
    '<button class="act' + (saved ? " on" : "") + '" data-bm="' + p.id + '">' +
      (saved ? "🔖" : "📑") + "</button></div>";

  h += R.cmtsHTML(p);
  return R.el("div", "", h).firstChild;
};

/* ── ۷. رسم فید ───────────────────────────────────────────── */
R.renderFeed = function () {
  var box = R.$("feedBox");
  if (!box) return;
  var arr = R.feedList();
  box.innerHTML = "";
  if (!arr.length) {
    box.innerHTML = '<div class="empty">هنوز پستی اینجا نیست ✨<br>' +
      (R.feedMode === "following" ? "چند نفر را دنبال کن تا پست‌هاشون بیاد" : "اولین نفر باش!") + "</div>";
    return;
  }
  arr.forEach(function (p) { box.appendChild(R.postCard(p)); });
};

/* ── ۸. پست گذاشتن ────────────────────────────────────────── */
R.pollToggle = function () {
  var on = R.$("pPollOn") && R.$("pPollOn").checked;
  var w = R.$("pPollWrap"); if (w) w.style.display = on ? "" : "none";
};
R.createPost = function () {
  if (!R.ME) return R.needLogin("پست گذاشتن");
  var ta = R.$("pText");
  var txt = R.clean(ta ? ta.value : "", 1200);
  if (txt.length < 2) return R.toast("متن پست خیلی کوتاهه", "err");

  var poll = null;
  if (R.$("pPollOn") && R.$("pPollOn").checked) {
    var opts = [];
    ["pOpt1", "pOpt2", "pOpt3"].forEach(function (id) {
      var v = R.clean(R.$(id) ? R.$(id).value : "", 60);
      if (v) opts.push(v);
    });
    if (opts.length < 2) return R.toast("نظرسنجی حداقل ۲ گزینه می‌خواد", "err");
    poll = { q: txt.slice(0, 90), a: opts };
  }

  var staffPending = R.isStaff() && !R.isOwner();
  var p = {
    uid: R.ME, n: (R.USER && R.USER.name) || "کاربر", av: (R.USER && R.USER.av) || "",
    urole: R.role, text: txt, t: Date.now(), lk: {}, cm: {},
    status: staffPending ? "pending" : "published"
  };
  if (poll) p.poll = poll;

  R.add(staffPending ? "pending" : "posts", p).then(function () {
    if (ta) ta.value = "";
    ["pOpt1", "pOpt2", "pOpt3"].forEach(function (id) {
      var e = R.$(id); if (e) e.value = "";
    });
    if (R.$("pPollOn")) { R.$("pPollOn").checked = false; R.pollToggle(); }
    if (staffPending) {
      R.toast("⏳ پستت در انتظار تایید مالک است", "ok");
      R.notify(R.OWNER_UID, "📝 پست در انتظار تایید", "mod", "owner");
    } else { R.toast("پست منتشر شد ✅", "ok"); R.xp(10); }
  }).catch(function (e) { R.toast("خطا: " + e.message, "err"); });
};

/* ── ۹. کنش‌ها ────────────────────────────────────────────── */
R.like = function (pid) {
  if (!R.ME) return R.needLogin("لایک کردن");
  var p = R.POSTS[pid]; if (!p) return;
  var has = p.lk && p.lk[R.ME];
  p.lk = p.lk || {};
  if (has) { delete p.lk[R.ME]; R.db.ref("posts/" + pid + "/lk/" + R.ME).remove(); }
  else {
    p.lk[R.ME] = 1;
    R.db.ref("posts/" + pid + "/lk/" + R.ME).set(1).catch(function () {});
    R.notify(p.uid, "❤️ " + ((R.USER && R.USER.name) || "کسی") + " پستت را لایک کرد");
    if (p.uid !== R.ME) R.xp(2);
  }
  R.renderFeed();
};
R.bookmark = function (pid) {
  if (!R.ME) return R.needLogin("ذخیره کردن");
  var on = R.BM[pid];
  R.BM[pid] = on ? undefined : 1;
  if (on) { delete R.BM[pid]; R.db.ref("bm/" + R.ME + "/" + pid).remove(); R.toast("از ذخیره‌شده‌ها حذف شد"); }
  else { R.db.ref("bm/" + R.ME + "/" + pid).set(1); R.toast("ذخیره شد 🔖", "ok"); }
  R.renderFeed();
};
R.follow = function (uid) {
  if (!R.ME) return R.needLogin("دنبال کردن");
  if (uid === R.ME) return R.toast("خودت را نمی‌توانی دنبال کنی 😅", "err");
  var on = !!R.FOLLOW[uid];
  R.db.ref("follows/" + R.ME + "/" + uid).set(on ? null : true);
  R.db.ref("followers/" + uid + "/" + R.ME).set(on ? null : true);
  if (on) { delete R.FOLLOW[uid]; R.toast("لغو شد"); }
  else {
    R.FOLLOW[uid] = true;
    R.notify(uid, "👤 " + ((R.USER && R.USER.name) || "کسی") + " تو را دنبال کرد");
    R.xp(3);
    R.toast("دنبال شد ✅", "ok");
  }
  R.renderFeed();
  if (R.renderProfile) R.renderProfile();
};
R.vote = function (pid, idx) {
  if (!R.ME) return R.needLogin("رأی‌دادن");
  R.set("votes/" + pid + "/" + R.ME, idx).then(function () { R.toast("رأیت ثبت شد ✅", "ok"); })
    .catch(function () { R.toast("رأی ثبت نشد", "err"); });
};
R.report = function (pid) {
  if (!R.ME) return R.needLogin("گزارش کردن");
  var why = window.prompt("دلیل گزارش را کوتاه بنویس:");
  if (why == null) return;
  R.add("reports", {
    uid: R.ME, by: (R.USER && R.USER.name) || "کاربر",
    type: "post", target: pid, text: R.clean(why, 140) || "—", st: "new"
  }).then(function () {
    R.toast("گزارش ثبت شد — ممنون 🙏", "ok");
    R.notify(R.OWNER_UID, "🚩 گزارش جدید", "mod", "owner");
  }).catch(function (e) { R.toast("خطا: " + e.message, "err"); });
};
R.delPost = function (pid) {
  var p = R.POSTS[pid]; if (!p) return;
  if (!(p.uid === R.ME || R.isOwner() || R.can("mod"))) return R.toast("اجازه نداری", "err");
  if (!window.confirm("این پست حذف شود؟")) return;
  R.db.ref("posts/" + pid).remove();
  R.toast("حذف شد", "ok");
};
R.addCmt = function (pid) {
  if (!R.ME) return R.needLogin("کامنت");
  var inp = R.$("ci-" + pid); if (!inp) return;
  var txt = R.clean(inp.value, 300);
  if (!txt) return;
  inp.value = "";
  var p = R.POSTS[pid];
  R.db.ref("posts/" + pid + "/cm").push({
    uid: R.ME, n: (R.USER && R.USER.name) || "کاربر",
    av: (R.USER && R.USER.av) || "", text: txt, t: Date.now()
  }).catch(function (e) { R.toast("کامنت ثبت نشد: " + e.message, "err"); });
  if (p) R.notify(p.uid, "💬 " + ((R.USER && R.USER.name) || "کسی") + " کامنت گذاشت");
  R.xp(5);
};
R.delCmt = function (pid, cid) { R.db.ref("posts/" + pid + "/cm/" + cid).remove(); };

/* ── ۱۰. اتصال رویدادها ───────────────────────────────────── */
R.bindFeed = function () {
  var box = R.$("feedBox");
  if (box) box.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(
      "[data-lk],[data-cm],[data-bm],[data-rp],[data-del],[data-vote],[data-sendc],[data-delc]") : null;
    if (!t) return;
    if (t.hasAttribute("data-lk")) R.like(t.getAttribute("data-lk"));
    else if (t.hasAttribute("data-cm")) {
      var a = t.getAttribute("data-cm"); R.OPEN_CMT[a] = !R.OPEN_CMT[a]; R.renderFeed();
    }
    else if (t.hasAttribute("data-bm")) R.bookmark(t.getAttribute("data-bm"));
    else if (t.hasAttribute("data-rp")) R.report(t.getAttribute("data-rp"));
    else if (t.hasAttribute("data-del")) R.delPost(t.getAttribute("data-del"));
    else if (t.hasAttribute("data-vote"))
      R.vote(t.getAttribute("data-vote"), Number(t.getAttribute("data-opt")));
    else if (t.hasAttribute("data-sendc")) R.addCmt(t.getAttribute("data-sendc"));
    else if (t.hasAttribute("data-delc")) {
      var pr = t.getAttribute("data-delc").split("/");
      R.delCmt(pr[0], pr[1]);
    }
  });
  if (R.$("pBtn")) R.$("pBtn").addEventListener("click", R.createPost);
  if (R.$("pPollOn")) R.$("pPollOn").addEventListener("change", R.pollToggle);
  R.qa("[data-feed]").forEach(function (b) {
    b.addEventListener("click", function () {
      R.feedMode = b.getAttribute("data-feed");
      R.qa("[data-feed]").forEach(function (x) { x.classList.toggle("on", x === b); });
      R.renderFeed();
    });
  });
};

/* ── ۱۱. آماده‌سازی ───────────────────────────────────────── */
R.bootFeed = function () {
  R.bindFeed();
  R.watchPosts();
  R.watchVotes();
  if (R.ME) R.watchMe();
};

R.onLogout = function () {
  R.FOLLOW = {}; R.BM = {}; R.OPEN_CMT = {};
  R.renderFeed();
};

})();
