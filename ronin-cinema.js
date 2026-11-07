/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — CINEMA · ronin-cinema.js
   صفحهٔ «فیلم و انیمه»: کاتالوگ واقعی + جست‌وجو + فیلتر + لیست تماشا
   + فرم افزودن برای مالک/تیم (ذخیره در فایربیس: cinema)
   ───────────────────────────────────────────────────────────────
   • به هستهٔ سایت دست نمی‌زند؛ فقط یک <section id="sec-cinema"> می‌سازد
   • از R.go استفاده می‌کند، پس با منو و داک خود سایت هماهنگ است
   • بدون فایربیس هم کار می‌کند (کاتالوگ پیش‌فرض داخل همین فایل)
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || window.__rnCinema) return;
  window.__rnCinema = true;

  var LIST_KEY = "ronin_watchlist", PATH = "cinema";
  var S = { q: "", kind: "all", mine: false, db: {}, open: null, loaded: false };

  function el(i) { return document.getElementById(i); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function num(n) { var s = String(n == null ? "" : n); return R.fa ? R.fa(s) : s; }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }

  /* ── ۱. کاتالوگ پیش‌فرض (عنوان‌های واقعی) ─────────────────── */
  var SEED = [
    { id: "s1", title: "حمله به تایتان", en: "Attack on Titan", kind: "anime", year: 2013, rate: 9.0,
      genres: "اکشن، فانتزی تاریک", studio: "WIT / MAPPA",
      desc: "بشریت پشت دیوارهای غول‌پیکر پناه گرفته تا از تایتان‌های آدم‌خوار در امان بماند؛ اما ارن یگر رازی را کشف می‌کند که همه‌چیز را عوض می‌کند." },
    { id: "s2", title: "شیطان‌کش", en: "Demon Slayer", kind: "anime", year: 2019, rate: 8.7,
      genres: "اکشن، شونن", studio: "ufotable",
      desc: "تانجیرو پس از قتل‌عام خانواده‌اش و نفرین شدن خواهرش، وارد سپاه شیطان‌کش‌ها می‌شود تا خواهرش را به انسان برگرداند." },
    { id: "s3", title: "جوجوتسو کایسن", en: "Jujutsu Kaisen", kind: "anime", year: 2020, rate: 8.6,
      genres: "اکشن، فراطبیعی", studio: "MAPPA",
      desc: "یوجی ایتادوری انگشت نفرین‌شده‌ای را می‌بلعد و به مدرسهٔ جادوگران جوجوتسو می‌رود تا با نفرین‌ها بجنگد." },
    { id: "s4", title: "وان پیس", en: "One Piece", kind: "anime", year: 1999, rate: 8.7,
      genres: "ماجراجویی، کمدی", studio: "Toei Animation",
      desc: "لوفی و خدمهٔ کلاه‌حصیری به دنبال گنج افسانه‌ای وان پیس می‌گردند تا او پادشاه دزدان دریایی شود." },
    { id: "s5", title: "سفر به شهر ارواح", en: "Spirited Away", kind: "film", year: 2001, rate: 8.6,
      genres: "فانتزی، خانوادگی", studio: "Studio Ghibli",
      desc: "چیهیرو در دنیای ارواح گرفتار می‌شود و باید با شجاعت و مهربانی راهی برای نجات پدر و مادرش پیدا کند." },
    { id: "s6", title: "فِریرن: آن سوی پایان سفر", en: "Frieren: Beyond Journey's End", kind: "anime", year: 2023, rate: 9.0,
      genres: "فانتزی، ماجراجویی", studio: "Madhouse",
      desc: "الف جادوگری که عمری طولانی دارد، پس از مرگ همراهانش سفری تازه را آغاز می‌کند تا معنای زمان و دوستی را بفهمد." },
    { id: "s7", title: "ناروتو شیپودن", en: "Naruto Shippuden", kind: "anime", year: 2007, rate: 8.2,
      genres: "اکشن، نینجا", studio: "Studio Pierrot",
      desc: "ناروتو پس از دو سال آموزش بازمی‌گردد تا هم‌روستایی‌اش ساسکه را برگرداند و آرزوی هوکاگه شدن را دنبال کند." },
    { id: "s8", title: "مرد اره‌ای", en: "Chainsaw Man", kind: "anime", year: 2022, rate: 8.5,
      genres: "اکشن، وحشت", studio: "MAPPA",
      desc: "دنجی با شیطان اره‌ای قرارداد می‌بندد و به شکارچی شیاطین تبدیل می‌شود؛ خونین، پرهیجان و پر از شوخی سیاه." },
    { id: "s9", title: "تلقین", en: "Inception", kind: "film", year: 2010, rate: 8.8,
      genres: "علمی‑تخیلی، معمایی", studio: "Warner Bros.",
      desc: "تیمی از متخصصان خواب وارد ذهن هدف می‌شوند تا ایده‌ای را بکارند؛ لایه‌های رؤیا هر لحظه فرو می‌ریزند." },
    { id: "s10", title: "تلاقی", en: "Interstellar", kind: "film", year: 2014, rate: 8.7,
      genres: "علمی‑تخیلی، درام", studio: "Paramount",
      desc: "کشاورزی خلبان برای نجات زمین از میان کرم‌چاله می‌گذرد و با گذر زمان و عشق پدرانه دست‌وپنجه نرم می‌کند." },
    { id: "s11", title: "تلماسه: بخش دوم", en: "Dune: Part Two", kind: "film", year: 2024, rate: 8.5,
      genres: "علمی‑تخیلی، حماسی", studio: "Legendary",
      desc: "پل آترایدیس با فرمن‌ها متحد می‌شود و انتقام خانواده‌اش را از خانهٔ هارکونن می‌گیرد." },
    { id: "s12", title: "اپنهایمر", en: "Oppenheimer", kind: "film", year: 2023, rate: 8.3,
      genres: "بیوگرافی، درام", studio: "Universal",
      desc: "روایت زندگی فیزیک‌دانی که بمب اتم را ساخت و تا آخر عمر با پیامد اخلاقی کارش جنگید." },
    { id: "s13", title: "چرنوبیل", en: "Chernobyl", kind: "series", year: 2019, rate: 9.3,
      genres: "درام، تاریخی", studio: "HBO",
      desc: "بازسازی دقیق فاجعهٔ هسته‌ای ۱۹۸۶ و بهای انسانی و سیاسی پنهان‌کاری." },
    { id: "s14", title: "بازی مرکب", en: "Squid Game", kind: "series", year: 2021, rate: 8.0,
      genres: "هیجان‌انگیز، بقا", studio: "Netflix",
      desc: "بدهکارانی که برای پول در بازی‌های کودکانه شرکت می‌کنند، می‌فهمند باخت یعنی مرگ." }
  ];

  var KINDS = [
    { id: "all", fa: "همه", ic: "✨" },
    { id: "anime", fa: "انیمه", ic: "🌸" },
    { id: "film", fa: "فیلم", ic: "🎬" },
    { id: "series", fa: "سریال", ic: "📺" }
  ];
  function kindFa(k) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i].id === k) return KINDS[i].fa; return k; }
  function kindIc(k) { for (var i = 0; i < KINDS.length; i++) if (KINDS[i].id === k) return KINDS[i].ic; return "🎞"; }

  /* ── ۲. استایل ────────────────────────────────────────────── */
  function css() {
    if (el("rnCineCss")) return;
    var s = document.createElement("style");
    s.id = "rnCineCss";
    s.textContent =
      "#sec-cinema{display:none}#sec-cinema.on{display:block}" +
      "#rnCine .ciTop{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}" +
      "#rnCine .ciSearch{flex:1 1 220px;min-width:160px;display:flex;align-items:center;gap:8px;" +
        "padding:0 12px;border-radius:13px;border:1px solid var(--ln);background:var(--g1,rgba(255,255,255,.05))}" +
      "#rnCine .ciSearch input{flex:1;border:0;background:none;outline:none;padding:11px 0;font-family:inherit;" +
        "font-size:13px;color:inherit;min-width:0}" +
      "#rnCine .ciTabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}" +
      "#rnCine .ciTab{cursor:pointer;border:1px solid var(--ln);background:var(--g1,rgba(255,255,255,.05));" +
        "color:inherit;font-family:inherit;font-size:11.5px;font-weight:800;padding:7px 12px;border-radius:11px;transition:.18s}" +
      "#rnCine .ciTab:hover{border-color:var(--ln2);transform:translateY(-1px)}" +
      "#rnCine .ciTab.on{color:#fff;border-color:transparent;background:linear-gradient(135deg,var(--vio),var(--cy))}" +
      "#rnCine .ciGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px}" +
      "@media(max-width:520px){#rnCine .ciGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}}" +
      "#rnCine .ciCard{position:relative;overflow:hidden;border-radius:16px;cursor:pointer;text-align:start;" +
        "border:1px solid var(--ln);background:var(--g2,rgba(255,255,255,.05));transition:transform .18s,box-shadow .18s,border-color .18s}" +
      "#rnCine .ciCard:hover{transform:translateY(-4px);border-color:var(--ln2);box-shadow:0 18px 40px rgba(0,0,0,.45)}" +
      "#rnCine .ciPost{position:relative;aspect-ratio:2/3;display:grid;place-items:center;overflow:hidden;" +
        "background:linear-gradient(150deg,rgba(124,92,255,.35),rgba(34,211,238,.22))}" +
      "#rnCine .ciPost img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
      "#rnCine .ciPost .ph{font-size:26px;font-weight:900;color:#fff;opacity:.92;letter-spacing:1px;" +
        "text-shadow:0 6px 18px rgba(0,0,0,.5);padding:8px;text-align:center;line-height:1.3}" +
      "#rnCine .ciRate{position:absolute;top:7px;inset-inline-start:7px;font-size:10px;font-weight:900;" +
        "padding:2px 7px;border-radius:99px;background:rgba(6,9,22,.8);color:#ffd66b;border:1px solid rgba(255,214,107,.4)}" +
      "#rnCine .ciW{position:absolute;top:7px;inset-inline-end:7px;width:26px;height:26px;border-radius:9px;" +
        "display:grid;place-items:center;font-size:12px;border:1px solid rgba(255,255,255,.22);" +
        "background:rgba(6,9,22,.7);color:#fff;cursor:pointer;padding:0}" +
      "#rnCine .ciW.on{background:linear-gradient(135deg,var(--vio),var(--cy));border-color:transparent}" +
      "#rnCine .ciBody{padding:8px 9px 10px}" +
      "#rnCine .ciT{font-size:12px;font-weight:900;line-height:1.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#rnCine .ciS{font-size:10px;opacity:.72;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      "#rnCine .ciEmpty{padding:26px 14px;text-align:center;font-size:12px;opacity:.75;border:1px dashed var(--ln2);" +
        "border-radius:16px}" +
      "#rnCine .ciForm{display:none;margin:0 0 16px;padding:14px;border-radius:16px;border:1px solid var(--ln);" +
        "background:var(--g2,rgba(255,255,255,.05))}" +
      "#rnCine .ciForm.on{display:block}" +
      "#rnCine .ciF{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}" +
      "@media(max-width:620px){#rnCine .ciF{grid-template-columns:1fr}}" +
      "#rnCine .ciF label{display:flex;flex-direction:column;gap:4px;font-size:10.5px;opacity:.8}" +
      "#rnCine .ciF input,#rnCine .ciF select,#rnCine .ciF textarea{width:100%;padding:9px 11px;border-radius:11px;" +
        "border:1px solid var(--ln);background:rgba(4,7,18,.55);color:inherit;font-family:inherit;font-size:12.5px}" +
      "#rnCine .ciF .full{grid-column:1/-1}" +
      "#rnCine .ciF textarea{min-height:74px;resize:vertical}" +

      "#rnCD{position:fixed;inset:0;z-index:9600;display:none;align-items:center;justify-content:center;padding:16px;" +
        "background:rgba(3,5,14,.76);backdrop-filter:blur(8px)}" +
      "#rnCD.on{display:flex}" +
      "#rnCD .box{position:relative;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:20px;" +
        "border:1px solid var(--ln2,rgba(150,170,255,.3));background:var(--g3,#0a0e22);padding:16px;" +
        "box-shadow:0 30px 80px rgba(0,0,0,.6)}" +
      "#rnCD .x{position:absolute;top:10px;inset-inline-end:10px;width:30px;height:30px;border-radius:10px;" +
        "border:1px solid var(--ln);background:rgba(255,255,255,.06);color:inherit;cursor:pointer}" +
      "#rnCD .post{width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;display:grid;place-items:center;" +
        "background:linear-gradient(150deg,rgba(124,92,255,.35),rgba(34,211,238,.22));margin-bottom:12px;position:relative}" +
      "#rnCD .post img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
      "#rnCD h3{margin:0 0 6px;font-size:16px;font-weight:900}" +
      "#rnCD .meta{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}" +
      "#rnCD .meta span{font-size:10px;padding:2px 8px;border-radius:99px;border:1px solid var(--ln);" +
        "background:rgba(255,255,255,.05)}" +
      "#rnCD p{margin:0 0 12px;font-size:12px;line-height:2;opacity:.9}" +
      "#rnCD .acts{display:flex;gap:7px;flex-wrap:wrap}" +
      "#rnCD .del{color:#ff8fa3;border-color:rgba(255,95,125,.4)!important}";
    document.head.appendChild(s);
  }

  /* ── ۳. داده ──────────────────────────────────────────────── */
  function all() {
    var out = SEED.slice();
    Object.keys(S.db || {}).forEach(function (k) {
      var v = S.db[k];
      if (!v || typeof v !== "object") return;
      v.id = k;
      out.unshift(v);
    });
    return out;
  }
  function watch() {
    try { return JSON.parse(localStorage.getItem(LIST_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveWatch(o) { try { localStorage.setItem(LIST_KEY, JSON.stringify(o)); } catch (e) {} }
  function hashHue(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }
  function poster(it) {
    if (it.poster) {
      return '<img src="' + esc(it.poster) + '" alt="' + esc(it.title) + '" loading="lazy" referrerpolicy="no-referrer"' +
        ' onerror="this.remove()">';
    }
    var h = hashHue(String(it.title || it.id || "x"));
    var h2 = (h + 48) % 360;
    return '<span class="ph" style="position:absolute;inset:0;display:grid;place-items:center;' +
      "background:linear-gradient(150deg,hsl(" + h + " 62% 30%),hsl(" + h2 + " 70% 22%))\">" +
      esc(kindIc(it.kind)) + "</span>";
  }
  function filtered() {
    var w = watch(), q = S.q.trim().toLowerCase();
    return all().filter(function (it) {
      if (S.kind !== "all" && it.kind !== S.kind) return false;
      if (S.mine && !w[it.id]) return false;
      if (!q) return true;
      var hay = [it.title, it.en, it.genres, it.studio, it.desc].join(" ").toLowerCase();
      return hay.indexOf(q) >= 0;
    }).sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
  }

  /* ── ۴. رندر ──────────────────────────────────────────────── */
  function card(it) {
    var w = watch();
    return '<div class="ciCard" role="button" tabindex="0" data-cine="' + esc(it.id) + '">' +
      '<div class="ciPost">' + poster(it) +
        (it.rate ? '<span class="ciRate">★ ' + esc(it.rate) + "</span>" : "") +
        '<button class="ciW' + (w[it.id] ? " on" : "") + '" type="button" data-cinew="' + esc(it.id) +
          '" title="لیست تماشا">' + (w[it.id] ? "✓" : "+") + "</button></div>" +
      '<div class="ciBody"><div class="ciT">' + esc(it.title || "—") + "</div>" +
        '<div class="ciS">' + esc(kindFa(it.kind)) + (it.year ? " · " + num(it.year) : "") +
          (it.studio ? " · " + esc(it.studio) : "") + "</div></div></div>";
  }

  function listHTML() {
    var arr = filtered();
    if (!arr.length) {
      return '<div class="ciEmpty">چیزی با این فیلتر پیدا نشد.<br>' +
        (S.mine ? "از دکمهٔ + روی هر کارت، به لیست تماشای خودت اضافه کن." : "عبارت دیگری را جست‌وجو کن.") + "</div>";
    }
    return arr.map(card).join("");
  }

  function formHTML() {
    if (!(R.isStaff && R.isStaff())) return "";
    return '<div class="ciForm" id="ciForm"><div class="ciF">' +
      '<label class="full">عنوان<input id="ciTitle" maxlength="90" placeholder="مثلاً جوجوتسو کایسن"></label>' +
      "<label>نوع<select id=\"ciKind\"><option value=\"anime\">انیمه</option><option value=\"film\">فیلم</option>" +
        '<option value="series">سریال</option></select></label>' +
      '<label>سال<input id="ciYear" type="number" min="1900" max="2100" placeholder="2024"></label>' +
      '<label>امتیاز<input id="ciRate" type="number" min="0" max="10" step="0.1" placeholder="8.5"></label>' +
      '<label>ژانرها<input id="ciGenres" maxlength="60" placeholder="اکشن، فانتزی"></label>' +
      '<label class="full">لینک پوستر (اختیاری)<input id="ciPoster" placeholder="https://…"></label>' +
      '<label class="full">خلاصه<textarea id="ciDesc" maxlength="600" placeholder="چند خط دربارهٔ داستان…"></textarea></label>' +
      "</div>" +
      '<div class="row" style="gap:7px;flex-wrap:wrap;margin-top:10px">' +
        '<button class="btn p mini" type="button" id="ciSave">💾 ذخیره در کاتالوگ</button>' +
        '<button class="btn mini" type="button" id="ciCancel">بستن</button>' +
        '<span class="sm mut">فقط مالک/تیم این فرم را می‌بیند؛ آیتم در فایربیس زیر <b>cinema</b> ذخیره می‌شود.</span>' +
      "</div></div>";
  }

  function inner() {
    var arr = all(), w = watch();
    var counts = { all: arr.length, anime: 0, film: 0, series: 0, mine: 0 };
    arr.forEach(function (it) { if (counts[it.kind] != null) counts[it.kind]++; if (w[it.id]) counts.mine++; });
    var tabs = KINDS.map(function (k) {
      return '<button class="ciTab' + (S.kind === k.id && !S.mine ? " on" : "") + '" type="button" data-cinek="' +
        k.id + '">' + k.ic + " " + esc(k.fa) + ' <b style="opacity:.65">' + num(counts[k.id]) + "</b></button>";
    }).join("") +
      '<button class="ciTab' + (S.mine ? " on" : "") + '" type="button" data-cinemine="1">🔖 لیست من ' +
        '<b style="opacity:.65">' + num(counts.mine) + "</b></button>";

    return '<div id="rnCine">' +
      '<div class="head" style="margin-bottom:12px"><h2 class="h2">🎬 فیلم و انیمه</h2>' +
        '<span class="chip cy">' + num(arr.length) + " عنوان</span></div>" +
      '<div class="ciTop">' +
        '<div class="ciSearch">🔍<input id="ciQ" placeholder="جست‌وجوی نام، ژانر یا استودیو…" value="' + esc(S.q) + '"></div>' +
        (R.isStaff && R.isStaff() ? '<button class="btn mini" type="button" id="ciAdd">＋ افزودن</button>' : "") +
      "</div>" +
      '<div class="ciTabs">' + tabs + "</div>" +
      formHTML() +
      '<div class="ciGrid" id="ciGrid">' + listHTML() + "</div>" +
      '<div class="sm mut" style="margin-top:14px;line-height:1.9">' +
        "پوسترها اختیاری‌اند؛ اگر لینک پوستر ندهی، کارت با گرادیان و آیکن نوع ساخته می‌شود. " +
        "لیست تماشا فقط روی همین دستگاه ذخیره می‌شود." +
      "</div></div>";
  }

  function paint() {
    var box = el("rnCine");
    if (!box) return;
    box.innerHTML = inner();
    var q = el("ciQ");
    if (q && S.q) { q.value = S.q; }
  }
  function paintList() {
    var g = el("ciGrid");
    if (g) g.innerHTML = listHTML();
  }

  /* ── ۵. مودال جزئیات ──────────────────────────────────────── */
  function find(id) {
    var arr = all();
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function trailerURL(it) {
    if (it.trailer) return it.trailer;
    return "https://www.youtube.com/results?search_query=" +
      encodeURIComponent((it.en || it.title || "") + " trailer");
  }
  function openDetail(id) {
    var it = find(id);
    if (!it) return;
    S.open = id;
    var w = watch();
    var d = el("rnCD");
    if (!d) {
      d = document.createElement("div");
      d.id = "rnCD";
      document.body.appendChild(d);
    }
    d.innerHTML = '<div class="box" role="dialog" aria-modal="true">' +
      '<button class="x" type="button" data-cineclose="1">✕</button>' +
      '<div class="post">' + poster(it) + "</div>" +
      "<h3>" + esc(it.title || "—") + (it.en ? ' <span class="sm mut">' + esc(it.en) + "</span>" : "") + "</h3>" +
      '<div class="meta">' +
        "<span>" + kindIc(it.kind) + " " + esc(kindFa(it.kind)) + "</span>" +
        (it.year ? "<span>" + num(it.year) + "</span>" : "") +
        (it.rate ? "<span>★ " + esc(it.rate) + "</span>" : "") +
        (it.studio ? "<span>" + esc(it.studio) + "</span>" : "") +
      "</div>" +
      (it.genres ? '<div class="meta">' + String(it.genres).split(/[,،]/).map(function (g) {
        return g.trim() ? "<span>" + esc(g.trim()) + "</span>" : "";
      }).join("") + "</div>" : "") +
      "<p>" + esc(it.desc || "خلاصه‌ای ثبت نشده.") + "</p>" +
      '<div class="acts">' +
        '<a class="btn p mini" href="' + esc(trailerURL(it)) + '" target="_blank" rel="noopener">▶ تریلر</a>' +
        '<button class="btn mini" type="button" data-cinew="' + esc(it.id) + '">' +
          (w[it.id] ? "✓ در لیست من" : "＋ لیست تماشا") + "</button>" +
        (R.isStaff && R.isStaff() && S.db[it.id]
          ? '<button class="btn mini del" type="button" data-cinedel="' + esc(it.id) + '">حذف</button>' : "") +
      "</div></div>";
    d.classList.add("on");
    document.body.classList.add("rnNoScroll");
  }
  function closeDetail() {
    var d = el("rnCD");
    if (d) d.classList.remove("on");
    document.body.classList.remove("rnNoScroll");
    S.open = null;
  }

  /* ── ۶. ساخت بخش + منو ────────────────────────────────────── */
  function buildSection() {
    if (el("sec-cinema")) return el("sec-cinema");
    var stage = el("stage");
    if (!stage) return null;
    var sec = document.createElement("section");
    sec.className = "sec";
    sec.id = "sec-cinema";
    sec.innerHTML = '<div id="rnCine"></div>';
    stage.appendChild(sec);
    return sec;
  }

  function addNav() {
    var rail = el("rail");
    if (rail && !rail.querySelector('[data-go="cinema"]')) {
      var anchor = rail.querySelector('.ditem[data-go="discover"]') || rail.querySelector('.ditem[data-go="bulletin"]');
      var item = document.createElement("div");
      item.className = "ditem";
      item.setAttribute("data-go", "cinema");
      item.innerHTML = "<i>🎬</i>فیلم و انیمه";
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(item, anchor.nextSibling);
      else rail.appendChild(item);
    }
    var nav = document.querySelector("#top .nav");
    if (nav && !nav.querySelector('[data-go="cinema"]')) {
      var a = document.createElement("a");
      a.setAttribute("data-go", "cinema");
      a.textContent = "🎬 فیلم و انیمه";
      nav.appendChild(a);
    }
  }

  /* ── ۷. رویدادها ──────────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("[data-cineclose]") || (t.id === "rnCD")) return closeDetail();
    var wb = t.closest("[data-cinew]");
    if (wb) {
      e.preventDefault();
      e.stopPropagation();
      var id = wb.getAttribute("data-cinew"), w = watch();
      if (w[id]) delete w[id]; else w[id] = 1;
      saveWatch(w);
      toast(w[id] ? "به لیست تماشا اضافه شد ✓" : "از لیست حذف شد", "ok");
      paintList();
      if (S.open === id) openDetail(id);
      var cnt = document.querySelector('[data-cinemine] b');
      if (cnt) { var n = Object.keys(watch()).length; cnt.textContent = num(n); }
      return;
    }
    var db = t.closest("[data-cinedel]");
    if (db && R.isStaff && R.isStaff()) {
      e.preventDefault();
      var did = db.getAttribute("data-cinedel");
      if (!R.db) return toast("فایربیس متصل نیست", "err");
      R.db.ref(PATH + "/" + did).remove().then(function () {
        toast("حذف شد", "ok");
        closeDetail();
        paint();
      }).catch(function () { toast("حذف نشد", "err"); });
      return;
    }
    var c = t.closest("[data-cine]");
    if (c) { e.preventDefault(); return openDetail(c.getAttribute("data-cine")); }
    var k = t.closest("[data-cinek]");
    if (k) {
      e.preventDefault();
      S.kind = k.getAttribute("data-cinek");
      S.mine = false;
      return paint();
    }
    if (t.closest("[data-cinemine]")) { e.preventDefault(); S.mine = !S.mine; return paint(); }
    if (t.closest("#ciAdd")) {
      e.preventDefault();
      var f = el("ciForm");
      if (f) f.classList.toggle("on");
      return;
    }
    if (t.closest("#ciCancel")) { e.preventDefault(); var f2 = el("ciForm"); if (f2) f2.classList.remove("on"); return; }
    if (t.closest("#ciSave")) { e.preventDefault(); return saveItem(); }
    var goC = t.closest('[data-go="cinema"]');
    if (goC) { setTimeout(function () { paint(); }, 30); }
  }, true);

  document.addEventListener("input", function (e) {
    if (!e.target || e.target.id !== "ciQ") return;
    S.q = e.target.value;
    paintList();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && el("rnCD") && el("rnCD").classList.contains("on")) closeDetail();
  });

  /* ── ۸. ذخیرهٔ آیتم (فقط تیم) ─────────────────────────────── */
  function saveItem() {
    var g = function (i) { var n = el(i); return n ? String(n.value || "").trim() : ""; };
    var title = g("ciTitle");
    if (!title) return toast("عنوان را بنویس", "err");
    if (!R.db) return toast("فایربیس متصل نیست", "err");
    var obj = {
      title: title,
      kind: g("ciKind") || "anime",
      year: parseInt(g("ciYear"), 10) || null,
      rate: parseFloat(g("ciRate")) || null,
      genres: g("ciGenres"),
      poster: g("ciPoster"),
      desc: g("ciDesc"),
      by: R.ME || "",
      t: Date.now()
    };
    R.db.ref(PATH).push(obj).then(function () {
      toast("به کاتالوگ اضافه شد 🎬", "ok");
      var f = el("ciForm");
      if (f) { f.classList.remove("on"); f.querySelectorAll("input,textarea").forEach(function (n) { n.value = ""; }); }
    }).catch(function () { toast("ذخیره نشد", "err"); });
  }

  /* ── ۹. راه‌اندازی ────────────────────────────────────────── */
  function boot() {
    css();
    buildSection();
    addNav();
    paint();
    if (!S.loaded && R.watch) {
      S.loaded = true;
      try {
        R.watch(PATH, function (v) { S.db = v || {}; paint(); });
      } catch (e) {}
    }
    R.hooks.cinema = function () { paint(); };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [600, 1500, 3200].forEach(function (ms) { setTimeout(boot, ms); });

  R.cinema = { open: paint, state: S, all: all, filtered: filtered, detail: openDetail };
})();
