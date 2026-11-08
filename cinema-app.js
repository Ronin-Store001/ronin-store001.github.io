/* ═══════════════════════════════════════════════════════════════
   RONIN CINEMA — cinema-app.js  v1
   صفحهٔ مستقل فیلم / سریال / انیمه
   ───────────────────────────────────────────────────────────────
   • جست‌وجوی زنده + فیلتر پیشرفته + بخش‌های جدا (انیمه، فیلم خارجی، سریال)
   • پلیر اختصاصی: MP4 / HLS / امبد (یوتیوب، آپارات، ویمئو)
     کنترل کامل، ادامهٔ تماشا، سرعت، زیرنویس، کیفیت، PiP، تمام‌صفحه
   • آپلود واقعی برای مالک/تیم: فایل در Firebase Storage، اطلاعات در Realtime DB
     (اگر Storage فعال نباشد، لینک مستقیم هم پذیرفته می‌شود)
   • بدون فایل هم کار می‌کند: کاتالوگ پیش‌فرض داخل همین فایل است
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (window.__rnCinemaApp) return;
  window.__rnCinemaApp = true;

  /* ── ۱. پیکربندی (همان پروژهٔ رونین استور) ─────────────────── */
  var FB = {
    apiKey: "AIzaSyCoGypb6NCmmHr2sK4FLreF4He48QPcLL8",
    authDomain: "ronin-store-3d738.firebaseapp.com",
    databaseURL: "https://ronin-store-3d738-default-rtdb.firebaseio.com",
    projectId: "ronin-store-3d738",
    storageBucket: "ronin-store-3d738.firebasestorage.app",
    messagingSenderId: "7231014477",
    appId: "1:7231014477:web:1607de8a1f602d4ff9be04"
  };
  var PATH = "cinema", WKEY = "ronin_watchlist", POSKEY = "rn_cine_pos";

  /* ── ۲. ابزارها ─────────────────────────────────────────────── */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fa(s) { return String(s).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }); }
  function deb(fn, ms) {
    var t;
    return function () { var a = arguments, x = this; clearTimeout(t); t = setTimeout(function () { fn.apply(x, a); }, ms || 200); };
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function num(n, d) { var v = parseFloat(n); return isFinite(v) ? v : (d || 0); }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function toast(m, k) {
    var box = $("#cxToast");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "cx-toast " + (k || "");
    el.textContent = m;
    box.appendChild(el);
    setTimeout(function () {
      el.style.transition = ".25s"; el.style.opacity = "0"; el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }
  function fmtTime(t) {
    t = Math.max(0, Math.floor(num(t)));
    var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return fa(h ? h + ":" + p(m) + ":" + p(s) : m + ":" + p(s));
  }
  function hue(s) {
    var h = 0; s = String(s || "x");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  function kindFa(k) { return { anime: "انیمه", film: "فیلم", series: "سریال" }[k] || "فیلم"; }
  function kindIc(k) { return { anime: "🌸", film: "🎬", series: "📺" }[k] || "🎞"; }
  function watch() { var w = ls(WKEY, {}); return w && typeof w === "object" ? w : {}; }
  function saveWatch(w) { lsSet(WKEY, w); }

  /* ── ۳. کاتالوگ پیش‌فرض ─────────────────────────────────────── */
  function S_(id, title, en, kind, year, rate, genres, desc, o) {
    o = o || {};
    return {
      id: id, title: title, en: en, kind: kind, year: year, rate: rate,
      genres: String(genres || "").split(/[،,]/).map(function (g) { return g.trim(); }).filter(Boolean),
      studio: o.studio || "", country: o.country || "خارجی", lang: o.lang || "زیرنویس",
      poster: o.poster || "", desc: desc || "", prem: !!o.prem, featured: !!o.featured,
      sources: o.sources || [], subs: o.subs || [], eps: o.eps || [], t: o.t || 0
    };
  }
  var SAMPLE_BBB = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";
  var SAMPLE_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  var SAMPLE_SINTEL = "https://media.w3.org/2010/05/sintel/trailer.mp4";
  var SEED = [
    S_("dune-2", "تلماسه: بخش دوم", "Dune: Part Two", "film", 2024, 8.5, "علمی‑تخیلی، حماسی، ماجراجویی",
      "پل آترایدیس با فرمن‌ها متحد می‌شود و انتقام خانواده‌اش را از خانهٔ هارکونن می‌گیرد؛ یکی از بزرگ‌ترین فیلم‌های علمی‑تخیلی دهه.",
      { studio: "Legendary", featured: 1 }),
    S_("aot", "حمله به تایتان", "Attack on Titan", "anime", 2013, 9.0, "اکشن، فانتزی تاریک، درام",
      "بشریت پشت دیوارهای غول‌پیکر پناه گرفته تا از تایتان‌های آدم‌خوار در امان بماند؛ اما ارن یگر رازی را کشف می‌کند که همه‌چیز را عوض می‌کند.",
      { studio: "WIT / MAPPA" }),
    S_("jujutsu", "جوجوتسو کایسن", "Jujutsu Kaisen", "anime", 2020, 8.6, "اکشن، فراطبیعی، شونن",
      "یوجی ایتادوری انگشت نفرین‌شده‌ای را می‌بلعد و به مدرسهٔ جادوگران جوجوتسو می‌رود تا با نفرین‌ها بجنگد.",
      { studio: "MAPPA" }),
    S_("frieren", "فریرن: آن سوی پایان سفر", "Frieren: Beyond Journey's End", "anime", 2023, 9.0, "فانتزی، ماجراجویی، درام",
      "الف جادوگری با عمری طولانی، پس از مرگ همراهانش سفری تازه را آغاز می‌کند تا معنای زمان و دوستی را بفهمد.",
      { studio: "Madhouse" }),
    S_("demon-slayer", "شیطان‌کش", "Demon Slayer", "anime", 2019, 8.7, "اکشن، شونن، فراطبیعی",
      "تانجیرو پس از قتل‌عام خانواده‌اش و نفرین شدن خواهرش، وارد سپاه شیطان‌کش‌ها می‌شود تا خواهرش را به انسان برگرداند.",
      { studio: "ufotable" }),
    S_("one-piece", "وان پیس", "One Piece", "anime", 1999, 8.7, "ماجراجویی، کمدی، اکشن",
      "لوفی و خدمهٔ کلاه‌حصیری به دنبال گنج افسانه‌ای وان پیس می‌گردند تا او پادشاه دزدان دریایی شود.",
      { studio: "Toei Animation" }),
    S_("naruto", "ناروتو شیپودن", "Naruto Shippuden", "anime", 2007, 8.2, "اکشن، نینجا، ماجراجویی",
      "ناروتو پس از دو سال آموزش بازمی‌گردد تا هم‌روستایی‌اش ساسکه را برگرداند و آرزوی هوکاگه شدن را دنبال کند.",
      { studio: "Studio Pierrot" }),
    S_("chainsaw", "مرد اره‌ای", "Chainsaw Man", "anime", 2022, 8.5, "اکشن، وحشت، فراطبیعی",
      "دنجی با شیطان اره‌ای قرارداد می‌بندد و به شکارچی شیاطین تبدیل می‌شود؛ خونین، پرهیجان و پر از شوخی سیاه.",
      { studio: "MAPPA" }),
    S_("spy-x", "جاسوس × خانواده", "Spy x Family", "anime", 2022, 8.5, "کمدی، اکشن، خانوادگی",
      "یک جاسوس برای انجام مأموریتش باید خانواده تشکیل بدهد، بی‌خبر از اینکه همسر و دخترش هم رازهای بزرگی دارند.",
      { studio: "WIT / CloverWorks" }),
    S_("solo-leveling", "سولو لولینگ", "Solo Leveling", "anime", 2024, 8.2, "اکشن، فانتزی",
      "شکارچی ضعیفی در دنیایی پر از دروازه‌های هیولا، به‌طور مرموزی توانایی «بلند شدن سطح» را به دست می‌آورد.",
      { studio: "A-1 Pictures" }),
    S_("death-note", "دفتر مرگ", "Death Note", "anime", 2006, 8.9, "معمایی، تریلر، روانی",
      "دانش‌آموزی دفتری پیدا می‌کند که هر نامی در آن نوشته شود می‌میرد؛ و کارآگاهی نابغه به تعقیبش می‌افتد.",
      { studio: "Madhouse" }),
    S_("oppenheimer", "اپنهایمر", "Oppenheimer", "film", 2023, 8.3, "بیوگرافی، درام، تاریخی",
      "روایت زندگی فیزیک‌دانی که بمب اتم را ساخت و تا آخر عمر با پیامد اخلاقی کارش جنگید.",
      { studio: "Universal" }),
    S_("inception", "تلقین", "Inception", "film", 2010, 8.8, "علمی‑تخیلی، معمایی، اکشن",
      "تیمی از متخصصان خواب وارد ذهن هدف می‌شوند تا ایده‌ای را بکارند؛ لایه‌های رؤیا هر لحظه فرو می‌ریزند.",
      { studio: "Warner Bros." }),
    S_("interstellar", "تلاقی", "Interstellar", "film", 2014, 8.7, "علمی‑تخیلی، درام",
      "خلبان و کشاورزی برای نجات زمین از میان کرم‌چاله می‌گذرد و با گذر زمان و عشق پدرانه دست‌وپنجه نرم می‌کند.",
      { studio: "Paramount" }),
    S_("spirited", "سفر به شهر ارواح", "Spirited Away", "film", 2001, 8.6, "فانتزی، خانوادگی، انیمیشن",
      "چیهیرو در دنیای ارواح گرفتار می‌شود و باید با شجاعت و مهربانی راهی برای نجات پدر و مادرش پیدا کند.",
      { studio: "Studio Ghibli" }),
    S_("your-name", "نام تو", "Your Name", "film", 2016, 8.4, "عاشقانه، فانتزی، انیمیشن",
      "دو نوجوان در دو شهر مختلف به‌طور مرموزی جایشان عوض می‌شود و پیوندی شکل می‌گیرد که زمان را به چالش می‌کشد.",
      { studio: "CoMix Wave" }),
    S_("parasite", "انگل", "Parasite", "film", 2019, 8.5, "درام، تریلر، معمایی",
      "خانواده‌ای فقیر به‌تدریج وارد خانهٔ یک خانوادهٔ ثروتمند می‌شود؛ موقعیتی که به فاجعه می‌رسد.",
      { studio: "CJ Entertainment" }),
    S_("godfather", "پدرخوانده", "The Godfather", "film", 1972, 9.2, "درام، جنایی",
      "داستان خانوادهٔ کورلئونه و انتقال قدرت از پدر به پسر؛ کلاسیک بی‌رقیب سینمای جنایی.",
      { studio: "Paramount" }),
    S_("about-elly", "دربارهٔ الی", "About Elly", "film", 2009, 8.0, "درام، معمایی",
      "سفری کنار دریا و ناپدید شدن یک مهمان، گروهی از دوستان را روبه‌روی دروغ‌ها و وجدانشان می‌گذارد.",
      { studio: "Dreamlab", country: "ایرانی", lang: "دوبله" }),
    S_("separation", "جدایی نادر از سیمین", "A Separation", "film", 2011, 8.3, "درام، خانوادگی",
      "اختلاف یک زوج بر سر مهاجرت، به پرونده‌ای قضایی و بحرانی اخلاقی تبدیل می‌شود.",
      { studio: "Filmiran", country: "ایرانی", lang: "دوبله" }),
    S_("chernobyl", "چرنوبیل", "Chernobyl", "series", 2019, 9.3, "درام، تاریخی، تریلر",
      "بازسازی دقیق فاجعهٔ هسته‌ای ۱۹۸۶ و بهای انسانی و سیاسی پنهان‌کاری.",
      { studio: "HBO" }),
    S_("breaking-bad", "بریکینگ بد", "Breaking Bad", "series", 2008, 9.5, "درام، جنایی، تریلر",
      "معلم شیمی با تشخیص سرطان، به تولید متامفتامین روی می‌آورد و قدم‌به‌قدم به امپراتور مواد تبدیل می‌شود.",
      { studio: "AMC" }),
    S_("squid-game", "بازی مرکب", "Squid Game", "series", 2021, 8.0, "هیجان‌انگیز، بقا، درام",
      "بدهکارانی که برای پول در بازی‌های کودکانه شرکت می‌کنند، می‌فهمند باخت یعنی مرگ.",
      { studio: "Netflix" }),
    S_("stranger-things", "چیزهای عجیب", "Stranger Things", "series", 2016, 8.7, "وحشت، علمی‑تخیلی، نوجوانانه",
      "گم شدن یک پسر در شهر کوچکی، رازی دربارهٔ آزمایشگاهی دولتی و دختری با توانایی عجیب را آشکار می‌کند.",
      { studio: "Netflix" }),
    S_("money-heist", "خانهٔ کاغذی", "Money Heist", "series", 2017, 8.2, "جنایی، هیجان‌انگیز",
      "مغزی نابغه تیمی از دزدها را برای سرقت از ضرابخانهٔ اسپانیا گرد هم می‌آورد.",
      { studio: "Netflix" }),
    S_("got", "بازی تاج‌وتخت", "Game of Thrones", "series", 2011, 9.2, "فانتزی، درام، حماسی",
      "خاندان‌های وستروس برای تخت آهنین می‌جنگند، در حالی که تهدیدی باستانی از شمال بازمی‌گردد.",
      { studio: "HBO" }),
    /* نمونه‌های واقعاً قابل پخش (فیلم‌های آزاد) — برای آزمایش پلیر */
    S_("demo-bbb", "بیگ باک بانی", "Big Buck Bunny", "film", 2008, 8.0, "انیمیشن، کمدی، خانوادگی",
      "نمونهٔ قابل پخش: خرگوش غول‌پیکری که با سه جوندگان مزاحم شوخی می‌کند. برای تست پلیر و کیفیت‌ها استفاده کن.",
      { studio: "Blender Foundation", lang: "دوبله", featured: 1,
        sources: [
          { label: "نمونهٔ ۳۶۰p (MP4)", href: SAMPLE_BBB },
          { label: "پخش HLS", href: SAMPLE_HLS }
        ] }),
    S_("demo-sintel", "سینتل", "Sintel", "film", 2010, 8.2, "انیمیشن، فانتزی، ماجراجویی",
      "نمونهٔ قابل پخش: دختری در جست‌وجوی اژدهای کوچکش سفری حماسی را طی می‌کند.",
      { studio: "Blender Foundation", lang: "زیرنویس",
        sources: [{ label: "تریلر رسمی (MP4)", href: SAMPLE_SINTEL }] }),
    S_("demo-tos", "اشک‌های فولاد", "Tears of Steel", "film", 2012, 7.6, "علمی‑تخیلی، اکشن",
      "نمونهٔ قابل پخش: گروهی در آینده‌ای نزدیک برای نجات جهان روبه‌روی ربات‌ها می‌ایستد.",
      { studio: "Blender Foundation", lang: "زیرنویس", sources: [] }),
    S_("demo-ed", "رؤیای فیل‌ها", "Elephants Dream", "film", 2006, 7.4, "انیمیشن، فانتزی",
      "نمونهٔ قابل پخش: دو شخصیت در دنیایی ماشینی و سورئال گرفتار می‌شوند.",
      { studio: "Blender Foundation", lang: "زیرنویس", sources: [] })
  ];

  /* ── ۴. وضعیت ───────────────────────────────────────────────── */
  var S = {
    live: {}, loaded: false, me: null, user: null, role: "user", prem: false, staff: false,
    q: "", kind: "all", genres: [], country: "", lang: "", rate: 0,
    yf: "", yt: "", playable: false, mine: false, sort: "new", page: 1, size: 18,
    detail: null, tmpItem: null
  };
  var EDIT_ID = null;
  var db = null, auth = null, storage = null;
  try {
    if (window.firebase) {
      if (!firebase.apps.length) firebase.initializeApp(FB);
      db = firebase.database();
      try { auth = firebase.auth(); } catch (e) {}
      try { storage = firebase.storage(); } catch (e) {}
    }
  } catch (e) { console.warn("[cinema] firebase init:", e && e.message); }

  /* ── ۵. داده‌های زنده ───────────────────────────────────────── */
  function arr(o) {
    if (!o) return [];
    if (Array.isArray(o)) return o.filter(Boolean);
    return Object.keys(o).map(function (k) { return o[k]; }).filter(Boolean);
  }
  function norm(id, v) {
    if (!v || typeof v !== "object") return null;
    var srcs = arr(v.sources);
    if (!srcs.length && v.src) srcs = [{ label: "پخش", href: v.src }];
    srcs = srcs.map(function (s) {
      return { label: s.label || s.q || "پخش", href: s.href || s.url || s.src || "", subs: arr(s.subs) };
    }).filter(function (s) { return s.href; });
    var eps = arr(v.eps || v.episodes).map(function (e) {
      return { title: e.title || e.name || "قسمت", href: e.href || e.url || e.src || "" };
    }).filter(function (e) { return e.href; });
    var subs = arr(v.subs).map(function (s) { return { label: s.label || "فارسی", src: s.src || s.href || "" }; }).filter(function (s) { return s.src; });
    return {
      id: id, title: v.title || "", en: v.en || "", kind: v.kind || "film",
      year: num(v.year), rate: num(v.rate), genres: Array.isArray(v.genres) ? v.genres.filter(Boolean)
        : String(v.genres || "").split(/[،,]/).map(function (g) { return g.trim(); }).filter(Boolean),
      studio: v.studio || "", country: v.country || "خارجی", lang: v.lang || "زیرنویس",
      poster: v.poster || "", desc: v.desc || "", prem: v.prem === true || v.premium === true,
      featured: v.featured === true, sources: srcs, subs: subs, eps: eps, t: num(v.t), live: true
    };
  }
  function catalog() {
    var out = SEED.slice();
    Object.keys(S.live || {}).forEach(function (k) {
      var it = norm(k, S.live[k]);
      if (!it || !it.title) return;
      var hit = -1;
      for (var i = 0; i < out.length; i++) if (out[i].id === k) hit = i;
      if (hit >= 0) out[hit] = it; else out.unshift(it);
    });
    return out;
  }
  function byId(id) {
    if (S.tmpItem && S.tmpItem.id === id) return S.tmpItem;
    var a = catalog();
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }

  /* ── ۶. فیلتر و مرتب‌سازی ───────────────────────────────────── */
  function plays(it) { return !!(it.sources && it.sources.length); }
  function visible() {
    var w = watch(), q = S.q.trim().toLowerCase(), gs = S.genres;
    return catalog().filter(function (it) {
      if (!it.title) return false;
      if (S.mine && !w[it.id]) return false;
      if (S.kind !== "all" && it.kind !== S.kind) return false;
      if (S.country && it.country !== S.country) return false;
      if (S.lang && it.lang !== S.lang) return false;
      if (S.rate && (it.rate || 0) < S.rate) return false;
      if (S.yf && (it.year || 0) < +S.yf) return false;
      if (S.yt && (it.year || 0) > +S.yt) return false;
      if (S.playable && !plays(it)) return false;
      if (gs.length) {
        var okG = false;
        for (var i = 0; i < gs.length; i++) if (it.genres.indexOf(gs[i]) >= 0) { okG = true; break; }
        if (!okG) return false;
      }
      if (q) {
        var hay = [it.title, it.en, it.studio, it.desc, it.country, it.lang, kindFa(it.kind), it.genres.join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      if (S.sort === "rate") return (b.rate || 0) - (a.rate || 0);
      if (S.sort === "az") return String(a.title).localeCompare(String(b.title), "fa");
      if (S.sort === "year") return (b.year || 0) - (a.year || 0);
      return ((b.t || 0) - (a.t || 0)) || ((b.year || 0) - (a.year || 0)) || ((b.rate || 0) - (a.rate || 0));
    });
  }
  function genresAll() {
    var m = {};
    catalog().forEach(function (it) { it.genres.forEach(function (g) { m[g] = (m[g] || 0) + 1; }); });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
  }

  /* ── ۷. تماس با فایربیس ─────────────────────────────────────── */
  function isPremUser(v) {
    if (!v) return false;
    if (v.role === "owner") return true;
    if (v.prem !== true) return false;
    if (v.premExp && v.premExp < Date.now()) return false;
    return true;
  }
  if (auth) {
    auth.onAuthStateChanged(function (u) {
      S.me = u ? u.uid : null;
      S.user = null; S.role = "user"; S.prem = false; S.staff = false;
      paintChrome(); paintAll();
      if (!u || !db) return;
      db.ref("users/" + u.uid).on("value", function (snap) {
        var v = snap.val() || {};
        S.user = v;
        S.role = v.role || "user";
        S.prem = isPremUser(v);
        S.staff = ["owner", "admin", "staff"].indexOf(S.role) >= 0;
        paintChrome(); paintAll();
      }, function () {});
    });
  }
  if (db) {
    db.ref(PATH).on("value", function (snap) {
      S.live = snap.val() || {};
      S.loaded = true;
      paintAll();
      if (S.detail && byId(S.detail)) openDetail(S.detail, true);
    }, function () { S.loaded = true; });
  }

  /* ── ۸. رندر ────────────────────────────────────────────────── */
  function poster(it) {
    var h = hue(it.id || it.title), h2 = (h + 46) % 360;
    var ph = '<span class="cx-ph" style="background:linear-gradient(150deg,hsl(' + h + ' 62% 30%),hsl(' +
      h2 + ' 68% 20%))">' + kindIc(it.kind) + "</span>";
    if (!it.poster) return ph;
    return ph + '<img src="' + esc(it.poster) + '" alt="' + esc(it.title) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">';
  }
  function cardHTML(it) {
    var saved = watch()[it.id], locked = it.prem && !S.prem;
    return '<article class="cx-card' + (locked ? " premium" : "") + '" data-id="' + esc(it.id) + '" tabindex="0" role="button" aria-label="' + esc(it.title) + '">' +
      '<div class="cx-post">' + poster(it) +
        (it.rate ? '<span class="cx-rate">★ ' + fa(it.rate.toFixed ? it.rate.toFixed(1) : it.rate) + "</span>" : "") +
        '<span class="cx-kind">' + kindIc(it.kind) + " " + kindFa(it.kind) + "</span>" +
        '<button class="cx-wb' + (saved ? " on" : "") + '" type="button" data-wb="' + esc(it.id) + '" title="لیست تماشا">' + (saved ? "✓" : "＋") + "</button>" +
        '<span class="cx-play">▶</span>' +
        (locked ? '<div class="cx-lock"><div>💎<br><b>ویژهٔ پرمیوم</b><br>برای پخش پرمیوم شو</div></div>' : "") +
        '<div class="cx-body"><div class="cx-t">' + esc(it.title) + "</div>" +
          '<div class="cx-s"><span>' + esc(it.year || "") + "</span>" +
            (it.country ? "<span>· " + esc(it.country) + "</span>" : "") +
            (plays(it) ? '<span style="color:var(--ok)">· قابل پخش</span>' : "") +
          "</div></div>" +
      "</div></article>";
  }
  function emptyHTML() {
    return '<div class="cx-empty">چیزی با این فیلترها پیدا نشد.<br>عبارت جست‌وجو را کوتاه‌تر کن یا فیلترها را پاک کن.' +
      '<div style="margin-top:12px"><button class="cx-btn ghost sm" type="button" data-clear="1">پاک کردن فیلترها</button></div></div>';
  }
  function paintHero() {
    var box = $("#cxHero");
    if (!box) return;
    var list = visible(), it = null;
    for (var i = 0; i < list.length; i++) if (list[i].featured) { it = list[i]; break; }
    if (!it) it = list[0] || catalog()[0];
    if (!it) { box.innerHTML = ""; return; }
    box.innerHTML = '<div class="cx-hero-bg" id="cxHeroBg"></div>' +
      '<div class="cx-hero-in">' +
        '<div class="cx-hero-poster">' + poster(it) + "</div>" +
        '<div class="cx-hero-tx">' +
          '<div class="cx-hero-tags"><span>🔥 پیشنهاد رونین</span><span>' + kindIc(it.kind) + " " + kindFa(it.kind) + "</span>" +
            (it.rate ? "<span>★ " + fa(it.rate) + "</span>" : "") + (it.year ? "<span>" + fa(it.year) + "</span>" : "") + "</div>" +
          "<h2>" + esc(it.title) + "</h2><p>" + esc(it.desc || "") + "</p>" +
          '<div class="cx-hero-act">' +
            (plays(it) ? '<button class="cx-btn" type="button" data-play="' + esc(it.id) + ':0">▶ تماشا</button>' : "") +
            '<button class="cx-btn ghost" type="button" data-id="' + esc(it.id) + '">جزئیات و کیفیت‌ها</button>' +
            '<button class="cx-btn ghost" type="button" data-wb="' + esc(it.id) + '">🔖 لیست من</button>' +
          "</div>" +
        "</div>" +
      "</div>";
    var bg = $("#cxHeroBg");
    if (bg) bg.style.backgroundImage = it.poster ? 'url("' + it.poster + '")' : "none";
  }
  function paintTabs() {
    var box = $("#cxTabs");
    if (!box) return;
    var all = catalog(), w = watch();
    var c = { all: 0, anime: 0, film: 0, series: 0, mine: 0 };
    all.forEach(function (it) { if (c[it.kind] != null) c[it.kind]++; if (w[it.id]) c.mine++; });
    c.all = all.length;
    var tabs = [
      ["all", "✨ همه", c.all], ["anime", "🌸 انیمه", c.anime],
      ["film", "🎬 فیلم خارجی", c.film], ["series", "📺 سریال", c.series],
      ["mine", "🔖 لیست من", c.mine]
    ];
    var cur = S.mine ? "mine" : S.kind;
    box.innerHTML = tabs.map(function (t) {
      return '<button class="cx-tab' + (cur === t[0] ? " on" : "") + '" type="button" data-tab="' + t[0] + '">' +
        t[1] + " <b>" + fa(t[2]) + "</b></button>";
    }).join("");
  }
  function filtersHTML() {
    var gs = genresAll();
    var pills = function (attr, list, cur, curArr) {
      return list.map(function (x) {
        var on = curArr ? curArr.indexOf(x[1]) >= 0 : cur === x[1];
        return '<button class="cx-pill' + (on ? " on" : "") + '" type="button" ' + attr + '="' + esc(x[1]) + '">' + esc(x[0]) + "</button>";
      }).join("");
    };
    var genreList = gs.map(function (g) { return [g, g]; });
    var side = "";
    side += '<div class="cx-side-card"><div class="cx-side-h">ژانر <button type="button" data-clear-g="1">همه</button></div>' +
      '<div class="cx-pills">' + pills("data-fg", genreList, "", S.genres) + "</div></div>";
    side += '<div class="cx-side-card"><div class="cx-side-h">کشور</div><div class="cx-pills">' +
      pills("data-fc", [["همه", ""], ["خارجی", "خارجی"], ["ایرانی", "ایرانی"]], S.country) + "</div></div>";
    side += '<div class="cx-side-card"><div class="cx-side-h">زبان</div><div class="cx-pills">' +
      pills("data-fl", [["همه", ""], ["دوبله", "دوبله"], ["زیرنویس", "زیرنویس"]], S.lang) + "</div></div>";
    side += '<div class="cx-side-card"><div class="cx-side-h">حداقل امتیاز</div><div class="cx-pills">' +
      pills("data-fr", [["همه", "0"], ["۷+", "7"], ["۸+", "8"], ["۸.۵+", "8.5"], ["۹+", "9"]], String(S.rate)) + "</div></div>";
    side += '<div class="cx-side-card"><div class="cx-side-h">سال تولید</div><div class="cx-two">' +
      '<label class="cx-field">از<input id="fYf" type="number" min="1900" max="2100" placeholder="۲۰۰۰" value="' + esc(S.yf) + '"></label>' +
      '<label class="cx-field">تا<input id="fYt" type="number" min="1900" max="2100" placeholder="۲۰۲۶" value="' + esc(S.yt) + '"></label>' +
      '</div><label class="cx-switch"><input id="fPlay" type="checkbox"' + (S.playable ? " checked" : "") + "> فقط عنوان‌های قابل پخش</label></div>";
    side += '<button class="cx-btn ghost wide" type="button" data-clear="1">پاک کردن همهٔ فیلترها</button>';
    return side;
  }
  function paintSide() {
    var box = $("#cxSide");
    if (box) box.innerHTML = filtersHTML();
    var sheet = $("#cxSheet");
    if (sheet && !sheet.hidden) {
      sheet.innerHTML = '<div class="cx-sheet-in"><div class="cx-sheet-h"><b>فیلترها</b><button class="cx-x" type="button" data-close-sheet="1" style="position:static">✕</button></div>' +
        filtersHTML() + '<button class="cx-btn wide" type="button" data-close-sheet="1" style="margin-top:10px">نمایش نتایج</button></div>';
    }
  }
  function paintTitle() {
    var t = $("#cxTitle"), nav = $$("#cxNav a");
    var names = { all: "همهٔ عنوان‌ها", anime: "انیمه", film: "فیلم‌های خارجی", series: "سریال‌ها", mine: "لیست تماشای من" };
    var cur = S.mine ? "mine" : S.kind;
    if (t) t.textContent = names[cur] || names.all;
    nav.forEach(function (a) {
      var k = a.getAttribute("data-nav");
      a.classList.toggle("on", k === cur || (k === "all" && cur === "all"));
    });
  }
  function paintChips() {
    var box = $("#cxChips");
    if (!box) return;
    var c = [];
    if (S.q) c.push(["q", "جست‌وجو: " + S.q]);
    if (S.kind !== "all") c.push(["kind", kindFa(S.kind)]);
    S.genres.forEach(function (g) { c.push(["genre:" + g, g]); });
    if (S.country) c.push(["country", S.country]);
    if (S.lang) c.push(["lang", S.lang]);
    if (S.rate) c.push(["rate", "امتیاز " + fa(S.rate) + "+"]);
    if (S.yf || S.yt) c.push(["years", "سال " + fa(S.yf || "…") + " تا " + fa(S.yt || "…")]);
    if (S.playable) c.push(["playable", "قابل پخش"]);
    if (S.mine) c.push(["mine", "لیست من"]);
    box.innerHTML = c.map(function (x) {
      return '<button class="cx-chipx" type="button" data-chip-rm="' + esc(x[0]) + '"><span>' + esc(x[1]) + "</span> ✕</button>";
    }).join("") + (c.length > 1 ? '<button class="cx-chipx" type="button" data-clear="1" style="border-color:var(--err);background:rgba(255,80,105,.12)">پاک کردن همه ✕</button>' : "");
  }
  function paintGrid() {
    var grid = $("#cxGrid"), cnt = $("#cxCount"), more = $("#cxMore");
    if (!grid) return;
    var all = visible(), show = all.slice(0, S.page * S.size);
    grid.innerHTML = show.length ? show.map(cardHTML).join("") : emptyHTML();
    if (cnt) cnt.textContent = fa(all.length) + " عنوان";
    if (more) more.hidden = show.length >= all.length;
  }
  function paintChrome() {
    var up = $("#cxUploadBtn");
    if (up) up.hidden = !S.staff;
    var acct = $("#cxAcct");
    if (acct) {
      acct.title = S.me ? "حساب: " + ((S.user && S.user.name) || "کاربر") : "ورود به حساب";
      acct.textContent = S.me && S.prem ? "💎" : "👤";
    }
  }
  function paintAll() {
    paintHero(); paintTabs(); paintTitle(); paintSide(); paintChips(); paintGrid(); paintChrome();
  }
  function paintResults() { paintChips(); paintGrid(); paintTabs(); }

  /* ── ۹. نشانی صفحه (لینک‌های اشتراکی) ───────────────────────── */
  function syncURL() {
    try {
      var u = new URL(location.href);
      var p = u.searchParams;
      var set = function (k, v) { if (v === "" || v == null || v === false) p.delete(k); else p.set(k, String(v)); };
      set("q", S.q); set("kind", S.kind === "all" ? "" : S.kind);
      set("genre", S.genres.join(",")); set("country", S.country); set("lang", S.lang);
      set("rate", S.rate || ""); set("yf", S.yf); set("yt", S.yt);
      if (S.playable) set("playable", "1"); else p.delete("playable");
      if (S.mine) set("mine", "1"); else p.delete("mine");
      set("sort", S.sort === "new" ? "" : S.sort);
      history.replaceState(null, "", u.pathname + (p.toString() ? "?" + p.toString() : "") + u.hash);
    } catch (e) {}
  }
  function readURL() {
    try {
      var p = new URL(location.href).searchParams;
      S.q = p.get("q") || "";
      var k = p.get("kind") || "all";
      S.kind = ["anime", "film", "series"].indexOf(k) >= 0 ? k : "all";
      S.genres = (p.get("genre") || "").split(",").map(function (g) { return g.trim(); }).filter(Boolean);
      S.country = p.get("country") || "";
      S.lang = p.get("lang") || "";
      S.rate = num(p.get("rate"));
      S.yf = p.get("yf") || "";
      S.yt = p.get("yt") || "";
      S.playable = p.get("playable") === "1";
      S.mine = p.get("mine") === "1";
      var s = p.get("sort");
      S.sort = ["new", "rate", "year", "az"].indexOf(s) >= 0 ? s : "new";
      var w = p.get("watch");
      if (w) setTimeout(function () { openDetail(w); }, 350);
    } catch (e) {}
  }

  /* ── ۱۰. مودال ──────────────────────────────────────────────── */
  function modalOpen(html, wide) {
    var m = $("#cxModal");
    if (!m) return;
    m.innerHTML = '<div class="cx-box' + (wide ? " wide" : "") + '">' + html + "</div>";
    m.hidden = false;
    document.body.classList.add("lock");
  }
  function modalClose() {
    var m = $("#cxModal");
    if (m) { m.hidden = true; m.innerHTML = ""; }
    S.detail = null;
    unlock();
  }
  function unlock() {
    if ($("#cxPlayer").hidden && $("#cxModal").hidden && $("#cxSheet").hidden) document.body.classList.remove("lock");
  }
  function detailHTML(it) {
    var saved = watch()[it.id];
    var srcs = it.sources || [], eps = it.eps || [];
    var locked = it.prem && !S.prem;
    var h = '<button class="cx-x" type="button" data-close="1">✕</button>';
    h += '<div class="cx-det-hero" id="cxDetBg">' + (it.poster ? '<img src="' + esc(it.poster) + '" alt="">' : "") + "</div>";
    h += '<div class="cx-det-body"><div class="cx-det-post">' + (it.poster ? '<img src="' + esc(it.poster) + '" alt="">' : kindIc(it.kind)) + "</div>";
    h += '<div class="cx-det-info"><h2>' + esc(it.title) + (it.prem ? ' <span style="font-size:11px;color:var(--warn)">💎</span>' : "") + "</h2>" +
      (it.en ? '<div class="cx-det-en">' + esc(it.en) + "</div>" : "") +
      '<div class="cx-meta"><span>' + kindIc(it.kind) + " " + kindFa(it.kind) + "</span>" +
      (it.year ? "<span>" + fa(it.year) + "</span>" : "") +
      (it.rate ? "<span>★ " + fa(it.rate) + "</span>" : "") +
      (it.studio ? "<span>" + esc(it.studio) + "</span>" : "") +
      "<span>" + esc(it.country) + "</span><span>" + esc(it.lang) + "</span></div>" +
      (it.genres.length ? '<div class="cx-meta">' + it.genres.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("") + "</div>" : "") +
      '<p class="cx-det-desc">' + esc(it.desc || "خلاصه‌ای ثبت نشده.") + "</p>" +
      '<div class="cx-det-act">' +
        (locked ? '<button class="cx-btn" type="button" data-upsell="1">💎 پخش با پرمیوم</button>'
          : (srcs.length ? '<button class="cx-btn" type="button" data-play="' + esc(it.id) + ':0">▶ پخش</button>' : "")) +
        '<button class="cx-btn ghost" type="button" data-wb="' + esc(it.id) + '">' + (saved ? "✓ در لیست من" : "＋ لیست تماشا") + "</button>" +
        '<button class="cx-btn ghost" type="button" data-share="' + esc(it.id) + '">🔗 اشتراک</button>' +
        (it.en ? '<a class="cx-btn ghost" href="https://www.youtube.com/results?search_query=' + encodeURIComponent((it.en || it.title) + " trailer") + '" target="_blank" rel="noopener">▶ تریلر</a>' : "") +
        (S.staff && it.live ? '<button class="cx-btn ghost" type="button" data-edit="' + esc(it.id) + '">✏️ ویرایش</button>' +
          '<button class="cx-btn danger" type="button" data-del="' + esc(it.id) + '">حذف</button>' : "") +
      "</div>";
    if (!locked && srcs.length > 1) {
      h += '<div class="cx-sub-h">کیفیت / منبع</div><div class="cx-srcs">' + srcs.map(function (s, i) {
        return '<button class="cx-src" type="button" data-play="' + esc(it.id) + ":" + i + '">▶ ' + esc(s.label || ("منبع " + (i + 1))) + "</button>";
      }).join("") + "</div>";
    }
    if (!locked && eps.length) {
      h += '<div class="cx-sub-h" style="margin-top:12px">قسمت‌ها (' + fa(eps.length) + ')</div><div class="cx-eps">' +
        eps.map(function (e, i) {
          return '<button class="cx-ep" type="button" data-ep="' + esc(it.id) + ":" + i + '">▶ ' + esc(e.title) + "<span>پخش</span></button>";
        }).join("") + "</div>";
    }
    if (locked) h += '<div class="cx-side-card" style="margin-top:6px"><div class="cx-side-h">💎 عنوان ویژهٔ پرمیوم</div><p class="cx-det-desc" style="margin:0">با اشتراک پرمیوم رونین به این عنوان و بقیهٔ عنوان‌های ویژه دسترسی داری.</p><a class="cx-btn wide" href="index.html#premium" style="margin-top:8px">فعال‌سازی پرمیوم</a></div>';
    h += "</div></div>";
    return h;
  }
  function openDetail(id, quiet) {
    var it = byId(id);
    if (!it) return;
    S.detail = id;
    modalOpen(detailHTML(it));
    if (!quiet) window.scrollTo({ top: 0, behavior: "auto" });
  }
  function upsell(it) {
    modalOpen('<button class="cx-x" type="button" data-close="1">✕</button><div class="cx-form" style="text-align:center;padding:26px 18px">' +
      '<div style="font-size:34px">💎</div><h2>' + esc(it ? it.title : "محتوای پرمیوم") + "</h2>" +
      '<p class="hint">این عنوان برای اعضای پرمیوم رونین است. با فعال‌سازی اشتراک، همهٔ عنوان‌های ویژه و تم‌های پرمیوم را باز می‌کنی.</p>' +
      '<a class="cx-btn wide" href="index.html#premium">فعال‌سازی پرمیوم</a>' +
      '<button class="cx-btn ghost wide" type="button" data-close="1" style="margin-top:7px">بستن</button></div>');
  }

  /* ── ۱۱. لیست تماشا ─────────────────────────────────────────── */
  function toggleWatch(id) {
    var w = watch();
    if (w[id]) delete w[id]; else w[id] = 1;
    saveWatch(w);
    toast(w[id] ? "به لیست تماشا اضافه شد ✓" : "از لیست تماشا حذف شد", "ok");
    paintResults();
    if (S.detail === id) openDetail(id, true);
  }

  /* ── ۱۲. پلیر ───────────────────────────────────────────────── */
  var PL = { id: null, idx: 0, hls: null, subs: [], idleT: null, saveT: 0, embed: false, pending: 0 };

  function embedURL(url) {
    if (!url) return null;
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1] + "?rel=0&modestbranding=1";
    var ap = url.match(/aparat\.com\/v\/([\w-]+)/);
    if (ap) return "https://www.aparat.com/video/video/embed/videohash/" + ap[1] + "/vt/frame";
    var vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return "https://player.vimeo.com/video/" + vm[1];
    if (/player\.|\/embed\/|<iframe/i.test(url)) return url;
    return null;
  }
  function loadHls(cb) {
    if (window.Hls) return cb(window.Hls);
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js";
    s.onload = function () { cb(window.Hls); };
    s.onerror = function () { cb(null); };
    document.head.appendChild(s);
  }
  function posMap() { return ls(POSKEY, {}) || {}; }
  function posGet(id, i) { var m = posMap(); return num(m[id + "|" + i]); }
  function posSet(id, i, t) {
    if (!id || !(t > 5)) return;
    var m = posMap();
    m[id + "|" + i] = Math.floor(t);
    lsSet(POSKEY, m);
  }
  function playerHTML(it, src, idx, srcs, emb) {
    var subs = PL.subs;
    var subOpt = subs.length ? subs.map(function (s, i) { return '<button type="button" data-sub="' + i + '">' + esc(s.label || ("زیرنویس " + (i + 1))) + "</button>"; }).join("") : "";
    var iframe = emb ? '<iframe src="' + esc(emb) + '" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe>' : "";
    var video = emb ? "" : '<video id="cxV" playsinline preload="metadata"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : "") + "></video>";
    return '<div class="cxp" id="cxp">' +
      '<div class="cxp-top"><button class="cxp-ib" type="button" data-p="close" title="بستن (Esc)">→</button>' +
        '<div style="min-width:0"><div class="ttl">' + esc(it.title) + '</div><div class="sub">' + kindIc(it.kind) + " " + kindFa(it.kind) +
          (it.year ? " · " + fa(it.year) : "") + (src.label ? " · " + esc(src.label) : "") + "</div></div>" +
        '<span class="sp"></span>' +
        '<button class="cxp-ib" type="button" data-p="info" title="جزئیات">ℹ️</button>' +
        (srcs.length > 1 ? '<button class="cxp-ib" type="button" data-p="next" title="منبع بعدی">⏭</button>' : "") +
      "</div>" +
      '<div class="cxp-stage" id="cxpStage">' + video + iframe +
        '<div class="cxp-spin" id="cxpSpin"></div>' +
        (emb ? "" : '<button class="cxp-bigplay" id="cxBig" type="button" title="پخش">▶</button>') +
        '<div class="cxp-err" id="cxpErr"></div>' +
        (emb ? "" :
        '<div class="cxp-ctl" id="cxpCtl">' +
          '<input class="cxp-seek" id="cxSeek" type="range" min="0" max="1000" value="0" aria-label="زمان پخش">' +
          '<div class="cxp-row">' +
            '<button class="cxp-txt" type="button" data-p="toggle" id="cxPlayBtn">▶</button>' +
            '<button class="cxp-txt" type="button" data-p="back" title="۱۰ ثانیه عقب">↺۱۰</button>' +
            '<button class="cxp-txt" type="button" data-p="fwd" title="۱۰ ثانیه جلو">۱۰↻</button>' +
            '<button class="cxp-txt" type="button" data-p="mute" id="cxMute">🔊</button>' +
            '<input class="cxp-vol" id="cxVol" type="range" min="0" max="100" value="100" aria-label="صدا">' +
            '<span class="cxp-time" id="cxTime">۰:۰۰ / ۰:۰۰</span>' +
            '<span style="flex:1"></span>' +
            '<button class="cxp-txt" type="button" data-p="menu:speed" id="cxSpd">۱×</button>' +
            (srcs.length > 1 ? '<button class="cxp-txt" type="button" data-p="menu:q">کیفیت</button>' : "") +
            (subs.length ? '<button class="cxp-txt" type="button" data-p="menu:sub">زیرنویس</button>' : "") +
            '<button class="cxp-txt" type="button" data-p="pip" title="تصویر در تصویر">PiP</button>' +
            '<button class="cxp-txt" type="button" data-p="fs" id="cxFs" title="تمام‌صفحه">⛶</button>' +
          "</div>" +
        "</div>") +
        '<div class="cxp-menu" id="cxpMenu"></div>' +
        '<div class="cxp-tip" id="cxpTip"></div>' +
      "</div></div>";
  }
  function openPlayer(id, idx) {
    var it = byId(id);
    if (!it) return;
    if (it.prem && !S.prem) return upsell(it);
    var srcs = it.sources || [];
    if (!srcs.length) { toast("برای این عنوان هنوز لینک پخش ثبت نشده", "err"); return; }
    idx = clamp(num(idx), 0, srcs.length - 1);
    var src = srcs[idx];
    var emb = embedURL(src.href);
    PL.id = id; PL.idx = idx; PL.embed = !!emb; PL.subs = (src.subs && src.subs.length ? src.subs : (it.subs || []));
    var wrap = $("#cxPlayer");
    if (!wrap) return;
    wrap.innerHTML = playerHTML(it, src, idx, srcs, emb);
    wrap.hidden = false;
    document.body.classList.add("lock");
    var box = $("#cxp");
    if (box) box.classList.add("playing");
    if (!emb) initVideo(it, src, idx, srcs);
    bindPlayerChrome(it, srcs, idx, emb);
  }
  function initVideo(it, src, idx, srcs) {
    var v = $("#cxV");
    if (!v) return;
    PL.pending = posGet(it.id, idx);
    attach(v, src.href);
    /* زیرنویس‌ها */
    PL.subs.forEach(function (s, i) {
      var tr = document.createElement("track");
      tr.kind = "subtitles"; tr.label = s.label || ("زیرنویس " + (i + 1)); tr.srclang = s.lang || "fa";
      tr.src = s.src;
      v.appendChild(tr);
    });
    var spin = $("#cxpSpin"), big = $("#cxBig"), err = $("#cxpErr"), seek = $("#cxSeek"), time = $("#cxTime"), playBtn = $("#cxPlayBtn"), mute = $("#cxMute"), vol = $("#cxVol");
    var savedVol = clamp(num(ls("rn_cine_vol", 1)), 0, 1);
    v.volume = savedVol;
    if (vol) { vol.value = String(Math.round(savedVol * 100)); vol.style.setProperty("--v", Math.round(savedVol * 100) + "%"); }
    if (mute) mute.textContent = savedVol === 0 ? "🔇" : "🔊";

    function paintTime() {
      if (!seek) return;
      var d = isFinite(v.duration) ? v.duration : 0;
      var p = d ? (v.currentTime / d) * 100 : 0;
      seek.value = String(Math.round(p * 10));
      seek.style.setProperty("--p", p.toFixed(2) + "%");
      if (time) time.textContent = fmtTime(v.currentTime) + " / " + fmtTime(d || 0);
    }
    function setPlay(ui) {
      if (playBtn) playBtn.textContent = ui ? "⏸" : "▶";
      if (big) big.hidden = ui;
      if (box) box.classList.toggle("playing", ui);
      var b = $("#cxp"); if (b) b.classList.toggle("idle", ui ? b.classList.contains("idle") : false);
    }
    v.addEventListener("loadedmetadata", function () {
      if (PL.pending > 10 && PL.pending < v.duration - 12) {
        v.currentTime = PL.pending;
        toast("از " + fmtTime(PL.pending) + " ادامه داده شد", "ok");
      }
      PL.pending = 0;
      paintTime();
    });
    v.addEventListener("timeupdate", function () {
      paintTime();
      if (Date.now() - PL.saveT > 4000) { PL.saveT = Date.now(); posSet(PL.id, PL.idx, v.currentTime); }
    });
    v.addEventListener("play", function () { setPlay(true); });
    v.addEventListener("pause", function () { setPlay(false); posSet(PL.id, PL.idx, v.currentTime); });
    v.addEventListener("waiting", function () { if (spin) spin.classList.add("on"); });
    v.addEventListener("playing", function () { if (spin) spin.classList.remove("on"); if (err) err.classList.remove("on"); });
    v.addEventListener("canplay", function () { if (spin) spin.classList.remove("on"); });
    v.addEventListener("error", function () { showErr(v, err); });
    v.addEventListener("volumechange", function () {
      if (mute) mute.textContent = v.muted || v.volume === 0 ? "🔇" : "🔊";
      if (vol) { var pc = Math.round((v.muted ? 0 : v.volume) * 100); vol.value = String(pc); vol.style.setProperty("--v", pc + "%"); }
      lsSet("rn_cine_vol", v.muted ? 0 : v.volume);
    });
    if (seek) seek.addEventListener("input", function () {
      if (isFinite(v.duration)) v.currentTime = (num(seek.value) / 1000) * v.duration;
    });
    if (vol) vol.addEventListener("input", function () {
      v.volume = clamp(num(vol.value) / 100, 0, 1); v.muted = false;
      vol.style.setProperty("--v", vol.value + "%");
    });
    if (big) big.addEventListener("click", function () { v.play().catch(function () {}); });
    v.addEventListener("click", function () { if (v.paused) v.play().catch(function () {}); else v.pause(); });
    v.addEventListener("dblclick", function () { toggleFs(); });
    ["mousemove", "touchstart"].forEach(function (ev) {
      var stage = $("#cxpStage");
      if (stage) stage.addEventListener(ev, wake, { passive: true });
    });
    v.play().catch(function () { /* مرورگر autoplay را بست — خود کاربر پخش می‌زند */ });
  }
  function attach(v, href) {
    if (PL.hls) { try { PL.hls.destroy(); } catch (e) {} PL.hls = null; }
    href = String(href || "");
    var isHls = /\.m3u8(\?|#|$)/i.test(href);
    if (!isHls) { v.src = href; return; }
    if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = href; return; }
    loadHls(function (Hls) {
      if (!Hls || !Hls.isSupported()) { v.src = href; return; }
      PL.hls = new Hls({ maxBufferLength: 30 });
      PL.hls.loadSource(href);
      PL.hls.attachMedia(v);
      PL.hls.on(Hls.Events.ERROR, function (e, d) {
        if (d && d.fatal) showErr(v, $("#cxpErr"));
      });
    });
  }
  function showErr(v, el) {
    if (!el) return;
    var host = "";
    try { host = new URL(v.currentSrc || v.src || "").host; } catch (e) {}
    el.textContent = host
      ? "پخش از «" + host + "» ممکن نشد. ممکن است لینک منقضی شده یا دامنه اجازهٔ پخش نداشته باشد."
      : "فایل پخش نشد؛ لینک یا فرمت را بررسی کن.";
    el.classList.add("on");
    toast("ویدیو پخش نشد", "err");
  }
  function wake() {
    var box = $("#cxp");
    if (!box) return;
    box.classList.remove("idle");
    clearTimeout(PL.idleT);
    PL.idleT = setTimeout(function () {
      var v = $("#cxV");
      if (v && !v.paused) box.classList.add("idle");
    }, 2800);
  }
  function togglePlay() { var v = $("#cxV"); if (!v) return; if (v.paused) v.play().catch(function () {}); else v.pause(); }
  function seekBy(s) { var v = $("#cxV"); if (!v || !isFinite(v.duration)) return; v.currentTime = clamp(v.currentTime + s, 0, v.duration); }
  function toggleMute() { var v = $("#cxV"); if (!v) return; v.muted = !v.muted; }
  function toggleFs() {
    var st = $("#cxpStage");
    if (!st) return;
    var d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      var req = st.requestFullscreen || st.webkitRequestFullscreen;
      if (!req) return;
      try {
        var p = req.call(st);
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    } else {
      var ex = d.exitFullscreen || d.webkitExitFullscreen;
      if (!ex) return;
      try {
        var q = ex.call(d);
        if (q && q.catch) q.catch(function () {});
      } catch (e) {}
    }
  }
  function togglePip() {
    var v = $("#cxV");
    if (!v) return;
    if (!document.pictureInPictureEnabled || !v.requestPictureInPicture) return toast("مرورگر تو PiP را پشتیبانی نمی‌کند", "err");
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(function () {});
    else v.requestPictureInPicture().catch(function () { toast("PiP ممکن نشد", "err"); });
  }
  function setRate(r, btn) {
    var v = $("#cxV");
    if (!v) return;
    v.playbackRate = r;
    var lb = $("#cxSpd");
    if (lb) lb.textContent = (r === 1 ? "۱" : fa(r)) + "×";
    $$("#cxpMenu [data-spd]").forEach(function (b) { b.classList.toggle("on", num(b.getAttribute("data-spd")) === r); });
    closeMenu();
    toast("سرعت پخش: " + fa(r) + "×", "ok");
  }
  function setSub(i, label) {
    var v = $("#cxV");
    if (!v) return;
    var tracks = v.textTracks || [];
    for (var k = 0; k < tracks.length; k++) tracks[k].mode = (k === i ? "showing" : "disabled");
    closeMenu();
    toast(i < 0 ? "زیرنویس خاموش شد" : "زیرنویس: " + (label || fa(i + 1)), "ok");
  }
  function closeMenu() { var m = $("#cxpMenu"); if (m) { m.classList.remove("on"); m.innerHTML = ""; } }
  function menu(kind, it, srcs, idx) {
    var m = $("#cxpMenu");
    if (!m) return;
    if (m.classList.contains("on")) { closeMenu(); return; }
    var h = "";
    if (kind === "speed") {
      h = "<b>سرعت پخش</b>" + [0.5, 0.75, 1, 1.25, 1.5, 2].map(function (r) {
        return '<button type="button" data-spd="' + r + '">' + (r === 1 ? "عادی (۱×)" : fa(r) + "×") + "</button>";
      }).join("");
    } else if (kind === "q") {
      h = "<b>کیفیت / منبع</b>" + srcs.map(function (s, i) {
        return '<button type="button" data-src="' + i + '"' + (i === idx ? ' class="on"' : "") + ">" + esc(s.label || ("منبع " + (i + 1))) + "</button>";
      }).join("");
    } else if (kind === "sub") {
      h = "<b>زیرنویس</b><button type=\"button\" data-sub=\"-1\">خاموش</button>" +
        PL.subs.map(function (s, i) { return '<button type="button" data-sub="' + i + '">' + esc(s.label || ("زیرنویس " + (i + 1))) + "</button>"; }).join("");
    }
    m.innerHTML = h;
    m.classList.add("on");
  }
  function bindPlayerChrome(it, srcs, idx, emb) {
    var box = $("#cxp");
    if (!box) return;
    box.addEventListener("click", function (e) {
      var t = e.target;
      if (!t.closest) return;
      var mi = t.closest("[data-spd]");
      if (mi) return setRate(num(mi.getAttribute("data-spd")), mi);
      var ms = t.closest("[data-src]");
      if (ms) {
        var i2 = num(ms.getAttribute("data-src"));
        var at = 0;
        var v0 = $("#cxV");
        if (v0 && isFinite(v0.currentTime)) at = v0.currentTime;
        openPlayer(it.id, i2);
        var v1 = $("#cxV");
        if (v1 && at > 10) v1.addEventListener("loadedmetadata", function once() {
          v1.currentTime = at; v1.removeEventListener("loadedmetadata", once);
        });
        return;
      }
      var msub = t.closest("[data-sub]");
      if (msub) {
        var si = num(msub.getAttribute("data-sub"), -1);
        return setSub(si, si >= 0 && PL.subs[si] ? PL.subs[si].label : "");
      }
      var b = t.closest("[data-p]");
      if (!b) return;
      var a = b.getAttribute("data-p");
      if (a === "close") return closePlayer();
      if (a === "info") return openDetail(it.id);
      if (a === "toggle") return togglePlay();
      if (a === "back") return seekBy(-10);
      if (a === "fwd") return seekBy(10);
      if (a === "mute") return toggleMute();
      if (a === "pip") return togglePip();
      if (a === "fs") return toggleFs();
      if (a === "next") return openPlayer(it.id, (idx + 1) % srcs.length);
      if (a.indexOf("menu:") === 0) return menu(a.slice(5), it, srcs, idx);
    });
    wake();
  }
  function closePlayer() {
    var v = $("#cxV");
    if (v) { posSet(PL.id, PL.idx, v.currentTime); try { v.pause(); } catch (e) {} }
    if (PL.hls) { try { PL.hls.destroy(); } catch (e) {} PL.hls = null; }
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(function () {});
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    var wrap = $("#cxPlayer");
    if (wrap) { wrap.hidden = true; wrap.innerHTML = ""; }
    PL.id = null;
    S.tmpItem = null;
    unlock();
  }
  function keyboard(e) {
    var wrap = $("#cxPlayer");
    if (!wrap || wrap.hidden) {
      if (e.key === "Escape") {
        if ($("#cxModal") && !$("#cxModal").hidden) modalClose();
        if ($("#cxSheet") && !$("#cxSheet").hidden) closeSheet();
      }
      return;
    }
    var tag = (e.target && e.target.tagName) || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    switch (e.key) {
      case " ": case "k": e.preventDefault(); togglePlay(); break;
      case "ArrowLeft": seekBy(10); break;
      case "ArrowRight": seekBy(-10); break;
      case "ArrowUp": e.preventDefault(); var v1 = $("#cxV"); if (v1) v1.volume = clamp(v1.volume + 0.1, 0, 1); break;
      case "ArrowDown": e.preventDefault(); var v2 = $("#cxV"); if (v2) v2.volume = clamp(v2.volume - 0.1, 0, 1); break;
      case "m": toggleMute(); break;
      case "f": toggleFs(); break;
      case "Escape": closePlayer(); break;
    }
  }

  /* ── ۱۳. آپلود (مالک/تیم) ───────────────────────────────────── */
  function uploadErr(e) {
    var c = String((e && (e.code || e.message)) || e || "");
    if (/storage\/unauthorized|permission_denied|permission/i.test(c)) return "اجازهٔ آپلود نداری؛ قواعد Storage باید برای تیم اجازه بدهد.";
    if (/storage\/unknown|404|not.?found|bucket|storage\/project/i.test(c)) return "Firebase Storage فعال نیست؛ فعلاً «لینک مستقیم» بده یا Storage را در کنسول فعال کن.";
    if (/quota/i.test(c)) return "سهمیهٔ Storage پر است.";
    if (/canceled|cancel/i.test(c)) return "آپلود لغو شد.";
    return "آپلود نشد: " + c;
  }
  function uploadFile(file, onP) {
    return new Promise(function (res, rej) {
      if (!storage) return rej(new Error("storage-off"));
      var ext = (String(file.name).split(".").pop() || "mp4").toLowerCase();
      var ref = storage.ref().child("cinema/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext);
      var task = ref.put(file, { contentType: file.type || "video/mp4" });
      task.on("state_changed",
        function (s) { if (onP) onP(Math.round((s.bytesTransferred / s.totalBytes) * 100)); },
        function (err) { rej(err); },
        function () { task.snapshot.ref.getDownloadURL().then(res).catch(rej); });
    });
  }
  function uploadForm(it) {
    var edit = !!it;
    it = it || { kind: "film", country: "خارجی", lang: "زیرنویس" };
    var v = function (x) { return esc(x == null ? "" : x); };
    var srcs = (it.sources || []).map(function (s) { return s.href; });
    var eps = (it.eps || []).map(function (e) { return e.title + " | " + e.href; }).join("\n");
    return '<button class="cx-x" type="button" data-close="1">✕</button><div class="cx-form">' +
      "<h2>" + (edit ? "ویرایش عنوان" : "آپلود فیلم / سریال / انیمه") + "</h2>" +
      '<p class="hint">اطلاعات در Realtime Database (مسیر <b>cinema</b>) و فایل در Firebase Storage ذخیره می‌شود. ' +
        "اگر Storage فعال نیست، فقط لینک مستقیم بده؛ همان لحظه در پلیر پخش می‌شود.</p>" +
      '<div class="cx-fgrid">' +
      '<label class="cx-f full">عنوان *<input id="uTitle" maxlength="90" value="' + v(it.title) + '" placeholder="مثلاً جوجوتسو کایسن"></label>' +
      '<label class="cx-f">عنوان لاتین<input id="uEn" maxlength="90" value="' + v(it.en) + '" placeholder="Jujutsu Kaisen"></label>' +
      '<label class="cx-f">نوع<select id="uKind">' +
        ["anime", "film", "series"].map(function (k) { return '<option value="' + k + '"' + (it.kind === k ? " selected" : "") + ">" + kindFa(k) + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="cx-f">سال<input id="uYear" type="number" min="1900" max="2100" value="' + v(it.year || "") + '" placeholder="2024"></label>' +
      '<label class="cx-f">امتیاز (۰ تا ۱۰)<input id="uRate" type="number" min="0" max="10" step="0.1" value="' + v(it.rate || "") + '" placeholder="8.5"></label>' +
      '<label class="cx-f">ژانرها <small>(با ویرگول جدا کن)</small><input id="uGenres" value="' + v((it.genres || []).join("، ")) + '" placeholder="اکشن، فانتزی"></label>' +
      '<label class="cx-f">استودیو<input id="uStudio" value="' + v(it.studio) + '" placeholder="MAPPA"></label>' +
      '<label class="cx-f">کشور<select id="uCountry">' +
        ["خارجی", "ایرانی"].map(function (c) { return '<option value="' + c + '"' + (it.country === c ? " selected" : "") + ">" + c + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="cx-f">زبان<select id="uLang">' +
        ["دوبله", "زیرنویس"].map(function (c) { return '<option value="' + c + '"' + (it.lang === c ? " selected" : "") + ">" + c + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="cx-f full">لینک پوستر <small>(اختیاری)</small><input id="uPoster" value="' + v(it.poster) + '" placeholder="https://…"></label>' +
      '<label class="cx-f full">خلاصه<textarea id="uDesc" maxlength="900">' + v(it.desc) + "</textarea></label>" +
      '<label class="cx-f full">لینک پخش ۱ <small>MP4 یا m3u8 یا امبد یوتیوب/آپارات</small><input id="uSrc1" value="' + v(srcs[0] || "") + '" placeholder="https://…/video.mp4"></label>' +
      '<label class="cx-f full">لینک پخش ۲ <small>(کیفیت دوم، اختیاری)</small><input id="uSrc2" value="' + v(srcs[1] || "") + '"></label>' +
      '<label class="cx-f full">قسمت‌ها <small>(هر خط: نام قسمت | لینک)</small><textarea id="uEps" placeholder="قسمت ۱ | https://…">' + v(eps) + "</textarea></label>" +
      '<label class="cx-f full cx-switch"><input id="uPrem" type="checkbox"' + (it.prem ? " checked" : "") + "> فقط برای کاربران پرمیوم</label>" +
      '<div class="cx-drop">' +
        "<b>یا فایل ویدیو را آپلود کن</b>" +
        '<input id="uFile" type="file" accept="video/*,.m3u8">' +
        '<div class="cx-prog" id="uProg"><i></i></div>' +
        "<small>فایل در Firebase Storage ذخیره می‌شود؛ برای فایل‌های بزرگ آپلود ممکن است چند دقیقه طول بکشد.</small>" +
      "</div></div>" +
      '<div class="cx-fact"><button class="cx-btn" type="button" id="uSave">' + (edit ? "💾 ذخیره تغییرات" : "🚀 انتشار در کاتالوگ") + "</button>" +
        '<button class="cx-btn ghost" type="button" data-close="1">انصراف</button>' +
        '<span class="sm" id="uMsg"></span></div></div>';
  }
  function openUpload(it) {
    if (!S.me) { toast("برای آپلود ابتدا در سایت وارد حساب شو", "err"); return; }
    if (!S.staff) { toast("آپلود فقط برای مالک و تیم است", "err"); return; }
    EDIT_ID = it && it.id ? it.id : null;
    modalOpen(uploadForm(it), true);
    setTimeout(function () { var el = $("#uTitle"); if (el) el.focus(); }, 60);
  }
  function readForm() {
    var g = function (id) { var e = $(id); return e ? String(e.value || "").trim() : ""; };
    var chk = function (id) { var e = $(id); return !!(e && e.checked); };
    var urls = [g("#uSrc1"), g("#uSrc2")].filter(Boolean);
    var eps = g("#uEps").split("\n").map(function (ln) {
      var p = ln.split("|");
      return { title: (p[0] || "").trim(), href: (p[1] || "").trim() };
    }).filter(function (e) { return e.href; });
    var obj = {
      title: g("#uTitle"), en: g("#uEn"), kind: g("#uKind") || "film",
      year: num(g("#uYear")) || null, rate: num(g("#uRate")) || null,
      genres: g("#uGenres"), studio: g("#uStudio"), country: g("#uCountry") || "خارجی",
      lang: g("#uLang") || "زیرنویس", poster: g("#uPoster"), desc: g("#uDesc"),
      prem: chk("#uPrem"), t: Date.now(),
      sources: urls.reduce(function (o, u, i) { o[i] = { label: i === 0 ? "کیفیت اصلی" : "کیفیت دوم", href: u }; return o; }, {}),
      eps: eps.length ? eps.reduce(function (o, e, i) { o[i] = e; return o; }, {}) : null,
      by: S.me, byName: (S.user && S.user.name) || ""
    };
    return { obj: obj, file: ($("#uFile") && $("#uFile").files && $("#uFile").files[0]) || null, urls: urls };
  }
  function saveItem(editId) {
    if (!S.staff) return toast("اجازهٔ ثبت نداری", "err");
    if (!db) return toast("فایربیس متصل نیست", "err");
    var f = readForm(), msg = $("#uMsg"), btn = $("#uSave");
    if (!f.obj.title) return toast("عنوان را بنویس", "err");
    if (!f.urls.length && !f.file) return toast("حداقل یک لینک پخش یا فایل انتخاب کن", "err");
    if (f.file && f.file.size > 900 * 1024 * 1024) toast("فایل خیلی بزرگ است؛ ممکن است آپلود نشود", "err");
    var finish = function (extra) {
      if (extra) f.obj.sources[Object.keys(f.obj.sources).length] = { label: "فایل آپلودشده", href: extra };
      var op = editId ? db.ref(PATH + "/" + editId).update(f.obj) : db.ref(PATH).push(f.obj);
      op.then(function () {
        toast(editId ? "تغییرات ذخیره شد ✓" : "عنوان به کاتالوگ اضافه شد 🎬", "ok");
        modalClose();
      }).catch(function (e) { toast("ذخیره نشد: " + ((e && e.message) || ""), "err"); });
    };
    if (btn) { btn.disabled = true; btn.textContent = "در حال ذخیره…"; }
    if (f.file) {
      var prog = $("#uProg"), bar = prog ? prog.querySelector("i") : null;
      if (prog) prog.classList.add("on");
      if (msg) msg.textContent = "آپلود ۰٪";
      uploadFile(f.file, function (p) {
        if (bar) bar.style.width = p + "%";
        if (msg) msg.textContent = "آپلود " + fa(p) + "٪";
      }).then(function (url) { finish(url); })
        .catch(function (e) {
          if (btn) { btn.disabled = false; btn.textContent = "🚀 انتشار در کاتالوگ"; }
          toast(uploadErr(e), "err");
          if (msg) msg.textContent = uploadErr(e);
        });
    } else finish(null);
  }

  /* ── ۱۴. رویدادها ───────────────────────────────────────────── */
  function toggleSheet() {
    var s = $("#cxSheet");
    if (!s) return;
    if (s.hidden) { paintSide(); s.hidden = false; document.body.classList.add("lock"); }
    else closeSheet();
  }
  function closeSheet() {
    var s = $("#cxSheet");
    if (s) { s.hidden = true; s.innerHTML = ""; }
    unlock();
  }
  function clearFilters() {
    S.q = ""; S.kind = "all"; S.genres = []; S.country = ""; S.lang = ""; S.rate = 0;
    S.yf = ""; S.yt = ""; S.playable = false; S.mine = false; S.page = 1;
    var q = $("#cxq"); if (q) q.value = "";
    paintAll(); syncURL();
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("#cxModal") === $("#cxModal") && t.id === "cxModal") return modalClose();
    if (t.closest("#cxSheet") === $("#cxSheet") && t.id === "cxSheet") return closeSheet();
    var wb = t.closest("[data-wb]");
    if (wb) { e.preventDefault(); toggleWatch(wb.getAttribute("data-wb")); return; }
    var pl = t.closest("[data-play]");
    if (pl) {
      e.preventDefault();
      var p = String(pl.getAttribute("data-play")).split(":");
      modalClose();
      openPlayer(p[0], num(p[1]));
      return;
    }
    var ep = t.closest("[data-ep]");
    if (ep) {
      e.preventDefault();
      var bits = String(ep.getAttribute("data-ep")).split(":");
      var itx = byId(bits[0]);
      if (!itx) return;
      var epi = num(bits[1]);
      var eobj = (itx.eps || [])[epi];
      if (!eobj) return;
      S.tmpItem = { id: itx.id + "__ep" + epi, title: itx.title + " — " + eobj.title, en: itx.en, kind: itx.kind,
        year: itx.year, rate: itx.rate, genres: itx.genres, studio: itx.studio, country: itx.country,
        lang: itx.lang, poster: itx.poster, desc: itx.desc, prem: itx.prem, featured: false,
        subs: itx.subs || [], eps: [], t: itx.t, sources: [{ label: eobj.title, href: eobj.href }] };
      var tmp = S.tmpItem;
      modalClose();
      openPlayer(tmp.id, 0);
      return;
    }
    var sh = t.closest("[data-share]");
    if (sh) {
      e.preventDefault();
      var sid = sh.getAttribute("data-share");
      var url = location.origin + location.pathname + "?watch=" + encodeURIComponent(sid);
      if (navigator.share) { navigator.share({ title: (byId(sid) || {}).title || "رونین فیلم", url: url }).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { toast("لینک کپی شد ✓", "ok"); }).catch(function () { toast(url); }); }
      else toast(url);
      return;
    }
    var del = t.closest("[data-del]");
    if (del) {
      e.preventDefault();
      if (!S.staff) return;
      var did = del.getAttribute("data-del");
      if (!confirm("این عنوان از کاتالوگ حذف شود؟")) return;
      if (!db) return toast("فایربیس متصل نیست", "err");
      db.ref(PATH + "/" + did).remove().then(function () { toast("حذف شد", "ok"); modalClose(); })
        .catch(function () { toast("حذف نشد؛ اجازهٔ قواعد را بررسی کن", "err"); });
      return;
    }
    var ed = t.closest("[data-edit]");
    if (ed) { e.preventDefault(); var x = byId(ed.getAttribute("data-edit")); if (x) openUpload(x); return; }
    var up = t.closest("[data-upsell]");
    if (up) { e.preventDefault(); return upsell(byId(S.detail)); }
    var tab = t.closest("[data-tab]");
    if (tab) {
      e.preventDefault();
      var k = tab.getAttribute("data-tab");
      S.page = 1;
      if (k === "mine") { S.mine = true; } else { S.mine = false; S.kind = k; }
      paintAll(); syncURL();
      return;
    }
    var fk = t.closest("[data-fk]");
    if (fk) { S.kind = fk.getAttribute("data-fk") || "all"; S.mine = false; S.page = 1; paintAll(); syncURL(); return; }
    var fg = t.closest("[data-fg]");
    if (fg) {
      var g = fg.getAttribute("data-fg");
      var i = S.genres.indexOf(g);
      if (i >= 0) S.genres.splice(i, 1); else S.genres.push(g);
      S.page = 1; paintResults(); paintSide(); syncURL(); return;
    }
    var fc = t.closest("[data-fc]");
    if (fc) { S.country = fc.getAttribute("data-fc") || ""; S.page = 1; paintResults(); paintSide(); syncURL(); return; }
    var fl = t.closest("[data-fl]");
    if (fl) { S.lang = fl.getAttribute("data-fl") || ""; S.page = 1; paintResults(); paintSide(); syncURL(); return; }
    var fr = t.closest("[data-fr]");
    if (fr) { S.rate = num(fr.getAttribute("data-fr")); S.page = 1; paintResults(); paintSide(); syncURL(); return; }
    if (t.closest("[data-clear]")) { e.preventDefault(); clearFilters(); return; }
    if (t.closest("[data-clear-g]")) { S.genres = []; S.page = 1; paintResults(); paintSide(); syncURL(); return; }
    var chip = t.closest("[data-chip-rm]");
    if (chip) {
      var key = chip.getAttribute("data-chip-rm");
      if (key === "q") { S.q = ""; var qi = $("#cxq"); if (qi) qi.value = ""; }
      else if (key === "kind") S.kind = "all";
      else if (key.indexOf("genre:") === 0) { var gg = key.slice(6); S.genres = S.genres.filter(function (x) { return x !== gg; }); }
      else if (key === "country") S.country = "";
      else if (key === "lang") S.lang = "";
      else if (key === "rate") S.rate = 0;
      else if (key === "years") { S.yf = ""; S.yt = ""; }
      else if (key === "playable") S.playable = false;
      else if (key === "mine") S.mine = false;
      S.page = 1; paintAll(); syncURL(); return;
    }
    var card = t.closest("[data-id]");
    if (card) { e.preventDefault(); openDetail(card.getAttribute("data-id")); return; }
    if (t.closest("[data-close]")) { e.preventDefault(); return modalClose(); }
    if (t.closest("[data-close-sheet]")) { e.preventDefault(); return closeSheet(); }
    if (t.closest("#cxFilterBtn")) { e.preventDefault(); return toggleSheet(); }
    if (t.closest("#cxUploadBtn")) { e.preventDefault(); return openUpload(null); }
    if (t.closest("#cxMore")) { e.preventDefault(); S.page++; paintGrid(); return; }
    if (t.closest("#cxqClear")) {
      e.preventDefault();
      S.q = ""; var qc = $("#cxq"); if (qc) qc.value = "";
      var x2 = $("#cxqClear"); if (x2) x2.hidden = true;
      S.page = 1; paintResults(); syncURL(); return;
    }
    if (t.closest("#uSave")) { e.preventDefault(); saveItem(EDIT_ID); return; }
  });

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === "cxq") {
      S.q = t.value; S.page = 1;
      var cl = $("#cxqClear"); if (cl) cl.hidden = !t.value;
      paintResults(); syncURL();
    } else if (t.id === "fYf") { S.yf = t.value; S.page = 1; paintResults(); syncURL(); }
    else if (t.id === "fYt") { S.yt = t.value; S.page = 1; paintResults(); syncURL(); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === "fPlay") { S.playable = t.checked; S.page = 1; paintResults(); paintSide(); syncURL(); }
    if (t.id === "cxSort") { S.sort = t.value; S.page = 1; paintGrid(); syncURL(); }
  });
  document.addEventListener("keydown", keyboard);
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      var q = $("#cxq"); if (q) q.focus();
    }
  });

  /* ── ۱۵. شروع ───────────────────────────────────────────────── */
  function boot() {
    readURL();
    var q = $("#cxq"); if (q) q.value = S.q;
    var sort = $("#cxSort"); if (sort) sort.value = S.sort;
    paintAll();
    paintChrome();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.RoninCinema = {
    state: S, catalog: catalog, visible: visible, open: openDetail,
    play: openPlayer, reload: paintAll, upload: openUpload
  };
})();
