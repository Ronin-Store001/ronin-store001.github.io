/* ═══ RONIN INBOX v1 — صندوق پیام خصوصی + گروه‌ها در نوار گوشی ═══ */
"use strict";
(function () {
  if (!window.R || R.__inbox) return;
  R.__inbox = true;

  var BOX = {};
  var NAMES = {};
  var listRef = null;

  function el(id) { return document.getElementById(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(n) { return parseInt(n, 10) || 0; }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("inboxCss")) return;
    var s = document.createElement("style");
    s.id = "inboxCss";
    s.textContent =
      "#dmBox.inbox{display:flex;flex-direction:column;gap:7px;padding:2px 0}" +
      ".dmi{display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:14px;" +
        "cursor:pointer;background:rgba(9,12,30,.55);border:1px solid var(--ln2);transition:.16s}" +
      ".dmi:hover{transform:translateY(-2px);border-color:rgba(34,211,238,.45);" +
        "box-shadow:0 12px 26px rgba(0,0,0,.45)}" +
      ".dmi .dmtx{flex:1 1 auto;min-width:0}" +
      ".dmi .dmnm{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
      ".dmi .dmlast{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}" +
      ".dmi .un{min-width:20px;height:20px;padding:0 6px;border-radius:10px;display:grid;" +
        "place-items:center;font-size:11px;font-weight:800;color:#04060f;" +
        "background:linear-gradient(135deg,#2fe6ff,#8b5cff)}" +
      ".dmi.has .dmnm b{color:#fff}" +
      "#sec-dm.list .cbar{display:none}" +
      "#sec-dm.list #dmBox{height:auto;max-height:none;overflow:visible}" +
      "#dmBack{margin-inline-end:8px}" +
      "#dock .ditem-badge{position:absolute;top:2px;inset-inline-end:14px;min-width:15px;height:15px;" +
        "border-radius:8px;font-size:9px;font-weight:800;color:#04060f;display:grid;place-items:center;" +
        "background:linear-gradient(135deg,#2fe6ff,#8b5cff)}" +
      "@media (max-width:400px){#dock a{font-size:7.6px}#dock a i{font-size:15px}}";
    document.head.appendChild(s);
  }

  /* ── ۲. آیتم‌های منو ─────────────────────────────────────── */
  function badge() {
    var b = document.createElement("span");
    b.className = "ditem-badge hide";
    b.setAttribute("data-dmcount", "1");
    return b;
  }

  function ensureNav() {
    /* نوار پایین گوشی */
    var dwrap = document.querySelector("#dock .dwrap");
    if (dwrap) {
      var me = dwrap.querySelector('[data-go="profile"]');
      if (!dwrap.querySelector('[data-go="groups"]')) {
        var g = document.createElement("a");
        g.setAttribute("data-go", "groups");
        g.innerHTML = "<i>🏯</i>گروه‌ها";
        if (me && me.parentNode) me.parentNode.insertBefore(g, me);
        else dwrap.appendChild(g);
      }
      if (!dwrap.querySelector('[data-go="dm"]')) {
        var d = document.createElement("a");
        d.setAttribute("data-go", "dm");
        d.innerHTML = "<i>📥</i>پیام‌ها";
        d.appendChild(badge());
        if (me && me.parentNode) me.parentNode.insertBefore(d, me);
        else dwrap.appendChild(d);
      }
    }

    /* منوی کنار (دسکتاپ) */
    var rail = el("rail");
    if (rail) {
      if (!rail.querySelector('[data-go="dm"]')) {
        var rd = document.createElement("div");
        rd.className = "ditem";
        rd.setAttribute("data-go", "dm");
        rd.innerHTML = "<i>📥</i>پیام‌ها";
        rd.appendChild(badge());
        var chat = rail.querySelector('[data-go="chat"]');
        if (chat && chat.parentNode) chat.parentNode.insertBefore(rd, chat.nextSibling);
        else rail.appendChild(rd);
      }
      if (!rail.querySelector('[data-go="groups"]')) {
        var rg = document.createElement("div");
        rg.className = "ditem";
        rg.setAttribute("data-go", "groups");
        rg.innerHTML = "<i>🏯</i>گروه‌های چت";
        var after = rail.querySelector('[data-go="dm"]') || rail.querySelector('[data-go="chat"]');
        if (after && after.parentNode) after.parentNode.insertBefore(rg, after.nextSibling);
        else rail.appendChild(rg);
      }
    }
  }

  /* ── ۳. نوشتن ایندکس گفتگو هنگام ارسال ───────────────────── */
  function indexMsg(key, o) {
    if (!R.db || !o || !o.uid || !o.to) return;
    var a = o.uid, b = o.to;
    if (!a || !b || a === b) return;
    var t = o.t || Date.now();
    var base = {
      t: t, last: String(o.text || "").slice(0, 80),
      from: a, n: o.n || "کاربر", av: o.av || ""
    };

    /* لیست خودم: پیام را دیده‌ام */
    R.db.ref("dmBox/" + a + "/" + b).update({
      t: base.t, last: base.last, from: a,
      n: base.n, av: base.av, unread: 0
    }).catch(function () {});

    /* لیست طرف مقابل: تعداد نخوانده یکی زیاد می‌شود */
    R.db.ref("dmBox/" + b + "/" + a).transaction(function (cur) {
      var c = cur || {};
      c.t = base.t;
      c.last = base.last;
      c.from = a;
      c.n = base.n;
      c.av = base.av;
      c.unread = num(c.unread) + 1;
      return c;
    }).catch(function () {});
  }

  function hookAdd() {
    if (!R.add || R.add.__inboxWrapped) return;
    var orig = R.add;
    var wrapped = function (path, obj) {
      var p = orig.apply(R, arguments);
      try {
        if (/^dm\/[^/]+$/.test(String(path))) indexMsg(String(path).slice(3), obj);
      } catch (e) {}
      return p;
    };
    wrapped.__inboxWrapped = true;
    R.add = wrapped;
  }

  /* ── ۴. لیست گفتگوها ─────────────────────────────────────── */
  function nameOf(uid, cb) {
    if (NAMES[uid]) return cb(NAMES[uid]);
    R.get("users/" + uid).then(function (u) {
      NAMES[uid] = { name: (u && u.name) || "کاربر", av: (u && u.av) || "", avFrame: (u && u.avFrame) || "" };
      cb(NAMES[uid]);
    }).catch(function () { cb({ name: "کاربر", av: "" }); });
  }

  function rowsHTML() {
    var arr = Object.keys(BOX).map(function (u) {
      var e = BOX[u] || {}; e.uid = u; return e;
    }).filter(function (e) { return e && (e.t || e.last); })
      .sort(function (x, y) { return num(y.t) - num(x.t); });

    if (!arr.length) {
      return '<div class="empty">هنوز گفتگویی نداری.<br>' +
        '<span class="xs mut">از فروشگاه روی «پیام» یک آگهی بزن، یا از گروه‌ها/چت عمومی به کاربر پیام بده.</span></div>';
    }

    return arr.map(function (e) {
      var un = num(e.unread);
      var nm = (NAMES[e.uid] && NAMES[e.uid].name) || e.n || "کاربر";
      var av = (NAMES[e.uid] && NAMES[e.uid].av) || e.av || "";
      var fr = (NAMES[e.uid] && NAMES[e.uid].avFrame) || "";
      var pre = e.from === R.ME ? "شما: " : "";
      return '<div class="dmi' + (un ? " has" : "") + '" data-dmopen="' + esc(e.uid) + '">' +
        '<div class="av sm' + (fr ? " fr-" + esc(fr) : "") + '">' +
          (av ? '<img src="' + esc(av) + '" alt="">' : esc(R.initials ? R.initials(nm) : "؟")) +
        "</div>" +
        '<div class="dmtx">' +
          '<div class="dmnm"><b class="sm ellip">' + esc(nm) + "</b>" +
            '<span class="xs mut">' + (e.t && R.time ? esc(R.time(e.t)) : "") + "</span></div>" +
          '<div class="dmlast xs mut">' + esc(pre + String(e.last || "")) + "</div>" +
        "</div>" +
        (un ? '<span class="un">' + esc(fa(un > 99 ? "99+" : un)) + "</span>" : "") +
        "</div>";
    }).join("");
  }

  function paintBadges(unreadTotal) {
    R.qa("[data-dmcount]").forEach(function (b) {
      if (unreadTotal > 0) {
        b.textContent = unreadTotal > 99 ? "99+" : fa(unreadTotal);
        b.classList.remove("hide");
      } else b.classList.add("hide");
    });
  }

  function renderList() {
    var box = el("dmBox");
    if (!box) return;
    box.classList.add("inbox");
    box.innerHTML = R.ME ? rowsHTML()
      : '<div class="empty">برای دیدن پیام‌هایت وارد حساب شو 🔑<br>' +
        '<button class="btn p mini mt" type="button" data-authopen="login">ورود</button></div>';

    var total = 0;
    Object.keys(BOX).forEach(function (u) { total += num(BOX[u].unread); });
    paintBadges(total);

    /* نام‌های نامعلوم را از دیتابیس بگیر */
    Object.keys(BOX).forEach(function (u) {
      if (NAMES[u]) return;
      nameOf(u, function () {
        if (R.dmWith) return;
        var b = el("dmBox");
        if (b && b.classList.contains("inbox")) renderList();
      });
    });
  }

  /* ── ۵. حالت‌ها ──────────────────────────────────────────── */
  function sec() { return el("sec-dm"); }

  function listMode() {
    var s = sec(); if (!s) return;
    s.classList.add("list");
    R.dmWith = null;
    R.DM = {};
    if (R._dmRef) { try { R._dmRef.off(); } catch (e) {} R._dmRef = null; }
    R.setT("dmTitle", "📥 پیام‌ها");
    var back = el("dmBack"); if (back) back.classList.add("hide");
    renderList();
  }

  function convMode() {
    var s = sec(); if (!s) return;
    s.classList.remove("list");
    var box = el("dmBox"); if (box) box.classList.remove("inbox");
    var back = el("dmBack"); if (back) back.classList.remove("hide");
  }

  function markRead(uid) {
    if (!R.db || !R.ME || !uid) return;
    R.db.ref("dmBox/" + R.ME + "/" + uid + "/unread").set(0).catch(function () {});
  }

  /* ── ۶. اتصال به کد موجود ────────────────────────────────── */
  function patchOpen() {
    if (!R.dmOpen || R.dmOpen.__inboxWrapped) return;
    var orig = R.dmOpen;
    var wrapped = function (uid) {
      var out = orig.apply(R, arguments);
      try {
        if (uid) { convMode(); markRead(uid); }
      } catch (e) {}
      return out;
    };
    wrapped.__inboxWrapped = true;
    R.dmOpen = wrapped;
  }

  function patchRender() {
    if (!R.renderDM || R.renderDM.__inboxWrapped) return;
    var orig = R.renderDM;
    var wrapped = function () {
      if (!R.dmWith) return renderList();
      return orig.apply(R, arguments);
    };
    wrapped.__inboxWrapped = true;
    R.renderDM = wrapped;
  }

  function patchHooks() {
    R.hooks = R.hooks || {};
    var prev = R.hooks.dm;
    R.hooks.dm = function () {
      if (prev) { try { prev(); } catch (e) {} }
      ensureNav();
      if (R.dmWith) { convMode(); markRead(R.dmWith); }
      else listMode();
    };
  }

  /* ── ۷. لیسنر ایندکس ────────────────────────────────────── */
  function watchBox() {
    if (!R.db || !R.ME) return;
    if (listRef) return;
    listRef = R.db.ref("dmBox/" + R.ME);
    listRef.on("value", function (s) {
      BOX = s.val() || {};
      if (!R.dmWith && sec() && sec().classList.contains("list")) renderList();
      else {
        var total = 0;
        Object.keys(BOX).forEach(function (u) { total += num(BOX[u].unread); });
        paintBadges(total);
      }
    }, function (e) { console.warn("[Ronin] dmBox:", e.message); });
  }

  function stopBox() {
    if (listRef) { try { listRef.off(); } catch (e) {} listRef = null; }
    BOX = {};
    paintBadges(0);
  }

  /* ── ۸. ساخت اولیه از پیام‌های قدیمی ─────────────────────── */
  function backfill() {
    if (!R.db || !R.ME) return;
    var flag = "dmBf1_" + R.ME;
    try { if (localStorage.getItem(flag)) return; localStorage.setItem(flag, "1"); } catch (e) {}
    if (Object.keys(BOX).length) return;

    R.get("dm").then(function (all) {
      if (!all || typeof all !== "object") return;
      Object.keys(all).forEach(function (k) {
        if (k.indexOf(R.ME) < 0) return;
        var parts = k.split("--");
        if (parts.length !== 2) return;
        var other = parts[0] === R.ME ? parts[1] : parts[0];
        if (!other || other === R.ME) return;
        var msgs = all[k] || {}, last = null;
        Object.keys(msgs).forEach(function (id) {
          var m = msgs[id];
          if (m && m.t && (!last || m.t > last.t)) last = m;
        });
        if (!last) return;
        R.db.ref("dmBox/" + R.ME + "/" + other).transaction(function (cur) {
          if (cur && cur.t) return;  /* از قبل هست */
          return {
            t: last.t, last: String(last.text || "").slice(0, 80),
            from: last.uid || other, n: last.n || "کاربر", av: last.av || "", unread: 0
          };
        }).catch(function () {});
      });
    }).catch(function () {});
  }

  /* ── ۹. راه‌اندازی ──────────────────────────────────────── */
  function boot() {
    css();
    ensureNav();
    patchOpen();
    patchRender();
    patchHooks();
    hookAdd();

    /* دکمهٔ بازگشت به لیست */
    var head = document.querySelector("#sec-dm .head");
    if (head && !el("dmBack")) {
      var b = document.createElement("button");
      b.className = "icobtn";
      b.id = "dmBack";
      b.type = "button";
      b.title = "بازگشت به پیام‌ها";
      b.textContent = "›";
      b.addEventListener("click", function () { listMode(); });
      head.insertBefore(b, head.firstChild);
    }

    if (R.ME) { watchBox(); setTimeout(backfill, 1500); }

    /* کلیک روی گفتگو */
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-dmopen]") : null;
      if (!t) return;
      e.preventDefault();
      var uid = t.getAttribute("data-dmopen");
      if (uid && R.dmOpen) R.dmOpen(uid);
    });

    /* ورود/خروج */
    var prevIn = R.onLogin;
    R.onLogin = function () {
      if (prevIn) { try { prevIn(); } catch (e) {} }
      ensureNav();
      watchBox();
      setTimeout(backfill, 1500);
    };
    var prevOut = R.onLogout;
    R.onLogout = function () {
      if (prevOut) { try { prevOut(); } catch (e) {} }
      stopBox();
      NAMES = {};
      listMode();
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1600);
})();
