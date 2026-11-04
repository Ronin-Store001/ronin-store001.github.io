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
      '<span class="chip cy">تیم</span></div>' +
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
