/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — premium-plus.js v1 | ارتقای بخش پرمیوم
   ───────────────────────────────────────────────────────────────
   • پلن‌های زمان‌دار: ۱۵ / ۳۰ / ۶۰ / ۹۰ روز
   • نمایش مدت باقی‌مانده، تاریخ انقضا و نوار پیشرفت داخل خود سایت
   • انقضای خودکار پرمیوم + یادآوری ۳ روز آخر
   • برچسب (عنوان) مخصوص پرمیوم‌دارها کنار نامشان
   • دادن/تمدید/حذف پرمیوم با انتخاب مدت از پنل مالک
   فایل افزودنی است؛ به فایل‌های اصلی دست نمی‌زند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__premPlus) return;
  R.__premPlus = true;

  var DAY = 86400000;

  /* ── پلن‌ها و قیمت‌ها (تومان) ─────────────────────────────── */
  var PLANS = [
    { d: 15, price: 49000,  tag: "" },
    { d: 30, price: 89000,  tag: "محبوب" },
    { d: 60, price: 159000, tag: "بهترین ارزش" },
    { d: 90, price: 219000, tag: "حرفه‌ای" }
  ];

  /* ── برچسب‌های آماده ─────────────────────────────────────── */
  var BADGES = ["💎 الیت", "🔥 افسانه", "⚡ رونین", "👑 سلطان", "🌙 شب‌گرد", "🗡 شمشیرزن"];

  /* ── ابزارها ─────────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }
  function num(x) { return Number(x) || 0; }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function esc(s) {
    if (R.esc) return R.esc(s);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    var s = String(Math.round(num(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fa(s) + " تومان";
  }
  function fmtDate(ms) {
    try {
      return new Date(ms).toLocaleDateString("fa-IR",
        { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return fa(Math.round(ms / DAY)) + " روز"; }
  }

  /* ── مدل پرمیوم ──────────────────────────────────────────── */
  function planOf(d) {
    for (var i = 0; i < PLANS.length; i++) if (PLANS[i].d === num(d)) return PLANS[i];
    return null;
  }
  function userOf(uid) {
    if (uid && uid === R.ME && R.USER) return R.USER;
    return (R.USERS && R.USERS[uid]) || null;
  }
  function expOf(u) { return u ? num(u.premExp) : 0; }
  function premOn(u) { return !!(u && u.prem === true); }

  /* ۰ روز = دائمی (دست مالک) */
  function leftDays(u) {
    if (!premOn(u)) return 0;
    var e = expOf(u);
    if (!e) return 0;
    var ms = e - Date.now();
    return ms > 0 ? Math.ceil(ms / DAY) : 0;
  }
  function isActive(u) {
    if (!premOn(u)) return false;
    var e = expOf(u);
    return !e || e > Date.now();
  }
  function isPerm(u) { return premOn(u) && !expOf(u); }

  /* ══════════ استایل ══════════ */
  function injectCSS() {
    if (el("ppCSS")) return;
    var s = document.createElement("style");
    s.id = "ppCSS";
    s.textContent = [
      ".pp-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}",
      ".pp-plan{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;",
      "padding:15px 10px 12px;border-radius:16px;border:1px solid rgba(128,128,128,.32);",
      "background:rgba(128,128,128,.08);color:inherit;cursor:pointer;transition:.18s;font:inherit}",
      ".pp-plan:hover{border-color:rgba(255,203,82,.6);transform:translateY(-1px)}",
      ".pp-plan.on{border-color:rgba(255,203,82,.9);background:rgba(255,203,82,.15);",
      "box-shadow:0 0 0 1px rgba(255,203,82,.35) inset}",
      ".pp-d{font-size:23px;font-weight:900;color:var(--gold,#ffcb52);line-height:1.15}",
      ".pp-u{font-size:11px;opacity:.72}",
      ".pp-pr{font-size:11.5px;margin-top:6px;opacity:.9}",
      ".pp-tag{position:absolute;top:-8px;font-size:9.5px;padding:2px 8px;border-radius:20px;",
      "background:var(--gold,#ffcb52);color:#1b1405;font-weight:800;white-space:nowrap}",
      ".pp-hero{text-align:center;padding:18px 14px}",
      ".pp-big{font-size:40px;font-weight:900;color:var(--gold,#ffcb52);line-height:1}",
      ".pp-bar{height:9px;border-radius:20px;background:rgba(128,128,128,.24);overflow:hidden;margin:12px 0}",
      ".pp-bar>i{display:block;height:100%;border-radius:20px;",
      "background:linear-gradient(90deg,#ffcb52,#ff9d3d);transition:width .4s}",
      ".pp-perk{display:flex;gap:10px;align-items:center;padding:8px 0;",
      "border-bottom:1px dashed rgba(128,128,128,.22)}",
      ".pp-perk:last-child{border-bottom:0}",
      ".pp-ico{width:31px;height:31px;flex:0 0 auto;display:grid;place-items:center;",
      "border-radius:10px;background:rgba(255,203,82,.15);font-size:15px}",
      ".pp-badge{background:linear-gradient(135deg,rgba(255,203,82,.28),rgba(255,157,61,.18))}"
    ].join("");
    (document.head || document.documentElement).appendChild(s);
  }

  /* ══════════ رندر بخش پرمیوم ══════════ */
  var pick = 30;

  function chipText(u) {
    if (!R.ME) return "مهمان";
    if (isPerm(u)) return "💎 دائمی";
    if (isActive(u)) return "💎 " + fa(leftDays(u)) + " روز مانده";
    if (premOn(u)) return "⌛ منقضی شده";
    return "پایه";
  }

  function plansHTML() {
    var h = '<div class="pp-plans">';
    PLANS.forEach(function (p) {
      h += '<button type="button" class="pp-plan' + (pick === p.d ? " on" : "") +
        '" data-pp-plan="' + p.d + '">' +
        (p.tag ? '<span class="pp-tag">' + esc(p.tag) + "</span>" : "") +
        '<b class="pp-d">' + fa(p.d) + "</b><span class=\"pp-u\">روز</span>" +
        '<span class="pp-pr">' + money(p.price) + "</span></button>";
    });
    h += "</div>";
    return h;
  }

  function perksHTML() {
    var items = [
      ["🏷", "برچسب مخصوص", "یک عنوان ویژه کنار نامت در پروفایل و انجمن"],
      ["🎨", "رنگ کاراکتر", "رنگ‌های ویژه همراه راهنما"],
      ["🖼", "قاب پروفایل", "قاب‌های طلایی و آواتارهای ویژه"],
      ["⚡", "اولویت", "دسترسی زودتر به قابلیت‌های تازه"],
      ["🔔", "اعلان ویژه", "خبرهای مهم قبل از بقیه"],
      ["🌙", "پشتیبانی", "اولویت در پاسخ‌دهی مالک"]
    ];
    var h = '<div class="card mt"><div class="sm b mb">✨ چیزهایی که با پرمیوم می‌گیری</div>';
    items.forEach(function (it) {
      h += '<div class="pp-perk"><div class="pp-ico">' + it[0] + "</div><div>" +
        '<div class="sm b">' + it[1] + "</div>" +
        '<div class="xs mut">' + it[2] + "</div></div></div>";
    });
    return h + "</div>";
  }

  function badgeCard(u) {
    var cur = (u && u.premBadge) || "";
    var h = '<div class="card mt"><div class="between mb"><span class="sm b">🏷 برچسب مخصوص</span>' +
      '<span class="chip gd">پرمیوم</span></div>' +
      '<div class="xs mut mb">یک عنوان کوتاه (حداکثر ۱۴ حرف) که کنار نامت نمایش داده می‌شود.</div>' +
      '<div class="row w" style="gap:7px">' +
      '<input class="inp grow" id="ppBadgeIn" maxlength="14" placeholder="مثلاً: شمشیرزن شب" value="' +
      esc(cur) + '">' +
      '<button class="btn p mini" type="button" data-pp-badge="save">ذخیره</button></div>';
    h += '<div class="row w mt" style="gap:6px;flex-wrap:wrap">';
    BADGES.forEach(function (b) {
      h += '<button class="btn mini" type="button" data-pp-badge="pick" data-pp-badgeval="' +
        esc(b) + '">' + esc(b) + "</button>";
    });
    h += "</div>";
    if (cur) {
      h += '<div class="xs mut mt">پیش‌نمایش: <span class="chip gd pp-badge">🏷 ' +
        esc(cur) + "</span></div>";
    }
    return h + "</div>";
  }

  function activeCard(u) {
    var e = expOf(u), left = leftDays(u), perm = isPerm(u);
    var since = num(u.premSince) || 0;
    var pct = 100;
    if (e && since && e > since) {
      pct = Math.max(2, Math.min(100, Math.round((Date.now() - since) * 100 / (e - since))));
    } else if (e) {
      pct = 100;
    }
    var h = '<div class="card pp-hero mb">' +
      '<div class="xs mut">پرمیوم فعال است 💎</div>' +
      (perm
        ? '<div class="pp-big">∞</div><div class="sm mut mt">پرمیوم دائمی</div>'
        : '<div class="pp-big">' + fa(left) + '</div><div class="sm mut">روز باقی‌مانده</div>' +
          '<div class="pp-bar"><i style="width:' + pct + '%"></i></div>' +
          '<div class="xs mut">تا ' + esc(fmtDate(e)) + "</div>") +
      (u && u.premPlan ? '<div class="xs mut mt">پلن: ' + fa(u.premPlan) + " روزه</div>" : "") +
      "</div>";

    h += '<div class="card mb"><div class="sm b mb">🔄 تمدید</div>' +
      '<div class="xs mut mb">روزهای تمدید به انتهای مدت فعلی اضافه می‌شود.</div>' +
      plansHTML() + "</div>";
    return h;
  }

  function requestCard(u) {
    var p = planOf(pick) || PLANS[1];
    if (!R.ME) {
      return '<div class="card mt center"><div class="sm mut mb">برای خرید پرمیوم وارد حساب شو</div>' +
        '<button class="btn p" type="button" data-authopen="login">ورود / ثبت‌نام</button></div>';
    }
    if (premOn(u) && !isActive(u)) {
      return '<div class="card mt center"><div class="chip bad mb">⌛ پرمیوم قبلی منقضی شده</div>' +
        '<div class="sm mut mb">با تمدید، از همین حالا دوباره فعال می‌شود.</div>' +
        '<button class="btn gd" type="button" data-pp-req="' + p.d + '">درخواست ' +
        fa(p.d) + ' روزه 💎</button></div>';
    }
    return '<div class="card mt center">' +
      '<div class="sm b mb">پلن انتخابی: ' + fa(p.d) + " روزه — " + money(p.price) + "</div>" +
      '<div class="xs mut mb">پرداخت واقعی هنوز فعال نشده — درخواستت مستقیم به مالک می‌رسد و او فعال می‌کند.</div>' +
      '<button class="btn gd" type="button" data-pp-req="' + p.d + '">درخواست پرمیوم 💎</button></div>';
  }

  function render() {
    var sec = el("sec-premium");
    if (!sec) return;
    injectCSS();
    var u = R.ME ? (R.USER || {}) : null;
    var on = isActive(u);

    var h = '<div class="head"><h2 class="h2">💎 Ronin Elite</h2>' +
      '<span class="chip ' + (on ? "gd" : "") + '" data-premstate>' + esc(chipText(u)) + "</span></div>";
    h += '<div id="ppBody">';
    h += on ? activeCard(u) : '<div class="card mb"><div class="sm b mb">📅 مدت پرمیوم را انتخاب کن</div>' +
      plansHTML() + "</div>";
    if (!on) h += requestCard(u);
    if (on) h += badgeCard(u);
    h += perksHTML();
    h += "</div>";

    sec.innerHTML = h;
  }

  /* ══════════ درخواست خرید ══════════ */
  function request(d) {
    if (!R.ME) { if (R.needLogin) R.needLogin("پرمیوم"); return; }
    var p = planOf(d) || PLANS[1];
    if (isActive(R.USER)) return R.toast("پرمیومت فعال است — از دکمهٔ تمدید استفاده کن 💎", "ok");

    R.get("premreq").then(function (all) {
      var dup = false;
      Object.keys(all || {}).forEach(function (k) {
        var r = all[k];
        if (r && r.uid === R.ME && (r.st === "new" || r.st === "open")) dup = true;
      });
      if (dup) { R.toast("درخواستت ثبت شده و در انتظار بررسی است ⏳", "ok"); return; }
      return R.add("premreq", {
        uid: R.ME,
        name: (R.USER && R.USER.name) || "",
        st: "new",
        days: p.d,
        price: p.price,
        at: Date.now()
      }).then(function () {
        R.toast("درخواست پرمیوم " + fa(p.d) + " روزه ثبت شد 💎", "ok");
        if (R.OWNER_UID && R.notify) {
          R.notify(R.OWNER_UID,
            "💎 درخواست پرمیوم " + fa(p.d) + " روزه از " + ((R.USER && R.USER.name) || "کاربر"),
            "info", "owner", "premium");
        }
      });
    }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }

  /* ══════════ دادن / تمدید / حذف (مالک) ══════════ */
  function grant(uid, days) {
    if (!R.isOwner || !R.isOwner() || !uid) return;
    var u = userOf(uid) || {};
    var d = num(days);
    var base = Math.max(Date.now(), expOf(u));
    var exp = d ? base + d * DAY : 0;
    var since = num(u.premSince) || Date.now();
    var patch = { prem: true, premExp: exp, premSince: since, premBy: R.ME || "" };
    if (d) patch.premPlan = d;

    R.upd("users/" + uid, patch).catch(function (e) { R.toast("نشد: " + e.message, "err"); });

    if (R.USERS && R.USERS[uid]) {
      R.USERS[uid].prem = true;
      R.USERS[uid].premExp = exp;
      R.USERS[uid].premSince = since;
      if (d) R.USERS[uid].premPlan = d;
    }
    if (uid === R.ME && R.USER) {
      R.USER.prem = true; R.USER.premExp = exp; R.prem = true;
      if (d) R.USER.premPlan = d;
      if (R.paintUser) R.paintUser();
    }

    var msg = d ? "پرمیوم " + fa(d) + " روزه فعال شد" : "پرمیوم دائمی فعال شد";
    R.toast("💎 " + (uid === R.ME ? "" : (u.name ? u.name + ": " : "")) + msg, "ok");
    if (R.notify) {
      R.notify(uid, "💎 " + msg + (d ? " — تا " + fmtDate(exp) : ""), "info", "premium", "premium");
    }
    refreshOwner();
    render();
  }

  function revoke(uid) {
    if (!R.isOwner || !R.isOwner() || !uid) return;
    R.upd("users/" + uid, { prem: false, premExp: 0, premPlan: 0 })
      .catch(function (e) { R.toast("نشد: " + e.message, "err"); });
    if (R.USERS && R.USERS[uid]) { R.USERS[uid].prem = false; R.USERS[uid].premExp = 0; }
    if (uid === R.ME && R.USER) { R.USER.prem = false; R.USER.premExp = 0; R.prem = false; }
    R.toast("پرمیوم حذف شد", "ok");
    if (R.notify) R.notify(uid, "پرمیوم غیرفعال شد", "warn", "premium", "premium");
    refreshOwner();
    render();
  }

  function refreshOwner() {
    try {
      if (typeof R.paintOwner === "function") R.paintOwner();
      if (typeof R.renderOwner === "function") R.renderOwner();
    } catch (e) {}
  }

  function grantUI(uid) {
    if (!R.isOwner || !R.isOwner()) return;
    var u = userOf(uid) || {};
    var act = isActive(u), perm = isPerm(u);
    var h = '<div class="small mut mb" style="font-size:12.5px;opacity:.8">کاربر: <b>' +
      esc(u.name || uid) + "</b></div>";
    if (act) {
      h += '<div class="card mb"><div class="sm b">💎 پرمیوم فعال</div><div class="xs mut">' +
        (perm ? "دائمی" : fa(leftDays(u)) + " روز مانده — تا " + esc(fmtDate(expOf(u)))) +
        "</div></div>" +
        '<div class="xs mut mb">با انتخاب مدت، روزها به انتهای مدت فعلی اضافه می‌شود.</div>';
    } else {
      h += '<div class="xs mut mb">مدت پرمیوم را انتخاب کن:</div>';
    }
    h += '<div class="pp-plans">';
    PLANS.forEach(function (p) {
      h += '<button type="button" class="pp-plan" data-ppg="' + p.d + '" data-ppuid="' + esc(uid) + '">' +
        '<b class="pp-d">' + fa(p.d) + "</b><span class=\"pp-u\">روز</span>" +
        '<span class="pp-pr">' + money(p.price) + "</span></button>";
    });
    h += "</div>";
    h += '<div class="row w mt" style="gap:8px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-ppg="0" data-ppuid="' + esc(uid) + '">♾ دائمی</button>' +
      '<button class="btn mini d" type="button" data-ppg="off" data-ppuid="' + esc(uid) + '">حذف پرمیوم</button>' +
      "</div>";
    if (R.openInfo) R.openInfo("💎 پرمیوم — " + esc(u.name || "کاربر"), h);
  }

  /* ══════════ برچسب مخصوص ══════════ */
  function saveBadge(txt) {
    if (!R.ME) return;
    if (!isActive(R.USER)) return R.toast("برچسب مخصوص فقط برای پرمیوم است 💎", "err");
    var t = String(txt || "").replace(/\s+/g, " ").trim().slice(0, 14);
    R.upd("users/" + R.ME, { premBadge: t }).then(function () {
      if (R.USER) R.USER.premBadge = t;
      R.toast(t ? "برچسب ذخیره شد ✅" : "برچسب برداشته شد", "ok");
      render();
      decorateProfile(R.ME);
    }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }

  function badgeHTML(u) {
    if (!u || !u.premBadge || !isActive(u)) return "";
    return '<span class="chip gd pp-badge">🏷 ' + esc(u.premBadge) + "</span>";
  }

  /* ══════════ تزئین پروفایل ══════════ */
  function decorateProfile(uid) {
    if (!uid) return;
    var box = el("profBox");
    if (!box) return;
    var u = userOf(uid);
    var paint = function (obj) {
      var row = box.querySelector(".prof .pinfo .row.w");
      if (row && !row.querySelector(".pp-badge")) {
        var html = badgeHTML(obj);
        if (html) row.insertAdjacentHTML("beforeend", html);
      }
      if (uid === R.ME && isActive(obj) && !box.querySelector("#ppProfStrip")) {
        var strip = document.createElement("div");
        strip.id = "ppProfStrip";
        strip.className = "card mb";
        var left = leftDays(obj);
        strip.innerHTML = '<div class="between"><span class="sm b">💎 پرمیوم</span>' +
          '<span class="chip gd">' + (isPerm(obj) ? "دائمی" : fa(left) + " روز مانده") + "</span></div>" +
          '<div class="xs mut mt">' +
          (isPerm(obj) ? "پرمیوم دائمی داری." : "تا " + esc(fmtDate(expOf(obj))) + " فعال است.") +
          ' <a href="#" data-gosearch="premium" style="color:inherit;text-decoration:underline">مدیریت / تمدید</a></div>';
        var prof = box.querySelector(".prof");
        if (prof && prof.parentNode) prof.parentNode.insertBefore(strip, prof.nextSibling);
      }
    };
    if (u) paint(u);
    else if (R.get) {
      R.get("users/" + uid).then(function (o) { paint(o || {}); }).catch(function () {});
    }
  }

  /* ══════════ انقضا و یادآوری ══════════ */
  function expireCheck() {
    if (!R.ME || !R.USER) return;
    if (R.role === "owner") return;
    var u = R.USER;
    if (!premOn(u)) return;
    var e = expOf(u);
    if (!e || e > Date.now()) return;
    u.prem = false; u.premExp = 0; u.premPlan = 0;
    R.prem = false;
    R.upd("users/" + R.ME, { prem: false, premExp: 0, premPlan: 0 }).catch(function () {});
    if (R.paintUser) { try { R.paintUser(); } catch (e2) {} }
    R.toast("⌛ مدت پرمیومت تمام شد", "err");
    if (R.notify) {
      R.notify(R.ME, "⌛ مدت پرمیومت تمام شد — برای تمدید به بخش پرمیوم برو",
        "warn", "premium", "premium");
    }
    render();
  }

  function reminder() {
    if (!R.ME || !isActive(R.USER)) return;
    var u = R.USER;
    if (isPerm(u)) return;
    var d = leftDays(u);
    if (d > 3 || d < 1) return;
    var day = R.day ? R.day() : new Date().toISOString().slice(0, 10);
    var key = "pp-remind-" + R.ME + "-" + day;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch (e) {}
    R.toast("💎 فقط " + fa(d) + " روز از پرمیومت مانده", "err");
    if (R.notify) R.notify(R.ME, "💎 فقط " + fa(d) + " روز از پرمیومت مانده — تمدید کن",
      "warn", "premium", "premium");
  }

  /* ══════════ رویدادها ══════════ */
  function bind() {
    document.addEventListener("click", function (ev) {
      var t = ev.target && ev.target.closest ? ev.target : null;
      if (!t) return;

      /* انتخاب پلن در بخش پرمیوم */
      var pl = t.closest("[data-pp-plan]");
      if (pl) {
        ev.preventDefault();
        pick = num(pl.getAttribute("data-pp-plan")) || 30;
        render();
        return;
      }

      /* درخواست */
      var rq = t.closest("[data-pp-req]");
      if (rq) {
        ev.preventDefault();
        request(num(rq.getAttribute("data-pp-req")));
        return;
      }

      /* برچسب */
      var bd = t.closest("[data-pp-badge]");
      if (bd) {
        ev.preventDefault();
        var mode = bd.getAttribute("data-pp-badge");
        if (mode === "pick") saveBadge(bd.getAttribute("data-pp-badgeval"));
        else {
          var inp = el("ppBadgeIn");
          saveBadge(inp ? inp.value : "");
        }
        return;
      }

      /* انتخاب مدت توسط مالک (در مودال) */
      var g = t.closest("[data-ppg]");
      if (g) {
        ev.preventDefault();
        ev.stopPropagation();
        var v = g.getAttribute("data-ppg");
        var uid = g.getAttribute("data-ppuid");
        if (R.mod) R.mod("infoMod", false);
        if (v === "off") revoke(uid);
        else grant(uid, num(v));
        return;
      }

      /* دکمهٔ پرمیوم در پنل مالک */
      var pm = t.closest("[data-pm]");
      if (pm && R.isOwner && R.isOwner()) {
        ev.preventDefault();
        ev.stopPropagation();
        grantUI(pm.getAttribute("data-pm"));
      }
    }, true);
  }

  /* ══════════ راه‌اندازی ══════════ */
  function boot() {
    injectCSS();
    expireCheck();
    reminder();
    render();
    if (R.ME) decorateProfile(R.ME);
  }

  /* پرمیوم بخش‌ها */
  var paint0 = R.paintPrem;
  R.paintPrem = function () {
    try { if (paint0) paint0.apply(R, arguments); } catch (e) {}
    try { render(); } catch (e) {}
  };
  R.hooks = R.hooks || {};
  R.hooks.premium = function () { render(); };

  /* هدایت کلیک روی اعلان پرمیوم به بخش پرمیوم */
  var go0 = R.go;
  if (typeof go0 === "function") {
    R.go = function (name) {
      var out = go0.apply(R, arguments);
      try { if (String(name) === "premium") render(); } catch (e) {}
      return out;
    };
  }

  /* پروفایل: نشاندن برچسب و نوار وضعیت */
  var rp0 = R.renderProfile;
  if (typeof rp0 === "function") {
    R.renderProfile = function (uid) {
      var out = rp0.apply(R, arguments);
      var target = uid || R.ME || R.VIEW;
      var done = function () { try { decorateProfile(target); } catch (e) {} };
      try {
        if (out && typeof out.then === "function") out.then(done, done);
        else setTimeout(done, 350);
      } catch (e) {}
      setTimeout(done, 1200);
      return out;
    };
  }

  /* بعد از ورود */
  var login0 = R.onLogin;
  R.onLogin = function () {
    if (login0) { try { login0(); } catch (e) {} }
    setTimeout(boot, 700);
  };

  /* به‌روزرسانی دوره‌ای شمارش */
  setInterval(function () {
    try {
      expireCheck();
      var sec = el("sec-premium");
      if (sec && sec.offsetParent !== null && isActive(R.USER)) render();
    } catch (e) {}
  }, 60000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { bind(); boot(); });
  } else {
    bind();
    boot();
  }
  setTimeout(boot, 1500);
  setTimeout(boot, 4000);

  /* ── API برای تست و استفادهٔ بیرونی ─────────────────────── */
  R.premPlus = {
    plans: PLANS,
    badges: BADGES,
    leftDays: leftDays,
    isActive: isActive,
    isPerm: isPerm,
    expOf: expOf,
    userOf: userOf,
    grant: grant,
    revoke: revoke,
    request: request,
    saveBadge: saveBadge,
    render: render,
    expireCheck: expireCheck,
    reminder: reminder,
    pick: function (d) { pick = num(d) || 30; return pick; }
  };
})();
