/* ═══════════════════════════════════════════════════════════════
   RONIN ACCOUNT PRO — نوار مشترک حساب + پالس پروفایل + آرشیو هوشمند
   روی users.js / inbox.js / ronin-profile.js / pack2.js / settings-pro.js
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__accountPro) return;
  R.__accountPro = true;

  var TABS = [
    { k: "users",    n: "کاربران",  ic: "👥" },
    { k: "dm",       n: "پیام‌ها",  ic: "📥" },
    { k: "profile",  n: "پروفایل",  ic: "👤" },
    { k: "archive",  n: "آرشیو",    ic: "🏯" },
    { k: "settings", n: "تنظیمات",  ic: "⚙️" }
  ];
  var PREM = { kitsune: 1, neko: 1, yuki: 1, meka: 1 };
  var archFilter = "all";
  var archQ = "";
  var dmWatch = null;

  function el(id) { return document.getElementById(id); }
  function qa(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(n) { return parseInt(n, 10) || 0; }

  /* ── نوار مشترک حساب ─────────────────────────────────────── */
  function railHTML(active) {
    return TABS.map(function (t) {
      var badge = t.k === "dm" ? '<span class="accBadge" data-accbadge="dm"></span>' : "";
      return '<button class="accTab' + (t.k === active ? " on" : "") + '" type="button" ' +
        'data-go="' + t.k + '" data-acctab="' + t.k + '">' +
        '<i>' + t.ic + "</i><span>" + t.n + "</span>" + badge + "</button>";
    }).join("");
  }

  function syncBadges() {
    var n = num(R.accUnread);
    qa("[data-accbadge='dm']").forEach(function (b) {
      b.textContent = n > 99 ? "99+" : fa(n);
      b.classList.toggle("on", n > 0);
    });
  }

  function ensureRail(k) {
    var s = el("sec-" + k);
    if (!s) return null;
    var head = s.querySelector(".head");
    if (!head) return null;
    var rail = s.querySelector(".accRail");
    if (!rail) {
      rail = document.createElement("div");
      rail.className = "accRail";
      rail.setAttribute("aria-label", "بخش‌های حساب");
      rail.innerHTML = railHTML(k);
      head.insertAdjacentElement("afterend", rail);
    }
    var active = R.cur || k;
    qa(".accTab", rail).forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-acctab") === active);
    });
    return rail;
  }

  /* ── پالس پروفایل ─────────────────────────────────────────── */
  function healthPc() {
    try {
      if (R.settingsExtra && R.settingsExtra.health) return R.settingsExtra.health().pc;
    } catch (e) {}
    return 0;
  }

  function npcName() {
    try {
      var p = R.npcPersona && R.npcPersona();
      if (p && p.n) return p.n;
    } catch (e) {}
    return "همراه پیش‌فرض";
  }

  function profileDockHTML() {
    var u = R.USER || {};
    var self = !R.VIEW || !R.ME || R.VIEW === R.ME;
    if (!self) return "";
    var av = R.avHTML ? R.avHTML(u, "md") : '<div class="av md">' + esc((u.name || "؟").slice(0, 1)) + "</div>";
    return '<div class="apId">' + av +
        '<div style="min-width:0"><span class="accKicker">MY RONIN ID</span>' +
          '<b>' + esc(u.name || "کاربر رونین") + "</b>" +
          '<span>' + (R.prem ? "💎 عضو پرمیوم" : "عضو جامعه") + "</span></div></div>" +
      '<div class="apMetric"><b>' + fa(healthPc()) + '٪</b><span>سلامت حساب</span></div>' +
      '<div class="apMetric"><b>' + fa(num(R.accUnread)) + '</b><span>پیام نخوانده</span></div>' +
      '<div class="apActions">' +
        '<button class="btn mini" type="button" data-go="settings">⚙️ تنظیمات</button>' +
        '<button class="btn mini" type="button" data-go="archive">🏯 آرشیو</button>' +
        '<button class="btn mini" type="button" data-go="dm">📥 پیام‌ها</button>' +
      '</div>';
  }

  function ensureProfileDock() {
    var s = el("sec-profile");
    if (!s) return;
    var box = el("profBox");
    if (!box) return;
    var d = el("accProfileDock");
    if (!d) {
      d = document.createElement("div");
      d.id = "accProfileDock";
      d.className = "accProfileDock";
      var rail = s.querySelector(".accRail");
      if (rail) rail.insertAdjacentElement("afterend", d);
      else box.parentNode.insertBefore(d, box);
    }
    var self = !R.VIEW || !R.ME || R.VIEW === R.ME;
    d.classList.toggle("hide", !self);
    if (self) d.innerHTML = profileDockHTML();
  }

  /* ── آرشیو همراه ─────────────────────────────────────────── */
  function isPremId(id) { return !!PREM[id]; }

  function archiveStats() {
    var cards = qa("#archWall .carc");
    var owned = 0, prem = 0;
    cards.forEach(function (c) {
      if (!c.classList.contains("lk")) owned++;
      if (isPremId(c.getAttribute("data-char"))) prem++;
    });
    var a = el("archStatAll"); if (a) a.textContent = fa(cards.length);
    var o = el("archStatOwned"); if (o) o.textContent = fa(owned);
    var p = el("archStatPrem"); if (p) p.textContent = fa(prem);
    var m = el("archStatActive");
    if (m) {
      var act = document.querySelector("#archWall .carc.on");
      m.textContent = act ? (act.querySelector(".cn") || {}).textContent || "—" : "—";
    }
  }

  function archiveApply() {
    var cards = qa("#archWall .carc");
    var needle = String(archQ || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var id = c.getAttribute("data-char") || "";
      var txt = String(c.textContent || "").toLowerCase();
      var locked = c.classList.contains("lk");
      var ok = true;
      if (archFilter === "free" && isPremId(id)) ok = false;
      if (archFilter === "premium" && !isPremId(id)) ok = false;
      if (archFilter === "unlocked" && locked) ok = false;
      if (needle && txt.indexOf(needle) < 0) ok = false;
      c.classList.toggle("hide", !ok);
      if (ok) shown++;
    });
    var empty = el("archEmpty");
    if (empty) empty.classList.toggle("hide", shown > 0);
    archiveStats();
    archiveSpot();
  }

  function archiveSpot() {
    var spot = el("archSpot");
    if (!spot) return;
    var card = document.querySelector("#archWall .carc.on") ||
      document.querySelector("#archWall .carc:not(.hide)");
    if (!card) { spot.innerHTML = '<span class="xs mut">همراهی برای نمایش نیست</span>'; return; }
    var cw = card.querySelector(".cw");
    var name = (card.querySelector(".cn") || {}).textContent || "همراه";
    var role = (card.querySelector(".cr") || {}).textContent || "";
    spot.innerHTML =
      '<div class="cw">' + (cw ? cw.innerHTML : "") + "</div>" +
      '<div style="min-width:0"><b>' + esc(name) + "</b>" +
        '<span>' + esc(role) + " • همراه فعال</span></div>" +
      '<span class="chip gd">فعال</span>';
  }

  function ensureArchive() {
    var s = el("sec-archive");
    if (!s) return;
    var head = s.querySelector(".head");
    if (!head) return;
    ensureRail("archive");
    var rail = s.querySelector(".accRail");
    var anchor = rail || head;

    if (!el("archHero")) {
      var h = document.createElement("div");
      h.id = "archHero";
      h.className = "archHero";
      h.innerHTML =
        '<div><span class="accKicker">COMPANION ARCHIVE</span>' +
          '<h3>همراه‌های رونین</h3>' +
          '<p>همراه فعال را عوض کن، همراه‌های آزاد و پرمیوم را ببین و آرشیو را شخصی کن.</p></div>' +
        '<div class="archStats">' +
          '<div class="archStat"><b id="archStatAll">۰</b><span>همراه</span></div>' +
          '<div class="archStat"><b id="archStatOwned">۰</b><span>آزادشده</span></div>' +
          '<div class="archStat"><b id="archStatPrem">۰</b><span>پرمیوم</span></div>' +
        '</div>';
      anchor.insertAdjacentElement("afterend", h);
      anchor = h;
    }
    if (!el("archTools")) {
      var t = document.createElement("div");
      t.className = "archTools";
      t.id = "archTools";
      t.innerHTML =
        '<div class="accSearch"><input class="inp" id="archQ" placeholder="جستجوی همراه…" maxlength="30" autocomplete="off"><i>⌕</i></div>' +
        '<div class="archFilter" id="archFilter">' +
          '<button class="on" type="button" data-afilter="all">همه</button>' +
          '<button type="button" data-afilter="free">آزاد</button>' +
          '<button type="button" data-afilter="premium">💎 پرمیوم</button>' +
          '<button type="button" data-afilter="unlocked">آزادشده</button>' +
        '</div>';
      anchor.insertAdjacentElement("afterend", t);
      anchor = t;
    }
    if (!el("archSpot")) {
      var sp = document.createElement("div");
      sp.id = "archSpot";
      sp.className = "archSpot";
      anchor.insertAdjacentElement("afterend", sp);
      anchor = sp;
    }
    if (!el("archEmpty")) {
      var em = document.createElement("div");
      em.id = "archEmpty";
      em.className = "archEmpty hide";
      em.textContent = "همراهی با این مشخصات پیدا نشد";
      var wall = el("archWall");
      if (wall) wall.insertAdjacentElement("afterend", em);
    }
    var q = el("archQ");
    if (q && !q.__bound) {
      q.__bound = true;
      q.addEventListener("input", function () { archQ = q.value; archiveApply(); });
    }
    var f = el("archFilter");
    if (f && !f.__bound) {
      f.__bound = true;
      f.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("[data-afilter]") : null;
        if (!b) return;
        archFilter = b.getAttribute("data-afilter") || "all";
        qa("#archFilter [data-afilter]").forEach(function (x) {
          x.classList.toggle("on", x === b);
        });
        archiveApply();
      });
    }
    archiveApply();
  }

  function patchArchive() {
    if (!R.paintArchive || R.paintArchive.__accWrapped) return;
    var orig = R.paintArchive;
    var wrapped = function () {
      var out = orig.apply(R, arguments);
      setTimeout(archiveApply, 30);
      return out;
    };
    wrapped.__accWrapped = true;
    R.paintArchive = wrapped;
  }

  /* ── شمارندهٔ پیام ───────────────────────────────────────── */
  function watchDM() {
    if (dmWatch) {
      try { dmWatch.ref.off("value", dmWatch.fn); } catch (e) {}
      dmWatch = null;
    }
    if (!R.db || !R.ME) { R.accUnread = 0; syncBadges(); return; }
    var ref = R.db.ref("dmBox/" + R.ME);
    var fn = function (s) {
      var v = (s && s.val && s.val()) || {}, n = 0;
      Object.keys(v).forEach(function (u) { n += num(v[u] && v[u].unread); });
      R.accUnread = n;
      syncBadges();
      ensureProfileDock();
    };
    dmWatch = { ref: ref, fn: fn };
    try {
      ref.on("value", fn, function (e) { console.warn("[Ronin] account dmBox:", e.message); });
    } catch (e) {}
  }

  function ensureAll() {
    ["users", "dm", "profile", "archive"].forEach(ensureRail);
    ensureProfileDock();
    ensureArchive();
    syncBadges();
  }

  /* ── قلاب‌ها ──────────────────────────────────────────────── */
  function patchHooks() {
    R.hooks = R.hooks || {};
    ["users", "dm", "profile", "archive", "settings"].forEach(function (k) {
      var prev = R.hooks[k];
      R.hooks[k] = function () {
        if (prev) { try { prev(); } catch (e) {} }
        ensureAll();
        setTimeout(function () {
          ensureAll();
          if (k === "profile") ensureProfileDock();
          if (k === "archive") archiveApply();
        }, 80);
      };
    });
    if (R.renderProfile && !R.renderProfile.__accWrapped) {
      var orig = R.renderProfile;
      var wrapped = function () {
        var out = orig.apply(R, arguments);
        setTimeout(ensureProfileDock, 70);
        return out;
      };
      wrapped.__accWrapped = true;
      R.renderProfile = wrapped;
    }
  }

  var prevIn = R.onLogin;
  R.onLogin = function () {
    if (prevIn) { try { prevIn(); } catch (e) {} }
    watchDM();
    setTimeout(ensureAll, 450);
  };
  var prevOut = R.onLogout;
  R.onLogout = function () {
    if (prevOut) { try { prevOut(); } catch (e) {} }
    R.accUnread = 0;
    watchDM();
    setTimeout(ensureAll, 300);
  };

  patchArchive();
  patchHooks();
  if (R.ME) watchDM();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { ensureAll(); if (R.ME) watchDM(); });
  } else {
    ensureAll();
  }
  setTimeout(function () { ensureAll(); if (R.ME) watchDM(); }, 800);
  setTimeout(ensureAll, 2000);
  setTimeout(function () { ensureArchive(); archiveApply(); }, 4200);
  setInterval(function () { ensureAll(); }, 3200);
})();
