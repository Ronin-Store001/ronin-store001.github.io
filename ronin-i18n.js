/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — I18N · ronin-i18n.js
   سه‌زبانه: فارسی (fa) · English (en) · Türkçe (tr)
   • دیکشنری فارسی→en/tr + جایگزینی متن در DOM
   • محتوای کاربر (پست/چت/اسم) هرگز ترجمه نمی‌شود
   • دکمه‌ی 🌐 روی هدر برای سوییچ زبان
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  var LS = "ronin_lang";
  var LANGS = ["fa", "en", "tr"];
  var NAMES = { fa: "فارسی", en: "English", tr: "Türkçe" };
  var DIR   = { fa: "rtl", en: "ltr", tr: "ltr" };

  /* ── دیکشنری ─────────────────────────────────────────── */
  var D = {
    /* ناوبری و منو */
    "خانه": { en: "Home", tr: "Ana Sayfa" },
    "انیمه": { en: "Anime", tr: "Anime" },
    "اخبار": { en: "News", tr: "Haberler" },
    "اخبار انیمه": { en: "Anime News", tr: "Anime Haberleri" },
    "انجمن": { en: "Community", tr: "Topluluk" },
    "فروشگاه": { en: "Store", tr: "Mağaza" },
    "پرمیوم": { en: "Premium", tr: "Premium" },
    "چت": { en: "Chat", tr: "Sohbet" },
    "چت عمومی": { en: "Public Chat", tr: "Genel Sohbet" },
    "گروه‌های چت": { en: "Chat Groups", tr: "Sohbet Grupları" },
    "رتبه‌بندی": { en: "Rankings", tr: "Sıralama" },
    "رویدادها": { en: "Events", tr: "Etkinlikler" },
    "تبلیغات": { en: "Ads", tr: "Reklamlar" },
    "تبلیغات و آگهی": { en: "Ads & Listings", tr: "Reklam ve İlan" },
    "کاوش": { en: "Explore", tr: "Keşfet" },
    "کشف تازه‌ها": { en: "Discover", tr: "Keşfet" },
    "اطلاعیه‌ها": { en: "Announcements", tr: "Duyurular" },
    "اطلاعیه و تریلر": { en: "Announcements & Trailers", tr: "Duyurular ve Fragmanlar" },
    "پروفایل": { en: "Profile", tr: "Profil" },
    "تنظیمات": { en: "Settings", tr: "Ayarlar" },
    "شبکه فرماندهی": { en: "Command Network", tr: "Komuta Ağı" },
    "پنل مالک": { en: "Owner Panel", tr: "Yönetici Paneli" },
    "ورود": { en: "Log in", tr: "Giriş" },
    "ثبت‌نام": { en: "Sign up", tr: "Kayıt Ol" },
    "ورود / ثبت‌نام": { en: "Log in / Sign up", tr: "Giriş / Kayıt Ol" },
    "خروج": { en: "Log out", tr: "Çıkış" },
    "ناوبری": { en: "Navigation", tr: "Gezinme" },
    "تیم": { en: "Team", tr: "Ekip" },
    "حساب": { en: "Account", tr: "Hesap" },
    "حساب من": { en: "My Account", tr: "Hesabım" },
    "مهمان": { en: "Guest", tr: "Misafir" },
    "کاربر": { en: "User", tr: "Kullanıcı" },
    "دنیای انیمه": { en: "Anime World", tr: "Anime Dünyası" },
    "جامعه رونین": { en: "Ronin Community", tr: "Ronin Topluluğu" },
    "بازار رونین": { en: "Ronin Market", tr: "Ronin Pazarı" },
    "مدیریت تیم": { en: "Team Management", tr: "Ekip Yönetimi" },
    "دنیای من": { en: "My World", tr: "Dünyam" },
    "آرشیو": { en: "Archive", tr: "Arşiv" },
    "پیشرفت": { en: "Progress", tr: "İlerleme" },
    "صندوق": { en: "Inbox", tr: "Gelen Kutusu" },
    "قابلیت‌های ویژه": { en: "Premium Features", tr: "Özel Özellikler" },
    "زبان": { en: "Language", tr: "Dil" },

    /* خانه / هیرو */
    "به دنیای Ronin Store خوش آمدی": { en: "Welcome to the Ronin Store universe", tr: "Ronin Store evrenine hoş geldin" },
    "انیمه، اخبار، جامعه، فروشگاه و دنیایی که خودت می‌سازی.": { en: "Anime, news, community, store — a world you build yourself.", tr: "Anime, haber, topluluk, mağaza ve kendi kurduğun bir dünya." },
    "شروع ماجراجویی": { en: "Start your journey", tr: "Yolculuğa başla" },
    "مشاهده انیمه‌ها": { en: "Browse anime", tr: "Animeleri gör" },
    "دسترسی سریع": { en: "Quick access", tr: "Hızlı erişim" },
    "شروع کن": { en: "Get started", tr: "Başla" },
    "بیشتر بدان": { en: "Learn more", tr: "Daha fazla" },
    "رونین استور چیست؟": { en: "What is Ronin Store?", tr: "Ronin Store nedir?" },
    "کشف و پیگیری انیمه‌ها": { en: "Discover and track anime", tr: "Animeleri keşfet ve takip et" },
    "آخرین خبرهای دنیای انیمه": { en: "Latest anime news", tr: "En son anime haberleri" },
    "آگهی محصولات و فروشندگان": { en: "Product & seller listings", tr: "Ürün ve satıcı ilanları" },
    "پست، لایک، کامنت، فالو": { en: "Posts, likes, comments, follows", tr: "Gönderi, beğeni, yorum, takip" },
    "گفتگوی زنده با کاربران": { en: "Live chat with users", tr: "Kullanıcılarla canlı sohbet" },
    "قابلیت‌های ویژه رونین": { en: "Exclusive Ronin features", tr: "Ronin'e özel özellikler" },
    "آنلاین": { en: "online", tr: "çevrimiçi" },

    /* بخش‌ها */
    "شبکه انیمه": { en: "Anime Network", tr: "Anime Ağı" },
    "خبرنامه رونین": { en: "Ronin News", tr: "Ronin Haberleri" },
    "انجمن رونین": { en: "Ronin Community", tr: "Ronin Topluluğu" },
    "مرکز فرماندهی رونین": { en: "Ronin Command Center", tr: "Ronin Komuta Merkezi" },
    "فروشگاه رونین": { en: "Ronin Market", tr: "Ronin Mağazası" },
    "رتبه‌بندی رونین": { en: "Ronin Rankings", tr: "Ronin Sıralaması" },

    /* ورود / ثبت‌نام */
    "ورود به رونین": { en: "Log in to Ronin", tr: "Ronin'e giriş" },
    "ایمیل": { en: "Email", tr: "E-posta" },
    "رمز عبور": { en: "Password", tr: "Şifre" },
    "نام نمایشی": { en: "Display name", tr: "Görünen ad" },
    "تکرار رمز عبور": { en: "Confirm password", tr: "Şifre tekrarı" },
    "رمزت را فراموش کردی؟": { en: "Forgot your password?", tr: "Şifreni mi unuttun?" },

    /* دکمه‌های عمومی */
    "ارسال": { en: "Send", tr: "Gönder" },
    "ذخیره": { en: "Save", tr: "Kaydet" },
    "ذخیره شد": { en: "Saved", tr: "Kaydedildi" },
    "حذف": { en: "Delete", tr: "Sil" },
    "ویرایش": { en: "Edit", tr: "Düzenle" },
    "تایید": { en: "Approve", tr: "Onayla" },
    "رد": { en: "Reject", tr: "Reddet" },
    "بستن": { en: "Close", tr: "Kapat" },
    "لغو": { en: "Cancel", tr: "İptal" },
    "جستجو": { en: "Search", tr: "Ara" },
    "اعلان‌ها": { en: "Notifications", tr: "Bildirimler" },
    "پیام‌ها": { en: "Messages", tr: "Mesajlar" },
    "همه خوانده شد": { en: "Mark all as read", tr: "Tümünü okundu say" },
    "در حال بارگذاری…": { en: "Loading…", tr: "Yükleniyor…" },

    /* انجمن */
    "چه خبر؟ از انیمه‌ای بگو، نظرسنجی بگذار…": { en: "What's up? Talk anime, add a poll…", tr: "Ne haber? Animeden bahset, anket ekle…" },
    "افزودن نظرسنجی": { en: "Add a poll", tr: "Anket ekle" },
    "انتشار پست": { en: "Publish post", tr: "Gönderiyi yayınla" },
    "گزینه ۱": { en: "Option 1", tr: "Seçenek 1" },
    "گزینه ۲": { en: "Option 2", tr: "Seçenek 2" },
    "گزینه ۳ (اختیاری)": { en: "Option 3 (optional)", tr: "Seçenek 3 (isteğe bağlı)" },
    "برای تو": { en: "For you", tr: "Sana özel" },
    "داغ": { en: "Trending", tr: "Trend" },
    "دنبال‌شده‌ها": { en: "Following", tr: "Takip Edilenler" },
    "پست‌های من": { en: "My posts", tr: "Gönderilerim" },

    /* فروشگاه / تبلیغات */
    "نام محصول": { en: "Product name", tr: "Ürün adı" },
    "قیمت": { en: "Price", tr: "Fiyat" },
    "دسته": { en: "Category", tr: "Kategori" },
    "توضیح": { en: "Description", tr: "Açıklama" },
    "ارسال آگهی": { en: "Submit listing", tr: "İlan gönder" },
    "ثبت آگهی جدید": { en: "New listing", tr: "Yeni ilan" },
    "آگهی‌های من": { en: "My listings", tr: "İlanlarım" },
    "خرید": { en: "Buy", tr: "Satın al" },
    "درخواست": { en: "Request", tr: "Talep" },
    "ارسال درخواست": { en: "Send request", tr: "Talep gönder" },

    /* پرمیوم */
    "مشاهده پرمیوم": { en: "View Premium", tr: "Premium'u gör" },
    "درخواست پرمیوم": { en: "Request Premium", tr: "Premium talep et" },
    "رنگ کاراکتر": { en: "Companion color", tr: "Yardımcı rengi" },
    "رنگ کاراکتر راهنما": { en: "Companion color", tr: "Yardımcı rengi" },
    "قاب پروفایل": { en: "Profile frame", tr: "Profil çerçevesi" },
    "نشان Elite": { en: "Elite badge", tr: "Elite rozeti" },

    /* پنل مالک */
    "کاربران": { en: "Users", tr: "Kullanıcılar" },
    "تایید محتوا": { en: "Content approval", tr: "İçerik onayı" },
    "آگهی‌ها": { en: "Listings", tr: "İlanlar" },
    "سفارش‌ها": { en: "Orders", tr: "Siparişler" },
    "گزارش‌ها": { en: "Reports", tr: "Şikayetler" },
    "نمای کلی": { en: "Overview", tr: "Genel bakış" },
    "پست‌ها": { en: "Posts", tr: "Gönderiler" },

    /* تنظیمات و فوتر */
    "حساب من": { en: "My Account", tr: "Hesabım" },
    "خروج از حساب": { en: "Log out", tr: "Hesaptan çık" },
    "موسیقی محیطی انیمه": { en: "Anime ambient music", tr: "Anime ortam müziği" },
    "تنظیمات اعلان‌ها": { en: "Notification settings", tr: "Bildirim ayarları" },
    "درباره ما": { en: "About us", tr: "Hakkımızda" },
    "قوانین انجمن": { en: "Community rules", tr: "Topluluk kuralları" },
    "حریم خصوصی": { en: "Privacy", tr: "Gizlilik" },
    "شرایط استفاده": { en: "Terms of use", tr: "Kullanım Şartları" },
    "پرسش‌های پرتکرار": { en: "FAQ", tr: "SSS" },
    "تماس با ما": { en: "Contact us", tr: "Bize ulaşın" },
    "ارسال پیام": { en: "Send message", tr: "Mesaj gönder" }
  };

  /* ── محتوای کاربر این‌ها هرگز ترجمه نمی‌شوند ───────────── */
  var SKIP = ["#feedBox", "#chatBox", "#teamBox", "#dmBox", "#notifBox",
    "#ownerBody", "#myAds", "#shopWall", "#animeWall", "#newsWall", "#evWall",
    "#discBox", "#rankBox", "#profBox", "#bulWrap", "#groupsBox", "#infoBody",
    "#suggBox"];

  var LANG = "fa", ORIG = new WeakMap(), MISSING = {}, coll = false, busy = false;

  function el(i) { return document.getElementById(i); }
  function isDigit(c) { return (c >= 0x06F0 && c <= 0x06F9) || (c >= 0x0660 && c <= 0x0669); }
  function isLetter(c) {
    if (isDigit(c)) return false;
    if (c >= 0x0600 && c <= 0x06FF) return true;
    if (c >= 0x0041 && c <= 0x005A) return true;
    if (c >= 0x0061 && c <= 0x007A) return true;
    return false;
  }
  function firstLetterIdx(s) {
    for (var i = 0; i < s.length; i++) if (isLetter(s.charCodeAt(i))) return i;
    return -1;
  }
  function lookup(core) { return D[core] ? (D[core][LANG] || null) : null; }
  function collect(core) {
    if (!coll || LANG === "fa" || firstLetterIdx(core) < 0) return;
    MISSING[core] = 1;
  }
  function isSkipped(n) {
    var e = n;
    while (e && e.nodeType) {
      if (e.nodeType === 1) {
        if (e.hasAttribute && e.hasAttribute("data-noi18n")) return true;
        var t = e.tagName;
        if (t === "SCRIPT" || t === "STYLE" || t === "TEXTAREA" || t === "CODE" || t === "PRE" || t === "NOSCRIPT") return true;
        if (e.isContentEditable) return true;
      }
      e = e.parentNode;
    }
    return false;
  }

  /* ── ترجمه‌ی متن و صفت‌ها ─────────────────────────────── */
  function applyText(t) {
    if (!t || !t.nodeValue || isSkipped(t)) return;
    var cur = t.nodeValue, core0 = cur.trim();
    if (!core0 || firstLetterIdx(core0) < 0) return;

    if (LANG === "fa") {
      if (ORIG.has(t)) { var o = ORIG.get(t); if (o !== cur) t.nodeValue = o; }
      return;
    }
    var src = ORIG.has(t) ? ORIG.get(t) : core0;
    var i = firstLetterIdx(src); if (i < 0) return;
    var lead = src.slice(0, i), core = src.slice(i).trim();
    var tr = lookup(core);
    if (!tr) { collect(core); return; }
    var out = lead + tr;
    var wsl = cur.match(/^\s*/)[0], wsr = cur.match(/\s*$/)[0];
    var next = wsl + out + wsr;
    if (cur !== next) { ORIG.set(t, src); t.nodeValue = next; }
  }

  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  function applyAttrs(e) {
    if (!e || e.nodeType !== 1 || isSkipped(e)) return;
    var st = e.__rnI || (e.__rnI = {});
    for (var a = 0; a < ATTRS.length; a++) {
      var at = ATTRS[a], v = e.getAttribute(at);
      if (v == null || !v.trim()) continue;
      var src = st[at] != null ? st[at] : v.trim();
      if (LANG === "fa") { if (st[at] != null && v !== st[at]) e.setAttribute(at, st[at]); continue; }
      var i = firstLetterIdx(src); if (i < 0) continue;
      var core = src.slice(i).trim(), tr = lookup(core);
      if (!tr) { collect(core); continue; }
      if (v !== tr) { st[at] = src; e.setAttribute(at, tr); }
    }
    if (e.tagName === "INPUT" && /^(button|submit|reset)$/i.test(e.type || "") && e.value) {
      var vs = st.value != null ? st.value : e.value.trim();
      if (LANG === "fa") { if (st.value != null && e.value !== st.value) e.value = st.value; }
      else { var k = firstLetterIdx(vs); if (k >= 0) { var cv = vs.slice(k).trim(), tv = lookup(cv); if (tv && e.value !== tv) { st.value = vs; e.value = tv; } } }
    }
  }

  function textsIn(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, 4, null);
    var n; while ((n = w.nextNode())) applyText(n);
  }
  function attrsIn(root) {
    if (!root || root.nodeType !== 1) return;
    var ls = root.querySelectorAll("[placeholder],[title],[aria-label],[alt]");
    for (var i = 0; i < ls.length; i++) applyAttrs(ls[i]);
    applyAttrs(root);
  }
  function markSkip() {
    for (var i = 0; i < SKIP.length; i++) { var e = document.querySelector(SKIP[i]); if (e) e.setAttribute("data-noi18n", ""); }
  }
  function pass(root) {
    if (!document.body) return;
    markSkip();
    textsIn(root || document.body);
    attrsIn(root || document.body);
  }

  /* ── تماشای تغییرات (برای محتوای داینامیک و منو) ───────── */
  function observe() {
    if (!("MutationObserver" in window)) return;
    new MutationObserver(function (ms) {
      if (LANG === "fa" || busy) return;
      busy = true;
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === "childList") {
          for (var k = 0; k < m.addedNodes.length; k++) {
            var nd = m.addedNodes[k];
            if (nd.nodeType === 3) applyText(nd);
            else if (nd.nodeType === 1) { markSkip(); textsIn(nd); attrsIn(nd); }
          }
        } else if (m.type === "characterData" && m.target.nodeType === 3) {
          applyText(m.target);
        }
      }
      busy = false;
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  /* ── سوییچ زبان + دکمه ────────────────────────────────── */
  function set(lang) {
    LANG = LANGS.indexOf(lang) >= 0 ? lang : "fa";
    try { localStorage.setItem(LS, LANG); } catch (e) {}
    var d = document.documentElement;
    d.setAttribute("lang", LANG);
    d.setAttribute("dir", DIR[LANG]);
    d.className = d.className.replace(/\brn-lang-\w+/g, "").trim();
    d.classList.add("rn-lang-" + LANG);
    var c = el("rnLangCur"); if (c) c.textContent = LANG.toUpperCase();
    var pop = el("rnLangPop"); if (pop) pop.classList.remove("on");
    pass();
  }

  function ui() {
    if (el("rnLang")) return;
    var css = document.createElement("style");
    css.textContent =
      "#rnLang{position:relative}#rnLangCur{font-size:9px;opacity:.75;margin-inline-start:2px}" +
      "#rnLangPop{position:fixed;z-index:9998;display:none;flex-direction:column;gap:2px;padding:6px;" +
      "border-radius:12px;background:#0b1130;border:1px solid rgba(140,160,255,.25);" +
      "box-shadow:0 18px 40px rgba(0,0,0,.55);min-width:130px}" +
      "#rnLangPop.on{display:flex}" +
      "#rnLangPop button{border:0;background:transparent;color:#eef1ff;font:inherit;font-size:13px;" +
      "text-align:start;padding:8px 10px;border-radius:8px;cursor:pointer;font-family:inherit}" +
      "#rnLangPop button:hover{background:rgba(124,92,255,.22)}" +
      "#rnLangPop button.on{background:linear-gradient(135deg,#7c5cff,#22d3ee);color:#fff}";
    document.head.appendChild(css);

    var b = document.createElement("button");
    b.type = "button"; b.id = "rnLang"; b.className = "icobtn";
    b.setAttribute("data-noi18n", "");
    b.title = "Language / زبان / Dil";
    b.innerHTML = "🌐<span id=\"rnLangCur\">" + LANG.toUpperCase() + "</span>";
    var host = document.querySelector("header .tools") || document.querySelector(".tools");
    if (host) host.appendChild(b);
    else { b.style.cssText = "position:fixed;inset-inline-end:14px;bottom:150px;z-index:9998"; document.body.appendChild(b); }

    var pop = document.createElement("div");
    pop.id = "rnLangPop"; pop.setAttribute("data-noi18n", "");
    pop.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-l="' + l + '" class="' + (l === LANG ? "on" : "") + '">' + NAMES[l] + "</button>";
    }).join("");
    document.body.appendChild(pop);

    b.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var on = pop.classList.toggle("on");
      if (on) {
        var r = b.getBoundingClientRect();
        pop.style.top = (r.bottom + 6) + "px";
        pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 150)) + "px";
      }
    });
    pop.addEventListener("click", function (ev) {
      var t = ev.target.closest("button[data-l]"); if (!t) return;
      set(t.getAttribute("data-l"));
      Array.prototype.forEach.call(pop.children, function (c) { c.classList.toggle("on", c === t); });
    });
    document.addEventListener("click", function () { pop.classList.remove("on"); });
  }

  /* ── راه‌اندازی ───────────────────────────────────────── */
  function init() {
    try { LANG = localStorage.getItem(LS) || "fa"; } catch (e) {}
    try { coll = localStorage.getItem("ronin_i18n_collect") === "1"; } catch (e) {}
    if (LANGS.indexOf(LANG) < 0) LANG = "fa";
    ui();
    set(LANG);
    observe();
    [500, 1500, 3000, 5000].forEach(function (ms) { setTimeout(function () { if (LANG !== "fa") pass(); }, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* API */
  window.RoninI18n = {
    set: set, get: function () { return LANG; }, langs: LANGS,
    t: function (fa) { return lookup(String(fa).trim()) || fa; },
    missing: function () { return Object.keys(MISSING); }
  };
  if (window.R) R.i18n = window.RoninI18n;
})();
