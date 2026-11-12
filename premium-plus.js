/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — premium-plus.js v2 | ارتقای بخش پرمیوم + پرداخت تلگرام
   ───────────────────────────────────────────────────────────────
   • پلن‌های زمان‌دار: ۱۵ / ۳۰ / ۶۰ / ۹۰ روز
   • نمایش مدت باقی‌مانده، تاریخ انقضا و نوار پیشرفت داخل خود سایت
   • انقضای خودکار پرمیوم + یادآوری ۳ روز آخر
   • برچسب (عنوان) مخصوص پرمیوم‌دارها کنار نامشان
   • دادن/تمدید/حذف پرمیوم با انتخاب مدت از پنل مالک
   • خرید با لینک تلگرام، کد سفارش و کیف پول مجازی مالک
   • تایمر معکوس دقیق برای مدت باقی‌مانده
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

  /* ── تنظیمات تلگرام و کیف پول مالک ─────────────────────── */
  var OW = { loaded: false, loading: false, tgLoaded: false, busy: {}, reqs: {}, tg: null };
  var TG_MODE = { bot: "ربات", user: "آیدی شخصی" };

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

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function when(t) {
    if (R.time) return R.time(t);
    try { return new Date(t).toLocaleString("fa-IR"); } catch (e) { return ""; }
  }
  function safeTgLink(v) {
    var x = R.clean(v, 300);
    if (!x) return "";
    if (!/^https:\/\/(t|telegram)\.me\//i.test(x)) return "";
    return x.replace(/\/+$/, "");
  }
  function tgURL(code) {
    var base = (OW.tg && OW.tg.link) || "";
    if (!base) return "";
    if (OW.tg && OW.tg.mode === "bot") {
      return base + (base.indexOf("?") >= 0 ? "&" : "?") + "start=" + encodeURIComponent(code || "");
    }
    return base;
  }
  function orderCode() {
    return "RN" + Date.now().toString(36).slice(-5).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function reqArray() {
    return Object.keys(OW.reqs || {}).map(function (k) {
      var r = OW.reqs[k] || {}; r.id = k; return r;
    }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }
  function approvedTotal() {
    return reqArray().reduce(function (n, r) {
      return n + (r.st === "approved" ? num(r.price) : 0);
    }, 0);
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
      ".pp-badge{background:linear-gradient(135deg,rgba(255,203,82,.28),rgba(255,157,61,.18))}",
      ".pp-timer{font-variant-numeric:tabular-nums;font-size:18px;font-weight:900;letter-spacing:.4px;",
      "color:var(--gold,#ffcb52);margin-top:10px;direction:ltr}",
      ".pp-timer-sm{font-size:13px;margin-top:4px}",
      ".pp-paybox{border:1px solid rgba(255,203,82,.35);border-radius:16px;padding:14px;",
      "background:rgba(255,203,82,.07)}",
      ".pp-code{font:900 20px/1.4 monospace;letter-spacing:2px;direction:ltr;text-align:center;",
      "padding:10px;margin:8px 0;border-radius:12px;background:rgba(0,0,0,.18);color:var(--gold,#ffcb52)}",
      ".pp-wallet{background:linear-gradient(135deg,rgba(255,203,82,.18),rgba(255,157,61,.07));",
      "border:1px solid rgba(255,203,82,.35)}",
      ".pp-walletbar{font-size:26px;font-weight:900;color:var(--gold,#ffcb52);direction:rtl;text-align:right}",
      ".pp-req{padding:10px 0;border-bottom:1px dashed rgba(128,128,128,.22)}",
      ".pp-req:last-child{border-bottom:0}",
      ".pp-tgrow{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}",
      ".pp-tgrow .inp{flex:1 1 190px}"
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
          '<div class="pp-bar"><i id="ppBar" style="width:' + pct + '%"></i></div>' +
          '<div class="pp-timer" id="ppTimer" data-exp="' + e + '" data-since="' + since + '">' +
          timerText(e) + "</div>" +
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
    var expired = premOn(u) && !isActive(u);
    var ready = !!(OW.tg && OW.tg.link);
    var tgVal = (u && u.tg) || "";
    return '<div class="card mt">' +
      (expired ? '<div class="chip bad mb">⌛ پرمیوم قبلی منقضی شده</div>' : "") +
      '<div class="sm b mb">⚡ خرید پرمیوم با تلگرام</div>' +
      '<div class="xs mut mb">پلن انتخابی: <b>' + fa(p.d) + " روزه — " + money(p.price) + "</b></div>" +
      '<div class="xs mut mb">بعد از پرداخت، کد سفارش را برای مالک بفرست تا پرمیوم و مبلغ در کیف پول ثبت شود.</div>' +
      '<label class="xs mut" for="ppTgUser">آیدی تلگرامت (برای هماهنگی)</label>' +
      '<input class="inp mt" id="ppTgUser" maxlength="60" placeholder="@username" value="' + esc(tgVal) + '">' +
      '<button class="btn gd w mt" type="button" data-pp-pay="' + p.d + '">✈️ پرداخت ' +
      money(p.price) + " با تلگرام</button>" +
      (ready ? "" : '<div class="xs bad mt">مالک هنوز لینک تلگرام را در پنل تنظیم نکرده — می‌توانی درخواست بدون پرداخت بفرستی.</div>') +
      '<div class="row w mt" style="gap:7px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-pp-req="' + p.d + '">فقط ثبت درخواست</button>' +
      '<span class="xs mut">پرداخت واقعی فقط بعد از تأیید مالک فعال می‌شود.</span></div>' +
      "</div>";
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
    if (R.isOwner && R.isOwner()) h += ownerCardHTML();
    h += perksHTML();
    h += "</div>";

    sec.innerHTML = h;
  }

  /* ══════════ درخواست خرید و پرداخت تلگرام ══════════ */
  function timerText(e) {
    e = num(e);
    if (!e) return "∞";
    var ms = e - Date.now();
    if (ms <= 0) return "⌛ " + fa("00:00:00");
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var hh = Math.floor(s / 3600); s -= hh * 3600;
    var mm = Math.floor(s / 60); s -= mm * 60;
    return (d ? fa(d) + " روز " : "") + fa(pad2(hh) + ":" + pad2(mm) + ":" + pad2(ss0(s)));
  }
  function ss0(n) { return n < 10 ? "0" + n : String(n); }
  function tick() {
    var t = el("ppTimer");
    if (t) {
      var e = num(t.getAttribute("data-exp"));
      if (e) {
        t.textContent = timerText(e);
        var since = num(t.getAttribute("data-since"));
        var bar = el("ppBar");
        if (bar && since && e > since) {
          bar.style.width = Math.max(0, Math.min(100,
            Math.round((Date.now() - since) * 100 / (e - since)))) + "%";
        }
        if (e <= Date.now() && R.USER && premOn(R.USER) && expOf(R.USER) === e) expireCheck();
      }
    }
    var chip = document.querySelector("[data-premstate]");
    if (chip && R.ME) chip.textContent = chipText(R.USER);
    var mini = el("ppProfTimer");
    if (mini) {
      var me = num(mini.getAttribute("data-exp"));
      if (me) mini.textContent = timerText(me);
    }
  }

  function request(d) {
    if (!R.ME) { if (R.needLogin) R.needLogin("پرمیوم"); return; }
    var p = planOf(d) || PLANS[1];
    if (isActive(R.USER)) return R.toast("پرمیومت فعال است — از دکمهٔ تمدید استفاده کن 💎", "ok");

    R.get("premreq").then(function (all) {
      var dup = null, dupId = null;
      Object.keys(all || {}).forEach(function (k) {
        var r = all[k];
        if (r && r.uid === R.ME && (r.st === "new" || r.st === "open" || r.st === "pending")) {
          dup = r; dupId = k;
        }
      });
      if (dup) {
        if (dup.code) showPayModal(p, dup.code, dupId, dup);
        else R.toast("درخواستت ثبت شده و در انتظار بررسی است ⏳", "ok");
        return;
      }
      return R.add("premreq", {
        uid: R.ME,
        name: (R.USER && R.USER.name) || "",
        st: "new",
        method: "manual",
        days: p.d,
        price: p.price,
        code: orderCode(),
        at: Date.now()
      }).then(function (ref) {
        R.toast("درخواست پرمیوم " + fa(p.d) + " روزه ثبت شد 💎", "ok");
        if (R.OWNER_UID && R.notify) {
          R.notify(R.OWNER_UID,
            "💎 درخواست پرمیوم " + fa(p.d) + " روزه از " + ((R.USER && R.USER.name) || "کاربر"),
            "info", "owner", "premium");
        }
      });
    }).catch(function (e) { R.toast("نشد: " + e.message, "err"); });
  }

  function payTelegram(d) {
    if (!R.ME) { if (R.needLogin) R.needLogin("پرمیوم"); return; }
    var p = planOf(d) || PLANS[1];
    if (isActive(R.USER)) return R.toast("پرمیومت فعال است — از دکمهٔ تمدید استفاده کن 💎", "ok");
    var tg = R.clean((el("ppTgUser") || {}).value, 60);
    if (!tg) return R.toast("آیدی تلگرامت را بنویس تا مالک بتواند پرداخت را تأیید کند", "err");
    if (!OW.tg || !OW.tg.link) return R.toast("مالک هنوز لینک تلگرام را تنظیم نکرده ✈️", "err");

    R.get("premreq").then(function (all) {
      var dup = null, dupId = null;
      Object.keys(all || {}).forEach(function (k) {
        var r = all[k];
        if (r && r.uid === R.ME && (r.st === "new" || r.st === "open" || r.st === "pending")) {
          dup = r; dupId = k;
        }
      });
      if (dup) {
        showPayModal(p, dup.code || "", dupId, dup);
        return;
      }
      var code = orderCode();
      return R.add("premreq", {
        uid: R.ME,
        name: (R.USER && R.USER.name) || "",
        st: "new",
        method: "telegram",
        days: p.d,
        price: p.price,
        tg: tg,
        code: code,
        at: Date.now()
      }).then(function (ref) {
        R.upd("users/" + R.ME, { tg: tg }).catch(function () {});
        if (R.OWNER_UID && R.notify) {
          R.notify(R.OWNER_UID,
            "✈️ سفارش تلگرام " + code + " از " + ((R.USER && R.USER.name) || "کاربر") +
            " — " + money(p.price), "info", "owner", "premium");
        }
        showPayModal(p, code, ref.key, { code: code, days: p.d, price: p.price, tg: tg });
      });
    }).catch(function (e) { R.toast("ثبت سفارش نشد: " + ((e && e.message) || ""), "err"); });
  }

  function showPayModal(p, code, id, req) {
    if (req && num(req.days)) p = planOf(req.days) || p;
    var url = tgURL(code);
    var h = '<div class="pp-paybox">' +
      '<div class="sm b">پلن ' + fa(p.d) + " روزه — " + money(p.price) + "</div>" +
      '<div class="xs mut mt">کد سفارش را کپی کن و بعد از پرداخت برای مالک بفرست.</div>' +
      '<div class="pp-code">' + esc(code || "—") + "</div>" +
      '<div class="row w" style="gap:8px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-pp-copy="' + esc(code || "") + '">📋 کپی کد</button>' +
      (url ? '<a class="btn gd mini" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">✈️ باز کردن تلگرام</a>' : "") +
      "</div>" +
      '<div class="xs mut mt">بعد از تأیید مالک، پرمیوم فعال و مبلغ به کیف پول اضافه می‌شود.</div>' +
      (id ? '<div class="xs mut mt">شناسهٔ سفارش: <span dir="ltr">' + esc(id) + "</span></div>" : "") +
      "</div>";
    if (R.openInfo) R.openInfo("⚡ پرداخت پرمیوم با تلگرام", h);
    else R.toast("کد سفارش: " + (code || ""), "ok");
  }

  function copyText(txt) {
    txt = String(txt || "");
    if (!txt) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { R.toast("کد کپی شد 📋", "ok"); })
        .catch(function () { R.toast("کپی نشد — دستی انتخاب کن", "err"); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); R.toast("کد کپی شد 📋", "ok"); }
    catch (e) { R.toast("کپی نشد — دستی انتخاب کن", "err"); }
    ta.remove();
  }

  /* ══════════ کیف پول مالک و مدیریت سفارش‌ها ══════════ */
  function loadTelegram() {
    if (!R.db || OW.tgLoaded) return;
    R.get("settings/telegram").then(function (t) {
      OW.tg = t || null;
      OW.tgLoaded = true;
      render();
    }).catch(function () {
      OW.tgLoaded = true;
    });
  }

  function loadOwner() {
    if (!R.isOwner || !R.isOwner() || !R.db) return;
    if (OW.loading) return;
    OW.loading = true;
    Promise.all([R.get("premreq"), R.get("settings/telegram")]).then(function (a) {
      OW.reqs = a[0] || {};
      OW.tg = a[1] || null;
      OW.tgLoaded = true;
      OW.loaded = true;
      OW.loading = false;
      render();
    }).catch(function () {
      OW.loaded = true; OW.loading = false; render();
    });
  }

  function saveTelegram() {
    if (!R.isOwner || !R.isOwner()) return;
    var raw = R.clean((el("ppTgLink") || {}).value, 300);
    var link = safeTgLink(raw);
    var mode = (el("ppTgMode") || {}).value === "user" ? "user" : "bot";
    if (raw && !link) return R.toast("لینک باید با https://t.me/ شروع شود", "err");
    R.set("settings/telegram", { link: link, mode: mode, at: Date.now(), by: R.ME || "" })
      .then(function () {
        OW.tg = { link: link, mode: mode };
        R.toast("تنظیمات تلگرام ذخیره شد ✅", "ok");
        loadOwner();
      }).catch(function (e) { R.toast("ذخیره نشد: " + ((e && e.message) || ""), "err"); });
  }

  function approveReq(id) {
    if (!R.isOwner || !R.isOwner()) return;
    var r = (OW.reqs || {})[id];
    if (!r) return;
    if (r.st === "approved") return R.toast("این سفارش قبلاً تأیید شده ✅", "ok");
    if (!num(r.days)) return R.toast("این درخواست پلن مشخصی ندارد — نمی‌توان خودکار تأیید کرد", "err");
    var who = r.name || r.uid || "کاربر";
    if (OW.busy[id]) return;
    if (!window.confirm("پرداخت " + who + " تأیید شود؟\n" + money(r.price) + " به کیف پول اضافه می‌شود.")) return;
    OW.busy[id] = true;

    grant(r.uid, num(r.days)).then(function (ok) {
      if (!ok) { OW.busy[id] = false; return; }
      return R.upd("premreq/" + id, {
        st: "approved",
        approvedAt: Date.now(),
        approvedBy: R.ME || "",
        walletAt: Date.now()
      }).then(function () {
        R.toast("✅ تأیید شد — مبلغ به کیف پول اضافه شد", "ok");
        if (r.uid && R.notify) {
          R.notify(r.uid, "💎 پرمیوم " + fa(num(r.days)) + " روزه‌ات فعال شد — ممنون از خرید!",
            "info", "premium", "premium");
        }
        OW.reqs[id].st = "approved";
        OW.reqs[id].approvedAt = Date.now();
        OW.busy[id] = false;
        loadOwner();
      });
    }).catch(function (e) {
      OW.busy[id] = false;
      R.toast("تأیید نشد: " + ((e && e.message) || ""), "err");
    });
  }

  function rejectReq(id) {
    if (!R.isOwner || !R.isOwner()) return;
    var r = (OW.reqs || {})[id];
    if (!r) return;
    if (!window.confirm("سفارش " + (r.name || r.uid || "کاربر") + " رد شود؟")) return;
    R.upd("premreq/" + id, { st: "rejected", rejectedAt: Date.now(), rejectedBy: R.ME || "" })
      .then(function () {
        R.toast("سفارش رد شد", "ok");
        if (r.uid && R.notify) R.notify(r.uid, "❌ سفارش پرمیوم رد شد", "warn", "premium", "premium");
        if (OW.reqs[id]) OW.reqs[id].st = "rejected";
        loadOwner();
      }).catch(function (e) { R.toast("رد نشد: " + ((e && e.message) || ""), "err"); });
  }

  function ownerCardHTML() {
    if (!R.isOwner || !R.isOwner()) return "";
    var arr = reqArray();
    var pending = arr.filter(function (r) {
      return r.st === "new" || r.st === "open" || r.st === "pending";
    });
    var approved = arr.filter(function (r) { return r.st === "approved"; });
    var total = approvedTotal();
    var h = '<div class="card mt pp-wallet">' +
      '<div class="between"><div><div class="sm b">👛 کیف پول مجازی مالک</div>' +
      '<div class="xs mut">فقط پرداخت‌های تأییدشدهٔ پرمیوم</div></div>' +
      '<span class="chip gd">' + fa(approved.length) + " تراکنش</span></div>" +
      '<div class="pp-walletbar">' + money(total) + "</div>" +
      '<div class="xs mut">موجودی قابل برداشت / درآمد ثبت‌شده</div>' +
      '<div class="row w mt" style="gap:7px;flex-wrap:wrap">' +
      '<span class="chip">⏳ ' + fa(pending.length) + " در انتظار</span>" +
      '<span class="chip">✅ ' + fa(approved.length) + " تأییدشده</span></div></div>";

    h += '<div class="card mt"><div class="sm b mb">✈️ تنظیمات پرداخت تلگرام</div>' +
      '<div class="xs mut mb">لینک ربات یا آیدی شخصی. توکن ربات را هرگز اینجا نگذار.</div>' +
      '<input class="inp" id="ppTgLink" maxlength="300" placeholder="https://t.me/YourBot" value="' +
      esc((OW.tg && OW.tg.link) || "") + '">' +
      '<div class="pp-tgrow"><select class="inp" id="ppTgMode">' +
      '<option value="bot"' + ((!OW.tg || OW.tg.mode !== "user") ? " selected" : "") + ">ربات (کد با start می‌رود)</option>" +
      '<option value="user"' + ((OW.tg && OW.tg.mode === "user") ? " selected" : "") + ">آیدی شخصی (کد را دستی بفرست)</option>" +
      '</select><button class="btn p" type="button" data-pp-tgsave="1">ذخیره</button></div>' +
      '<div class="xs mut mt">وضعیت: ' + (OW.tg && OW.tg.link
        ? '<span class="chip ok">فعال</span> <span dir="ltr">' + esc(OW.tg.link) + "</span>"
        : '<span class="chip bad">تنظیم نشده</span>') + "</div></div>";

    h += '<div class="card mt"><div class="between mb"><span class="sm b">⏳ سفارش‌های در انتظار</span>' +
      '<span class="chip gd">' + fa(pending.length) + "</span></div>" +
      (pending.length ? pending.map(function (r) {
        return '<div class="pp-req"><div class="between"><div><b>' + esc(r.name || r.uid || "کاربر") + "</b>" +
          '<div class="xs mut">' + (r.method === "telegram" ? "✈️ تلگرام" : "📝 درخواست") + " • " +
          esc(when(r.at)) + "</div></div>" +
          '<span class="chip gd">' + fa(num(r.days)) + " روزه</span></div>" +
          '<div class="xs mut mt">' + money(r.price) + " • " + esc(r.tg || "بدون آیدی") +
          (r.code ? " • کد: <span dir=\"ltr\">" + esc(r.code) + "</span>" : "") + "</div>" +
          '<div class="row w mt" style="gap:7px;flex-wrap:wrap">' +
          '<button class="btn ok mini" type="button" data-pp-approve="' + esc(r.id) + '">✅ تأیید و واریز</button>' +
          '<button class="btn d mini" type="button" data-pp-reject="' + esc(r.id) + '">❌ رد</button></div></div>';
      }).join("") : '<div class="empty">سفارش در انتظاری نیست ✅</div>') + "</div>";

    if (approved.length) {
      h += '<div class="card mt"><div class="sm b mb">🧾 آخرین واریزها</div>' +
        approved.slice(0, 10).map(function (r) {
          return '<div class="pp-req"><div class="between"><div><b>' + esc(r.name || r.uid || "کاربر") + "</b>" +
            '<div class="xs mut">' + esc(when(r.approvedAt || r.at)) + " • " + esc(r.code || "") + "</div></div>" +
            '<b style=\"color:var(--gold,#ffcb52)\">+' + money(r.price) + "</b></div></div>";
        }).join("") + "</div>";
    }
    return h;
  }

  /* ══════════ دادن / تمدید / حذف (مالک) ══════════ */
  function grant(uid, days) {
    if (!R.isOwner || !R.isOwner() || !uid) return Promise.resolve(false);
    var u = userOf(uid) || {};
    var d = num(days);
    var base = Math.max(Date.now(), expOf(u));
    var exp = d ? base + d * DAY : 0;
    var since = num(u.premSince) || Date.now();
    var patch = { prem: true, premExp: exp, premSince: since, premBy: R.ME || "" };
    if (d) patch.premPlan = d;

    return R.upd("users/" + uid, patch).then(function () {
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
      return true;
    }).catch(function (e) {
      R.toast("نشد: " + ((e && e.message) || ""), "err");
      return false;
    });
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
          (isPerm(obj) ? "" : '<div class="pp-timer pp-timer-sm" id="ppProfTimer" data-exp="' +
            expOf(obj) + '">' + timerText(expOf(obj)) + "</div>") +
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

      /* پرداخت تلگرام */
      var pay = t.closest("[data-pp-pay]");
      if (pay) {
        ev.preventDefault();
        payTelegram(num(pay.getAttribute("data-pp-pay")));
        return;
      }

      /* کپی کد سفارش */
      var cp = t.closest("[data-pp-copy]");
      if (cp) {
        ev.preventDefault();
        copyText(cp.getAttribute("data-pp-copy"));
        return;
      }

      /* ذخیرهٔ تنظیمات تلگرام */
      var ts = t.closest("[data-pp-tgsave]");
      if (ts) {
        ev.preventDefault();
        saveTelegram();
        return;
      }

      /* تأیید یا رد سفارش توسط مالک */
      var ap = t.closest("[data-pp-approve]");
      if (ap) {
        ev.preventDefault();
        ev.stopPropagation();
        approveReq(ap.getAttribute("data-pp-approve"));
        return;
      }
      var rj = t.closest("[data-pp-reject]");
      if (rj) {
        ev.preventDefault();
        ev.stopPropagation();
        rejectReq(rj.getAttribute("data-pp-reject"));
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
    loadTelegram();
    if (R.isOwner && R.isOwner()) loadOwner();
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

  /* تایمر معکوس هر ثانیه */
  setInterval(tick, 1000);

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
    payTelegram: payTelegram,
    timerText: timerText,
    approvedTotal: approvedTotal,
    loadOwner: loadOwner,
    saveTelegram: saveTelegram,
    approveReq: approveReq,
    rejectReq: rejectReq,
    saveBadge: saveBadge,
    render: render,
    expireCheck: expireCheck,
    reminder: reminder,
    pick: function (d) { pick = num(d) || 30; return pick; }
  };
})();
