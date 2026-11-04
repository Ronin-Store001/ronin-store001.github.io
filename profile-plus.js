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
