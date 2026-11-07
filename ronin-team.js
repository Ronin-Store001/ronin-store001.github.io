/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — TEAM ULTRA · ronin-team.js · v1
   شبکه فرماندهی، یکپارچه و بازچیدمان‌شده
   (جایگزین team-plus.js)
   ───────────────────────────────────────────────────────────────
   بخش ۱ ▸ ابزار تیم: وظایف، اعضا، یادداشت، هشدار، پاک‌سازی
   بخش ۲ ▸ چیدمان «مرکز فرماندهی»: ستون کانال + ستون ابزار
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — TEAM PLUS v1  ·  ارتقای «شبکه فرماندهی»
   ✅ وظایف تیم • 👥 اعضا و دسترسی‌ها • 📌 یادداشت و هشدار
   🧹 پاک‌سازی کانال • 📊 آمار کانال
   ───────────────────────────────────────────────────────────────
   افزودنی است: به فایل‌های اصلی دست نمی‌زند و یک کارت بالای کانال
   تیم در #sec-team می‌گذارد. فقط مالک و اعضای تیم آن را می‌بینند.
   هیچ کاربر/پستی حذف نمی‌شود؛ پاک‌سازی فقط پیام‌های قدیمی همین
   کانال تیم را با پیش‌نمایش و تأیید پاک می‌کند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__tp) return;
  R.__tp = true;

  var TP = {
    tab: "tasks", users: null, tasks: null, note: null,
    days: 30, scan: null, busy: false
  };
  var BATCH = 30;

  function el(i) { return document.getElementById(i); }
  function qa(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function can() {
    try {
      return !!(R.isOwner && R.isOwner()) || !!(R.isStaff && R.isStaff()) || !!R.team;
    } catch (e) { return false; }
  }
  function meName() { return (R.USER && R.USER.name) || "عضو تیم"; }
  function cut(d) { return Date.now() - d * 86400000; }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("tpCss")) return;
    var s = document.createElement("style");
    s.id = "tpCss";
    s.textContent =
      "#tpCard .tpRow{display:flex;align-items:center;gap:8px;padding:6px 0;" +
      "border-top:1px solid rgba(150,120,255,.12);font-size:12.5px}" +
      "#tpCard .tpRow:first-of-type{border-top:0}" +
      "#tpCard .tpRow .grow{min-width:0}" +
      "#tpCard .tpTask{display:flex;align-items:center;gap:8px;padding:7px 0;" +
      "border-top:1px solid rgba(150,120,255,.12)}" +
      "#tpCard .tpTask:first-of-type{border-top:0}" +
      "#tpCard .tpTask.done{opacity:.55}" +
      "#tpCard .tpTask.done .t{text-decoration:line-through}" +
      "#tpCard .tpNote{background:rgba(189,238,99,.08);border:1px solid rgba(189,238,99,.3);" +
      "border-radius:12px;padding:9px 11px;font-size:12.5px;line-height:2}" +
      "#tpCard .tpStat{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;opacity:.8}" +
      "#tpCard .tpAlert{border:1px solid rgba(255,154,154,.35);background:rgba(255,120,120,.07);" +
      "border-radius:12px;padding:9px 11px}";
    document.head.appendChild(s);
  }

  /* ── ۲. ساخت کارت ───────────────────────────────────────── */
  function card() {
    var sec = el("sec-team");
    if (!sec) return null;
    var c = el("tpCard");
    if (c) return c;
    c = document.createElement("div");
    c.className = "card mb";
    c.id = "tpCard";
    var head = sec.querySelector(".head");
    if (head && head.parentNode === sec) head.insertAdjacentElement("afterend", c);
    else sec.insertBefore(c, sec.firstChild);
    return c;
  }

  function tabsHTML() {
    var T = [["tasks", "✅ وظایف"], ["team", "👥 اعضا"], ["note", "📌 یادداشت"], ["clean", "🧹 پاک‌سازی"]];
    return '<div class="tabs mb" id="tpTabs">' + T.map(function (x) {
      return '<div class="tab' + (TP.tab === x[0] ? " on" : "") + '" data-tp-tab="' + x[0] + '">' + x[1] + "</div>";
    }).join("") + "</div>";
  }

  function statsHTML() {
    var n = Object.keys(R.TEAM || {}).length;
    return '<div class="tpStat"><span>📨 ' + fa(n) + " پیام در کانال</span>" +
      '<span>👥 ' + fa(staffList().length) + " عضو تیم</span>" +
      '<span>🔑 کانال: ' + esc(R.teamCh || "—") + "</span></div>";
  }

  /* ── ۳. اعضای تیم ───────────────────────────────────────── */
  function isStaffUser(u) {
    if (!u) return false;
    if (u.role === "admin" || u.role === "mod") return true;
    var p = u.perms || {};
    return !!(p.mod || p.news || p.anime || p.market || p.team);
  }
  function staffList() {
    var U = TP.users || R.USERS || {};
    return Object.keys(U).filter(function (k) { return isStaffUser(U[k]); })
      .map(function (k) { var u = U[k]; u.uid = k; return u; });
  }
  function loadUsers() {
    if (!R.db) return Promise.resolve();
    return R.db.ref("users").limitToLast(300).once("value").then(function (s) {
      TP.users = s.val() || {};
    }, function () { TP.users = TP.users || {}; });
  }

  /* ── ۴. وظایف ───────────────────────────────────────────── */
  function loadTasks() {
    if (!R.db) return Promise.resolve();
    return R.db.ref("teamTasks").limitToLast(120).once("value").then(function (s) {
      TP.tasks = s.val() || {};
    }, function () { TP.tasks = TP.tasks || {}; });
  }
  function taskList() {
    var T = TP.tasks || {};
    return Object.keys(T).map(function (k) { var t = T[k] || {}; t.id = k; return t; })
      .sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
  }
  function addTask() {
    if (!can()) return toast("دسترسی نداری", "err");
    var i = el("tpTaskIn");
    var txt = R.clean ? R.clean(i ? i.value : "", 120) : String(i ? i.value : "").slice(0, 120);
    txt = String(txt || "").trim();
    if (txt.length < 3) return toast("عنوان وظیفه خیلی کوتاه است", "err");
    if (!R.db) return;
    i.value = "";
    var o = { title: txt, by: R.ME || "", byName: meName(), t: Date.now(), st: "open" };
    if (R.add) {
      R.add("teamTasks", o).then(function () { toast("✅ وظیفه اضافه شد", "ok"); loadTasks().then(render); },
        function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
    }
  }
  function taskSet(id, st) {
    if (!can() || !R.db) return;
    R.db.ref("teamTasks/" + id).update({ st: st, doneBy: R.ME || "", doneAt: Date.now() })
      .then(function () { toast(st === "done" ? "انجام شد ✅" : "باز شد", "ok"); loadTasks().then(render); })
      .catch(function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
  }
  function taskDel(id) {
    if (!can() || !R.db) return;
    R.db.ref("teamTasks/" + id).remove()
      .then(function () { toast("حذف شد", "ok"); loadTasks().then(render); });
  }

  /* ── ۵. یادداشت و هشدار ─────────────────────────────────── */
  function loadNote() {
    if (!R.db) return Promise.resolve();
    return R.db.ref("settings/teamNote").once("value").then(function (s) {
      TP.note = s.val() || null;
    }, function () { TP.note = null; });
  }
  function saveNote() {
    if (!can() || !R.db) return;
    var i = el("tpNoteIn");
    var txt = String(i ? i.value : "").trim().slice(0, 240);
    if (!txt) return toast("متن یادداشت خالی است", "err");
    R.db.ref("settings/teamNote").set({ text: txt, by: R.ME || "", byName: meName(), t: Date.now() })
      .then(function () { toast("📌 یادداشت ذخیره شد", "ok"); loadNote().then(render); })
      .catch(function (e) { toast("نشد: " + (e && e.message ? e.message : ""), "err"); });
  }
  function clearNote() {
    if (!can() || !R.db) return;
    R.db.ref("settings/teamNote").remove()
      .then(function () { TP.note = null; toast("یادداشت پاک شد", "ok"); render(); });
  }
  function alertTeam() {
    if (!can()) return toast("دسترسی نداری", "err");
    var i = el("tpAlertIn");
    var txt = String(i ? i.value : "").trim().slice(0, 140);
    if (txt.length < 3) return toast("متن هشدار کوتاه است", "err");
    var to = staffList();
    var sent = 0;
    if (R.notify) {
      to.forEach(function (u) {
        if (u.uid === R.ME) return;
        try { R.notify(u.uid, "🚨 هشدار تیم: " + txt, "info", "team", "mod"); sent++; } catch (e) {}
      });
    }
    if (R.add && R.teamCh) {
      R.add("team/" + R.teamCh, {
        uid: R.ME || "", n: meName(), av: (R.USER && R.USER.av) || "",
        text: "🚨 " + txt, ch: R.teamCh
      }).catch(function () {});
    }
    if (i) i.value = "";
    toast("🚨 هشدار برای " + fa(sent) + " نفر رفت و در کانال ثبت شد", "ok");
  }

  /* ── ۶. پاک‌سازی کانال ──────────────────────────────────── */
  function scanChannel(days) {
    var c = cut(days);
    var out = { days: days, n: 0, keys: [] };
    var ch = R.teamCh;
    if (!R.db || !ch) { TP.scan = out; return Promise.resolve(out); }
    return R.db.ref("team/" + ch).once("value").then(function (s) {
      var v = s.val() || {};
      Object.keys(v).forEach(function (k) {
        var x = v[k] || {};
        if (typeof x.t === "number" && x.t < c) { out.n++; out.keys.push(k); }
      });
      TP.scan = out;
      return out;
    }, function () { TP.scan = out; return out; });
  }
  function chunkDel(keys, prog) {
    var i = 0, done = 0;
    function step() {
      if (i >= keys.length) return Promise.resolve(done);
      var part = keys.slice(i, i + BATCH);
      i += part.length;
      return Promise.all(part.map(function (k) {
        return R.db.ref("team/" + R.teamCh + "/" + k).remove()
          .then(function () { done++; }, function () {});
      })).then(function () { if (prog) prog(done, keys.length); return step(); });
    }
    return step();
  }
  function runClean() {
    var s = TP.scan;
    if (!s) return toast("اول «بررسی» را بزن", "err");
    if (!s.n) return toast("پیام قدیمی‌ای نیست ✅", "ok");
    if (TP.busy || !R.db) return;
    TP.busy = true; render();
    var bar = el("tpProgI");
    chunkDel(s.keys, function (d, all) {
      if (bar) bar.style.width = Math.round(d * 100 / Math.max(1, all)) + "%";
    }).then(function () {
      TP.busy = false;
      if (R.add) {
        R.add("ownerLog", {
          by: R.ME || "", act: "teamClean", ch: R.teamCh, removed: s.n, days: s.days
        }).catch(function () {});
      }
      toast("🧹 " + fa(s.n) + " پیام قدیمی پاک شد", "ok");
      TP.scan = null;
      render();
    }).catch(function () {
      TP.busy = false;
      toast("پاک‌سازی نیمه‌کاره ماند", "err");
      render();
    });
  }

  /* ── ۷. HTML ────────────────────────────────────────────── */
  function tasksHTML() {
    var arr = taskList();
    var open = arr.filter(function (t) { return t.st !== "done"; });
    var done = arr.filter(function (t) { return t.st === "done"; });
    var h = '<div class="row" style="gap:6px;margin-bottom:8px">' +
      '<input class="inp" id="tpTaskIn" maxlength="120" placeholder="وظیفهٔ تازه برای تیم…">' +
      '<button class="btn p mini" data-tp="addtask">افزودن</button></div>';

    h += open.length ? open.map(function (t) {
      return '<div class="tpTask"><div class="grow"><div class="t sm b">' + esc(t.title) + "</div>" +
        '<div class="xs mut">' + esc(t.byName || "تیم") + (t.t && R.time ? " • " + R.time(t.t) : "") + "</div></div>" +
        '<button class="btn ok mini" data-tp-done="' + t.id + '">✔</button>' +
        '<button class="btn d mini" data-tp-del="' + t.id + '">🗑</button></div>';
    }).join("") : '<div class="empty">وظیفهٔ بازی نیست — یکی اضافه کن ✍️</div>';

    if (done.length) {
      h += '<div class="xs mut mt mb">انجام‌شده‌ها (' + fa(done.length) + ")</div>" +
        done.slice(0, 12).map(function (t) {
          return '<div class="tpTask done"><div class="grow"><div class="t sm">' + esc(t.title) + "</div></div>" +
            '<button class="btn mini" data-tp-open="' + t.id + '">↺</button>' +
            '<button class="btn d mini" data-tp-del="' + t.id + '">🗑</button></div>';
        }).join("");
    }
    return h;
  }

  function teamHTML() {
    var list = staffList();
    if (!list.length) {
      return '<div class="empty">عضو تیمی پیدا نشد — دسترسی‌ها را از پنل مالک بده 👑</div>' +
        '<div class="xs mut mt">اعضای تیم کسانی هستند که نقش مدیر/ناظر یا دسترسی ویژه دارند.</div>';
    }
    return list.map(function (u) {
      var perm = [];
      var p = u.perms || {};
      ["mod", "news", "anime", "market", "team"].forEach(function (k) { if (p[k]) perm.push(k); });
      return '<div class="tpRow">' + (R.avHTML ? R.avHTML(u, "sm") : "") +
        '<div class="grow" style="min-width:0"><div class="sm b ellip">' +
        esc(u.name || "کاربر") + (u.prem ? " 💎" : "") + "</div>" +
        '<div class="xs mut">' + esc(R.roleFa ? R.roleFa(u.role) : (u.role || "کاربر")) +
        (perm.length ? " • " + esc(perm.join("، ")) : "") + "</div></div>" +
        (u.uid !== R.ME ? '<button class="btn mini" data-tp-dm="' + esc(u.uid) + '">💬</button>' : "") +
        "</div>";
    }).join("");
  }

  function noteHTML() {
    var n = TP.note;
    var h = "";
    if (n && n.text) {
      h += '<div class="tpNote mb">📌 ' + esc(n.text) +
        '<div class="xs mut mt">' + esc(n.byName || "تیم") +
        (n.t && R.time ? " • " + R.time(n.t) : "") + "</div></div>" +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
        '<button class="btn mini" data-tp="clearnote">پاک کردن یادداشت</button></div>';
    }
    h += '<input class="inp mb" id="tpNoteIn" maxlength="240" placeholder="یادداشت ثابت تیم (بالای کانال)…" value="' +
      esc(n && n.text ? n.text : "") + '">' +
      '<button class="btn p mini mb" data-tp="savenote">ذخیره یادداشت</button>';

    h += '<div class="tpAlert mt"><div class="sm b mb">🚨 هشدار سریع به تیم</div>' +
      '<div class="xs mut mb">برای همهٔ اعضای تیم اعلان می‌فرستد و در کانال هم ثبت می‌شود.</div>' +
      '<input class="inp mb" id="tpAlertIn" maxlength="140" placeholder="مثلاً: اسپم در انجمن، سریع رسیدگی کن">' +
      '<button class="btn d mini" data-tp="alert">ارسال هشدار</button></div>';
    return h;
  }

  function cleanHTML() {
    var s = TP.scan;
    var h = '<div class="between mb"><div><div class="sm b">🧹 پاک‌سازی کانال</div>' +
      '<div class="xs mut">فقط پیام‌های همین کانال (' + esc(R.teamCh || "—") + ") که قدیمی‌تر از بازه باشند.</div></div>" +
      '<select class="inp mini" id="tpDays" style="max-width:120px">' +
      [7, 30, 60, 90].map(function (d) {
        return '<option value="' + d + '"' + (d === TP.days ? " selected" : "") + ">قدیمی‌تر از " + d + " روز</option>";
      }).join("") + "</select></div>";

    if (!s) {
      h += '<button class="btn mini p" data-tp="scan"' + (TP.busy ? " disabled" : "") + ">🔎 بررسی کن</button>";
    } else {
      h += '<div class="tpRow"><span>پیام‌های قدیمی کانال</span><b class="' + (s.n ? "bad" : "") + '">' +
        fa(s.n) + "</b></div>" +
        '<div class="row mt" style="gap:7px;flex-wrap:wrap">' +
        '<button class="btn mini d" data-tp="run"' + (!s.n || TP.busy ? " disabled" : "") + ">🗑 حذف " + fa(s.n) + " پیام</button>" +
        '<button class="btn mini" data-tp="scan"' + (TP.busy ? " disabled" : "") + ">↺ بررسی دوباره</button></div>";
    }
    h += '<div class="mt" style="height:6px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden">' +
      '<i id="tpProgI" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#7c5cff,#22d3ee)"></i></div>';
    h += '<div class="xs mut mt">اعلان‌های شخصی دست نمی‌خورند؛ برای آن‌ها از «پنل مالک → 🛠 نگهداری» استفاده کن.</div>';
    return h;
  }

  function render() {
    var c = el("tpCard");
    if (!c || !can()) return;
    var body = (TP.tab === "team") ? teamHTML()
      : (TP.tab === "note") ? noteHTML()
      : (TP.tab === "clean") ? cleanHTML()
      : tasksHTML();
    c.innerHTML =
      '<div class="between mb"><div><div class="sm b">🛡 پنل فرماندهی</div>' +
      '<div class="xs mut">ابزارهای تیم — فقط اعضای شبکه فرماندهی</div></div>' +
      '<span class="chip cy">' + (R.ownerTab === "maint" ? "" : "") + "تیم" + "</span></div>" +
      tabsHTML() +
      '<div id="tpBody">' + body + "</div>" +
      statsHTML();
  }

  /* ── ۸. کلیک‌ها ─────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest || !el("tpCard")) return;

    var tab = t.closest("[data-tp-tab]");
    if (tab) {
      e.preventDefault();
      TP.tab = tab.getAttribute("data-tp-tab");
      render();
      return;
    }
    var dm = t.closest("[data-tp-dm]");
    if (dm) {
      e.preventDefault();
      if (R.dmOpen) R.dmOpen(dm.getAttribute("data-tp-dm"));
      return;
    }
    var dn = t.closest("[data-tp-done]");
    if (dn) { e.preventDefault(); return taskSet(dn.getAttribute("data-tp-done"), "done"); }
    var op = t.closest("[data-tp-open]");
    if (op) { e.preventDefault(); return taskSet(op.getAttribute("data-tp-open"), "open"); }
    var dl = t.closest("[data-tp-del]");
    if (dl) { e.preventDefault(); return taskDel(dl.getAttribute("data-tp-del")); }

    var b = t.closest("[data-tp]");
    if (!b) return;
    e.preventDefault();
    var a = b.getAttribute("data-tp");
    if (a === "addtask") addTask();
    else if (a === "savenote") saveNote();
    else if (a === "clearnote") clearNote();
    else if (a === "alert") alertTeam();
    else if (a === "scan") {
      var sel = el("tpDays");
      TP.days = sel ? (parseInt(sel.value, 10) || 30) : TP.days;
      TP.busy = true; render();
      scanChannel(TP.days).then(function () { TP.busy = false; render(); });
    } else if (a === "run") runClean();
  });

  /* Enter در فیلد وظیفه */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || !el("tpCard")) return;
    if (e.target && e.target.id === "tpTaskIn") { e.preventDefault(); addTask(); }
  });

  /* ── ۹. راه‌اندازی + هم‌گام با کانال ────────────────────── */
  function boot() {
    if (!can() || !el("sec-team")) return;
    css();
    card();
    Promise.all([loadUsers(), loadTasks(), loadNote()]).then(render, render);
  }

  /* با عوض شدن کانال، شمارنده‌ها و اسکن ریست می‌شوند */
  var on0 = R.teamOn;
  if (typeof on0 === "function") {
    R.teamOn = function () {
      TP.scan = null;
      var out = on0.apply(this, arguments);
      setTimeout(render, 60);
      return out;
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [900, 2200, 4500].forEach(function (ms) { setTimeout(boot, ms); });

  var pIn = R.onLogin;
  R.onLogin = function () {
    if (pIn) { try { pIn(); } catch (e) {} }
    setTimeout(boot, 900);
  };
  var pOut = R.onLogout;
  R.onLogout = function () {
    if (pOut) { try { pOut(); } catch (e) {} }
    TP.users = null; TP.tasks = null; TP.note = null; TP.scan = null;
    var c = el("tpCard");
    if (c) c.innerHTML = "";
  };
})();

