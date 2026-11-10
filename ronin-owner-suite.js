/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OWNER SUITE · ronin-owner-suite.js · v1
   ───────────────────────────────────────────────────────────────
   👑 کنسول مالک: فقط مالک می‌بیند و فقط مالک اجرا می‌کند
   • هیرو زنده با ساعت، آمار لحظه‌ای و وضعیت امروز
   • اعلان همگانی واقعی • خروجی JSON • پاک‌سازی کش
   • حالت تعمیرات سراسری • لاگ اقدامات مالک
   • میان‌بر میز پشتیبانی • دسترسی سریع به کاربران
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__os) return;
  R.__os = true;

  var S = { log: [], users: {}, maint: false, clock: 0, ann: "" };

  function el(i) { return document.getElementById(i); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fa(n) { try { return R.fa ? R.fa(n) : String(n); } catch (e) { return String(n); } }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function isOwner() { try { return !!(R.isOwner && R.isOwner()); } catch (e) { return false; } }
  function when(t) { try { return R.time ? R.time(t) : new Date(t).toLocaleString("fa-IR"); } catch (e) { return ""; } }
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("osCss")) return;
    var s = document.createElement("style");
    s.id = "osCss";
    s.textContent = [
      "#sec-owner:not(.rnOwned){display:none!important}",
      "#osHero{position:relative;overflow:hidden;isolation:isolate;border-radius:24px;padding:16px;margin-bottom:14px;" +
        "border:1px solid rgba(143,233,255,.24);color:#eef4ff;" +
        "background:radial-gradient(120% 110% at 100% 0%,rgba(255,84,112,.22),transparent 60%)," +
        "radial-gradient(110% 120% at 0% 0%,rgba(124,92,255,.28),transparent 62%)," +
        "linear-gradient(150deg,#121736,#0a0d20 60%,#101632);" +
        "box-shadow:0 30px 70px -46px rgba(124,92,255,.9),inset 0 1px 0 rgba(255,255,255,.06)}",
      "#osHero::before{content:'';position:absolute;inset:-50%;z-index:-1;opacity:.45;" +
        "background:conic-gradient(from 90deg,rgba(143,233,255,.5),rgba(124,92,255,.45),rgba(255,84,112,.42),rgba(143,233,255,.5));" +
        "filter:blur(64px);animation:osSpin 26s linear infinite}",
      "@keyframes osSpin{to{transform:rotate(1turn)}}",
      "@media(prefers-reduced-motion:reduce){#osHero::before{animation:none}}",
      "#osHero .osTop{display:flex;align-items:center;gap:11px;flex-wrap:wrap}",
      "#osHero .osCrown{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;font-size:23px;" +
        "background:linear-gradient(140deg,#8b6bff,#22d3ee);box-shadow:0 14px 30px -10px rgba(124,92,255,.9);position:relative}",
      "#osHero .osCrown::after{content:'';position:absolute;inset:0;border-radius:inherit;border:2px solid rgba(143,233,255,.5);" +
        "animation:osRing 2.8s ease-out infinite}",
      "@keyframes osRing{0%{transform:scale(1);opacity:.7}70%,100%{transform:scale(1.5);opacity:0}}",
      "#osHero h3{margin:0;font-size:17px;font-weight:900;letter-spacing:-.2px;" +
        "background:linear-gradient(100deg,#fff,#d3dbff 50%,#9fe8ff);-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#osHero .sub{font-size:10.5px;color:#bcc6ee;margin-top:2px}",
      "#osHero .osClock{margin-inline-start:auto;text-align:center;padding:6px 12px;border-radius:14px;" +
        "background:rgba(8,12,28,.55);border:1px solid rgba(143,233,255,.24);min-width:96px}",
      "#osHero .osClock b{display:block;font-size:17px;font-weight:900;color:#bfefff;letter-spacing:1px;direction:ltr}",
      "#osHero .osClock span{font-size:8.5px;color:#9fb0d8}",
      "#osKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:13px 0 11px}",
      "#osKpis .k{padding:9px 5px;text-align:center;border-radius:14px;background:rgba(255,255,255,.05);" +
        "border:1px solid rgba(143,233,255,.16)}",
      "#osKpis .k b{display:block;font-size:17px;font-weight:900;" +
        "background:linear-gradient(135deg,#fff,#8fe9ff);-webkit-background-clip:text;background-clip:text;color:transparent}",
      "#osKpis .k span{font-size:8.5px;color:#a9b3d6}",
      "#osActs{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:6px}",
      "#osActs button{cursor:pointer;font-family:inherit;font-size:10.5px;font-weight:800;padding:9px 6px;border-radius:12px;" +
        "color:#e8eeff;background:rgba(255,255,255,.06);border:1px solid rgba(143,233,255,.22);transition:.18s}",
      "#osActs button:hover{transform:translateY(-1px);border-color:#8fe9ff;color:#fff}",
      "#osActs button.on{background:linear-gradient(135deg,#ffd66b,#ff5470);color:#1a0712;border-color:transparent}",
      "#osAnn{display:none;margin-top:10px}",
      "#osAnn.on{display:block;animation:osIn .25s ease both}",
      "@keyframes osIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
      "#osAnn .row{display:flex;gap:6px}",
      "#osAnn input{flex:1;height:40px;font-size:12px}",
      "#osLog{margin-top:11px;border-top:1px dashed rgba(143,233,255,.18);padding-top:9px}",
      "#osLog b{font-size:10.5px;color:#a7d8e6}",
      "#osLog .l{font-size:9.5px;color:#98a4c8;line-height:1.95;display:flex;gap:6px}",
      "#osLog .l i{color:#ffd66b;font-style:normal}",
      "#osMaint{position:fixed;inset-inline:0;top:0;z-index:9998;padding:8px 12px;text-align:center;" +
        "font-size:11.5px;font-weight:800;color:#1a070d;background:linear-gradient(90deg,#ffd66b,#ffb03a);" +
        "box-shadow:0 8px 22px -12px rgba(0,0,0,.8);display:none}",
      "#osMaint.on{display:block}",
      "#osMaint b{font-weight:900}",
      "body.osMaintOn{padding-top:32px}",
      "@media(max-width:560px){#osKpis{grid-template-columns:repeat(2,1fr)}#osHero .osClock{display:none}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. هیرو ────────────────────────────────────────────── */
  function hero() {
    var sec = el("sec-owner");
    if (!sec || !isOwner()) return null;
    var h = el("osHero");
    if (h) return h;
    h = document.createElement("div");
    h.id = "osHero";
    h.setAttribute("data-noi18n", "");
    h.innerHTML =
      '<div class="osTop">' +
        '<div class="osCrown">👑</div>' +
        "<div><h3>کنسول فرماندهی مالک</h3>" +
          '<div class="sub">همهٔ ابزارهای حیاتی سایت، یک‌جا و زنده</div></div>' +
        '<div class="osClock"><b id="osTime">—</b><span>به وقت تهران</span></div>' +
      "</div>" +
      '<div id="osKpis">' +
        '<div class="k"><b id="osKUsers">۰</b><span>کاربر</span></div>' +
        '<div class="k"><b id="osKTickets">۰</b><span>تیکت باز</span></div>' +
        '<div class="k"><b id="osKPending">۰</b><span>در انتظار تأیید</span></div>' +
        '<div class="k"><b id="osKToday">۰</b><span>عضو امروز</span></div>' +
      "</div>" +
      '<div id="osActs">' +
        '<button type="button" data-osact="ann">📢 اعلان همگانی</button>' +
        '<button type="button" data-osact="support">🎫 میز پشتیبانی</button>' +
        '<button type="button" data-osact="export">📥 خروجی گزارش</button>' +
        '<button type="button" data-osact="maint">🛠 حالت تعمیرات</button>' +
        '<button type="button" data-osact="cache">🧹 پاک‌سازی کش</button>' +
        '<button type="button" data-osact="refresh">↺ تازه‌سازی</button>' +
      "</div>" +
      '<div id="osAnn"><div class="row">' +
        '<input class="inp" id="osAnnIn" maxlength="120" placeholder="متن اعلان برای همهٔ کاربران…">' +
        '<button class="btn p mini" type="button" data-osact="annsend">ارسال</button>' +
      '</div><div class="xs mut mt">به همهٔ حساب‌های ثبت‌شده اعلان واقعی می‌رود و در تنظیمات سایت ذخیره می‌شود.</div></div>' +
      '<div id="osLog"><b>🧾 آخرین اقدام‌های مالک</b><div id="osLogList"></div></div>';

    var tabs = sec.querySelector(".tabs");
    if (tabs && tabs.parentNode === sec) sec.insertBefore(h, tabs);
    else sec.insertBefore(h, sec.firstChild);
    h.addEventListener("click", onClick);
    return h;
  }

  /* ── ۳. آمار ────────────────────────────────────────────── */
  function paint() {
    if (!isOwner()) return;
    var sec = el("sec-owner");
    if (sec) sec.classList.add("rnOwned");

    var U = R.USERS || {};
    var users = Object.keys(U);
    var t0 = today0();
    var today = users.filter(function (k) { return (U[k].joined || 0) >= t0; }).length;
    var pend = Object.keys(R.PENDING || {}).length;
    var tickets = 0, unread = 0;
    try {
      var st = window.RoninSupport && RoninSupport.state;
      if (st) {
        ["contact", "support"].forEach(function (s) {
          Object.keys(st.data[s] || {}).forEach(function (k) {
            var m = st.data[s][k] || {};
            if (!m.reply && m.st !== "closed") tickets++;
            if (!m.read) unread++;
          });
        });
      }
    } catch (e) {}

    function set(id, v) { var n = el(id); if (n) n.textContent = fa(v); }
    set("osKUsers", users.length);
    set("osKTickets", tickets);
    set("osKPending", pend);
    set("osKToday", today);

    if (el("osTime")) {
      try {
        el("osTime").textContent = new Date().toLocaleTimeString("fa-IR", {
          hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran"
        });
      } catch (e) {}
    }

    var list = el("osLogList");
    if (list) {
      var L = (S.log || []).slice(0, 5);
      list.innerHTML = L.length ? L.map(function (x) {
        return '<div class="l"><i>' + esc(actFa(x.act)) + "</i><span>" +
          esc(x.byName || x.by || "مالک") + " • " + esc(when(x.t)) + "</span></div>";
      }).join("") : '<div class="l"><span>هنوز اقدامی ثبت نشده.</span></div>';
    }
    var mbtn = el("osActs") && el("osActs").querySelector('[data-osact="maint"]');
    if (mbtn) mbtn.classList.toggle("on", !!S.maint);
  }

  function actFa(a) {
    return {
      supportReply: "پاسخ پشتیبانی", broadcast: "اعلان همگانی", export: "خروجی گزارش",
      maintOn: "حالت تعمیرات روشن", maintOff: "حالت تعمیرات خاموش", cache: "پاک‌سازی کش"
    }[a] || (a || "اقدام");
  }

  function log(act, extra) {
    var o = { by: R.ME || "", byName: (R.USER && R.USER.name) || "مالک", act: act, t: Date.now() };
    if (extra) { Object.keys(extra).forEach(function (k) { o[k] = extra[k]; }); }
    if (R.add) R.add("ownerLog", o).catch(function () {});
    S.log.unshift(o);
    paint();
  }

  /* ── ۴. کارها ───────────────────────────────────────────── */
  function announce(text) {
    text = String(text || "").trim().slice(0, 120);
    if (text.length < 3) return toast("متن اعلان خیلی کوتاه است", "err");
    var U = R.USERS || {};
    var ids = Object.keys(U).filter(function (k) { return k !== R.ME; });
    if (!ids.length) return toast("کاربری برای ارسال نیست", "err");
    var sent = 0;
    ids.slice(0, 200).forEach(function (uid) {
      try { if (R.notify) { R.notify(uid, "📢 " + text, "info", ""); sent++; } } catch (e) {}
    });
    R.set("settings/ann", { text: text, t: Date.now(), by: R.ME || "" }).catch(function () {});
    if (R.add) R.add("bulletin", { title: "📢 اعلان مالک", text: text, by: R.ME || "", kind: "ann" }).catch(function () {});
    log("broadcast", { count: sent });
    toast("اعلان برای " + fa(sent) + " کاربر رفت ✅", "ok");
    var box = el("osAnn"); if (box) box.classList.remove("on");
    if (el("osAnnIn")) el("osAnnIn").value = "";
  }

  function exportJSON() {
    if (!R.db) return toast("اتصال به دیتابیس نیست", "err");
    toast("در حال آماده‌سازی گزارش…", "ok");
    var paths = ["users", "orders", "reports", "contact", "ownerLog", "bulletin"];
    Promise.all(paths.map(function (p) {
      return R.get(p).catch(function () { return null; });
    })).then(function (vals) {
      var out = { at: new Date().toISOString(), site: "RONIN STORE" };
      paths.forEach(function (p, i) { out[p] = vals[i] || {}; });
      var txt = JSON.stringify(out, null, 2);
      var blob = new Blob([txt], { type: "application/json;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ronin-report-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      log("export", { size: txt.length });
      toast("گزارش دانلود شد 📥", "ok");
    }).catch(function (e) {
      toast("خروجی نگرفت: " + (e && e.message ? e.message : ""), "err");
    });
  }

  function clearCache() {
    if (!window.confirm("کش آفلاین پاک شود و صفحه دوباره بارگذاری شود؟")) return;
    var done = function () { location.reload(); };
    if (window.caches && caches.keys) {
      caches.keys().then(function (ks) {
        return Promise.all(ks.map(function (k) { return caches.delete(k); }));
      }).then(function () { log("cache"); done(); }, done);
    } else done();
  }

  function setMaint(on) {
    S.maint = !!on;
    R.set("settings/maint", { on: !!on, by: R.ME || "", t: Date.now() }).catch(function () {});
    log(on ? "maintOn" : "maintOff");
    paintMaint();
    toast(on ? "حالت تعمیرات روشن شد" : "حالت تعمیرات خاموش شد", "ok");
  }

  function paintMaint() {
    var b = el("osMaint");
    if (!b) {
      b = document.createElement("div");
      b.id = "osMaint";
      b.setAttribute("data-noi18n", "");
      b.innerHTML = "🛠 <b>رونین در حال به‌روزرسانی است</b> — به‌زودی برمی‌گردیم";
      document.body.appendChild(b);
    }
    b.classList.toggle("on", !!S.maint);
    document.body.classList.toggle("osMaintOn", !!S.maint);
  }

  function openSupport() {
    if (R.go) R.go("team");
    setTimeout(function () {
      if (window.RoninSupport) RoninSupport.open();
      else toast("میز پشتیبانی هنوز آماده نیست", "err");
    }, 260);
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest("[data-osact]");
    if (!b) return;
    e.preventDefault();
    var a = b.getAttribute("data-osact");
    if (a === "ann") { var box = el("osAnn"); if (box) box.classList.toggle("on"); }
    else if (a === "annsend") announce(el("osAnnIn") ? el("osAnnIn").value : "");
    else if (a === "export") exportJSON();
    else if (a === "cache") clearCache();
    else if (a === "maint") setMaint(!S.maint);
    else if (a === "support") openSupport();
    else if (a === "refresh") { paint(); toast("تازه شد", "ok"); }
  }

  /* ── ۵. قفل مالک ────────────────────────────────────────── */
  function guard() {
    var sec = el("sec-owner");
    if (sec) sec.classList.toggle("rnOwned", isOwner());
    if (!isOwner() && R.cur === "owner" && R.go) R.go("home");
  }
  var go0 = R.go;
  if (typeof go0 === "function") {
    R.go = function (name) {
      if (name === "owner" && !isOwner()) {
        toast("این بخش فقط برای مالک است 🔒", "err");
        return;
      }
      return go0.apply(this, arguments);
    };
  }

  /* ── ۶. راه‌اندازی ──────────────────────────────────────── */
  function watch() {
    if (!R.db || R.__osWatch) return;
    R.__osWatch = true;
    try {
      R.watch("ownerLog", function (v) {
        S.log = Object.keys(v || {}).map(function (k) {
          var x = v[k] || {}; x.id = k; return x;
        }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
        paint();
      });
      R.watch("settings/maint", function (v) {
        S.maint = !!(v && (v.on === true || v === true));
        paintMaint();
        paint();
      });
    } catch (e) {}
  }

  function boot() {
    css();
    if (!isOwner()) { guard(); return; }
    guard();
    hero();
    watch();
    paint();
    paintMaint();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1600, 3200, 6000].forEach(function (ms) { setTimeout(boot, ms); });
  setInterval(function () { if (isOwner()) paint(); }, 30000);

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(boot, 500);
  };
  var out0 = R.onLogout;
  R.onLogout = function () {
    if (out0) { try { out0(); } catch (e) {} }
    var sec = el("sec-owner"); if (sec) sec.classList.remove("rnOwned");
    var h = el("osHero"); if (h) h.remove();
  };

  window.RoninOwner = { state: S, announce: announce, export: exportJSON, maintenance: setMaint };
})();
