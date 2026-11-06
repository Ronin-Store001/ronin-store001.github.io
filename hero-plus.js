/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — HERO PLUS v2  ·  hero-plus.js
   صفحهٔ اول کامل: بَنر، کاوش سریع، اسلایدر ویژه، پست‌ها، فروشگاه،
   اعضای فعال، همهمهٔ چت، شروع سریع و کارت پرمیوم — سه‌زبانه.
   ───────────────────────────────────────────────────────────────
   نصب: این فایل جای هیرو و بلوک‌های قدیمی صفحهٔ خانه را می‌گیرد.
   چیزی حذف نمی‌شود؛ فقط پنهان می‌شود و #dbWarn سر جایش می‌ماند.
   بدون این فایل، صفحهٔ اول قبلی مثل قبل کار می‌کند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R || R.__hp) return;
  R.__hp = true;

  var LANGS = ["fa", "en", "tr"];
  var ROOT = "#sec-home", BOX = "#hpRoot";
  /* عکس داخل «سیاره»: یا لینک عکس را همینجا بگذار، یا در تنظیمات سایت
     مقدار orbImg را ذخیره کن (R.SITE.orbImg). خالی باشد → کانجی 忍 */
  var ORB_IMG = "";
  var lastLang = null, rotI = 0, spotI = 0;
  var ticker = null, rotTimer = null, spotTimer = null;

  function el(i) { return document.getElementById(i); }
  function esc(s) { return R.esc ? R.esc(s) : String(s == null ? "" : s); }
  function clean(s, n) { return R.clean ? R.clean(s, n) : String(s || "").slice(0, n || 200); }
  function toast(m, k) { if (R.toast) R.toast(m, k || "ok"); }
  function langq() {
    try {
      if (R.i18n && R.i18n.get) {
        var l = R.i18n.get();
        return LANGS.indexOf(l) >= 0 ? l : "fa";
      }
    } catch (e) {}
    return "fa";
  }
  function isFa() { return langq() === "fa"; }
  function t(k) { var x = T[k]; return x ? (x[langq()] || x.fa) : k; }
  function num(n) { var s = String(n == null ? 0 : n); return (isFa() && R.fa) ? R.fa(s) : s; }
  function cnt(o) { return o ? Object.keys(o).length : 0; }
  function list(o, sort) {
    return Object.keys(o || {}).map(function (k) {
      var v = o[k];
      if (!v || typeof v !== "object") v = { v: v };
      v.id = k; return v;
    }).sort(sort || function (a, b) { return (b.t || 0) - (a.t || 0); });
  }
  function ini(name) {
    var s = String(name == null ? "" : name).trim();
    return s ? s.slice(0, 2).toUpperCase() : "؟";
  }
  function ago(ts) {
    if (!ts) return "";
    var d = Date.now() - ts, m = Math.floor(d / 60000);
    if (m < 1) return t("now");
    if (m < 60) return num(m) + " " + t("m1");
    var h = Math.floor(m / 60);
    if (h < 24) return num(h) + " " + t("h1");
    return num(Math.floor(h / 24)) + " " + t("d1");
  }
  function day(ts) {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleDateString(langq() === "fa" ? "fa-IR"
        : (langq() === "tr" ? "tr-TR" : "en-GB"));
    } catch (e) { return ""; }
  }

  /* ── ۱. دیکشنری سه‌زبانه ─────────────────────────────────── */
  var T = {
    eye: { fa: "نسخهٔ نئو رین سیتی", en: "Neo Rain City edition", tr: "Neo Rain City sürümü" },
    h1a: { fa: "به دنیای رونین", en: "Welcome to Ronin", tr: "Ronin dünyasına" },
    h1b: { fa: "خوش آمدی", en: "universe", tr: "hoş geldin" },
    rotLead: { fa: "اینجا:", en: "Here:", tr: "Burada:" },
    rot1: { fa: "دورآوازی و اپ", en: "patches & OST", tr: "parçalar ve OST" },
    rot2: { fa: "خبرهای داغ", en: "hot news", tr: "sıcak haberler" },
    rot3: { fa: "فروشگاه و آگهی", en: "store & listings", tr: "mağaza ve ilanlar" },
    rot4: { fa: "انجمن و چت", en: "community & chat", tr: "topluluk ve sohbet" },
    rot5: { fa: "دنیای پرمیوم", en: "the premium world", tr: "premium dünya" },
    lead: {
      fa: "همه‌چیز در یک صفحه: انجمن و چت زنده، فروشگاه و آگهی، اطلاعیه‌ها و دنیای پرمیوم — همه با هم.",
      en: "Everything on one page: community and live chat, store and listings, bulletins and the premium world.",
      tr: "Her şey tek sayfada: topluluk ve canlı sohbet, mağaza ve ilanlar, duyurular ve premium dünya."
    },
    cta1: { fa: "شروع ماجراجویی", en: "Start the journey", tr: "Yolculuğa başla" },
    cta2: { fa: "کشف تازه‌ها", en: "Discover", tr: "Keşfet" },
    cta3: { fa: "فروشگاه", en: "Store", tr: "Mağaza" },
    online: { fa: "آنلاین", en: "online", tr: "çevrimiçi" },
    news: { fa: "اخبار", en: "News", tr: "Haberler" },
    community: { fa: "انجمن", en: "Community", tr: "Topluluk" },
    chat: { fa: "چت زنده", en: "Live chat", tr: "Canlı sohbet" },
    market: { fa: "فروشگاه", en: "Store", tr: "Mağaza" },
    premium: { fa: "پرمیوم", en: "Premium", tr: "Premium" },
    sOnline: { fa: "آنلاین", en: "online", tr: "çevrimiçi" },
    sUsers: { fa: "کاربر", en: "users", tr: "kullanıcı" },
    sPosts: { fa: "پست", en: "posts", tr: "gönderi" },
    sAnime: { fa: "انیمه", en: "anime", tr: "anime" },
    sItems: { fa: "کالا", en: "items", tr: "ürün" },
    prem: { fa: "پرمیوم", en: "premium", tr: "premium" },
    live: { fa: "زنده", en: "live", tr: "canlı" },
    ticker: {
      fa: "پست بگذار · آگهی بده · پرمیوم بگیر · دوست پیدا کن · تریلر ببین · خبر بخوان",
      en: "Post · List · Go premium · Make friends · Watch trailers · Read news",
      tr: "Paylaş · İlan ver · Premium al · Arkadaş bul · Fragman izle · Haber oku"
    },
    dock: { fa: "کاوش سریع", en: "Quick explore", tr: "Hızlı keşif" },
    all: { fa: "همه", en: "All", tr: "Tümü" },
    dAnime: { fa: "کتابخانه و تریلر", en: "Library & trailers", tr: "Kütüphane ve fragman" },
    bulletin: { fa: "اطلاعیه‌ها", en: "Bulletins", tr: "Duyurular" },
    dBul: { fa: "خبر، تریلر، اعلان", en: "News, trailers, drops", tr: "Haber, fragman, duyuru" },
    rank: { fa: "رتبه‌بندی", en: "Ranking", tr: "Sıralama" },
    dRank: { fa: "بهترین اعضای رونین", en: "Top Ronin members", tr: "En iyi Ronin üyeleri" },
    explore: { fa: "کشف", en: "explore", tr: "keşfet" },
    pickMarket: { fa: "از فروشگاه", en: "From the store", tr: "Mağazadan" },
    pickUser: { fa: "عضو برتر رونین", en: "Top Ronin member", tr: "En iyi Ronin üyesi" },
    pickChat: { fa: "از چت زنده", en: "From live chat", tr: "Canlı sohbetten" },
    pickRank: { fa: "تازه‌ترین آگهی", en: "Fresh listings", tr: "Yeni ilanlar" },
    dComm: { fa: "پست، لایک، گفتگو", en: "Posts, likes, talk", tr: "Gönderi, beğeni, sohbet" },
    dChat: { fa: "اتاق رونین", en: "The Ronin room", tr: "Ronin odası" },
    dMarket: { fa: "خرید و آگهی", en: "Buy & listings", tr: "Alışveriş ve ilan" },
    dPrem: { fa: "ویژگی‌های ویژه", en: "Extra features", tr: "Özel özellikler" },
    spot: { fa: "پیشنهاد ویژه", en: "Spotlight", tr: "Öne çıkan" },
    pickAnime: { fa: "انیمهٔ منتخب", en: "Featured anime", tr: "Öne çıkan anime" },
    pickNews: { fa: "آخرین خبر", en: "Latest news", tr: "Son haber" },
    pickPrem: { fa: "دنیای پرمیوم", en: "The premium world", tr: "Premium dünya" },
    open: { fa: "مشاهده", en: "Open", tr: "Aç" },
    read: { fa: "خواندن", en: "Read", tr: "Oku" },
    eps: { fa: "قسمت", en: "episodes", tr: "bölüm" },
    noAnime: { fa: "هنوز انیمه‌ای اضافه نشده", en: "No anime added yet", tr: "Henüz anime yok" },
    noNews: { fa: "هنوز خبری منتشر نشده", en: "No news yet", tr: "Henüz haber yok" },
    premTitle: { fa: "رونین را کامل تجربه کن", en: "Experience all of Ronin", tr: "Ronin'i tam yaşa" },
    premDesc: {
      fa: "نشان ویژه، گروه‌های چت، آگهی بیشتر و دسترسی زودتر به تریلرها.",
      en: "Special badge, chat groups, more listings and early access to trailers.",
      tr: "Özel rozet, sohbet grupları, daha çok ilan ve fragmanlara erken erişim."
    },
    premCta: { fa: "دریافت پرمیوم", en: "Get premium", tr: "Premium al" },
    f1: { fa: "نشان ویژه", en: "Special badge", tr: "Özel rozet" },
    f2: { fa: "گروه‌های چت", en: "Chat groups", tr: "Sohbet grupları" },
    f3: { fa: "آگهی بیشتر", en: "More listings", tr: "Daha çok ilan" },
    f4: { fa: "دسترسی زودتر", en: "Early access", tr: "Erken erişim" },
    posts: { fa: "آخرین پست‌ها", en: "Latest posts", tr: "Son gönderiler" },
    noPosts: { fa: "هنوز پستی نیست — اولین نفر باش", en: "No posts yet — be the first", tr: "Henüz gönderi yok — ilk sen ol" },
    newItems: { fa: "تازه‌های فروشگاه", en: "New in store", tr: "Mağazada yeni" },
    noItems: { fa: "هنوز آگهی‌ای ثبت نشده", en: "No listings yet", tr: "Henüz ilan yok" },
    top: { fa: "فعال‌ترین اعضا", en: "Top members", tr: "En aktif üyeler" },
    noUsers: { fa: "هنوز کاربری نیست", en: "No users yet", tr: "Henüz kullanıcı yok" },
    chatBuzz: { fa: "همهمهٔ چت", en: "Chat buzz", tr: "Sohbet akışı" },
    noChat: { fa: "چت خالیه — تو شروع کن", en: "Chat is empty — start it", tr: "Sohbet boş — sen başlat" },
    start: { fa: "شروع سریع", en: "Quick start", tr: "Hızlı başlangıç" },
    st1: { fa: "حساب بساز", en: "Create an account", tr: "Hesap oluştur" },
    st1d: { fa: "با ایمیل، در ۲۰ ثانیه", en: "With email, in 20 seconds", tr: "E-posta ile, 20 saniyede" },
    st2: { fa: "پست بگذار", en: "Share a post", tr: "Gönderi paylaş" },
    st2d: { fa: "توی انجمن دیده شو", en: "Get seen in the community", tr: "Toplulukta görün" },
    st3: { fa: "آگهی بده", en: "List something", tr: "İlan ver" },
    st3d: { fa: "محصولت را بفروش", en: "Sell your item", tr: "Ürününü sat" },
    go: { fa: "برو", en: "Go", tr: "Git" },
    guest: { fa: "مهمان", en: "Guest", tr: "Misafir" },
    login: { fa: "ورود / ثبت‌نام", en: "Log in / Sign up", tr: "Giriş / Kayıt" },
    onlineNow: { fa: "همین حالا آنلاین", en: "online right now", tr: "şu anda çevrimiçi" },
    secAgo: { fa: "ثانیه پیش", en: "s ago", tr: "sn önce" },
    now: { fa: "همین حالا", en: "just now", tr: "az önce" },
    m1: { fa: "دقیقه پیش", en: "min ago", tr: "dk önce" },
    h1: { fa: "ساعت پیش", en: "h ago", tr: "sa önce" },
    d1: { fa: "روز پیش", en: "d ago", tr: "g önce" },
    more: { fa: "بیشتر", en: "more", tr: "daha" },
    viewAll: { fa: "همه", en: "View all", tr: "Tümü" }
  };

  /* ── ۲. استایل ───────────────────────────────────────────── */
  function css() {
    if (el("hpCss")) return;
    var s = document.createElement("style");
    s.id = "hpCss";
    s.textContent =
      /* پنهان‌کردن بلوک‌های قدیمی صفحهٔ خانه (حذف نمی‌شوند) */
      ROOT + " > .hero," + ROOT + " > .head," + ROOT + " > .grid.auto," + ROOT + " > .grid.g3{display:none!important}" +

      /* ریشه */
      BOX + "{position:relative;display:flex;flex-direction:column;gap:16px;margin-top:6px;direction:inherit}" +
      BOX + " *{box-sizing:border-box}" +
      BOX + " .hpS{position:relative;border:1px solid rgba(140,160,255,.14);border-radius:20px;" +
        "background:rgba(255,255,255,.035);padding:16px 16px 15px;overflow:hidden}" +
      BOX + " .hpSH{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}" +
      BOX + " .hpSH h2{margin:0;font-size:14px;font-weight:900;letter-spacing:.2px;color:#eef1ff}" +
      BOX + " .hpSH .lnk{font-size:11px;opacity:.7;cursor:pointer;border:0;background:none;color:inherit;" +
        "font-family:inherit;padding:2px 6px;border-radius:8px}" +
      BOX + " .hpSH .lnk:hover{opacity:1;background:rgba(124,92,255,.16)}" +

      /* ── بَنر ── */
      ".hpBan{position:relative;overflow:hidden;border-radius:26px;isolation:isolate;" +
        "background:linear-gradient(155deg,#0b1130 0%,#0a0f26 48%,#070a1c 100%);" +
        "border:1px solid rgba(140,160,255,.16)}" +
      ".hpBan::before{content:\"\";position:absolute;inset:-40% -12% auto;height:160%;z-index:0;pointer-events:none;" +
        "background:radial-gradient(40% 46% at 20% 16%,rgba(124,92,255,.5),transparent 70%)," +
        "radial-gradient(34% 40% at 84% 24%,rgba(34,211,238,.34),transparent 72%)," +
        "radial-gradient(36% 44% at 64% 98%,rgba(255,79,216,.26),transparent 72%);" +
        "filter:blur(16px);animation:hpAur 18s ease-in-out infinite alternate}" +
      "@keyframes hpAur{0%{transform:translate3d(-2%,0,0) scale(1)}100%{transform:translate3d(3%,2%,0) scale(1.07)}}" +
      ".hpBan::after{content:\"\";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.45;" +
        "background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1px);background-size:44px 44px;" +
        "mask-image:radial-gradient(70% 70% at 62% 38%,#000 22%,transparent 78%);" +
        "-webkit-mask-image:radial-gradient(70% 70% at 62% 38%,#000 22%,transparent 78%)}" +
      ".hpIn{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,.88fr);" +
        "gap:24px;align-items:center;padding:32px 28px 26px}" +
      "@media (max-width:880px){.hpIn{grid-template-columns:1fr;gap:16px;padding:24px 18px 20px}" +
        ".hpArt{display:none!important}}" +

      /* متن بَنر — بدون هیچ موقعیت absolute روی متن */
      ".hpTop{display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".hpMark{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;font-size:16px;" +
        "color:#fff;background:linear-gradient(135deg,#7c5cff,#22d3ee);box-shadow:0 8px 22px rgba(124,92,255,.4)}" +
      ".hpNm{font-weight:900;font-size:13px;letter-spacing:1.4px;color:#eef1ff}" +
      ".hpPil{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:99px;font-size:10.5px;" +
        "color:#dbe3ff;background:rgba(124,92,255,.14);border:1px solid rgba(124,92,255,.34);white-space:nowrap}" +
      ".hpPil.ok{background:rgba(93,240,176,.12);border-color:rgba(93,240,176,.34);color:#b9ffe0}" +
      ".hpDot{width:6px;height:6px;border-radius:50%;background:#5df0b0;box-shadow:0 0 8px #5df0b0;" +
        "animation:hpPulse 2s infinite;flex:0 0 auto}" +
      "@keyframes hpPulse{50%{opacity:.35;transform:scale(.75)}}" +
      ".hpH1{margin:14px 0 0;font-size:clamp(26px,4.4vw,46px);line-height:1.42;font-weight:900;" +
        "letter-spacing:-.5px;color:#f5f7ff;text-shadow:0 12px 40px rgba(0,0,0,.45);overflow-wrap:anywhere}" +
      ".hpH1 .b{display:block}" +
      ".hpGrad{background:linear-gradient(100deg,#8f7bff,#22d3ee 55%,#ff6fd8);-webkit-background-clip:text;" +
        "background-clip:text;color:transparent}" +
      ".hpRotLine{display:flex;align-items:center;gap:8px;margin-top:12px;min-height:26px;" +
        "font-size:13px;font-weight:800;color:#cdd5ff}" +
      ".hpRotLead{opacity:.7;font-weight:600}" +
      ".hpRotTxt{display:inline-block;padding:3px 10px;border-radius:9px;color:#8ef2ff;" +
        "background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.3);" +
        "transition:opacity .28s,transform .28s;white-space:nowrap;overflow-wrap:anywhere}" +
      ".hpRotTxt.out{opacity:0;transform:translateY(6px)}" +
      ".hpLead{margin:12px 0 0;max-width:540px;font-size:13.5px;line-height:2.05;color:#c2c9ee}" +
      ".hpCta{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}" +
      ".hpGhost{border:1px solid rgba(140,160,255,.28)!important;background:rgba(255,255,255,.04)!important}" +
      ".hpStats{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}" +
      ".hpStat{display:inline-flex;align-items:baseline;gap:6px;padding:5px 10px;border-radius:11px;" +
        "background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.18);font-size:11px;color:#c9d0f5}" +
      ".hpStat b{font-size:13px;color:#fff}" +
      ".hpWho{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:11px;color:#aab3e0;flex-wrap:wrap}" +
      ".hpFaces{display:flex}" +
      ".hpFace{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9.5px;" +
        "font-weight:900;color:#0a0e22;background:linear-gradient(135deg,#9fe8ff,#c3b6ff);" +
        "border:2px solid #0a0f26;margin-inline-start:-7px}" +
      ".hpFace:first-child{margin-inline-start:0}" +

      /* هنر بَنر — جدا از متن، ستون خودش */
      ".hpArt{position:relative;height:300px;display:grid;place-items:center;min-width:0}" +
      ".hpRing{position:absolute;border-radius:50%;border:1px solid rgba(140,160,255,.26)}" +
      ".hpR1{width:250px;height:250px;border-style:dashed;border-color:rgba(124,92,255,.42);" +
        "animation:hpSpin 28s linear infinite}" +
      ".hpR2{width:188px;height:188px;border-color:rgba(34,211,238,.38);animation:hpSpin 19s linear infinite reverse}" +
      ".hpR3{width:126px;height:126px;border-color:rgba(255,111,216,.36);" +
        "box-shadow:inset 0 0 40px rgba(124,92,255,.32)}" +
      "@keyframes hpSpin{to{transform:rotate(360deg)}}" +
      "@keyframes hpSpinB{to{transform:rotate(-360deg)}}" +
      /* قمرهایی که روی مدار می‌چرخند (خلافِ چرخش مدار تا صاف بمانند) */
      ".hpMoon{position:absolute;top:-9px;left:calc(50% - 9px);width:18px;height:18px;border-radius:50%;" +
        "display:grid;place-items:center;font-size:9px;line-height:1;pointer-events:none;" +
        "background:rgba(8,12,28,.92);border:1px solid rgba(140,160,255,.45);" +
        "box-shadow:0 0 0 3px rgba(124,92,255,.1),0 6px 16px rgba(0,0,0,.5)}" +
      ".hpMoon.b{top:auto;bottom:-9px}" +
      ".hpR1 .hpMoon{animation:hpSpinB 28s linear infinite}" +
      ".hpR2 .hpMoon{animation:hpSpinB 19s linear infinite reverse}" +
      ".hpR3 .hpMoon{animation:hpFloat 5.5s ease-in-out infinite}" +
      ".hpOrb{position:relative;z-index:2;width:104px;height:104px;border-radius:32px;display:grid;place-items:center;" +
        "font-size:44px;font-weight:900;color:#fff;background:linear-gradient(140deg,#7c5cff,#22d3ee);overflow:hidden;" +
        "box-shadow:0 22px 60px rgba(124,92,255,.5);animation:hpFloat 7s ease-in-out infinite}" +
      ".hpOrb .k{position:relative;z-index:1;line-height:1}" +
      ".hpOrb img{position:absolute;inset:0;z-index:2;width:100%;height:100%;object-fit:cover;display:block}" +
      "@keyframes hpFloat{50%{transform:translateY(-9px) rotate(-3deg)}}" +
      ".hpTag{position:absolute;z-index:3;padding:4px 10px;border-radius:99px;font-size:10px;color:#eaf0ff;" +
        "background:rgba(10,14,32,.78);border:1px solid rgba(140,160,255,.3);" +
        "box-shadow:0 8px 22px rgba(0,0,0,.4);white-space:nowrap}" +
      ".hpTag.a{top:18px;inset-inline-start:2%}" +
      ".hpTag.b{bottom:26px;inset-inline-end:0}" +

      /* تیکر */
      ".hpTick{position:relative;z-index:2;border-top:1px solid rgba(140,160,255,.14);padding:8px 16px;" +
        "font-size:10.5px;letter-spacing:.4px;color:#a6afe0;overflow:hidden;background:rgba(6,9,22,.45);" +
        "display:flex;align-items:center;gap:10px;white-space:nowrap}" +
      ".hpTick i{flex:0 0 auto;font-style:normal;font-size:9px;font-weight:900;letter-spacing:1px;" +
        "color:#8ef2ff;border:1px solid rgba(34,211,238,.35);border-radius:99px;padding:2px 7px}" +
      ".hpTick .run{display:inline-block;animation:hpRun 24s linear infinite}" +
      "@keyframes hpRun{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +

      /* ── کاوش سریع ── */
      ".hpDock{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}" +
      "@media (max-width:1000px){.hpDock{grid-template-columns:repeat(3,minmax(0,1fr))}}" +
      "@media (max-width:560px){.hpDock{grid-template-columns:repeat(2,minmax(0,1fr))}}" +
      ".hpD{position:relative;display:flex;flex-direction:column;gap:6px;padding:12px 12px 11px;border-radius:15px;" +
        "cursor:pointer;border:1px solid rgba(140,160,255,.16);background:rgba(255,255,255,.045);" +
        "transition:transform .18s,border-color .18s,background .18s,box-shadow .18s;min-width:0;text-align:start}" +
      ".hpD:hover,.hpD:focus-visible{transform:translateY(-3px);border-color:rgba(124,92,255,.58);" +
        "background:rgba(124,92,255,.12);box-shadow:0 14px 32px rgba(0,0,0,.32);outline:none}" +
      ".hpD .ic{font-size:19px;line-height:1}" +
      ".hpD .tt{font-size:12.5px;font-weight:800;color:#eef1ff;overflow-wrap:anywhere}" +
      ".hpD .ds{font-size:10px;color:#9aa4d2;line-height:1.7;overflow-wrap:anywhere}" +
      ".hpD .bd{position:absolute;top:9px;inset-inline-end:9px;font-size:9.5px;font-weight:800;padding:1px 6px;" +
        "border-radius:99px;color:#cfe3ff;background:rgba(34,211,238,.14);border:1px solid rgba(34,211,238,.3)}" +

      /* ── اسلایدر ── */
      ".hpSpot{position:relative;min-height:132px}" +
      ".hpSlide{display:flex;gap:14px;align-items:center;min-width:0}" +
      ".hpThumb{flex:0 0 108px;height:96px;border-radius:14px;display:grid;place-items:center;font-size:34px;" +
        "overflow:hidden;background:linear-gradient(140deg,rgba(124,92,255,.34),rgba(34,211,238,.22));" +
        "border:1px solid rgba(140,160,255,.24)}" +
      ".hpThumb img{width:100%;height:100%;object-fit:cover;display:block}" +
      ".hpSlB{min-width:0;flex:1 1 auto}" +
      ".hpKick{font-size:10px;font-weight:900;letter-spacing:.6px;color:#8ef2ff;margin-bottom:4px}" +
      ".hpSlT{font-size:15px;font-weight:900;color:#f2f5ff;line-height:1.6;overflow-wrap:anywhere;" +
        "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".hpSlD{font-size:11px;color:#a9b2dd;line-height:1.9;margin-top:5px;overflow-wrap:anywhere;" +
        "display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".hpChips{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}" +
      ".hpChip{font-size:9.5px;padding:2px 8px;border-radius:99px;color:#cfd7ff;" +
        "background:rgba(255,255,255,.06);border:1px solid rgba(140,160,255,.2);white-space:nowrap}" +
      ".hpNav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}" +
      ".hpDots{display:flex;gap:5px}" +
      ".hpDotB{width:7px;height:7px;border-radius:99px;border:0;padding:0;cursor:pointer;" +
        "background:rgba(140,160,255,.32);transition:.2s}" +
      ".hpDotB.on{width:20px;background:linear-gradient(90deg,#7c5cff,#22d3ee)}" +
      ".hpArrows{display:flex;gap:6px}" +
      ".hpArr{width:26px;height:26px;border-radius:9px;cursor:pointer;font-size:12px;color:#dbe3ff;" +
        "background:rgba(255,255,255,.05);border:1px solid rgba(140,160,255,.22)}" +
      ".hpArr:hover{background:rgba(124,92,255,.18);border-color:rgba(124,92,255,.5)}" +

      /* ── لیست‌ها ── */
      ".hp2{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:12px}" +
      "@media (max-width:820px){.hp2{grid-template-columns:1fr}}" +
      ".hp3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}" +
      "@media (max-width:900px){.hp3{grid-template-columns:1fr 1fr}}" +
      "@media (max-width:620px){.hp3{grid-template-columns:1fr}}" +
      ".hpRow{display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;cursor:pointer;" +
        "border:1px solid transparent;transition:.16s;min-width:0}" +
      ".hpRow:hover{background:rgba(124,92,255,.1);border-color:rgba(124,92,255,.3)}" +
      ".hpAv{flex:0 0 auto;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;" +
        "font-size:11px;font-weight:900;color:#0a0e22;background:linear-gradient(135deg,#9fe8ff,#c3b6ff)}" +
      ".hpAv.two{background:linear-gradient(135deg,#ffd79f,#ff9ee8)}" +
      ".hpAv.thr{background:linear-gradient(135deg,#a8ffd9,#8ef2ff)}" +
      ".hpM{min-width:0;flex:1 1 auto}" +
      ".hpMT{font-size:11.5px;font-weight:800;color:#e9edff;white-space:nowrap;overflow:hidden;" +
        "text-overflow:ellipsis}" +
      ".hpMS{font-size:10.5px;color:#98a2cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".hpX{flex:0 0 auto;font-size:9.5px;color:#8d97c4;white-space:nowrap}" +
      ".hpEmpty{font-size:11px;color:#8d97c4;padding:14px 8px;text-align:center;border:1px dashed " +
        "rgba(140,160,255,.22);border-radius:12px}" +

      /* اعضا */
      ".hpRank{flex:0 0 auto;width:18px;text-align:center;font-size:10px;font-weight:900;color:#8ef2ff}" +
      ".hpXp{font-size:9px;padding:1px 6px;border-radius:99px;background:rgba(124,92,255,.16);" +
        "border:1px solid rgba(124,92,255,.3);color:#d9d4ff}" +

      /* شروع سریع */
      ".hpStep{display:flex;gap:9px;align-items:flex-start;padding:8px 4px}" +
      ".hpNum{flex:0 0 auto;width:22px;height:22px;border-radius:8px;display:grid;place-items:center;" +
        "font-size:11px;font-weight:900;color:#fff;background:linear-gradient(135deg,#7c5cff,#22d3ee)}" +

      /* ── کارت پرمیوم ── */
      ".hpCom{position:relative;overflow:hidden;border-radius:22px;padding:20px 20px 18px;" +
        "border:1px solid rgba(255,111,216,.28);" +
        "background:linear-gradient(120deg,rgba(124,92,255,.24),rgba(34,211,238,.14) 55%,rgba(255,79,216,.2))}" +
      ".hpCom::before{content:\"\";position:absolute;width:210px;height:210px;border-radius:50%;" +
        "inset-inline-end:-60px;top:-90px;background:radial-gradient(circle,rgba(255,111,216,.5),transparent 68%);" +
        "filter:blur(6px);pointer-events:none}" +
      ".hpComIn{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;" +
        "gap:16px;flex-wrap:wrap}" +
      ".hpComT{font-size:17px;font-weight:900;color:#fff;margin:0 0 6px;line-height:1.5}" +
      ".hpComD{font-size:11.5px;color:#e3e0ff;line-height:1.9;max-width:520px;margin:0}" +
      ".hpComF{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}" +
      ".hpComF span{font-size:10px;padding:3px 9px;border-radius:99px;color:#fff;" +
        "background:rgba(10,14,32,.4);border:1px solid rgba(255,255,255,.24)}" +

      /* کم‌مصرف */
      "html.lite " + BOX + " *,html.lite " + BOX + " *::before,html.lite " + BOX + " *::after{animation:none!important}" +
      "@media (prefers-reduced-motion:reduce){" + BOX + " *," + BOX + " *::before," + BOX + " *::after{" +
        "animation:none!important;transition:none!important}}";
    document.head.appendChild(s);
  }

  /* ── ۳. آمار و داده ─────────────────────────────────────── */
  function st() {
    var U = R.USERS || {}, online = R.ONLINE || {};
    var prem = 0;
    Object.keys(U).forEach(function (k) { if (U[k] && U[k].prem) prem++; });
    return {
      online: cnt(online), users: cnt(U), posts: cnt(R.POSTS),
      anime: cnt(R.ANIME), news: cnt(R.NEWS), items: cnt(R.PRODUCTS),
      chat: cnt(R.CHAT), prem: prem
    };
  }

  function statsHTML() {
    var s = st();
    function box(v, k) { return '<span class="hpStat"><b data-hp="' + k + '">' + num(v) + "</b>" + esc(t("s" + k[0].toUpperCase() + k.slice(1))) + "</span>"; }
    return '<div class="hpStats">' + box(s.online, "online") + box(s.users, "users") +
      box(s.posts, "posts") + box(s.items, "items") + "</div>";
  }

  /* ── ۴. قطعه‌های صفحه ───────────────────────────────────── */
  /* تصویر سیاره: اول از تنظیمات سایت، بعد از ORB_IMG بالا */
  var orbCache = null, orbAsked = false;
  function orbSrc() {
    if (orbCache != null) return String(orbCache || "").trim();
    var s = R.SITE || {};
    var v = s.orbImg || s.orb || s.heroImg || ORB_IMG || "";
    return String(v || "").trim();
  }
  /* یک‌بار خواندن عکس از دیتابیس (settings/site/orbImg) */
  function loadOrb() {
    if (orbAsked) return;
    orbAsked = true;
    if (!R.db || !R.db.ref) return;
    try {
      R.db.ref("settings/site/orbImg").once("value").then(function (sn) {
        var v = sn && sn.val ? String(sn.val() || "") : "";
        if (v === (orbCache || "")) return;
        orbCache = v;
        try { render(); } catch (e) {}
      }, function () {});
    } catch (e) {}
  }
  function orbHTML() {
    var src = orbSrc();
    return '<span class="k">忍</span>' +
      (src ? '<img src="' + esc(src) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : "");
  }

  function banner() {
    var on = list(R.ONLINE || {});
    var faces = on.slice(0, 4).map(function (u) { return '<span class="hpFace">' + esc(ini(u.n || u.name)) + "</span>"; }).join("");
    return '<div class="hpBan"><div class="hpIn">' +
        '<div class="hpCopy">' +
          '<div class="hpTop">' +
            '<span class="hpMark">忍</span><span class="hpNm">RONIN STORE</span>' +
            '<span class="hpPil">' + esc(t("eye")) + '</span>' +
            '<span class="hpPil ok"><span class="hpDot"></span>' + esc(t("live")) +
              ' · <b data-hp="online2">' + num(cnt(R.ONLINE)) + "</b></span>" +
          "</div>" +
          '<h1 class="hpH1"><span class="b">' + esc(t("h1a")) + "</span>" +
            '<span class="b hpGrad">' + esc(t("h1b")) + "</span></h1>" +
          '<div class="hpRotLine"><span class="hpRotLead">' + esc(t("rotLead")) + "</span>" +
            '<span class="hpRotTxt" id="hpRot">' + esc(t("rot1")) + "</span></div>" +
          '<p class="hpLead">' + esc(t("lead")) + "</p>" +
          '<div class="hpCta">' +
            '<button class="btn p" type="button" data-hp-go="community">🚀 ' + esc(t("cta1")) + "</button>" +
            '<button class="btn" type="button" data-hp-go="discover">🧭 ' + esc(t("cta2")) + "</button>" +
            '<button class="btn hpGhost" type="button" data-hp-go="market">🛒 ' + esc(t("cta3")) + "</button>" +
          "</div>" +
          statsHTML() +
          '<div class="hpWho"><span class="hpFaces">' + faces + "</span>" +
            "<span>" + num(cnt(R.ONLINE)) + " " + esc(t("onlineNow")) + "</span></div>" +
        "</div>" +
        '<div class="hpArt" aria-hidden="true">' +
          '<div class="hpRing hpR1"><i class="hpMoon">📣</i><i class="hpMoon b">💬</i></div>' +
          '<div class="hpRing hpR2"><i class="hpMoon">🏆</i></div>' +
          '<div class="hpRing hpR3"><i class="hpMoon">💎</i></div>' +
          '<div class="hpOrb">' + orbHTML() + "</div>" +
          '<span class="hpTag a">' + esc(t("explore")) + "</span>" +
          '<span class="hpTag b">' + esc(t("live")) + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="hpTick"><i>RONIN</i><div style="overflow:hidden;flex:1 1 auto"><span class="run">' +
        esc(t("ticker")) + " &nbsp;·&nbsp; " + esc(t("ticker")) +
      "</span></div></div></div>";
  }

  function dock() {
    var s = st();
    function d(go, ic, tt, ds, badge) {
      return '<div class="hpD" role="button" tabindex="0" data-hp-go="' + go + '">' +
        '<span class="ic">' + ic + "</span>" +
        '<span class="tt">' + esc(tt) + "</span>" +
        '<span class="ds">' + esc(ds) + "</span>" +
        (badge ? '<span class="bd">' + num(badge) + "</span>" : "") + "</div>";
    }
    return '<section class="hpS"><div class="hpSH"><h2>🧭 ' + esc(t("dock")) + "</h2></div>" +
      '<div class="hpDock">' +
        d("community", "👥", t("community"), t("dComm"), s.posts) +
        d("chat", "💬", t("chat"), t("dChat"), s.chat) +
        d("market", "🛒", t("market"), t("dMarket"), s.items) +
        d("bulletin", "📣", t("bulletin"), t("dBul"), 0) +
        d("rank", "🏆", t("rank"), t("dRank"), s.users) +
        d("premium", "💎", t("premium"), t("dPrem"), 0) +
      "</div></section>";
  }

  /* پیشنهاد ویژه: بدون انیمه — کالای فروشگاه، خبر تازه و دنیای پرمیوم */
  function slides() {
    var out = [];
    list(R.PRODUCTS).slice(0, 2).forEach(function (p) {
      out.push({
        kind: "market", id: p.id, kick: t("pickMarket"), title: p.name || "—",
        desc: p.desc || t("dMarket"), icon: "🛒", img: p.img || "",
        chips: [p.price ? num(p.price) + " " + (p.cur || "") : "", p.cat, day(p.t)].filter(Boolean),
        cta: t("open")
      });
    });
    list(R.NEWS).slice(0, 2).forEach(function (n) {
      out.push({
        kind: "news", id: n.id, kick: t("pickNews"), title: n.title || "—",
        desc: n.body || "", icon: n.icon || "📰", img: n.img || "",
        chips: [n.cat, day(n.t)].filter(Boolean), cta: t("read")
      });
    });
    if (!out.length) out.push({
      kind: "market", id: "", kick: t("pickMarket"), title: t("noItems"),
      desc: t("dMarket"), icon: "🛒", img: "", chips: [], cta: t("cta3")
    });
    /* عضو برتر */
    var top = list(R.USERS).sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); })[0];
    if (top && (top.name || top.n)) out.push({
      kind: "community", id: top.id || "", kick: t("pickUser"),
      title: top.name || top.n, desc: t("top"), icon: "🏅", img: "",
      chips: [(top.xp ? "XP " + num(top.xp) : ""), top.prem ? t("premium") : ""].filter(Boolean),
      cta: t("open")
    });
    /* آخرین پیام چت */
    var msg = list(R.CHAT).sort(function (a, b) { return (b.t || 0) - (a.t || 0); })[0];
    if (msg && msg.text) out.push({
      kind: "chat", id: msg.id || "", kick: t("pickChat"),
      title: msg.n || msg.name || t("guest"), desc: msg.text, icon: "💬", img: "",
      chips: [ago(msg.t)].filter(Boolean), cta: t("open")
    });
    out.push({
      kind: "premium", id: "", kick: t("pickPrem"), title: t("premTitle"),
      desc: t("premDesc"), icon: "💎", img: "",
      chips: [t("f1"), t("f2"), t("f3"), t("f4")], cta: t("premCta")
    });
    return out;
  }

  function slideHTML(sl) {
    var thumb = sl.img
      ? '<img src="' + esc(sl.img) + '" alt="' + esc(sl.title) + '" onerror="this.remove()">'
      : esc(sl.icon);
    return '<div class="hpSlide">' +
      '<div class="hpThumb">' + thumb + "</div>" +
      '<div class="hpSlB"><div class="hpKick">' + esc(sl.kick) + "</div>" +
        '<div class="hpSlT">' + esc(sl.title) + "</div>" +
        (sl.desc ? '<div class="hpSlD">' + esc(clean(sl.desc, 160)) + "</div>" : "") +
        '<div class="hpChips">' + sl.chips.map(function (c) { return '<span class="hpChip">' + esc(c) + "</span>"; }).join("") +
        "</div></div>" +
      '<button class="btn p mini" type="button" data-hp-open="' + sl.kind + '" data-id="' + esc(sl.id) + '">' +
        esc(sl.cta) + "</button></div>";
  }

  function spotHTML() {
    var arr = slides();
    if (spotI >= arr.length) spotI = 0;
    var dots = arr.map(function (_, i) {
      return '<button class="hpDotB' + (i === spotI ? " on" : "") + '" type="button" data-hp-dot="' + i +
        '" aria-label="' + (i + 1) + '"></button>';
    }).join("");
    return '<section class="hpS"><div class="hpSH"><h2>✨ ' + esc(t("spot")) + "</h2>" +
        '<div class="hpArrows"><button class="hpArr" type="button" data-hp-prev="1">‹</button>' +
        '<button class="hpArr" type="button" data-hp-next="1">›</button></div></div>' +
      '<div class="hpSpot" id="hpSpot">' + slideHTML(arr[spotI]) + "</div>" +
      '<div class="hpNav"><div class="hpDots">' + dots + "</div>" +
        '<span class="hpChip">' + num(spotI + 1) + " / " + num(arr.length) + "</span></div></section>";
  }

  function postsHTML() {
    var arr = list(R.POSTS).filter(function (p) { return p.status !== "pending"; });
    if (!arr.length) return '<div class="hpEmpty">' + esc(t("noPosts")) + "</div>";
    return arr.slice(0, 4).map(function (p) {
      var u = (R.USERS || {})[p.uid] || {};
      var lk = p.lk ? Object.keys(p.lk).length : 0;
      var nm = u.name || p.n || t("guest");
      return '<div class="hpRow" role="button" tabindex="0" data-hp-go="community">' +
        '<span class="hpAv">' + esc(ini(nm)) + "</span>" +
        '<span class="hpM"><span class="hpMT">' + esc(nm) + "</span>" +
          '<span class="hpMS">' + esc(clean(p.text || "", 70)) + "</span></span>" +
        '<span class="hpX">❤ ' + num(lk) + " · " + esc(ago(p.t)) + "</span></div>";
    }).join("");
  }

  function marketHTML() {
    var arr = list(R.PRODUCTS);
    if (!arr.length) return '<div class="hpEmpty">' + esc(t("noItems")) + "</div>";
    return arr.slice(0, 4).map(function (p) {
      var u = (R.USERS || {})[p.by] || {};
      return '<div class="hpRow" role="button" tabindex="0" data-hp-go="market">' +
        '<span class="hpAv two">' + esc((p.icon || "🛒")) + "</span>" +
        '<span class="hpM"><span class="hpMT">' + esc(p.name || "—") + "</span>" +
          '<span class="hpMS">' + esc(u.name || t("market")) + " · " + esc(ago(p.t)) + "</span></span>" +
        '<span class="hpX">' + esc(num(p.price || 0)) + " " + esc(p.cur || "") + "</span></div>";
    }).join("");
  }

  function topHTML() {
    var arr = list(R.USERS, function (a, b) { return (b.xp || 0) - (a.xp || 0); }).slice(0, 5);
    if (!arr.length) return '<div class="hpEmpty">' + esc(t("noUsers")) + "</div>";
    var medal = ["🥇", "🥈", "🥉", "۴", "۵"];
    return arr.map(function (u, i) {
      return '<div class="hpRow" role="button" tabindex="0" data-hp-go="profile">' +
        '<span class="hpRank">' + medal[i] + "</span>" +
        '<span class="hpAv' + (i === 1 ? " two" : i === 2 ? " thr" : "") + '">' + esc(ini(u.name)) + "</span>" +
        '<span class="hpM"><span class="hpMT">' + esc(u.name || t("guest")) + "</span>" +
          '<span class="hpMS">' + (u.prem ? "💎 " + esc(t("prem")) : esc(ago(u.t))) + "</span></span>" +
        '<span class="hpXp">' + num(u.xp || 0) + " XP</span></div>";
    }).join("");
  }

  function chatHTML() {
    var arr = list(R.CHAT, function (a, b) { return (a.t || 0) - (b.t || 0); }).slice(-4).reverse();
    if (!arr.length) return '<div class="hpEmpty">' + esc(t("noChat")) + "</div>";
    return arr.map(function (m) {
      return '<div class="hpRow" role="button" tabindex="0" data-hp-go="chat">' +
        '<span class="hpAv thr">' + esc(ini(m.n)) + "</span>" +
        '<span class="hpM"><span class="hpMT">' + esc(m.n || t("guest")) + "</span>" +
          '<span class="hpMS">' + esc(clean(m.text || "", 60)) + "</span></span>" +
        '<span class="hpX">' + esc(ago(m.t)) + "</span></div>";
    }).join("");
  }

  function stepsHTML() {
    var steps = [["st1", "st1d", "community"], ["st2", "st2d", "community"], ["st3", "st3d", "market"]];
    return steps.map(function (s, i) {
      return '<div class="hpStep" role="button" tabindex="0" data-hp-go="' + s[2] + '">' +
        '<span class="hpNum">' + num(i + 1) + "</span>" +
        '<span class="hpM"><span class="hpMT">' + esc(t(s[0])) + "</span>" +
          '<span class="hpMS">' + esc(t(s[1])) + "</span></span></div>";
    }).join("");
  }

  function promoHTML() {
    return '<section class="hpCom"><div class="hpComIn">' +
      "<div><h3 class=\"hpComT\">💎 " + esc(t("premTitle")) + "</h3>" +
        '<p class="hpComD">' + esc(t("premDesc")) + "</p>" +
        '<div class="hpComF">' + [t("f1"), t("f2"), t("f3"), t("f4")].map(function (f) {
          return "<span>" + esc(f) + "</span>";
        }).join("") + "</div></div>" +
      '<button class="btn p" type="button" data-hp-go="' + (R.ME ? "premium" : "auth") + '">💎 ' +
        esc(t("premCta")) + "</button>" +
      "</div></section>";
  }

  function inner() {
    return banner() + dock() + spotHTML() +
      '<div class="hp2">' +
        '<section class="hpS"><div class="hpSH"><h2>📝 ' + esc(t("posts")) + "</h2>" +
          '<button class="lnk" type="button" data-hp-go="community">' + esc(t("viewAll")) + " ›</button></div>" +
          postsHTML() + "</section>" +
        '<section class="hpS"><div class="hpSH"><h2>🛒 ' + esc(t("newItems")) + "</h2>" +
          '<button class="lnk" type="button" data-hp-go="market">' + esc(t("viewAll")) + " ›</button></div>" +
          marketHTML() + "</section>" +
      "</div>" +
      '<div class="hp3">' +
        '<section class="hpS"><div class="hpSH"><h2>🏆 ' + esc(t("top")) + "</h2></div>" + topHTML() + "</section>" +
        '<section class="hpS"><div class="hpSH"><h2>💬 ' + esc(t("chatBuzz")) + "</h2>" +
          '<button class="lnk" type="button" data-hp-go="chat">' + esc(t("viewAll")) + " ›</button></div>" +
          chatHTML() + "</section>" +
        '<section class="hpS"><div class="hpSH"><h2>⚡ ' + esc(t("start")) + "</h2></div>" + stepsHTML() + "</section>" +
      "</div>" +
      promoHTML();
  }

  /* ── ۵. رندر ─────────────────────────────────────────────── */
  function host() { return document.querySelector(ROOT); }
  function box() { return document.querySelector(BOX); }

  function render() {
    var h = host();
    if (!h) return false;
    css();
    var b = box();
    if (b) { b.innerHTML = inner(); }
    else {
      b = document.createElement("div");
      b.id = "hpRoot";
      b.setAttribute("data-noi18n", "");
      h.appendChild(b);
      b.innerHTML = inner();
    }
    lastLang = langq();
    startRot();
    startSpot();
    return true;
  }

  function sync() {
    var b = box();
    if (!b) { render(); return; }
    if (langq() !== lastLang) { render(); return; }
    var s = st();
    b.querySelectorAll("[data-hp]").forEach(function (n) {
      var k = n.getAttribute("data-hp");
      var v = k === "online2" ? s.online : s[k];
      if (v == null) return;
      var txt = num(v);
      if (n.textContent !== txt) n.textContent = txt;
    });
  }

  /* ── ۶. چرخان‌ها ─────────────────────────────────────────── */
  var ROTS = ["rot1", "rot2", "rot3", "rot4", "rot5"];
  function startRot() {
    if (rotTimer) return;
    rotTimer = setInterval(function () {
      var n = el("hpRot");
      if (!n) return;
      rotI = (rotI + 1) % ROTS.length;
      n.classList.add("out");
      setTimeout(function () {
        var m = el("hpRot");
        if (!m) return;
        m.textContent = t(ROTS[rotI]);
        m.classList.remove("out");
      }, 260);
    }, 2800);
  }

  function startSpot() {
    if (spotTimer) return;
    spotTimer = setInterval(function () {
      var s = el("hpSpot");
      if (!s) return;
      paintSpot(spotI + 1);
    }, 7000);
  }

  function paintSpot(i) {
    var s = el("hpSpot");
    if (!s) return;
    var arr = slides();
    spotI = ((i % arr.length) + arr.length) % arr.length;
    s.innerHTML = slideHTML(arr[spotI]);
    document.querySelectorAll(BOX + " .hpDotB").forEach(function (d, k) {
      d.classList.toggle("on", k === spotI);
    });
    var c = document.querySelector(BOX + " .hpNav .hpChip");
    if (c) c.textContent = num(spotI + 1) + " / " + num(arr.length);
  }

  /* ── ۷. رفتارها ──────────────────────────────────────────── */
  function goTo(name) {
    if (!name) return;
    if (name === "auth") {
      var b = document.querySelector("[data-authopen]");
      if (b) { b.click(); return; }
      return toast(t("login"), "info");
    }
    if (R.go) R.go(name);
    else toast(name, "info");
  }

  function openSlide(kind, id) {
    if (kind === "news" && id && R.openNews) return R.openNews(id);
    if (kind === "premium") return goTo(R.ME ? "premium" : "auth");
    return goTo(kind);
  }

  document.addEventListener("click", function (e) {
    var x = e.target;
    if (!x || !x.closest || !x.closest(BOX)) return;
    var o = x.closest("[data-hp-open]");
    if (o) {
      e.preventDefault();
      return openSlide(o.getAttribute("data-hp-open"), o.getAttribute("data-id"));
    }
    var d = x.closest("[data-hp-dot]");
    if (d) { e.preventDefault(); return paintSpot(parseInt(d.getAttribute("data-hp-dot"), 10) || 0); }
    if (x.closest("[data-hp-prev]")) { e.preventDefault(); return paintSpot(spotI - 1); }
    if (x.closest("[data-hp-next]")) { e.preventDefault(); return paintSpot(spotI + 1); }
    var g = x.closest("[data-hp-go]");
    if (g) { e.preventDefault(); return goTo(g.getAttribute("data-hp-go")); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var x = e.target;
    if (!x || !x.getAttribute || !x.closest(BOX)) return;
    if (x.getAttribute("role") !== "button") return;
    e.preventDefault();
    var g = x.getAttribute("data-hp-go");
    if (g) return goTo(g);
    var o = x.getAttribute("data-hp-open");
    if (o) return openSlide(o, x.getAttribute("data-id"));
  });

  /* ── ۸. هم‌گام با زبان و داده ───────────────────────────── */
  function hookI18n() {
    if (!R.i18n || !R.i18n.set || R.i18n.set.__hp) return;
    var orig = R.i18n.set;
    var wrapped = function () {
      var out = orig.apply(R.i18n, arguments);
      try { render(); } catch (e) {}
      return out;
    };
    wrapped.__hp = true;
    R.i18n.set = wrapped;
  }

  function boot() {
    render();
    hookI18n();
    loadOrb();
    if (!ticker) {
      ticker = setInterval(function () { try { sync(); } catch (e) {} }, 2000);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  [700, 1600, 3000, 5200].forEach(function (ms) { setTimeout(boot, ms); });

  var in0 = R.onLogin;
  R.onLogin = function () {
    if (in0) { try { in0(); } catch (e) {} }
    setTimeout(function () { try { render(); } catch (e) {} }, 600);
  };

  /* API برای تست */
  R.heroPlus = {
    render: render, sync: sync, inner: inner, t: t, slides: slides,
    paintSpot: paintSpot, goTo: goTo, stats: st,
    setOrb: function (v) { orbCache = String(v || ""); try { render(); } catch (e) {} },
    state: function () { return { spot: spotI, rot: rotI, lang: lastLang }; }
  };
})();
