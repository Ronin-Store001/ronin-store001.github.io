/* ═══════════════════════════════════════════════════════════════
   RONIN — EVENTS + RANKING 2.0
   فایل افزودنی: بخش‌های «رتبه‌بندی» و «رویدادها» را بازسازی می‌کند.
   - رتبه‌بندی زنده از users (XP / تازه‌واردها / پرمیوم) + جستجو + رتبهٔ من
   - رویدادها: ساخت توسط مالک، فیلتر، شمارش معکوس، ثبت‌نام، تقویم ICS،
     یادآوری، اشتراک‌گذاری و حذف
   هیچ بخش دیگری از سایت تغییر نمی‌کند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || window.RoninEventsRank) return;

  var ER = window.RoninEventsRank = { version: "3.0" };
  var S = ER.state = {
    users: {},
    events: {},
    rankReady: false,
    evReady: false,
    rankErr: false,
    evErr: false,
    rankMode: "xp",
    evMode: "all",
    q: "",
    openEv: null,
    detail: null,
    editEv: null,
    busy: {},
    rem: {},
    fired: {}
  };

  var built = false;
  var usersRef = null;
  var usersOn = false;
  var eventsRef = null;

  var KINDS = {
    tournament: { ic: "🏆", fa: "تورنمنت" },
    stream: { ic: "📺", fa: "پخش زنده" },
    meet: { ic: "🤝", fa: "دورهمی" },
    launch: { ic: "🚀", fa: "رونمایی" },
    other: { ic: "📅", fa: "رویداد" }
  };

  /* ── ابزار پایه ─────────────────────────────────────────── */
  function byId(id) { return document.getElementById(id); }
  function esc(v) { return R.esc ? R.esc(v) : String(v == null ? "" : v); }
  function fa(v) { return R.fa ? R.fa(v) : String(v); }
  function fmt(v) {
    try { return (Number(v) || 0).toLocaleString("fa-IR"); }
    catch (e) { return fa(v); }
  }
  function norm(v) { return String(v == null ? "" : v).trim().toLowerCase(); }
  function safeName(u) { return (u && u.name) || "کاربر رونین"; }
  function meName() { return (R.USER && R.USER.name) || "کاربر"; }
  function canManage() {
    try { return !!(R.isOwner && R.isOwner()) || !!(R.can && R.can("events")); }
    catch (e) { return false; }
  }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function levelOf(xp) { return R.level ? R.level(xp || 0) : 1; }
  function xpFor(lv) {
    if (R.xpFor) return R.xpFor(lv);
    return Math.round(Math.pow(Math.max(1, lv - 1), 2) * 45);
  }
  function progress(u) {
    var lv = levelOf(u.xp), prev = xpFor(lv), next = xpFor(lv + 1);
    if (next <= prev) next = prev + 1;
    var pct = Math.max(0, Math.min(100, Math.round(((u.xp || 0) - prev) / (next - prev) * 100)));
    return { lv: lv, prev: prev, next: next, pct: pct, need: Math.max(0, next - (u.xp || 0)) };
  }
  function avatar(u, cls) {
    try { if (R.avHTML) return R.avHTML(u || {}, cls); } catch (e) {}
    return '<div class="av ' + (cls || "") + '">' + esc((safeName(u) || "R").slice(0, 1)) + "</div>";
  }
  function initials(n) { return String(n || "R").trim().slice(0, 1) || "R"; }
  function safeUrl(u) {
    u = String(u || "").trim();
    return /^https?:\/\//i.test(u) ? u : "";
  }
  function eventURL(id) {
    return location.origin + location.pathname + "#event/" + encodeURIComponent(id);
  }
  function parseEventHash() {
    var m = String(location.hash || "").match(/^#event(?:\/|=)(.+)$/);
    if (!m) return "";
    try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
  }
  function setHash(hash, replace) {
    try {
      history[replace ? "replaceState" : "pushState"](null, "", hash);
    } catch (e) { location.hash = hash; }
  }

  /* ── تاریخ و شمارش معکوس ────────────────────────────────── */
  var DF = {};
  try {
    DF.day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" });
    DF.month = new Intl.DateTimeFormat("fa-IR", { month: "long" });
    DF.week = new Intl.DateTimeFormat("fa-IR", { weekday: "long" });
    DF.time = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
    DF.year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });
  } catch (e) {}

  function dateBits(ts) {
    if (!ts) return null;
    var d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    function f(key, fallback) {
      try { return DF[key] ? DF[key].format(d) : fallback; }
      catch (e) { return fallback; }
    }
    return {
      day: f("day", String(d.getDate())),
      month: f("month", ""),
      week: f("week", ""),
      time: f("time", ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)),
      year: f("year", String(d.getFullYear()))
    };
  }
  function dateLine(ts) {
    var b = dateBits(ts);
    if (!b) return "زمان اعلام نشده";
    return b.week + " " + b.day + " " + b.month + " • " + b.time;
  }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function cdText(ms) {
    if (ms <= 0) return "پایان‌یافته";
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    if (d > 0) return fa(d) + " روز و " + fa(h) + " ساعت";
    return fa(two(h)) + ":" + fa(two(m)) + ":" + fa(two(sec));
  }

  function durOf(e) { return Number(e.dur) || 90; }
  function endOf(e) { return e.start ? Number(e.start) + durOf(e) * 60000 : 0; }
  function phase(e) {
    if (!e.start) return "nodate";
    var n = Date.now();
    if (n < e.start) return "soon";
    if (n < endOf(e)) return "live";
    return "past";
  }

  /* ── داده‌های کاربران ──────────────────────────────────── */
  function allUsers() {
    var out = [], seen = {}, src = S.users || {};
    Object.keys(src).forEach(function (id) {
      var u = src[id] || {};
      if (u.banned) return;
      seen[id] = true;
      out.push({
        uid: id,
        name: u.name || "کاربر",
        xp: Number(u.xp) || 0,
        prem: !!u.prem,
        role: u.role || "user",
        joined: Number(u.joined) || 0,
        av: u.av || "",
        bio: u.bio || ""
      });
    });
    if (R.ME && R.USER && !seen[R.ME] && !R.USER.banned) {
      out.push({
        uid: R.ME,
        name: R.USER.name || "من",
        xp: Number(R.USER.xp) || 0,
        prem: !!(R.USER.prem || R.prem),
        role: R.role || "user",
        joined: Number(R.USER.joined) || 0,
        av: R.USER.av || "",
        bio: R.USER.bio || ""
      });
    }
    return out;
  }
  function sortXp(arr) {
    return arr.slice().sort(function (a, b) {
      return (b.xp - a.xp) || String(a.name).localeCompare(String(b.name), "fa");
    });
  }
  function rankPool() {
    var arr = allUsers();
    if (S.rankMode === "prem") return sortXp(arr.filter(function (u) { return u.prem; }));
    if (S.rankMode === "new") {
      return arr.sort(function (a, b) {
        return (b.joined - a.joined) || (b.xp - a.xp);
      });
    }
    return sortXp(arr);
  }

  /* ── ساخت پوستهٔ رتبه‌بندی ─────────────────────────────── */
  function ensureRank() {
    var sec = byId("sec-rank");
    if (!sec) return false;
    if (byId("erxRkBody")) return true;

    sec.innerHTML =
      '<div class="head">' +
        '<div><h2 class="h2">🏆 رتبه‌بندی رونین</h2>' +
          '<div class="erx-sub">لیگ واقعی اعضا بر اساس XP و فعالیت</div></div>' +
        '<span class="erx-live" id="erxRkLive"><i></i>زنده</span>' +
      '</div>' +
      '<div class="erx-shell" id="erxRank">' +
        '<div class="erx-rkhero" id="erxRkHero"></div>' +
        '<div class="erx-toolbar">' +
          '<div class="erx-tabs" id="erxRkTabs">' +
            '<div class="tab on" data-erx-rmode="xp">🏆 امتیاز</div>' +
            '<div class="tab" data-erx-rmode="new">✨ تازه‌واردها</div>' +
            '<div class="tab" data-erx-rmode="prem">💎 پرمیوم</div>' +
          '</div>' +
          '<label class="erx-search"><span>🔎</span>' +
            '<input id="erxRkQ" type="search" autocomplete="off" ' +
              'placeholder="جستجوی نام کاربر…" aria-label="جستجوی کاربر"></label>' +
        '</div>' +
        '<div id="erxRkBody"></div>' +
      '</div>';

    var root = byId("erxRank");
    if (root) {
      root.addEventListener("click", function (e) {
        var t = e.target.closest ? e.target.closest("[data-erx-rmode]") : null;
        if (t) {
          S.rankMode = t.getAttribute("data-erx-rmode") || "xp";
          renderRank();
          return;
        }
        if (e.target.closest && e.target.closest("[data-erx-retry]")) {
          watchUsers(true);
        }
      });
    }
    var q = byId("erxRkQ");
    if (q) q.addEventListener("input", function () {
      S.q = q.value;
      renderRankBody();
    });
    return true;
  }

  function liveChip(text, warn) {
    return '<i></i>' + esc(text);
  }

  function rankHero(all, xpList, mine) {
    var totalXP = all.reduce(function (s, u) { return s + (u.xp || 0); }, 0);
    var leader = xpList[0];
    var h = '<div class="erx-rkgrid">' +
      '<div>' +
        '<span class="erx-kicker"><i></i>RONIN LEAGUE · لیگ رونین</span>' +
        '<h3>برترین‌های رونین</h3>' +
        '<p class="erx-rkdesc">با هر فعالیت، XP جمع کن و از بقیه بالا بزن. ' +
          'رتبه‌ها با تغییر پروفایل‌ها و XP، زنده به‌روز می‌شوند.</p>' +
        '<div class="erx-rkstats">' +
          '<div class="erx-stat"><b>' + fmt(all.length) + '</b><span>رقابت‌کننده</span></div>' +
          '<div class="erx-stat"><b>' + fmt(totalXP) + '</b><span>مجموع XP</span></div>' +
          '<div class="erx-stat lead"><b>' + (leader ? esc(safeName(leader)) : "—") +
            '</b><span>صدرنشین</span></div>' +
        '</div>' +
      '</div>' +
      minePanel(xpList, mine) +
    '</div>';
    return h;
  }

  function minePanel(xpList, mine) {
    if (!R.ME) {
      return '<div class="erx-mine guest">' +
        '<div class="erx-gicon">🏅</div>' +
        '<b>جای تو در لیگ کجاست؟</b>' +
        '<p>وارد حساب شو تا رتبه، سطح و فاصله‌ات تا نفر بعدی را ببینی.</p>' +
        '<button class="btn p mini" type="button" data-authopen="login">ورود به رونین</button>' +
      '</div>';
    }
    if (!mine) {
      return '<div class="erx-mine">' +
        '<div class="erx-mehead"><span class="erx-kicker">حساب من</span></div>' +
        '<div class="erx-merow">' + avatar(R.USER || { name: meName() }, "") +
          '<div class="erx-menam">' + esc(meName()) + '</div></div>' +
        '<p class="erx-mesub">حساب تو فعلاً در جدول رتبه‌بندی نیست.</p>' +
      '</div>';
    }
    var p = progress(mine);
    var idx = xpList.findIndex ? xpList.findIndex(function (u) { return u.uid === mine.uid; }) : -1;
    if (idx < 0) {
      for (var i = 0; i < xpList.length; i++) if (xpList[i].uid === mine.uid) { idx = i; break; }
    }
    return '<div class="erx-mine">' +
      '<div class="erx-mehead"><span class="erx-kicker">رتبهٔ من</span>' +
        '<span class="chip cy">#' + fa(idx >= 0 ? idx + 1 : "—") + '</span></div>' +
      '<div class="erx-merow">' + avatar(mine, "") +
        '<div style="min-width:0"><div class="erx-menam">' + esc(mine.name) + '</div>' +
        '<div class="erx-mesub">سطح ' + fa(p.lv) + ' • ' + fmt(mine.xp) + ' XP</div></div>' +
      '</div>' +
      '<div class="erx-bar"><i style="width:' + p.pct + '%"></i></div>' +
      '<div class="erx-mefoot"><span><b>' + fmt(mine.xp) + '</b> XP</span>' +
        '<span>تا سطح ' + fa(p.lv + 1) + ' • ' + fmt(p.need) + ' XP</span></div>' +
    '</div>';
  }

  /* ── بدنهٔ رتبه‌بندی ────────────────────────────────────── */
  function renderRank() {
    if (!ensureRank()) return;
    var all = allUsers();
    var xpList = sortXp(all);
    var mine = null;
    if (R.ME) {
      for (var i = 0; i < xpList.length; i++) if (xpList[i].uid === R.ME) { mine = xpList[i]; break; }
    }
    var hero = byId("erxRkHero");
    if (hero) hero.innerHTML = rankHero(all, xpList, mine);

    var live = byId("erxRkLive");
    if (live) {
      live.className = "erx-live" + (S.rankErr ? " warn" : "");
      live.innerHTML = S.rankErr ? liveChip("اتصال محدود", true) : liveChip("زنده", false);
    }
    R.qa("[data-erx-rmode]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-erx-rmode") === S.rankMode);
    });
    renderRankBody();
  }

  function emptyBox(icon, title, text, extra) {
    return '<div class="erx-empty"><div class="erx-emoji">' + icon + '</div>' +
      '<b>' + title + '</b><p>' + text + '</p>' + (extra || "") + '</div>';
  }

  function renderRankBody() {
    var body = byId("erxRkBody");
    if (!body) return;
    if (!S.rankReady) {
      body.innerHTML = '<div class="erx-skel"><i></i><i></i><i></i><i></i><i></i></div>';
      return;
    }
    if (S.rankErr) {
      body.innerHTML = R.ME
        ? emptyBox("🛡", "خواندن لیست کاربران ممکن نشد",
            "دسترسی خواندن کاربران در این لحظه بسته است. دوباره تلاش کن.",
            '<button class="btn p mini" type="button" data-erx-retry>تلاش دوباره</button>')
        : emptyBox("🔐", "برای دیدن جدول وارد شو",
            "رتبه‌بندی اعضا فقط برای کاربران واردشده نمایش داده می‌شود.",
            '<button class="btn p mini" type="button" data-authopen="login">ورود / ثبت‌نام</button>');
      return;
    }

    var all = allUsers();
    var pool = rankPool();
    var pos = {};
    pool.forEach(function (u, i) { pos[u.uid] = i + 1; });

    if (!all.length) {
      body.innerHTML = !R.ME
        ? emptyBox("👥", "هنوز عضوی در جدول نیست",
            "با ثبت‌نام، اولین نفری باش که وارد لیگ می‌شود.",
            '<button class="btn p mini" type="button" data-authopen="reg">ساخت حساب</button>')
        : emptyBox("🏅", "هنوز رقیبی نداری",
            "با فعالیت در انجمن و چت، XP جمع کن تا جدول پر شود.",
            '<button class="btn mini" type="button" data-go="community">رفتن به انجمن</button>');
      return;
    }

    var q = norm(S.q);
    if (q) {
      var found = pool.filter(function (u) { return norm(u.name).indexOf(q) > -1; });
      if (!found.length) {
        body.innerHTML = emptyBox("🔎", "کاربری پیدا نشد",
          "اسم دیگری را جستجو کن یا فیلتر را عوض کن.");
      } else {
        body.innerHTML = '<div class="erx-listhead"><span>نتیجهٔ جستجو</span>' +
          '<span>' + fa(found.length) + ' نفر</span></div><div class="erx-list">' +
          found.map(function (u) { return rowHTML(u, pos[u.uid] || 0); }).join("") +
          '</div>';
      }
      return;
    }

    if (!pool.length) {
      if (S.rankMode === "prem") {
        body.innerHTML = emptyBox("💎", "هنوز کاربر پرمیومی نیست",
          "با فعال‌شدن پرمیوم، دارندگانش اینجا نمایش داده می‌شوند.",
          '<button class="btn mini" type="button" data-erx-rmode="xp">دیدن جدول امتیاز</button>');
      } else {
        body.innerHTML = emptyBox("🏅", "هنوز کسی XP ندارد",
          "اولین XP را جمع کن و صدر جدول را بگیر.",
          '<button class="btn p mini" type="button" data-go="community">شروع فعالیت</button>');
      }
      return;
    }

    var h = "";
    var podium = pool.slice(0, 3);
    if (podium.length) h += podiumHTML(podium);
    var rest = pool.slice(3);
    if (rest.length) {
      h += '<div class="erx-listhead"><span>جدول کامل</span><span>' +
        fa(pool.length) + ' نفر</span></div><div class="erx-list">' +
        rest.map(function (u) { return rowHTML(u, pos[u.uid] || 0); }).join("") +
        '</div>';
    }
    body.innerHTML = h;
  }

  function podiumHTML(top) {
    var cls = top.length === 1 ? " one" : top.length === 2 ? " short" : "";
    var order = top.length === 3 ? [top[1], top[0], top[2]] : top;
    var medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    return '<div class="erx-podium' + cls + '">' + order.map(function (u) {
      var r = top.indexOf(u) + 1;
      var p = progress(u);
      return '<div class="erx-pod p' + r + '" role="button" tabindex="0" data-uopen="' +
        esc(u.uid) + '">' +
        '<span class="erx-crown">' + (medals[r] || "🏅") + '</span>' +
        '<span class="erx-podav">' + avatar(u, "lg") + '</span>' +
        '<b class="erx-podname" title="' + esc(u.name) + '">' + esc(u.name) + '</b>' +
        '<span class="erx-podlv">سطح ' + fa(p.lv) + '</span>' +
        '<span class="erx-podxp">' + fmt(u.xp) + ' XP</span>' +
      '</div>';
    }).join("") + "</div>";
  }

  function rowHTML(u, rank) {
    var p = progress(u);
    var medal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";
    var chips = '<span class="chip cy">سطح ' + fa(p.lv) + '</span>';
    if (u.prem) chips += '<span class="chip gd">💎 پرمیوم</span>';
    if (u.role === "owner") chips += '<span class="chip gd">👑 مالک</span>';
    else if (u.role === "admin" || u.role === "staff") chips += '<span class="chip">🛡 تیم</span>';
    var jb = u.joined ? dateBits(u.joined) : null;
    var sub = (S.rankMode === "new" && jb)
      ? '<span class="erx-sub-in">عضو از ' + jb.year + '</span>' : "";
    return '<div class="erx-row' + (u.uid === R.ME ? " you" : "") +
      '" role="button" tabindex="0" data-uopen="' + esc(u.uid) + '">' +
      '<div class="erx-rank ' + medal + '">' + (rank ? fa(rank) : "—") + '</div>' +
      '<div>' + avatar(u, "sm") + '</div>' +
      '<div class="erx-rmain">' +
        '<div class="erx-rname"><span>' + esc(u.name) + '</span>' +
          (u.uid === R.ME ? '<span class="chip cy">من</span>' : "") + '</div>' +
        '<div class="erx-rchips">' + chips + sub + '</div>' +
        '<div class="erx-rbar"><i style="width:' + p.pct + '%"></i></div>' +
      '</div>' +
      '<div class="erx-xp"><b>' + fmt(u.xp) + '</b><span>XP</span></div>' +
    '</div>';
  }

  /* ── داده‌های رویدادها ─────────────────────────────────── */
  function allEvents() {
    var src = S.events || {};
    return Object.keys(src).map(function (id) {
      var raw = src[id] || {};
      return {
        id: id,
        title: raw.title || "رویداد رونین",
        body: raw.body || "",
        kind: KINDS[raw.kind] ? raw.kind : "other",
        start: Number(raw.start) || 0,
        dur: Number(raw.dur) || 90,
        place: raw.place || "",
        link: raw.link || "",
        cap: Number(raw.cap) || 0,
        by: raw.by || "",
        byn: raw.byn || "",
        going: raw.going && typeof raw.going === "object" ? raw.going : {},
        t: Number(raw.t) || 0
      };
    });
  }
  function findEvent(id) {
    var list = allEvents();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function attendees(e) {
    var g = e.going || {}, out = [];
    Object.keys(g).forEach(function (uid) {
      var v = g[uid];
      var n = (v && typeof v === "object" && v.n) || (typeof v === "string" ? v : "") ||
        (S.users[uid] && S.users[uid].name) || "کاربر";
      out.push({ uid: uid, n: n, t: (v && v.t) || 0 });
    });
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  }
  function isGoing(e, uid) { return !!(uid && e.going && e.going[uid]); }
  function eventSort(a, b) {
    var rank = { live: 0, soon: 1, nodate: 2, past: 3 };
    var pa = phase(a), pb = phase(b);
    if (pa !== pb) return rank[pa] - rank[pb];
    if (pa === "live") return endOf(a) - endOf(b);
    if (pa === "soon") return a.start - b.start;
    if (pa === "past") return (b.start || b.t) - (a.start || a.t);
    return (b.t || 0) - (a.t || 0);
  }
  function filteredEvents() {
    var list = allEvents(), now = Date.now();
    if (S.evMode === "upcoming") {
      list = list.filter(function (e) { return e.start && endOf(e) > now; });
    } else if (S.evMode === "mine") {
      list = R.ME ? list.filter(function (e) { return isGoing(e, R.ME); }) : [];
    } else if (S.evMode === "past") {
      list = list.filter(function (e) { return phase(e) === "past"; });
    }
    return list.sort(eventSort);
  }
  function eventCounts() {
    var list = allEvents(), now = Date.now();
    return {
      all: list.length,
      upcoming: list.filter(function (e) { return e.start && endOf(e) > now; }).length,
      mine: R.ME ? list.filter(function (e) { return isGoing(e, R.ME); }).length : 0,
      past: list.filter(function (e) { return phase(e) === "past"; }).length
    };
  }

  /* ── ساخت پوستهٔ رویدادها ──────────────────────────────── */
  function ensureEvents() {
    var sec = byId("sec-events");
    if (!sec) return false;
    if (byId("erxEvList")) return true;

    sec.innerHTML =
      '<div class="head">' +
        '<div><h2 class="h2">📅 رویدادهای رونین</h2>' +
          '<div class="erx-sub">مسابقه، پخش زنده و دورهمی‌های اعضا</div></div>' +
        '<span class="erx-live" id="erxEvLive"><i></i>تقویم زنده</span>' +
      '</div>' +
      '<div class="erx-shell" id="erxEvents">' +
        '<div class="erx-evhero" id="erxEvHero"></div>' +
        '<div class="erx-evtools">' +
          '<div class="erx-tabs" id="erxEvTabs"></div>' +
          '<button class="btn p mini erx-newbtn" type="button" id="erxEvNew" data-erx-new hidden>＋ رویداد جدید</button>' +
        '</div>' +
        '<div class="erx-create" id="erxEvForm" hidden>' +
          '<div class="erx-createhead"><b id="erxEvFormTitle">ساخت رویداد جدید</b>' +
            '<button class="icobtn" type="button" data-erx-closeform aria-label="بستن">✕</button></div>' +
          '<div class="erx-form">' +
            '<div class="erx-f full"><label for="erxEvTitle">عنوان رویداد</label>' +
              '<input id="erxEvTitle" maxlength="90" placeholder="مثلاً تورنمنت شبانهٔ رونین"></div>' +
            '<div class="erx-f"><label for="erxEvKind">نوع</label><select id="erxEvKind">' +
              '<option value="tournament">🏆 تورنمنت</option>' +
              '<option value="stream">📺 پخش زنده</option>' +
              '<option value="meet">🤝 دورهمی</option>' +
              '<option value="launch">🚀 رونمایی</option>' +
              '<option value="other">📅 رویداد</option>' +
            '</select></div>' +
            '<div class="erx-f"><label for="erxEvStart">زمان شروع</label>' +
              '<input id="erxEvStart" type="datetime-local"></div>' +
            '<div class="erx-f"><label for="erxEvDur">مدت</label><select id="erxEvDur">' +
              '<option value="30">۳۰ دقیقه</option><option value="60">۱ ساعت</option>' +
              '<option value="90" selected>۱ ساعت و نیم</option><option value="120">۲ ساعت</option>' +
              '<option value="180">۳ ساعت</option></select></div>' +
            '<div class="erx-f"><label for="erxEvPlace">مکان</label>' +
              '<input id="erxEvPlace" maxlength="60" placeholder="دیسکورد / سایت / تهران"></div>' +
            '<div class="erx-f"><label for="erxEvLink">لینک (اختیاری)</label>' +
              '<input id="erxEvLink" maxlength="300" placeholder="https://…" inputmode="url"></div>' +
            '<div class="erx-f"><label for="erxEvCap">ظرفیت (۰ = نامحدود)</label>' +
              '<input id="erxEvCap" type="number" min="0" max="100000" value="0" inputmode="numeric"></div>' +
            '<div class="erx-f full"><label for="erxEvBody">توضیح</label>' +
              '<textarea id="erxEvBody" maxlength="600" placeholder="چه چیزی در انتظار شرکت‌کننده‌هاست؟"></textarea></div>' +
          '</div>' +
          '<div class="erx-formfoot">' +
            '<button class="btn p mini" type="button" id="erxEvSave">ثبت رویداد</button>' +
            '<span class="erx-hint">بعد از ثبت، رویداد بلافاصله برای همه نمایش داده می‌شود.</span>' +
          '</div>' +
        '</div>' +
        '<div class="erx-detail" id="erxEvDetail" hidden></div>' +
        '<div class="erx-evlist" id="erxEvList"></div>' +
      '</div>';

    var root = byId("erxEvents");
    if (root) root.addEventListener("click", eventsClick);
    var save = byId("erxEvSave");
    if (save) save.addEventListener("click", saveEvent);
    var form = byId("erxEvForm");
    if (form) form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        saveEvent();
      }
    });
    return true;
  }

  function makeTabs() {
    var c = eventCounts();
    return [
      ["all", "همه", c.all],
      ["upcoming", "پیش‌رو", c.upcoming],
      ["mine", "من", c.mine],
      ["past", "گذشته", c.past]
    ].map(function (t) {
      return '<div class="tab' + (S.evMode === t[0] ? " on" : "") +
        '" data-erx-emode="' + t[0] + '">' + t[1] +
        '<i class="erx-tabn">' + fa(t[2]) + '</i></div>';
    }).join("");
  }

  function renderEvents() {
    if (!ensureEvents()) return;
    var tabs = byId("erxEvTabs");
    if (tabs) tabs.innerHTML = makeTabs();

    var manage = canManage();
    var newBtn = byId("erxEvNew");
    if (newBtn) {
      newBtn.hidden = !manage;
      newBtn.style.display = manage ? "" : "none";
    }
    if (!manage) {
      var form = byId("erxEvForm");
      if (form) form.hidden = true;
    }

    var live = byId("erxEvLive");
    if (live) {
      live.className = "erx-live" + (S.evErr ? " warn" : "");
      live.innerHTML = S.evErr ? liveChip("آفلاین", true) : liveChip("تقویم زنده", false);
    }

    var hero = byId("erxEvHero");
    if (hero) hero.innerHTML = eventsHero();
    syncDetailMode();
    renderDetail();
    renderEventsList();
  }

  function syncDetailMode() {
    var on = !!S.detail;
    var hero = byId("erxEvHero");
    var tools = document.querySelector("#erxEvents .erx-evtools");
    var list = byId("erxEvList");
    var form = byId("erxEvForm");
    var detail = byId("erxEvDetail");
    if (hero) hero.hidden = on;
    if (tools) tools.hidden = on;
    if (list) list.hidden = on;
    if (form && on) form.hidden = !S.editEv;
    if (detail) detail.hidden = !on;
  }

  function detailBack() {
    return '<div class="erx-detailbar">' +
      '<button class="btn mini erx-backbtn" type="button" data-erx-back>→ همهٔ رویدادها</button>' +
      '<span class="erx-kicker">EVENT PAGE · صفحهٔ رویداد</span>' +
    '</div>';
  }

  function detailFact(label, value) {
    return '<div class="erx-fact"><span>' + label + '</span><b>' + value + '</b></div>';
  }

  function detailHTML(e) {
    var ph = phase(e), K = KINDS[e.kind] || KINDS.other;
    var names = attendees(e), gc = names.length, cap = Number(e.cap) || 0;
    var mine = isGoing(e, R.ME);
    var full = cap > 0 && gc >= cap && !mine;
    var canJoin = !!e.start && ph !== "past";
    var disabled = !canJoin || (full && !mine);
    var label = mine ? "✓ شرکت کردم" : full ? "ظرفیت تکمیل" : ph === "past" ? "پایان‌یافته" :
      ph === "live" ? "پیوستن" : "شرکت می‌کنم";
    var org = (S.users[e.by] && S.users[e.by].name) || e.byn || "تیم رونین";
    var link = safeUrl(e.link);
    var pct = cap ? Math.min(100, Math.round(gc / cap * 100)) : 0;
    var icsBtn = e.start
      ? '<button class="btn mini" type="button" data-erx-ics="' + esc(e.id) + '">📅 افزودن به تقویم</button>' : "";
    var remBtn = e.start && ph !== "past"
      ? '<button class="btn mini' + (S.rem[e.id] ? " on" : "") + '" type="button" data-erx-rem="' +
        esc(e.id) + '">' + (S.rem[e.id] ? "🔔 یادآوری فعال" : "🔔 یادآوری") + '</button>' : "";
    var manageBtns = canManage()
      ? '<button class="btn mini erx-editbtn" type="button" data-erx-edit="' + esc(e.id) + '">✏️ ویرایش</button>' +
        '<button class="btn mini erx-delbtn" type="button" data-erx-del="' + esc(e.id) + '">🗑 حذف</button>' : "";

    return detailBack() +
      '<article class="erx-evpage ' + ph + '">' +
        '<div class="erx-evpagehero">' +
          '<div class="erx-evpageicon">' + K.ic + '</div>' +
          '<div class="erx-evpagecopy">' +
            '<div class="erx-evtop"><span class="erx-kind">' + K.ic + " " + K.fa + '</span>' +
              stateHTML(e) + '</div>' +
            '<h3>' + esc(e.title) + '</h3>' +
            '<p class="erx-evpagemeta">🗓 ' + esc(dateLine(e.start)) +
              (e.place ? ' • 📍 ' + esc(e.place) : "") + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="erx-evpagegrid">' +
          '<section class="erx-evpagebody">' +
            '<h4>دربارهٔ رویداد</h4>' +
            '<p>' + (e.body ? esc(e.body) : "توضیحی برای این رویداد ثبت نشده است.") + '</p>' +
            (link ? '<a class="erx-linkbtn" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">🔗 باز کردن لینک رویداد</a>' : "") +
            (e.start ? '<div class="erx-evpagecd"><span>' + (ph === "live" ? "تا پایان" : "شروع تا") + '</span>' + cdNode(e) + '</div>' : "") +
          '</section>' +
          '<aside class="erx-evpageside">' +
            '<div class="erx-facts">' +
              detailFact("میزبان", esc(org)) +
              detailFact("زمان", esc(dateLine(e.start))) +
              detailFact("مدت", fa(durOf(e)) + " دقیقه") +
              detailFact("ظرفیت", cap ? fa(gc) + " از " + fa(cap) : "نامحدود") +
              detailFact("مکان", e.place ? esc(e.place) : "اعلام نشده") +
            '</div>' +
            (cap ? '<div class="erx-capbar"><i style="width:' + pct + '%"></i></div>' : "") +
            '<div class="erx-attendees"><div class="erx-attendeeshead"><b>شرکت‌کننده‌ها</b>' +
              '<span>' + fa(gc) + ' نفر</span></div>' +
              (names.length
                ? '<div class="erx-peoplelist">' + names.map(function (n) {
                    return '<span>' + esc(n.n) + '</span>';
                  }).join("") + '</div>'
                : '<p>هنوز کسی ثبت‌نام نکرده است.</p>') +
            '</div>' +
          '</aside>' +
        '</div>' +
        '<div class="erx-evpageacts">' +
          '<button class="btn p mini erx-join' + (mine ? " on" : "") + '" type="button" data-erx-join="' +
            esc(e.id) + '" aria-pressed="' + (mine ? "true" : "false") + '"' +
            (disabled ? " disabled" : "") + '>' + label + '</button>' +
          icsBtn + remBtn +
          '<button class="btn mini" type="button" data-erx-share="' + esc(e.id) + '">🔗 اشتراک</button>' +
          '<button class="btn mini" type="button" data-erx-copy="' + esc(e.id) + '">📋 کپی لینک</button>' +
          manageBtns +
        '</div>' +
      '</article>';
  }

  function renderDetail() {
    var box = byId("erxEvDetail");
    if (!box) return;
    if (!S.detail) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    if (!S.evReady) {
      box.innerHTML = detailBack() + '<div class="erx-skel"><i></i><i></i><i></i><i></i></div>';
      return;
    }
    if (S.evErr) {
      box.innerHTML = detailBack() + emptyBox("🛡", "صفحهٔ رویداد باز نشد",
        "اتصال به تقویم برقرار نشد. دوباره تلاش کن.",
        '<button class="btn mini" type="button" data-erx-back>بازگشت</button>');
      return;
    }
    var e = findEvent(S.detail);
    if (!e) {
      box.innerHTML = detailBack() + emptyBox("🔎", "این رویداد پیدا نشد",
        "ممکن است حذف شده باشد یا لینک آن قدیمی باشد.",
        '<button class="btn p mini" type="button" data-erx-back>دیدن رویدادها</button>');
      return;
    }
    box.innerHTML = detailHTML(e);
  }

  function nextEvent() {
    var list = allEvents().sort(eventSort);
    for (var i = 0; i < list.length; i++) if (phase(list[i]) === "live") return { e: list[i], live: true };
    for (var j = 0; j < list.length; j++) if (phase(list[j]) === "soon") return { e: list[j], live: false };
    return null;
  }

  function eventsHero() {
    var list = allEvents(), counts = eventCounts();
    var totalGoing = 0;
    list.forEach(function (e) { totalGoing += attendees(e).length; });
    var next = nextEvent();
    var h = '<div class="erx-evgrid"><div>' +
      '<span class="erx-kicker"><i></i>RONIN EVENTS · تقویم رونین</span>' +
      '<h3>رویدادها و مسابقه‌ها</h3>' +
      '<p class="erx-rkdesc">تورنمنت، پخش زنده و دورهمی. جای خودت را رزرو کن، ' +
        'یادآوری بگیر و رویداد را مستقیم به تقویمت اضافه کن.</p>' +
      '<div class="erx-rkstats">' +
        '<div class="erx-stat"><b>' + fmt(counts.upcoming) + '</b><span>پیش‌رو</span></div>' +
        '<div class="erx-stat"><b>' + fmt(list.length) + '</b><span>کل رویدادها</span></div>' +
        '<div class="erx-stat"><b>' + fmt(totalGoing) + '</b><span>ثبت‌نام</span></div>' +
      '</div></div>';

    if (next) {
      var e = next.e, ph = phase(e), b = dateBits(e.start);
      h += '<div class="erx-next">' +
        '<span class="erx-kicker" style="color:' + (ph === "live" ? "#8ff0c6" : "#8de9ff") + '">' +
          (ph === "live" ? "● همین حالا" : "رویداد بعدی") + '</span>' +
        '<b class="erx-nextname">' + esc(e.title) + '</b>' +
        '<span class="erx-nextmeta">' + esc(dateLine(e.start)) +
          (e.place ? ' • ' + esc(e.place) : "") + '</span>' +
        '<div class="erx-nextcd"><span>' + (ph === "live" ? "تا پایان" : "شروع تا") + '</span>' +
          '<b data-erx-cd data-start="' + e.start + '" data-dur="' + durOf(e) +
          '" data-phase="' + ph + '">' + cdText((ph === "live" ? endOf(e) : e.start) - Date.now()) + '</b>' +
        '</div>' +
        '<button class="btn mini" type="button" data-erx-detail="' + esc(e.id) + '">صفحهٔ رویداد</button>' +
      '</div>';
    } else {
      h += '<div class="erx-next none"><div class="erx-nico">🗓</div>' +
        '<b>رویداد بعدی اعلام نشده</b>' +
        '<p>' + (canManage() ? "اولین رویداد را بساز تا همه ببینند." : "به‌زودی برنامه‌های جدید اینجا می‌آید.") + '</p>' +
        (canManage() ? '<button class="btn p mini" type="button" data-erx-new>ساخت رویداد</button>' : "") +
      '</div>';
    }
    return h + '</div>';
  }

  function stateHTML(e) {
    var ph = phase(e);
    if (ph === "live") return '<span class="erx-state live"><span aria-hidden="true">●</span> در حال برگزاری</span>';
    if (ph === "soon") return '<span class="erx-state soon">● پیش‌رو</span>';
    if (ph === "past") return '<span class="erx-state past">پایان‌یافته</span>';
    return '<span class="erx-state nodate">آرشیو</span>';
  }

  function cdNode(e) {
    var ph = phase(e);
    if (!e.start || ph === "past") return "";
    var ms = (ph === "live" ? endOf(e) : e.start) - Date.now();
    return '<b class="erx-cd" data-erx-cd data-start="' + e.start + '" data-dur="' + durOf(e) +
      '" data-phase="' + ph + '">' + cdText(ms) + '</b>';
  }

  function eventCard(e) {
    var ph = phase(e), b = dateBits(e.start), K = KINDS[e.kind] || KINDS.other;
    var names = attendees(e), gc = names.length;
    var mine = isGoing(e, R.ME);
    var cap = Number(e.cap) || 0;
    var full = cap > 0 && gc >= cap && !mine;
    var canJoin = !!e.start && ph !== "past";
    var disabled = !canJoin || (full && !mine);
    var label = mine ? "✓ شرکت کردم" : full ? "ظرفیت تکمیل" : ph === "past" ? "پایان‌یافته" :
      ph === "live" ? "پیوستن" : "شرکت می‌کنم";
    var open = S.openEv === e.id;

    var h = '<article class="erx-ev ' + ph + '" data-erx-ev="' + esc(e.id) + '">' +
      '<div class="erx-date"><b>' + (b ? b.day : "؟") + '</b>' +
        '<span>' + (b ? b.month : "بدون تاریخ") + '</span>' +
        '<i>' + (b ? b.week : "آرشیو") + '</i></div>' +
      '<div class="erx-evmain">' +
        '<div class="erx-evtop"><span class="erx-kind">' + K.ic + " " + K.fa + '</span>' +
          stateHTML(e) + '</div>' +
        '<h4><button class="erx-titleopen" type="button" data-erx-detail="' + esc(e.id) + '">' +
          esc(e.title) + ' <span aria-hidden="true">↗</span></button></h4>' +
        '<div class="erx-evmeta">' +
          '<span>🗓 ' + esc(dateLine(e.start)) + '</span>' +
          (e.place ? '<span>📍 ' + esc(e.place) + '</span>' : '') +
          (ph === "soon" ? '<span>⏳ شروع تا ' + cdNode(e) + '</span>' : '') +
          (ph === "live" ? '<span>⏳ تا پایان ' + cdNode(e) + '</span>' : '') +
        '</div>' +
        (e.body ? '<p class="erx-evdesc">' + esc(e.body) + '</p>' : '') +
        '<div class="erx-evfoot">' +
          '<div class="erx-people">' +
            (gc ? '<div class="erx-avstack">' + names.slice(0, 4).map(function (n) {
              return '<em title="' + esc(n.n) + '">' + esc(initials(n.n)) + '</em>';
            }).join("") + '</div>' : '') +
            '<span>' + (gc ? fa(gc) + (cap ? " از " + fa(cap) : "") + ' نفر' : "هنوز کسی ثبت‌نام نکرده") + '</span>' +
          '</div>' +
          '<div class="erx-evbtns">' +
            '<button class="btn mini erx-join' + (mine ? " on" : "") + '" type="button" ' +
              'data-erx-join="' + esc(e.id) + '" aria-pressed="' + (mine ? "true" : "false") + '"' +
              (disabled ? " disabled" : "") + ">" + label + "</button>" +
            '<button class="btn mini erx-morebtn" type="button" data-erx-more="' + esc(e.id) + '">' +
              (open ? "بستن" : "جزئیات") + '</button>' +
          '</div>' +
        '</div>' +
        moreHTML(e, open, names) +
      '</div>' +
    '</article>';
    return h;
  }

  function moreHTML(e, open, names) {
    var ph = phase(e), cap = Number(e.cap) || 0, link = safeUrl(e.link);
    var org = (S.users[e.by] && S.users[e.by].name) || e.byn || "تیم رونین";
    var h = '<div class="erx-evmore"' + (open ? "" : " hidden") + '>' +
      '<p>' + (e.body ? esc(e.body) : "توضیحی برای این رویداد ثبت نشده است.") + '</p>' +
      '<div class="erx-detailgrid">' +
        '<span><b>میزبان:</b> ' + esc(org) + '</span>' +
        '<span><b>زمان:</b> ' + esc(dateLine(e.start)) + '</span>' +
        '<span><b>مدت:</b> ' + fa(durOf(e)) + ' دقیقه</span>' +
        '<span><b>ظرفیت:</b> ' + (cap ? fa(names.length) + " از " + fa(cap) : "نامحدود") + '</span>' +
      '</div>' +
      (link ? '<a class="erx-linkbtn" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">🔗 لینک رویداد</a>' : '') +
      '<div class="erx-acts" style="margin-top:9px">' +
        (e.start ? '<button class="btn mini" type="button" data-erx-ics="' + esc(e.id) + '">📅 افزودن به تقویم</button>' : '') +
        (e.start && ph !== "past" ? '<button class="btn mini' + (S.rem[e.id] ? " on" : "") +
          '" type="button" data-erx-rem="' + esc(e.id) + '">' + (S.rem[e.id] ? "🔔 یادآوری فعال" : "🔔 یادآوری") + '</button>' : '') +
        '<button class="btn mini" type="button" data-erx-detail="' + esc(e.id) + '">↗ صفحهٔ رویداد</button>' +
        '<button class="btn mini" type="button" data-erx-share="' + esc(e.id) + '">🔗 اشتراک</button>' +
        '<button class="btn mini" type="button" data-erx-copy="' + esc(e.id) + '">📋 کپی لینک</button>' +
        (canManage() ? '<button class="btn mini erx-delbtn" type="button" data-erx-del="' + esc(e.id) + '">🗑 حذف</button>' : '') +
      '</div>' +
      '<div class="erx-peoplelist"><b>شرکت‌کننده‌ها</b>' +
        (names.length ? names.map(function (n) { return '<span>' + esc(n.n) + '</span>'; }).join("") : "هنوز کسی ثبت نکرده است.") +
      '</div>' +
    '</div>';
    return h;
  }

  function renderEventsList() {
    var box = byId("erxEvList");
    if (!box) return;
    if (!S.evReady) {
      box.innerHTML = '<div class="erx-skel"><i></i><i></i><i></i></div>';
      return;
    }
    if (S.evErr) {
      box.innerHTML = emptyBox("🛡", "خواندن رویدادها ممکن نشد",
        "اتصال به تقویم برقرار نشد. کمی بعد دوباره تلاش کن.");
      return;
    }
    if (S.evMode === "mine" && !R.ME) {
      box.innerHTML = emptyBox("🔐", "برای دیدن رویدادهایت وارد شو",
        "بعد از ورود، رویدادهایی که در آن‌ها ثبت‌نام کرده‌ای اینجا می‌آید.",
        '<button class="btn p mini" type="button" data-authopen="login">ورود به رونین</button>');
      return;
    }

    var all = allEvents();
    if (!all.length) {
      box.innerHTML = emptyBox("🗓", "هنوز رویدادی ساخته نشده",
        canManage() ? "اولین رویداد را بساز؛ ثبت‌نام و شمارش معکوس خودکار فعال می‌شود."
                    : "به‌زودی برنامه‌های جدید اینجا منتشر می‌شود.",
        canManage() ? '<button class="btn p mini" type="button" data-erx-new>ساخت اولین رویداد</button>' : "");
      return;
    }

    var list = filteredEvents();
    if (!list.length) {
      var txt = S.evMode === "upcoming" ? "فعلاً رویداد پیش‌رویی ثبت نشده است."
        : S.evMode === "mine" ? "در هیچ رویدادی ثبت‌نام نکرده‌ای."
        : S.evMode === "past" ? "هنوز رویدادی به پایان نرسیده است."
        : "در این فیلتر رویدادی نیست.";
      box.innerHTML = emptyBox("📭", "این فهرست خالی است", txt,
        '<button class="btn mini" type="button" data-erx-emode="all">دیدن همهٔ رویدادها</button>');
      return;
    }
    box.innerHTML = list.map(eventCard).join("");
  }

  /* ── تعامل رویدادها ────────────────────────────────────── */
  function eventsClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("[data-erx-back]")) { closeDetail(); return; }
    var page = t.closest("[data-erx-detail]");
    if (page) { openDetail(page.getAttribute("data-erx-detail"), true); return; }
    var edit = t.closest("[data-erx-edit]");
    if (edit) { openForm(edit.getAttribute("data-erx-edit")); return; }
    var copy = t.closest("[data-erx-copy]");
    if (copy) { copyEventLink(copy.getAttribute("data-erx-copy")); return; }
    var tab = t.closest("[data-erx-emode]");
    if (tab) {
      S.evMode = tab.getAttribute("data-erx-emode") || "all";
      renderEvents();
      return;
    }
    if (t.closest("[data-erx-new]")) {
      openForm();
      return;
    }
    if (t.closest("[data-erx-closeform]")) {
      closeForm(false);
      return;
    }
    var join = t.closest("[data-erx-join]");
    if (join) { toggleGoing(join.getAttribute("data-erx-join")); return; }
    var more = t.closest("[data-erx-more]");
    if (more) {
      var id = more.getAttribute("data-erx-more");
      S.openEv = S.openEv === id ? null : id;
      renderEvents();
      if (S.openEv) {
        var card = document.querySelector('[data-erx-ev="' + cssEsc(id) + '"]');
        if (card) setTimeout(function () { try { card.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (x) {} }, 60);
      }
      return;
    }
    var ics = t.closest("[data-erx-ics]");
    if (ics) { saveICS(ics.getAttribute("data-erx-ics")); return; }
    var rem = t.closest("[data-erx-rem]");
    if (rem) { toggleReminder(rem.getAttribute("data-erx-rem")); return; }
    var share = t.closest("[data-erx-share]");
    if (share) { shareEvent(share.getAttribute("data-erx-share")); return; }
    var del = t.closest("[data-erx-del]");
    if (del) { deleteEvent(del.getAttribute("data-erx-del")); return; }
  }

  function cssEsc(v) {
    if (window.CSS && CSS.escape) return CSS.escape(String(v));
    return String(v).replace(/["\\]/g, "\\$&");
  }

  function openDetail(id, push) {
    if (!id) return;
    if (R.cur !== "events") {
      S.detail = null;
      R.go("events");
    }
    S.detail = id;
    S.openEv = null;
    closeForm(false);
    renderEvents();
    var hash = "#event/" + encodeURIComponent(id);
    if (push) {
      if (location.hash !== hash) setHash(hash, false);
    } else {
      setHash(hash, true);
    }
    setTimeout(function () {
      var sec = byId("sec-events");
      if (sec) window.scrollTo(0, Math.max(0, sec.offsetTop - 72));
    }, 40);
  }

  function closeDetail() {
    S.detail = null;
    closeForm(false);
    setHash("#events", true);
    renderEvents();
    var sec = byId("sec-events");
    if (sec) window.scrollTo(0, Math.max(0, sec.offsetTop - 72));
  }

  function routeFromHash() {
    var id = parseEventHash();
    if (id) { openDetail(id, false); return; }
    if (S.detail) {
      S.detail = null;
      closeForm(false);
      renderEvents();
    }
  }

  function resetFormFields() {
    ["erxEvTitle", "erxEvPlace", "erxEvLink", "erxEvBody"].forEach(function (id) {
      var n = byId(id); if (n) n.value = "";
    });
    var cap = byId("erxEvCap"); if (cap) cap.value = "0";
    var kind = byId("erxEvKind"); if (kind) kind.value = "tournament";
    var dur = byId("erxEvDur"); if (dur) dur.value = "90";
    var start = byId("erxEvStart"); if (start) start.value = defaultStart();
  }
  function setFormMode(id) {
    var head = byId("erxEvFormTitle");
    var save = byId("erxEvSave");
    if (head) head.textContent = id ? "ویرایش رویداد" : "ساخت رویداد جدید";
    if (save) save.textContent = id ? "ذخیرهٔ تغییرات" : "ثبت رویداد";
  }
  function fillForm(e) {
    if (!e) return;
    var title = byId("erxEvTitle");
    if (title) title.value = e.title || "";
    var kind = byId("erxEvKind"); if (kind) kind.value = e.kind || "other";
    var start = byId("erxEvStart"); if (start) start.value = e.start ? dtLocal(e.start) : defaultStart();
    var dur = byId("erxEvDur"); if (dur) dur.value = String(durOf(e));
    var place = byId("erxEvPlace"); if (place) place.value = e.place || "";
    var link = byId("erxEvLink"); if (link) link.value = e.link || "";
    var cap = byId("erxEvCap"); if (cap) cap.value = String(Number(e.cap) || 0);
    var body = byId("erxEvBody"); if (body) body.value = e.body || "";
  }
  function openForm(id) {
    if (!canManage()) { toast("ساخت رویداد فقط برای مالک و تیم مجاز است", "err"); return; }
    if (id && !S.events[id]) { toast("این رویداد پیدا نشد", "err"); return; }
    var f = byId("erxEvForm");
    if (!f) return;
    S.editEv = id || null;
    f.hidden = false;
    if (id) fillForm(findEvent(id));
    else resetFormFields();
    setFormMode(S.editEv);
    syncDetailMode();
    try { f.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    var t = byId("erxEvTitle");
    if (t) setTimeout(function () { try { t.focus(); } catch (e) {} }, 120);
  }
  function closeForm(reset) {
    S.editEv = null;
    setFormMode(null);
    var f = byId("erxEvForm"); if (f) f.hidden = true;
    if (reset) resetFormFields();
    syncDetailMode();
  }

  function dtLocal(ts) {
    var d = new Date(ts);
    function p(n) { return ("0" + n).slice(-2); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
      "T" + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function defaultStart() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(21, 0, 0, 0);
    return dtLocal(d.getTime());
  }

  function saveEvent() {
    if (!canManage()) { toast("دسترسی ساخت رویداد نداری", "err"); return; }
    var editId = S.editEv;
    if (editId && !S.events[editId]) { toast("این رویداد پیدا نشد", "err"); closeForm(false); return; }
    var title = R.clean ? R.clean(byId("erxEvTitle") ? byId("erxEvTitle").value : "", 90)
                        : String((byId("erxEvTitle") || {}).value || "").trim().slice(0, 90);
    if (title.length < 3) { toast("عنوان رویداد را کامل بنویس", "err"); return; }
    var startVal = byId("erxEvStart") ? byId("erxEvStart").value : "";
    var start = startVal ? new Date(startVal).getTime() : 0;
    if (!start || isNaN(start)) { toast("زمان شروع را انتخاب کن", "err"); return; }
    if (!editId && start < Date.now() - 60000) { toast("زمان شروع نمی‌تواند در گذشته باشد", "err"); return; }
    var dur = Number((byId("erxEvDur") || {}).value) || 90;
    var kind = (byId("erxEvKind") || {}).value || "other";
    if (!KINDS[kind]) kind = "other";
    var place = R.clean ? R.clean((byId("erxEvPlace") || {}).value || "", 60)
                        : String((byId("erxEvPlace") || {}).value || "").trim().slice(0, 60);
    var link = R.clean ? R.clean((byId("erxEvLink") || {}).value || "", 300)
                       : String((byId("erxEvLink") || {}).value || "").trim().slice(0, 300);
    var body = String((byId("erxEvBody") || {}).value || "").trim().slice(0, 600);
    var cap = Math.max(0, parseInt((byId("erxEvCap") || {}).value, 10) || 0);
    var btn = byId("erxEvSave");
    if (btn) { btn.disabled = true; btn.textContent = editId ? "در حال ذخیره…" : "در حال ثبت…"; }

    var payload = {
      title: title, body: body, kind: kind, start: start, dur: dur,
      place: place, link: link, cap: cap
    };
    var op;
    try {
      if (editId) {
        payload.updated = Date.now();
        payload.upby = R.ME || "";
        op = R.upd ? R.upd("events/" + editId, payload)
                   : R.db.ref("events/" + editId).update(payload);
      } else {
        payload.by = R.ME || "";
        payload.byn = (R.USER && R.USER.name) || "تیم رونین";
        payload.t = Date.now();
        op = R.add("events", payload);
      }
    } catch (err) { op = Promise.reject(err); }
    Promise.resolve(op).then(function () {
      toast(editId ? "تغییرات رویداد ذخیره شد ✅" : "رویداد ثبت شد ✅", "ok");
      if (editId) S.events[editId] = Object.assign({}, S.events[editId] || {}, payload);
      else S.evMode = "all";
      resetFormFields();
      closeForm(false);
      renderEvents();
    }).catch(function (err) {
      toast((editId ? "ذخیره نشد: " : "رویداد ثبت نشد: ") + ((err && err.message) || "خطای دسترسی"), "err");
    }).then(function () {
      if (btn) { btn.disabled = false; setFormMode(S.editEv); }
    });
  }

  function deleteEvent(id) {
    if (!canManage()) return;
    var e = S.events[id];
    if (!e) return;
    if (!window.confirm("رویداد «" + (e.title || "") + "» حذف شود؟")) return;
    if (!R.db) { toast("اتصال به دیتابیس نیست", "err"); return; }
    R.db.ref("events/" + id).remove().then(function () {
      delete S.events[id];
      if (S.openEv === id) S.openEv = null;
      if (S.detail === id) { S.detail = null; closeForm(false); setHash("#events", true); }
      renderEvents();
      toast("رویداد حذف شد", "ok");
    }).catch(function (err) {
      toast("حذف نشد: " + ((err && err.message) || "خطای دسترسی"), "err");
    });
  }

  function toggleGoing(id) {
    var e = S.events[id];
    if (!e) return;
    if (!R.ME) {
      if (R.needLogin) R.needLogin("شرکت در رویداد");
      else toast("برای ثبت‌نام وارد حساب شو", "err");
      return;
    }
    if (!e.start) { toast("زمان این رویداد مشخص نیست", "err"); return; }
    if (phase(e) === "past") { toast("این رویداد به پایان رسیده است", "err"); return; }
    if (S.busy[id]) return;
    if (!R.db) { toast("اتصال به دیتابیس نیست", "err"); return; }

    var going = e.going && typeof e.going === "object" ? e.going : {};
    var mine = !!going[R.ME];
    var cap = Number(e.cap) || 0;
    if (!mine && cap > 0 && Object.keys(going).length >= cap) {
      toast("ظرفیت این رویداد تکمیل است", "err");
      return;
    }
    S.busy[id] = true;
    var ref = R.db.ref("events/" + id + "/going/" + R.ME);
    var op;
    if (mine) {
      delete going[R.ME];
      e.going = going;
      op = ref.remove();
    } else {
      going[R.ME] = { n: meName(), t: Date.now() };
      e.going = going;
      op = ref.set({ n: meName(), t: Date.now() });
    }
    renderEvents();
    Promise.resolve(op).then(function () {
      S.busy[id] = false;
    }).catch(function (err) {
      S.busy[id] = false;
      toast("ثبت‌نام انجام نشد: " + ((err && err.message) || "خطای دسترسی"), "err");
      if (R.get) R.get("events/" + id + "/going").then(function (g) {
        if (S.events[id]) { S.events[id].going = g || {}; renderEvents(); }
      }).catch(function () {});
      renderEvents();
    });
  }

  function toggleReminder(id) {
    var e = S.events[id];
    if (!e || !e.start) return;
    if (S.rem[id]) {
      delete S.rem[id];
      toast("یادآوری حذف شد", "ok");
    } else {
      S.rem[id] = 1;
      delete S.fired[id + "|" + e.start];
      toast("یادآوری ثبت شد؛ تا ۱۵ دقیقه قبل از شروع خبر می‌دهم 🔔", "ok");
      if (window.Notification && Notification.permission === "default") {
        try { Notification.requestPermission(); } catch (x) {}
      }
    }
    saveStore();
    renderEvents();
  }

  function checkReminders() {
    var now = Date.now(), dirty = false;
    Object.keys(S.rem).forEach(function (id) {
      var e = S.events[id];
      if (!e || !e.start) return;
      var key = id + "|" + e.start;
      if (S.fired[key]) return;
      var diff = e.start - now;
      if (diff > 0 && diff <= 15 * 60000) {
        S.fired[key] = 1;
        dirty = true;
        toast("⏰ «" + (e.title || "رویداد") + "» تا ۱۵ دقیقهٔ دیگر شروع می‌شود", "ok");
        notifyBrowser(e);
      }
    });
    if (dirty) saveStore();
  }

  function notifyBrowser(e) {
    try {
      if (!window.Notification || Notification.permission !== "granted") return;
      new Notification("رونین • رویداد نزدیک", {
        body: (e.title || "رویداد") + " تا ۱۵ دقیقهٔ دیگر شروع می‌شود.",
        icon: "icon-192.png"
      });
    } catch (x) {}
  }

  function shareEvent(id) {
    var e = S.events[id];
    if (!e) return;
    var text = "📅 " + (e.title || "رویداد") + "\n" + dateLine(e.start) +
      (e.place ? "\n📍 " + e.place : "") + "\nاز تقویم رونین";
    var url = eventURL(id);
    if (navigator.share) {
      navigator.share({ title: e.title || "رویداد رونین", text: text, url: url }).catch(function () {});
      return;
    }
    copyText(text + "\n" + url);
  }

  function copyEventLink(id) {
    var e = S.events[id];
    if (!e) return;
    copyText("📅 " + (e.title || "رویداد") + "\n" + eventURL(id));
  }

  function copyText(text) {
    function fallback() {
      var a = document.createElement("textarea");
      a.value = text;
      a.style.position = "fixed";
      a.style.top = "-1000px";
      document.body.appendChild(a);
      a.focus(); a.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (x) {}
      a.remove();
      toast(ok ? "لینک رویداد کپی شد 🔗" : "کپی نشد؛ لینک را دستی بردار", ok ? "ok" : "err");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast("لینک رویداد کپی شد 🔗", "ok");
      }).catch(fallback);
    } else fallback();
  }

  function icsEscape(v) {
    return String(v || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
      .replace(/,/g, "\\,").replace(/;/g, "\\;");
  }
  function icsTime(ts) {
    return new Date(ts).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function saveICS(id) {
    var e = S.events[id];
    if (!e || !e.start) { toast("این رویداد زمان مشخصی ندارد", "err"); return; }
    var end = endOf(e);
    var link = safeUrl(e.link);
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RONIN//EVENTS//FA",
      "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:ronin-" + String(id).replace(/[^a-z0-9_-]/gi, "") + "@ronin-store",
      "DTSTAMP:" + icsTime(Date.now()),
      "DTSTART:" + icsTime(e.start),
      "DTEND:" + icsTime(end),
      "SUMMARY:" + icsEscape(e.title),
      "DESCRIPTION:" + icsEscape(e.body || "رویداد رونین"),
      "LOCATION:" + icsEscape(e.place || "رونین"),
      (link ? "URL:" + link : ""),
      "END:VEVENT", "END:VCALENDAR", ""
    ].filter(Boolean);
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ronin-event-" + String(id).replace(/[^a-z0-9_-]/gi, "") + ".ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast("فایل تقویم آماده شد 📅", "ok");
  }

  /* ── ذخیره‌سازی یادآوری‌ها ─────────────────────────────── */
  function loadStore() {
    try { S.rem = JSON.parse(localStorage.getItem("rn_erx_rem") || "{}") || {}; } catch (e) { S.rem = {}; }
    try { S.fired = JSON.parse(localStorage.getItem("rn_erx_fired") || "{}") || {}; } catch (e) { S.fired = {}; }
  }
  function saveStore() {
    try { localStorage.setItem("rn_erx_rem", JSON.stringify(S.rem)); } catch (e) {}
    try { localStorage.setItem("rn_erx_fired", JSON.stringify(S.fired)); } catch (e) {}
  }

  /* ── تیک شمارش معکوس و یادآوری ─────────────────────────── */
  function tick() {
    if (!built || document.hidden) return;
    var nodes = document.querySelectorAll("[data-erx-cd]");
    var need = false, now = Date.now();
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var start = Number(n.getAttribute("data-start")) || 0;
      if (!start) continue;
      var dur = Number(n.getAttribute("data-dur")) || 90;
      var end = start + dur * 60000;
      var ph = now < start ? "soon" : now < end ? "live" : "past";
      var target = ph === "live" ? end : start;
      var txt = cdText(target - now);
      if (n.textContent !== txt) n.textContent = txt;
      if (n.getAttribute("data-phase") !== ph) {
        n.setAttribute("data-phase", ph);
        need = true;
      }
    }
    checkReminders();
    if (need) renderEvents();
  }

  /* ── Firebase ──────────────────────────────────────────── */
  function watchUsers(force) {
    if (!R.db) {
      S.rankReady = true; S.rankErr = true; renderRank(); return;
    }
    if (force && usersRef) {
      try { usersRef.off("value", usersCb); } catch (e) {}
      usersOn = false;
    }
    if (usersOn) return;
    usersOn = true;
    try {
      if (!usersRef) usersRef = R.db.ref("users");
      usersRef.on("value", usersCb, function (err) {
        usersOn = false;
        S.rankReady = true;
        S.rankErr = true;
        console.warn("[Ronin] ranking users:", err && err.message);
        renderRank();
      });
    } catch (e) {
      usersOn = false;
      S.rankReady = true;
      S.rankErr = true;
      renderRank();
    }
  }
  function usersCb(s) {
    S.users = s.val() || {};
    S.rankReady = true;
    S.rankErr = false;
    usersOn = true;
    if (R.ME && R.USER) S.users[R.ME] = S.users[R.ME] || R.USER;
    renderRank();
  }

  function watchEvents(force) {
    if (!R.db) {
      S.evReady = true; S.evErr = true; renderEvents(); return;
    }
    if (force && eventsRef) {
      try { eventsRef.off("value", eventsCb); } catch (e) {}
    }
    try {
      if (!eventsRef || force) eventsRef = R.db.ref("events");
      eventsRef.on("value", eventsCb, function (err) {
        S.evReady = true;
        S.evErr = true;
        console.warn("[Ronin] events:", err && err.message);
        renderEvents();
      });
    } catch (e) {
      S.evReady = true;
      S.evErr = true;
      renderEvents();
    }
  }
  function eventsCb(s) {
    S.events = s.val() || {};
    S.evReady = true;
    S.evErr = false;
    if (S.openEv && !S.events[S.openEv]) S.openEv = null;
    renderEvents();
  }

  /* ── ورود / خروج ───────────────────────────────────────── */
  function afterAuth() {
    if (R.ME && R.USER) {
      S.users[R.ME] = S.users[R.ME] || R.USER;
    }
    if (S.rankErr || !usersOn) watchUsers(true);
    else renderRank();
    if (S.evErr) watchEvents(true);
    renderEvents();
  }
  function afterLogout() {
    S.users = {};
    S.rankReady = true;
    S.rankErr = true;
    usersOn = false;
    if (usersRef) {
      try { usersRef.off("value", usersCb); } catch (e) {}
    }
    if (S.evMode === "mine") S.evMode = "all";
    renderRank();
    renderEvents();
    setTimeout(function () { if (!R.ME) watchUsers(); }, 500);
  }
  function bindAuth() {
    var pIn = R.onLogin;
    R.onLogin = function () {
      if (typeof pIn === "function") { try { pIn.apply(R, arguments); } catch (e) { console.error(e); } }
      try { afterAuth(); } catch (e) { console.error(e); }
    };
    var pOut = R.onLogout;
    R.onLogout = function () {
      if (typeof pOut === "function") { try { pOut.apply(R, arguments); } catch (e) { console.error(e); } }
      try { afterLogout(); } catch (e) { console.error(e); }
    };
  }

  /* ── قلاب‌ها و راه‌اندازی ──────────────────────────────── */
  function installHooks() {
    if (!R.hooks) R.hooks = {};
    R.hooks.rank = function () { ensureRank(); renderRank(); };
    R.hooks.events = function () {
      ensureEvents();
      if (S.detail && !parseEventHash()) {
        S.detail = null;
        closeForm(false);
      }
      renderEvents();
    };
  }

  function boot() {
    if (built) return;
    if (!R.$ || !byId("sec-rank") || !byId("sec-events")) return;
    built = true;
    loadStore();
    ensureRank();
    ensureEvents();
    bindAuth();
    installHooks();
    watchUsers();
    watchEvents();
    renderRank();
    renderEvents();
    window.addEventListener("hashchange", routeFromHash);
    setTimeout(routeFromHash, 0);
    setInterval(tick, 1000);
    setTimeout(installHooks, 1200);
  }

  ER.paintRank = function () { ensureRank(); renderRank(); };
  ER.paintEvents = function () { ensureEvents(); renderEvents(); };
  ER.openEvent = function (id) { openDetail(id, true); };
  ER.closeEvent = function () { closeDetail(); };
  ER.preview = function (users, events) {
    if (users) { S.users = users; S.rankReady = true; S.rankErr = false; }
    if (events) { S.events = events; S.evReady = true; S.evErr = false; }
    ensureRank(); ensureEvents();
    renderRank(); renderEvents();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  } else {
    setTimeout(boot, 0);
  }
  setTimeout(boot, 1400);
})();