/* ───────── بخش ۲: چیدمان مرکز فرماندهی ───────── */
/* ═══════════════════════════════════════════════════════════════
   بخش ۳ — چیدمان «مرکز فرماندهی» (Command Deck)
   - چیدمان دو ستونی: کانال بزرگ + ستون ابزار کنارش
   - نوار HUD با آمار زنده، آواتار تیم و دکمه‌های سریع
   - ری‌استایل کامل هدر/تب‌ها/کانال/نوار نوشتن (فقط #sec-team)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__tpx) return;
  R.__tpx = true;

  var T = { built: 0 };

  function el(i) { return document.getElementById(i); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function can() {
    try {
      return !!(R.isOwner && R.isOwner()) || !!(R.isStaff && R.isStaff()) || !!R.team;
    } catch (e) { return false; }
  }
  function isStaffUser(u) {
    if (!u) return false;
    if (u.role === "admin" || u.role === "mod") return true;
    var p = u.perms || {};
    return !!(p.mod || p.news || p.anime || p.market || p.team);
  }

  /* ── ۱. استایل ──────────────────────────────────────────── */
  function css() {
    if (el("tpxCss")) return;
    var s = document.createElement("style");
    s.id = "tpxCss";
    s.textContent = [
      "#sec-team{--tx1:#ff5470;--tx2:#ffb03a;--txln:rgba(255,110,140,.28)}",

      /* هدر */
      "#sec-team>.head{position:relative;padding:14px 16px;border-radius:22px;overflow:hidden;" +
        "border:1px solid rgba(255,120,150,.22);" +
        "background:radial-gradient(120% 140% at 100% 0%,rgba(255,84,112,.32),transparent 60%)," +
        "radial-gradient(90% 120% at 0% 100%,rgba(255,176,58,.16),transparent 62%)," +
        "linear-gradient(180deg,rgba(28,14,22,.95),rgba(10,7,14,.97));" +
        "box-shadow:0 26px 60px -40px rgba(255,84,112,.55)}",
      "#sec-team>.head .h2{font-size:17px;letter-spacing:-.2px}",
      "#sec-team>.head .chip{background:rgba(255,84,112,.14)!important;" +
        "border:1px solid rgba(255,120,150,.45)!important;color:#ffd0d9!important}",

      /* شبکهٔ دوستونی */
      "#sec-team .tpxWrap{display:grid;grid-template-columns:minmax(0,1fr) 312px;" +
        "gap:12px;align-items:start;margin-top:12px}",
      "#sec-team .tpxMain{min-width:0;display:flex;flex-direction:column;gap:10px}",
      "#sec-team .tpxSide{display:flex;flex-direction:column;gap:10px;position:sticky;top:84px}",

      /* تب کانال‌ها */
      "#sec-team #teamTabs{display:flex;gap:6px;flex-wrap:wrap;margin:0!important;" +
        "padding:6px;border-radius:16px;background:rgba(12,8,16,.7);" +
        "border:1px solid rgba(255,120,150,.16)}",
      "#sec-team #teamTabs .tab{flex:1 1 auto;text-align:center;padding:8px 12px!important;" +
        "border-radius:11px!important;font-size:11.5px;font-weight:800;cursor:pointer;" +
        "color:#c9b9c4;border:1px solid transparent;transition:.2s}",
      "#sec-team #teamTabs .tab:hover{color:#fff;background:rgba(255,255,255,.05)}",
      "#sec-team #teamTabs .tab.on{color:#1a070d;" +
        "background:linear-gradient(135deg,var(--tx2),var(--tx1));" +
        "box-shadow:0 10px 24px -12px var(--tx1)}",

      /* کانال */
      "#sec-team .chat{position:relative;height:clamp(420px,calc(100dvh - 330px),660px)!important;" +
        "border-radius:22px!important;overflow:hidden;" +
        "border:1px solid rgba(255,120,150,.2)!important;" +
        "background:linear-gradient(180deg,rgba(20,10,18,.96),rgba(7,5,11,.98))!important;" +
        "box-shadow:0 30px 70px -46px rgba(255,84,112,.7),inset 0 1px 0 rgba(255,255,255,.04)!important}",
      "#sec-team .chead{padding:11px 14px!important;gap:8px;border-bottom:1px solid rgba(255,120,150,.16)!important;" +
        "background:linear-gradient(180deg,rgba(40,16,26,.9),rgba(16,8,16,.5))!important}",
      "#sec-team .chead b.sm{display:inline-flex;align-items:center;gap:7px;font-size:12.5px!important;" +
        "font-weight:900!important;color:#ffe6ec!important}",
      "#sec-team .chead b.sm::before{content:\"\";width:7px;height:7px;border-radius:50%;" +
        "background:var(--tx1);box-shadow:0 0 10px var(--tx1);animation:tpxPulse 2s infinite}",
      "@keyframes tpxPulse{0%,100%{opacity:1}50%{opacity:.35}}",
      "#sec-team .chead .xs.mut{font-size:9.5px!important;padding:2px 8px;border-radius:99px;" +
        "background:rgba(255,84,112,.12);border:1px solid rgba(255,120,150,.28);color:#ffc2ce!important}",
      "#sec-team .cbody{padding:14px 12px 10px!important;gap:10px!important;scrollbar-width:thin;" +
        "scrollbar-color:rgba(255,84,112,.5) transparent}",
      "#sec-team .cbody::-webkit-scrollbar{width:6px}",
      "#sec-team .cbody::-webkit-scrollbar-thumb{border-radius:99px;" +
        "background:linear-gradient(180deg,var(--tx1),var(--tx2))}",
      "#sec-team .cpmsg .bub{border-radius:16px 16px 16px 6px!important;font-size:13px!important;" +
        "background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.03))!important;" +
        "border:1px solid rgba(255,140,160,.18)!important}",
      "#sec-team .cpmsg.me .bub{background:linear-gradient(135deg,rgba(255,84,112,.5),rgba(255,176,58,.28))!important;" +
        "border-color:rgba(255,150,120,.4)!important;border-radius:16px 16px 6px 16px!important}",
      "#sec-team .cpmsg .av{border-radius:12px!important;box-shadow:0 0 0 1px rgba(255,120,150,.35)!important}",
      "#sec-team .cp2sep b{background:rgba(255,84,112,.14)!important;color:#ffcdd6!important;" +
        "border:1px solid rgba(255,120,150,.3)!important}",

      /* نوار نوشتن */
      "#sec-team .cbar{margin:4px 10px 10px!important;padding:6px!important;gap:6px!important;" +
        "border-radius:18px!important;border:1px solid rgba(255,120,150,.26)!important;" +
        "background:linear-gradient(180deg,rgba(34,14,24,.95),rgba(12,7,12,.96))!important;" +
        "box-shadow:0 16px 36px -24px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.05)!important}" +
        "transition:border-color .2s,box-shadow .2s}",
      "#sec-team .cbar:focus-within{border-color:rgba(255,176,58,.6)!important;" +
        "box-shadow:0 0 0 3px rgba(255,84,112,.12)!important}",
      "#sec-team .cbar input{height:42px;background:transparent!important;border:0!important;" +
        "box-shadow:none!important;font-size:13px!important}",
      "#sec-team .cbar #teamSend{min-width:72px;height:42px!important;border-radius:14px!important;" +
        "font-weight:900;color:#1a070d!important;border:0!important;" +
        "background:linear-gradient(135deg,var(--tx2),var(--tx1))!important;" +
        "box-shadow:0 12px 26px -12px var(--tx1)!important;transition:transform .16s}",
      "#sec-team .cbar #teamSend:hover{transform:translateY(-1px) scale(1.03)}",
      "#sec-team .cbar #teamSend:active{transform:scale(.95)}",

      /* HUD */
      ".tpxHud{border-radius:20px;padding:12px;position:relative;overflow:hidden;" +
        "border:1px solid rgba(255,120,150,.22);" +
        "background:radial-gradient(120% 100% at 100% 0%,rgba(255,84,112,.2),transparent 62%)," +
        "linear-gradient(180deg,rgba(28,14,22,.95),rgba(10,7,14,.97))}",
      ".tpxHud .tpxTop{display:flex;align-items:center;justify-content:space-between;gap:8px}",
      ".tpxHud .tpxTop b{font-size:12.5px;color:#ffe6ec;letter-spacing:.2px}",
      ".tpxHud .tpxDot{width:7px;height:7px;border-radius:50%;background:#3ddf9b;" +
        "box-shadow:0 0 10px #3ddf9b;animation:tpxPulse 2s infinite}",
      ".tpxKpis{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 8px}",
      ".tpxKpis>div{padding:8px 4px;text-align:center;border-radius:12px;" +
        "background:rgba(255,255,255,.05);border:1px solid rgba(255,140,160,.16)}",
      ".tpxKpis b{display:block;font-size:15px;font-weight:900;" +
        "background:linear-gradient(135deg,#fff,var(--tx2));-webkit-background-clip:text;background-clip:text;color:transparent}",
      ".tpxKpis span{font-size:8.5px;color:#bfaeb8;letter-spacing:.2px}",
      ".tpxAvs{display:flex;margin:2px 0 10px}",
      ".tpxAvs .av{width:26px!important;height:26px!important;font-size:10px!important;margin-inline-start:-7px;" +
        "border-radius:9px!important;box-shadow:0 0 0 2px rgba(12,7,14,.95)!important}",
      ".tpxAvs .av:first-child{margin-inline-start:0}",
      ".tpxAvs .tpxMore{width:26px;height:26px;border-radius:9px;margin-inline-start:-7px;" +
        "display:grid;place-items:center;font-size:9px;font-weight:900;color:#ffd9e0;" +
        "background:rgba(255,84,112,.2);border:1px solid rgba(255,120,150,.35)}",
      ".tpxActs{display:grid;grid-template-columns:1fr 1fr;gap:6px}",
      ".tpxActs button{cursor:pointer;padding:9px 6px;border-radius:12px;font-size:10.5px;font-weight:800;" +
        "font-family:inherit;color:#ffe6ec;background:rgba(255,255,255,.06);" +
        "border:1px solid rgba(255,140,160,.24);transition:.18s}",
      ".tpxActs button:hover{border-color:var(--tx2);transform:translateY(-1px)}",
      ".tpxActs button.wide{grid-column:1/-1}",
      ".tpxCh{margin-top:8px;font-size:9.5px;color:#a998a4;display:flex;justify-content:space-between}" +
      ".tpxCh b{color:#ffd9e0;font-weight:800}",

      /* کارت ابزار داخل ستون */
      "#sec-team .tpxSide #tpCard{margin:0!important;border-radius:20px!important;" +
        "border:1px solid rgba(255,120,150,.18)!important;" +
        "background:linear-gradient(180deg,rgba(22,12,20,.96),rgba(8,6,12,.98))!important}",
      "#sec-team .tpxSide #tpCard .tabs{flex-wrap:wrap;gap:5px}",
      "#sec-team .tpxSide #tpCard .tab{flex:1 1 44%;font-size:10.5px;padding:6px 8px;border-radius:9px}",
      "#sec-team .tpxSide #tpCard .inp{height:38px;font-size:12px}",

      /* موبایل */
      "@media(max-width:900px){" +
        "#sec-team .tpxWrap{grid-template-columns:1fr}" +
        "#sec-team .tpxSide{position:static}" +
        "#sec-team .chat{height:clamp(380px,60dvh,560px)!important}" +
        "}",
      "@media(max-width:560px){" +
        "#sec-team .tpxSide #tpCard .tab{flex:1 1 auto}" +
        ".tpxActs{grid-template-columns:1fr 1fr 1fr}" +
        "}",

      "@media(prefers-reduced-motion:reduce){" +
        ".tpxHud .tpxDot,#sec-team .chead b.sm::before{animation:none!important}" +
        "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ── ۲. HUD ──────────────────────────────────────────────── */
  function hud() {
    var d = document.createElement("div");
    d.className = "tpxHud";
    d.innerHTML =
      '<div class="tpxTop"><b>🛡 مرکز فرماندهی</b><span class="tpxDot"></span></div>' +
      '<div class="tpxKpis">' +
        '<div><b data-tpx-k="msg">۰</b><span>پیام کانال</span></div>' +
        '<div><b data-tpx-k="mem">۰</b><span>عضو تیم</span></div>' +
        '<div><b data-tpx-k="task">۰</b><span>وظیفه باز</span></div>' +
      "</div>" +
      '<div class="tpxAvs" data-tpx-avs></div>' +
      '<div class="tpxActs">' +
        '<button type="button" data-tpx-act="alert">🚨 هشدار تیم</button>' +
        '<button type="button" data-tpx-act="clean">🧹 پاک‌سازی</button>' +
        '<button type="button" class="wide" data-tpx-act="reload">↺ تازه‌سازی کانال</button>' +
      "</div>" +
      '<div class="tpxCh"><span>کانال جاری</span><b data-tpx-ch>—</b></div>';
    return d;
  }

  function staff() {
    var U = R.USERS || {};
    return Object.keys(U).filter(function (k) { return isStaffUser(U[k]); })
      .map(function (k) { var u = U[k]; u.uid = k; return u; });
  }

  function paint() {
    var sec = el("sec-team");
    if (!sec) return;
    var msgs = Object.keys(R.TEAM || {}).length;
    var mem = staff();
    var tasks = sec.querySelectorAll("#tpCard .tpTask:not(.done)").length;
    sec.querySelectorAll("[data-tpx-k]").forEach(function (n) {
      var k = n.getAttribute("data-tpx-k");
      n.textContent = fa(k === "msg" ? msgs : k === "mem" ? mem.length : tasks);
    });
    var ch = sec.querySelector("[data-tpx-ch]");
    if (ch) ch.textContent = R.teamCh || "—";

    var box = sec.querySelector("[data-tpx-avs]");
    if (box) {
      var sig = mem.slice(0, 6).map(function (u) { return u.uid + ":" + (u.name || ""); }).join("|");
      if (box.getAttribute("data-sig") !== sig) {
        box.setAttribute("data-sig", sig);
        var h = mem.slice(0, 6).map(function (u) {
          return R.avHTML ? R.avHTML(u, "sm") : "";
        }).join("");
        if (mem.length > 6) h += '<span class="tpxMore">+' + fa(mem.length - 6) + "</span>";
        if (!mem.length) h = '<span class="xs mut">عضوی ثبت نشده</span>';
        box.innerHTML = h;
      }
    }
  }

  /* ── ۳. ساخت چیدمان ─────────────────────────────────────── */
  function build() {
    var sec = el("sec-team");
    if (!sec || !can()) return;
    var head = null, chat = null;
    Array.prototype.forEach.call(sec.children, function (n) {
      if (n.classList.contains("head")) head = n;
      if (!chat && n.classList.contains("chat")) chat = n;
    });
    if (!chat) chat = sec.querySelector(".chat");
    if (!head || !chat) return;

    var wrap = sec.querySelector(".tpxWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "tpxWrap";
      var main = document.createElement("div");
      main.className = "tpxMain";
      var side = document.createElement("div");
      side.className = "tpxSide";
      wrap.appendChild(main);
      wrap.appendChild(side);
      head.parentNode.insertBefore(wrap, head.nextSibling);
      var tabs = el("teamTabs");
      if (tabs && tabs.parentNode !== main) main.appendChild(tabs);
      if (chat.parentNode !== main) main.appendChild(chat);
      T.built++;
    }

    var main2 = wrap.querySelector(".tpxMain");
    var side2 = wrap.querySelector(".tpxSide");
    if (!side2.querySelector(".tpxHud")) side2.appendChild(hud());

    var card = el("tpCard");
    if (card && card.parentNode !== side2) side2.appendChild(card);

    var tabs2 = el("teamTabs");
    if (tabs2 && tabs2.parentNode !== main2) main2.insertBefore(tabs2, main2.firstChild);

    paint();
  }

  /* ── ۴. کلیک‌های HUD ────────────────────────────────────── */
  function openTab(name) {
    var t = document.querySelector('#tpCard [data-tp-tab="' + name + '"]');
    if (t) { t.click(); return true; }
    return false;
  }

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-tpx-act]") : null;
    if (!b || !el("tpxCard") && !el("sec-team")) return;
    if (!el("sec-team") || !el("sec-team").contains(b)) return;
    e.preventDefault();
    var a = b.getAttribute("data-tpx-act");
    if (a === "alert") { if (!openTab("note")) if (R.toast) R.toast("پنل تیم آماده نیست", "err"); }
    else if (a === "clean") { if (!openTab("clean")) if (R.toast) R.toast("پنل تیم آماده نیست", "err"); }
    else if (a === "reload") {
      try {
        if (R.teamOn && R.teamCh) R.teamOn(R.teamCh);
        if (R.renderTeam) R.renderTeam();
        paint();
        if (R.toast) R.toast("↺ کانال تازه شد", "ok");
      } catch (er) {}
    }
  });

  /* ── ۵. هم‌گام با رندرها ────────────────────────────────── */
  if (typeof R.renderTeam === "function") {
    var rt0 = R.renderTeam;
    R.renderTeam = function () {
      var out = rt0.apply(R, arguments);
      setTimeout(paint, 30);
      return out;
    };
  }
  if (typeof R.teamOn === "function") {
    var to0 = R.teamOn;
    R.teamOn = function () {
      var out = to0.apply(R, arguments);
      setTimeout(function () { build(); paint(); }, 80);
      return out;
    };
  }
  var go0 = R.go;
  if (typeof go0 === "function") {
    R.go = function (name) {
      var out = go0.apply(R, arguments);
      if (String(name) === "team") setTimeout(function () { build(); paint(); }, 160);
      return out;
    };
  }

  function boot() {
    if (!can() || !el("sec-team")) return;
    css();
    build();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [400, 1200, 2500, 4500].forEach(function (ms) { setTimeout(boot, ms); });

  var lg = R.onLogin;
  R.onLogin = function () {
    if (lg) { try { lg(); } catch (e) {} }
    setTimeout(boot, 700);
  };
  var lo = R.onLogout;
  R.onLogout = function () {
    if (lo) { try { lo(); } catch (e) {} }
    var h = el("sec-team") && el("sec-team").querySelector("[data-tpx-k]");
    if (h) paint();
  };

  R.teamUltra = { ver: "v1", build: build, paint: paint, hud: hud };
  try { console.log("[Ronin] team-ultra v1 ✓"); } catch (e) {}
})();
