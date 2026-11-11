/* ═══════════════════════════════════════════════════════════════
   RONIN STORE — LANG & MONEY  ·  ronin-lang-money.js
   • تغییر کامل زبان سایت به انگلیسی (دیکشنری + حالت پایدار)
   • تغییر واحد پول: تومان / افغانی / دلار / یورو
   همهٔ تغییرات در مرورگر کاربر انجام می‌شود و به دیتابیس دست نمی‌زند.
   ═══════════════════════════════════════════════════════════════ */
"use strict";
(function () {
  if (!window.R) return;
  var R = window.R;
  if (R.__rlm) return;
  R.__rlm = true;

  var LK = "ronin:lang", CK = "ronin:cur";

  /* نرخ‌های تقریبی: ۱ دلار / ۱ افغانی / ۱ یورو چند تومان است */
  var RATES = {
    USD: 120000,
    AFN: 1700,
    EUR: 130000
  };
  var CUR_NAMES = { IRR: "تومان", USD: "دلار", AFN: "افغانی", EUR: "یورو" };
  var SYM = { USD: "$", AFN: "؋", EUR: "€" };

  function fa(n) { return R.fa ? R.fa(n) : String(n); }
  function num(x) {
    var n = Number(String(x == null ? "" : x).replace(/[^\d.]/g, ""));
    return isFinite(n) ? n : 0;
  }
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function set(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }

  var LANG = get(LK, "fa") === "en" ? "en" : "fa";
  var CUR = get(CK, "IRR");
  if (!CUR_NAMES[CUR]) CUR = "IRR";

  /* ── دیکشنری فارسی → انگلیسی ─────────────────────────────── */
  var D = {
    "خانه": "Home", "فروشگاه": "Store", "پروفایل": "Profile", "سبد خرید": "Cart",
    "چت عمومی": "Public chat", "کاوش": "Explore", "انجمن": "Community", "پرمیوم": "Premium",
    "دنیای انیمه": "Anime world", "انیمه": "Anime", "تنظیمات": "Settings", "ورود": "Sign in",
    "خروج": "Sign out", "ثبت نام": "Sign up", "ثبت‌نام": "Sign up", "نام": "Name",
    "نام کاربری": "Username", "رمز عبور": "Password", "ایمیل": "Email", "ذخیره": "Save",
    "ذخیره تغییرات": "Save changes", "حذف": "Delete", "ویرایش": "Edit", "ارسال": "Send",
    "جستجو": "Search", "جست‌وجو": "Search", "دنبال کردن": "Follow", "لایک": "Like",
    "نظر": "Comment", "نظرات": "Comments", "قیمت": "Price", "تومان": "Toman",
    "افزودن به سبد": "Add to cart", "خرید": "Buy", "پرداخت": "Pay", "سفارش": "Order",
    "سفارش‌ها": "Orders", "موجودی": "Stock", "دسته‌بندی": "Category", "همه": "All",
    "جدید": "New", "محبوب": "Popular", "بیشتر": "More", "کمتر": "Less", "بستن": "Close",
    "باز کردن": "Open", "روز": "Day", "ساعت": "Hour", "دقیقه": "Min", "ثانیه": "Sec",
    "روزه": "days", "فعال": "Active", "دائمی": "Lifetime", "رایگان": "Free",
    "پیام": "Message", "پیام‌ها": "Messages", "اعلان": "Alert", "اعلان‌ها": "Alerts",
    "دوستان": "Friends", "امتیاز": "Rating", "بازدید": "Views", "فصل": "Season",
    "قسمت": "Episode", "زیرنویس": "Subtitled", "دوبله": "Dubbed",
    "در حال پخش": "Airing", "اتمام پخش": "Finished", "تماشا": "Watch", "جزئیات": "Details",
    "افزودن": "Add", "لیست": "List", "ادامه": "Continue", "پخش": "Play", "صدا": "Volume",
    "سرعت": "Speed", "کیفیت": "Quality", "تمام‌صفحه": "Fullscreen", "دانلود": "Download",
    "اشتراک": "Share", "لیست تماشا": "Watchlist", "صفحه اصلی": "Home page",
    "پیشنهاد ویژه": "Special offer", "خرید اشتراک": "Buy subscription", "پلن": "Plan",
    "مانده": "left", "تایید": "Confirm", "انصراف": "Cancel", "برگشت": "Back",
    "بعدی": "Next", "قبلی": "Prev", "بارگذاری": "Loading", "خطا": "Error",
    "موفق": "Success", "ناموفق": "Failed", "پروفایل من": "My profile", "پست": "Post",
    "تصویر": "Image", "ویدیو": "Video", "لینک": "Link", "کپی": "Copy",
    "کپی شد": "Copied", "ذخیره شد": "Saved", "ارسال شد": "Sent", "ثبت شد": "Submitted",
    "در انتظار": "Pending", "تایید شده": "Approved", "مدیر": "Admin", "مالک": "Owner",
    "کاربر": "User", "مهمان": "Guest", "آنلاین": "Online", "آفلاین": "Offline",
    "عضویت": "Join", "تاریخ": "Date", "زمان": "Time", "امروز": "Today",
    "دیروز": "Yesterday", "هفته": "Week", "ماه": "Month", "سال": "Year",
    "همهٔ انیمه‌ها": "All anime", "محبوب‌ترین‌ها": "Most popular",
    "تازه‌ترین‌ها": "Newest", "سینمایی‌ها": "Movies", "ژانر": "Genre",
    "وضعیت": "Status", "مرتب‌سازی": "Sort", "افزودن انیمه": "Add anime",
    "جستجوی انیمه": "Search anime", "عنوان": "Title", "توضیح": "Description"
  };

  /* ── کمکی‌ها ─────────────────────────────────────────────── */
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, OPTION: 0 };
  var busy = false;

  function convertible(t) { return /[\u06F0-\u06F9\d]/.test(t) && /(تومان|تومن)/.test(t); }

  function moneyOut(base) {
    if (CUR === "IRR") return base.replace(/تومن/g, "تومان");
    var rate = RATES[CUR] || 1;
    return base.replace(/([\u06F0-\u06F9\d][\u06F0-\u06F9\d,٬.\s]*)\s*(?:تومان|تومن)/g, function (m, raw) {
      var n = num(String(raw).replace(/[\u06F0-\u06F9]/g, function (c) {
        return String(c.charCodeAt(0) - 0x06F0);
      }));
      var v = n / rate;
      var out = (v >= 100 ? Math.round(v) : Math.round(v * 100) / 100);
      var s = CUR === "AFN" ? fa(String(out)) : fa(out.toFixed(v >= 100 ? 0 : 2));
      return s + " " + CUR_NAMES[CUR] + " (" + (SYM[CUR] || "") + ")";
    });
  }

  function translate(base) {
    if (LANG !== "en") return base;
    var t = base.trim();
    if (!t) return base;
    if (D[t]) return base.replace(t, D[t]);
    var out = base;
    Object.keys(D).forEach(function (k) {
      if (k.length < 4 || out.indexOf(k) === -1) return;
      out = out.split(k).join(D[k]);
    });
    return out;
  }

  function eachText(root, fn) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(fn);
  }

  /* ── اعمال ─────────────────────────────────────────────────── */
  function apply() {
    if (busy) return;
    busy = true;
    try {
      eachText(document.body, function (node) {
        var p = node.parentNode;
        if (!p || SKIP[p.nodeName]) return;
        if (p.closest && p.closest("#rlmBar,#rpModal,video,audio")) return;
        if (node.__base === undefined) node.__base = node.nodeValue;
        var base = node.__base;
        if (!base || !base.trim()) return;
        var out = base;
        if (convertible(out)) out = moneyOut(out);
        out = translate(out);
        if (node.nodeValue !== out) node.nodeValue = out;
      });
      ["placeholder", "title", "aria-label"].forEach(function (a) {
        document.querySelectorAll("[" + a + "]").forEach(function (el) {
          if (el.closest && el.closest("#rlmBar")) return;
          el.__fa = el.__fa || {};
          if (el.__fa[a] === undefined) el.__fa[a] = el.getAttribute(a);
          var base = el.__fa[a] || "";
          var out = translate(base);
          if (out !== el.getAttribute(a)) el.setAttribute(a, out);
        });
      });
      document.documentElement.setAttribute("lang", LANG === "en" ? "en" : "fa");
    } catch (e) {}
    setTimeout(function () { busy = false; }, 60);
  }

  /* ── بار کنترل ─────────────────────────────────────────────── */
  function bar() {
    if (document.getElementById("rlmBar")) return;
    var b = document.createElement("div");
    b.id = "rlmBar";
    b.innerHTML =
      '<span class="rlmDot"></span>' +
      '<select id="rlmCur" aria-label="واحد پول">' +
      '<option value="IRR">تومان</option><option value="AFN">افغانی</option>' +
      '<option value="USD">دلار</option><option value="EUR">یورو</option></select>' +
      '<button type="button" id="rlmLang">EN</button>';
    document.body.appendChild(b);
    var cur = document.getElementById("rlmCur");
    cur.value = CUR;
    cur.addEventListener("change", function () {
      CUR = cur.value;
      set(CK, CUR === "IRR" ? "" : CUR);
      apply();
      if (R.toast) R.toast("واحد پول: " + CUR_NAMES[CUR], "ok");
    });
    var lg = document.getElementById("rlmLang");
    lg.classList.toggle("on", LANG === "en");
    lg.addEventListener("click", function () {
      LANG = LANG === "en" ? "fa" : "en";
      set(LK, LANG === "en" ? "en" : "");
      lg.classList.toggle("on", LANG === "en");
      lg.textContent = LANG === "en" ? "FA" : "EN";
      apply();
      if (R.toast) R.toast(LANG === "en" ? "Language: English" : "زبان: فارسی", "ok");
    });
    lg.textContent = LANG === "en" ? "FA" : "EN";
  }

  /* ── رصد تغییرات صفحه ──────────────────────────────────────── */
  var t = null;
  function watch() {
    var obs = new MutationObserver(function (m) {
      for (var i = 0; i < m.length; i++) {
        if (m[i].target && m[i].target.id === "rlmBar") return;
      }
      if (t) clearTimeout(t);
      t = setTimeout(apply, 260);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function css() {
    if (document.getElementById("rlmCSS")) return;
    var l = document.createElement("link");
    l.id = "rlmCSS";
    l.rel = "stylesheet";
    l.href = "ronin-lang-money.css?v=1";
    (document.head || document.documentElement).appendChild(l);
  }

  function start() {
    css();
    bar();
    apply();
    watch();
    setTimeout(apply, 900);
    setTimeout(apply, 2500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
