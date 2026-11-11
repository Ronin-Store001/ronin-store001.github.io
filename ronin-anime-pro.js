/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — ANIME WORLD  ·  ronin-anime-pro.js  (v1)
   بخش «دنیای انیمه» با الهام از listanime:
   پوستر + امتیاز + وضعیت پخش + فصل/قسمت + زیرنویس/دوبله + بازدید،
   ردیف‌های افقی (محبوب‌ترین / تازه‌ترین / سینمایی) و فیلتر پیشرفته.
   کاملاً افزودنی است؛ بخش و منو را خودش می‌سازد و به فایل‌های اصلی
   دست نمی‌زند. داده را از همان مسیر Firebase «anime» می‌خواند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  if (R.__animePro) return;
  R.__animePro = true;

  /* ── ابزارها ─────────────────────────────────────────────── */
  function esc(s) {
    if (R.esc) return R.esc(s);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(x) { return Number(x) || 0; }
  function el(id) { return document.getElementById(id); }
  function hash(s) {
    var h = 0, str = String(s || "");
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }

  /* ── استایل‌ها ───────────────────────────────────────────── */
  function css(href) {
    if (document.querySelector('link[href^="' + href + '"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href + "?v=1";
    (document.head || document.documentElement).appendChild(l);
  }

  /* ── داده نمونه (تا وقتی مالک انیمه‌ای اضافه نکرده) ─────────── */
  var DEMO = [
    { id: "d1", title: "حمله به تایتان", jp: "進撃の巨人", icon: "⚔️", gen: "اکشن، درام", st: "اتمام پخش", rate: "9.1", year: 2013, ep: 25, season: 1, desc: "بشریت پشت دیوارهای بلند در برابر تایتان‌ها می‌جنگد؛ داستانی دربارهٔ آزادی، ترس و انتخاب." },
    { id: "d2", title: "جوجوتسو کای‌سن", jp: "呪術廻戦", icon: "🌀", gen: "اکشن، ماوراءطبیعی", st: "در حال پخش", rate: "8.7", year: 2020, ep: 24, season: 2, desc: "یوجی ایتادوری پس از بلعیدن انگشت نفرین‌شده، وارد دنیای جادوگران می‌شود." },
    { id: "d3", title: "شیطان‌کش", jp: "鬼滅の刃", icon: "🗡️", gen: "اکشن، فانتزی", st: "در حال پخش", rate: "8.9", year: 2019, ep: 26, season: 4, desc: "تانجیرو برای نجات خواهرش و انتقام خانواده‌اش، شکارچی شیطان می‌شود." },
    { id: "d4", title: "وان پیس", jp: "ONE PIECE", icon: "🏴‍☠️", gen: "ماجراجویی، کمدی", st: "در حال پخش", rate: "9.0", year: 1999, ep: 1100, season: 20, desc: "لوفی و خدمه‌اش در جست‌وجوی گنج افسانه‌ای، دریای بزرگ را می‌پیمایند." },
    { id: "d5", title: "سولو لولینگ", jp: "俺だけレベルアップな件", icon: "👑", gen: "اکشن، فانتزی", st: "در حال پخش", rate: "8.4", year: 2024, ep: 12, season: 2, desc: "شکارچی ضعیفی که تنها می‌تواند سطح خودش را بالا ببرد، به قدرت بزرگی می‌رسد." },
    { id: "d6", title: "مرد زنجیره‌ای", jp: "チェンソーマン", icon: "🩸", gen: "اکشن، ترسناک", st: "اتمام پخش", rate: "8.5", year: 2022, ep: 12, season: 1, desc: "دنجی با شیطان اره‌برقی متحد می‌شود تا بدهی‌اش را بپردازد." },
    { id: "d7", title: "فریرن", jp: "葬送のフリーレン", icon: "🌿", gen: "فانتزی، ماجراجویی", st: "اتمام پخش", rate: "9.3", year: 2023, ep: 28, season: 1, desc: "الف جادوگری پس از شکست پادشاه شیاطین، معنای زمان و دوستی را کشف می‌کند." },
    { id: "d8", title: "جاسوس × خانواده", jp: "SPY×FAMILY", icon: "🕵️", gen: "کمدی، اکشن", st: "در حال پخش", rate: "8.6", year: 2022, ep: 12, season: 3, desc: "یک جاسوس، یک قاتل و یک دختر تله‌پات، خانواده‌ای ساختگی می‌سازند." },
    { id: "d9", title: "بلو لاک", jp: "ブルーロック", icon: "⚽", gen: "ورزشی، درام", st: "در حال پخش", rate: "8.3", year: 2022, ep: 24, season: 2, desc: "۳۰۰ مهاجم جوان برای تبدیل شدن به بهترین گلزن ژاپن رقابت می‌کنند." },
    { id: "d10", title: "توکیو ریونجرز", jp: "東京リベンジャーズ", icon: "🏍️", gen: "اکشن، درام", st: "اتمام پخش", rate: "8.2", year: 2021, ep: 24, season: 3, desc: "تاکه‌میچی با سفر در زمان تلاش می‌کند گذشته و دوستانش را نجات دهد." },
    { id: "d11", title: "وایولت اورگاردن", jp: "ヴァイオレット・エヴァーガーデン", icon: "🕊️", gen: "درام، احساسی", st: "اتمام پخش", rate: "8.9", year: 2018, ep: 13, season: 1, desc: "دختری که فقط جنگ را می‌شناسد، با نوشتن نامه معنا و احساس را می‌آموزد." },
    { id: "d12", title: "ناروتو شیپودن", jp: "ナルト 疾風伝", icon: "🍥", gen: "اکشن، نینجا", st: "اتمام پخش", rate: "8.7", year: 2007, ep: 500, season: 1, desc: "ناروتو پس از دو سال آموزش، به دهکده برمی‌گردد تا هوکاگه شود." },
    { id: "d13", title: "فیلم: جوجوتسو ۰", jp: "呪術廻戦 0", icon: "🎬", gen: "سینمایی، اکشن", st: "اتمام پخش", rate: "8.5", year: 2021, ep: 1, season: 1, desc: "یوتا اوکوتسو می‌خواهد نفرین ری‌کا را از بین ببرد." },
    { id: "d14", title: "فیلم: قلعهٔ بی‌پایان", jp: "無限城", icon: "🏯", gen: "سینمایی، فانتزی", st: "در حال پخش", rate: "8.9", year: 2025, ep: 1, season: 1, desc: "نبرد نهایی شکارچیان شیطان در قلعهٔ بی‌پایان آغاز می‌شود." }
  ];

  /* ── ساخت مارک‌آپ بخش ─────────────────────────────────────── */
  function sectionHTML() {
    return '<div class="apWrap">' +
      '<div class="apHero"><div class="apHeroTx">' +
      '<span class="apKicker">RONIN ANIME WORLD</span>' +
      '<h2 class="apHeroTitle">دنیای انیمه رونین</h2>' +
      '<p class="apHeroSub">پوستر، امتیاز، وضعیت پخش، فصل و قسمت، زیرنویس و دوبله — همه یک‌جا و مرتب.</p>' +
      "</div>" +
      '<div class="apHeroStats">' +
      '<div><b id="apCount">۰</b><span>عنوان</span></div>' +
      '<div><b id="apAiring">۰</b><span>در حال پخش</span></div>' +
      '<div><b id="apGenreCount">۰</b><span>ژانر</span></div>' +
      "</div></div>" +
      '<div class="apFilters">' +
      '<div class="apSearch"><input id="apQ" type="search" placeholder="جستجوی انیمه…" autocomplete="off" maxlength="50"><i aria-hidden="true">⌕</i></div>' +
      '<div class="apChips" id="apGenres"></div>' +
      '<div class="apSelects" id="apSelects"></div>' +
      "</div>" +
      '<div id="apRows"></div>' +
      '<div class="apGridHead"><h3 class="apH3">همهٔ انیمه‌ها</h3><span class="apCountChip" id="apShown">—</span></div>' +
      '<div id="apGrid" class="apGrid"></div>' +
      '<div id="apEmpty" class="apEmpty hide"></div>' +
      '<details class="apOwner" id="animeForm" style="display:none">' +
      "<summary>➕ افزودن انیمه (مالک)</summary>" +
      '<div class="apForm">' +
      '<input class="inp" id="anTitle" placeholder="نام فارسی" maxlength="60">' +
      '<input class="inp" id="anJp" placeholder="نام ژاپنی" dir="ltr" maxlength="60">' +
      '<input class="inp" id="anIcon" placeholder="ایموجی پوستر" maxlength="4">' +
      '<input class="inp" id="anGen" placeholder="ژانر (اکشن، فانتزی)" maxlength="40">' +
      '<input class="inp" id="anStatus" placeholder="وضعیت (در حال پخش)" maxlength="30">' +
      '<input class="inp" id="anRate" placeholder="امتیاز (8.7)" maxlength="5">' +
      '<textarea class="area" id="anDesc" placeholder="توضیح کوتاه" maxlength="400"></textarea>' +
      '<button class="btn gd" id="apAdd" type="button">افزودن انیمه</button>' +
      "</div></details></div>";
  }

  function mount() {
    if (!el("sec-anime")) {
      var sec = document.createElement("section");
      sec.className = "sec";
      sec.id = "sec-anime";
      sec.innerHTML = sectionHTML();
      var stage = el("stage");
      var rank = el("sec-rank");
      if (stage && rank && rank.parentNode === stage) stage.insertBefore(sec, rank);
      else if (stage) stage.appendChild(sec);
      else return;
    }
    /* آیتم منوی کناری */
    var rail = document.querySelector('#rail .ditem[data-go="discover"]');
    if (rail && !document.querySelector('#rail .ditem[data-go="anime"]')) {
      var item = document.createElement("div");
      item.className = "ditem";
      item.setAttribute("data-go", "anime");
      item.innerHTML = "<i>🌀</i>دنیای انیمه";
      rail.parentNode.insertBefore(item, rail);
    }
    /* آیتم منوی هدر */
    var navDisc = document.querySelector('#top .nav a[data-go="discover"]');
    if (navDisc && !document.querySelector('#top .nav a[data-go="anime"]')) {
      var a = document.createElement("a");
      a.setAttribute("data-go", "anime");
      a.textContent = "انیمه";
      navDisc.parentNode.insertBefore(a, navDisc.nextSibling);
    }
  }

  /* ── یکسان‌سازی رکورد ───────────────────────────────────── */
  function norm(id, a) {
    var h = hash(a.title || id);
    var st = String(a.st || (num(a.t) ? "در حال پخش" : "اتمام پخش"));
    var gen = String(a.gen || "").split(/[،,\/|]/).map(function (g) { return g.trim(); }).filter(Boolean);
    var kind = a.kind || (/سینمایی|فیلم/.test(String(a.gen || "") + " " + String(a.title || "")) ? "movie" : "tv");
    var rate = num(String(a.rate || "").replace(/[^\d.]/g, ""));
    var year = num(a.year) || (num(a.t) ? new Date(num(a.t)).getFullYear() : 2018 + (h % 7));
    return {
      id: id, demo: !!a.__demo,
      title: String(a.title || "بدون نام"),
      jp: String(a.jp || ""),
      icon: String(a.icon || "🎬").slice(0, 4) || "🎬",
      poster: a.poster || "",
      gen: gen, st: st,
      live: /پخش/.test(st) && !/اتمام|پایان|تمام/.test(st),
      rate: rate || (7 + (h % 25) / 10),
      year: year,
      ep: num(a.ep) || (1 + (h % 24)),
      season: num(a.season) || (1 + (h % 4)),
      kind: kind,
      views: num(a.views) || (1200 + (h % 88000)),
      sub: a.sub !== false,
      dub: a.dub === true || (h % 3 === 0),
      desc: String(a.desc || ""),
      hue: h % 360
    };
  }

  function all() {
    var out = [];
    var src = R.ANIME || {};
    Object.keys(src).forEach(function (k) {
      var a = src[k];
      if (a && a.title) out.push(norm(k, a));
    });
    if (!out.length) {
      DEMO.forEach(function (d) {
        var x = {}, k;
        for (k in d) x[k] = d[k];
        x.__demo = true;
        out.push(norm(d.id, x));
      });
    }
    return out;
  }

  function kfmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  /* ── فیلترها ─────────────────────────────────────────────── */
  var F = { q: "", gen: "", year: "", rate: "", st: "", kind: "", sort: "pop" };

  function match(a) {
    if (F.q) {
      var q = F.q.toLowerCase();
      if ((a.title + " " + a.jp + " " + a.gen.join(" ")).toLowerCase().indexOf(q) < 0) return false;
    }
    if (F.gen && a.gen.indexOf(F.gen) < 0) return false;
    if (F.year && String(a.year) !== String(F.year)) return false;
    if (F.rate === "9" && a.rate < 9) return false;
    if (F.rate === "8" && a.rate < 8) return false;
    if (F.st === "live" && !a.live) return false;
    if (F.st === "done" && a.live) return false;
    if (F.kind && a.kind !== F.kind) return false;
    return true;
  }
  function sortList(l) {
    l.sort(function (a, b) {
      if (F.sort === "new") return b.year - a.year || b.rate - a.rate;
      if (F.sort === "rate") return b.rate - a.rate;
      if (F.sort === "az") return String(a.title).localeCompare(String(b.title), "fa");
      return (b.rate * 1000 + b.views / 1000) - (a.rate * 1000 + a.views / 1000);
    });
    return l;
  }

  /* ── کارت ───────────────────────────────────────────────── */
  function posterBg(a) {
    return "background:linear-gradient(160deg,hsl(" + a.hue + " 68% 34%),hsl(" +
      ((a.hue + 48) % 360) + " 62% 12%) 82%)";
  }
  function card(a) {
    var tags = "";
    if (a.sub) tags += '<span class="apTag">زیرنویس</span>';
    if (a.dub) tags += '<span class="apTag dub">دوبله</span>';
    if (a.demo) tags += '<span class="apTag demo">نمونه</span>';
    return '<article class="apCard" data-apopen="' + esc(a.id) + '" role="button" tabindex="0" aria-label="' + esc(a.title) + '">' +
      '<div class="apPoster" style="' + posterBg(a) + '">' +
      (a.poster ? '<img src="' + esc(a.poster) + '" alt="' + esc(a.title) + '" loading="lazy">' : "") +
      '<span class="apArt">' + esc(a.icon) + "</span>" +
      '<span class="apRate">⭐ ' + fa(a.rate.toFixed(1)) + "</span>" +
      '<span class="apState' + (a.live ? " live" : "") + '">' + esc(a.live ? "در حال پخش" : "اتمام پخش") + "</span>" +
      '<span class="apEp">S' + fa(a.season) + " E" + fa(a.ep) + "</span></div>" +
      '<div class="apBody"><div class="apTitle">' + esc(a.title) + "</div>" +
      (a.jp ? '<div class="apJp">' + esc(a.jp) + "</div>" : "") +
      '<div class="apMeta"><span>' + fa(a.year) + "</span>" +
      (a.gen[0] ? "<span>• " + esc(a.gen[0]) + "</span>" : "") +
      "<span>• 👁 " + fa(kfmt(a.views)) + "</span></div>" +
      '<div class="apTags">' + tags + "</div></div></article>";
  }

  /* ── ردیف‌های افقی ───────────────────────────────────────── */
  function row(title, items) {
    if (!items.length) return "";
    return '<div class="apRow"><div class="apRowHead"><h3 class="apH3">' + title + "</h3></div>" +
      '<div class="apRowTrack">' + items.slice(0, 14).map(card).join("") + "</div></div>";
  }
  function renderRows(base) {
    var box = el("apRows");
    if (!box) return;
    var top = base.slice().sort(function (a, b) { return b.rate - a.rate; });
    var fresh = base.slice().sort(function (a, b) { return b.year - a.year || b.rate - a.rate; });
    var movies = base.filter(function (a) { return a.kind === "movie"; });
    box.innerHTML = row("🔥 محبوب‌ترین‌ها", top) + row("🆕 تازه‌ترین‌ها", fresh) + row("🎬 سینمایی‌ها", movies);
  }

  /* ── آمار / چیپس / سلکت‌ها ───────────────────────────────── */
  function renderStats(base) {
    var c = el("apCount"), l = el("apAiring"), g = el("apGenreCount");
    if (c) c.textContent = fa(base.length);
    if (l) l.textContent = fa(base.filter(function (a) { return a.live; }).length);
    if (g) {
      var set = {};
      base.forEach(function (a) { a.gen.forEach(function (x) { set[x] = 1; }); });
      g.textContent = fa(Object.keys(set).length);
    }
  }
  function renderChips(base) {
    var box = el("apGenres");
    if (!box) return;
    var count = {};
    base.forEach(function (a) { a.gen.forEach(function (x) { count[x] = (count[x] || 0) + 1; }); });
    var list = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 10);
    var h = '<button type="button" class="apChip' + (F.gen ? "" : " on") + '" data-apgen="">همه</button>';
    list.forEach(function (g) {
      h += '<button type="button" class="apChip' + (F.gen === g ? " on" : "") +
        '" data-apgen="' + esc(g) + '">' + esc(g) + "</button>";
    });
    box.innerHTML = h;
  }
  function renderSelects(base) {
    var box = el("apSelects");
    if (!box || box.getAttribute("data-built") === "1") return;
    var years = {};
    base.forEach(function (a) { years[a.year] = 1; });
    var ys = Object.keys(years).sort(function (a, b) { return b - a; });
    function o(v, t) { return '<option value="' + v + '">' + t + "</option>"; }
    box.innerHTML =
      '<select class="apSel" id="apYear">' + o("", "همه سال‌ها") + ys.map(function (y) { return o(y, y); }).join("") + "</select>" +
      '<select class="apSel" id="apRate">' + o("", "همه امتیازها") + o("9", "۹ به بالا") + o("8", "۸ به بالا") + "</select>" +
      '<select class="apSel" id="apSt">' + o("", "همه وضعیت‌ها") + o("live", "در حال پخش") + o("done", "اتمام پخش") + "</select>" +
      '<select class="apSel" id="apKind">' + o("", "سریال و فیلم") + o("tv", "سریال") + o("movie", "سینمایی") + "</select>" +
      '<select class="apSel" id="apSort">' + o("pop", "محبوب‌ترین") + o("new", "جدیدترین") + o("rate", "بیشترین امتیاز") + o("az", "الفبا") + "</select>";
    box.setAttribute("data-built", "1");
    ["apYear", "apRate", "apSt", "apKind", "apSort"].forEach(function (id) {
      var s = el(id);
      if (!s) return;
      s.addEventListener("change", function () {
        if (id === "apYear") F.year = s.value;
        if (id === "apRate") F.rate = s.value;
        if (id === "apSt") F.st = s.value;
        if (id === "apKind") F.kind = s.value;
        if (id === "apSort") F.sort = s.value;
        render();
      });
    });
  }

  /* ── رندر اصلی ──────────────────────────────────────────── */
  function render() {
    var base = all();
    renderStats(base);
    renderChips(base);
    renderSelects(base);

    var list = sortList(base.filter(match));
    var grid = el("apGrid"), empty = el("apEmpty"), shown = el("apShown");
    if (grid) {
      grid.innerHTML = list.map(card).join("");
      grid.style.display = list.length ? "" : "none";
    }
    if (shown) shown.textContent = fa(list.length) + " عنوان";
    if (empty) {
      empty.classList.toggle("hide", list.length > 0);
      empty.innerHTML = "<b>چیزی پیدا نشد 😕</b>فیلترها را عوض کن یا عبارت دیگری جستجو کن.";
    }

    var active = !!(F.q || F.gen || F.year || F.rate || F.st || F.kind);
    renderRows(base);
    var rowsBox = el("apRows");
    if (rowsBox) rowsBox.style.display = active ? "none" : "";

    var form = el("animeForm");
    if (form) form.style.display = ((R.isOwner && R.isOwner()) || (R.can && R.can("anime"))) ? "" : "none";
  }

  /* ── مودال جزئیات ───────────────────────────────────────── */
  var FAV_KEY = "ronin:anime:fav";
  function favs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") || []; } catch (e) { return []; }
  }
  function toggleFav(id) {
    var f = favs(), i = f.indexOf(id);
    if (i < 0) f.push(id); else f.splice(i, 1);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
    return i < 0;
  }
  function openDetail(id) {
    var a = null;
    all().forEach(function (x) { if (x.id === id) a = x; });
    if (!a) return;
    var fav = favs().indexOf(a.id) >= 0;
    var h = '<div class="apd"><div class="apdTop">' +
      '<div class="apdPoster" style="' + posterBg(a) + '">' +
      (a.poster ? '<img src="' + esc(a.poster) + '" alt="">' : "") +
      '<span class="apArt">' + esc(a.icon) + "</span></div>" +
      '<div class="apdInfo"><div class="apdTitle">' + esc(a.title) + "</div>" +
      (a.jp ? '<div class="apdJp">' + esc(a.jp) + "</div>" : "") +
      '<div class="apdChips">' +
      '<span class="apTag">⭐ ' + fa(a.rate.toFixed(1)) + "</span>" +
      '<span class="apTag">' + (a.live ? "🟢 در حال پخش" : "⚪ اتمام پخش") + "</span>" +
      '<span class="apTag">S' + fa(a.season) + " E" + fa(a.ep) + "</span>" +
      '<span class="apTag">' + fa(a.year) + "</span>" +
      (a.sub ? '<span class="apTag">زیرنویس</span>' : "") +
      (a.dub ? '<span class="apTag dub">دوبله</span>' : "") +
      "</div>" +
      '<div class="apdMeta">' + a.gen.map(function (g) { return esc(g); }).join(" • ") +
      " &nbsp;·&nbsp; 👁 " + fa(kfmt(a.views)) + "</div></div></div>" +
      '<div class="apdDesc">' + (a.desc ? esc(a.desc).replace(/\n/g, "<br>") : "توضیحی ثبت نشده است.") + "</div>" +
      '<div class="apdBtns">' +
      '<button class="btn p mini" type="button" data-apwatch="' + esc(a.id) + '">▶ تماشا</button>' +
      '<button class="btn mini" type="button" data-apfav="' + esc(a.id) + '">' + (fav ? "★ در لیست من" : "☆ افزودن به لیست") + "</button>" +
      ((!a.demo && R.isOwner && R.isOwner()) ? '<button class="btn d mini" type="button" data-apdel="' + esc(a.id) + '">🗑 حذف</button>' : "") +
      "</div></div>";
    if (R.openInfo) R.openInfo("🎬 " + a.title, h);
  }

  /* ── رویدادها ───────────────────────────────────────────── */
  function bind() {
    var q = el("apQ");
    if (q) q.addEventListener("input", function () { F.q = q.value.trim(); render(); });

    var add = el("apAdd");
    if (add) add.addEventListener("click", function () {
      if (R.addAnime) R.addAnime();
    });

    var sec = el("sec-anime");
    if (sec) {
      sec.addEventListener("click", function (e) {
        var g = e.target.closest ? e.target.closest("[data-apgen]") : null;
        if (g) { F.gen = g.getAttribute("data-apgen") || ""; render(); return; }
        var c = e.target.closest ? e.target.closest("[data-apopen]") : null;
        if (c) openDetail(c.getAttribute("data-apopen"));
      });
      sec.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var c = e.target.closest ? e.target.closest("[data-apopen]") : null;
        if (c) { e.preventDefault(); openDetail(c.getAttribute("data-apopen")); }
      });
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-apfav],[data-apwatch],[data-apdel],[data-go='anime']") : null;
      if (!t) return;
      if (t.hasAttribute("data-apfav")) {
        var on = toggleFav(t.getAttribute("data-apfav"));
        t.textContent = on ? "★ در لیست من" : "☆ افزودن به لیست";
        if (R.toast) R.toast(on ? "به لیست تو اضافه شد ⭐" : "از لیست حذف شد", "ok");
        return;
      }
      if (t.hasAttribute("data-apwatch")) {
        if (R.toast) R.toast("پخش‌کنندهٔ انیمه به‌زودی فعال می‌شود 🎬", "ok");
        return;
      }
      if (t.hasAttribute("data-apdel")) {
        var id = t.getAttribute("data-apdel");
        if (R.db && window.confirm("این انیمه حذف شود؟")) {
          R.db.ref("anime/" + id).remove().then(function () {
            if (R.toast) R.toast("انیمه حذف شد", "ok");
            if (R.mod) R.mod("infoMod", false);
          }).catch(function (err) {
            if (R.toast) R.toast("نشد: " + err.message, "err");
          });
        }
        return;
      }
      setTimeout(render, 80);
    });
  }

  /* ── اتصال به جریان داده ────────────────────────────────── */
  function hook() {
    if (typeof R.renderAnime === "function" && !R.renderAnime.__ap) {
      var prev = R.renderAnime;
      var wrapped = function () {
        try { prev.apply(R, arguments); } catch (e) {}
        try { render(); } catch (e) {}
      };
      wrapped.__ap = true;
      R.renderAnime = wrapped;
      R.hooks = R.hooks || {};
      R.hooks.anime = wrapped;
    }
    if (R.watchAnime && R.ANIME === undefined) { try { R.watchAnime(); } catch (e) {} }
  }

  /* ── استایل مودال جزئیات ────────────────────────────────── */
  function styleOnce() {
    if (el("apdCSS")) return;
    var s = document.createElement("style");
    s.id = "apdCSS";
    s.textContent =
      ".apd{display:flex;flex-direction:column;gap:13px}" +
      ".apdTop{display:flex;gap:13px;align-items:flex-start}" +
      ".apdPoster{position:relative;flex:0 0 92px;width:92px;aspect-ratio:2/3;border-radius:13px;overflow:hidden;display:grid;place-items:center;box-shadow:0 12px 26px rgba(0,0,0,.5)}" +
      ".apdPoster img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
      ".apdPoster .apArt{font-size:38px;transform:none}" +
      ".apdInfo{min-width:0;flex:1}" +
      ".apdTitle{font-size:17px;font-weight:900;line-height:1.5}" +
      ".apdJp{font-size:11px;opacity:.6;direction:ltr;text-align:start;margin-top:2px}" +
      ".apdChips{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}" +
      ".apdChips .apTag{font-size:10px;padding:3px 8px;border-radius:8px;background:rgba(34,211,238,.14);border:1px solid rgba(34,211,238,.3);color:#bfe9ff}" +
      ".apdChips .apTag.dub{background:rgba(255,79,216,.13);border-color:rgba(255,79,216,.3);color:#ffd9f4}" +
      ".apdMeta{font-size:11px;opacity:.68;margin-top:8px;line-height:1.9}" +
      ".apdDesc{font-size:12.5px;line-height:2;opacity:.9;border-top:1px dashed rgba(140,160,255,.22);padding-top:11px}" +
      ".apdBtns{display:flex;flex-wrap:wrap;gap:7px}";
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── اجرا ───────────────────────────────────────────────── */
  function start() {
    css("ronin-anime-pro.css");
    css("ronin-premium-elite.css");
    mount();
    if (!el("sec-anime")) return;
    styleOnce();
    bind();
    hook();
    render();
    setTimeout(render, 900);
    setTimeout(render, 2600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.addEventListener("load", function () { setTimeout(render, 300); });
})();
