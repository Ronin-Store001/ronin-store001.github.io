/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — OWNER PLUS v1  ·  ارتقای مرکز فرماندهی
   🧹 پاک‌سازی منظم • 📣 اعلان گروهی • 📌 بنر/حالت تعمیر • ⬇️ خروجی
   ───────────────────────────────────────────────────────────────
   کاملاً افزودنی است: به فایل‌های اصلی دست نمی‌زند و فقط یک تب
   «🛠 نگهداری» به پنل مالک اضافه می‌کند. همهٔ کارها فقط برای مالک
   اجرا می‌شوند و هیچ‌وقت کاربر، پست یا محصول حذف نمی‌شود.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__op) return;
  R.__op = true;

  var OP = { days: 30, scan: null, busy: false, last: null };
  var CAP = 400;                     /* سقف اعلام گروهی در هر بار */
  var BATCH = 40;                    /* حذف دسته‌ای */

  function el(i) { return document.getElementById(i); }
  function isOwner() { try { return !!R.isOwner(); } catch (e) { return false; } }
  function cut(d) { return Date.now() - d * 86400000; }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("opCss")) return;
    var s = document.createElement("style");
    s.id = "opCss";
    s.textContent =
      "#opBanner{position:fixed;top:0;inset-inline:0;z-index:140;display:none;padding:7px 42px;" +
      "font-size:12.5px;text-align:center;font-weight:700;color:#101426;" +
      "background:linear-gradient(135deg,#bdee63,#8ec63f);transition:transform .45s ease,opacity .45s ease}" +
      "#opBanner.on{display:block;animation:opDrop .45s ease both}" +
      "#opBanner.off{transform:translateY(-130%);opacity:0}" +
      "#opBanner.maint{background:linear-gradient(135deg,#ffb03a,#ff7a7a);color:#2b1400}" +
      "#opBanner b{font-weight:900}" +
      "#opBanner .opX{position:absolute;top:50%;inset-inline-end:9px;transform:translateY(-50%);" +
      "width:24px;height:24px;border-radius:8px;border:1px solid rgba(16,20,38,.28);cursor:pointer;" +
      "background:rgba(255,255,255,.3);color:#101426;font-size:12px;font-weight:900;line-height:1;padding:0}" +
      "@keyframes opDrop{from{transform:translateY(-130%);opacity:0}to{transform:translateY(0);opacity:1}}" +
      ".opGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin:8px 0}" +
      ".opKpi{background:rgba(120,140,255,.08);border:1px solid rgba(140,160,255,.18);" +
      "border-radius:12px;padding:8px 10px}" +
      ".opKpi .n{font-weight:900;font-size:17px}" +
      ".opKpi .l{font-size:11px;opacity:.7}" +
      ".opOrbRow{display:flex;gap:10px;align-items:flex-start}" +
      ".opOrbPrev{flex:0 0 64px;width:64px;height:64px;border-radius:16px;display:grid;place-items:center;" +
      "font-size:22px;font-weight:900;color:#fff;overflow:hidden;" +
      "background:linear-gradient(140deg,#7c5cff,#22d3ee)}" +
      ".opOrbPrev img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".opRow{display:flex;align-items:center;justify-content:space-between;gap:8px;" +
      "padding:6px 0;border-top:1px solid rgba(150,120,255,.12);font-size:12.5px}" +
      ".opRow:first-of-type{border-top:0}" +
      ".opRow b{font-weight:800}" +
      ".opBad{color:#ff9a9a}.opOk{color:#bdee63}" +
      "#opProg{height:6px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:8px}" +
      "#opProg i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7c5cff,#22d3ee);" +
      "transition:width .2s}";
    document.head.appendChild(s);
  }

  /* ── ۲. تب تازه در پنل مالک ─────────────────────────────── */
  function addTab() {
    var box = document.querySelector("#sec-owner .tabs");
    if (!box || box.querySelector('[data-otab="maint"]')) return;
    var b = document.createElement("div");
    b.className = "tab";
    b.setAttribute("data-otab", "maint");
    b.textContent = "🛠 نگهداری";
    box.appendChild(b);
    /* تب‌های اصلی با listener خودشان کار می‌کنند؛ برای این تب هم یکی می‌گذاریم */
    b.addEventListener("click", function () {
      R.ownerTab = "maint";
      var tabs = document.querySelectorAll("#sec-owner [data-otab]");
      for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("on", tabs[i] === b);
      if (R.renderOwner) R.renderOwner();
    });
  }

  /* ── ۳. خواندن امن دیتابیس ──────────────────────────────── */
  function read(path) {
    return new Promise(function (res) {
      if (!R.db) return res(null);
      try {
        R.db.ref(path).once("value").then(function (s) { res(s ? s.val() : null); },
          function () { res(null); });
      } catch (e) { res(null); }
    });
  }
  function num(x) { return typeof x === "number" ? x : 0; }

  /* ── ۴. اسکن: چه چیزی قدیمی است؟ ────────────────────────── */
  function scan(d) {
    var c = cut(d);
    var out = { days: d, reports: 0, orders: 0, chat: 0, notifs: 0, premreq: 0, keys: {} };
    return Promise.all([
      read("reports").then(function (v) {
        v = v || {};
        Object.keys(v).forEach(function (k) {
          var x = v[k] || {};
          if (x.st === "done" && num(x.t) && num(x.t) < c) {
            out.reports++; (out.keys.reports = out.keys.reports || []).push(k);
          }
        });
      }),
      read("orders").then(function (v) {
        v = v || {};
        Object.keys(v).forEach(function (k) {
          var x = v[k] || {};
          if (x.st === "done" && num(x.t) && num(x.t) < c) {
            out.orders++; (out.keys.orders = out.keys.orders || []).push(k);
          }
        });
      }),
      read("chat").then(function (v) {
        v = v || {};
        Object.keys(v).forEach(function (k) {
          var x = v[k] || {};
          if (num(x.t) && num(x.t) < c) {
            out.chat++; (out.keys.chat = out.keys.chat || []).push(k);
          }
        });
      }),
      read("premreq").then(function (v) {
        v = v || {};
        Object.keys(v).forEach(function (k) {
          var x = v[k] || {};
          if ((x.st === "done" || x.st === "rejected") && num(x.t) && num(x.t) < c) {
            out.premreq++; (out.keys.premreq = out.keys.premreq || []).push(k);
          }
        });
      }),
      read("notifs").then(function (v) {
        v = v || {};
        out.keys.notifs = {};
        Object.keys(v).forEach(function (uid) {
          var box = v[uid] || {};
          Object.keys(box).forEach(function (k) {
            var x = box[k] || {};
            if (num(x.t) && num(x.t) < c) {
              out.notifs++;
              (out.keys.notifs[uid] = out.keys.notifs[uid] || []).push(k);
            }
          });
        });
      })
    ]).then(function () { OP.scan = out; return out; });
  }

  /* ── ۵. حذف دسته‌ای (فقط کلیدهایی که اسکن تأیید کرده) ──── */
  function chunkDel(path, keys, prog) {
    var total = keys.length, done = 0, i = 0;
    function step() {
      if (i >= total) return Promise.resolve(done);
      var part = keys.slice(i, i + BATCH);
      i += part.length;
      return Promise.all(part.map(function (k) {
        return R.db.ref(path + "/" + k).remove().then(function () { done++; },
          function () {});
      })).then(function () {
        if (prog) prog(done, total);
        return step();
      });
    }
    return step();
  }

  function runCleanup() {
    var s = OP.scan;
    if (!s) return toast("اول «بررسی» را بزن", "err");
    if (OP.busy) return;
    var total = s.reports + s.orders + s.chat + s.notifs + s.premreq;
    if (!total) return toast("چیزی برای پاک‌سازی نیست ✅", "ok");

    OP.busy = true;
    paint();
    var bar = el("opProgI");
    function prog(done, all) { if (bar) bar.style.width = Math.round(done * 100 / Math.max(1, all)) + "%"; }

    var jobs = [];
    if (s.keys.reports && s.keys.reports.length)
      jobs.push(chunkDel("reports", s.keys.reports, prog));
    if (s.keys.orders && s.keys.orders.length)
      jobs.push(chunkDel("orders", s.keys.orders, prog));
    if (s.keys.chat && s.keys.chat.length)
      jobs.push(chunkDel("chat", s.keys.chat, prog));
    if (s.keys.premreq && s.keys.premreq.length)
      jobs.push(chunkDel("premreq", s.keys.premreq, prog));
    if (s.keys.notifs) {
      Object.keys(s.keys.notifs).forEach(function (uid) {
        if (s.keys.notifs[uid].length)
          jobs.push(chunkDel("notifs/" + uid, s.keys.notifs[uid], prog));
      });
    }

    Promise.all(jobs).then(function () {
      OP.busy = false;
      OP.last = { at: Date.now(), removed: total, days: s.days };
      OP.scan = null;
      if (R.add) {
        R.add("ownerLog", {
          by: R.ME || "", act: "cleanup", days: s.days, removed: total,
          detail: { reports: s.reports, orders: s.orders, chat: s.chat, notifs: s.notifs, premreq: s.premreq }
        }).catch(function () {});
      }
      toast("🧹 " + fa(total) + " آیتم قدیمی پاک شد", "ok");
      paint();
    }).catch(function (e) {
      OP.busy = false;
      toast("خطا در پاک‌سازی: " + (e && e.message ? e.message : "نامشخص"), "err");
      paint();
    });
  }

  /* ── ۶. اعلان گروهی ─────────────────────────────────────── */
  function recipients(scope) {
    var U = R.USERS || {};
    var ks = Object.keys(U).filter(function (k) {
      var u = U[k] || {};
      if (u.banned) return false;
      if (scope === "prem") return !!u.prem;
      if (scope === "staff") return u.role === "admin" || u.role === "mod" ||
        (u.perms && (u.perms.mod || u.perms.news));
      return true;
    });
    return ks.slice(0, CAP);
  }

  function sendBroadcast() {
    if (!isOwner()) return toast("فقط مالک", "err");
    if (OP.busy) return;
    var inp = el("opMsg");
    var msg = inp ? String(inp.value || "").trim() : "";
    var sel = el("opTo");
    var scope = sel ? sel.value : "all";
    if (msg.length < 3) return toast("متن اعلان خیلی کوتاه است", "err");
    if (!R.USERS || !Object.keys(R.USERS).length) return toast("فهرست کاربران بارگذاری نشده", "err");

    var to = recipients(scope);
    if (!to.length) return toast("گیرنده‌ای پیدا نشد", "err");

    OP.busy = true; paint();
    var done = 0, bar = el("opProgI");
    var i = 0;
    function step() {
      if (i >= to.length) {
        OP.busy = false;
        if (inp) inp.value = "";
        if (R.add) R.add("ownerLog", {
          by: R.ME || "", act: "broadcast", scope: scope, n: done, text: msg.slice(0, 80)
        }).catch(function () {});
        toast("📣 اعلان برای " + fa(done) + " نفر رفت", "ok");
        return paint();
      }
      var part = to.slice(i, i + 25);
      i += part.length;
      part.forEach(function (uid) {
        try { R.notify(uid, "📣 " + msg, "info", "home", "system"); done++; } catch (e) {}
      });
      if (bar) bar.style.width = Math.round(done * 100 / Math.max(1, to.length)) + "%";
      setTimeout(step, 60);
    }
    step();
  }

  /* ── ۷. بنر و حالت تعمیر ────────────────────────────────── */
  var SITE = { ann: "", maint: false, orbImg: "" };

  function bannerBox() {
    var b = el("opBanner");
    if (!b) {
      b = document.createElement("div");
      b.id = "opBanner";
      document.body.appendChild(b);
    }
    return b;
  }
  var hideT = null;
  function renderBanner() {
    var b = bannerBox();
    var txt = String(SITE.ann || "").trim();
    var maint = !!SITE.maint;
    if (hideT) { clearTimeout(hideT); hideT = null; }
    if (!txt && !maint) { b.className = ""; b.innerHTML = ""; return; }
    b.className = maint ? "on maint" : "on";
    b.innerHTML = (maint
      ? "🛠 حالت تعمیر: " + esc(txt || "سایت موقتاً در حال به‌روزرسانی است")
      : "📌 " + esc(txt)) +
      '<button class="opX" type="button" aria-label="بستن" data-opx="1">✕</button>';
    /* مزاحم نباشد: چند ثانیه بعد از ورود، خودش بالا می‌رود */
    hideT = setTimeout(dismissBanner, maint ? 12000 : 6000);
  }
  function dismissBanner() {
    var b = el("opBanner");
    if (hideT) { clearTimeout(hideT); hideT = null; }
    if (!b || !/(^|\s)on(\s|$)/.test(b.className)) return;
    b.classList.add("off");
    setTimeout(function () { b.className = ""; b.innerHTML = ""; }, 460);
  }
  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest || !x.closest("#opBanner .opX")) return;
    e.preventDefault();
    dismissBanner();
  });
  function loadSite() {
    return read("settings/site").then(function (v) {
      v = v || {};
      SITE.ann = v.ann || "";
      SITE.maint = !!v.maint;
      SITE.orbImg = String(v.orbImg || "");
      renderBanner();
    });
  }
  function saveSite(patch) {
    if (!isOwner()) return toast("فقط مالک", "err");
    if (!R.db) return;
    var p = {};
    if (patch.ann !== undefined) p.ann = patch.ann;
    if (patch.maint !== undefined) p.maint = !!patch.maint;
    if (patch.orbImg !== undefined) p.orbImg = String(patch.orbImg || "");
    R.db.ref("settings/site").update(p).then(function () {
      Object.keys(p).forEach(function (k) { SITE[k] = p[k]; });
      renderBanner();
      /* عکس سیارهٔ هیرو بی‌درنگ عوض شود */
      if (patch.orbImg !== undefined) {
        if (R.SITE) R.SITE.orbImg = SITE.orbImg;
        if (R.heroPlus && R.heroPlus.setOrb) { try { R.heroPlus.setOrb(SITE.orbImg); } catch (e) {} }
      }
      toast("ذخیره شد ✅", "ok");
      paint();
    }).catch(function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
  }

  /* ── ۸. خروجی گرفتن ─────────────────────────────────────── */
  function exportJSON() {
    if (!isOwner()) return;
    scan(OP.days).then(function (s) {
      var data = {
        at: new Date().toISOString(),
        days: s.days,
        counts: { reports: s.reports, orders: s.orders, chat: s.chat, notifs: s.notifs, premreq: s.premreq },
        users: Object.keys(R.USERS || {}).length,
        posts: Object.keys(R.POSTS || {}).length,
        products: Object.keys(R.PRODS || {}).length,
        site: { ann: SITE.ann, maint: SITE.maint }
      };
      try {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ronin-report-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        toast("⬇️ خروجی آماده شد", "ok");
      } catch (e) { toast("خروجی نشد", "err"); }
    });
  }

  /* ── ۹. HTML تب نگهداری ─────────────────────────────────── */
  function kpi(n, l) {
    return '<div class="opKpi"><div class="n">' + fa(n) + '</div><div class="l">' + l + "</div></div>";
  }
  function html() {
    var s = OP.scan;
    var h = "";

    /* وضعیت */
    var users = Object.keys(R.USERS || {}).length;
    var posts = Object.keys(R.POSTS || {}).length;
    var prods = Object.keys(R.PRODS || {}).length;
    h += '<div class="card mb"><div class="sm b mb">📊 وضعیت دیتابیس</div>' +
      '<div class="opGrid">' + kpi(users, "کاربر") + kpi(posts, "پست") +
      kpi(prods, "آگهی") + kpi(Object.keys(R.ORDERS || {}).length, "سفارش") +
      kpi(Object.keys(R.REPORTS || {}).length, "گزارش") + "</div>" +
      '<div class="xs mut">آخرین پاک‌سازی: ' +
      (OP.last ? esc(R.time ? R.time(OP.last.at) : new Date(OP.last.at).toLocaleString("fa")) +
        " • " + fa(OP.last.removed) + " آیتم" : "هنوز انجام نشده") + "</div></div>";

    /* پاک‌سازی */
    h += '<div class="card mb"><div class="between mb"><div><div class="sm b">🧹 پاک‌سازی منظم</div>' +
      '<div class="xs mut">فقط اعلان‌ها، چت و آیتم‌های تمام‌شدهٔ قدیمی. کاربر و پست و آگهی دست نمی‌خورد.</div></div>' +
      '<select class="inp mini" id="opDays" style="max-width:110px">' +
      [7, 30, 60, 90].map(function (d) {
        return '<option value="' + d + '"' + (d === OP.days ? " selected" : "") + ">قدیمی‌تر از " + d + " روز</option>";
      }).join("") + "</select></div>";

    if (!s) {
      h += '<button class="btn mini p" data-op="scan"' + (OP.busy ? " disabled" : "") + ">🔎 بررسی کن</button>";
    } else {
      var tot = s.reports + s.orders + s.chat + s.notifs + s.premreq;
      h += '<div class="opRow"><span>گزارش‌های رسیدگی‌شده</span><b>' + fa(s.reports) + "</b></div>" +
        '<div class="opRow"><span>سفارش‌های انجام‌شده</span><b>' + fa(s.orders) + "</b></div>" +
        '<div class="opRow"><span>پیام‌های چت عمومی</span><b>' + fa(s.chat) + "</b></div>" +
        '<div class="opRow"><span>اعلان‌های قدیمی</span><b>' + fa(s.notifs) + "</b></div>" +
        '<div class="opRow"><span>درخواست‌های پرمیوم بسته‌شده</span><b>' + fa(s.premreq) + "</b></div>" +
        '<div class="opRow"><span class="opOk">جمع کل قابل حذف</span><b class="' +
        (tot ? "opBad" : "opOk") + '">' + fa(tot) + "</b></div>" +
        '<div class="row mt" style="gap:7px;flex-wrap:wrap">' +
        '<button class="btn mini d" data-op="run"' + (!tot || OP.busy ? " disabled" : "") + ">🗑 حذف " + fa(tot) + " آیتم</button>" +
        '<button class="btn mini" data-op="scan"' + (OP.busy ? " disabled" : "") + ">↺ بررسی دوباره</button></div>";
    }
    h += '<div id="opProg"><i id="opProgI"></i></div></div>';

    /* اعلان گروهی */
    h += '<div class="card mb"><div class="sm b mb">📣 اعلان گروهی</div>' +
      '<input class="inp mb" id="opMsg" maxlength="120" placeholder="متن اعلان برای کاربران…">' +
      '<div class="row" style="gap:7px;flex-wrap:wrap">' +
      '<select class="inp mini" id="opTo" style="max-width:170px">' +
      '<option value="all">همهٔ کاربران</option>' +
      '<option value="prem">فقط پرمیوم‌ها</option>' +
      '<option value="staff">فقط تیم</option></select>' +
      '<button class="btn mini p" data-op="send"' + (OP.busy ? " disabled" : "") + ">ارسال</button></div>" +
      '<div class="xs mut mt">حداکثر ' + fa(CAP) + " نفر در هر ارسال • کاربران مسدود اعلان نمی‌گیرند</div></div>";

    /* بنر و حالت تعمیر */
    h += '<div class="card mb"><div class="sm b mb">📌 بنر بالای سایت</div>' +
      '<input class="inp mb" id="opAnn" maxlength="120" placeholder="متن بنر (خالی = بدون بنر)" value="' +
      esc(SITE.ann) + '">' +
      '<label class="check"><input type="checkbox" id="opMaint"' + (SITE.maint ? " checked" : "") +
      "> حالت تعمیر (بنر نارنجی و متن هشدار)</label>" +
      '<button class="btn mini p mt" data-op="save">ذخیره</button></div>';

    /* عکس سیارهٔ هیرو */
    h += '<div class="card mb"><div class="sm b mb">🪐 عکس سیارهٔ هیرو</div>' +
      '<div class="xs mut mb">لینک عکس را بگذار یا از گالری انتخاب کن. خالی = کانجی 忍.</div>' +
      '<div class="opOrbRow"><div class="opOrbPrev" id="opOrbPrev">' +
      (SITE.orbImg ? '<img src="' + esc(SITE.orbImg) + '" alt="">' : "忍") + "</div>" +
      '<div class="grow"><input class="inp mb" id="opOrb" maxlength="400000" ' +
      'placeholder="https://… یا data:image/…" value="' + esc(SITE.orbImg) + '">' +
      '<div class="row" style="gap:7px;flex-wrap:wrap">' +
      '<button class="btn mini" type="button" data-oporbpick="1">📷 انتخاب از گالری</button>' +
      '<button class="btn mini p" type="button" data-op="orb">ذخیره عکس</button>' +
      '<button class="btn mini" type="button" data-op="orbclr">حذف</button></div>' +
      '<input type="file" id="opOrbFile" accept="image/*" style="display:none">' +
      '</div></div></div>';

    /* خروجی */
    h += '<div class="card mb"><div class="sm b mb">⬇️ خروجی گزارش</div>' +
      '<div class="xs mut mb">خلاصهٔ وضعیت و آیتم‌های قابل پاک‌سازی را به‌صورت JSON ذخیره می‌کند.</div>' +
      '<button class="btn mini" data-op="exp">دریافت فایل JSON</button></div>';

    return h;
  }

  function paint() {
    if (!isOwner()) return;
    var b = el("ownerBody");
    if (!b) return;
    if (R.ownerTab !== "maint") return;
    b.innerHTML = html();
  }

  /* ── ۱۰. کلیک‌ها ────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest || !isOwner()) return;
    var b = t.closest("[data-op]");
    if (!b) return;
    e.preventDefault();
    var a = b.getAttribute("data-op");

    if (a === "scan") {
      var sel = el("opDays");
      OP.days = sel ? parseInt(sel.value, 10) || 30 : OP.days;
      OP.busy = true; paint();
      scan(OP.days).then(function () { OP.busy = false; paint(); })
        .catch(function () { OP.busy = false; paint(); toast("بررسی نشد", "err"); });
    } else if (a === "run") {
      runCleanup();
    } else if (a === "send") {
      sendBroadcast();
    } else if (a === "save") {
      var ann = el("opAnn"), mt = el("opMaint");
      saveSite({ ann: ann ? String(ann.value || "").slice(0, 120) : "", maint: !!(mt && mt.checked) });
    } else if (a === "orb") {
      var oi = el("opOrb");
      saveSite({ orbImg: oi ? String(oi.value || "").trim().slice(0, 400000) : "" });
    } else if (a === "orbclr") {
      var o2 = el("opOrb"), pv2 = el("opOrbPrev");
      if (o2) o2.value = "";
      if (pv2) pv2.textContent = "忍";
      saveSite({ orbImg: "" });
    } else if (a === "exp") {
      exportJSON();
    }
  });

  /* ── ۱۰.۱ عکس سیاره: گالری → فشرده‌سازی → data URL ──────── */
  function shrink(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var m = 420, w = im.width || m, h = im.height || m;
        if (w > m || h > m) { var k = Math.min(m / w, m / h); w = Math.round(w * k); h = Math.round(h * k); }
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        try {
          c.getContext("2d").drawImage(im, 0, 0, w, h);
          cb(c.toDataURL("image/jpeg", 0.82));
        } catch (e) { cb(""); }
      };
      im.onerror = function () { cb(""); };
      im.src = fr.result;
    };
    fr.onerror = function () { cb(""); };
    fr.readAsDataURL(file);
  }

  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest || !isOwner() || !x.closest("[data-oporbpick]")) return;
    e.preventDefault();
    var f = el("opOrbFile");
    if (f) f.click();
  });

  document.addEventListener("change", function (e) {
    var x = e.target;
    if (!x || x.id !== "opOrbFile" || !isOwner()) return;
    var f = x.files && x.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type || "")) return toast("فقط فایل عکس", "err");
    shrink(f, function (url) {
      if (!url) return toast("عکس خوانده نشد", "err");
      var oi = el("opOrb"), pv = el("opOrbPrev");
      if (oi) oi.value = url;
      if (pv) pv.innerHTML = '<img src="' + url + '" alt="">';
      toast("عکس آماده شد — «ذخیره عکس» را بزن", "ok");
    });
  });

  /* ── ۱۱. راه‌اندازی ────────────────────────────────────── */
  var render0 = R.renderOwner;
  R.renderOwner = function () {
    if (R.ownerTab === "maint") {
      var b = el("ownerBody");
      if (!b || !isOwner()) return;
      addTab();
      b.innerHTML = html();
      return;
    }
    return render0 ? render0.apply(this, arguments) : undefined;
  };

  function boot() {
    if (!isOwner()) return;
    css();
    addTab();
    bannerBox();
    loadSite();
    if (R.ownerTab === "maint") paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [900, 2400, 5000].forEach(function (ms) { setTimeout(boot, ms); });
  var onIn = R.onLogin;
  R.onLogin = function () {
    if (onIn) { try { onIn(); } catch (e) {} }
    setTimeout(boot, 900);
  };
})();
