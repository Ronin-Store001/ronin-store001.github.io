/* ═══ RONIN USERS v1 — لیست کاربران + پروفایل عمومی ═══ */
"use strict";
(function () {
  if (!window.R || R.__users) return;
  R.__users = true;

  var ALL = {};
  var WATCHED = false;
  var q = "";

  function el(id) { return document.getElementById(id); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function num(n) { return parseInt(n, 10) || 0; }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }

  /* ── ۱. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("usrCss")) return;
    var s = document.createElement("style");
    s.id = "usrCss";
    s.textContent =
      "#usrGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}" +
      ".ucard{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;" +
        "padding:14px 10px;border-radius:16px;cursor:pointer;text-align:center;" +
        "background:rgba(9,12,30,.6);border:1px solid var(--ln2);transition:.16s}" +
      ".ucard:hover{transform:translateY(-3px);border-color:rgba(34,211,238,.5);" +
        "box-shadow:0 14px 30px rgba(0,0,0,.5),0 0 20px rgba(139,92,255,.22)}" +
      ".ucard .uname{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".ucard .udot{position:absolute;top:9px;inset-inline-end:10px;width:8px;height:8px;border-radius:50%;" +
        "background:#3ddb9b;box-shadow:0 0 8px rgba(61,219,155,.9)}" +
      ".ucard .uchips{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}" +
      ".ucard .uchips .chip{font-size:9px;padding:1px 7px}" +
      "[data-uopen]{cursor:pointer}" +
      ".ucard:focus-visible,[data-uopen]:focus-visible{outline:2px solid #2fe6ff;outline-offset:2px}";
    document.head.appendChild(s);
  }

  /* ── ۲. بخش کاربران ──────────────────────────────────────── */
  function ensureSection() {
    if (el("sec-users")) return;
    var stage = el("stage");
    if (!stage) return;
    var s = document.createElement("section");
    s.className = "sec";
    s.id = "sec-users";
    s.innerHTML =
      '<div class="head"><h2 class="h2">👥 کاربران رونین</h2>' +
        '<span class="chip cy" id="usrCount">۰ نفر</span></div>' +
      '<div class="card mb"><input class="inp" id="usrQ" placeholder="جستجوی نام کاربر…" maxlength="30"></div>' +
      '<div id="usrGrid"></div>';
    stage.appendChild(s);

    var inp = el("usrQ");
    if (inp) inp.addEventListener("input", function () { q = inp.value; paint(); });
  }

  /* ── ۳. آیتم‌های منو ─────────────────────────────────────── */
  function ensureNav() {
    var rail = el("rail");
    if (rail && !rail.querySelector('[data-go="users"]')) {
      var it = document.createElement("div");
      it.className = "ditem";
      it.setAttribute("data-go", "users");
      it.innerHTML = "<i>👥</i>کاربران";
      var anchor = rail.querySelector('[data-go="dm"]') || rail.querySelector('[data-go="chat"]');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(it, anchor.nextSibling);
      else rail.appendChild(it);
    }

    /* دکمه در انجمن و پروفایل (روی گوشی هم دیده می‌شود) */
    ["sec-community", "sec-profile"].forEach(function (id) {
      var head = document.querySelector("#" + id + " .head");
      if (!head || head.querySelector('[data-go="users"]')) return;
      var b = document.createElement("button");
      b.className = "btn mini";
      b.type = "button";
      b.setAttribute("data-go", "users");
      b.textContent = "👥 کاربران";
      head.appendChild(b);
    });
  }

  /* ── ۴. خواندن کاربران ──────────────────────────────────── */
  function load() {
    if (!R.db || !R.ME || WATCHED) return;
    WATCHED = true;
    R.db.ref("users").on("value", function (s) {
      ALL = s.val() || {};
      if (el("sec-users") && el("sec-users").classList.contains("on")) paint();
      paintCount();
    }, function (e) { console.warn("[Ronin] users:", e.message); });
  }

  function paintCount() {
    var c = el("usrCount");
    if (c) c.textContent = fa(Object.keys(ALL).length) + " نفر";
  }

  /* ── ۵. کارت‌ها ─────────────────────────────────────────── */
  function cardHTML(uid, u) {
    u = u || {};
    var on = !!(R.ONLINE && R.ONLINE[uid]);
    var lv = R.level ? R.level(u.xp || 0) : 1;
    var chips = '<span class="chip">' + esc(R.roleFa ? R.roleFa(u.role || "user") : "کاربر") + "</span>" +
      '<span class="chip cy">سطح ' + esc(fa(lv)) + "</span>" +
      (u.prem ? '<span class="chip gd">💎</span>' : "");
    return '<div class="ucard" data-uopen="' + esc(uid) + '" role="button" tabindex="0">' +
      (on ? '<span class="udot" title="آنلاین"></span>' : "") +
      (R.avHTML ? R.avHTML({ name: u.name, av: u.av, avFrame: u.avFrame }, "md")
                : '<div class="av md">' + esc((u.name || "؟").slice(0, 1)) + "</div>") +
      '<b class="sm uname">' + esc(u.name || "کاربر") + "</b>" +
      (u.bio ? '<div class="xs mut uname">' + esc(u.bio) + "</div>" : "") +
      '<div class="uchips">' + chips + "</div></div>";
  }

  function paint() {
    var grid = el("usrGrid");
    if (!grid) return;
    paintCount();
    var ids = Object.keys(ALL);
    if (!ids.length) {
      grid.innerHTML = '<div class="empty">' +
        (R.ME ? "در حال خواندن کاربران…" : "برای دیدن کاربران وارد حساب شو 🔑") + "</div>";
      return;
    }
    var needle = String(q || "").trim().toLowerCase();
    ids = ids.filter(function (id) {
      var u = ALL[id] || {};
      return !needle || String(u.name || "").toLowerCase().indexOf(needle) > -1;
    });

    ids.sort(function (a, b) {
      var A = ALL[a] || {}, B = ALL[b] || {};
      var oa = (R.ONLINE && R.ONLINE[a]) ? 1 : 0, ob = (R.ONLINE && R.ONLINE[b]) ? 1 : 0;
      if (oa !== ob) return ob - oa;
      if (!!A.prem !== !!B.prem) return B.prem ? 1 : -1;
      return num(B.xp) - num(A.xp);
    });

    if (!ids.length) {
      grid.innerHTML = '<div class="empty">کاربری با این نام پیدا نشد</div>';
      return;
    }
    grid.innerHTML = ids.map(function (id) { return cardHTML(id, ALL[id]); }).join("");
  }

  /* ── ۶. پروفایل عمومی ───────────────────────────────────── */
  function openProfile(uid) {
    if (!uid) return;
    if (typeof R.renderProfile !== "function") return;
    R.VIEW = uid;
    R.renderProfile(uid);
    R.go("profile");
    setTimeout(syncBack, 60);
  }

  function syncBack() {
    var b = el("profBack");
    if (!b) return;
    var other = !!(R.VIEW && R.ME && R.VIEW !== R.ME);
    b.classList.toggle("hide", !other);
    var t = document.querySelector("#sec-profile .head .h2");
    if (t) t.textContent = other ? "👤 پروفایل کاربر" : "👤 پروفایل";
  }

  function ensureBack() {
    var head = document.querySelector("#sec-profile .head");
    if (head && !el("profBack")) {
      var b = document.createElement("button");
      b.className = "icobtn hide";
      b.id = "profBack";
      b.type = "button";
      b.title = "بازگشت به کاربران";
      b.textContent = "›";
      b.addEventListener("click", function () { R.go("users"); });
      head.insertBefore(b, head.firstChild);
    }
  }

  /* ── ۷. کلیک‌ها ─────────────────────────────────────────── */
  function bindClicks() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-uopen]") : null;
      if (!t) return;
      if (e.target.closest && e.target.closest("[data-follow],[data-dmto]")) return;
      e.preventDefault();
      openProfile(t.getAttribute("data-uopen"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var t = e.target.closest ? e.target.closest("[data-uopen]") : null;
      if (!t) return;
      e.preventDefault();
      openProfile(t.getAttribute("data-uopen"));
    });
  }

  /* ── ۸. کلیک‌پذیر کردن اسم نویسنده‌ها ────────────────────── */
  function wrapPostCard() {
    if (!R.postCard || R.postCard.__usersWrapped) return;
    var orig = R.postCard;
    var wrapped = function (p) {
      var node = orig.apply(R, arguments);
      try {
        if (node && node.querySelector && p && p.uid) {
          var av = node.querySelector(".av");
          if (av) av.setAttribute("data-uopen", p.uid);
          var nm = node.querySelector(".grow b");
          if (nm) nm.setAttribute("data-uopen", p.uid);
        }
      } catch (e) {}
      return node;
    };
    wrapped.__usersWrapped = true;
    R.postCard = wrapped;
  }

  function wrapChatRow() {
    if (!R.chatRow || R.chatRow.__usersWrapped) return;
    var orig = R.chatRow;
    var wrapped = function (m, path) {
      var h = orig.apply(R, arguments);
      try {
        if (typeof h === "string" && m && m.uid && m.uid !== R.ME) {
          h = h.replace('<div class="av', '<div data-uopen="' + esc(m.uid) + '" class="av');
          h = h.replace('<b class="xs cy">', '<b class="xs cy" data-uopen="' + esc(m.uid) + '">');
        }
      } catch (e) {}
      return h;
    };
    wrapped.__usersWrapped = true;
    R.chatRow = wrapped;
  }

  /* ── ۹. قلاب‌ها ─────────────────────────────────────────── */
  function patchHooks() {
    R.hooks = R.hooks || {};
    var prevUsers = R.hooks.users;
    R.hooks.users = function () {
      if (prevUsers) { try { prevUsers(); } catch (e) {} }
      ensureSection();
      load();
      paint();
    };

    var prevProf = R.hooks.profile;
    R.hooks.profile = function () {
      if (prevProf) { try { prevProf(); } catch (e) {} }
      setTimeout(syncBack, 60);
    };

    if (R.renderProfile && !R.renderProfile.__usersWrapped) {
      var orig = R.renderProfile;
      var wrapped = function () {
        var out = orig.apply(R, arguments);
        setTimeout(syncBack, 80);
        return out;
      };
      wrapped.__usersWrapped = true;
      R.renderProfile = wrapped;
    }
  }

  /* ── ۱۰. راه‌اندازی ─────────────────────────────────────── */
  function boot() {
    css();
    ensureSection();
    ensureNav();
    ensureBack();
    bindClicks();
    wrapPostCard();
    wrapChatRow();
    patchHooks();
    if (R.ME) load();
  }

  /* ورود/خروج */
  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    ensureSection();
    ensureNav();
    load();
    if (el("sec-users") && el("sec-users").classList.contains("on")) paint();
  };
  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    ALL = {};
    WATCHED = false;
    paintCount();
    if (el("usrGrid")) el("usrGrid").innerHTML = '<div class="empty">برای دیدن کاربران وارد حساب شو 🔑</div>';
    var b = el("profBack"); if (b) b.classList.add("hide");
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 1700);
})();
