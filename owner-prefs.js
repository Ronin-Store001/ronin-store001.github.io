/* RONIN OWNER PREFS v2 — owner-prefs.js
   واحد پول (تومان/دلار/افغانی/یورو/روپیه/درهم)، تقویم شمسی/میلادی، ساعت و ویرایش قیمت پرمیوم. */
"use strict";
(function boot() {
  if (window.__owPrefs) return;
  if (!window.R) { setTimeout(boot, 400); return; }
  window.__owPrefs = true;

  var KEY = "ronin_prefs";
  var UNITS = {
    toman: { l: "تومان" }, usd: { l: "دلار" }, afn: { l: "افغانی" },
    eur: { l: "یورو" }, pkr: { l: "روپیه" }, aed: { l: "درهم" }
  };
  var DEFAULTS = {
    toman: { 15: 69000, 30: 129000, 60: 229000, 90: 329000 },
    usd: { 15: 5, 30: 9, 60: 15, 90: 22 },
    afn: { 15: 250, 30: 450, 60: 800, 90: 1200 },
    eur: { 15: 5, 30: 9, 60: 15, 90: 22 },
    pkr: { 15: 400, 30: 700, 60: 1200, 90: 1800 },
    aed: { 15: 20, 30: 35, 60: 60, 90: 90 }
  };
  var P = { cur: "toman", cal: "jalali", months: "fa", clock: 24, all: {} };
  try {
    var raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    for (var k in raw) if (k !== "all" && k !== "base") P[k] = raw[k];
    P.all = raw.all || {};
  } catch (e) {}
  Object.keys(DEFAULTS).forEach(function (u) {
    if (!P.all[u]) P.all[u] = JSON.parse(JSON.stringify(DEFAULTS[u]));
  });
  if (!P.all[P.cur]) P.cur = "toman";
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  function B(d) { var u = P.all[P.cur] || DEFAULTS[P.cur]; return Math.max(1, Math.round(Number(u[d]) || 1)); }
  function pd(s) { return String(s).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function en(s) { return String(s).replace(/[۰-۹]/g, function (d) { return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); }); }
  function grp(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function label() { return UNITS[P.cur] ? UNITS[P.cur].l : "تومان"; }

  function j2g(jy, jm, jd) {
    var jy2 = jy + 1595;
    var days = -355668 + 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30 + 186));
    var gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; else gy--; }
    gy += 4 * Math.floor(days / 1461); days %= 1461;
    if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
    var gd = days + 1;
    var leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
    var M = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var gm = 1;
    while (gm <= 12 && gd > M[gm - 1]) { gd -= M[gm - 1]; gm++; }
    return { gy: gy, gm: gm, gd: gd };
  }
  function g2j(gy, gm, gd) {
    var target = Date.UTC(gy, gm - 1, gd), jy = gy - 621;
    for (var i = 0; i < 4; i++) {
      var s = j2g(jy, 1, 1), st = Date.UTC(s.gy, s.gm - 1, s.gd);
      var nx = j2g(jy + 1, 1, 1), nt = Date.UTC(nx.gy, nx.gm - 1, nx.gd);
      if (target < st) { jy--; continue; }
      if (target >= nt) { jy++; continue; }
      for (var m = 1; m <= 12; m++) {
        var a = j2g(jy, m, 1), at = Date.UTC(a.gy, a.gm - 1, a.gd);
        var b = (m < 12) ? j2g(jy, m + 1, 1) : j2g(jy + 1, 1, 1);
        var bt = Date.UTC(b.gy, b.gm - 1, b.gd);
        if (target >= at && target < bt) return { jy: jy, jm: m, jd: Math.round((target - at) / 864e5) + 1 };
      }
      break;
    }
    return { jy: jy, jm: 1, jd: 1 };
  }
  var ENM = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var FAM = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  function fmtDate(jy, jm, jd) {
    if (P.cal === "greg") {
      var g = j2g(jy, jm, jd);
      return P.months === "en"
        ? en(g.gd) + " " + ENM[g.gm - 1] + " " + en(g.gy)
        : pd(g.gy) + "/" + pd(String(g.gm).padStart(2, "0")) + "/" + pd(String(g.gd).padStart(2, "0"));
    }
    return P.months === "en"
      ? pd(jd) + " " + (FAM[jm - 1] || "") + " " + pd(jy)
      : pd(jy) + "/" + pd(String(jm).padStart(2, "0")) + "/" + pd(String(jd).padStart(2, "0"));
  }
  function nowLine() {
    var d = new Date();
    if (P.cal === "greg") {
      var hh = d.getHours(), mm = String(d.getMinutes()).padStart(2, "0"), ap = "";
      if (P.clock === 12) { ap = hh >= 12 ? " PM" : " AM"; hh = hh % 12 || 12; }
      return en(d.getDate()) + " " + ENM[d.getMonth()] + " " + en(d.getFullYear()) + " — " + en(hh) + ":" + en(mm) + ap;
    }
    var j = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return pd(j.jy) + "/" + pd(String(j.jm).padStart(2, "0")) + "/" + pd(String(j.jd).padStart(2, "0"));
  }

  function swapMoney(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, hit = [];
    while ((n = walker.nextNode())) if (/تومان/.test(n.nodeValue)) hit.push(n);
    hit.forEach(function (tn) {
      tn.nodeValue = tn.nodeValue.replace(/هزار تومان/g, "هزار " + label()).replace(/تومان/g, label());
    });
  }
  function fixDay() {
    var sec = document.getElementById("sec-premium");
    if (!sec) return;
    var ps = (R.premPlus && R.premPlus.plans) || [];
    Array.prototype.forEach.call(sec.querySelectorAll(".pp-plan"), function (b) {
      var d = Number(b.getAttribute("data-pp-plan")) || 0, cap = b.querySelector(".pc-day"), p = null;
      for (var i = 0; i < ps.length; i++) if (ps[i].d === d) p = ps[i];
      if (!cap || !d || !p) return;
      var day = p.price / d;
      cap.textContent = P.cur === "toman"
        ? grp(Math.round(day / 1000)) + " هزار تومان / روز"
        : grp(Math.round(day)) + " " + label() + " / روز";
    });
  }
  function relabel() {
    var card = document.getElementById("premPriceBox");
    if (card) Array.prototype.forEach.call(card.querySelectorAll(".pcf span"), function (s) {
      s.textContent = s.textContent.replace(/تومان|دلار|افغانی|یورو|روپیه|درهم/g, label());
    });
  }
  function applyPrices() {
    try {
      var ps = R.premPlus && R.premPlus.plans;
      if (ps) ps.forEach(function (p) { p.price = B(p.d); });
      if (R.premPlus && R.premPlus.render) R.premPlus.render();
    } catch (e) {}
    setTimeout(function () {
      swapMoney(document.getElementById("sec-premium"));
      swapMoney(document.getElementById("premPriceBox"));
      fixDay();
      relabel();
    }, 80);
  }

  function applyDates() {
    var sec = document.getElementById("sec-owner");
    if (!sec) return;
    var walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, null), n, hit = [];
    while ((n = walker.nextNode())) {
      if (/[۰-۹]{4}[\/\-][۰-۹]{1,2}[\/\-][۰-۹]{1,2}/.test(n.nodeValue)) hit.push(n);
    }
    hit.forEach(function (tn) {
      tn.nodeValue = tn.nodeValue.replace(/([۰-۹]{4})[\/\-]([۰-۹]{1,2})[\/\-]([۰-۹]{1,2})/g, function (m, y, mo, d) {
        return fmtDate(Number(en(y)), Number(en(mo)), Number(en(d)));
      });
    });
  }

  var CSS = [
    ".owp{border-radius:18px;border:1px solid rgba(124,92,255,.24);overflow:hidden;margin:0 0 14px;",
    " background:linear-gradient(150deg,rgba(20,18,40,.94),rgba(10,10,22,.95));color:#e7ecff}",
    ".owp-h{padding:11px 14px;border-bottom:1px solid rgba(124,92,255,.2);font-size:12px;font-weight:900;color:#cfe0ff}",
    ".owp-b{padding:12px 14px;display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}",
    ".owp-f{display:block}.owp-f em{display:block;font-style:normal;font-size:9.5px;color:#9fb0d8;margin-bottom:5px}",
    ".owp-f select,.owp-f input{width:100%;box-sizing:border-box;font:inherit;font-size:11.5px;font-weight:800;",
    " color:#e7ecff;background:rgba(0,0,0,.42);border:1px solid rgba(124,92,255,.3);border-radius:10px;padding:7px 8px}",
    ".owp-btns{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 12px}",
    ".owp-btns button{font:inherit;font-size:10px;font-weight:900;padding:7px 12px;border-radius:10px;cursor:pointer;",
    " border:1px solid rgba(124,92,255,.4);background:rgba(124,92,255,.16);color:#dbe4ff}",
    ".owp-btns button.main{color:#08061a;border-color:transparent;background:linear-gradient(135deg,#8ef0ff,#7c5cff)}",
    ".owp-note{padding:0 14px 12px;font-size:9.5px;line-height:1.9;color:#93a2c8}"
  ].join("");
  var st = document.createElement("style");
  st.id = "owpCss"; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);

  function opts(map, cur) {
    return Object.keys(map).map(function (k) {
      return '<option value="' + k + '"' + (k === cur ? " selected" : "") + ">" + map[k].l + "</option>";
    }).join("");
  }
  function card() {
    var sec = document.getElementById("sec-owner");
    if (!sec || document.getElementById("owPrefsCard")) return;
    var box = document.createElement("div");
    box.id = "owPrefsCard";
    box.className = "owp";
    box.innerHTML = '<div class="owp-h">⚙️ واحد پول، تقویم و قیمت‌ها</div>' +
      '<div class="owp-b">' +
        '<label class="owp-f"><em>واحد پول سایت</em><select id="owpCur">' + opts(UNITS, P.cur) + "</select></label>" +
        '<label class="owp-f"><em>تقویم پنل مالک</em><select id="owpCal">' +
          '<option value="jalali"' + (P.cal === "jalali" ? " selected" : "") + ">شمسی</option>" +
          '<option value="greg"' + (P.cal === "greg" ? " selected" : "") + ">میلادی</option></select></label>" +
        '<label class="owp-f"><em>نام ماه‌ها</em><select id="owpMon">' +
          '<option value="fa"' + (P.months === "fa" ? " selected" : "") + ">فارسی</option>" +
          '<option value="en"' + (P.months === "en" ? " selected" : "") + ">انگلیسی</option></select></label>" +
        '<label class="owp-f"><em>ساعت</em><select id="owpClk">' +
          '<option value="24"' + (P.clock === 24 ? " selected" : "") + ">۲۴ ساعته</option>" +
          '<option value="12"' + (P.clock === 12 ? " selected" : "") + ">۱۲ ساعته</option></select></label>" +
        [15, 30, 60, 90].map(function (d) {
          return '<label class="owp-f"><em>' + pd(d) + " روزه (" + label() + ")</em>" +
            '<input type="number" min="1" step="1" inputmode="numeric" data-owpd="' + d + '" value="' + B(d) + '"></label>';
        }).join("") +
      "</div>" +
      '<div class="owp-btns">' +
        '<button class="main" type="button" id="owpSave">ذخیره و اعمال</button>' +
        '<button type="button" id="owpReset">قیمت پیش‌فرض</button>' +
      "</div>" +
      '<div class="owp-note">امروز: <b id="owpToday">' + nowLine() + "</b> — قیمت‌ها همیشه به واحد انتخاب‌شده ذخیره و نمایش داده می‌شوند.</div>";
    var anchor = document.getElementById("premPriceBox") || document.getElementById("ownerBody");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor.nextSibling);
    else sec.insertBefore(box, sec.firstChild);
    box.addEventListener("click", function (e) {
      if (e.target.closest("#owpSave")) savePrefs(false);
      else if (e.target.closest("#owpReset")) savePrefs(true);
    });
  }

  function savePrefs(reset) {
    var box = document.getElementById("owPrefsCard");
    if (!box) return;
    var prevCur = P.cur, nextCur = box.querySelector("#owpCur").value;
    P.cal = box.querySelector("#owpCal").value;
    P.months = box.querySelector("#owpMon").value;
    P.clock = Number(box.querySelector("#owpClk").value) || 24;
    if (reset) {
      P.all[prevCur] = JSON.parse(JSON.stringify(DEFAULTS[prevCur] || DEFAULTS.toman));
    } else if (nextCur === prevCur) {
      [15, 30, 60, 90].forEach(function (d) {
        var inp = box.querySelector('[data-owpd="' + d + '"]');
        var v = Math.round(Number(en(inp && inp.value)) || 0);
        if (v > 0) P.all[P.cur][d] = v;
      });
    }
    P.cur = nextCur;
    if (!P.all[P.cur]) P.all[P.cur] = JSON.parse(JSON.stringify(DEFAULTS[P.cur] || DEFAULTS.toman));
    [15, 30, 60, 90].forEach(function (d) {
      var inp = box.querySelector('[data-owpd="' + d + '"]');
      if (inp) inp.value = B(d);
    });
    persist();
    var t = document.getElementById("owpToday");
    if (t) t.textContent = nowLine();
    applyPrices(); applyDates();
    try { if (R.set) R.set("site/prefs", { cur: P.cur, cal: P.cal, months: P.months, clock: P.clock, prices: P.all }).catch(function () {}); } catch (e) {}
    if (R.toast) R.toast(reset ? "قیمت‌ها به پیش‌فرض برگشت" : "تنظیمات ذخیره و اعمال شد ✅", "ok");
  }

  function watch() {
    card();
    applyPrices();
    applyDates();
    setTimeout(function () {
      swapMoney(document.getElementById("sec-premium"));
      swapMoney(document.getElementById("premPriceBox"));
      swapMoney(document.getElementById("owPrefsCard"));
    }, 220);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch);
  else watch();
  setInterval(watch, 2500);
  document.addEventListener("click", function (e) {
    if (e.target.closest && (e.target.closest("#owpSave") || e.target.closest("#owpReset"))) return;
    if (e.target.closest && e.target.closest('[data-tab],#pcSave')) setTimeout(watch, 260);
  }, true);

  window.__owPrefsAPI = { prefs: P, units: UNITS, apply: applyPrices, dates: applyDates, save: savePrefs, today: nowLine };
})();
