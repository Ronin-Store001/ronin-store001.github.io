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
  var EDIT_ID = null, POSTER_DATA = "";
  var db = null, auth = null, storage = null;

  /* ── تنظیمات ظاهری صفحه (فقط روی همین دستگاه) ─────────────── */
  var PREF_KEY = "rn_cine_pref";
  var PREF = ls(PREF_KEY, { density: "normal", ads: true, motion: true, auto: true });
  if (!PREF || typeof PREF !== "object") PREF = {};
  if (!PREF.density) PREF.density = "normal";
  if (typeof PREF.ads !== "boolean") PREF.ads = true;
  if (typeof PREF.motion !== "boolean") PREF.motion = true;
  if (typeof PREF.auto !== "boolean") PREF.auto = true;
  var HERO = { i: 0, sig: "", timer: null };
  var THEMES = [["neo", "🌌 نئو"], ["sakura", "🌸 ساکورا"], ["gold", "👑 طلایی"], ["cyber", "🧪 سایبر"], ["ember", "🔥 امبر"]];

  function themeGet() { try { return localStorage.getItem("ronin_hp_theme") || "neo"; } catch (e) { return "neo"; } }
  function themeSet(t) { try { localStorage.setItem("ronin_hp_theme", t); } catch (e) {} }
  function applyPrefs() {
    document.documentElement.setAttribute("data-rn-theme", themeGet());
    if (!document.body) return;
    document.body.classList.toggle("cx-noad", !PREF.ads);
    document.body.classList.toggle("cx-lite", !PREF.motion);
    document.body.classList.toggle("cx-density-compact", PREF.density === "compact");
    document.body.classList.toggle("cx-density-big", PREF.density === "big");
  }
  function savePrefs() { lsSet(PREF_KEY, PREF); applyPrefs(); }
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
    return '<article class="cx-card' + (locked ? " premium" : "") + '" data-id="' + esc(it.id) + '" data-kind="' + esc(it.kind) + '" tabindex="0" role="button" aria-label="' + esc(it.title) + '">' +
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
  function heroPool() {
    var list = visible(), feat = [], rest = [];
    list.forEach(function (it) { (it.featured ? feat : rest).push(it); });
    var playFirst = function (a, b) { return (plays(b) ? 1 : 0) - (plays(a) ? 1 : 0); };
    feat.sort(playFirst); rest.sort(playFirst);
    return feat.concat(rest).slice(0, 5);
  }
  function heroHTML(it, i, total) {
    var saved = watch()[it.id], rate = num(it.rate), h = hue(it.id || it.title);
    var meta = [];
    if (rate) meta.push('<span class="cx-hm-rate">★ ' + fa(rate.toFixed(1)) + "</span>");
    if (it.year) meta.push("<span>" + fa(it.year) + "</span>");
    meta.push("<span>" + kindIc(it.kind) + " " + kindFa(it.kind) + "</span>");
    if (it.country) meta.push("<span>" + esc(it.country) + "</span>");
    if (it.eps && it.eps.length) meta.push("<span>" + fa(it.eps.length) + " قسمت</span>");
    meta.push(plays(it) ? '<span class="ok">● آمادهٔ پخش</span>' : "<span>به‌زودی</span>");
    var dots = "";
    for (var d = 0; d < total; d++) {
      dots += '<button class="cx-hero-dot' + (d === i ? " on" : "") + '" type="button" data-hero-dot="' + d + '" aria-label="اسلاید ' + fa(d + 1) + '"></button>';
    }
    return '<div class="cx-hero-bg' + (it.poster ? " has-img" : "") + '" id="cxHeroBg" style="--h:' + h + '"></div>' +
      '<div class="cx-hero-mark" aria-hidden="true">' + esc(it.en || it.title) + "</div>" +
      '<div class="cx-hero-in">' +
        '<div class="cx-hero-poster">' + poster(it) + (rate ? '<b class="cx-hp-rate">★ ' + fa(rate.toFixed(1)) + "</b>" : "") + "</div>" +
        '<div class="cx-hero-tx">' +
          '<div class="cx-hero-kick"><i></i> پیشنهاد ویژهٔ رونین <b>' + fa(i + 1) + " / " + fa(total) + "</b></div>" +
          "<h2>" + esc(it.title) + (it.en ? "<small>" + esc(it.en) + "</small>" : "") + "</h2>" +
          '<div class="cx-hero-meta">' + meta.join("") + "</div>" +
          (it.genres.length ? '<div class="cx-hero-tags">' + it.genres.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("") + "</div>" : "") +
          "<p>" + esc(it.desc || "خلاصه‌ای برای این عنوان ثبت نشده.") + "</p>" +
          '<div class="cx-hero-act">' +
            (plays(it) ? '<button class="cx-btn cx-hero-play" type="button" data-play="' + esc(it.id) + ':0">▶ تماشا کن</button>' : "") +
            '<button class="cx-btn ghost" type="button" data-id="' + esc(it.id) + '">ℹ جزئیات</button>' +
            '<button class="cx-btn ghost" type="button" data-wb="' + esc(it.id) + '">' + (saved ? "✓ در لیست من" : "＋ لیست من") + "</button>" +
          "</div>" +
        "</div>" +
        '<div class="cx-hero-side">' +
          (rate ? '<div class="cx-score" style="--v:' + clamp(Math.round(rate * 10), 0, 100) + '"><b>' + fa(rate.toFixed(1)) + "</b><i>از ۱۰</i></div>" : "") +
          (it.studio ? '<div class="cx-hero-fact"><span>استودیو</span><b>' + esc(it.studio) + "</b></div>" : "") +
          '<div class="cx-hero-fact"><span>زبان</span><b>' + esc(it.lang || "—") + "</b></div>" +
          (it.eps && it.eps.length ? '<div class="cx-hero-fact"><span>قسمت‌ها</span><b>' + fa(it.eps.length) + " قسمت</b></div>" : "") +
        "</div>" +
      "</div>" +
      '<div class="cx-hero-bot">' +
        '<div class="cx-hero-dots">' + dots + "</div>" +
        '<div class="cx-hero-nav"><button class="cx-hero-arrow" type="button" data-hero="1" aria-label="بعدی">‹</button>' +
          '<span class="cx-hero-count">' + fa(i + 1) + " / " + fa(total) + "</span>" +
          '<button class="cx-hero-arrow" type="button" data-hero="-1" aria-label="قبلی">›</button></div>' +
      "</div>" +
      '<div class="cx-hero-prog' + (PREF.auto && PREF.motion ? " on" : "") + '" aria-hidden="true"><i></i></div>';
  }
  function stopHero() { clearTimeout(HERO.timer); HERO.timer = null; }
  function queueHero() {
    stopHero();
    if (!PREF.auto || !PREF.motion) return;
    HERO.timer = setTimeout(function () {
      if (document.hidden) { queueHero(); return; }
      var m = $("#cxModal"), s = $("#cxSheet");
      if ((m && !m.hidden) || (s && !s.hidden) || (window.RoninPlayer && window.RoninPlayer.isOpen())) { queueHero(); return; }
      heroGo(1);
    }, 8000);
  }
  function paintHero() {
    var box = $("#cxHero");
    if (!box) return;
    var pool = heroPool();
    if (!pool.length) { box.innerHTML = ""; stopHero(); return; }
    var sig = pool.map(function (x) { return x.id; }).join("|");
    if (sig !== HERO.sig) { HERO.sig = sig; HERO.i = 0; }
    if (HERO.i >= pool.length) HERO.i = 0;
    var it = pool[HERO.i];
    box.innerHTML = heroHTML(it, HERO.i, pool.length);
    var bg = $("#cxHeroBg");
    if (bg && it.poster) bg.style.backgroundImage = 'url("' + String(it.poster).replace(/"/g, "") + '")';
    queueHero();
  }
  function heroGo(dir) {
    var pool = heroPool();
    if (!pool.length) return;
    HERO.i = (HERO.i + num(dir, 1) + pool.length) % pool.length;
    paintHero();
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
      ["film", "🎬 فیلم", c.film], ["series", "📺 سریال", c.series],
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
    if (sheet && sheet.getAttribute("data-mode") === "filters") {
      sheet.innerHTML = '<div class="cx-sheet-in"><div class="cx-sheet-h"><b>فیلترها</b><button class="cx-x" type="button" data-close-sheet="1" style="position:static">✕</button></div>' +
        filtersHTML() + '<button class="cx-btn wide" type="button" data-close-sheet="1" style="margin-top:10px">نمایش نتایج</button></div>';
    }
  }
  function paintTitle() {
    var t = $("#cxTitle"), nav = $$("#cxNav a");
    var names = { all: "همهٔ عنوان‌ها", anime: "انیمه", film: "فیلم‌ها", series: "سریال‌ها", mine: "لیست تماشای من" };
    var cur = S.mine ? "mine" : S.kind;
    if (t) t.textContent = names[cur] || names.all;
    nav.forEach(function (a) {
      var k = a.getAttribute("data-nav");
      a.classList.toggle("on", k === cur || (k === "all" && cur === "all"));
    });
  }
  function paintAnimeBand() {
    var band = $("#cxAnimeBand");
    if (!band) return;
    var on = S.kind === "anime" && !S.mine;
    band.hidden = !on;
    if (!on) { band.innerHTML = ""; return; }
    var list = catalog().filter(function (x) { return x.kind === "anime"; });
    if (!list.length) { band.hidden = true; return; }
    var gens = {};
    list.forEach(function (x) {
      (x.genres || []).forEach(function (g) { gens[g] = (gens[g] || 0) + 1; });
    });
    var top = Object.keys(gens).sort(function (a, b) { return gens[b] - gens[a]; }).slice(0, 6);
    band.innerHTML = '<div class="cx-ab-in"><span class="cx-ab-k">RONIN ANIME · 忍</span>' +
      '<h2>دنیای انیمه</h2>' +
      '<p>' + fa(list.length) + ' عنوان — از شونن و اکشن تا فانتزی و درام. روی ژانر بزن تا فیلتر شود.</p>' +
      (top.length ? '<div class="cx-ab-chips">' + top.map(function (g) {
        return '<button class="cx-ab-chip" type="button" data-anime-genre="' + esc(g) + '">' + esc(g) + "</button>";
      }).join("") + "</div>" : "") +
      '</div><div class="cx-ab-mark" aria-hidden="true">🌸</div>';
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
    paintHero(); paintTabs(); paintTitle(); paintAnimeBand(); paintSide(); paintChips(); paintGrid(); paintChrome();
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
  /* پلیر واقعی در cinema-player.js است. اینجا فقط داده‌های عنوان را
     به آن می‌دهیم؛ اگر آن فایل نباشد، پیام روشن نشان داده می‌شود. */
  function openPlayer(id, idx) {
    var it = byId(id);
    if (!it) return;
    if (it.prem && !S.prem) return upsell(it);
    var srcs = (it.sources || []).filter(function (s) { return s && s.href; });
    if (!srcs.length) { toast("برای این عنوان هنوز لینک پخش ثبت نشده", "err"); return; }
    if (!window.RoninPlayer) { toast("ماژول پلیر بارگذاری نشد؛ cinema-player.js را بررسی کن", "err"); return; }
    idx = clamp(num(idx), 0, srcs.length - 1);
    window.RoninPlayer.open({
      id: it.id,
      title: it.title,
      subtitle: [kindFa(it.kind), it.year ? fa(it.year) : "", it.country || ""].filter(Boolean).join(" · "),
      poster: it.poster || "",
      badges: [it.rate ? "★ " + fa(it.rate) : "", it.en || ""].filter(Boolean),
      sources: srcs.map(function (s) { return { label: s.label || "پخش", src: s.href, subs: s.subs || [] }; }),
      subs: it.subs || [],
      index: idx,
      onNext: srcs.length > 1 ? function (from) { openPlayer(it.id, (num(from) + 1) % srcs.length); } : null,
      onClose: function () { S.tmpItem = null; unlock(); },
      onInfo: function () { openDetail(it.id); }
    });
  }

  function keyboard(e) {
    if (e.key !== "Escape") return;
    if (window.RoninPlayer && window.RoninPlayer.isOpen()) return;
    var m = $("#cxModal");
    if (m && !m.hidden) return modalClose();
    var s = $("#cxSheet");
    if (s && !s.hidden) closeSheet();
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
  function pickPoster(file, done) {
    if (!file || !/^image\//i.test(file.type || "")) return toast("فقط عکس انتخاب کن 🖼", "err");
    if (file.size > 6 * 1024 * 1024) return toast("عکس بزرگ‌تر از ۶ مگه ❌", "err");
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var W = 720, r = Math.min(1, W / (im.width || W));
          var c = document.createElement("canvas");
          c.width = Math.max(1, Math.round((im.width || W) * r));
          c.height = Math.max(1, Math.round((im.height || W) * r));
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          var out = c.toDataURL("image/webp", 0.82);
          if (out.indexOf("webp") === -1) out = c.toDataURL("image/jpeg", 0.82);
          if (out.length > 220000) out = c.toDataURL("image/jpeg", 0.6);
          if (out.length > 340000) return toast("عکس سنگینه، یکی سبک‌تر انتخاب کن ❌", "err");
          done(out);
        } catch (e) { toast("پردازش عکس نشد ❌", "err"); }
      };
      im.onerror = function () { toast("این عکس باز نشد ❌", "err"); };
      im.src = fr.result;
    };
    fr.onerror = function () { toast("خواندن عکس نشد ❌", "err"); };
    fr.readAsDataURL(file);
  }
  function uploadForm(it) {
    var edit = !!it;
    it = it || { kind: "film", country: "خارجی", lang: "زیرنویس" };
    var v = function (x) { return esc(x == null ? "" : x); };
    var srcs = (it.sources || []).map(function (s) { return s.href; });
    var eps = (it.eps || []).map(function (e) { return e.title + " | " + e.href; }).join("\n");
    return '<button class="cx-x" type="button" data-close="1">✕</button><div class="cx-form">' +
      "<h2>" + (edit ? "ویرایش عنوان" : "ثبت انیمه / فیلم / سریال") + "</h2>" +
      '<p class="hint">مشخصات را کامل کن؛ برای پوستر می‌توانی عکس از گالری بدهی یا لینک بگذاری. اطلاعات در مسیر <b>cinema</b> ذخیره می‌شود.</p>' +
      '<div class="cx-f full cx-poster-pick">' +
        '<div class="cx-poster-prev" id="uPosterPrev">' +
          (it.poster ? '<img src="' + v(it.poster) + '" alt="پوستر">' : '<span>🖼</span>') + '</div>' +
        '<div class="cx-poster-actions"><b>پوستر انیمه / فیلم</b>' +
          '<small>عکس عمودی از گالری انتخاب کن؛ خودکار فشرده می‌شود. یا لینک بده.</small>' +
          '<div class="cx-poster-row"><label class="cx-btn ghost sm">🖼 انتخاب عکس<input id="uPosterFile" type="file" accept="image/*" hidden></label>' +
          '<button class="cx-btn ghost sm" type="button" id="uPosterClear">حذف</button></div>' +
          '<input class="cx-poster-url" id="uPoster" maxlength="500" value="' + v(it.poster) + '" placeholder="یا لینک پوستر https://…">' +
        '</div></div>' +
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
      '<label class="cx-f full">خلاصه<textarea id="uDesc" maxlength="900">' + v(it.desc) + "</textarea></label>" +
      '<label class="cx-f full">لینک پخش ۱ <small>MP4 یا m3u8 یا امبد یوتیوب/آپارات</small><input id="uSrc1" value="' + v(srcs[0] || "") + '" placeholder="https://…/video.mp4"></label>' +
      '<label class="cx-f full cx-switch"><input id="uPrem" type="checkbox"' + (it.prem ? " checked" : "") + "> فقط برای کاربران پرمیوم</label>" +
      '<details class="cx-adv"><summary>⚙ گزینه‌های پیشرفته — کیفیت دوم، قسمت‌ها و آپلود فایل</summary>' +
        '<div class="cx-fgrid">' +
        '<label class="cx-f full">لینک پخش ۲ <small>(کیفیت دوم، اختیاری)</small><input id="uSrc2" value="' + v(srcs[1] || "") + '"></label>' +
        '<label class="cx-f full">قسمت‌ها <small>(هر خط: نام قسمت | لینک)</small><textarea id="uEps" placeholder="قسمت ۱ | https://…">' + v(eps) + "</textarea></label>" +
        '<div class="cx-drop">' +
          "<b>یا فایل ویدیو را آپلود کن</b>" +
          '<input id="uFile" type="file" accept="video/*,.m3u8">' +
          '<div class="cx-prog" id="uProg"><i></i></div>' +
          "<small>فایل در Firebase Storage ذخیره می‌شود؛ برای فایل‌های بزرگ آپلود ممکن است چند دقیقه طول بکشد.</small>" +
        "</div></div></details>" +
      "</div>" +
      '<div class="cx-fact"><button class="cx-btn" type="button" id="uSave">' + (edit ? "💾 ذخیره تغییرات" : "🚀 انتشار در کاتالوگ") + "</button>" +
        '<button class="cx-btn ghost" type="button" data-close="1">انصراف</button>' +
        '<span class="sm" id="uMsg"></span></div></div>';
  }
  function openUpload(it) {
    if (!S.me) { toast("برای آپلود ابتدا در سایت وارد حساب شو", "err"); return; }
    if (!S.staff) { toast("آپلود فقط برای مالک و تیم است", "err"); return; }
    EDIT_ID = it && it.id ? it.id : null;
    POSTER_DATA = "";
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
      lang: g("#uLang") || "زیرنویس", poster: g("#uPoster") || POSTER_DATA, desc: g("#uDesc"),
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
  function prefRow(k, t, s, on) {
    return '<label class="cx-set-row"><span>' + t + "<small>" + s + '</small></span><span class="cx-sw"><input type="checkbox" data-pref="' + k + '"' + (on ? " checked" : "") + '><i></i></span></label>';
  }
  function settingsHTML() {
    var th = themeGet();
    return '<div class="cx-sheet-in cx-set"><div class="cx-sheet-h"><b>⚙ تنظیمات صفحه</b><button class="cx-x" type="button" data-close-sheet="1" style="position:static">✕</button></div>' +
      '<p class="cx-set-note">این تنظیمات روی همین دستگاه ذخیره می‌شود و تم انتخابی روی صفحهٔ اصلی رونین هم اعمال می‌شود.</p>' +
      '<div class="cx-set-sec"><h5>تم صفحه</h5><div class="cx-pills">' +
        THEMES.map(function (t) {
          return '<button class="cx-pill' + (th === t[0] ? " on" : "") + '" type="button" data-theme="' + t[0] + '">' + t[1] + "</button>";
        }).join("") + "</div></div>" +
      '<div class="cx-set-sec"><h5>اندازهٔ کارت‌ها</h5><div class="cx-pills">' +
        [["compact", "کوچک"], ["normal", "معمولی"], ["big", "بزرگ"]].map(function (d) {
          return '<button class="cx-pill' + (PREF.density === d[0] ? " on" : "") + '" type="button" data-density="' + d[0] + '">' + d[1] + "</button>";
        }).join("") + "</div></div>" +
      '<div class="cx-set-sec"><h5>نمایش و حرکت</h5>' +
        prefRow("ads", "نمایش جایگاه تبلیغات", "بنر بالای کاتالوگ", PREF.ads) +
        prefRow("motion", "انیمیشن و افکت‌ها", "برای دستگاه‌های کند خاموش کن", PREF.motion) +
        prefRow("auto", "چرخش خودکار هیرو", "تغییر پیشنهاد ویژه هر ۸ ثانیه", PREF.auto) +
      "</div>" +
      '<div class="cx-set-sec"><h5>داده‌ها</h5>' +
        '<button class="cx-set-btn danger" type="button" data-pref="clear-watch">🧹 پاک کردن لیست تماشا</button>' +
        '<button class="cx-set-btn" type="button" data-pref="reset">↺ بازگشت به تنظیمات پیش‌فرض</button>' +
      "</div>" +
      '<div class="cx-set-foot">RONIN FILM · v2</div></div>';
  }
  function renderSettings() {
    var s = $("#cxSheet");
    if (s && !s.hidden && s.getAttribute("data-mode") === "set") s.innerHTML = settingsHTML();
  }
  function openSettings() {
    var s = $("#cxSheet");
    if (!s) return;
    s.setAttribute("data-mode", "set");
    s.innerHTML = settingsHTML();
    s.hidden = false;
    document.body.classList.add("lock");
  }
  function toggleSheet() {
    var s = $("#cxSheet");
    if (!s) return;
    if (s.hidden || s.getAttribute("data-mode") !== "filters") {
      s.setAttribute("data-mode", "filters");
      paintSide();
      s.hidden = false;
      document.body.classList.add("lock");
    } else closeSheet();
  }
  function closeSheet() {
    var s = $("#cxSheet");
    if (s) { s.hidden = true; s.innerHTML = ""; s.removeAttribute("data-mode"); }
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
    var hd = t.closest("[data-hero]");
    if (hd) { e.preventDefault(); return heroGo(hd.getAttribute("data-hero")); }
    var hdot = t.closest("[data-hero-dot]");
    if (hdot) { e.preventDefault(); HERO.i = num(hdot.getAttribute("data-hero-dot")); return paintHero(); }
    if (t.closest("#cxSetBtn")) { e.preventDefault(); return openSettings(); }
    var thm = t.closest("[data-theme]");
    if (thm) {
      e.preventDefault();
      themeSet(thm.getAttribute("data-theme"));
      applyPrefs(); renderSettings();
      toast("تم صفحه عوض شد", "ok");
      return;
    }
    var den = t.closest("[data-density]");
    if (den) { e.preventDefault(); PREF.density = den.getAttribute("data-density"); savePrefs(); renderSettings(); return; }
    var pf = t.closest("button[data-pref]");
    if (pf) {
      e.preventDefault();
      var pk = pf.getAttribute("data-pref");
      if (pk === "clear-watch") {
        if (!confirm("لیست تماشای این دستگاه پاک شود؟")) return;
        try { localStorage.removeItem(WKEY); } catch (err) {}
        paintResults(); renderSettings();
        toast("لیست تماشا پاک شد", "ok");
        return;
      }
      if (pk === "reset") {
        PREF = { density: "normal", ads: true, motion: true, auto: true };
        themeSet("neo");
        savePrefs(); renderSettings(); paintAll();
        toast("تنظیمات به حالت اولیه برگشت", "ok");
        return;
      }
    }
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
    var ag = t.closest("[data-anime-genre]");
    if (ag) {
      e.preventDefault();
      S.kind = "anime"; S.mine = false; S.page = 1;
      S.genres = [ag.getAttribute("data-anime-genre") || ""];
      paintAll(); syncURL();
      return;
    }
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
    if (t.closest("#uPosterClear")) {
      e.preventDefault();
      POSTER_DATA = "";
      var pu = $("#uPoster"); if (pu) pu.value = "";
      var pv = $("#uPosterPrev"); if (pv) pv.innerHTML = "<span>🖼</span>";
      return;
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
    if (!t) return;
    if (t.matches && t.matches("input[data-pref]")) {
      var pk = t.getAttribute("data-pref");
      PREF[pk] = t.checked;
      savePrefs();
      if (pk === "auto" || pk === "motion") paintHero();
      return;
    }
    if (!t.id) return;
    if (t.id === "uPosterFile") {
      var pf = t.files && t.files[0];
      if (pf) pickPoster(pf, function (data) {
        POSTER_DATA = data;
        var prev = $("#uPosterPrev");
        if (prev) prev.innerHTML = '<img src="' + data + '" alt="پوستر">';
        var url = $("#uPoster"); if (url) url.value = "";
        toast("پوستر آماده شد ✅", "ok");
      });
      return;
    }
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
    applyPrefs();
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
    play: openPlayer, reload: paintAll, upload: openUpload, settings: openSettings
  };
})();
